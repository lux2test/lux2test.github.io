const SPREADSHEET_ID = '1rZWwN4o66NobKgFN4syEl0fHrjL7FAMYm_Pya8Gu684';
const SHEET_USUARIOS = 'usuarios';
const SHEET_HEADERS = ['usuario', 'contraseña', 'nombres'];
const SHEET_PLANILLAS = 'planillas';
const SHEET_COBERTURA = 'cobertura';
const SHEET_SATISFACCION = 'satisfaccion';
/** Columnas 1-based según hoja planillas (A=1, D=4, J=10, K=11, N=14, BV=74). */
const PLANILLAS_COL_UNIDAD = 1;
const PLANILLAS_COL_ESTADO = 4;
const PLANILLAS_COL_FECHA_INICIO = 5;
const PLANILLAS_COL_FECHA_BAJA = 6;
const PLANILLAS_COL_DIAS_TRAB = 10;
const PLANILLAS_COL_DESCANSOS = 11;
const PLANILLAS_COL_DESCANSOS_TRAB = 12;
const PLANILLAS_COL_FERIADOS_TRAB = 13;
const PLANILLAS_COL_FALTOS = 14;
const PLANILLAS_COL_PERMISO_SIN_GOCE = 15;
const PLANILLAS_COL_LICENCIA_CON_GOCE = 16;
const PLANILLAS_COL_DESCANSO_MEDICO_DIAS = 17;
const PLANILLAS_COL_SUSPENSIONES = 18;
const PLANILLAS_COL_VACACIONES = 19;
const PLANILLAS_COL_NO_PROGRAMADOS = 20;
const PLANILLAS_COL_LICENCIA_CON_GOCE_PAGADO = 29;
const PLANILLAS_COL_DESCANSO_MEDICO_PAGADO = 30;
const PLANILLAS_COL_RECUPERACION_FALTOS = 36;
const PLANILLAS_COL_GASTOS_ADICIONALES = 39;
const PLANILLAS_COL_GASTOS_CONCEPTO = 40;
const PLANILLAS_COL_REMUNERACION_NETA = 42;
const PLANILLAS_COL_REMUNERACION_COMPUTABLE = 43;
const PLANILLAS_COL_REMUNERACION_NO_COMPUTABLE = 44;
const PLANILLAS_COL_PROVISIONES = 48;
const PLANILLAS_COL_ESSALUD = 49;
const PLANILLAS_COL_MES = 74;
const PLANILLAS_COL_PERSONA_1 = 2;
const PLANILLAS_COL_PERSONA_2 = 3;
const PLANILLAS_COL_NOMBRE = 9;
const PLANILLAS_COL_ASIGNACION = 3;
const ESTADOS_BAJA = ['BAJA', 'BAJA2'];
const ESTADOS_ACTIVO = ['ACTIVO'];
const UNIFORME_COSTO = 400;
const UNIFORME_CICLO_DIAS = 180;
const UNIFORME_BLOQUE_DIAS = 30;
const EQUILIBRIO_COSTO_PERSONA = 3433;

function doGet(e) {
  const action = (e.parameter.action || '').trim();

  try {
    if (!action) {
      return jsonResponse({
        status: 'success',
        data: { message: 'API activa' }
      });
    }

    switch (action) {
      case 'init':
        ensureUsuariosSheet_();
        return jsonResponse({
          status: 'success',
          data: { message: 'Inicializacion completada' }
        });

      case 'login':
        return login_(e.parameter);

      case 'verifySession':
        return verifySession_(e.parameter);

      case 'planillasMeta':
        return planillasMeta_(e.parameter);

      case 'kpiIndiceRotacion':
        return kpiIndiceRotacion_(e.parameter);

      case 'kpiIndiceAusentismo':
        return kpiIndiceAusentismo_(e.parameter);

      case 'kpiIndiceServiciosNoCubiertos':
        return kpiIndiceServiciosNoCubiertos_(e.parameter);

      case 'kpiSatisfaccionCliente':
        return kpiSatisfaccionCliente_(e.parameter);

      case 'kpiComportamientoServicio':
        return kpiComportamientoServicio_(e.parameter);

      case 'detalleComportamientoServicio':
        return detalleComportamientoServicio_(e.parameter);

      case 'kpiAsignacionFamiliar':
        return kpiAsignacionFamiliar_(e.parameter);

      case 'kpiDepreciacionUniformes':
        return kpiDepreciacionUniformes_(e.parameter);

      case 'kpiLicenciasDescansosMedicos':
        return kpiLicenciasDescansosMedicos_(e.parameter);

      case 'kpiGastosAdicionales':
        return kpiGastosAdicionales_(e.parameter);

      case 'kpiRemuneracionNeta':
        return kpiRemuneracionNeta_(e.parameter);

      case 'kpiProvisionesEssalud':
        return kpiProvisionesEssalud_(e.parameter);

      case 'kpiFactorHumanoClientes':
        return kpiFactorHumanoClientes_(e.parameter);

      default:
        return jsonResponse({
          status: 'error',
          message: 'Accion no soportada'
        });
    }
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.message || error.toString()
    });
  }
}

function doPost(e) {
  const params = e.parameter || {};
  const action = (params.action || '').trim();

  try {
    switch (action) {
      case 'upsertUsuario':
        ensureUsuariosSheet_();
        return upsertUsuario_(params);

      default:
        return jsonResponse({
          status: 'error',
          message: 'Accion POST no soportada'
        });
    }
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.message || error.toString()
    });
  }
}

