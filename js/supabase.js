// Supabase istemcisini oluşturur ve window.sb olarak erişime açar.
// config.js doldurulmadıysa sb null kalır ve site eski (statik) haliyle çalışır.

window.sb = null;

(function () {
    const cfg = window.SUPABASE_CONFIG;
    const configured = cfg && cfg.url && cfg.anonKey &&
        !cfg.url.includes("BURAYA") && !cfg.anonKey.includes("BURAYA");

    if (!configured) {
        console.warn("Supabase henüz yapılandırılmadı — js/config.js dosyasını doldur. Site şimdilik girişsiz çalışıyor.");
        return;
    }

    window.sb = supabase.createClient(cfg.url, cfg.anonKey);
})();
