const API_URL = 'https://script.google.com/macros/s/AKfycbxaSYJNiB5ZHMOTaL8aCt1Amjyc5OjCh_RSuWH1PLLVh27P8Pxn5-kfXzNAgvWPr7kaSA/exec';

async function login(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    
    const script = document.createElement('script');
    const callbackName = 'loginCallback_' + Math.round(100000 * Math.random());
    
    return new Promise((resolve, reject) => {
        window[callbackName] = function(response) {
            delete window[callbackName];
            document.body.removeChild(script);
            
            if (response.error) {
                alert(response.message);
                return;
            }
            
            if (response.success) {
                // Guardar datos del usuario en sessionStorage
                sessionStorage.setItem('usuario', JSON.stringify(response.usuario));
                // Redirigir al dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        };
        
        const params = new URLSearchParams({
            action: 'login',
            callback: callbackName,
            usuario: usuario,
            password: password
        });
        
        script.src = `${API_URL}?${params.toString()}`;
        document.body.appendChild(script);
    });
}
