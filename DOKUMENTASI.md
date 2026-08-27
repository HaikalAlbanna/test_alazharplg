# Dokumentasi Portal Sekolah

## Ringkasan

Portal Sekolah adalah aplikasi web sederhana untuk tes coding dengan tiga role: **Admin**, **Guru**, dan **Siswa**. Semua pengguna memakai satu halaman login, sementara halaman dan API dibatasi berdasarkan role.

## Teknologi

- Node.js dan Express
- JWT pada cookie HTTP-only untuk autentikasi
- bcryptjs untuk hashing password
- File JSON sederhana sebagai database yang langsung dapat digunakan
- SB Admin 2, Bootstrap 4, dan Chart.js untuk dashboard Admin

## Menjalankan aplikasi

Masuk ke folder backend lalu jalankan:

```powershell
cd backend
npm start
```

Kemudian buka `http://localhost:3000/login`.

Jika port 3000 sedang dipakai proses lain, hentikan proses tersebut atau jalankan pada port lain:

```powershell
$env:PORT=3001
npm start
```

## Akun awal

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Guru | `guru` | `guru123` |
| Siswa | `siswa` | `siswa123` |

Password di database tidak disimpan dalam teks biasa. Nilainya telah di-hash menggunakan bcrypt.

## Hak akses

| Fitur | Admin | Guru | Siswa |
| --- | :---: | :---: | :---: |
| Dashboard Admin | Ya | Tidak | Tidak |
| Kelola Guru | Ya | Tidak | Tidak |
| Kelola Siswa | Ya | Tidak | Tidak |
| Dashboard Guru | Tidak | Ya | Tidak |
| Dashboard Siswa | Tidak | Tidak | Ya |

Pengguna yang belum login akan dialihkan ke `/login`. Akses dashboard dengan role yang salah menampilkan halaman **403 / Tidak memiliki akses**.

## Halaman

- `/login` — Login untuk semua role.
- `/admin/dashboard` — Dashboard Admin dengan kartu jumlah Guru/Siswa dan grafik.
- `/admin/guru` — CRUD akun Guru.
- `/admin/siswa` — CRUD akun Siswa.
- `/guru/dashboard` — Dashboard dan profil Guru.
- `/siswa/dashboard` — Dashboard dan profil Siswa.
- `/403` — Halaman akses ditolak.

## API utama

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| POST | `/api/auth/login` | Login dan membuat cookie JWT. |
| POST | `/api/auth/logout` | Menghapus cookie JWT. |
| GET | `/api/auth/me` | Mengambil profil sesi saat ini. |
| GET | `/api/admin/stats` | Jumlah Guru dan Siswa, khusus Admin. |
| GET | `/api/admin/users?role=guru` | Daftar Guru, khusus Admin. |
| GET | `/api/admin/users?role=siswa` | Daftar Siswa, khusus Admin. |
| POST | `/api/admin/users` | Membuat akun Guru/Siswa, khusus Admin. |
| PUT | `/api/admin/users/:id` | Mengedit akun Guru/Siswa, khusus Admin. |
| DELETE | `/api/admin/users/:id` | Menghapus akun Guru/Siswa, khusus Admin. |

## Struktur penting

```text
backend/
  server.js                 # Server, route API, dan route halaman
  middleware/auth.js        # Verifikasi JWT dan pembatasan role
  database/users.js         # Operasi data users dan hashing password
  database/users.json       # Data akun sederhana
  database/schema.sql       # Referensi tabel jika memakai MySQL
public/
  admin.html, admin.js      # Dashboard Admin menggunakan SB Admin 2
  login.html, login.js      # Halaman login
  profile.html, profile.js  # Dashboard Guru dan Siswa
```

## Catatan database

Aplikasi memakai `backend/database/users.json` agar mudah dijalankan tanpa instalasi MySQL. Jika ingin memakai MySQL, gunakan struktur tabel pada `backend/database/schema.sql`, lalu ganti implementasi repository di `backend/database/users.js` dengan query MySQL.
