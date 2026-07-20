# Story of Our Life — "Us" 💞

İkimize özel, giriş kapısının arkasında yaşayan bir anı sitesi. Albümler, fotoğraflar,
aşk notları ve küçük sürprizler. Statik bir ön yüz (çerçeve/build yok) + Supabase arka ucu.

---

## Ne, nerede? (dosya yapısı)

```
index.html          → tek sayfa; tüm bölümler burada
css/style.css       → tüm stiller (tek dosya)
js/
  config.js         → Supabase URL + anon anahtarı (RLS ile güvenli, aşağıya bak)
  supabase.js       → Supabase istemcisini (window.sb) kurar
  auth.js           → giriş kapısı (oturum yoksa siteyi kilitler)
  dialog.js         → alert/confirm yerine cam estetikli diyaloglar
  gallery.js        → albüm/fotoğraf çekme, lightbox, düzenleme modu
  upload.js         → fotoğraf yükleme (ilerleme çubuğu + doğrulama)
  app.js            → sayaç, yıl dönümü geri sayımı, müzik, kazı-kazan vb.
assets/             → arka plan fotoğrafı
müzik/              → çalar için mp3'ler
supabase/
  schema.sql        → temel tablolar + RLS (bir kez çalıştırıldı)
  schema2.sql       → Faz 3: kilit tarihi + notlar (çalıştırıldı)
  schema3.sql       → Faz 4 TASLAK (henüz ÇALIŞTIRILMADI — onayını bekliyor)
  migrate.py        → eski 38 fotoğrafı Supabase'e taşıyan betik
  KURULUM.md        → Supabase kurulum rehberi (adım adım)
PROGRESS.md         → yapılanların günlüğü   BACKLOG.md → yapılacaklar
DECISIONS.md        → neden öyle yaptığımın notları
```

## Yerelde nasıl çalıştırırım?

Dosyaları doğrudan açmak yerine küçük bir yerel sunucu gerekir (tarayıcı güvenliği için):

```bash
# proje klasöründe:
python -m http.server 8899
# sonra tarayıcıda: http://localhost:8899
```

Giriş ekranı çıkar; Supabase hesabınla giriş yapınca site açılır.

## Supabase yapılandırması

- Bağlantı bilgileri `js/config.js` içinde. Oradaki **anon anahtarı istemci tarafında
  olması güvenlidir** — çünkü güvenliği veritabanındaki **RLS (Row Level Security)**
  kuralları taşır: giriş yapmamış hiç kimse fotoğraf/nota erişemez. Ayrıntı: `supabase/KURULUM.md`.
- ⚠️ **`service_role` anahtarını ASLA** bu repoya veya `config.js`'e koyma. O anahtar
  tüm güvenliği by-pass eder; sadece sunucu tarafında kullanılır.
- Fotoğraflar **private** bir Storage bucket'ında; siteye kısa ömürlü **imzalı URL**'lerle
  gelir. Yani dosyalar internete açık değil.

## Yayına alma (deploy)

Site GitHub Pages'te, `salihoguz06.github.io` deposunun `main` dalından yayınlanır.

```bash
git push origin main
```

Birkaç dakika içinde GitHub siteyi yeniden derler.

> **Önbellek notu:** `index.html` içindeki CSS/JS bağlantılarında `?v=8` gibi bir
> sürüm etiketi var. Kodu her güncellediğinde bu sayıyı artır (ör. `?v=9`). Yoksa
> tarayıcılar (özellikle telefonda) eski dosyayı önbellekten göstermeye devam edebilir.

## Sıradaki adım — Faz 4 (onay bekliyor)

`supabase/schema3.sql` yeni "wow" özellikleri için tablolar içerir (yıl dönümü verisi,
mesaj duvarı, harita, yapılacaklar listesi, tepkiler). **Henüz çalıştırılmadı.** Gözden
geçirip beğenirsen Supabase → SQL Editor'de bir kez çalıştır; sonra bu özellikler
gerçek tablolarla inşa edilebilir.
