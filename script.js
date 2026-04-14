Const URL_GAS = "https://script.google.com/macros/s/AKfycbyi1Zzt7kqaBjxqRI7M9RRo0yyKUX-PJfivSoPpEuaBJfpja22nepLIT3W8CcDG8jhhzw/exec"; // REEMPLAZA ESTO

let db = { productos: [], stock: [], sucursales: [] };
let prodSeleccionado = null;

async function cargarBase() {
    const res = await fetch(URL_GAS);
    db = await res.json();
    poblarSucursales();
    renderStock();
}

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function poblarSucursales() {
    const selects = ['ven-sucursal', 'com-sucursal', 'tra-origen', 'tra-destino', 'filtro-sucursal'];
    const sucs = db.sucursales.slice(1); // Saltar encabezado
    selects.forEach(sId => {
        const el = document.getElementById(sId);
        el.innerHTML = sId.includes('filtro') ? '<option value="TODAS">Todas las Sucursales</option>' : '';
        sucs.forEach(s => el.innerHTML += `<option value="${s[0]}">${s[0]}</option>`);
    });
}

// BUSCADOR GENÉRICO
function filtrarVenta() {
    const term = document.getElementById('ven-buscar').value.toLowerCase();
    const res = document.getElementById('res-busqueda');
    res.innerHTML = "";
    if(term.length < 2) return;
    
    db.productos.slice(1).forEach(p => {
        if(p[1].toLowerCase().includes(term) || p[2].toLowerCase().includes(term)) {
            const div = document.createElement('div');
            div.className = "search-item";
            div.innerText = `${p[1]} - ${p[2]} ($${p[3]})`;
            div.onclick = () => {
                prodSeleccionado = p;
                document.getElementById('ven-prod-nom').innerText = "Producto: " + p[1] + " " + p[2];
                document.getElementById('ven-detalles').style.display = "block";
                res.innerHTML = "";
            };
            res.appendChild(div);
        }
    });
}

// REGISTROS
async function ejecutarVenta() {
    const data = {
        tipo: "VENTA",
        idProd: prodSeleccionado[0],
        sucursal: document.getElementById('ven-sucursal').value,
        cant: document.getElementById('ven-cant').value,
        monto: prodSeleccionado[3] * document.getElementById('ven-cant').value,
        pago: document.getElementById('ven-pago').value
    };
    await enviar(data);
}

async function crearProducto() {
    const data = {
        tipo: "NUEVO_PROD",
        padre: document.getElementById('p-padre').value,
        sabor: document.getElementById('p-sabor').value,
        precio: document.getElementById('p-precio').value,
        promo: document.getElementById('p-promo').value,
        mezclador: document.getElementById('p-mezcla').value
    };
    await enviar(data);
}

async function enviar(data) {
    try {
        await fetch(URL_GAS, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        alert("Operación Exitosa");
        location.reload();
    } catch(e) { alert("Error al conectar"); }
}

function renderStock() {
    const filtro = document.getElementById('filtro-sucursal').value;
    const body = document.getElementById('lista-stock');
    body.innerHTML = "";
    
    db.stock.slice(1).forEach(s => {
        if(filtro === "TODAS" || s[1] === filtro) {
            const prod = db.productos.find(p => p[0] === s[0]) || ["?", "Desconocido", ""];
            body.innerHTML += `<tr><td>${prod[1]}</td><td>${prod[2]}</td><td>${s[1]}</td><td>${s[2]}</td></tr>`;
        }
    });
}

// Iniciar carga
cargarBase();
