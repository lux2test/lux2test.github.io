const asigPie = document.getElementById('asigPie');
const cAsigPctEl = document.getElementById('cAsigPct');
const sAsigPctEl = document.getElementById('sAsigPct');
const asigMetaEl = document.getElementById('asigMeta');
const asigStatusEl = document.getElementById('asigStatus');
const depreValueEl = document.getElementById('depreValue');
const depreMetaEl = document.getElementById('depreMeta');
const depreStatusEl = document.getElementById('depreStatus');
const depreCardEl = document.getElementById('depreCard');
const depreDetailModalEl = document.getElementById('depreDetailModal');
const depreDetailCloseEl = document.getElementById('depreDetailClose');
const depreDetailMetaEl = document.getElementById('depreDetailMeta');
const depreDetailBodyEl = document.getElementById('depreDetailBody');
const licGoceValueEl = document.getElementById('licGoceValue');
const licGoceMetaEl = document.getElementById('licGoceMeta');
const licGoceStatusEl = document.getElementById('licGoceStatus');
const descMedValueEl = document.getElementById('descMedValue');
const descMedMetaEl = document.getElementById('descMedMeta');
const descMedStatusEl = document.getElementById('descMedStatus');
const descMedAlertListEl = document.getElementById('descMedAlertList');
const recFaltosValueEl = document.getElementById('recFaltosValue');
const recFaltosStatusEl = document.getElementById('recFaltosStatus');
const gastosAdCardEl = document.getElementById('gastosAdCard');
const gastosAdValueEl = document.getElementById('gastosAdValue');
const gastosAdMetaEl = document.getElementById('gastosAdMeta');
const gastosAdStatusEl = document.getElementById('gastosAdStatus');
const gastosDetailModalEl = document.getElementById('gastosDetailModal');
const gastosDetailCloseEl = document.getElementById('gastosDetailClose');
const gastosDetailMetaEl = document.getElementById('gastosDetailMeta');
const gastosDetailBodyEl = document.getElementById('gastosDetailBody');
let currentDepreDetalles = [];
let currentGastosDetalles = [];

function isScriptConfigured() {
  return Boolean(APP_CONFIG.scriptUrl && !APP_CONFIG.scriptUrl.includes('PEGA_AQUI'));
}

function formatPct(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(1)}%`;
}

function setPie(cPct, sPct) {
  const c = Math.max(0, Math.min(100, cPct || 0));
  const split = (c / 100) * 360;
  asigPie.style.background = `conic-gradient(#dc2626 0deg, #dc2626 ${split}deg, #16a34a ${split}deg, #16a34a 360deg)`;
}

function formatMoney(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
    return 'S/ --';
  }
  return `S/ ${value.toFixed(2)}`;
}

function openDepreModal() {
  depreDetailModalEl.classList.add('is-open');
  depreDetailModalEl.setAttribute('aria-hidden', 'false');
}

function closeDepreModal() {
  depreDetailModalEl.classList.remove('is-open');
  depreDetailModalEl.setAttribute('aria-hidden', 'true');
}

