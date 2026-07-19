# Supabase Kurulum Rehberi (Faz 1)

Bu adımları bir kez yapacaksın, toplam ~10 dakika sürer.

## 1. Proje oluştur
1. [supabase.com](https://supabase.com) → ücretsiz hesap aç → **New Project**.
2. Proje adı: `anniversary` (fark etmez). **Database Password** olarak güçlü bir şifre seç ve bir yere kaydet (bu şifre siteye girişte KULLANILMAZ, sadece veritabanı yönetimi içindir).
3. Region: **Frankfurt (eu-central-1)** seç — hem Türkiye'ye hem Polonya'ya en yakını.

## 2. Şemayı kur
1. Sol menüden **SQL Editor** → **New query**.
2. `supabase/schema.sql` dosyasının TAMAMINI yapıştır → **Run**.
3. "Success" görmelisin. (Tablolar, güvenlik kuralları ve private fotoğraf deposu tek seferde kuruldu.)

## 3. İki hesabı oluştur
1. Sol menüden **Authentication** → **Users** → **Add user** → **Create new user**.
2. Kendin için: e-posta + şifre gir, **Auto Confirm User** işaretli olsun → Create.
3. Aynısını onun için tekrarla (onun e-postası + onun şifresi).

## 4. Dışarıdan kayıt olmayı KAPAT (önemli güvenlik adımı)
Bunu yapmazsak herhangi biri siteye kendi hesabını açıp "giriş yapmış kullanıcı" sayılır ve fotoğrafları görebilir.

1. **Authentication** → **Sign In / Up** (veya Providers) → **Email** sağlayıcısı.
2. **Allow new users to sign up** seçeneğini **KAPAT** → Save.

Artık sadece senin elle oluşturduğun iki hesap giriş yapabilir.

## 5. İsimleri tanıt
SQL Editor'de şunu çalıştır (id'leri Authentication → Users sayfasından kopyala):

```sql
insert into public.profiles (id, display_name) values
  ('SENIN_USER_ID', 'Salih'),
  ('ONUN_USER_ID', 'Ola');
```

## 6. Anahtarları siteye tanıt
1. **Project Settings** → **API** (veya **API Keys**).
2. **Project URL** ve **anon public** anahtarını kopyala.
3. `js/config.js` dosyasındaki iki `BURAYA_...` alanına yapıştır.

> `service_role` anahtarına DOKUNMA — o hiçbir zaman siteye konmaz.

## 7. Test et
Siteyi aç. Artık karşına şık bir giriş ekranı çıkmalı. Kendi e-posta + şifrenle gir → site açılır. Sağ üstte **Log Out** butonu belirir.

`config.js` boş kaldığı sürece site eskisi gibi girişsiz çalışmaya devam eder — yani bu kurulumu istediğin zaman yapabilirsin, site bozulmaz.
