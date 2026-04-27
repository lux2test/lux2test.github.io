function getSession() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.sessionKey);
    if (!raw) return null;
    const session = JSON.parse(raw);

    if (!session.expiresAt || Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch (_error) {
    clearSession();
    return null;
  }
}

function setSession(userData) {
  const payload = {
    ...userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + APP_CONFIG.sessionTTLms
  };
  localStorage.setItem(APP_CONFIG.sessionKey, JSON.stringify(payload));
}

function clearSession() {
  localStorage.removeItem(APP_CONFIG.sessionKey);
}

async function apiGet(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`${APP_CONFIG.scriptUrl}?${query.toString()}`);
  return response.json();
}

async function apiPostNoCors(action, data = {}, verificationAction = 'verifySession') {
  const formData = new FormData();
  formData.append('action', action);

  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  await fetch(APP_CONFIG.scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  });

  return apiGet(verificationAction, data);
}

async function bootstrapUsuariosSheet() {
  return apiGet('init');
}

async function loginUser(usuario, contrasena) {
  return apiGet('login', { usuario, contrasena });
}

function readDashboardFilters() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.dashboardFiltersKey);
    if (!raw) return { clientes: [], meses: [] };
    const parsed = JSON.parse(raw);
    const clientes = Array.isArray(parsed.clientes)
      ? parsed.clientes.map((v) => v.toString())
      : parsed.cliente
        ? [parsed.cliente.toString()]
        : [];
    const meses = Array.isArray(parsed.meses)
      ? parsed.meses.map((v) => v.toString())
      : parsed.mes
        ? [parsed.mes.toString()]
        : [];
    return {
      clientes,
      meses
    };
  } catch (_e) {
    return { clientes: [], meses: [] };
  }
}

function writeDashboardFilters(filters) {
  const payload = {
    clientes: Array.isArray(filters.clientes) ? filters.clientes.map((v) => v.toString()) : [],
    meses: Array.isArray(filters.meses) ? filters.meses.map((v) => v.toString()) : []
  };
  localStorage.setItem(APP_CONFIG.dashboardFiltersKey, JSON.stringify(payload));
}

function broadcastDashboardFilters(targetWindow) {
  if (!targetWindow || typeof targetWindow.postMessage !== 'function') return;
  targetWindow.postMessage(
    {
      type: APP_CONFIG.filterMessageType,
      payload: readDashboardFilters()
    },
    '*'
  );
}

async function fetchPlanillasMeta() {
  return apiGet('planillasMeta');
}

async function fetchKpiIndiceRotacion(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiIndiceRotacion', params);
}

async function fetchKpiIndiceAusentismo(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiIndiceAusentismo', params);
}

async function fetchKpiIndiceServiciosNoCubiertos(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiIndiceServiciosNoCubiertos', params);
}

async function fetchKpiSatisfaccionCliente(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiSatisfaccionCliente', params);
}

async function fetchKpiComportamientoServicio(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiComportamientoServicio', params);
}

async function fetchDetalleComportamientoServicio(metric, filters) {
  const params = { metric };
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('detalleComportamientoServicio', params);
}

async function fetchKpiAsignacionFamiliar(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiAsignacionFamiliar', params);
}

async function fetchKpiDepreciacionUniformes(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiDepreciacionUniformes', params);
}

async function fetchKpiLicenciasDescansosMedicos(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiLicenciasDescansosMedicos', params);
}

async function fetchKpiGastosAdicionales(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiGastosAdicionales', params);
}

async function fetchKpiRemuneracionNeta(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiRemuneracionNeta', params);
}

async function fetchKpiProvisionesEssalud(filters) {
  const params = {};
  if (filters.clientes?.length) params.cliente = filters.clientes.join(',');
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiProvisionesEssalud', params);
}

async function fetchKpiFactorHumanoClientes(filters) {
  const params = {};
  if (filters.meses?.length) params.mes = filters.meses.join(',');
  return apiGet('kpiFactorHumanoClientes', params);
}
