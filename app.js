// Configuración
const API_URL = 'https://script.google.com/macros/s/AKfycbxaSYJNiB5ZHMOTaL8aCt1Amjyc5OjCh_RSuWH1PLLVh27P8Pxn5-kfXzNAgvWPr7kaSA/exec';

// Variables globales
let matrizDatos = [];
let matrizItems = [];

// Constantes para los índices de columnas
const COLUMNAS = {
    AREA_SOLICITANTE: 0,    // Columna A
    SOLICITANTE: 1,         // Columna B
    SECTOR: 2,              // Columna C
    CLIENTE: 3,             // Columna D
    UNIDAD: 4,              // Columna E
    ADMINISTRADOR: 5,       // Columna F
    LIDER_ZONAL: 6,         // Columna G
    CIUDAD: 7,              // Columna H
    SUCURSAL: 8             // Columna I
};

// Función para cargar datos usando JSONP
function loadJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };

        const script = document.createElement('script');
        script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando carga de datos...');
    try {
        // Cargar matriz datos
        console.log('Solicitando matriz datos...');
        const resultDatos = await loadJSONP(`${API_URL}?action=getMatrizDatos`);
        if (resultDatos.error) throw new Error(resultDatos.message);
        matrizDatos = resultDatos.data.rows;
        console.log('Matriz datos procesada:', matrizDatos);

        // Cargar matriz items
        console.log('Solicitando matriz items...');
        const resultItems = await loadJSONP(`${API_URL}?action=getMatrizItems`);
        if (resultItems.error) throw new Error(resultItems.message);
        matrizItems = resultItems.data.rows;
        console.log('Matriz items procesada:', matrizItems);

        // Inicializar selectores
        cargarAreasSolicitantes();
        cargarSolicitantes();
        cargarSucursales();
        cargarSectores();
        agregarItem();
        
        console.log('Inicialización completada');
    } catch (error) {
        console.error('Error en la inicialización:', error);
        alert('Error al cargar los datos iniciales: ' + error.message);
    }
});
// Funciones de carga de datos
async function cargarDatosIniciales() {
    // Cargar matriz datos
    const responseDatos = await fetch(`${API_URL}?action=getMatrizDatos`);
    const resultDatos = await responseDatos.json();
    if (resultDatos.error) throw new Error(resultDatos.message);
    matrizDatos = resultDatos.data.rows;

    // Cargar matriz items
    const responseItems = await fetch(`${API_URL}?action=getMatrizItems`);
    const resultItems = await responseItems.json();
    if (resultItems.error) throw new Error(resultItems.message);
    matrizItems = resultItems.data.rows;

    // Inicializar selectores
    cargarSectores();
    agregarItem(); // Agregar primer item por defecto
}

// Funciones para cargar datos dependientes
function cargarSectores() {
    const sectorSelect = document.getElementById('sector');
    const sectores = getValoresUnicos(matrizDatos, COLUMNAS.SECTOR);
    
    sectorSelect.innerHTML = '<option value="">Seleccione un sector</option>' +
        sectores.map(sector => `<option value="${sector}">${sector}</option>`).join('');
}

