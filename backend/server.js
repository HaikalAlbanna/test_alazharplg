require('dotenv').config();
// Mengimpor modul inti dan dependensi yang dibutuhkan aplikasi.
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('./database/users');
const { authenticate, allowRoles, pageGuard, secret } = require('./middleware/auth');

const app = express();
// Mengaktifkan pembacaan body JSON, cookie JWT, dan file statis frontend.
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
// Aset bawaan template SB Admin 2 di folder proyek utama.
app.use('/vendor', express.static(path.join(__dirname, '../vendor')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));

const validRoles = ['guru', 'siswa'];
// Membersihkan input sederhana sebelum disimpan atau dicari.
const clean = (value) => String(value || '').trim();
function validateUser(body, isEdit = false) {
  const name = clean(body.name);
  const username = clean(body.username);
  const password = String(body.password || '');
  if (!name || !username || (!isEdit && !password)) return 'Nama, username, dan password wajib diisi.';
  if (name.length > 100 || username.length > 50) return 'Nama atau username terlalu panjang.';
  if (password && password.length < 6) return 'Password minimal 6 karakter.';
  return null;
}

// Memvalidasi kredensial lalu membuat JWT untuk satu sesi pengguna.
app.post('/api/auth/login', async (req, res) => {
  const username = clean(req.body.username);
  const password = String(req.body.password || '');
  const user = users.findByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Username atau password salah.' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '8h' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 });
  return res.json({ user: users.withoutPassword(user), redirect: `/${user.role}/dashboard` });
});

// Mengakhiri sesi dengan menghapus cookie token.
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout berhasil.' });
});

// Endpoint profil pengguna yang sedang login.
app.get('/api/auth/me', authenticate, (req, res) => res.json({ user: req.user }));
// Endpoint statistik dan CRUD berikut hanya tersedia bagi Admin.
app.get('/api/admin/stats', authenticate, allowRoles('admin'), (req, res) => {
  res.json({ guru: users.countByRole('guru'), siswa: users.countByRole('siswa') });
});
app.get('/api/admin/users', authenticate, allowRoles('admin'), (req, res) => {
  const role = clean(req.query.role);
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Role tidak valid.' });
  res.json({ users: users.listByRole(role) });
});
app.post('/api/admin/users', authenticate, allowRoles('admin'), async (req, res) => {
  const role = clean(req.body.role);
  const error = validateUser(req.body);
  if (error || !validRoles.includes(role)) return res.status(400).json({ message: error || 'Role hanya boleh guru atau siswa.' });
  try {
    const user = await users.create({ name: clean(req.body.name), username: clean(req.body.username), password: req.body.password, role });
    res.status(201).json({ user, message: 'Akun berhasil dibuat.' });
  } catch (err) {
    res.status(err.code === 'DUPLICATE_USERNAME' ? 409 : 500).json({ message: err.message || 'Gagal membuat akun.' });
  }
});
app.put('/api/admin/users/:id', authenticate, allowRoles('admin'), async (req, res) => {
  const existing = users.findById(req.params.id);
  if (!existing || !validRoles.includes(existing.role)) return res.status(404).json({ message: 'Akun tidak ditemukan.' });
  const error = validateUser(req.body, true);
  if (error) return res.status(400).json({ message: error });
  try {
    const user = await users.update(req.params.id, { name: clean(req.body.name), username: clean(req.body.username), password: req.body.password });
    res.json({ user, message: 'Akun berhasil diperbarui.' });
  } catch (err) {
    res.status(err.code === 'DUPLICATE_USERNAME' ? 409 : 500).json({ message: err.message || 'Gagal memperbarui akun.' });
  }
});
app.delete('/api/admin/users/:id', authenticate, allowRoles('admin'), (req, res) => {
  const existing = users.findById(req.params.id);
  if (!existing || !validRoles.includes(existing.role)) return res.status(404).json({ message: 'Akun tidak ditemukan.' });
  users.remove(req.params.id);
  res.json({ message: 'Akun berhasil dihapus.' });
});

// Route halaman; pageGuard membatasi dashboard sesuai role sebelum HTML dikirim.
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/403', (req, res) => res.status(403).sendFile(path.join(__dirname, '../public/403.html')));
app.get('/admin/dashboard', pageGuard('admin'), (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));
app.get('/admin/guru', pageGuard('admin'), (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));
app.get('/admin/siswa', pageGuard('admin'), (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));
app.get('/guru/dashboard', pageGuard('guru'), (req, res) => res.sendFile(path.join(__dirname, '../public/profile.html')));
app.get('/siswa/dashboard', pageGuard('siswa'), (req, res) => res.sendFile(path.join(__dirname, '../public/profile.html')));
app.get('/', (req, res) => res.redirect('/login'));

async function start() {
  // Memastikan data akun awal tersedia sebelum server menerima request.
  await users.initialize();
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => console.log(`Aplikasi berjalan di http://localhost:${port}`));
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} sedang digunakan. Jalankan dengan port lain, contoh: $env:PORT=3001; npm start`);
      process.exitCode = 1;
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });
}

if (require.main === module) start();
module.exports = { app, start };
