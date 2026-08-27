# Portal Sekolah

Jalankan aplikasi dari folder ini:

```bash
npm start
```

Buka `http://localhost:3000/login`. Jika port tersebut sudah dipakai, gunakan PowerShell ` $env:PORT=3123; npm start `.

Akun awal:

- Admin: `admin` / `admin123`
- Guru: `guru` / `guru123`
- Siswa: `siswa` / `siswa123`

Data disimpan pada `database/users.json` agar aplikasi langsung dapat dipakai untuk tes coding. Password di file tersebut sudah di-hash dengan bcrypt. Untuk pindah ke MySQL, gunakan struktur tabel pada `database/schema.sql` dan sesuaikan repository `database/users.js`.
