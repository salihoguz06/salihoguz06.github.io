-- ============================================================
-- FAZ 4 ŞEMASI (TASLAK) — "wow" özellikleri için tablolar.
--
-- ⚠️  BU DOSYA HENÜZ ÇALIŞTIRILMADI. SPEC'teki CHECKPOINT B gereği,
--     veritabanına yeni tablo eklemeden önce senin onayını bekliyorum.
--     Onaylayınca TAMAMINI Supabase → SQL Editor'e yapıştırıp "Run" de.
--
-- Güvenli tasarım: her tablo `if not exists`, her policy `drop ... if exists`
-- ile korunuyor → dosyayı iki kez çalıştırsan da hata vermez (idempotent).
--
-- Her tablo eski tablolarınla aynı güvenlik desenini kullanır:
--   RLS açık + sadece giriş yapmış (authenticated) kullanıcıya açık.
--   Yani site yine tamamen ikinize özel kalır.
-- ============================================================


-- ------------------------------------------------------------
-- 1. MILESTONES — "önemli tarihler"
--    Yıl dönümü geri sayımı ve "hikayemiz" zaman çizelgesi bunu kullanır.
--    kind: 'anniversary' | 'first' | 'trip' | 'custom' gibi serbest etiket.
-- ------------------------------------------------------------
create table if not exists public.milestones (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    event_date date not null,
    kind text not null default 'custom',
    note text,
    -- Her yıl tekrar eden bir tarih mi (yıl dönümü) yoksa tek seferlik mi?
    recurring boolean not null default false,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists milestones_event_date_idx on public.milestones (event_date);

alter table public.milestones enable row level security;

drop policy if exists "read milestones"   on public.milestones;
drop policy if exists "insert milestones" on public.milestones;
drop policy if exists "update milestones" on public.milestones;
drop policy if exists "delete milestones" on public.milestones;

create policy "read milestones"   on public.milestones for select to authenticated using (true);
create policy "insert milestones" on public.milestones for insert to authenticated with check (true);
create policy "update milestones" on public.milestones for update to authenticated using (true);
create policy "delete milestones" on public.milestones for delete to authenticated using (true);


-- ------------------------------------------------------------
-- 2. MESSAGES — "mesaj duvarı / defter"
--    Birbirinize bıraktığınız tatlı notlar. author = yazan kişi.
--    Herkes okur; sadece kendi mesajını silebilir.
-- ------------------------------------------------------------
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    author uuid not null references auth.users (id),
    body text not null,
    created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at);

alter table public.messages enable row level security;

drop policy if exists "read messages"      on public.messages;
drop policy if exists "insert messages"    on public.messages;
drop policy if exists "delete own messages" on public.messages;

create policy "read messages"       on public.messages for select to authenticated using (true);
create policy "insert messages"     on public.messages for insert to authenticated with check (author = auth.uid());
create policy "delete own messages" on public.messages for delete to authenticated using (author = auth.uid());


-- ------------------------------------------------------------
-- 3. BUCKET_LIST — "birlikte yapılacaklar listesi"
--    done: yapıldı mı; done_at: ne zaman işaretlendi.
-- ------------------------------------------------------------
create table if not exists public.bucket_list (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    note text,
    done boolean not null default false,
    done_at timestamptz,
    sort_order int not null default 0,
    created_at timestamptz not null default now()
);

alter table public.bucket_list enable row level security;

drop policy if exists "read bucket"   on public.bucket_list;
drop policy if exists "insert bucket" on public.bucket_list;
drop policy if exists "update bucket" on public.bucket_list;
drop policy if exists "delete bucket" on public.bucket_list;

create policy "read bucket"   on public.bucket_list for select to authenticated using (true);
create policy "insert bucket" on public.bucket_list for insert to authenticated with check (true);
create policy "update bucket" on public.bucket_list for update to authenticated using (true);
create policy "delete bucket" on public.bucket_list for delete to authenticated using (true);


-- ------------------------------------------------------------
-- 4. PLACES — "gittiğimiz yerler haritası"
--    lat/lng: harita üzerindeki iğnenin konumu.
--    photo_id: o yere bağlı bir fotoğraf (opsiyonel).
-- ------------------------------------------------------------
create table if not exists public.places (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    lat double precision not null,
    lng double precision not null,
    visited_on date,
    note text,
    photo_id uuid references public.photos (id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.places enable row level security;

drop policy if exists "read places"   on public.places;
drop policy if exists "insert places" on public.places;
drop policy if exists "update places" on public.places;
drop policy if exists "delete places" on public.places;

create policy "read places"   on public.places for select to authenticated using (true);
create policy "insert places" on public.places for insert to authenticated with check (true);
create policy "update places" on public.places for update to authenticated using (true);
create policy "delete places" on public.places for delete to authenticated using (true);


-- ------------------------------------------------------------
-- 5. REACTIONS — fotoğraflara emoji/kalp tepkileri
--    Bir kişi aynı fotoğrafa aynı emojiyi bir kez koyabilir (unique).
--    Kendi tepkini geri alabilirsin (delete own).
-- ------------------------------------------------------------
create table if not exists public.reactions (
    id uuid primary key default gen_random_uuid(),
    photo_id uuid not null references public.photos (id) on delete cascade,
    author uuid not null references auth.users (id),
    emoji text not null,
    created_at timestamptz not null default now(),
    unique (photo_id, author, emoji)
);

create index if not exists reactions_photo_id_idx on public.reactions (photo_id);

alter table public.reactions enable row level security;

drop policy if exists "read reactions"        on public.reactions;
drop policy if exists "insert reactions"      on public.reactions;
drop policy if exists "delete own reactions"  on public.reactions;

create policy "read reactions"       on public.reactions for select to authenticated using (true);
create policy "insert reactions"     on public.reactions for insert to authenticated with check (author = auth.uid());
create policy "delete own reactions" on public.reactions for delete to authenticated using (author = auth.uid());

-- ============================================================
-- Not: Bu tabloların HİÇBİRİ mevcut verine dokunmaz — hepsi yeni
-- ve boş başlar. Var olan albüm/fotoğraf/notların güvende.
-- ============================================================
