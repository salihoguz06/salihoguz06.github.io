# -*- coding: utf-8 -*-
# ============================================================
# Mevcut fotoğrafları Supabase'e taşır (bir kere çalıştırılır).
#
# Kullanım (proje klasöründe):
#   python supabase/migrate.py
#
# Sana e-posta ve şifreni sorar (şifre ekranda görünmez),
# kendi hesabınla giriş yapar ve tüm fotoğrafları eski
# başlıklarıyla birlikte yükler. Aynı isimli albüm zaten
# varsa o albümü atlar — yani yanlışlıkla iki kez
# çalıştırırsan kopya oluşmaz.
# ============================================================

import getpass
import json
import mimetypes
import sys
import traceback
import urllib.error
import urllib.request
from pathlib import Path

LOG_FILE = Path(__file__).resolve().parent / "migrate_log.txt"
_log_handle = None


def log(msg):
    print(msg)
    if _log_handle:
        _log_handle.write(str(msg) + "\n")
        _log_handle.flush()

URL = "https://hsbybsgxcwowocwqysxz.supabase.co"
ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYnlic2d4Y3dvd29jd3F5c3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzAyMzksImV4cCI6MjEwMDA0NjIzOX0.iVAAUp4En1QFuw1vDrLyq7gk6DjzHiKLTQjw7dLWkjI"

ROOT = Path(__file__).resolve().parent.parent

ALBUMS = [
    {
        "slug": "beginning",
        "title": "Beginning",
        "description": "One of the best part, even if it was deadly stressful...",
        "sort_order": 1,
        "cover_index": 0,
        "photos": [
            ("İlk aylar/arkaoda.jpg", ""),
            ("İlk aylar/IMG-20250426-WA0043.jpg", "The day I reborned..."),
            ("İlk aylar/1.2.jpeg", "Life was getting better and better."),
            ("İlk aylar/kamp.jpeg", "Finally my plan to kidnapp you with bringing you to camp was working so well."),
            ("İlk aylar/fell_love.jpeg", "But I fell in love so harsh..."),
            ("İlk aylar/dans.jpeg", ""),
            ("İlk aylar/kamp2.jpeg", ""),
            ("İlk aylar/qfdf.jpeg", ""),
            ("İlk aylar/ask.jpeg", "I was obsessed with that cute face."),
            ("İlk aylar/love.jpeg", "That eyes were cutting my heart to half."),
            ("İlk aylar/öpucuk.jpeg", "❤️"),
            ("İlk aylar/adalar.jpeg", "Please bury me to your neck."),
            ("İlk aylar/bulgaria.jpeg", "Bulgaria... 💘"),
        ],
    },
    {
        "slug": "peak",
        "title": "Peak",
        "description": "Proof that we are playing with fate.",
        "sort_order": 2,
        "cover_index": 1,
        "photos": [
            ("polonya/sexy.jpg", "Deciding to come was best decision I made."),
            ("polonya/cute.jpg", "Cutest pic ever."),
            ("polonya/princess.jpg", "My little passenger princess."),
            ("polonya/malborough.jpg", "Its addicting to travel with you."),
            ("polonya/kiss.jpeg", "To kiss..."),
            ("polonya/kiss2.jpg", "❤️"),
            ("polonya/kiss4.jpg", "Kocham Cię"),
            ("polonya/kiss5.jpg", ""),
            ("polonya/eat.jpg", "To eat..."),
            ("polonya/sexy2.jpg", ""),
            ("polonya/gdansk.jpg", "Gdansk"),
            ("polonya/gzl.jpg", ""),
        ],
    },
    {
        "slug": "aftermath",
        "title": "Aftermath",
        "description": "That's how it continued.",
        "sort_order": 3,
        "cover_index": 0,
        "photos": [
            ("fotolar/deniz.jpeg", ""),
            ("fotolar/deniz2.jpeg", "That touch killed me."),
            ("fotolar/fur.jpeg", "Mmmm, that white fur."),
            ("fotolar/kiss.jpg", "More kisses"),
            ("fotolar/kiss2.jpeg", ""),
            ("fotolar/kiss3.jpeg", "Kham"),
            ("fotolar/izmir.jpeg", "Ahh that dress 😫."),
            ("fotolar/sexynight.jpeg", "I remember this sexy night so clear."),
            ("fotolar/sexy.jpeg", "Masculine man diet: Some underground rock bar in Warsaw, beer and these sexy legs with fishnet."),
            ("fotolar/halloween.jpeg", "That Halloween"),
            ("fotolar/west.jpeg", "I fell in love again in westest point of europe."),
            ("fotolar/poland2.jpeg", ""),
            ("fotolar/cutie.jpeg", "Cute girlfriend helps her boyfriend."),
        ],
    },
]


