const URL_GAS = "https://script.google.com/macros/s/AKfycbyi1Zzt7kqaBjxqRI7M9RRo0yyKUX-PJfivSoPpEuaBJfpja22nepLIT3W8CcDG8jhhzw/exec"; // Asegurate que termine en /exec

let database = { productos: [], stock: [], sucursales: [] };
let itemActivo = null;

// CARGA INICIAL: Trae todo de una vez
async function cargarApp() {
    try {
        const response = await fetch(URL_GAS);
        const data = await response.json();
        database.productos = data.productos;
        database.stock = data.stock;
        database.sucursales = data.sucursales;
        
        initSelects();
        renderStock();
    } catch (e) {
        console.error("Error cargando base de datos", e);
    }
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    // Marcar botón activo
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function initSelects() {
    const sucs = database.sucursales.slice(1); // Saltar encabezado
    const idsSelect = ['ven-sucursal', 'filtro-sucursal'];
    
    idsSelect.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = id.includes('filtro') ? '<option value="TODAS">Todas las Sucursales</option>' : '';
        sucs.forEach(s => {
            el.innerHTML += `<option value="${s[0]}">${s[0]}</option>`;
        });
    });
}

// BUSCADOR EN TIEMPO REAL
function filtrarVenta() {
    const query = document.getElementById('ven-buscar').value.toLowerCase();
    const resultados = document.getElementById('res-busqueda');
    resultados.innerHTML = "";
    
    if (query.length < 2) return;

    // Buscamos en la hoja PRODUCTOS (saltando el encabezado)
    database.productos.slice(1).forEach(p => {
        const nombreMatch = p[1].toLowerCase().includes(query);
        const saborMatch = p[2].toLowerCase().includes(query);
        
        if (nombreMatch || saborMatch) {
            const div = document.createElement('div');
            div.className = "search-item";
            div.innerHTML = `<strong>${p[1]}</strong> - <small>${p[2]}</small> <span>($${p[3]})</span>`;
            div.onclick = () => seleccionarParaVenta(p);
            resultados.appendChild(div);
        }
    });
}

function seleccionarParaVenta(prod) {
    itemActivo = prod;
    document.getElementById('ven-prod-nom').innerText = `${prod[1]} ${prod[2]}`;
    document.getElementById('ven-detalles').style.display = "block";
    document.getElementById('res-busqueda').innerHTML = "";
}

// ENVÍO DE DATOS
async function ejecutarVenta() {
    const sucursal = document.getElementById('ven-sucursal').value;
    if(!sucursal) return alert("Seleccioná sucursal");

    const btn = event.currentTarget;
    btn.innerText = "Registrando...";
    btn.disabled = true;

    const venta = {
        tipo: "VENTA",
        idProd: itemActivo[0],
        sucursal: sucursal,
        cant: document.getElementById('ven-cant').value,
        monto: itemActivo[3] * document.getElementById('ven-cant').value,
        pago: document.getElementById('ven-pago').value
    };

    await enviarDatos(venta);
}

async function enviarDatos(data) {
    try {
        await fetch(URL_GAS, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        });
        alert("¡Operación Exitosa!");
        location.reload();
    } catch (e) {
        alert("Error de conexión");
        console.error(e);
    }
}

function renderStock() {
    const filtro = document.getElementById('filtro-sucursal').value;
    const tabla = document.getElementById('lista-stock');
    tabla.innerHTML = "";

    database.stock.slice(1).forEach(s => {
        if (filtro === "TODAS" || s[1] === filtro) {
            // Buscamos info del producto para mostrar nombre y sabor
            const infoProd = database.productos.find(p => p[0] === s[0]) || ["?", "Prod. Eliminado", ""];
            tabla.innerHTML += `
                <tr>
                    <td>${infoProd[1]}</td>
                    <td>${infoProd[2]}</td>
                    <td>${s[1]}</td>
                    <td><b style="color:var(--accent)">${s[2]}</b></td>
                </tr>`;
        }
    });
}

// Iniciar al cargar
window.onload = cargarApp;
