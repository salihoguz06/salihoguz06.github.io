// Sitenin cam estetiğine uygun küçük diyalog kutusu — alert() yerine.
// Kullanım: showLoveDialog("Başlık", "Mesaj")

(function () {
    const overlay = document.createElement("div");
    overlay.id = "love-dialog";

    const card = document.createElement("div");
    card.className = "love-dialog-card";

    const title = document.createElement("h3");
    title.id = "love-dialog-title";
    const message = document.createElement("p");
    message.id = "love-dialog-message";
    const btn = document.createElement("button");
    btn.className = "send-btn";
    btn.innerText = "Okay ❤";
    btn.addEventListener("click", () => closeLoveDialog());

    card.append(title, message, btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    window.showLoveDialog = function (t, m) {
        title.innerText = t;
        message.innerText = m;
        overlay.classList.add("open");
    };

    window.closeLoveDialog = function () {
        overlay.classList.remove("open");
    };

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeLoveDialog();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("open")) closeLoveDialog();
    });
})();