function login_(params) {
  ensureUsuariosSheet_();
  const usuario = (params.usuario || '').trim();
  const contrasena = (params.contrasena || '').trim();

  if (!usuario || !contrasena) {
    return jsonResponse({
      status: 'error',
      message: 'Usuario y contraseña son obligatorios'
    });
  }

  const usuarios = getUsuarios_();
  const match = usuarios.find(function (row) {
    return row.usuario === usuario && row.contrasena === contrasena;
  });

  if (!match) {
    return jsonResponse({
      status: 'error',
      message: 'Credenciales invalidas'
    });
  }

  return jsonResponse({
    status: 'success',
    data: {
      usuario: match.usuario,
      nombres: match.nombres,
      role: 'viewer'
    }
  });
}

function verifySession_(params) {
  ensureUsuariosSheet_();
  const usuario = (params.usuario || '').trim();
  if (!usuario) {
    return jsonResponse({
      status: 'error',
      message: 'Sesion invalida'
    });
  }

  const usuarios = getUsuarios_();
  const match = usuarios.find(function (row) {
    return row.usuario === usuario;
  });

  if (!match) {
    return jsonResponse({
      status: 'error',
      message: 'Usuario no existe'
    });
  }

  return jsonResponse({
    status: 'success',
    data: {
      usuario: match.usuario,
      nombres: match.nombres
    }
  });
}

function upsertUsuario_(params) {
  const usuario = (params.usuario || '').trim();
  const contrasena = (params.contrasena || '').trim();
  const nombres = (params.nombres || '').trim();

  if (!usuario || !contrasena || !nombres) {
    return jsonResponse({
      status: 'error',
      message: 'usuario, contraseña y nombres son obligatorios'
    });
  }

  const sheet = getOrCreateSheet_(SHEET_USUARIOS, SHEET_HEADERS);
  const values = sheet.getDataRange().getValues();
  let updated = false;

  for (let i = 1; i < values.length; i += 1) {
    if ((values[i][0] || '').toString().trim() === usuario) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[contrasena, nombres]]);
      updated = true;
      break;
    }
  }

  if (!updated) {
    sheet.appendRow([usuario, contrasena, nombres]);
  }

  return jsonResponse({
    status: 'success',
    data: { message: updated ? 'Usuario actualizado' : 'Usuario creado' }
  });
}

function ensureUsuariosSheet_() {
  const sheet = getOrCreateSheet_(SHEET_USUARIOS, SHEET_HEADERS);
  const dataRows = Math.max(sheet.getLastRow() - 1, 0);
  if (dataRows === 0) {
    sheet.appendRow(['admin', 'admin123', 'Administrador']);
  }
}

function getUsuarios_() {
  const sheet = getOrCreateSheet_(SHEET_USUARIOS, SHEET_HEADERS);
  const values = sheet.getDataRange().getValues();
  const rows = [];

  for (let i = 1; i < values.length; i += 1) {
    rows.push({
      usuario: (values[i][0] || '').toString().trim(),
      contrasena: (values[i][1] || '').toString().trim(),
      nombres: (values[i][2] || '').toString().trim()
    });
  }

  return rows.filter(function (row) {
    return row.usuario;
  });
}

function getOrCreateSheet_(sheetName, headers) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const missingHeaders = headers.some(function (header, idx) {
      return (existingHeaders[idx] || '').toString().trim() !== header;
    });

    if (missingHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function planillasMeta_(params) {
  var rows = getPlanillasRows_();
  var clienteSet = {};
  var mesSet = {};

  for (var i = 0; i < rows.length; i += 1) {
    var unidad = normalizeUnidad_(rows[i].unidad);
    if (unidad) {
      clienteSet[unidad] = true;
    }
    var mesKey = rows[i].mesKey;
    if (mesKey) {
      mesSet[mesKey] = true;
    }
  }

  mergeClientesFromCobertura_(clienteSet);
  mergeMesesFromCoberturaHeaders_(mesSet);
  mergeClientesFromSatisfaccion_(clienteSet);
  mergeMesesFromSatisfaccionHeaders_(mesSet);

  var clientes = Object.keys(clienteSet).sort(function (a, b) {
    return a.localeCompare(b, 'es');
  });
  var meses = Object.keys(mesSet).sort().reverse();

  return jsonResponse({
    status: 'success',
    data: {
      clientes: clientes.map(function (c) {
        return { value: c, label: c };
      }),
      meses: meses.map(function (m) {
        return { value: m, label: formatMesLabel_(m) };
      })
    }
  });
}

function kpiIndiceRotacion_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var bajas = 0;
  var activos = 0;

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }

    var estado = row.estado;
    if (isEstadoBaja_(estado)) {
      bajas += 1;
    } else if (isEstadoActivo_(estado)) {
      activos += 1;
    }
  }

  var total = bajas + activos;
  var indice = total > 0 ? (bajas / total) * 100 : null;

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'indice_rotacion',
      label: 'Índice de rotación',
      descripcion:
        'Pestaña planillas: estados en columna D; Cliente = columna A; mes = columna BV.',
      bajas: bajas,
      activos: activos,
      total: total,
      indicePct: indice,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function sumServiciosPlanillasJK_(clientes, meses) {
  var rows = getPlanillasRows_();
  var sum = 0;
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }
    sum += row.diasTrabajados + row.descansos;
  }
  return sum;
}

