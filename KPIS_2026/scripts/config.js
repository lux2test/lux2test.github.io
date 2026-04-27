const APP_CONFIG = {
  // Reemplaza con la URL de deploy de tu Apps Script
  scriptUrl: 'https://script.google.com/macros/s/AKfycbx_M2J_Eg8ybR-MXTZ6dBrsE3tAwJpwsG8R2nYq9ZI5Niw7S7eQ4IN2_smWoTCQ-tjF/exec',
  sessionKey: 'kpis2026_session',
  sessionTTLms: 8 * 60 * 60 * 1000,
  /** Filtros globales del dashboard (Cliente + Mes); los reutilizan todos los KPIs. */
  dashboardFiltersKey: 'kpis2026_dashboard_filters',
  /** Mensaje entre main e iframe para refrescar KPIs al cambiar filtros. */
  filterMessageType: 'KPIS_DASHBOARD_FILTERS'
};