function renderDepreDetailRows(rows) {
  depreDetailBodyEl.innerHTML = '';
  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5">Sin registros para los filtros seleccionados.</td>';
    depreDetailBodyEl.appendChild(tr);
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.documento || '-'}</td><td>${row.nombre || '-'}</td><td>${row.dias ?? 0}</td><td>${row.diasImpacto ?? 0}</td><td>${formatMoney(row.monto || 0)}</td>`;
    depreDetailBodyEl.appendChild(tr);
  });
}

async function loadAsignacionFamiliar() {
  if (!isScriptConfigured()) {
    asigStatusEl.textContent = 'Configura la URL del script.';
    return;
  }

  asigStatusEl.textContent = '';
  cAsigPctEl.textContent = '--';
  sAsigPctEl.textContent = '--';
  setPie(50, 50);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiAsignacionFamiliar(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al cargar indicador');
    }

    const d = res.data || {};
    const cPct = Number(d.cAsigPct || 0);
    const sPct = Number(d.sAsigPct || 0);
    cAsigPctEl.textContent = formatPct(cPct);
    sAsigPctEl.textContent = formatPct(sPct);
    setPie(cPct, sPct);

  } catch (err) {
    asigStatusEl.textContent = err.message || 'No se pudo cargar.';
    setPie(50, 50);
  }
}

async function loadDepreciacionUniformes() {
  if (!isScriptConfigured()) {
    depreStatusEl.textContent = 'Configura la URL del script.';
    return;
  }

  depreStatusEl.textContent = '';
  depreValueEl.textContent = 'S/ --';
  depreMetaEl.textContent = '--';

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiDepreciacionUniformes(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al cargar indicador');
    }
    const d = res.data || {};
    currentDepreDetalles = Array.isArray(d.detalles) ? d.detalles : [];
    depreValueEl.textContent = formatMoney(d.total);
    depreMetaEl.textContent = `Cantidad: ${d.personas ?? 0}`;
  } catch (err) {
    depreStatusEl.textContent = err.message || 'No se pudo cargar.';
    depreMetaEl.textContent = '--';
    currentDepreDetalles = [];
  }
}

function openDepreDetailModalWithCurrentData() {
  const filters = readDashboardFilters();
  const clientesTxt = filters.clientes?.length ? filters.clientes.join(', ') : 'Todos los clientes';
  const mesesTxt = filters.meses?.length ? filters.meses.join(', ') : 'Todos los meses';
  const filtroTxt = `${clientesTxt} · ${mesesTxt}`;
  depreDetailMetaEl.textContent = `Filtros: ${filtroTxt} · Registros: ${currentDepreDetalles.length}`;
  renderDepreDetailRows(currentDepreDetalles);
  openDepreModal();
}

function renderDescMedAlertas(alertas) {
  descMedAlertListEl.innerHTML = '';
  if (!alertas || alertas.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Sin personas con más de 21 días.';
    descMedAlertListEl.appendChild(li);
    return;
  }
  alertas.forEach((item) => {
    const li = document.createElement('li');
    const mesLabel = item.mesLabel || item.mes || '-';
    li.textContent = `${item.nombre || 'Sin nombre'} (${item.dias} días, ${mesLabel})`;
    descMedAlertListEl.appendChild(li);
  });
}

async function loadLicenciasDescansosMedicos() {
  if (!isScriptConfigured()) {
    licGoceStatusEl.textContent = 'Configura la URL del script.';
    descMedStatusEl.textContent = 'Configura la URL del script.';
    return;
  }

  licGoceStatusEl.textContent = '';
  descMedStatusEl.textContent = '';
  recFaltosStatusEl.textContent = '';
  gastosAdStatusEl.textContent = '';
  licGoceValueEl.textContent = 'S/ --';
  descMedValueEl.textContent = 'S/ --';
  recFaltosValueEl.textContent = 'S/ --';
  gastosAdValueEl.textContent = 'S/ --';
  licGoceMetaEl.textContent = '--';
  descMedMetaEl.textContent = '--';
  gastosAdMetaEl.textContent = '--';
  descMedAlertListEl.innerHTML = '';

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiLicenciasDescansosMedicos(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al cargar indicadores');
    }
    const d = res.data || {};
    licGoceValueEl.textContent = formatMoney(d.licenciaConGocePagado || 0);
    descMedValueEl.textContent = formatMoney(d.descansosMedicosPagado || 0);
    recFaltosValueEl.textContent = formatMoney(d.recuperacionFaltos || 0);
    licGoceMetaEl.textContent = `Cantidad: ${d.licenciaConGoceCantidad ?? 0}`;
    descMedMetaEl.textContent = `Cantidad: ${d.descansosMedicosCantidad ?? 0}`;
    renderDescMedAlertas(d.alertas || []);
  } catch (err) {
    licGoceStatusEl.textContent = err.message || 'No se pudo cargar.';
    descMedStatusEl.textContent = err.message || 'No se pudo cargar.';
    recFaltosStatusEl.textContent = err.message || 'No se pudo cargar.';
    licGoceMetaEl.textContent = '--';
    descMedMetaEl.textContent = '--';
    descMedAlertListEl.innerHTML = '';
  }
}

function openGastosModal() {
  gastosDetailModalEl.classList.add('is-open');
  gastosDetailModalEl.setAttribute('aria-hidden', 'false');
}

function closeGastosModal() {
  gastosDetailModalEl.classList.remove('is-open');
  gastosDetailModalEl.setAttribute('aria-hidden', 'true');
}

function renderGastosDetailRows(rows) {
  gastosDetailBodyEl.innerHTML = '';
  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4">Sin registros para los filtros seleccionados.</td>';
    gastosDetailBodyEl.appendChild(tr);
    return;
  }
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.cliente || '-'}</td><td>${row.persona || '-'}</td><td>${formatMoney(row.monto || 0)}</td><td>${row.concepto || '-'}</td>`;
    gastosDetailBodyEl.appendChild(tr);
  });
}