function kpiIndiceServiciosNoCubiertos_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var noCubiertos = sumNoCubiertosCobertura_(clientes, meses);
  var servicios = sumServiciosPlanillasJK_(clientes, meses);
  var indice = servicios > 0 ? (noCubiertos / servicios) * 100 : null;

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'indice_servicios_no_cubiertos',
      label: 'Índice de servicios no cubiertos',
      noCubiertos: noCubiertos,
      servicios: servicios,
      indicePct: indice,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function kpiSatisfaccionCliente_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var sat = getSatisfaccionValue_(clientes, meses);

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'satisfaccion_cliente',
      label: 'Satisfacción del cliente',
      score: sat.score,
      muestras: sat.samples,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function kpiIndiceAusentismo_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var faltos = 0;
  var diasTrabajados = 0;
  var descansos = 0;

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }

    faltos += row.faltos;
    diasTrabajados += row.diasTrabajados;
    descansos += row.descansos;
  }

  var base = diasTrabajados + descansos;
  var indice = base > 0 ? (faltos / base) * 100 : null;

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'indice_ausentismo',
      label: 'Índice de ausentismo',
      faltos: faltos,
      diasTrabajados: diasTrabajados,
      descansos: descansos,
      base: base,
      indicePct: indice,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function kpiComportamientoServicio_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var descansoTrab = 0;
  var feriadoTrab = 0;
  var permisoSinGoce = 0;
  var licenciaConGoce = 0;
  var suspensiones = 0;
  var vacaciones = 0;
  var noProgramados = 0;

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }

    descansoTrab += row.descansoTrab;
    feriadoTrab += row.feriadoTrab;
    permisoSinGoce += row.permisoSinGoce;
    licenciaConGoce += row.licenciaConGoce;
    suspensiones += row.suspensiones;
    vacaciones += row.vacaciones;
    noProgramados += row.noProgramados;
  }

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'comportamiento_servicio',
      label: 'Comportamiento del Servicio',
      descansoTrab: descansoTrab,
      feriadoTrab: feriadoTrab,
      permisoSinGoce: permisoSinGoce,
      licenciaConGoce: licenciaConGoce,
      suspensiones: suspensiones,
      vacaciones: vacaciones,
      noProgramados: noProgramados,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function detalleComportamientoServicio_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var metric = (params.metric || '').trim();
  var metricDef = getComportamientoMetricDef_(metric);

  if (!metricDef) {
    return jsonResponse({
      status: 'error',
      message: 'Indicador no soportado'
    });
  }

  var rows = getPlanillasRows_();
  var detalles = [];

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }

    var value = row[metricDef.key];
    if (!value || value <= 0) {
      continue;
    }

    detalles.push({
      documento: row.documento || '',
      nombre: row.nombre || '',
      mes: row.mesKey || '',
      mesLabel: formatMesLabel_(row.mesKey || ''),
      valor: value
    });
  }

  detalles.sort(function (a, b) {
    if (a.mes !== b.mes) {
      return (a.mes || '').localeCompare(b.mes || '');
    }
    return (a.nombre || '').localeCompare(b.nombre || '', 'es');
  });

  return jsonResponse({
    status: 'success',
    data: {
      metric: metricDef.metric,
      label: metricDef.label,
      total: detalles.reduce(function (acc, item) {
        return acc + item.valor;
      }, 0),
      registros: detalles.length,
      detalles: detalles
    }
  });
}

function kpiAsignacionFamiliar_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var metrics;
  if (meses.length === 1) {
    metrics = calcAsignacionForMonth_(rows, clientes, meses[0]);
  } else if (meses.length > 1) {
    metrics = calcAsignacionSelectedMonthsAverage_(rows, clientes, meses);
  } else {
    metrics = calcAsignacionAllMonthsAverage_(rows, clientes);
  }

  var total = metrics.cAsig + metrics.sAsig;
  var cPct = total > 0 ? (metrics.cAsig / total) * 100 : 0;
  var sPct = total > 0 ? (metrics.sAsig / total) * 100 : 0;

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'indice_asignacion_familiar',
      label: 'Índice de asignación familiar',
      cAsig: metrics.cAsig,
      sAsig: metrics.sAsig,
      total: total,
      cAsigPct: cPct,
      sAsigPct: sPct,
      monthsAveraged: metrics.monthsAveraged || 1,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function kpiDepreciacionUniformes_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var totalDepreciacion = 0;
  var personasConsideradas = 0;
  var detalles = [];

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }
    if (row.estado !== 'BAJA') {
      continue;
    }

    var dias = daysBetweenDates_(row.fechaInicio, row.fechaBaja);
    if (dias <= 0) {
      continue;
    }

    var diasImpacto = diasImpactoUniforme_(dias);
    var monto = (UNIFORME_COSTO / UNIFORME_CICLO_DIAS) * diasImpacto;

    totalDepreciacion += monto;
    personasConsideradas += 1;
    detalles.push({
      documento: row.documento || '',
      nombre: row.nombre || '',
      dias: dias,
      diasImpacto: diasImpacto,
      monto: monto
    });
  }

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'depreciacion_uniformes',
      label: 'Depreciación de uniformes',
      total: totalDepreciacion,
      personas: personasConsideradas,
      detalles: detalles,
      filtros: {
        clientes: clientes,
        meses: meses
      }
    }
  });
}

