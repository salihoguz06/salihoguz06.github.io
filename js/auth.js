// Giriş kapısı: Supabase yapılandırılmışsa oturum yoksa siteyi kilitler,
// giriş yapılınca açar. Yapılandırılmamışsa hiçbir şey yapmaz.

(function () {
    const overlay = document.getElementById("login-overlay");
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const errorEl = document.getElementById("login-error");
    const submitBtn = form.querySelector("button[type=submit]");
    const logoutBtn = document.getElementById("logout-btn");

    if (!window.sb) return;

    function lock() {
        overlay.hidden = false;
        document.body.classList.add("locked");
        logoutBtn.hidden = true;
    }

    function unlock() {
        overlay.hidden = true;
        document.body.classList.remove("locked");
        logoutBtn.hidden = false;
        document.dispatchEvent(new CustomEvent("sa:unlocked"));
    }

    lock();

    sb.auth.getSession().then(({ data }) => {
        if (data.session) unlock();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.innerText = "";
        submitBtn.disabled = true;

        const { error } = await sb.auth.signInWithPassword({
            email: emailInput.value.trim(),
            password: passwordInput.value
        });

        submitBtn.disabled = false;

        if (error) {
            errorEl.innerText = "Hmm... that key doesn't open our door. Try again, love.";
            passwordInput.value = "";
            passwordInput.focus();
            return;
        }

        unlock();
    });

    logoutBtn.addEventListener("click", async () => {
        await sb.auth.signOut();
        lock();
    });
})();
