const jwt = require('jsonwebtoken');
const users = require('../database/users');

const secret = process.env.JWT_SECRET || 'development-secret-ganti-di-production';

// Memeriksa JWT pada cookie dan menambahkan data user ke object request.
function authenticate(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
  try {
    const payload = jwt.verify(token, secret);
    const user = users.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Sesi tidak valid.' });
    req.user = users.withoutPassword(user);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sesi telah berakhir. Silakan login kembali.' });
  }
}

function allowRoles(...roles) {
  // Menolak request API jika role user tidak termasuk daftar yang diizinkan.
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '403 / Tidak memiliki akses.' });
    }
    next();
  };
}

function pageGuard(...roles) {
  // Mengarahkan tamu ke login atau menampilkan 403 untuk halaman yang bukan haknya.
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
      const payload = jwt.verify(token, secret);
      const user = users.findById(payload.id);
      if (!user) return res.redirect('/login');
      if (!roles.includes(user.role)) return res.status(403).sendFile(require('path').join(__dirname, '../../public/403.html'));
      next();
    } catch (error) {
      return res.redirect('/login');
    }
  };
}

module.exports = { authenticate, allowRoles, pageGuard, secret };
