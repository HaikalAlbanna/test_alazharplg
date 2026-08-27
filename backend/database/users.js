const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataFile = path.join(__dirname, 'users.json');

// Membaca dan menulis data JSON yang berperan sebagai tabel users sederhana.
function read() {
  if (!fs.existsSync(dataFile)) return { lastId: 0, users: [] };
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function save(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

async function initialize() {
  // Membuat tiga akun demo hanya saat file database belum tersedia.
  if (fs.existsSync(dataFile)) return;
  const defaults = [
    { name: 'Administrator', username: 'admin', password: 'admin123', role: 'admin' },
    { name: 'Budi Santoso', username: 'guru', password: 'guru123', role: 'guru' },
    { name: 'Siti Aisyah', username: 'siswa', password: 'siswa123', role: 'siswa' }
  ];
  const users = await Promise.all(defaults.map(async (user, index) => ({
    id: index + 1,
    name: user.name,
    username: user.username,
    password: await bcrypt.hash(user.password, 10),
    role: user.role
  })));
  save({ lastId: users.length, users });
}

function withoutPassword(user) {
  // Password hash tidak boleh pernah dikirim ke response API.
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function findByUsername(username) {
  return read().users.find((user) => user.username === username);
}

function findById(id) {
  return read().users.find((user) => user.id === Number(id));
}

function listByRole(role) {
  return read().users.filter((user) => user.role === role).map(withoutPassword);
}

function countByRole(role) {
  return read().users.filter((user) => user.role === role).length;
}

async function create({ name, username, password, role }) {
  // Validasi username unik lalu hash password sebelum menyimpan user baru.
  const data = read();
  if (data.users.some((user) => user.username === username)) {
    const error = new Error('Username sudah digunakan.');
    error.code = 'DUPLICATE_USERNAME';
    throw error;
  }
  const user = {
    id: data.lastId + 1,
    name,
    username,
    password: await bcrypt.hash(password, 10),
    role
  };
  data.lastId = user.id;
  data.users.push(user);
  save(data);
  return withoutPassword(user);
}

async function update(id, { name, username, password }) {
  // Password hanya di-hash ulang ketika Admin mengisi password baru.
  const data = read();
  const user = data.users.find((item) => item.id === Number(id));
  if (!user) return null;
  if (data.users.some((item) => item.username === username && item.id !== user.id)) {
    const error = new Error('Username sudah digunakan.');
    error.code = 'DUPLICATE_USERNAME';
    throw error;
  }
  user.name = name;
  user.username = username;
  if (password) user.password = await bcrypt.hash(password, 10);
  save(data);
  return withoutPassword(user);
}

function remove(id) {
  // Menghapus satu akun yang sudah ditemukan berdasarkan id.
  const data = read();
  const index = data.users.findIndex((user) => user.id === Number(id));
  if (index < 0) return null;
  const [user] = data.users.splice(index, 1);
  save(data);
  return withoutPassword(user);
}

module.exports = { initialize, withoutPassword, findByUsername, findById, listByRole, countByRole, create, update, remove };
