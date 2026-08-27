// Menentukan tampilan Admin aktif dari URL: dashboard, kelola guru, atau kelola siswa.
const currentPage = location.pathname.split('/').pop();
const view = currentPage === 'guru' ? 'guru' : currentPage === 'siswa' ? 'siswa' : 'dashboard';
const labels = { guru: 'Guru', siswa: 'Siswa' };
const $ = (id) => document.getElementById(id);
let chart;

async function api(url, options) {
  // Helper API: menangani sesi habis dan akses yang ditolak secara konsisten.
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) location.href = '/login';
  if (response.status === 403) location.href = '/403';
  return { response, data };
}

function createChart(guru, siswa) {
  // Membuat ulang grafik batang dari jumlah pengguna terbaru.
  if (chart) chart.destroy();
  chart = new Chart($('userChart'), {
    type: 'bar',
    data: { labels: ['Guru', 'Siswa'], datasets: [{ label: 'Jumlah Pengguna', data: [guru, siswa], backgroundColor: ['#4e73df', '#1cc88a'], borderColor: ['#4e73df', '#1cc88a'], borderWidth: 1 }] },
    options: { maintainAspectRatio: false, legend: { display: false }, scales: { yAxes: [{ ticks: { beginAtZero: true, precision: 0 } }], xAxes: [{ gridLines: { display: false } }] } }
  });
}

async function loadDashboard() {
  // Mengisi kartu statistik dan grafik pada dashboard Admin.
  const { data } = await api('/api/admin/stats');
  $('guru-count').textContent = data.guru;
  $('siswa-count').textContent = data.siswa;
  createChart(data.guru, data.siswa);
}

async function loadUsers() {
  // Memuat tabel user berdasarkan role yang sedang dikelola.
  const { data } = await api(`/api/admin/users?role=${view}`);
  $('users-body').innerHTML = (data.users || []).map((user) => `<tr><td>${user.id}</td><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.username)}</td><td><button class="btn btn-sm btn-info mr-1" data-id="${user.id}" data-name="${encodeURIComponent(user.name)}" data-username="${encodeURIComponent(user.username)}" onclick="editUser(this)"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> Hapus</button></td></tr>`).join('') || '<tr><td colspan="4" class="text-center text-muted">Belum ada data.</td></tr>';
}

function escapeHtml(value) { const element = document.createElement('div'); element.textContent = value; return element.innerHTML; }
function openModal(user) {
  // Menyiapkan modal yang sama untuk tambah akun maupun edit akun.
  $('user-id').value = user?.id || '';
  $('user-role').value = view;
  $('name').value = user?.name || '';
  $('user-username').value = user?.username || '';
  $('user-password').value = '';
  $('user-password').required = !user;
  $('password-note').textContent = user ? '(kosongkan jika tidak diubah)' : '';
  $('form-title').textContent = user ? `Edit ${labels[view]}` : `Tambah ${labels[view]}`;
  $('form-message').textContent = '';
  // `$` adalah helper getElementById di file ini; gunakan jQuery eksplisit untuk modal Bootstrap.
  window.jQuery('#userModal').modal('show');
}

window.editUser = (button) => openModal({ id: button.dataset.id, name: decodeURIComponent(button.dataset.name), username: decodeURIComponent(button.dataset.username) });
window.deleteUser = async (id) => {
  // Meminta konfirmasi sebelum menghapus akun melalui API.
  if (!confirm('Hapus akun ini?')) return;
  const { response, data } = await api(`/api/admin/users/${id}`, { method: 'DELETE' });
  if (!response.ok) return alert(data.message);
  loadUsers();
};

async function init() {
  // Memastikan hanya Admin yang dapat menginisialisasi halaman ini.
  const me = await api('/api/auth/me');
  if (!me.response.ok) return;
  if (me.data.user.role !== 'admin') return location.href = '/403';
  $('welcome').textContent = me.data.user.name;
  document.querySelector(`[data-nav="${view}"]`).classList.add('active');
  if (view === 'dashboard') return loadDashboard();
  $('dashboard').hidden = true;
  $('users-view').hidden = false;
  $('add-user').hidden = false;
  $('page-title').textContent = `Kelola ${labels[view]}`;
  $('table-title').textContent = `Daftar Akun ${labels[view]}`;
  loadUsers();
}

$('add-user').addEventListener('click', () => openModal());
$('user-form').addEventListener('submit', async (event) => {
  // Menentukan POST untuk tambah atau PUT untuk edit berdasarkan id form.
  event.preventDefault();
  const id = $('user-id').value;
  const body = { name: $('name').value, username: $('user-username').value, password: $('user-password').value, role: $('user-role').value };
  const { response, data } = await api(id ? `/api/admin/users/${id}` : '/api/admin/users', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) return $('form-message').textContent = data.message;
  window.jQuery('#userModal').modal('hide');
  loadUsers();
});
$('logout').addEventListener('click', async (event) => { event.preventDefault(); await api('/api/auth/logout', { method: 'POST' }); location.href = '/login'; });
// Menjalankan pemeriksaan sesi dan memuat konten saat halaman dibuka.
init();
