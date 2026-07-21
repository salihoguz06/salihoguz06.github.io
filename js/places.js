// "Places We've Been" haritası. Leaflet + OpenStreetMap karolarıyla
// çizilir. "places" tablosundaki her kayıt haritada bir iğne olur.
//
// Yeni yer eklemek: "Add a Place" → haritada gittiğiniz noktaya dokun →
// açılan kutucuğa ismini yaz → iğne düşer. İkiniz de ekleyip silebilir.
//
// Leaflet yüklenemezse (yavaş/çevrimdışı) bölüm kendini gizler; site çalışır.

(function () {
    const mapEl = document.getElementById("placesMap");
    const addToggle = document.getElementById("placesAddToggle");
    const hint = document.getElementById("placesHint");
    const form = document.getElementById("placesForm");
    const titleInput = document.getElementById("placeTitle");
    const dateInput = document.getElementById("placeDate");
    const noteInput = document.getElementById("placeNote");
    const saveBtn = document.getElementById("placeSave");
    const cancelBtn = document.getElementById("placeCancel");
    if (!mapEl) return;

    // Leaflet gelmediyse haritayı kur(a)mayız → bölümü sessizce gizle.
    if (typeof L === "undefined") {
        const section = document.getElementById("placesSection");
        if (section) section.hidden = true;
        return;
    }

    let available = true;
    let loaded = false;
    let map = null;
    let markers = [];
    let picking = false;    // "haritaya dokunarak yer ekleme" modu açık mı
    let pending = null;     // seçilen ama henüz kaydedilmemiş {lat, lng} + geçici iğne

    function initMap() {
        // Avrupa'yı ortalayan makul bir başlangıç (İstanbul↔Varşova arası).
        map = L.map(mapEl, { scrollWheelZoom: false }).setView([50.0, 25.0], 4);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: "© OpenStreetMap"
        }).addTo(map);

        map.on("click", onMapClick);
    }

    // Pembe kalpli özel iğne (varsayılan mavi yerine).
    function heartIcon() {
        return L.divIcon({
            className: "place-pin",
            html: "❤",
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });
    }

    function clearMarkers() {
        markers.forEach(m => map.removeLayer(m));
        markers = [];
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function prettyDate(ymd) {
        if (!ymd) return "";
        const [y, m, d] = ymd.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    }

    function popupHtml(p) {
        let html = `<strong>${escapeHtml(p.title)}</strong>`;
        if (p.visited_on) html += `<br><span class="popup-date">${escapeHtml(prettyDate(p.visited_on))}</span>`;
        if (p.note) html += `<br><span class="popup-note">${escapeHtml(p.note)}</span>`;
        html += `<br><button class="popup-del" data-id="${p.id}">Remove pin</button>`;
        return html;
    }

    function addMarker(p) {
        const marker = L.marker([p.lat, p.lng], { icon: heartIcon() }).addTo(map);
        marker.bindPopup(popupHtml(p));
        marker.on("popupopen", (e) => {
            const btn = e.popup.getElement().querySelector(".popup-del");
            if (btn) btn.addEventListener("click", () => removePlace(p, marker));
        });
        markers.push(marker);
        return marker;
    }

    function removePlace(p, marker) {
        showLoveConfirm(
            "Remove this pin?",
            `“${p.title}” will be taken off our map.`,
            async () => {
                const { error } = await sb.from("places").delete().eq("id", p.id);
                if (error) { showLoveDialog("Couldn't remove", error.message); return; }
                map.removeLayer(marker);
                markers = markers.filter(m => m !== marker);
            }
        );
    }

    function setPicking(on) {
        picking = on;
        addToggle.setAttribute("aria-pressed", String(on));
        addToggle.classList.toggle("active", on);
        mapEl.classList.toggle("picking", on);
        hint.innerText = on ? "Tap the map where we've been 📍" : "";
        if (!on) clearPending();
    }

    function clearPending() {
        if (pending && pending.marker) map.removeLayer(pending.marker);
        pending = null;
        form.hidden = true;
    }

    function onMapClick(e) {
        if (!picking) return;
        clearPending();
        const temp = L.marker(e.latlng, { icon: heartIcon(), opacity: 0.6 }).addTo(map);
        pending = { lat: e.latlng.lat, lng: e.latlng.lng, marker: temp };
        form.hidden = false;
        titleInput.focus();
    }

    async function savePlace() {
        if (!pending) return;
        const title = titleInput.value.trim();
        if (!title) { showLoveDialog("Almost there", "This place needs a name. ❤"); return; }

        saveBtn.disabled = true;
        const { data, error } = await sb.from("places").insert({
            title,
            lat: pending.lat,
            lng: pending.lng,
            visited_on: dateInput.value || null,
            note: noteInput.value.trim() || null
        }).select().single();
        saveBtn.disabled = false;

        if (error) { showLoveDialog("Couldn't save", error.message); return; }

        // Geçici iğneyi kaldır, kalıcı iğneyi ekle.
        clearPending();
        addMarker(data);

        titleInput.value = "";
        dateInput.value = "";
        noteInput.value = "";
        setPicking(false);
    }

    async function load() {
        if (!window.sb || !available) return;
        loaded = true;

        if (!map) initMap();
        // Bölüm gizliyken kurulduysa boyutu yanlış hesaplanmış olabilir → düzelt.
        setTimeout(() => map && map.invalidateSize(), 200);

        const { data, error } = await sb.from("places").select("*");
        if (error) {
            available = false;
            const section = document.getElementById("placesSection");
            if (section) section.hidden = true;
            return;
        }

        clearMarkers();
        (data || []).forEach(addMarker);

        // İğneler varsa haritayı hepsini gösterecek şekilde çerçevele.
        if (markers.length) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.3), { maxZoom: 8 });
        }
    }

    addToggle.addEventListener("click", () => setPicking(!picking));
    saveBtn.addEventListener("click", savePlace);
    cancelBtn.addEventListener("click", () => { clearPending(); });

    document.addEventListener("sa:unlocked", () => { if (!loaded) load(); });
    if (window.saUnlocked && !loaded) load();
})();
