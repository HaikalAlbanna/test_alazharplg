Buatkan aplikasi web sederhana untuk tes coding dengan 3 role pengguna:

1. Admin
2. Guru
3. Siswa

## Ketentuan Sistem

* Semua user menggunakan **1 halaman login yang sama**.
* Tidak ada registrasi publik.
* Akun Guru dan Siswa dibuat oleh Admin.
* Admin dapat menambahkan, mengedit, dan menghapus akun Guru dan Siswa.
* Setelah login, user diarahkan ke dashboard sesuai role.
* Setiap role hanya dapat mengakses halaman dan fitur sesuai rolenya.
* Guru tidak boleh mengakses halaman Admin.
* Siswa tidak boleh mengakses halaman Admin maupun Guru.
* Jika user mencoba mengakses halaman yang bukan haknya, tampilkan pesan **403 / Tidak memiliki akses**.
* User yang belum login tidak dapat membuka dashboard dan harus diarahkan ke halaman Login.
* Password harus disimpan secara aman menggunakan hashing.

## Fitur Admin

Dashboard Admin berisi:

* Jumlah Guru
* Jumlah Siswa
* Kelola Guru
* Kelola Siswa
* Tambah akun Guru
* Tambah akun Siswa
* Edit akun
* Hapus akun
* Logout

## Fitur Guru

Dashboard Guru sederhana berisi:

* Nama Guru
* Profil
* Menu Dashboard
* Logout

## Fitur Siswa

Dashboard Siswa sederhana berisi:

* Nama Siswa
* Profil
* Menu Dashboard
* Logout

## Database

Gunakan database sederhana dengan tabel:

### users

* id
* name
* username
* password
* role

Role hanya boleh:

* admin
* guru
* siswa

Jika diperlukan, data Guru dan Siswa boleh disimpan dalam tabel terpisah, tetapi jangan membuat struktur database terlalu kompleks.

## Halaman

Buat halaman:

* Login
* Dashboard Admin
* Dashboard Guru
* Dashboard Siswa
* Kelola Guru
* Kelola Siswa
* Form Tambah/Edit User
* 403 Forbidden

## Alur Login

Contoh:

Admin login → `/admin/dashboard`

Guru login → `/guru/dashboard`

Siswa login → `/siswa/dashboard`

## Testing yang wajib berhasil

1. Admin dapat login.
2. Guru dapat login.
3. Siswa dapat login.
4. Admin dapat membuat akun Guru.
5. Admin dapat membuat akun Siswa.
6. Guru tidak dapat membuka Dashboard Admin.
7. Siswa tidak dapat membuka Dashboard Admin.
8. Siswa tidak dapat membuka Dashboard Guru.
9. User yang belum login diarahkan ke Login.
10. Logout berhasil mengakhiri session/login.

## Teknologi

Gunakan teknologi yang sederhana dan mudah dikembangkan.

Jika menggunakan:

* Frontend: React + Vite + Tailwind CSS
* Backend: Node.js + Express
* Database: MySQL
* Authentication: JWT
* Password hashing: bcrypt

Buat kode dengan struktur sederhana, tidak over-engineering, karena aplikasi ini dibuat untuk **tes coding**, bukan aplikasi production.

Prioritaskan agar fitur utama berjalan dengan baik daripada membuat banyak fitur tambahan.

Mulai dari:

1. Setup project
2. Database
3. Login
4. Authentication
5. Role authorization
6. Dashboard masing-masing role
7. CRUD Guru dan Siswa
8. Testing akses setiap role