function kpiLicenciasDescansosMedicos_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var licenciaPagado = 0;
  var descansoMedicoPagado = 0;
  var recuperacionFaltos = 0;
  var licenciaConGoceCantidad = 0;
  var descansosMedicosCantidad = 0;
  var byPersonMonth = {};

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }

    licenciaPagado += row.licenciaConGocePagado;
    descansoMedicoPagado += row.descansoMedicoPagado;
    recuperacionFaltos += Math.abs(row.recuperacionFaltos);
    licenciaConGoceCantidad += row.licenciaConGoce;
    descansosMedicosCantidad += row.descansoMedicoDias;

    var docKey = row.documento ? 'DOC:' + row.documento : 'NOM:' + (row.nombre || row.persona || 'SIN_NOMBRE');
    var mesKey = row.mesKey || '';
    if (!mesKey) {
      continue;
    }
    var key = docKey + '|' + mesKey;
    if (!byPersonMonth[key]) {
      byPersonMonth[key] = {
        documento: row.documento || '',
        nombre: row.nombre || row.persona || '',
        mes: mesKey,
        mesLabel: formatMesLabel_(mesKey),
        dias: 0
      };
    }
    byPersonMonth[key].dias += row.descansoMedicoDias;
  }

  var alertas = [];
  Object.keys(byPersonMonth).forEach(function (k) {
    var item = byPersonMonth[k];
    if (item.dias > 21) {
      alertas.push(item);
    }
  });
  alertas.sort(function (a, b) {
    if (b.dias !== a.dias) {
      return b.dias - a.dias;
    }
    return (a.nombre || '').localeCompare(b.nombre || '', 'es');
  });

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'licencias_descansos_medicos',
      licenciaConGocePagado: licenciaPagado,
      descansosMedicosPagado: descansoMedicoPagado,
      recuperacionFaltos: recuperacionFaltos,
      licenciaConGoceCantidad: licenciaConGoceCantidad,
      descansosMedicosCantidad: descansosMedicosCantidad,
      alertas: alertas
    }
  });
}

function kpiGastosAdicionales_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();
  var total = 0;
  var detalles = [];

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }
    if (!row.gastosAdicionales || row.gastosAdicionales <= 0) {
      continue;
    }

    total += row.gastosAdicionales;
    detalles.push({
      cliente: row.unidad || '',
      persona: row.nombre || row.persona || '',
      monto: row.gastosAdicionales,
      concepto: row.gastosConcepto || '-'
    });
  }

  detalles.sort(function (a, b) {
    if (b.monto !== a.monto) {
      return b.monto - a.monto;
    }
    return (a.persona || '').localeCompare(b.persona || '', 'es');
  });

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'gastos_adicionales',
      total: total,
      registros: detalles.length,
      detalles: detalles
    }
  });
}

function kpiRemuneracionNeta_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();
  var neta = 0;
  var computable = 0;
  var noComputable = 0;

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }
    neta += row.remuneracionNeta;
    computable += row.remuneracionComputable;
    noComputable += row.remuneracionNoComputable;
  }

  var base = neta > 0 ? neta : computable + noComputable;
  var computablePct = base > 0 ? (computable / base) * 100 : 0;
  var noComputablePct = base > 0 ? (noComputable / base) * 100 : 0;

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'remuneracion_neta',
      remuneracionNeta: neta,
      remuneracionComputable: computable,
      remuneracionNoComputable: noComputable,
      computablePct: computablePct,
      noComputablePct: noComputablePct
    }
  });
}

function kpiProvisionesEssalud_(params) {
  var clientes = parseCsvFilter_(params.cliente);
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();
  var neta = 0;
  var provisiones = 0;
  var essalud = 0;

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (!inFilter_(meses, row.mesKey)) {
      continue;
    }
    neta += row.remuneracionNeta;
    provisiones += row.provisiones;
    essalud += row.essalud;
  }

  var provPct = neta > 0 ? (provisiones / neta) * 100 : 0;
  var netaRestPct = neta > 0 ? ((neta - provisiones) / neta) * 100 : 0;

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'provisiones_essalud',
      remuneracionNeta: neta,
      provisiones: provisiones,
      essalud: essalud,
      provisionesPct: provPct,
      netaRestPct: netaRestPct
    }
  });
}

function kpiFactorHumanoClientes_(params) {
  var meses = parseCsvFilter_(params.mes);
  var rows = getPlanillasRows_();

  var groupedByCliente = {};
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var cliente = row.unidad || '';
    if (!cliente) {
      continue;
    }
    if (!groupedByCliente[cliente]) {
      groupedByCliente[cliente] = [];
    }
    groupedByCliente[cliente].push(row);
  }

  var clientes = Object.keys(groupedByCliente)
    .sort(function (a, b) {
      return a.localeCompare(b, 'es');
    })
    .map(function (cliente) {
      var metrics =
        meses.length === 1
          ? calcFactorHumanoClienteMes_(groupedByCliente[cliente], meses[0])
          : meses.length > 1
            ? calcFactorHumanoClientePromedioMesesSeleccionados_(groupedByCliente[cliente], meses)
            : calcFactorHumanoClientePromedioMensual_(groupedByCliente[cliente]);
      return {
        cliente: cliente,
        costoTotal: metrics.costoTotal,
        personas: metrics.personas,
        promedioPersona: metrics.promedioPersona,
        equilibrio: EQUILIBRIO_COSTO_PERSONA,
        diferenciaEquilibrio: metrics.promedioPersona - EQUILIBRIO_COSTO_PERSONA
      };
    });

  return jsonResponse({
    status: 'success',
    data: {
      kpiId: 'factor_humano_clientes',
      equilibrio: EQUILIBRIO_COSTO_PERSONA,
      clientes: clientes
    }
  });
}

