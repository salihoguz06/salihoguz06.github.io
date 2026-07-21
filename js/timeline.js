// "Our Story" zaman çizelgesi + "On this day" vurgusu.
// "milestones" tablosundan çekilir: önemli tarihlerinizi kronolojik
// olarak dizer. İkiniz de an ekleyip silebilirsiniz.
//
// Bugünün gün/ayı bir kilometre taşıyla eşleşirse üstte özel bir şerit
// belirir ("On this day, N years ago...").

(function () {
    const listEl = document.getElementById("timelineList");
    const banner = document.getElementById("onThisDay");
    const toggleBtn = document.getElementById("timelineAddToggle");
    const form = document.getElementById("timelineForm");
    const titleInput = document.getElementById("milestoneTitle");
    const dateInput = document.getElementById("milestoneDate");
    const noteInput = document.getElementById("milestoneNote");
    const saveBtn = document.getElementById("milestoneSave");
    if (!listEl) return;

    let available = true;
    let loaded = false;
    let items = [];

    // "2025-04-26" → "April 26, 2025" (tarihi UTC kaymadan yerel oku).
    function prettyDate(ymd) {
        const [y, m, d] = ymd.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
        });
    }

    // İki tarih arasındaki tam yıl farkı (yıl dönümü metni için).
    function yearsSince(ymd) {
        const [y, m, d] = ymd.split("-").map(Number);
        const then = new Date(y, m - 1, d);
        const now = new Date();
        let years = now.getFullYear() - then.getFullYear();
        const beforeAnniv =
            now.getMonth() < then.getMonth() ||
            (now.getMonth() === then.getMonth() && now.getDate() < then.getDate());
        if (beforeAnniv) years -= 1;
        return years;
    }

    function ordinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function renderBanner() {
        if (!banner) return;
        const now = new Date();
        const todayMonth = now.getMonth() + 1;
        const todayDay = now.getDate();

        const match = items.find(it => {
            const [, m, d] = it.event_date.split("-").map(Number);
            return m === todayMonth && d === todayDay;
        });

        if (!match) { banner.hidden = true; banner.innerText = ""; return; }

        const years = yearsSince(match.event_date);
        const when = years <= 0 ? "today" : `${years} year${years === 1 ? "" : "s"} ago today`;
        banner.hidden = false;
        banner.innerText = `📅 On this day, ${when} — ${match.title} ❤`;
    }

    function render() {
        listEl.innerHTML = "";

        if (!items.length) {
            listEl.innerHTML = '<p class="timeline-empty">Our story starts here — add the day it all began below 📖</p>';
        }

        const now = new Date();
        const todayKey = (now.getMonth() + 1) + "-" + now.getDate();

        // Kronolojik sıra (eskiden yeniye).
        const sorted = [...items].sort((a, b) => a.event_date.localeCompare(b.event_date));

        sorted.forEach(it => {
            const [, m, d] = it.event_date.split("-").map(Number);
            const isToday = (m + "-" + d) === todayKey;

            const row = document.createElement("div");
            row.className = "timeline-item" + (isToday ? " is-today" : "");

            const dot = document.createElement("div");
            dot.className = "timeline-dot";

            const content = document.createElement("div");
            content.className = "timeline-content";

            const date = document.createElement("div");
            date.className = "timeline-date";
            date.innerText = prettyDate(it.event_date);

            const title = document.createElement("h3");
            title.className = "timeline-title";
            title.innerText = it.title;

            content.append(date, title);

            if (it.note) {
                const note = document.createElement("p");
                note.className = "timeline-note";
                note.innerText = it.note;
                content.appendChild(note);
            }

            const del = document.createElement("button");
            del.className = "timeline-delete";
            del.type = "button";
            del.title = "Remove this moment";
            del.setAttribute("aria-label", "Remove this moment");
            del.innerText = "×";
            del.addEventListener("click", () => removeItem(it));
            content.appendChild(del);

            row.append(dot, content);
            listEl.appendChild(row);
        });

        renderBanner();
    }

    function removeItem(it) {
        showLoveConfirm(
            "Remove this moment?",
            `“${it.title}” will be taken off our story.`,
            async () => {
                const { error } = await sb.from("milestones").delete().eq("id", it.id);
                if (error) { showLoveDialog("Couldn't remove", error.message); return; }
                items = items.filter(x => x.id !== it.id);
                render();
            }
        );
    }

    async function save() {
        const title = titleInput.value.trim();
        const date = dateInput.value; // "YYYY-MM-DD"
        if (!title || !date) {
            showLoveDialog("Almost there", "A moment needs both a name and a date. ❤");
            return;
        }

        saveBtn.disabled = true;
        const { data, error } = await sb.from("milestones")
            .insert({ title, event_date: date, note: noteInput.value.trim() || null })
            .select()
            .single();
        saveBtn.disabled = false;

        if (error) { showLoveDialog("Couldn't save", error.message); return; }

        items.push(data);
        titleInput.value = "";
        dateInput.value = "";
        noteInput.value = "";
        form.hidden = true;
        toggleBtn.setAttribute("aria-expanded", "false");
        render();
    }

    async function load() {
        if (!window.sb || !available) return;
        loaded = true;

        const { data, error } = await sb.from("milestones").select("*");
        if (error) {
            available = false;
            const section = document.getElementById("timelineSection");
            if (section) section.hidden = true;
            return;
        }
        items = data || [];
        render();
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const willShow = form.hidden;
            form.hidden = !willShow;
            toggleBtn.setAttribute("aria-expanded", String(willShow));
            if (willShow) titleInput.focus();
        });
    }
    if (saveBtn) saveBtn.addEventListener("click", save);

    document.addEventListener("sa:unlocked", () => { if (!loaded) load(); });
    if (window.saUnlocked && !loaded) load();
})();
