// PEGA AQUÍ LA URL DE TU GOOGLE APPS SCRIPT
const WEB_APP_URL = "TU_URL_DE_APPS_SCRIPT_AQUI";

let db_productos = []; // Aquí se cargará tu stock real

function openView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Buscar productos mientras escribes
function buscarVenta() {
    const term = document.getElementById('busqueda').value.toLowerCase();
    const lista = document.getElementById('lista-ventas');
    lista.innerHTML = "";

    if(term.length < 2) return;

    // Simulación de búsqueda (luego se usará db_productos)
    const mockData = [
        {nombre: "Promo Skyy", precio: 15000, tipo: "PROMO"},
        {nombre: "Fernet Branca", precio: 12000, tipo: "SOLO"}
    ];

    mockData.forEach(p => {
        if(p.nombre.toLowerCase().includes(term)) {
            lista.innerHTML += `
                <div class="item-busqueda">
                    <span>${p.nombre} - $${p.precio}</span>
                    <button class="btn-save" style="width:auto;" onclick="registrarVenta('${p.nombre}', ${p.precio})">VENDER</button>
                </div>
            `;
        }
    });
}

async function registrarVenta(prod, precio) {
    const metodo = document.getElementById('metodo-pago').value;
    const data = { tipo: "VENTA", producto: prod, precioVenta: precio, metodo: metodo };

    // Enviar a Google Sheets
    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        });
        alert("Venta registrada: " + prod + " (" + metodo + ")");
        openView('home');
    } catch (e) {
        alert("Error al conectar con la base de datos");
    }
}

function actualizarFaltantes() {
    openView('v-comprar');
    const lista = document.getElementById('lista-faltantes');
    lista.innerHTML = "<p>Buscando en stock negativo...</p>";
    // Aquí iría la lógica que agrupa por "Padre"
}

function guardarNuevo() {
    const nombre = document.getElementById('n-nombre').value;
    alert("Producto " + nombre + " enviado al Excel.");
    openView('home');
}
