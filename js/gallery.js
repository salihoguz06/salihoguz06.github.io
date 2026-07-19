// Galeri: albümleri ve fotoğrafları Supabase'den çeker, kartları oluşturur,
// lightbox'ı yönetir. Fotoğraflar private bucket'ta olduğu için kısa ömürlü
// imzalı URL'lerle (signed URL) gösterilir.

(function () {
    const grid = document.getElementById("foldersGrid");
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("modalImg");
    const modalText = document.getElementById("modalText");

    const SIGNED_URL_TTL = 3600;

    let currentPhotos = [];
    let currentIndex = 0;
    let loaded = false;

    async function loadAlbums() {
        if (!window.sb) return;
        loaded = true;

        grid.innerHTML = '<p class="gallery-status">Loading our memories...</p>';

        const { data: albums, error } = await sb
            .from("albums")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Albüm yükleme hatası:", error);
            grid.innerHTML = '<p class="gallery-status">Memories could not load. Refresh to try again ❤</p>';
            return;
        }

        if (!albums.length) {
            grid.innerHTML = '<p class="gallery-status">No memories here yet — add our first one below ❤</p>';
            return;
        }

        const coverPaths = albums.filter(a => a.cover_path).map(a => a.cover_path);
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
        albums.forEach(album => {
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

    async function openAlbum(album) {
        const { data: photos, error } = await sb
            .from("photos")
            .select("*")
            .eq("album_id", album.id)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

        if (error || !photos.length) {
            if (error) console.error("Fotoğraf yükleme hatası:", error);
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
            .map(p => ({ url: urlByPath[p.storage_path], caption: p.caption || "" }));

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
    }

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

    // Yeni fotoğraf yüklendikten sonra upload.js bunu çağırıp galeriyi tazeler
    window.refreshGallery = loadAlbums;

    // Giriş yapılınca (veya oturum hatırlanınca) galeriyi yükle
    document.addEventListener("sa:unlocked", () => {
        if (!loaded) loadAlbums();
    });
})();
