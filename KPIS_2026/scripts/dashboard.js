const rotValueEl = document.getElementById('kpiRotacionValue');
const rotCountEl = document.getElementById('kpiRotacionCount');
const rotStatusEl = document.getElementById('kpiRotacionStatus');
const rotRingEl = document.getElementById('kpiRotacionRing');
const ausValueEl = document.getElementById('kpiAusentismoValue');
const ausCountEl = document.getElementById('kpiAusentismoCount');
const ausStatusEl = document.getElementById('kpiAusentismoStatus');
const ausRingEl = document.getElementById('kpiAusentismoRing');
const srvValueEl = document.getElementById('kpiServiciosValue');
const srvCountEl = document.getElementById('kpiServiciosCount');
const srvStatusEl = document.getElementById('kpiServiciosStatus');
const srvRingEl = document.getElementById('kpiServiciosRing');
const satValueEl = document.getElementById('kpiSatisfaccionValue');
const satStarsFillEl = document.getElementById('kpiSatisfaccionStarsFill');
const satCountEl = document.getElementById('kpiSatisfaccionCount');
const satStatusEl = document.getElementById('kpiSatisfaccionStatus');
const svcDescansoTrabEl = document.getElementById('svcDescansoTrab');
const svcFeriadoTrabEl = document.getElementById('svcFeriadoTrab');
const svcPermisoSinGoceEl = document.getElementById('svcPermisoSinGoce');
const svcLicenciaConGoceEl = document.getElementById('svcLicenciaConGoce');
const svcSuspensionesEl = document.getElementById('svcSuspensiones');
const svcVacacionesEl = document.getElementById('svcVacaciones');
const svcNoProgramadosEl = document.getElementById('svcNoProgramados');
const serviceCards = document.querySelectorAll('.service-card.is-clickable');
const detailModalEl = document.getElementById('detailModal');
const detailModalCloseEl = document.getElementById('detailModalClose');
const detailModalTitleEl = document.getElementById('detailModalTitle');
const detailModalMetaEl = document.getElementById('detailModalMeta');
const detailModalBodyEl = document.getElementById('detailModalBody');

const RING_LEN = 100;

function isScriptConfigured() {
  return Boolean(APP_CONFIG.scriptUrl && !APP_CONFIG.scriptUrl.includes('PEGA_AQUI'));
}

function setRingProgress(pct) {
  setRingProgressTo(rotRingEl, pct);
}

function setRingProgressTo(ringEl, pct) {
  if (!ringEl) return;
  if (pct === null || typeof pct === 'undefined' || Number.isNaN(pct)) {
    ringEl.setAttribute('stroke-dashoffset', String(RING_LEN));
    return;
  }
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = RING_LEN - clamped;
  ringEl.setAttribute('stroke-dashoffset', String(offset));
}

function setStatus(text, variant) {
  setStatusTo(rotStatusEl, text, variant);
}

function setStatusTo(statusEl, text, variant) {
  statusEl.textContent = text || '';
  statusEl.className = 'kpi-status';
  if (variant === 'loading') statusEl.classList.add('is-loading');
  if (variant === 'error') statusEl.classList.add('is-error');
}

function formatPctDisplay(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(1)}%`;
}

function formatSatDisplay(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
    return '--';
  }
  return value.toFixed(1);
}

function setStarsFromScore(score) {
  if (!satStarsFillEl) return;
  if (score === null || typeof score === 'undefined' || Number.isNaN(score)) {
    satStarsFillEl.style.width = '0%';
    return;
  }
  const clamped = Math.max(0, Math.min(5, score));
  const roundedHalf = Math.round(clamped * 2) / 2;
  satStarsFillEl.style.width = `${(roundedHalf / 5) * 100}%`;
}

function setServiceBlockLoading() {
  const els = [
    svcDescansoTrabEl,
    svcFeriadoTrabEl,
    svcPermisoSinGoceEl,
    svcLicenciaConGoceEl,
    svcSuspensionesEl,
    svcVacacionesEl,
    svcNoProgramadosEl
  ];
  els.forEach((el) => {
    if (el) el.textContent = '--';
  });
}

function openDetailModal() {
  detailModalEl.classList.add('is-open');
  detailModalEl.setAttribute('aria-hidden', 'false');
}

function closeDetailModal() {
  detailModalEl.classList.remove('is-open');
  detailModalEl.setAttribute('aria-hidden', 'true');
}

function setDetailRows(rows) {
  detailModalBodyEl.innerHTML = '';
  if (!rows || rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4">Sin registros para los filtros seleccionados.</td>';
    detailModalBodyEl.appendChild(tr);
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.documento || '-'}</td><td>${row.nombre || '-'}</td><td>${row.mesLabel || row.mes || '-'}</td><td>${row.valor ?? 0}</td>`;
    detailModalBodyEl.appendChild(tr);
  });
}

