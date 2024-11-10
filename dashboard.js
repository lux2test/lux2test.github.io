document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay usuario logueado
    const usuarioData = sessionStorage.getItem('usuario');
    if (!usuarioData) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = JSON.parse(usuarioData);
    document.getElementById('userName').textContent = usuario.nombre;
    document.getElementById('userNameTop').textContent = usuario.nombre;

    // Aplicar restricciones según rol
    aplicarPermisosSegunRol(usuario.rol);
});

function aplicarPermisosSegunRol(rol) {
    const menuItems = {
        'inicio': document.querySelector('a[onclick="cargarPagina(\'index.html\')"]').parentElement,
        'registro': document.querySelector('a[onclick="cargarPagina(\'registro.html\')"]').parentElement,
        'seguimiento': document.querySelector('a[onclick="cargarPagina(\'seguimiento.html\')"]').parentElement
    };

    switch(rol.toLowerCase()) {
        case 'admin':
            // Admin ve todo
            break;
        case 'vendedor':
            // Vendedor solo ve inicio y registro
            menuItems.seguimiento.style.display = 'none';
            break;
        case 'supervisor':
            // Supervisor ve inicio y seguimiento
            menuItems.registro.style.display = 'none';
            break;
        default:
            // Por defecto, solo ve inicio
            menuItems.registro.style.display = 'none';
            menuItems.seguimiento.style.display = 'none';
    }
}

function cargarPagina(url) {
    document.getElementById('contentFrame').src = url;
    document.getElementById('pageTitle').textContent = getTituloPagina(url);
}

function getTituloPagina(url) {
    switch(url) {
        case 'form.html': return 'Inicio';
        case 'registro.html': return 'Registro';
        case 'seguimiento.html': return 'Seguimiento';
        default: return 'Bienvenido';
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('usuario');
    window.location.href = 'index.html';
}
