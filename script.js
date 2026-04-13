const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

// FUNCIÓN PARA ABRIR PANTALLAS (Asegurate que el ID coincida con el HTML)
function openView(viewId) {
    console.log("Intentando abrir vista:", viewId);
    // Oculta todas las vistas
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });
    // Muestra la elegida
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        targetView.style.display = 'block';
    } else {
        console.error("No se encontró la vista con ID:", viewId);
    }
}

// CARGAR PRODUCTO NUEVO
async function guardarNuevo() {
    const btn = event.target;
    const padre = document.getElementById('n-padre').value;
    const saboresTexto = document.getElementById('n-sabor').value;

    if (!padre || !saboresTexto) {
        alert("Faltan datos");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Guardando...";

    const listaSabores = saboresTexto.split(',').map(s => s.trim());
    
    try {
        for (let sabor de listaSabores) {
            if (!sabor) continue;
            const data = {
                tipo: "NUEVO_PRODUCTO",
                padre: padre,
                sabor: sabor,
                pCompra: document.getElementById('n-compra').value,
                pVenta: document.getElementById('n-solo').value,
                pPromo: document.getElementById('n-promo').value,
                mezclador: document.getElementById('n-mezclador').value
            };
            await fetch(URL_WEB_APP, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        }
        alert("Guardado con éxito");
        location.reload();
    } catch (e) {
        alert("Error al conectar");
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// OTRAS FUNCIONES (Vacías por ahora para que no rompan el código)
async function registrarVenta() { alert("Función de venta en desarrollo"); }
async function guardarCompra() { alert("Función de compra en desarrollo"); }
async function verQueComprar() { openView('v-comprar'); }
function buscarVenta() { console.log("Buscando..."); }
