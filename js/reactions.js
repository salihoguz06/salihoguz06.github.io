// Fotoğraf tepkileri: lightbox'ta bir fotoğrafa emoji/kalp bırakma.
// "reactions" tablosundan çekilir. Bir kişi aynı fotoğrafa aynı emojiyi
// bir kez koyabilir (tabloda unique kısıtı var); tekrar basınca geri alır.
//
// gallery.js bir fotoğraf açınca "sa:photo" olayını yayınlar; biz onu
// dinleyip o fotoğrafın tepki çubuğunu çizeriz. İki dosya birbirini
// doğrudan çağırmaz — gevşek bağlı çalışırlar.

(function () {
    const bar = document.getElementById("reactionBar");
    if (!bar) return;

    // Sunacağımız sıcak emoji seti.
    const EMOJIS = ["❤️", "😍", "🥹", "😂", "🔥", "🥰"];

    let available = true;      // reactions tablosu yoksa özelliği sessizce kapat
    let currentUserId = null;
    let currentPhotoId = null;

    async function getUserId() {
        if (currentUserId) return currentUserId;
        const { data } = await sb.auth.getSession();
        currentUserId = data.session ? data.session.user.id : null;
        return currentUserId;
    }

    async function render(photoId) {
        if (!window.sb || !available) { bar.hidden = true; return; }

        const { data: rows, error } = await sb
            .from("reactions")
            .select("emoji, author")
            .eq("photo_id", photoId);

        if (error) {
            available = false;
            bar.hidden = true;
            return;
        }

        // Fotoğraf bu arada değiştiyse eski sonucu çizme.
        if (photoId !== currentPhotoId) return;

        const uid = await getUserId();

        // Emoji başına sayım ve "ben bastım mı" bilgisini çıkar.
        const counts = {};
        const mine = new Set();
        (rows || []).forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
            if (r.author === uid) mine.add(r.emoji);
        });

        bar.hidden = false;
        bar.innerHTML = "";
        EMOJIS.forEach(emoji => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "reaction-btn" + (mine.has(emoji) ? " reacted" : "");
            btn.setAttribute("aria-pressed", String(mine.has(emoji)));
            btn.setAttribute("aria-label", `React ${emoji}`);

            const face = document.createElement("span");
            face.className = "reaction-emoji";
            face.innerText = emoji;
            btn.appendChild(face);

            if (counts[emoji]) {
                const n = document.createElement("span");
                n.className = "reaction-count";
                n.innerText = counts[emoji];
                btn.appendChild(n);
            }

            btn.addEventListener("click", () => toggle(emoji, mine.has(emoji)));
            bar.appendChild(btn);
        });
    }

    async function toggle(emoji, alreadyMine) {
        const uid = await getUserId();
        if (!uid) return;

        if (alreadyMine) {
            await sb.from("reactions").delete()
                .eq("photo_id", currentPhotoId)
                .eq("author", uid)
                .eq("emoji", emoji);
        } else {
            await sb.from("reactions").insert({
                photo_id: currentPhotoId,
                author: uid,
                emoji: emoji
            });
        }
        render(currentPhotoId);
    }

    // gallery.js'ten gelen "fotoğraf açıldı/değişti" sinyali.
    document.addEventListener("sa:photo", (e) => {
        currentPhotoId = e.detail.photoId;
        bar.innerHTML = "";       // Yeni fotoğrafa geçerken eski çubuğu temizle.
        render(currentPhotoId);
    });
})();