def request(method, url, headers=None, data=None):
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def api_headers(token, extra=None):
    h = {
        "apikey": ANON,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h


def login(email, password):
    status, body = request(
        "POST",
        f"{URL}/auth/v1/token?grant_type=password",
        headers={"apikey": ANON, "Content-Type": "application/json"},
        data=json.dumps({"email": email, "password": password}).encode(),
    )
    if status != 200:
        log(f"HATA: Giriş başarısız ({status}): {body.decode(errors='replace')}")
        sys.exit(1)
    data = json.loads(body)
    return data["access_token"], data["user"]["id"]


def get_albums(token):
    status, body = request(
        "GET",
        f"{URL}/rest/v1/albums?select=id,title,cover_path",
        headers=api_headers(token),
    )
    if status != 200:
        raise RuntimeError(f"Albümler okunamadı ({status}): {body.decode(errors='replace')}")
    return {a["title"]: a for a in json.loads(body)}


def get_photo_paths(token, album_id):
    status, body = request(
        "GET",
        f"{URL}/rest/v1/photos?album_id=eq.{album_id}&select=storage_path",
        headers=api_headers(token),
    )
    if status != 200:
        raise RuntimeError(f"Fotoğraf listesi okunamadı ({status}): {body.decode(errors='replace')}")
    return {p["storage_path"] for p in json.loads(body)}


def create_album(token, album):
    status, body = request(
        "POST",
        f"{URL}/rest/v1/albums",
        headers=api_headers(token, {"Prefer": "return=representation"}),
        data=json.dumps({
            "title": album["title"],
            "description": album["description"],
            "sort_order": album["sort_order"],
        }).encode(),
    )
    if status not in (200, 201):
        raise RuntimeError(f"Albüm oluşturulamadı ({status}): {body.decode(errors='replace')}")
    return json.loads(body)[0]["id"]


def upload_file(token, storage_path, local_path):
    content_type = mimetypes.guess_type(str(local_path))[0] or "image/jpeg"
    status, body = request(
        "POST",
        f"{URL}/storage/v1/object/photos/{storage_path}",
        headers={
            "apikey": ANON,
            "Authorization": f"Bearer {token}",
            "Content-Type": content_type,
            "x-upsert": "true",
        },
        data=local_path.read_bytes(),
    )
    if status not in (200, 201):
        raise RuntimeError(f"Dosya yüklenemedi ({status}): {body.decode(errors='replace')}")


def insert_photo(token, user_id, album_id, storage_path, caption, sort_order):
    status, body = request(
        "POST",
        f"{URL}/rest/v1/photos",
        headers=api_headers(token),
        data=json.dumps({
            "album_id": album_id,
            "storage_path": storage_path,
            "caption": caption or None,
            "uploaded_by": user_id,
            "sort_order": sort_order,
        }).encode(),
    )
    if status not in (200, 201):
        raise RuntimeError(f"Fotoğraf kaydı eklenemedi ({status}): {body.decode(errors='replace')}")


def set_cover(token, album_id, cover_path):
    status, body = request(
        "PATCH",
        f"{URL}/rest/v1/albums?id=eq.{album_id}",
        headers=api_headers(token),
        data=json.dumps({"cover_path": cover_path}).encode(),
    )
    if status not in (200, 204):
        raise RuntimeError(f"Kapak ayarlanamadı ({status}): {body.decode(errors='replace')}")


def main():
    global _log_handle
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    _log_handle = open(LOG_FILE, "w", encoding="utf-8")

    log("=== S & A Fotoğraf Taşıma ===")
    log(f"Python: {sys.version}")
    log(f"Çalışma klasörü: {ROOT}")

    email = input("E-posta: ").strip()
    password = getpass.getpass("Şifre (görünmez, yazıp Enter'a bas): ")
    log(f"E-posta girildi: {email}")

    log("Giriş yapılıyor...")
    token, user_id = login(email, password)
    log(f"Giriş başarılı. Kullanıcı: {user_id}\n")

    existing = get_albums(token)
    log("Veritabanındaki mevcut durum:")
    if not existing:
        log("  (hiç albüm yok)")
    for title, a in existing.items():
        paths = get_photo_paths(token, a["id"])
        log(f"  {title}: {len(paths)} fotoğraf, kapak: {a['cover_path'] or 'YOK'}")
    log("")

    for album in ALBUMS:
        missing = [p for p, _ in album["photos"] if not (ROOT / p).exists()]
        if missing:
            log(f"HATA: '{album['title']}' için eksik dosyalar: {missing}")
            log("Bu albüm atlandı.")
            continue

        record = existing.get(album["title"])
        if record:
            album_id = record["id"]
            log(f"'{album['title']}' zaten var — eksikleri tamamlanacak.")
        else:
            log(f"'{album['title']}' albümü oluşturuluyor...")
            album_id = create_album(token, album)
            log(f"  Albüm id: {album_id}")

        have = get_photo_paths(token, album_id)
        cover_storage_path = None

        for i, (rel_path, caption) in enumerate(album["photos"]):
            local = ROOT / rel_path
            ext = local.suffix.lower().lstrip(".") or "jpg"
            storage_path = f"{album['slug']}/{i:02d}.{ext}"

            if i == album["cover_index"]:
                cover_storage_path = storage_path

            if storage_path in have:
                log(f"  [{i + 1}/{len(album['photos'])}] {rel_path} zaten yüklü — atlandı.")
                continue

            log(f"  [{i + 1}/{len(album['photos'])}] {rel_path} yükleniyor...")
            upload_file(token, storage_path, local)
            insert_photo(token, user_id, album_id, storage_path, caption, i)

        if cover_storage_path and not (record and record["cover_path"]):
            set_cover(token, album_id, cover_storage_path)
            log("  Kapak fotoğrafı ayarlandı.")
        log(f"'{album['title']}' tamamlandı. ✓\n")

    log("Taşıma bitti! Siteyi aç ve Memories bölümüne bak. ❤")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except BaseException:
        log("BEKLENMEDİK HATA:")
        log(traceback.format_exc())
        sys.exit(1)
