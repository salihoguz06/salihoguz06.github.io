-- ============================================================
-- FAZ 3 ŞEMASI — SQL Editor'de bir kez çalıştır.
-- 1) Albümlere "kilit tarihi" (unlock_at) ekler
-- 2) Fotoğraflara aşk notu bırakma tablosu (photo_notes)
-- 3) Eski iki kilitli kartı gerçek albüm olarak ekler
-- ============================================================

-- unlock_at dolu ve gelecekte ise albüm "kilitli" görünür;
-- tarih geçince otomatik olarak normal albüme dönüşür.
alter table public.albums add column if not exists unlock_at timestamptz;

create table public.photo_notes (
    id uuid primary key default gen_random_uuid(),
    photo_id uuid not null references public.photos (id) on delete cascade,
    author uuid not null references auth.users (id),
    body text not null,
    created_at timestamptz not null default now()
);

create index photo_notes_photo_id_idx on public.photo_notes (photo_id);

alter table public.photo_notes enable row level security;

create policy "read notes" on public.photo_notes
    for select to authenticated using (true);
create policy "insert notes" on public.photo_notes
    for insert to authenticated with check (author = auth.uid());
create policy "delete own notes" on public.photo_notes
    for delete to authenticated using (author = auth.uid());

-- Eski sabit "gelecek" kartları artık veritabanında yaşıyor
insert into public.albums (title, description, sort_order, unlock_at) values
    ('Warsaw (Incoming Trip)', '3rd Warsaw Trip', 100, '2026-06-20T00:00:00+02:00'),
    ('Future', 'Anniversary Surprise', 101, '2027-04-26T00:00:00+03:00');