async function showServiceDetail(metric) {
  detailModalTitleEl.textContent = 'Detalle';
  detailModalMetaEl.textContent = 'Cargando...';
  setDetailRows([]);
  openDetailModal();

  try {
    const filters = readDashboardFilters();
    const res = await fetchDetalleComportamientoServicio(metric, filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'No se pudo obtener detalle');
    }
    const data = res.data || {};
    detailModalTitleEl.textContent = data.label || 'Detalle';
    detailModalMetaEl.textContent = `Registros: ${data.registros ?? 0} · Total: ${data.total ?? 0}`;
    setDetailRows(data.detalles || []);
  } catch (err) {
    detailModalMetaEl.textContent = err.message || 'Error al cargar detalle.';
    setDetailRows([]);
  }
}

async function loadIndiceRotacion() {
  if (!isScriptConfigured()) {
    setStatus('Configura la URL del script.', 'error');
    rotValueEl.textContent = '--';
    rotCountEl.textContent = 'Bajas: --';
    setRingProgress(null);
    return;
  }

  setStatus('Cargando…', 'loading');
  rotValueEl.textContent = '--';
  rotCountEl.textContent = 'Bajas: --';
  setRingProgress(0);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiIndiceRotacion(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al obtener el indicador');
    }

    const d = res.data;
    const pct = d.indicePct;

    if (d.total === 0 || pct === null) {
      rotValueEl.textContent = '--';
      rotCountEl.textContent = `Bajas: ${d.bajas ?? 0}`;
      setRingProgress(0);
      setStatus('', '');
    } else {
      rotValueEl.textContent = formatPctDisplay(pct);
      rotCountEl.textContent = `Bajas: ${d.bajas}`;
      setRingProgress(pct);
      setStatus('', '');
    }
  } catch (err) {
    rotValueEl.textContent = '--';
    rotCountEl.textContent = 'Bajas: --';
    setRingProgress(null);
    setStatus(err.message || 'No se pudo cargar.', 'error');
  }
}

async function loadIndiceAusentismo() {
  if (!isScriptConfigured()) {
    setStatusTo(ausStatusEl, 'Configura la URL del script.', 'error');
    ausValueEl.textContent = '--';
    ausCountEl.textContent = 'Faltos: --';
    setRingProgressTo(ausRingEl, null);
    return;
  }

  setStatusTo(ausStatusEl, 'Cargando…', 'loading');
  ausValueEl.textContent = '--';
  ausCountEl.textContent = 'Faltos: --';
  setRingProgressTo(ausRingEl, 0);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiIndiceAusentismo(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al obtener el indicador');
    }

    const d = res.data;
    const pct = d.indicePct;

    if (d.base === 0 || pct === null) {
      ausValueEl.textContent = '--';
      ausCountEl.textContent = `Faltos: ${d.faltos ?? 0}`;
      setRingProgressTo(ausRingEl, 0);
      setStatusTo(ausStatusEl, '', '');
    } else {
      ausValueEl.textContent = formatPctDisplay(pct);
      ausCountEl.textContent = `Faltos: ${d.faltos}`;
      setRingProgressTo(ausRingEl, pct);
      setStatusTo(ausStatusEl, '', '');
    }
  } catch (err) {
    ausValueEl.textContent = '--';
    ausCountEl.textContent = 'Faltos: --';
    setRingProgressTo(ausRingEl, null);
    setStatusTo(ausStatusEl, err.message || 'No se pudo cargar.', 'error');
  }
}

async function loadIndiceServiciosNoCubiertos() {
  if (!isScriptConfigured()) {
    setStatusTo(srvStatusEl, 'Configura la URL del script.', 'error');
    srvValueEl.textContent = '--';
    srvCountEl.textContent = 'No cubiertos: --';
    setRingProgressTo(srvRingEl, null);
    return;
  }

  setStatusTo(srvStatusEl, 'Cargando…', 'loading');
  srvValueEl.textContent = '--';
  srvCountEl.textContent = 'No cubiertos: --';
  setRingProgressTo(srvRingEl, 0);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiIndiceServiciosNoCubiertos(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al obtener el indicador');
    }

    const d = res.data;
    const pct = d.indicePct;

    if (d.servicios === 0 || pct === null) {
      srvValueEl.textContent = '--';
      srvCountEl.textContent = `No cubiertos: ${d.noCubiertos ?? 0}`;
      setRingProgressTo(srvRingEl, 0);
      setStatusTo(srvStatusEl, '', '');
    } else {
      srvValueEl.textContent = formatPctDisplay(pct);
      srvCountEl.textContent = `No cubiertos: ${d.noCubiertos}`;
      setRingProgressTo(srvRingEl, pct);
      setStatusTo(srvStatusEl, '', '');
    }
  } catch (err) {
    srvValueEl.textContent = '--';
    srvCountEl.textContent = 'No cubiertos: --';
    setRingProgressTo(srvRingEl, null);
    setStatusTo(srvStatusEl, err.message || 'No se pudo cargar.', 'error');
  }
}

