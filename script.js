const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzksoGVhvKzDmTYXw1p88VmGTSi0-UICbL0Nc7sg73dUVttc27RedDu5NypfcE1R0DK/exec";

// Función para navegar entre pantallas
function openView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
}

// 1. CARGAR PRODUCTO NUEVO (Escribe en STOCK)
async function guardarNuevo() {
    const btn = event.target;
    const padre = document.getElementById('n-nombre').value;
    const saboresTexto = document.getElementById('n-sabores').value;

    if (!padre || !saboresTexto) {
        alert("Completá el nombre y los sabores.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Guardando...";

    const listaSabores = saboresTexto.split(',').map(s => s.trim());
    
    try {
        for (let sabor de listaSabores) {
            if (sabor === "") continue;
            const data = {
                tipo: "NUEVO_PRODUCTO",
                padre: padre,
                sabor: sabor,
                pCompra: document.getElementById('n-compra').value || 0,
                pVenta: document.getElementById('n-venta').value || 0,
                pPromo: 0,
                mezclador: document.getElementById('n-mezclador').value || ""
            };
            await fetch(URL_WEB_APP, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        }
        alert("¡Producto(s) guardado(s)!");
        location.reload();
    } catch (e) {
        alert("Error al guardar");
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// 2. QUÉ COMPRAR (Lee de STOCK)
async function actualizarFaltantes() {
    openView('v-comprar');
    const div = document.getElementById('lista-faltantes');
    div.innerHTML = "Analizando stock...";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let html = "";
        // Saltamos fila 1 (encabezados)
        for (let i = 1; i < datos.length; i++) {
            let stock = datos[i][2];
            if (stock <= 0) {
                html += `<div style="border:1px solid #ff00ff; padding:10px; margin-bottom:10px; border-radius:8px;">
                            <strong style="color:#00d4ff;">${datos[i][0]}</strong><br>
                            <small>Sabor: ${datos[i][1]} | Stock: ${stock}</small>
                         </div>`;
            }
        }
        div.innerHTML = html || "Todo el stock está ok ✅";
    } catch (e) {
        div.innerHTML = "Error al conectar con la base de datos.";
    }
}