function cargarClientes() {
    const sector = document.getElementById('sector').value;
    const clienteSelect = document.getElementById('cliente');
    
    const clientes = [...new Set(matrizDatos
        .filter(row => row[COLUMNAS.SECTOR] === sector)
        .map(row => row[COLUMNAS.CLIENTE]))];
    
    clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>' +
        clientes.map(cliente => `<option value="${cliente}">${cliente}</option>`).join('');
    
    // Limpiar selecciones dependientes
    document.getElementById('unidad').innerHTML = '<option value="">Seleccione una unidad</option>';
    ['administrador', 'liderZonal', 'ciudad'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function cargarUnidades() {
    const sector = document.getElementById('sector').value;
    const cliente = document.getElementById('cliente').value;
    const unidadSelect = document.getElementById('unidad');
    
    const unidades = matrizDatos
        .filter(row => row[COLUMNAS.SECTOR] === sector && row[COLUMNAS.CLIENTE] === cliente)
        .map(row => row[COLUMNAS.UNIDAD]);
    
    unidadSelect.innerHTML = '<option value="">Seleccione una unidad</option>' +
        unidades.map(unidad => `<option value="${unidad}">${unidad}</option>`).join('');
    
    // Cargar administrador
    const datosFila = matrizDatos.find(row => 
        row[COLUMNAS.SECTOR] === sector && row[COLUMNAS.CLIENTE] === cliente);
    if (datosFila) {
        document.getElementById('administrador').value = datosFila[COLUMNAS.ADMINISTRADOR] || '';
    }
}

function cargarDatosUnidad() {
    const sector = document.getElementById('sector').value;
    const cliente = document.getElementById('cliente').value;
    const unidad = document.getElementById('unidad').value;
    
    const datosFila = matrizDatos.find(row => 
        row[COLUMNAS.SECTOR] === sector && 
        row[COLUMNAS.CLIENTE] === cliente && 
        row[COLUMNAS.UNIDAD] === unidad);
    
    if (datosFila) {
        document.getElementById('liderZonal').value = datosFila[COLUMNAS.LIDER_ZONAL] || '';
        document.getElementById('ciudad').value = datosFila[COLUMNAS.CIUDAD] || '';
    }
}

// Funciones para manejo de items
function agregarItem() {
    const container = document.getElementById('itemsContainer');
    const itemIndex = container.children.length;
    
    const categorias = [...new Set(matrizItems.map(row => row[0]))];
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-form';
    itemDiv.innerHTML = `
        <div class="row">
            <div class="col-md-3 mb-3">
                <label class="form-label">Categoría</label>
                <select class="form-control" onchange="cargarItems(${itemIndex})" id="categoria_${itemIndex}">
                    <option value="">Seleccione una categoría</option>
                    ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-3 mb-3">
                <label class="form-label">Item</label>
                <select class="form-control" onchange="cargarUnidadMedida(${itemIndex})" id="item_${itemIndex}">
                    <option value="">Seleccione un item</option>
                </select>
            </div>
            <div class="col-md-2 mb-3">
                <label class="form-label">Unidad de Medida</label>
                <input type="text" class="form-control" id="unidadMedida_${itemIndex}" readonly>
            </div>
            <div class="col-md-2 mb-3">
                <label class="form-label">Cantidad</label>
                <input type="number" class="form-control" id="cantidad_${itemIndex}" min="1">
            </div>
            <div class="col-md-12 mb-3">
                <label class="form-label">Detalle</label>
                <textarea class="form-control" id="detalle_${itemIndex}" rows="2"></textarea>
            </div>
            ${itemIndex > 0 ? `
                <div class="col-12">
                    <button type="button" class="btn btn-danger" onclick="eliminarItem(this)">
                        Eliminar Item
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    container.appendChild(itemDiv);
}

function cargarItems(index) {
    const categoria = document.getElementById(`categoria_${index}`).value;
    const itemSelect = document.getElementById(`item_${index}`);
    
    const items = matrizItems
        .filter(row => row[0] === categoria)
        .map(row => row[1]);
    
    itemSelect.innerHTML = '<option value="">Seleccione un item</option>' +
        items.map(item => `<option value="${item}">${item}</option>`).join('');
    
    document.getElementById(`unidadMedida_${index}`).value = '';
}

function cargarUnidadMedida(index) {
    const categoria = document.getElementById(`categoria_${index}`).value;
    const item = document.getElementById(`item_${index}`).value;
    
    const datosFila = matrizItems.find(row => row[0] === categoria && row[1] === item);
    if (datosFila) {
        document.getElementById(`unidadMedida_${index}`).value = datosFila[2] || '';
    }
}

function eliminarItem(button) {
    button.closest('.item-form').remove();
}

// Funciones de vista previa y guardado
function mostrarVistaPrevia() {
    const datosGenerales = {
        areaSolicitante: document.getElementById('areaSolicitante').value,
        solicitante: document.getElementById('solicitante').value,
        sector: document.getElementById('sector').value,
        cliente: document.getElementById('cliente').value,
        unidad: document.getElementById('unidad').value,
        administrador: document.getElementById('administrador').value,
        liderZonal: document.getElementById('liderZonal').value,
        ciudad: document.getElementById('ciudad').value,
        sucursal: document.getElementById('sucursal').value
    };

    const items = obtenerItems();

    if (!validarDatos(datosGenerales, items)) return;

    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <h4>Datos Generales</h4>
        <table class="table">
            <tr><td><strong>Área Solicitante:</strong></td><td>${datosGenerales.areaSolicitante}</td></tr>
            <tr><td><strong>Solicitante:</strong></td><td>${datosGenerales.solicitante}</td></tr>
            <tr><td><strong>Sector:</strong></td><td>${datosGenerales.sector}</td></tr>
            <tr><td><strong>Cliente:</strong></td><td>${datosGenerales.cliente}</td></tr>
            <tr><td><strong>Unidad:</strong></td><td>${datosGenerales.unidad}</td></tr>
            <tr><td><strong>Administrador:</strong></td><td>${datosGenerales.administrador}</td></tr>
            <tr><td><strong>Líder Zonal:</strong></td><td>${datosGenerales.liderZonal}</td></tr>
            <tr><td><strong>Ciudad:</strong></td><td>${datosGenerales.ciudad}</td></tr>
            <tr><td><strong>Sucursal:</strong></td><td>${datosGenerales.sucursal}</td></tr>
        </table>
        
        <h4>Items</h4>
        <table class="table">
            <thead>
                <tr>
                    <th>Categoría</th>
                    <th>Item</th>
                    <th>Unidad de Medida</th>
                    <th>Cantidad</th>
                    <th>Detalle</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.categoria}</td>
                        <td>${item.item}</td>
                        <td>${item.unidadMedida}</td>
                        <td>${item.cantidad}</td>
                        <td>${item.detalle}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('previewModal').style.display = 'block';
}

function obtenerItems() {
    const items = [];
    const container = document.getElementById('itemsContainer');
    
    for (let i = 0; i < container.children.length; i++) {
        const categoria = document.getElementById(`categoria_${i}`)?.value;
        const item = document.getElementById(`item_${i}`)?.value;
        const unidadMedida = document.getElementById(`unidadMedida_${i}`)?.value;
        const cantidad = document.getElementById(`cantidad_${i}`)?.value;
        const detalle = document.getElementById(`detalle_${i}`)?.value;
        
        if (categoria && item && cantidad) {
            items.push({categoria, item, unidadMedida, cantidad, detalle});
        }
    }
    
    return items;
}

function validarDatos(datosGenerales, items) {
    // Validar datos generales
    for (const [key, value] of Object.entries(datosGenerales)) {
        if (!value) {
            alert(`Por favor complete el campo ${key}`);
            return false;
        }
    }

    // Validar items
    if (items.length === 0) {
        alert('Debe agregar al menos un item');
        return false;
    }

    return true;
}

// Función para guardar usando JSONP
function guardarPedido() {
    try {
        const datosGenerales = {
            areaSolicitante: document.getElementById('areaSolicitante').value,
            solicitante: document.getElementById('solicitante').value,
            sector: document.getElementById('sector').value,
            cliente: document.getElementById('cliente').value,
            unidad: document.getElementById('unidad').value,
            administrador: document.getElementById('administrador').value,
            liderZonal: document.getElementById('liderZonal').value,
            ciudad: document.getElementById('ciudad').value,
            sucursal: document.getElementById('sucursal').value
        };

        const items = obtenerItems();

        if (!validarDatos(datosGenerales, items)) return;

        // Crear un elemento script para JSONP
        const script = document.createElement('script');
        const callbackName = 'guardar_callback_' + Math.round(100000 * Math.random());
        
        // Definir el callback
        window[callbackName] = function(response) {
            delete window[callbackName];
            document.body.removeChild(script);
            
            if (response.error) {
                console.error('Error en respuesta:', response);
                alert('Error al guardar: ' + response.message);
            } else {
                alert('Pedido guardado exitosamente');
                cerrarVistaPrevia();
                limpiarFormulario();
            }
        };

        // Construir la URL con los parámetros
        const params = new URLSearchParams({
            action: 'guardarRegistro',
            callback: callbackName,
            datos: JSON.stringify({
                ...datosGenerales,
                items: items
            })
        });

        // Agregar el script al documento
        script.src = `${API_URL}?${params.toString()}`;
        document.body.appendChild(script);

    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar el pedido: ' + error.message);
    }
}

function cerrarVistaPrevia() {
    document.getElementById('previewModal').style.display = 'none';
}

function limpiarFormulario() {
    // Limpiar datos generales
    ['areaSolicitante', 'solicitante', 'sector', 'cliente', 'unidad', 
     'administrador', 'liderZonal', 'ciudad', 'sucursal'].forEach(id => {
        document.getElementById(id).value = '';
    });

    // Limpiar items
    document.getElementById('itemsContainer').innerHTML = '';
    agregarItem();
}

// Función para obtener valores únicos de una columna
function getValoresUnicos(datos, columnaIndex) {
    return [...new Set(datos.map(row => row[columnaIndex]))].filter(valor => valor);
}

// Función para cargar áreas solicitantes
function cargarAreasSolicitantes() {
    console.log('Cargando áreas solicitantes...');
    const areaSelect = document.getElementById('areaSolicitante');
    const areas = [...new Set(matrizDatos.map(row => row[0]))].filter(area => area); // Columna A
    
    console.log('Áreas encontradas:', areas);
    
    areaSelect.innerHTML = '<option value="">Seleccione un área</option>' +
        areas.map(area => `<option value="${area}">${area}</option>`).join('');
}

// Función para cargar sucursales
function cargarSucursales() {
    const sucursalSelect = document.getElementById('sucursal');
    const sucursales = getValoresUnicos(matrizDatos, 8); // Columna I
    
    sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>' +
        sucursales.map(sucursal => `<option value="${sucursal}">${sucursal}</option>`).join('');
}

// Función para cargar solicitantes
function cargarSolicitantes() {
    console.log('Cargando solicitantes...');
    const solicitanteSelect = document.getElementById('solicitante');
    const solicitantes = [...new Set(matrizDatos.map(row => row[1]))].filter(solicitante => solicitante); // Columna B
    
    console.log('Solicitantes encontrados:', solicitantes);
    
    solicitanteSelect.innerHTML = '<option value="">Seleccione un solicitante</option>' +
        solicitantes.map(solicitante => `<option value="${solicitante}">${solicitante}</option>`).join('');
}

