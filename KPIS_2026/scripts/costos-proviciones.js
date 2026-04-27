const remuNetaValueEl = document.getElementById('remuNetaValue');
const remuCompValueEl = document.getElementById('remuCompValue');
const remuNoCompValueEl = document.getElementById('remuNoCompValue');
const remuCompPctEl = document.getElementById('remuCompPct');
const remuNoCompPctEl = document.getElementById('remuNoCompPct');
const remuPieEl = document.getElementById('remuPie');
const remuStatusEl = document.getElementById('remuStatus');
const provValueEl = document.getElementById('provValue');
const provPctEl = document.getElementById('provPct');
const provRestPctEl = document.getElementById('provRestPct');
const provPieEl = document.getElementById('provPie');
const provStatusEl = document.getElementById('provStatus');
const essaludValueEl = document.getElementById('essaludValue');
const essaludStatusEl = document.getElementById('essaludStatus');
const factorHumanoTotalListEl = document.getElementById('factorHumanoTotalList');
const factorHumanoPromedioListEl = document.getElementById('factorHumanoPromedioList');
const equilibrioLabelEl = document.getElementById('equilibrioLabel');

function isScriptConfigured() {
  return Boolean(APP_CONFIG.scriptUrl && !APP_CONFIG.scriptUrl.includes('PEGA_AQUI'));
}

function formatMoney(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
    return 'S/ --';
  }
  return `S/ ${value.toFixed(2)}`;
}

function formatPct(value) {
  if (value === null || typeof value === 'undefined' || Number.isNaN(value)) {
    return '--';
  }
  return `${value.toFixed(1)}%`;
}

function setPie(compPct) {
  const c = Math.max(0, Math.min(100, compPct || 0));
  const split = (c / 100) * 360;
  remuPieEl.style.background = `conic-gradient(#f97316 0deg, #f97316 ${split}deg, #16a34a ${split}deg, #16a34a 360deg)`;
}

function setProvPie(pct) {
  const c = Math.max(0, Math.min(100, pct || 0));
  const split = (c / 100) * 360;
  provPieEl.style.background = `conic-gradient(#2563eb 0deg, #2563eb ${split}deg, #e5e7eb ${split}deg, #e5e7eb 360deg)`;
}

function renderTotalFactorHumanoBars(clientes) {
  factorHumanoTotalListEl.innerHTML = '';
  if (!clientes || clientes.length === 0) {
    factorHumanoTotalListEl.textContent = 'Sin datos para los filtros seleccionados.';
    return;
  }
  const max = Math.max(...clientes.map((c) => c.costoTotal || 0), 0);
  clientes
    .slice()
    .sort((a, b) => (b.costoTotal || 0) - (a.costoTotal || 0))
    .forEach((item) => {
      const pct = max > 0 ? ((item.costoTotal || 0) / max) * 100 : 0;
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `<div class="bar-label"><span>${item.cliente}</span><strong>${formatMoney(item.costoTotal || 0)}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(2)}%"></div></div>`;
      factorHumanoTotalListEl.appendChild(row);
    });
}

function renderPromedioVsEquilibrio(clientes, equilibrio) {
  factorHumanoPromedioListEl.innerHTML = '';
  equilibrioLabelEl.textContent = `Punto de equilibrio: ${formatMoney(equilibrio || 0)}`;
  if (!clientes || clientes.length === 0) {
    factorHumanoPromedioListEl.textContent = 'Sin datos para los filtros seleccionados.';
    return;
  }

  const maxAbsDiff = Math.max(
    ...clientes.map((c) => Math.abs(c.diferenciaEquilibrio || 0)),
    1
  );

  clientes
    .slice()
    .sort((a, b) => (b.promedioPersona || 0) - (a.promedioPersona || 0))
    .forEach((item) => {
      const diff = item.diferenciaEquilibrio || 0;
      const widthPct = (Math.abs(diff) / maxAbsDiff) * 50;
      const sideClass = diff >= 0 ? 'above' : 'below';
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `<div class="bar-label"><span>${item.cliente}</span><strong>${formatMoney(item.promedioPersona || 0)}</strong></div>
        <div class="avg-track">
          <div class="avg-center-line"></div>
          <div class="avg-bar ${sideClass}" style="width:${widthPct.toFixed(2)}%"></div>
        </div>`;
      factorHumanoPromedioListEl.appendChild(row);
    });
}

