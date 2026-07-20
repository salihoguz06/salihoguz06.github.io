// Galeri: albümleri ve fotoğrafları Supabase'den çeker, kartları oluşturur,
// lightbox'ı yönetir. Fotoğraflar private bucket'ta olduğu için kısa ömürlü
// imzalı URL'lerle (signed URL) gösterilir.
//
// Faz 3 eklentileri: kilitli (unlock_at) albümler, klavye + kaydırma
// navigasyonu, fotoğraflara aşk notları (photo_notes).

(function () {
    const grid = document.getElementById("foldersGrid");
    const futureGrid = document.getElementById("futureGrid");
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImg");
    const modalText = document.getElementById("modalText");
    const notesPanel = document.getElementById("notesPanel");
    const notesList = document.getElementById("notesList");
    const noteInput = document.getElementById("noteInput");
    const noteSendBtn = document.getElementById("noteSendBtn");
    const noteHeartBtn = document.getElementById("noteHeartBtn");

    const SIGNED_URL_TTL = 3600;

    let currentPhotos = [];
    let currentIndex = 0;
    let loaded = false;
    let notesAvailable = true;
    let profileNames = {};

    function isLocked(album) {
        return album.unlock_at && new Date(album.unlock_at) > new Date();
    }

    async function loadProfiles() {
        const { data } = await sb.from("profiles").select("id, display_name");
        (data || []).forEach(p => { profileNames[p.id] = p.display_name; });
    }

    async function loadAlbums() {
        if (!window.sb) return;
        loaded = true;

        grid.innerHTML = '<p class="gallery-status">Loading our memories...</p>';
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
            open.forEach(album => {
                const card = document.createElement("div");
                card.className = "folder-card";
                card.addEventListener("click", () => openAlbum(album));

                const img = document.createElement("div");
                img.className = "folder-img";
                const cover = coverUrls[album.cover_path];
                if (cover) img.style.backgroundImage = `url("${cover}")`;

                const overlay = document.createElement("div");
                overlay.className = "folder-overlay";
                const h3 = document.createElement("h3");
                h3.innerText = album.title;
                const p = document.createElement("p");
                p.innerText = album.description || "";
                overlay.append(h3, p);

                card.append(img, overlay);
                grid.appendChild(card);
            });
        }

        locked.forEach(album => {
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

            card.append(lockOverlay, overlay);
            card.addEventListener("click", () => {
                const days = Math.ceil((unlockDate - new Date()) / 86400000);
                showLoveDialog(
                    "Be patient, my love...",
                    `“${album.title}” will unlock in ${days} day${days === 1 ? "" : "s"}. ❤`
                );
            });
            futureGrid.appendChild(card);
        });
    }

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
            .map(p => ({ id: p.id, url: urlByPath[p.storage_path], caption: p.caption || "" }));

        if (!currentPhotos.length) return;

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

        loadNotes(photo.id);
    }

    // --- AŞK NOTLARI ---
    async function loadNotes(photoId) {
        if (!notesAvailable) return;
        notesList.innerHTML = "";

        const { data: notes, error } = await sb
            .from("photo_notes")
            .select("*")
            .eq("photo_id", photoId)
            .order("created_at", { ascending: true });

        if (error) {
            // Tablo henüz kurulmadıysa (schema2.sql) not özelliğini sessizce gizle
            notesAvailable = false;
            notesPanel.hidden = true;
            return;
        }

        notesPanel.hidden = false;
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
        notesList.scrollTop = notesList.scrollHeight;
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

    // Giriş yapılınca (veya oturum hatırlanınca) galeriyi yükle
    document.addEventListener("sa:unlocked", () => {
        if (!loaded) loadAlbums();
    });
})();
