// Fotoğraf yükleme: albüm seç (veya yeni albüm aç), fotoğrafları seç,
// her birine istersen başlık yaz, ilerleme çubuğuyla yükle.
// Dosyalar Storage'a, bilgileri (başlık, kim yükledi) photos tablosuna gider.

(function () {
    const modal = document.getElementById("uploadModal");
    const albumSelect = document.getElementById("uploadAlbum");
    const newAlbumInput = document.getElementById("newAlbumTitle");
    const fileInput = document.getElementById("uploadFiles");
    const chooseBtn = document.getElementById("chooseFilesBtn");
    const listEl = document.getElementById("uploadList");
    const startBtn = document.getElementById("startUploadBtn");
    const statusEl = document.getElementById("uploadStatus");

    const MAX_SIZE_MB = 15;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    let rows = [];
    let uploading = false;

    window.openUpload = async function () {
        if (!window.sb) return;
        resetModal();
        modal.classList.add("open");

        const { data: albums, error } = await sb
            .from("albums")
            .select("id, title")
            .order("sort_order", { ascending: true });

        albumSelect.innerHTML = "";
        albumSelect.append(new Option("Choose an album...", "", true, true));
        albumSelect.options[0].disabled = true;
        (error ? [] : albums).forEach(a => albumSelect.append(new Option(a.title, a.id)));
        albumSelect.append(new Option("➕ New album...", "__new__"));
    };

    window.closeUpload = function () {
        if (uploading) return;
        modal.classList.remove("open");
    };

    function resetModal() {
        rows = [];
        uploading = false;
        listEl.innerHTML = "";
        statusEl.innerText = "";
        newAlbumInput.hidden = true;
        newAlbumInput.value = "";
        fileInput.value = "";
        updateStartBtn();
    }

    function updateStartBtn() {
        const albumOk = albumSelect.value === "__new__"
            ? newAlbumInput.value.trim() !== ""
            : albumSelect.value !== "";
        startBtn.disabled = uploading || !albumOk || rows.length === 0;
    }

    albumSelect.addEventListener("change", () => {
        newAlbumInput.hidden = albumSelect.value !== "__new__";
        updateStartBtn();
    });
    newAlbumInput.addEventListener("input", updateStartBtn);
    chooseBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        for (const file of fileInput.files) {
            const tooBig = file.size > MAX_SIZE_MB * 1024 * 1024;
            const badType = !ALLOWED_TYPES.includes(file.type);

            const row = document.createElement("div");
            row.className = "upload-row";

            const thumb = document.createElement("img");
            thumb.className = "upload-thumb";
            thumb.alt = "";
            thumb.src = URL.createObjectURL(file);

            const middle = document.createElement("div");
            middle.className = "upload-row-main";

            if (tooBig || badType) {
                const note = document.createElement("p");
                note.className = "upload-error";
                note.innerText = tooBig
                    ? `${file.name} — too big (max ${MAX_SIZE_MB}MB), skipped`
                    : `${file.name} — not a supported image, skipped`;
                middle.appendChild(note);
                row.append(thumb, middle);
                listEl.appendChild(row);
                continue;
            }

            const caption = document.createElement("input");
            caption.type = "text";
            caption.placeholder = "Caption (optional)...";
            caption.maxLength = 300;

            const track = document.createElement("div");
            track.className = "progress-track";
            const fill = document.createElement("div");
            fill.className = "progress-fill";
            track.appendChild(fill);

            middle.append(caption, track);
            row.append(thumb, middle);
            listEl.appendChild(row);

            rows.push({ file, captionInput: caption, fill, row });
        }
        fileInput.value = "";
        updateStartBtn();
    });

    function uploadWithProgress(path, file, token, onProgress) {
        const cfg = window.SUPABASE_CONFIG;
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${cfg.url}/storage/v1/object/photos/${path}`);
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.setRequestHeader("apikey", cfg.anonKey);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) onProgress(e.loaded / e.total);
            };
            xhr.onload = () =>
                xhr.status >= 200 && xhr.status < 300
                    ? resolve()
                    : reject(new Error(`Yükleme hatası ${xhr.status}: ${xhr.responseText}`));
            xhr.onerror = () => reject(new Error("Ağ hatası"));
            xhr.send(file);
        });
    }

    startBtn.addEventListener("click", async () => {
        if (uploading || !rows.length) return;
        uploading = true;
        updateStartBtn();

        try {
            const { data: sessionData } = await sb.auth.getSession();
            const session = sessionData.session;
            if (!session) throw new Error("Oturum bulunamadı — sayfayı yenileyip tekrar giriş yap.");

            let albumId = albumSelect.value;
            let albumIsNew = false;

            if (albumId === "__new__") {
                statusEl.innerText = "Creating album...";
                const { data: created, error } = await sb
                    .from("albums")
                    .insert({ title: newAlbumInput.value.trim() })
                    .select()
                    .single();
                if (error) throw error;
                albumId = created.id;
                albumIsNew = true;
            }

            let done = 0;
            let firstUploadedPath = null;

            for (const r of rows) {
                statusEl.innerText = `Uploading ${done + 1} / ${rows.length}...`;

                const ext = (r.file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
                const path = `${albumId}/${Date.now()}-${done}.${ext}`;

                await uploadWithProgress(path, r.file, session.access_token, (p) => {
                    r.fill.style.width = `${Math.round(p * 100)}%`;
                });

                const { error: insertError } = await sb.from("photos").insert({
                    album_id: albumId,
                    storage_path: path,
                    caption: r.captionInput.value.trim() || null,
                    uploaded_by: session.user.id,
                    sort_order: Date.now() % 2147483647
                });
                if (insertError) throw insertError;

                if (!firstUploadedPath) firstUploadedPath = path;
                r.fill.style.width = "100%";
                r.captionInput.disabled = true;
                done++;
            }

            if (albumIsNew && firstUploadedPath) {
                await sb.from("albums").update({ cover_path: firstUploadedPath }).eq("id", albumId);
            }

            statusEl.innerText = "All our memories are safe now ❤";
            uploading = false;
            if (window.refreshGallery) window.refreshGallery();
            setTimeout(() => {
                modal.classList.remove("open");
            }, 1500);
        } catch (err) {
            console.error("Yükleme hatası:", err);
            statusEl.innerText = "Something went wrong: " + (err.message || err.toString());
            uploading = false;
            updateStartBtn();
        }
    });
})();