function openGastosDetailModalWithCurrentData() {
  const filters = readDashboardFilters();
  const clientesTxt = filters.clientes?.length ? filters.clientes.join(', ') : 'Todos los clientes';
  const mesesTxt = filters.meses?.length ? filters.meses.join(', ') : 'Todos los meses';
  const filtroTxt = `${clientesTxt} · ${mesesTxt}`;
  gastosDetailMetaEl.textContent = `Filtros: ${filtroTxt} · Registros: ${currentGastosDetalles.length}`;
  renderGastosDetailRows(currentGastosDetalles);
  openGastosModal();
}

async function loadGastosAdicionales() {
  if (!isScriptConfigured()) {
    gastosAdStatusEl.textContent = 'Configura la URL del script.';
    return;
  }

  gastosAdStatusEl.textContent = '';
  gastosAdValueEl.textContent = 'S/ --';
  gastosAdMetaEl.textContent = '--';
  currentGastosDetalles = [];

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiGastosAdicionales(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al cargar indicador');
    }
    const d = res.data || {};
    gastosAdValueEl.textContent = formatMoney(d.total || 0);
    gastosAdMetaEl.textContent = `Cantidad: ${d.registros ?? 0}`;
    currentGastosDetalles = Array.isArray(d.detalles) ? d.detalles : [];
  } catch (err) {
    gastosAdStatusEl.textContent = err.message || 'No se pudo cargar.';
    gastosAdMetaEl.textContent = '--';
  }
}

window.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== APP_CONFIG.filterMessageType) return;
  loadAsignacionFamiliar();
  loadDepreciacionUniformes();
  loadLicenciasDescansosMedicos();
  loadGastosAdicionales();
});

depreCardEl.addEventListener('click', openDepreDetailModalWithCurrentData);
depreCardEl.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openDepreDetailModalWithCurrentData();
});

depreDetailModalEl.addEventListener('click', (event) => {
  const target = event.target;
  if (target && target.dataset && target.dataset.closeModal === 'true') {
    closeDepreModal();
  }
});

depreDetailCloseEl.addEventListener('click', closeDepreModal);
gastosAdCardEl.addEventListener('click', openGastosDetailModalWithCurrentData);
gastosAdCardEl.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openGastosDetailModalWithCurrentData();
});

gastosDetailModalEl.addEventListener('click', (event) => {
  const target = event.target;
  if (target && target.dataset && target.dataset.closeGastosModal === 'true') {
    closeGastosModal();
  }
});

gastosDetailCloseEl.addEventListener('click', closeGastosModal);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && depreDetailModalEl.classList.contains('is-open')) {
    closeDepreModal();
  }
  if (event.key === 'Escape' && gastosDetailModalEl.classList.contains('is-open')) {
    closeGastosModal();
  }
});

(function initEconomico() {
  loadAsignacionFamiliar();
  loadDepreciacionUniformes();
  loadLicenciasDescansosMedicos();
  loadGastosAdicionales();
})();
