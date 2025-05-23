# db-add-nomor (Vercel Version – Secure DB)

Sistem web untuk **menambahkan nomor + password** ke dalam **database aman berbasis GitHub** secara real-time. Cocok untuk keperluan akses akun, validasi login, atau sistem whitelist.

---

## 🚀 Setup

1. **Rename** file `.env.example` menjadi `.env`  
2. Masukkan token GitHub kamu:  
   ```
    GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
   ```
3. **Deploy ke Vercel**  
   - Buka dashboard Vercel
   - Pilih proyek ini
   - Masuk ke **Settings → Environment Variables**
   - Tambahkan:
     - `GITHUB_TOKEN` → isi token GitHub kamu

4. Website siap digunakan di `https://namaproject.vercel.app`

---

## 🧠 Fitur Utama

- ✅ Tambah nomor + password ke database JSON GitHub
- ✅ Deteksi duplikat otomatis
- ✅ Blacklist sistem (tidak bisa add lagi)
- ✅ Admin panel login
- ✅ Efek visual interaktif (jam real-time, loading, suara notifikasi)
- ✅ Halaman responsive + aesthetic

---

## 🔧 Struktur File

```
aksesnobot-main/
├── api/                    # Folder backend API untuk submit ke GitHub
│   └── submit.js
├── .env                    # File konfigurasi token GitHub (gunakan di Vercel)
├── benar.mp3               # Suara notifikasi benar
├── index.html              # Halaman utama untuk user & admin
├── musik.mp3               # Musik background di halaman
├── namafoto.jpg            # Background atau elemen visual
├── package.json            # Konfigurasi npm + metadata proyek
├── README.md               # Dokumentasi proyek (sudah dibuat lengkap)
├── rikireal.js             # Script utama aplikasi (frontend + logic)
├── salah.mp3               # Suara notifikasi salah
└── style.css               # CSS untuk styling halaman
```

---

## 👥 Penggunaan

### Untuk Pengguna Umum:

1. Masuk ke halaman utama
2. Masukkan nomor (cth: `628xxxx`) dan password
3. Klik tombol "Tambah"
4. Nomor otomatis masuk ke database jika valid dan belum diblacklist

### Untuk Admin:

1. Klik tab **Admin Panel**
2. Login menggunakan password admin (default: `riki#shop`)
3. Fitur admin tersedia:
   - Lihat semua user
   - Cari berdasarkan nomor
   - Hapus nomor
   - Blacklist nomor

---

## ⚠️ Penting

- **Data hanya 1x tampil untuk user!**  
  Setelah refresh, data tidak akan muncul lagi kecuali disalin atau dicatat.

- **Data disimpan langsung ke GitHub**  
  Pastikan file `code.json` sudah ada di repositori yang ditentukan.

---

## ✨ Credits

- Dibuat oleh : [ Rikishop ] 
- whatsapp : [ 6285771555374 ]
- youtube  : (https://youtube.com/@rikishopreal)
- sosial media  : (https://rikishopreal.vercel.app)
- Bot integrasi backend oleh OpenAI + Vercel + GitHub
