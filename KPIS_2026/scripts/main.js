const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const moduleFrame = document.getElementById('moduleFrame');
const menuItems = document.querySelectorAll('.menu-item');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const filterCliente = document.getElementById('filterCliente');
const filterMes = document.getElementById('filterMes');
const moduleTitle = document.getElementById('moduleTitle');
const moduleSubtitle = document.getElementById('moduleSubtitle');
const SELECT_ALL_VALUE = '__ALL__';
const filterState = {
  clientes: [],
  meses: []
};

function isScriptConfigured() {
  return Boolean(APP_CONFIG.scriptUrl && !APP_CONFIG.scriptUrl.includes('PEGA_AQUI'));
}

function persistFiltersAndNotify() {
  writeDashboardFilters({
    clientes: filterState.clientes,
    meses: filterState.meses
  });
  broadcastDashboardFilters(moduleFrame.contentWindow);
}

function summarizeSelection(values, items, allLabel) {
  if (!values || values.length === 0) {
    return allLabel;
  }
  if (values.length === 1) {
    return items.find((item) => item.value === values[0])?.label || allLabel;
  }
  return `${values.length} seleccionados`;
}

function createMultiFilter(rootEl, config) {
  const state = {
    items: [],
    selectedValues: []
  };

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'multi-filter-btn';
  btn.id = config.buttonId;
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = config.allLabel;

  const panel = document.createElement('div');
  panel.className = 'multi-filter-panel';

  rootEl.innerHTML = '';
  rootEl.appendChild(btn);
  rootEl.appendChild(panel);

  function closePanel() {
    rootEl.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  function updateButtonText() {
    btn.textContent = summarizeSelection(state.selectedValues, state.items, config.allLabel);
  }

  function renderOptions() {
    panel.innerHTML = '';

    const allOption = document.createElement('label');
    allOption.className = 'multi-filter-option';
    allOption.innerHTML = `<input type="checkbox" value="${SELECT_ALL_VALUE}" ${state.selectedValues.length === 0 ? 'checked' : ''}> ${config.allLabel}`;
    panel.appendChild(allOption);

    state.items.forEach((item) => {
      const label = document.createElement('label');
      label.className = 'multi-filter-option';
      label.innerHTML = `<input type="checkbox" value="${item.value}" ${state.selectedValues.includes(item.value) ? 'checked' : ''}> ${item.label}`;
      panel.appendChild(label);
    });
    updateButtonText();
  }

  panel.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const value = target.value;

    if (value === SELECT_ALL_VALUE) {
      state.selectedValues = [];
      renderOptions();
      config.onChange([]);
      return;
    }

    const checkedValues = Array.from(panel.querySelectorAll('input[type="checkbox"]'))
      .filter((checkbox) => checkbox.value !== SELECT_ALL_VALUE && checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (checkedValues.length === state.items.length) {
      state.selectedValues = [];
    } else {
      state.selectedValues = checkedValues;
    }
    renderOptions();
    config.onChange(state.selectedValues.slice());
  });

  btn.addEventListener('click', () => {
    const open = rootEl.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', (event) => {
    if (!rootEl.contains(event.target)) {
      closePanel();
    }
  });

  return {
    setOptions(items, selectedValues) {
      state.items = items.slice();
      const available = new Set(state.items.map((item) => item.value));
      const validSelection = (selectedValues || []).filter((value) => available.has(value));
      state.selectedValues =
        validSelection.length === state.items.length ? [] : validSelection;
      renderOptions();
    }
  };
}

function setModuleHeader(item) {
  moduleTitle.textContent = item?.dataset?.title || 'Dashboard';
  moduleSubtitle.textContent = item?.dataset?.subtitle || 'Filtros globales: aplican a todos los indicadores.';
}

(async function initMain() {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  userGreeting.textContent = session.nombres || session.usuario || 'Usuario';

  const saved = readDashboardFilters();
  const clienteFilterUi = createMultiFilter(filterCliente, {
    buttonId: 'filterClienteBtn',
    allLabel: 'Todos los clientes',
    onChange(values) {
      filterState.clientes = values;
      persistFiltersAndNotify();
    }
  });
  const mesFilterUi = createMultiFilter(filterMes, {
    buttonId: 'filterMesBtn',
    allLabel: 'Todos los meses',
    onChange(values) {
      filterState.meses = values;
      persistFiltersAndNotify();
    }
  });

  if (isScriptConfigured()) {
    try {
      const meta = await fetchPlanillasMeta();
      if (meta.status === 'success' && meta.data) {
        const validClientes = (saved.clientes || []).filter((v) =>
          (meta.data.clientes || []).some((c) => c.value === v)
        );
        const validMeses = (saved.meses || []).filter((v) =>
          (meta.data.meses || []).some((m) => m.value === v)
        );
        filterState.clientes = validClientes;
        filterState.meses = validMeses;
        clienteFilterUi.setOptions(meta.data.clientes || [], validClientes);
        mesFilterUi.setOptions(meta.data.meses || [], validMeses);
        writeDashboardFilters({
          clientes: validClientes,
          meses: validMeses
        });
      }
    } catch (_e) {
      filterState.clientes = [];
      filterState.meses = [];
      clienteFilterUi.setOptions([], []);
      mesFilterUi.setOptions([], []);
    }
  } else {
    filterState.clientes = [];
    filterState.meses = [];
    clienteFilterUi.setOptions([], []);
    mesFilterUi.setOptions([], []);
  }

  const defaultPage = document.querySelector('.menu-item.active')?.dataset.page || 'pages/dashboard.html';
  const defaultItem = document.querySelector('.menu-item.active');
  setModuleHeader(defaultItem);
  moduleFrame.src = defaultPage;
})();

moduleFrame.addEventListener('load', () => {
  broadcastDashboardFilters(moduleFrame.contentWindow);
});

toggleSidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    menuItems.forEach((entry) => entry.classList.remove('active'));
    item.classList.add('active');
    setModuleHeader(item);
    moduleFrame.src = item.dataset.page;
  });
});

logoutBtn.addEventListener('click', () => {
  clearSession();
  window.location.href = 'index.html';
});