function calcFactorHumanoClienteMes_(rows, mesKey) {
  var total = 0;
  var totalConCarga = 0;
  var docs = {};
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (row.mesKey !== mesKey) {
      continue;
    }
    var costoBase = row.remuneracionNeta + row.essalud;
    var cargaComputable = row.remuneracionComputable * 0.3333;
    total += costoBase;
    totalConCarga += costoBase + cargaComputable;
    if (row.documento) {
      docs[row.documento] = true;
    }
  }
  var personas = Object.keys(docs).length;
  var promedio = personas > 0 ? totalConCarga / personas : 0;
  return { costoTotal: total, personas: personas, promedioPersona: promedio };
}

function calcFactorHumanoClientePromedioMensual_(rows) {
  var monthSet = {};
  for (var i = 0; i < rows.length; i += 1) {
    if (rows[i].mesKey) {
      monthSet[rows[i].mesKey] = true;
    }
  }
  var months = Object.keys(monthSet);
  if (months.length === 0) {
    return { costoTotal: 0, personas: 0, promedioPersona: 0 };
  }

  var totalCostoMes = 0;
  var totalPersonasMes = 0;
  var totalPromedioMes = 0;
  var validMonths = 0;

  for (var m = 0; m < months.length; m += 1) {
    var metric = calcFactorHumanoClienteMes_(rows, months[m]);
    if (metric.personas <= 0) {
      continue;
    }
    totalCostoMes += metric.costoTotal;
    totalPersonasMes += metric.personas;
    totalPromedioMes += metric.promedioPersona;
    validMonths += 1;
  }

  if (validMonths === 0) {
    return { costoTotal: 0, personas: 0, promedioPersona: 0 };
  }

  return {
    costoTotal: totalCostoMes / validMonths,
    personas: totalPersonasMes / validMonths,
    promedioPersona: totalPromedioMes / validMonths
  };
}

function calcFactorHumanoClientePromedioMesesSeleccionados_(rows, meses) {
  if (!meses || meses.length === 0) {
    return { costoTotal: 0, personas: 0, promedioPersona: 0 };
  }
  var totalCostoMes = 0;
  var totalPersonasMes = 0;
  var totalPromedioMes = 0;
  var validMonths = 0;
  for (var i = 0; i < meses.length; i += 1) {
    var metric = calcFactorHumanoClienteMes_(rows, meses[i]);
    if (metric.personas <= 0) {
      continue;
    }
    totalCostoMes += metric.costoTotal;
    totalPersonasMes += metric.personas;
    totalPromedioMes += metric.promedioPersona;
    validMonths += 1;
  }
  if (validMonths === 0) {
    return { costoTotal: 0, personas: 0, promedioPersona: 0 };
  }
  return {
    costoTotal: totalCostoMes / validMonths,
    personas: totalPersonasMes / validMonths,
    promedioPersona: totalPromedioMes / validMonths
  };
}

function getPlanillasRows_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_PLANILLAS);
  if (!sheet) {
    return [];
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  var lastCol = Math.max(sheet.getLastColumn(), PLANILLAS_COL_MES);
  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var rows = [];

  for (var r = 0; r < values.length; r += 1) {
    var row = values[r];
    var unidad = normalizeUnidad_(getCell_(row, PLANILLAS_COL_UNIDAD));
    var documento = normalizeUnidad_(getCell_(row, PLANILLAS_COL_PERSONA_1));
    var asignacion = normalizeAsignacion_(getCell_(row, PLANILLAS_COL_ASIGNACION));
    var nombre = normalizeUnidad_(getCell_(row, PLANILLAS_COL_NOMBRE));
    var persona = normalizePersona_(documento, nombre);
    var estadoRaw = getCell_(row, PLANILLAS_COL_ESTADO);
    var estado = normalizeEstadoD_(estadoRaw);
    var fechaInicio = parseDateFromCell_(getCell_(row, PLANILLAS_COL_FECHA_INICIO));
    var fechaBaja = parseDateFromCell_(getCell_(row, PLANILLAS_COL_FECHA_BAJA));
    var diasTrabajados = numberFromCell_(getCell_(row, PLANILLAS_COL_DIAS_TRAB));
    var descansos = numberFromCell_(getCell_(row, PLANILLAS_COL_DESCANSOS));
    var descansoTrab = numberFromCell_(getCell_(row, PLANILLAS_COL_DESCANSOS_TRAB));
    var feriadoTrab = numberFromCell_(getCell_(row, PLANILLAS_COL_FERIADOS_TRAB));
    var faltos = numberFromCell_(getCell_(row, PLANILLAS_COL_FALTOS));
    var permisoSinGoce = numberFromCell_(getCell_(row, PLANILLAS_COL_PERMISO_SIN_GOCE));
    var licenciaConGoce = numberFromCell_(getCell_(row, PLANILLAS_COL_LICENCIA_CON_GOCE));
    var descansoMedicoDias = numberFromCell_(getCell_(row, PLANILLAS_COL_DESCANSO_MEDICO_DIAS));
    var suspensiones = numberFromCell_(getCell_(row, PLANILLAS_COL_SUSPENSIONES));
    var vacaciones = numberFromCell_(getCell_(row, PLANILLAS_COL_VACACIONES));
    var noProgramados = numberFromCell_(getCell_(row, PLANILLAS_COL_NO_PROGRAMADOS));
    var licenciaConGocePagado = numberFromCell_(getCell_(row, PLANILLAS_COL_LICENCIA_CON_GOCE_PAGADO));
    var descansoMedicoPagado = numberFromCell_(getCell_(row, PLANILLAS_COL_DESCANSO_MEDICO_PAGADO));
    var recuperacionFaltos = numberFromCell_(getCell_(row, PLANILLAS_COL_RECUPERACION_FALTOS));
    var gastosAdicionales = numberFromCell_(getCell_(row, PLANILLAS_COL_GASTOS_ADICIONALES));
    var gastosConcepto = normalizeUnidad_(getCell_(row, PLANILLAS_COL_GASTOS_CONCEPTO));
    var remuneracionNeta = numberFromCell_(getCell_(row, PLANILLAS_COL_REMUNERACION_NETA));
    var remuneracionComputable = numberFromCell_(getCell_(row, PLANILLAS_COL_REMUNERACION_COMPUTABLE));
    var remuneracionNoComputable = numberFromCell_(getCell_(row, PLANILLAS_COL_REMUNERACION_NO_COMPUTABLE));
    var provisiones = numberFromCell_(getCell_(row, PLANILLAS_COL_PROVISIONES));
    var essalud = numberFromCell_(getCell_(row, PLANILLAS_COL_ESSALUD));
    var mesKey = monthKeyFromBvCell_(getCellBv_(row));

    rows.push({
      unidad: unidad,
      documento: documento,
      asignacion: asignacion,
      nombre: nombre,
      persona: persona,
      estado: estado,
      estadoRaw: (estadoRaw || '').toString().trim(),
      fechaInicio: fechaInicio,
      fechaBaja: fechaBaja,
      diasTrabajados: diasTrabajados,
      descansos: descansos,
      descansoTrab: descansoTrab,
      feriadoTrab: feriadoTrab,
      faltos: faltos,
      permisoSinGoce: permisoSinGoce,
      licenciaConGoce: licenciaConGoce,
      descansoMedicoDias: descansoMedicoDias,
      suspensiones: suspensiones,
      vacaciones: vacaciones,
      noProgramados: noProgramados,
      licenciaConGocePagado: licenciaConGocePagado,
      descansoMedicoPagado: descansoMedicoPagado,
      recuperacionFaltos: recuperacionFaltos,
      gastosAdicionales: gastosAdicionales,
      gastosConcepto: gastosConcepto,
      remuneracionNeta: remuneracionNeta,
      remuneracionComputable: remuneracionComputable,
      remuneracionNoComputable: remuneracionNoComputable,
      provisiones: provisiones,
      essalud: essalud,
      mesKey: mesKey
    });
  }

  return rows;
}

