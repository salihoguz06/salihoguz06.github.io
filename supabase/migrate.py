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
import urllib.error
import urllib.request
from pathlib import Path

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
        print(f"HATA: Giriş başarısız ({status}): {body.decode(errors='replace')}")
        sys.exit(1)
    data = json.loads(body)
    return data["access_token"], data["user"]["id"]


def album_exists(token, title):
    from urllib.parse import quote
    status, body = request(
        "GET",
        f"{URL}/rest/v1/albums?title=eq.{quote(title)}&select=id",
        headers=api_headers(token),
    )
    return status == 200 and len(json.loads(body)) > 0


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
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    print("=== S & A Fotoğraf Taşıma ===")
    email = input("E-posta: ").strip()
    password = getpass.getpass("Şifre (görünmez, yazıp Enter'a bas): ")

    print("Giriş yapılıyor...")
    token, user_id = login(email, password)
    print("Giriş başarılı.\n")

    for album in ALBUMS:
        if album_exists(token, album["title"]):
            print(f"'{album['title']}' zaten var — atlandı.")
            continue

        missing = [p for p, _ in album["photos"] if not (ROOT / p).exists()]
        if missing:
            print(f"HATA: '{album['title']}' için eksik dosyalar: {missing}")
            print("Bu albüm atlandı.")
            continue

        print(f"'{album['title']}' albümü oluşturuluyor...")
        album_id = create_album(token, album)

        cover_storage_path = None
        for i, (rel_path, caption) in enumerate(album["photos"]):
            local = ROOT / rel_path
            ext = local.suffix.lower().lstrip(".") or "jpg"
            storage_path = f"{album['slug']}/{i:02d}.{ext}"

            print(f"  [{i + 1}/{len(album['photos'])}] {rel_path} yükleniyor...")
            upload_file(token, storage_path, local)
            insert_photo(token, user_id, album_id, storage_path, caption, i)

            if i == album["cover_index"]:
                cover_storage_path = storage_path

        if cover_storage_path:
            set_cover(token, album_id, cover_storage_path)
        print(f"'{album['title']}' tamamlandı. ✓\n")

    print("Taşıma bitti! Siteyi aç ve Memories bölümüne bak. ❤")


if __name__ == "__main__":
    main()
