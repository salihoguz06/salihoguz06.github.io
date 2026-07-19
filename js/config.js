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
    url: "https://hsbybsgxcwowocwqysxz.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYnlic2d4Y3dvd29jd3F5c3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzAyMzksImV4cCI6MjEwMDA0NjIzOX0.iVAAUp4En1QFuw1vDrLyq7gk6DjzHiKLTQjw7dLWkjI"
};