function getComportamientoMetricDef_(metric) {
  var defs = {
    descansoTrab: { metric: 'descansoTrab', key: 'descansoTrab', label: 'Descansos trabajados' },
    feriadoTrab: { metric: 'feriadoTrab', key: 'feriadoTrab', label: 'Feriados trabajados' },
    permisoSinGoce: { metric: 'permisoSinGoce', key: 'permisoSinGoce', label: 'Permisos sin goce' },
    licenciaConGoce: { metric: 'licenciaConGoce', key: 'licenciaConGoce', label: 'Licencia con goce' },
    suspensiones: { metric: 'suspensiones', key: 'suspensiones', label: 'Suspensiones' },
    vacaciones: { metric: 'vacaciones', key: 'vacaciones', label: 'Vacaciones' },
    noProgramados: { metric: 'noProgramados', key: 'noProgramados', label: 'No programados' }
  };
  return defs[metric] || null;
}

function getCell_(rowArray, oneBasedCol) {
  var idx = oneBasedCol - 1;
  if (idx < 0 || idx >= rowArray.length) {
    return '';
  }
  return rowArray[idx];
}

function getCellBv_(rowArray) {
  return getCell_(rowArray, PLANILLAS_COL_MES);
}

function normalizeUnidad_(value) {
  return (value || '').toString().trim();
}

function normalizePersona_(valueB, valueC) {
  var primary = (valueB || '').toString().trim();
  var fallback = (valueC || '').toString().trim();
  return primary || fallback || '';
}

function normalizeAsignacion_(value) {
  return (value || '').toString().trim().toUpperCase();
}

function parseDateFromCell_(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'number') {
    var epoch = new Date(1899, 11, 30);
    return new Date(epoch.getTime() + value * 86400000);
  }
  var parsed = new Date(value.toString().trim());
  return isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetweenDates_(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }
  var s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
  var e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  if (e <= s) {
    return 0;
  }
  return Math.floor((e - s) / 86400000);
}

function diasImpactoUniforme_(diasTotales) {
  // Pérdida = días faltantes para completar 180 del uniforme vigente.
  // Ejemplos: 150 -> 30, 20 -> 160, 300 -> 60.
  var remainder = diasTotales % UNIFORME_CICLO_DIAS;
  if (remainder === 0) {
    return 0;
  }
  return UNIFORME_CICLO_DIAS - remainder;
}

function normalizeEstadoD_(value) {
  return (value || '').toString().trim().toUpperCase();
}

