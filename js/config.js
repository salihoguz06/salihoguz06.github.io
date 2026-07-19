// ============================================================
// SUPABASE AYARLARI
//
// Bu iki değeri Supabase panelinden alacaksın:
// Project Settings → API
//
//  - url      : "Project URL" alanındaki adres
//  - anonKey  : "anon / public" yazan anahtar
//
// ÖNEMLİ: Buraya SADECE "anon" anahtarı yazılır. Bu anahtarın
// herkese görünmesi güvenlidir çünkü tüm yetki kontrolü
// veritabanındaki RLS (Row Level Security) kurallarıyla yapılır.
//
// "service_role" anahtarını ise ASLA bu projeye, bu repoya veya
// herhangi bir istemci koduna koyma — o anahtar tüm güvenlik
// kurallarını atlar ve sadece sunucularda kullanılır.
// ============================================================

window.SUPABASE_CONFIG = {
    url: "BURAYA_PROJECT_URL",
    anonKey: "BURAYA_ANON_KEY"
};
