// Tu URL personalizada ya integrada
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// 1. CARGAR PRODUCTO NUEVO (Escribe en STOCK)
async function guardarNuevo() {
    const data = {
        tipo: "NUEVO_PRODUCTO",
        padre: document.getElementById('n-padre').value,
        sabor: document.getElementById('n-sabor').value,
        pCompra: document.getElementById('n-compra').value,
        pVenta: document.getElementById('n-solo').value,
        pPromo: document.getElementById('n-promo').value,
        mezclador: document.getElementById('n-mezclador').value
    };

    try {
        await fetch(URL_WEB_APP, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        alert("¡Producto agregado a STOCK!");
        location.reload(); 
    } catch (e) {
        alert("Error al guardar: " + e);
    }
}

// 2. REGISTRAR VENTA (Escribe en VENTAS)
async function registrarVenta(detalle, sabor, monto) {
    const metodo = document.getElementById('metodo-pago').value;
    const data = {
        tipo: "VENTA",
        detalle: detalle,
        sabor: sabor,
        monto: monto,
        metodo: metodo
    };

    try {
        await fetch(URL_WEB_APP, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        alert("Venta registrada con éxito");
        openView('home');
    } catch (e) {
        alert("Error en la venta: " + e);
    }
}

// 3. REGISTRAR COMPRA (Escribe en COMPRAS)
async function guardarCompra() {
    const data = {
        tipo: "COMPRA",
        padre: document.getElementById('c-padre').value,
        sabor: document.getElementById('c-sabor').value,
        cantidad: document.getElementById('c-cantidad').value,
        costo: document.getElementById('c-costo').value
    };

    try {
        await fetch(URL_WEB_APP, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        alert("Compra registrada y stock actualizado");
        openView('home');
    } catch (e) {
        alert("Error al cargar compra: " + e);
    }
}

// 4. LÓGICA DE "QUÉ COMPRAR" (Lee de STOCK)
async function verQueComprar() {
    openView('v-comprar');
    const lista = document.getElementById('lista-faltantes');
    lista.innerHTML = "Analizando inventario...";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let agrupado = {};
        // Empezamos en i=1 para saltar encabezados
        for (let i = 1; i < datos.length; i++) {
            let padre = datos[i][0];
            let sabor = datos[i][1];
            let stock = datos[i][2];

            if (stock <= 0) {
                if (!agrupado[padre]) agrupado[padre] = [];
                agrupado[padre].push(sabor);
            }
        }

        lista.innerHTML = Object.keys(agrupado).length > 0 ? "" : "Todo está en stock.";
        for (let p in agrupado) {
            lista.innerHTML += `
                <div style="border:1px solid #ff00ff; padding:10px; margin-bottom:10px; border-radius:8px;">
                    <strong style="color:#00d4ff;">COMPRAR ${p}:</strong><br>
                    <small>Detalle: ${agrupado[p].join(", ")}</small>
                </div>`;
        }
    } catch (e) {
        lista.innerHTML = "Error al leer stock.";
    }
}