function numberFromCell_(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return 0;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  var str = value.toString().trim();
  if (!str) {
    return 0;
  }
  var normalized = str.replace(/\./g, '').replace(',', '.');
  var parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

function parseCsvFilter_(rawValue) {
  var raw = (rawValue || '').toString().trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map(function (v) {
      return v.trim();
    })
    .filter(function (v) {
      return !!v;
    });
}

function inFilter_(filterList, value) {
  if (!filterList || filterList.length === 0) {
    return true;
  }
  return filterList.indexOf((value || '').toString()) !== -1;
}

function isEstadoBaja_(estado) {
  return ESTADOS_BAJA.indexOf(estado) !== -1;
}

function isEstadoActivo_(estado) {
  return ESTADOS_ACTIVO.indexOf(estado) !== -1;
}

function calcAsignacionForMonth_(rows, clientes, mes) {
  var uniqueByDoc = {};
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    if (mes && row.mesKey !== mes) {
      continue;
    }
    if (!isEstadoActivo_(row.estado)) {
      continue;
    }
    if (!row.documento) {
      continue;
    }
    if (uniqueByDoc[row.documento]) {
      continue;
    }
    uniqueByDoc[row.documento] = row;
  }

  var cAsig = 0;
  var sAsig = 0;
  var docs = Object.keys(uniqueByDoc);
  for (var d = 0; d < docs.length; d += 1) {
    var item = uniqueByDoc[docs[d]];
    if (item.asignacion === 'C/ASIG') {
      cAsig += 1;
    } else if (item.asignacion === 'S/ASIG') {
      sAsig += 1;
    }
  }

  return { cAsig: cAsig, sAsig: sAsig };
}

function calcAsignacionAllMonthsAverage_(rows, clientes) {
  var monthSet = {};
  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    if (!row.mesKey) {
      continue;
    }
    if (!inFilter_(clientes, row.unidad)) {
      continue;
    }
    monthSet[row.mesKey] = true;
  }

  var months = Object.keys(monthSet);
  if (months.length === 0) {
    return { cAsig: 0, sAsig: 0, monthsAveraged: 0 };
  }

  var cPctSum = 0;
  var sPctSum = 0;
  var validMonths = 0;

  for (var m = 0; m < months.length; m += 1) {
    var month = months[m];
    var monthMetric = calcAsignacionForMonth_(rows, clientes, month);
    var monthTotal = monthMetric.cAsig + monthMetric.sAsig;
    if (monthTotal <= 0) {
      continue;
    }
    cPctSum += (monthMetric.cAsig / monthTotal) * 100;
    sPctSum += (monthMetric.sAsig / monthTotal) * 100;
    validMonths += 1;
  }

  if (validMonths === 0) {
    return { cAsig: 0, sAsig: 0, monthsAveraged: 0 };
  }

  return {
    // devolvemos "equivalentes" para que el frontend mantenga cálculo simple
    cAsig: cPctSum / validMonths,
    sAsig: sPctSum / validMonths,
    monthsAveraged: validMonths
  };
}

function calcAsignacionSelectedMonthsAverage_(rows, clientes, meses) {
  if (!meses || meses.length === 0) {
    return { cAsig: 0, sAsig: 0, monthsAveraged: 0 };
  }
  var cPctSum = 0;
  var sPctSum = 0;
  var validMonths = 0;
  for (var i = 0; i < meses.length; i += 1) {
    var monthMetric = calcAsignacionForMonth_(rows, clientes, meses[i]);
    var monthTotal = monthMetric.cAsig + monthMetric.sAsig;
    if (monthTotal <= 0) {
      continue;
    }
    cPctSum += (monthMetric.cAsig / monthTotal) * 100;
    sPctSum += (monthMetric.sAsig / monthTotal) * 100;
    validMonths += 1;
  }
  if (validMonths === 0) {
    return { cAsig: 0, sAsig: 0, monthsAveraged: 0 };
  }
  return {
    cAsig: cPctSum / validMonths,
    sAsig: sPctSum / validMonths,
    monthsAveraged: validMonths
  };
}

function monthKeyFromBvCell_(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return '';
  }

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM');
  }

  if (typeof value === 'number') {
    var epoch = new Date(1899, 11, 30);
    var ms = epoch.getTime() + value * 86400000;
    var d = new Date(ms);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM');
    }
  }

  var s = value.toString().trim();
  var ym = s.match(/(20\d{2})[-/](\d{1,2})/);
  if (ym) {
    var y = ym[1];
    var m = ('0' + ym[2]).slice(-2);
    return y + '-' + m;
  }

  return '';
}

function formatMesLabel_(mesKey) {
  if (!mesKey || mesKey.length < 7) {
    return mesKey;
  }
  var parts = mesKey.split('-');
  var y = parts[0];
  var m = parseInt(parts[1], 10);
  var names = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  if (m >= 1 && m <= 12) {
    return names[m - 1] + ' ' + y;
  }
  return mesKey;
}

function mergeClientesFromCobertura_(clienteSet) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_COBERTURA);
  if (!sheet || sheet.getLastRow() < 2) {
    return;
  }
  var colA = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues();
  for (var i = 0; i < colA.length; i += 1) {
    var v = normalizeUnidad_(colA[i][0]);
    if (v) {
      clienteSet[v] = true;
    }
  }
}

function mergeMesesFromCoberturaHeaders_(mesSet) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_COBERTURA);
  if (!sheet || sheet.getLastColumn() < 2) {
    return;
  }
  var headers = sheet.getRange(1, 2, 1, sheet.getLastColumn()).getValues()[0];
  for (var h = 0; h < headers.length; h += 1) {
    var mk = mesKeyFromCoberturaHeader_(headers[h]);
    if (mk) {
      mesSet[mk] = true;
    }
  }
}

