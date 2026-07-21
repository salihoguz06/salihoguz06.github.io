// Ortak Yapılacaklar Listesi ("Things We'll Do Together").
// "bucket_list" tablosundan çekilir. İkiniz de madde ekleyebilir,
// işaretleyebilir (done) ve silebilirsiniz — RLS herkese açık.
// Bir maddeyi tamamlayınca küçük bir kutlama tetiklenir.

(function () {
    const list = document.getElementById("bucketList");
    const input = document.getElementById("bucketInput");
    const addBtn = document.getElementById("bucketAddBtn");
    const counter = document.getElementById("bucketCounter");
    if (!list) return;

    let available = true;
    let loaded = false;
    let items = [];

    function render() {
        list.innerHTML = "";

        if (!items.length) {
            list.innerHTML = '<p class="bucket-empty">Nothing here yet — add our first dream below ✨</p>';
        }

        // Yapılmamışlar üstte, yapılmışlar altta; her grup kendi içinde
        // eklenme sırasına göre.
        const sorted = [...items].sort((a, b) => {
            if (a.done !== b.done) return a.done ? 1 : -1;
            return new Date(a.created_at) - new Date(b.created_at);
        });

        sorted.forEach(item => {
            const row = document.createElement("div");
            row.className = "bucket-item" + (item.done ? " done" : "");

            const check = document.createElement("button");
            check.className = "bucket-check";
            check.type = "button";
            check.setAttribute("aria-pressed", String(item.done));
            check.setAttribute("aria-label", item.done ? "Mark as not done" : "Mark as done");
            check.innerText = item.done ? "✓" : "";
            check.addEventListener("click", () => toggle(item));

            const label = document.createElement("span");
            label.className = "bucket-title";
            label.innerText = item.title;

            const del = document.createElement("button");
            del.className = "bucket-delete";
            del.type = "button";
            del.title = "Remove";
            del.setAttribute("aria-label", "Remove this item");
            del.innerText = "×";
            del.addEventListener("click", () => removeItem(item));

            row.append(check, label, del);
            list.appendChild(row);
        });

        updateCounter();
    }

    function updateCounter() {
        if (!counter) return;
        const doneCount = items.filter(i => i.done).length;
        counter.innerText = items.length
            ? `${doneCount} of ${items.length} done together`
            : "";
    }

    async function toggle(item) {
        const nowDone = !item.done;
        const { error } = await sb.from("bucket_list").update({
            done: nowDone,
            done_at: nowDone ? new Date().toISOString() : null
        }).eq("id", item.id);

        if (error) {
            showLoveDialog("Couldn't save", error.message);
            return;
        }
        item.done = nowDone;
        item.done_at = nowDone ? new Date().toISOString() : null;
        render();

        // Yeni tamamlandıysa küçük bir kutlama (hareketi azalt kapalıysa).
        if (nowDone) celebrate();
    }

    function celebrate() {
        if (typeof spawnMiniHeart !== "function") return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return;
        for (let i = 0; i < 14; i++) setTimeout(spawnMiniHeart, i * 70);
    }

    function removeItem(item) {
        showLoveConfirm(
            "Remove this?",
            `“${item.title}” will be taken off our list.`,
            async () => {
                const { error } = await sb.from("bucket_list").delete().eq("id", item.id);
                if (error) {
                    showLoveDialog("Couldn't remove", error.message);
                    return;
                }
                items = items.filter(i => i.id !== item.id);
                render();
            }
        );
    }

    async function add() {
        const title = input.value.trim();
        if (!title || !available) return;

        addBtn.disabled = true;
        const { data, error } = await sb.from("bucket_list")
            .insert({ title })
            .select()
            .single();
        addBtn.disabled = false;

        if (error) {
            showLoveDialog("Couldn't add", error.message);
            return;
        }
        items.push(data);
        input.value = "";
        render();
    }

    async function load() {
        if (!window.sb || !available) return;
        loaded = true;

        const { data, error } = await sb.from("bucket_list").select("*");
        if (error) {
            available = false;
            const section = document.getElementById("bucketSection");
            if (section) section.hidden = true;
            return;
        }
        items = data || [];
        render();
    }

    addBtn.addEventListener("click", add);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); add(); }
    });

    document.addEventListener("sa:unlocked", () => { if (!loaded) load(); });
    if (window.saUnlocked && !loaded) load();
})();
