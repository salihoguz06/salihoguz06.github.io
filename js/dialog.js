// Sitenin cam estetiğine uygun diyalog kutuları — alert() ve confirm() yerine.
//   showLoveDialog("Başlık", "Mesaj")
//   showLoveConfirm("Başlık", "Mesaj", onaylandığındaÇalışacakFonksiyon)

(function () {
    const overlay = document.createElement("div");
    overlay.id = "love-dialog";

    const card = document.createElement("div");
    card.className = "love-dialog-card";

    const title = document.createElement("h3");
    const message = document.createElement("p");

    const buttonRow = document.createElement("div");
    buttonRow.className = "love-dialog-buttons";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "love-dialog-cancel";
    cancelBtn.innerText = "Cancel";

    const okBtn = document.createElement("button");
    okBtn.className = "send-btn";

    buttonRow.append(cancelBtn, okBtn);
    card.append(title, message, buttonRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    let onConfirm = null;

    function close() {
        overlay.classList.remove("open");
        onConfirm = null;
    }

    okBtn.addEventListener("click", () => {
        const action = onConfirm;
        close();
        if (action) action();
    });
    cancelBtn.addEventListener("click", close);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("open")) {
            e.stopPropagation();
            close();
        }
    }, true);

    window.showLoveDialog = function (t, m) {
        title.innerText = t;
        message.innerText = m;
        okBtn.innerText = "Okay ❤";
        okBtn.classList.remove("danger");
        cancelBtn.hidden = true;
        onConfirm = null;
        overlay.classList.add("open");
    };

    window.showLoveConfirm = function (t, m, action) {
        title.innerText = t;
        message.innerText = m;
        okBtn.innerText = "Yes, delete";
        okBtn.classList.add("danger");
        cancelBtn.hidden = false;
        onConfirm = action;
        overlay.classList.add("open");
    };

    window.closeLoveDialog = close;
})();
