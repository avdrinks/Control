// CONFIGURACIÓN: Tu URL de Google Apps Script
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

// Función para navegar entre pantallas
function openView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.add('active');
    }
}

// 1. CARGAR PRODUCTO NUEVO (Escribe en la hoja STOCK)
// Soporta múltiples sabores separados por coma
async function guardarNuevo() {
    const btn = event.target;
    const padre = document.getElementById('n-padre').value;
    const saborInput = document.getElementById('n-sabor').value;

    if (!padre || !saborInput) {
        alert("Completá el nombre y al menos un sabor.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Guardando...";

    const listaSabores = saborInput.split(',').map(s => s.trim());
    
    try {
        for (let sabor de listaSabores) {
            if (sabor === "") continue;
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
        alert("¡Producto(s) creado(s) con éxito!");
        location.reload();
    } catch (e) {
        alert("Error al guardar: " + e);
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// 2. REGISTRAR VENTA (Escribe en la hoja VENTAS)
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

// 3. REGISTRAR COMPRA (Escribe en la hoja COMPRAS)
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

// 4. LÓGICA DE "QUÉ COMPRAR" (Lee de la hoja STOCK)
async function verQueComprar() {
    openView('v-comprar');
    const lista = document.getElementById('lista-faltantes');
    lista.innerHTML = "Analizando inventario...";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let agrupado = {};
        // i=1 para saltar el encabezado
        for (let i = 1; i < datos.length; i++) {
            let padre = datos[i][0];
            let sabor = datos[i][1];
            let stock = datos[i][2];

            if (stock <= 0) {
                if (!agrupado[padre]) agrupado[padre] = [];
                agrupado[padre].push(sabor + " (Stock: " + stock + ")");
            }
        }

        if (Object.keys(agrupado).length === 0) {
            lista.innerHTML = "<p style='color:#39ff14;'>Todo está en stock. ✅</p>";
        } else {
            lista.innerHTML = "";
            for (let p in agrupado) {
                lista.innerHTML += `
                    <div style="border:1px solid #ff00ff; padding:10px; margin-bottom:10px; border-radius:8px;">
                        <strong style="color:#00d4ff;">COMPRAR ${p}:</strong><br>
                        <small>${agrupado[p].join(", ")}</small>
                    </div>`;
            }
        }
    } catch (e) {
        lista.innerHTML = "Error al leer stock.";
    }
}

// 5. BUSCADOR DE VENTAS
function buscarVenta() {
    const term = document.getElementById('busqueda').value.toLowerCase();
    const lista = document.getElementById('lista-ventas');
    lista.innerHTML = "";

    if(term.length < 2) return;

    // Aquí iría la carga de db_productos real, por ahora usamos datos de prueba:
    const mockData = [
        {nombre: "Promo Skyy", precio: 15000, sabor: "Frutos Rojos"},
        {nombre: "Fernet Branca", precio: 12000, sabor: "750ml"}
    ];

    mockData.forEach(p => {
        if(p.nombre.toLowerCase().includes(term)) {
            lista.innerHTML += `
                <div class="item-busqueda">
                    <span>${p.nombre} - $${p.precio}</span>
                    <button class="btn-save" style="width:auto; padding:5px 10px;" onclick="registrarVenta('${p.nombre}', '${p.sabor}', ${p.precio})">VENDER</button>
                </div>
            `;
        }
    });
}