async function loadRemuneracionNeta() {
  if (!isScriptConfigured()) {
    remuStatusEl.textContent = 'Configura la URL del script.';
    return;
  }

  remuStatusEl.textContent = '';
  remuNetaValueEl.textContent = 'S/ --';
  remuCompValueEl.textContent = 'S/ --';
  remuNoCompValueEl.textContent = 'S/ --';
  remuCompPctEl.textContent = '--';
  remuNoCompPctEl.textContent = '--';
  setPie(50);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiRemuneracionNeta(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'No se pudo cargar el indicador');
    }
    const d = res.data || {};
    remuNetaValueEl.textContent = formatMoney(d.remuneracionNeta || 0);
    remuCompValueEl.textContent = formatMoney(d.remuneracionComputable || 0);
    remuNoCompValueEl.textContent = formatMoney(d.remuneracionNoComputable || 0);
    remuCompPctEl.textContent = formatPct(d.computablePct || 0);
    remuNoCompPctEl.textContent = formatPct(d.noComputablePct || 0);
    setPie(d.computablePct || 0);
  } catch (err) {
    remuStatusEl.textContent = err.message || 'No se pudo cargar.';
    setPie(50);
  }
}

async function loadProvisionesEssalud() {
  if (!isScriptConfigured()) {
    provStatusEl.textContent = 'Configura la URL del script.';
    essaludStatusEl.textContent = 'Configura la URL del script.';
    return;
  }

  provStatusEl.textContent = '';
  essaludStatusEl.textContent = '';
  provValueEl.textContent = 'S/ --';
  provPctEl.textContent = '--';
  provRestPctEl.textContent = '--';
  essaludValueEl.textContent = 'S/ --';
  setProvPie(50);

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiProvisionesEssalud(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'No se pudo cargar el indicador');
    }
    const d = res.data || {};
    provValueEl.textContent = formatMoney(d.provisiones || 0);
    provPctEl.textContent = formatPct(d.provisionesPct || 0);
    provRestPctEl.textContent = formatPct(d.netaRestPct || 0);
    essaludValueEl.textContent = formatMoney(d.essalud || 0);
    setProvPie(d.provisionesPct || 0);
  } catch (err) {
    provStatusEl.textContent = err.message || 'No se pudo cargar.';
    essaludStatusEl.textContent = err.message || 'No se pudo cargar.';
    setProvPie(50);
  }
}

async function loadFactorHumanoClientes() {
  if (!isScriptConfigured()) {
    factorHumanoTotalListEl.textContent = 'Configura la URL del script.';
    factorHumanoPromedioListEl.textContent = 'Configura la URL del script.';
    return;
  }

  factorHumanoTotalListEl.textContent = 'Cargando...';
  factorHumanoPromedioListEl.textContent = 'Cargando...';
  equilibrioLabelEl.textContent = 'Punto de equilibrio: S/ --';

  try {
    const filters = readDashboardFilters();
    const res = await fetchKpiFactorHumanoClientes(filters);
    if (res.status !== 'success') {
      throw new Error(res.message || 'No se pudo cargar gráfico');
    }
    const d = res.data || {};
    const clientes = d.clientes || [];
    renderTotalFactorHumanoBars(clientes);
    renderPromedioVsEquilibrio(clientes, d.equilibrio || 0);
  } catch (err) {
    factorHumanoTotalListEl.textContent = err.message || 'No se pudo cargar.';
    factorHumanoPromedioListEl.textContent = err.message || 'No se pudo cargar.';
  }
}

window.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== APP_CONFIG.filterMessageType) return;
  loadRemuneracionNeta();
  loadProvisionesEssalud();
  loadFactorHumanoClientes();
});

(function initCostosProviciones() {
  loadRemuneracionNeta();
  loadProvisionesEssalud();
  loadFactorHumanoClientes();
})();
