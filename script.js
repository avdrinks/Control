const URL_GAS = "https://script.google.com/macros/s/AKfycbxPrH4AEuEGFblYCAEpvre7Gq1HK6DWqLe3KIGYLuzCHl5xINYSFRDOovlXhBU23qBpsA/exec";
let db = { productos: [], sucursales: [], stock: [] };
let seleccionado = null;

async function cargar() {
    const res = await fetch(URL_GAS);
    db = await res.json();
    poblarSucs();
    actualizarReposicion();
}

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function filtrar(modo) {
    const q = document.getElementById(modo + '-buscar').value.toLowerCase();
    const res = document.getElementById('res-' + modo);
    res.innerHTML = "";
    if (q.length < 2) return;

    db.productos.slice(1).forEach(p => {
        if (p[1].toLowerCase().includes(q) || p[2].toLowerCase().includes(q)) {
            const div = document.createElement('div');
            div.className = "search-item";
            div.innerHTML = `<strong>${p[1]}</strong> - ${p[2]} <small>(${p[6]})</small>`;
            div.onclick = () => {
                seleccionado = p;
                document.getElementById('nom-' + modo).innerText = p[1] + " " + p[2];
                document.getElementById('det-' + modo).style.display = "block";
                res.innerHTML = "";
            };
            res.appendChild(div);
        }
    });
}

function agregarInputPromo() {
    const container = document.getElementById('lista-promos');
    const div = document.createElement('div');
    div.className = "promo-input-group";
    div.innerHTML = `
        <input type="text" placeholder="Mezclador (Ej: Sprite)" class="p-mezcla">
        <input type="number" placeholder="Cant (Ej: 2)" class="p-cant">
        <input type="number" placeholder="Precio Promo $" class="p-pre">
    `;
    container.appendChild(div);
}

async function registrar(tipo) {
    const btn = event.target;
    btn.disabled = true;
    btn.innerText = "Procesando...";

    let data = { tipo: tipo };

    if (tipo === 'NUEVO_PROD') {
        data.padre = document.getElementById('p-padre').value;
        data.sabor = document.getElementById('p-sabor').value;
        data.precio = document.getElementById('p-precio').value;
        data.stockIdeal = document.getElementById('p-ideal').value;
        data.promos = Array.from(document.querySelectorAll('.promo-input-group')).map(div => ({
            mezcla: div.querySelector('.p-mezcla').value,
            cantidad: div.querySelector('.p-cant').value,
            precio: div.querySelector('.p-pre').value
        }));
    } else if (tipo === 'VENTA') {
        data.idProd = seleccionado[0];
        data.idPadre = seleccionado[0].split('-')[0] + "-S"; // Identifica al padre para descontar stock
        data.sucursal = document.getElementById('ven-sucursal').value;
        data.cant = document.getElementById('cant-ven').value;
        data.monto = seleccionado[4] > 0 ? seleccionado[4] * data.cant : seleccionado[3] * data.cant;
        data.pago = document.getElementById('pago-ven').value;
    } else if (tipo === 'COMPRA') {
        data.idProd = seleccionado[0];
        data.sucursal = document.getElementById('com-sucursal').value;
        data.cant = document.getElementById('cant-com').value;
        data.costo = document.getElementById('costo-com').value;
    }

    await fetch(URL_GAS, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    alert("¡Registro realizado!");
    location.reload();
}

function actualizarReposicion() {
    const lista = document.getElementById('lista-reposicion');
    lista.innerHTML = "";
    db.productos.slice(1).forEach(p => {
        if (p[6] === "SOLO") {
            let totalStock = 0;
            db.stock.forEach(s => { if(s[0] === p[0]) totalStock += Number(s[2]); });
            if (totalStock < p[7]) {
                lista.innerHTML += `<li>⚠️ ${p[1]} ${p[2]}: Faltan ${p[7] - totalStock} unid.</li>`;
            }
        }
    });
}

async function cerrarSemana() {
    const res = await fetch(URL_GAS, { method: 'POST', body: JSON.stringify({tipo: 'CIERRE_SEMANA'}) });
    const rep = await res.json();
    document.getElementById('resumen-semanal').innerHTML = `
        <p>Inversión: <b>$${rep.inversion}</b></p>
        <p>Ventas: <b>$${rep.ventas}</b></p>
        <hr>
        <p>Ganancia: <b style="color:#00ff00">$${rep.ganancia}</b></p>
    `;
}

function poblarSucs() {
    ['ven-sucursal', 'com-sucursal'].forEach(id => {
        const el = document.getElementById(id);
        db.sucursales.slice(1).forEach(s => el.innerHTML += `<option value="${s[0]}">${s[0]}</option>`);
    });
}

window.onload = cargar;
