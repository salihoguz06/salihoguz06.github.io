// Mesaj Duvarı: ikinizin birbirine bıraktığı kalıcı tatlı notlar.
// "messages" tablosundan çekilir; herkes okur, herkes yazar, ama
// sadece kendi mesajını silebilir (RLS bunu zorlar).
//
// Diğer modüller gibi kendi IIFE'si içinde yaşar → global alanı kirletmez.

(function () {
    const list = document.getElementById("messageList");
    const input = document.getElementById("messageInput");
    const sendBtn = document.getElementById("messageSendBtn");
    if (!list) return; // Bölüm sayfada yoksa sessizce çık.

    let profileNames = {};
    let currentUserId = null;
    let available = true;   // messages tablosu yoksa özelliği sessizce kapat
    let loaded = false;

    // Bir tarihi "Apr 26, 2025" gibi sıcak bir biçime çevir.
    function prettyDate(iso) {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
        });
    }

    async function loadProfiles() {
        const { data } = await sb.from("profiles").select("id, display_name");
        (data || []).forEach(p => { profileNames[p.id] = p.display_name; });
    }

    function render(messages) {
        list.innerHTML = "";
        if (!messages.length) {
            list.innerHTML = '<p class="wall-empty">No notes yet — be the first to leave one ❤</p>';
            return;
        }
        messages.forEach(m => {
            const card = document.createElement("div");
            card.className = "message-card";
            if (m.author === currentUserId) card.classList.add("mine");

            const body = document.createElement("p");
            body.className = "message-body";
            body.innerText = m.body;

            const meta = document.createElement("div");
            meta.className = "message-meta";
            const who = document.createElement("span");
            who.className = "message-author";
            who.innerText = profileNames[m.author] || "❤";
            const when = document.createElement("span");
            when.className = "message-date";
            when.innerText = prettyDate(m.created_at);
            meta.append(who, when);

            card.append(body, meta);

            // Kendi mesajınsa küçük bir silme düğmesi göster.
            if (m.author === currentUserId) {
                const del = document.createElement("button");
                del.className = "message-delete";
                del.type = "button";
                del.title = "Delete this note";
                del.setAttribute("aria-label", "Delete this note");
                del.innerText = "×";
                del.addEventListener("click", () => confirmDelete(m));
                card.appendChild(del);
            }

            list.appendChild(card);
        });
    }

    function confirmDelete(m) {
        showLoveConfirm(
            "Delete this note?",
            "It will be gone from our wall for good.",
            async () => {
                const { error } = await sb.from("messages").delete().eq("id", m.id);
                if (error) {
                    showLoveDialog("Couldn't delete", error.message);
                    return;
                }
                load();
            }
        );
    }

    async function load() {
        if (!window.sb || !available) return;
        loaded = true;

        const { data: sessionData } = await sb.auth.getSession();
        currentUserId = sessionData.session ? sessionData.session.user.id : null;

        const [{ data: messages, error }] = await Promise.all([
            sb.from("messages").select("*").order("created_at", { ascending: false }),
            loadProfiles()
        ]);

        if (error) {
            // Tablo henüz kurulmadıysa (CHECKPOINT B'den önce) özelliği gizle.
            available = false;
            const section = document.getElementById("wallSection");
            if (section) section.hidden = true;
            return;
        }

        render(messages);
    }

    async function send() {
        const body = input.value.trim();
        if (!body || !available) return;

        const { data: sessionData } = await sb.auth.getSession();
        if (!sessionData.session) return;

        sendBtn.disabled = true;
        const { error } = await sb.from("messages").insert({
            author: sessionData.session.user.id,
            body: body
        });
        sendBtn.disabled = false;

        if (error) {
            showLoveDialog("Couldn't send", error.message);
            return;
        }
        input.value = "";
        load();
    }

    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => {
        // Enter gönderir; Shift+Enter yeni satır (uzun notlar için).
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    });

    // Giriş yapılınca yükle (olayı kaçırmış olabiliriz → bayrağa da bak).
    document.addEventListener("sa:unlocked", () => { if (!loaded) load(); });
    if (window.saUnlocked && !loaded) load();
})();