function sumNoCubiertosCobertura_(clientes, meses) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_COBERTURA);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 2) {
    return 0;
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 2, 1, lastCol).getValues()[0];
  var monthCols = [];
  for (var c = 0; c < headers.length; c += 1) {
    var mk = mesKeyFromCoberturaHeader_(headers[c]);
    if (!mk) {
      continue;
    }
    monthCols.push({ col: 2 + c, mesKey: mk });
  }

  if (monthCols.length === 0) {
    return 0;
  }

  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var total = 0;

  for (var r = 0; r < values.length; r += 1) {
    var row = values[r];
    var cli = normalizeUnidad_(getCell_(row, 1));
    if (!inFilter_(clientes, cli)) {
      continue;
    }

    if (meses && meses.length > 0) {
      for (var j = 0; j < monthCols.length; j += 1) {
        if (inFilter_(meses, monthCols[j].mesKey)) {
          total += numberFromCell_(getCell_(row, monthCols[j].col));
        }
      }
    } else {
      for (var k = 0; k < monthCols.length; k += 1) {
        total += numberFromCell_(getCell_(row, monthCols[k].col));
      }
    }
  }

  return total;
}

function mergeClientesFromSatisfaccion_(clienteSet) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SATISFACCION);
  if (!sheet || sheet.getLastRow() < 2) {
    return;
  }
  var colA = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues();
  for (var i = 0; i < colA.length; i += 1) {
    var v = normalizeUnidad_(colA[i][0]);
    if (v) {
      clienteSet[v] = true;
    }
  }
}

function mergeMesesFromSatisfaccionHeaders_(mesSet) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SATISFACCION);
  if (!sheet || sheet.getLastColumn() < 2) {
    return;
  }
  var headers = sheet.getRange(1, 2, 1, sheet.getLastColumn()).getValues()[0];
  for (var h = 0; h < headers.length; h += 1) {
    var mk = mesKeyFromCoberturaHeader_(headers[h]);
    if (mk) {
      mesSet[mk] = true;
    }
  }
}

function getSatisfaccionValue_(clientes, meses) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_SATISFACCION);
  if (!sheet || sheet.getLastRow() < 2 || sheet.getLastColumn() < 2) {
    return { score: null, samples: 0 };
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 2, 1, lastCol).getValues()[0];
  var monthCols = [];
  for (var c = 0; c < headers.length; c += 1) {
    var mk = mesKeyFromCoberturaHeader_(headers[c]);
    if (!mk) {
      continue;
    }
    monthCols.push({ col: 2 + c, mesKey: mk });
  }

  if (monthCols.length === 0) {
    return { score: null, samples: 0 };
  }

  var values = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  var sum = 0;
  var samples = 0;

  for (var r = 0; r < values.length; r += 1) {
    var row = values[r];
    var cli = normalizeUnidad_(getCell_(row, 1));
    if (!inFilter_(clientes, cli)) {
      continue;
    }

    if (meses && meses.length > 0) {
      for (var j = 0; j < monthCols.length; j += 1) {
        if (inFilter_(meses, monthCols[j].mesKey)) {
          var vMes = ratingFromCell_(getCell_(row, monthCols[j].col));
          if (vMes !== null) {
            sum += vMes;
            samples += 1;
          }
        }
      }
    } else {
      for (var k = 0; k < monthCols.length; k += 1) {
        var vAll = ratingFromCell_(getCell_(row, monthCols[k].col));
        if (vAll !== null) {
          sum += vAll;
          samples += 1;
        }
      }
    }
  }

  if (samples === 0) {
    return { score: null, samples: 0 };
  }

  return { score: sum / samples, samples: samples };
}

function ratingFromCell_(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  var str = value.toString().trim();
  if (!str) {
    return null;
  }

  // Acepta 4.5 o 4,5 sin tratar el punto como separador de miles.
  var normalized = str.replace(',', '.');
  var parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

function mesKeyFromCoberturaHeader_(raw) {
  if (raw === '' || raw === null || typeof raw === 'undefined') {
    return '';
  }

  if (Object.prototype.toString.call(raw) === '[object Date]' && !isNaN(raw.getTime())) {
    return Utilities.formatDate(raw, Session.getScriptTimeZone(), 'yyyy-MM');
  }

  if (typeof raw === 'number') {
    return monthKeyFromBvCell_(raw);
  }

  var fromGeneric = monthKeyFromBvCell_(raw);
  if (fromGeneric) {
    return fromGeneric;
  }

  var s = raw.toString().trim().toLowerCase();
  var yearMatch = s.match(/(20\d{2})/);
  if (!yearMatch) {
    return '';
  }
  var year = yearMatch[1];
  var monthNum = spanishMonthNumberFromString_(s);
  if (!monthNum) {
    return '';
  }
  return year + '-' + ('0' + monthNum).slice(-2);
}

function spanishMonthNumberFromString_(s) {
  var pairs = [
    ['enero', 1],
    ['febrero', 2],
    ['marzo', 3],
    ['abril', 4],
    ['mayo', 5],
    ['junio', 6],
    ['julio', 7],
    ['agosto', 8],
    ['septiembre', 9],
    ['setiembre', 9],
    ['octubre', 10],
    ['noviembre', 11],
    ['diciembre', 12],
    ['ene', 1],
    ['feb', 2],
    ['mar', 3],
    ['abr', 4],
    ['may', 5],
    ['jun', 6],
    ['jul', 7],
    ['ago', 8],
    ['sep', 9],
    ['oct', 10],
    ['nov', 11],
    ['dic', 12]
  ];
  for (var i = 0; i < pairs.length; i += 1) {
    if (s.indexOf(pairs[i][0]) !== -1) {
      return pairs[i][1];
    }
  }
  return 0;
}
