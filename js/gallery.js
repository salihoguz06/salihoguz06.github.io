// Galeri: albümleri ve fotoğrafları Supabase'den çeker, kartları oluşturur,
// lightbox'ı yönetir. Fotoğraflar private bucket'ta olduğu için kısa ömürlü
// imzalı URL'lerle (signed URL) gösterilir.
//
// Düzenleme modu (Edit): açıkken albüm/fotoğraf düzenleme araçları ve
// not yazma kutusu görünür. Kapalıyken site tamamen "izleme" modundadır.

(function () {
    const grid = document.getElementById("foldersGrid");
    const futureGrid = document.getElementById("futureGrid");
    const editToggle = document.getElementById("editToggle");
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImg");
    const modalText = document.getElementById("modalText");
    const notesList = document.getElementById("notesList");
    const noteInput = document.getElementById("noteInput");
    const noteSendBtn = document.getElementById("noteSendBtn");
    const noteHeartBtn = document.getElementById("noteHeartBtn");
    const photoTools = document.getElementById("photoTools");
    const captionInput = document.getElementById("captionInput");
    const captionSaveBtn = document.getElementById("captionSaveBtn");
    const setCoverBtn = document.getElementById("setCoverBtn");
    const deletePhotoBtn = document.getElementById("deletePhotoBtn");

    const SIGNED_URL_TTL = 3600;

    let currentPhotos = [];
    let currentIndex = 0;
    let currentAlbum = null;
    let loaded = false;
    let notesAvailable = true;
    let profileNames = {};
    let editMode = false;

    function isLocked(album) {
        return album.unlock_at && new Date(album.unlock_at) > new Date();
    }

    // Date nesnesini <input type="date"> için "YYYY-MM-DD" biçimine çevirir.
    function toDateInputValue(d) {
        const pad = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    async function loadProfiles() {
        const { data } = await sb.from("profiles").select("id, display_name");
        (data || []).forEach(p => { profileNames[p.id] = p.display_name; });
    }

    // --- DÜZENLEME MODU ---
    function setEditMode(on) {
        editMode = on;
        document.body.classList.toggle("edit-mode", on);
        editToggle.innerText = on ? "✓ Done" : "✎ Edit";
        editToggle.classList.toggle("active", on);
        if (modal.classList.contains("open")) refreshPhotoTools();
    }

    editToggle.addEventListener("click", () => setEditMode(!editMode));

    // Yükleme sırasında boş ekran yerine parıldayan iskelet kartlar göster.
    function renderSkeletons(count = 3) {
        grid.innerHTML = "";
        for (let i = 0; i < count; i++) {
            const s = document.createElement("div");
            s.className = "skeleton-card";
            s.setAttribute("aria-hidden", "true");
            grid.appendChild(s);
        }
    }

    // --- ALBÜMLERİ YÜKLE ---
    async function loadAlbums() {
        if (!window.sb) return;
        loaded = true;

        renderSkeletons();
        futureGrid.innerHTML = "";

        const [{ data: albums, error }] = await Promise.all([
            sb.from("albums").select("*").order("sort_order", { ascending: true }),
            loadProfiles()
        ]);

        if (error) {
            console.error("Albüm yükleme hatası:", error);
            grid.innerHTML = '<p class="gallery-status">Memories could not load. Refresh to try again ❤</p>';
            return;
        }

        const open = albums.filter(a => !isLocked(a));
        const locked = albums.filter(isLocked);

        if (!open.length) {
            grid.innerHTML = '<p class="gallery-status">No memories here yet — add our first one below ❤</p>';
        } else {
            const coverPaths = open.filter(a => a.cover_path).map(a => a.cover_path);
            const coverUrls = {};
            if (coverPaths.length) {
                const { data: signed } = await sb.storage
                    .from("photos")
                    .createSignedUrls(coverPaths, SIGNED_URL_TTL);
                (signed || []).forEach(s => {
                    if (s.signedUrl) coverUrls[s.path] = s.signedUrl;
                });
            }

            grid.innerHTML = "";
            open.forEach(album => grid.appendChild(buildCard(album, coverUrls[album.cover_path])));
        }

        locked.forEach(album => futureGrid.appendChild(buildLockedCard(album)));
    }

    function buildCard(album, coverUrl) {
        const card = document.createElement("div");
        card.className = "folder-card";
        card.addEventListener("click", () => openAlbum(album));

        const img = document.createElement("div");
        img.className = "folder-img";
        if (coverUrl) img.style.backgroundImage = `url("${coverUrl}")`;

        const overlay = document.createElement("div");
        overlay.className = "folder-overlay";
        const h3 = document.createElement("h3");
        h3.innerText = album.title;
        const p = document.createElement("p");
        p.innerText = album.description || "";
        overlay.append(h3, p);

        card.append(img, overlay, buildEditBadge(album));
        return card;
    }

    function buildLockedCard(album) {
        const card = document.createElement("div");
        card.className = "folder-card future-card";

        const unlockDate = new Date(album.unlock_at);
        const dateText = unlockDate
            .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            .toUpperCase();

        const lockOverlay = document.createElement("div");
        lockOverlay.className = "lock-overlay";
        const lockIcon = document.createElement("div");
        lockIcon.className = "lock-icon";
        lockIcon.innerText = "🔒";
        const dateEl = document.createElement("div");
        dateEl.className = "unlock-date";
        dateEl.innerText = dateText;
        lockOverlay.append(lockIcon, dateEl);

        const overlay = document.createElement("div");
        overlay.className = "folder-overlay";
        const h4 = document.createElement("h4");
        h4.innerText = album.title;
        overlay.appendChild(h4);

        card.append(lockOverlay, overlay, buildEditBadge(album));
        card.addEventListener("click", () => {
            const days = Math.ceil((unlockDate - new Date()) / 86400000);
            showLoveDialog(
                "Be patient, my love...",
                `“${album.title}” will unlock in ${days} day${days === 1 ? "" : "s"}. ❤`
            );
        });
        return card;
    }

    function buildEditBadge(album) {
        const badge = document.createElement("button");
        badge.className = "card-edit-badge";
        badge.type = "button";
        badge.title = "Edit this album";
        badge.innerText = "✎";
        badge.addEventListener("click", (e) => {
            e.stopPropagation();
            openAlbumEditor(album);
        });
        return badge;
    }

    // --- ALBÜM AÇ ---
    async function openAlbum(album) {
        const { data: photos, error } = await sb
            .from("photos")
            .select("*")
            .eq("album_id", album.id)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Fotoğraf yükleme hatası:", error);
            return;
        }
        if (!photos.length) {
            showLoveDialog(album.title, "This album is waiting for its first memory... 🕊️");
            return;
        }

        const { data: signed } = await sb.storage
            .from("photos")
            .createSignedUrls(photos.map(p => p.storage_path), SIGNED_URL_TTL);

        const urlByPath = {};
        (signed || []).forEach(s => {
            if (s.signedUrl) urlByPath[s.path] = s.signedUrl;
        });

        currentPhotos = photos
            .filter(p => urlByPath[p.storage_path])
            .map(p => ({
                id: p.id,
                url: urlByPath[p.storage_path],
                caption: p.caption || "",
                storagePath: p.storage_path
            }));

        if (!currentPhotos.length) return;

        currentAlbum = album;
        currentIndex = 0;
        updateModal();
        modal.classList.add("open");
    }

    function updateModal() {
        const photo = currentPhotos[currentIndex];

        modalImg.style.opacity = "0";
        modalText.style.opacity = "0";

        setTimeout(() => {
            modalImg.src = photo.url;
            modalImg.alt = photo.caption || "Memory photo";
            modalText.innerText = photo.caption;
            modalImg.style.opacity = "1";
            modalText.style.opacity = "1";
        }, 300);

        refreshPhotoTools();
        loadNotes(photo.id);
        // Tepkiler modülüne "şu fotoğraf açıldı" sinyalini yolla (reactions.js dinler).
        document.dispatchEvent(new CustomEvent("sa:photo", { detail: { photoId: photo.id } }));
    }

    function refreshPhotoTools() {
        const photo = currentPhotos[currentIndex];
        if (!photo) return;
        captionInput.value = photo.caption;
        photoTools.hidden = !editMode;
    }

    // --- AŞK NOTLARI ---
    // Var olan notlar her zaman görünür (güzel oldukları için);
    // yazma kutusu yalnızca düzenleme modunda çıkar.
    async function loadNotes(photoId) {
        notesList.innerHTML = "";
        notesList.hidden = true;

        if (!notesAvailable) return;

        const { data: notes, error } = await sb
            .from("photo_notes")
            .select("*")
            .eq("photo_id", photoId)
            .order("created_at", { ascending: true });

        if (error) {
            // photo_notes tablosu henüz kurulmadıysa özelliği sessizce kapat
            notesAvailable = false;
            updateNoteInputVisibility();
            return;
        }

        const current = currentPhotos[currentIndex];
        if (!current || current.id !== photoId) return;

        notes.forEach(n => {
            const item = document.createElement("div");
            item.className = "note-item";
            const body = document.createElement("span");
            body.innerText = n.body;
            const author = document.createElement("small");
            author.innerText = " — " + (profileNames[n.author] || "❤");
            item.append(body, author);
            notesList.appendChild(item);
        });

        notesList.hidden = notes.length === 0;
        notesList.scrollTop = notesList.scrollHeight;
        updateNoteInputVisibility();
    }

    function updateNoteInputVisibility() {
        document.getElementById("notesInputRow").hidden = !notesAvailable;
    }

    async function sendNote(body) {
        if (!body.trim() || !notesAvailable) return;
        const photo = currentPhotos[currentIndex];

        const { data: sessionData } = await sb.auth.getSession();
        if (!sessionData.session) return;

        const { error } = await sb.from("photo_notes").insert({
            photo_id: photo.id,
            author: sessionData.session.user.id,
            body: body.trim()
        });

        if (error) {
            console.error("Not gönderme hatası:", error);
            return;
        }
        noteInput.value = "";
        loadNotes(photo.id);
    }

    noteSendBtn.addEventListener("click", () => sendNote(noteInput.value));
    noteHeartBtn.addEventListener("click", () => sendNote("❤"));
    noteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendNote(noteInput.value);
    });

    // --- FOTOĞRAF DÜZENLEME ---
    captionSaveBtn.addEventListener("click", async () => {
        const photo = currentPhotos[currentIndex];
        const value = captionInput.value.trim();
        captionSaveBtn.disabled = true;

        const { error } = await sb
            .from("photos")
            .update({ caption: value || null })
            .eq("id", photo.id);

        captionSaveBtn.disabled = false;
        if (error) {
            showLoveDialog("Couldn't save", error.message);
            return;
        }
        photo.caption = value;
        modalText.innerText = value;
        modalImg.alt = value || "Memory photo";
    });

    setCoverBtn.addEventListener("click", async () => {
        const photo = currentPhotos[currentIndex];
        const { error } = await sb
            .from("albums")
            .update({ cover_path: photo.storagePath })
            .eq("id", currentAlbum.id);

        if (error) {
            showLoveDialog("Couldn't save", error.message);
            return;
        }
        showLoveDialog("Cover updated ❤", "This photo is now the face of “" + currentAlbum.title + "”.");
        loadAlbums();
    });

    deletePhotoBtn.addEventListener("click", () => {
        const photo = currentPhotos[currentIndex];
        showLoveConfirm(
            "Delete this photo?",
            "It will be removed from this album for good. This cannot be undone.",
            async () => {
                await sb.from("photos").delete().eq("id", photo.id);
                await sb.storage.from("photos").remove([photo.storagePath]);

                currentPhotos.splice(currentIndex, 1);
                if (!currentPhotos.length) {
                    closeGallery();
                } else {
                    currentIndex = currentIndex % currentPhotos.length;
                    updateModal();
                }
                loadAlbums();
            }
        );
    });

    // --- ALBÜM DÜZENLEME ---
    function openAlbumEditor(album) {
        const editModal = document.getElementById("albumEditModal");
        const titleInput = document.getElementById("albumEditTitle");
        const descInput = document.getElementById("albumEditDesc");
        const unlockInput = document.getElementById("albumEditUnlock");
        const saveBtn = document.getElementById("albumEditSave");
        const deleteBtn = document.getElementById("albumEditDelete");
        const statusEl = document.getElementById("albumEditStatus");

        titleInput.value = album.title;
        descInput.value = album.description || "";
        // toISOString() UTC'ye çevirir ve tarihi bir gün kaydırabilir;
        // bu yüzden yerel gün/ay/yıl bileşenlerini kullanıyoruz.
        unlockInput.value = album.unlock_at ? toDateInputValue(new Date(album.unlock_at)) : "";
        statusEl.innerText = "";
        editModal.classList.add("open");

        saveBtn.onclick = async () => {
            const title = titleInput.value.trim();
            if (!title) {
                statusEl.innerText = "An album needs a name.";
                return;
            }
            saveBtn.disabled = true;
            statusEl.innerText = "Saving...";

            const { error } = await sb.from("albums").update({
                title,
                description: descInput.value.trim() || null,
                unlock_at: unlockInput.value
                    ? new Date(unlockInput.value + "T00:00:00").toISOString()
                    : null
            }).eq("id", album.id);

            saveBtn.disabled = false;
            if (error) {
                statusEl.innerText = "Couldn't save: " + error.message;
                return;
            }
            editModal.classList.remove("open");
            loadAlbums();
        };

        deleteBtn.onclick = () => {
            editModal.classList.remove("open");
            showLoveConfirm(
                "Delete “" + album.title + "”?",
                "Every photo inside it will be deleted too. This cannot be undone.",
                async () => {
                    const { data: photos } = await sb
                        .from("photos")
                        .select("storage_path")
                        .eq("album_id", album.id);

                    if (photos && photos.length) {
                        await sb.storage.from("photos").remove(photos.map(p => p.storage_path));
                    }
                    await sb.from("albums").delete().eq("id", album.id);
                    loadAlbums();
                }
            );
        };
    }

    window.closeAlbumEdit = function () {
        document.getElementById("albumEditModal").classList.remove("open");
    };

    // --- NAVİGASYON ---
    window.closeGallery = function () {
        modal.classList.remove("open");
    };

    window.nextSlide = function () {
        currentIndex = (currentIndex + 1) % currentPhotos.length;
        updateModal();
    };

    window.prevSlide = function () {
        currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
        updateModal();
    };

    document.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("open")) return;
        if (e.key === "Escape") {
            closeGallery();
            return;
        }
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
    });

    let touchX = null;
    modal.addEventListener("touchstart", (e) => {
        touchX = e.touches[0].clientX;
    }, { passive: true });
    modal.addEventListener("touchend", (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
        if (Math.abs(dx) > 50) (dx < 0 ? nextSlide() : prevSlide());
    }, { passive: true });

    // Yeni fotoğraf yüklendikten sonra upload.js bunu çağırıp galeriyi tazeler
    window.refreshGallery = loadAlbums;

    // --- BAŞLATMA ---
    // Giriş olayını dinle, AMA olay biz dinlemeye başlamadan da tetiklenmiş
    // olabilir (auth.js oturumu localStorage'dan anında bulabiliyor).
    // Bu yüzden bayrağa da bakıyoruz — ikisi birden çalışsa bile
    // `loaded` bayrağı iki kez yüklemeyi engeller.
    document.addEventListener("sa:unlocked", () => {
        if (!loaded) loadAlbums();
    });
    if (window.saUnlocked && !loaded) loadAlbums();
})();
