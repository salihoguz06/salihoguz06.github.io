-- ============================================================
-- S & A — Anı Sitesi Veritabanı Şeması
-- Bu dosyanın TAMAMINI Supabase panelinde SQL Editor'e
-- yapıştırıp "Run" ile bir kez çalıştır.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES — "kim yükledi / kim tepki verdi" için isimler.
--    auth.users Supabase'in kendi kullanıcı tablosudur; ona
--    dokunmayız, yanına küçük bir profil tablosu koyarız.
-- ------------------------------------------------------------
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. ALBUMS
-- ------------------------------------------------------------
create table public.albums (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    cover_path text,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. PHOTOS
--    storage_path: Storage bucket'ındaki dosyanın yolu
--    uploaded_by : yükleyen kişinin kullanıcı id'si
-- ------------------------------------------------------------
create table public.photos (
    id uuid primary key default gen_random_uuid(),
    album_id uuid not null references public.albums (id) on delete cascade,
    storage_path text not null,
    caption text,
    uploaded_by uuid references auth.users (id),
    taken_at date,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

create index photos_album_id_idx on public.photos (album_id);

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
--    RLS = tablo bazında güvenlik kuralları. Açık olmadığı sürece
--    anon anahtarla API'den gelen HİÇBİR istek veri okuyamaz.
--    Kural: her şey sadece giriş yapmış (authenticated)
--    kullanıcılara açık. Site herkese kapalı, ikinize özel.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;

create policy "read profiles" on public.profiles
    for select to authenticated using (true);

create policy "read albums" on public.albums
    for select to authenticated using (true);
create policy "insert albums" on public.albums
    for insert to authenticated with check (true);
create policy "update albums" on public.albums
    for update to authenticated using (true);
create policy "delete albums" on public.albums
    for delete to authenticated using (true);

create policy "read photos" on public.photos
    for select to authenticated using (true);
create policy "insert photos" on public.photos
    for insert to authenticated with check (uploaded_by = auth.uid());
create policy "update photos" on public.photos
    for update to authenticated using (true);
create policy "delete photos" on public.photos
    for delete to authenticated using (true);

-- ------------------------------------------------------------
-- 5. STORAGE — fotoğrafların gerçek dosyaları için PRIVATE bucket.
--    public = false → dosyalara sadece giriş yapmış kullanıcılar
--    (imzalı URL'lerle) erişebilir. Fotoğraflarınız artık
--    internete açık değil.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false);

create policy "read photo files" on storage.objects
    for select to authenticated using (bucket_id = 'photos');
create policy "upload photo files" on storage.objects
    for insert to authenticated with check (bucket_id = 'photos');
create policy "update photo files" on storage.objects
    for update to authenticated using (bucket_id = 'photos');
create policy "delete photo files" on storage.objects
    for delete to authenticated using (bucket_id = 'photos');