async function loadSatisfaccionCliente() {
  if (!isScriptConfigured()) {
    setStatusTo(satStatusEl, 'Configura la URL del script.', 'error');
    satValueEl.textContent = '--';
    satCountEl.textContent = 'Muestras: --';
    setStarsFromScore(null);
    return;
  }

  setStatusTo(satStatusEl, 'Cargando…', 'loading');
  satValueEl.textContent = '--';
  satCountEl.textContent = 'Muestras: --';
  setStarsFromScore(null);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiSatisfaccionCliente(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al obtener el indicador');
    }

    const d = res.data;
    const score = d.score;

    if (score === null) {
      satValueEl.textContent = '--';
      satCountEl.textContent = `Muestras: ${d.muestras ?? 0}`;
      setStarsFromScore(null);
      setStatusTo(satStatusEl, '', '');
    } else {
      satValueEl.textContent = formatSatDisplay(score);
      satCountEl.textContent = `Muestras: ${d.muestras}`;
      setStarsFromScore(score);
      setStatusTo(satStatusEl, '', '');
    }
  } catch (err) {
    satValueEl.textContent = '--';
    satCountEl.textContent = 'Muestras: --';
    setStarsFromScore(null);
    setStatusTo(satStatusEl, err.message || 'No se pudo cargar.', 'error');
  }
}

async function loadComportamientoServicio() {
  if (!isScriptConfigured()) {
    setServiceBlockLoading();
    return;
  }

  setServiceBlockLoading();

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiComportamientoServicio(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'Error al obtener comportamiento');
    }
    const d = res.data || {};
    svcDescansoTrabEl.textContent = `${d.descansoTrab ?? 0}`;
    svcFeriadoTrabEl.textContent = `${d.feriadoTrab ?? 0}`;
    svcPermisoSinGoceEl.textContent = `${d.permisoSinGoce ?? 0}`;
    svcLicenciaConGoceEl.textContent = `${d.licenciaConGoce ?? 0}`;
    svcSuspensionesEl.textContent = `${d.suspensiones ?? 0}`;
    svcVacacionesEl.textContent = `${d.vacaciones ?? 0}`;
    svcNoProgramadosEl.textContent = `${d.noProgramados ?? 0}`;
  } catch (_err) {
    setServiceBlockLoading();
  }
}

window.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== APP_CONFIG.filterMessageType) return;
  loadIndiceRotacion();
  loadIndiceAusentismo();
  loadIndiceServiciosNoCubiertos();
  loadSatisfaccionCliente();
  loadComportamientoServicio();
});

serviceCards.forEach((card) => {
  card.addEventListener('click', () => {
    const metric = card.dataset.metric;
    if (!metric) return;
    showServiceDetail(metric);
  });
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    const metric = card.dataset.metric;
    if (!metric) return;
    showServiceDetail(metric);
  });
});

detailModalEl.addEventListener('click', (event) => {
  const target = event.target;
  if (target && target.dataset && target.dataset.closeModal === 'true') {
    closeDetailModal();
  }
});

detailModalCloseEl.addEventListener('click', closeDetailModal);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && detailModalEl.classList.contains('is-open')) {
    closeDetailModal();
  }
});

(function initDashboard() {
  rotRingEl.setAttribute('stroke-dasharray', String(RING_LEN));
  rotRingEl.setAttribute('stroke-dashoffset', String(RING_LEN));
  ausRingEl.setAttribute('stroke-dasharray', String(RING_LEN));
  ausRingEl.setAttribute('stroke-dashoffset', String(RING_LEN));
  srvRingEl.setAttribute('stroke-dasharray', String(RING_LEN));
  srvRingEl.setAttribute('stroke-dashoffset', String(RING_LEN));
  loadIndiceRotacion();
  loadIndiceAusentismo();
  loadIndiceServiciosNoCubiertos();
  loadSatisfaccionCliente();
  loadComportamientoServicio();
})();
