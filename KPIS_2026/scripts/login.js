const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const submitBtn = document.getElementById('submitBtn');

function setMessage(text, type = '') {
  loginMessage.textContent = text;
  loginMessage.className = `form-message ${type}`.trim();
}

function ensureConfiguredUrl() {
  if (!APP_CONFIG.scriptUrl || APP_CONFIG.scriptUrl.includes('PEGA_AQUI')) {
    setMessage('Configura primero scripts/config.js con la URL de Apps Script.', 'error');
    return false;
  }
  return true;
}

(async function initLogin() {
  if (getSession()) {
    window.location.href = 'KPIS_2026/pages/main.html';
    return;
  }

  if (!ensureConfiguredUrl()) return;

  try {
    await bootstrapUsuariosSheet();
  } catch (_error) {
    setMessage('No se pudo inicializar la hoja de usuarios.', 'error');
  }
})();

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!ensureConfiguredUrl()) return;

  const formData = new FormData(loginForm);
  const usuario = (formData.get('usuario') || '').toString().trim();
  const contrasena = (formData.get('contrasena') || '').toString().trim();

  if (!usuario || !contrasena) {
    setMessage('Completa usuario y contraseña.', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    setMessage('Validando acceso...');

    const result = await loginUser(usuario, contrasena);

    if (result.status !== 'success') {
      setMessage(result.message || 'Credenciales inválidas.', 'error');
      return;
    }

    setSession(result.data);
    setMessage('Acceso correcto. Redirigiendo...', 'success');
    window.setTimeout(() => {
      window.location.href = 'main.html';
    }, 450);
  } catch (_error) {
    setMessage('Error de conexión con el servidor.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});
