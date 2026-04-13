// CONFIGURACIÓN INICIAL
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

function openView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// 1. CARGAR PRODUCTO(S) NUEVO(S) - Maneja múltiples sabores separados por coma
async function guardarNuevo() {
    const btn = event.target;
    const saboresTexto = document.getElementById('n-sabor').value;
    
    if (!saboresTexto) {
        alert("Por favor, ingresá al menos un sabor.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Procesando...";

    const listaSabores = saboresTexto.split(',').map(s => s.trim());
    const datosBase = {
        tipo: "NUEVO_PRODUCTO",
        padre: document.getElementById('n-padre').value,
        pCompra: document.getElementById('n-compra').value,
        pVenta: document.getElementById('n-solo').value,
        pPromo: document.getElementById('n-promo').value,
        mezclador: document.getElementById('n-mezclador').value
    };

    // Envía cada sabor como una fila nueva al Sheets
    try {
        for (let sabor de listaSabores) {
            if (sabor === "") continue;
            const dataFinal = { ...datosBase, sabor: sabor };
            await fetch(URL_WEB_APP, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify(dataFinal) 
            });
        }
        alert("¡" + listaSabores.length + " variante(s) guardada(s) en STOCK!");
        location.reload();
    } catch (e) {
        alert("Error de conexión. Reintentá.");
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// 2. REGISTRAR VENTA (Individual o Promo con descuento de mezclador)
async function registrarVenta(detalle, sabor, monto, esPromo, nombreMezclador) {
    const metodo = document.getElementById('metodo-pago').value;
    
    const data = {
        tipo: "VENTA",
        detalle: detalle, // Producto Padre o nombre de la Promo
        sabor: sabor,
        monto: monto,
        metodo: metodo,
        esPromo: esPromo,
        mezclador: nombreMezclador // El Apps Script usará esto para restar stock de la gaseosa
    };

    try {
        await fetch(URL_WEB_APP, { 
            method: 'POST', 
            mode: 'no-cors', 
            body: JSON.stringify(data) 
        });
        alert("Venta registrada con éxito.");
        openView('home');
    } catch (e) {
        alert("Error al registrar venta.");
    }
}

// 3. REGISTRAR COMPRA (REPOSICIÓN DE STOCK)
async function guardarCompra() {
    const data = {
        tipo: "COMPRA",
        padre: document.getElementById('c-padre').value,
        sabor: document.getElementById('c-sabor').value,
        cantidad: document.getElementById('c-cantidad').value,
        costo: document.getElementById('c-costo').value
    };

    try {
        await fetch(URL_WEB_APP, { 
            method: 'POST', 
            mode: 'no-cors', 
            body: JSON.stringify(data) 
        });
        alert("Compra cargada. El Stock se actualizará en unos segundos.");
        openView('home');
    } catch (e) {
        alert("Error al cargar compra.");
    }
}

// 4. LÓGICA "QUÉ COMPRAR" (Analiza la columna C de la hoja STOCK)
async function verQueComprar() {
    openView('v-comprar');
    const lista = document.getElementById('lista-faltantes');
    lista.innerHTML = "Escaneando depósitos...";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let faltantes = {};
        // Empezamos en i=1 para saltar los encabezados de las columnas
        for (let i = 1; i < datos.length; i++) {
            let padre = datos[i][0];   // Columna A
            let sabor = datos[i][1];   // Columna B
            let stock = datos[i][2];   // Columna C

            if (stock <= 0) {
                if (!faltantes[padre]) faltantes[padre] = [];
                faltantes[padre].push(sabor + " (Stock: " + stock + ")");
            }
        }

        const keys = Object.keys(faltantes);
        if (keys.length === 0) {
            lista.innerHTML = "<p style='color:#39ff14;'>✅ Stock completo. No falta nada.</p>";
            return;
        }

        lista.innerHTML = "";
        keys.forEach(p => {
            lista.innerHTML += `
                <div style="border: 1px solid #ff00ff; padding: 15px; margin-bottom: 10px; border-radius: 10px; background: #121212;">
                    <strong style="color: #00d4ff; text-transform: uppercase;">${p}</strong><br>
                    <span style="font-size: 0.85rem; color: #eee;">${faltantes[p].join('<br>')}</span>
                </div>
            `;
        });
    } catch (e) {
        lista.innerHTML = "Error al conectar con la base de datos.";
    }
}

// 5. BUSCADOR DE VENTAS (Simulación de búsqueda en tiempo real)
// En una versión avanzada, aquí podrías cargar db_productos desde el doGet
function buscarVenta() {
    const term = document.getElementById('busqueda').value.toLowerCase();
    const lista = document.getElementById('lista-ventas');
    
    if (term.length < 2) {
        lista.innerHTML = "";
        return;
    }

    // Nota: Aquí se suelen filtrar los productos que ya cargaste en el sistema
    // Esta parte se puede conectar con los datos de STOCK para que sea dinámica
}
