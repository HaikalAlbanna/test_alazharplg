// Mengirim kredensial ke API lalu mengarahkan user sesuai role setelah berhasil login.
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('message');
  message.textContent = '';
  const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.value, password: password.value }) });
  const data = await response.json();
  if (!response.ok) return message.textContent = data.message;
  location.href = data.redirect;
});
