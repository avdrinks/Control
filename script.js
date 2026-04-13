// CONFIGURACIÓN: Tu URL de Google Apps Script
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

// 1. NAVEGACIÓN: Hace que los botones cambien de pantalla
function openView(viewId) {
    console.log("Cambiando a vista:", viewId);
    // Escondemos todas las vistas
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    // Mostramos la vista que corresponde
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error("No se encontró la vista con ID:", viewId);
    }
}

// 2. GUARDAR PRODUCTOS: Maneja el nombre y los múltiples sabores
async function guardarNuevo() {
    const btn = event.target;
    const nombrePadre = document.getElementById('n-nombre').value;
    const saboresTexto = document.getElementById('n-sabores').value;

    if (!nombrePadre || !saboresTexto) {
        alert("Completá el nombre y los sabores antes de guardar.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Guardando...";

    // Separamos los sabores por coma
    const listaSabores = saboresTexto.split(',').map(s => s.trim());

    try {
        for (let sabor de listaSabores) {
            if (sabor === "") continue;
            
            const data = {
                tipo: "NUEVO_PRODUCTO",
                padre: nombrePadre,
                sabor: sabor,
                pCompra: document.getElementById('n-compra').value || 0,
                pVenta: document.getElementById('n-venta').value || 0,
                pPromo: 0, 
                mezclador: document.getElementById('n-mezclador').value || ""
            };

            await fetch(URL_WEB_APP, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify(data) 
            });
        }
        alert("¡Productos cargados con éxito!");
        location.reload(); // Recarga la página para limpiar campos
    } catch (e) {
        alert("Error de conexión");
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// 3. ACTUALIZAR FALTANTES: Lee el stock del Excel
async function actualizarFaltantes() {
    openView('v-comprar');
    const div = document.getElementById('lista-faltantes');
    div.innerHTML = "<p>Buscando en el Excel...</p>";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let faltantes = {};
        // Empezamos en i=1 para saltar encabezados
        for (let i = 1; i < datos.length; i++) {
            let padre = datos[i][0];
            let sabor = datos[i][1];
            let stock = datos[i][2];

            if (stock <= 0) {
                if (!faltantes[padre]) faltantes[padre] = [];
                faltantes[padre].push(sabor + " (Stock: " + stock + ")");
            }
        }

        if (Object.keys(faltantes).length === 0) {
            div.innerHTML = "<p style='color:#39ff14;'>✅ Todo en stock.</p>";
        } else {
            div.innerHTML = "";
            for (let p in faltantes) {
                div.innerHTML += `
                    <div style="border: 1px solid #ff00ff; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
                        <strong style="color: #00d4ff;">${p}</strong><br>
                        <small>${faltantes[p].join(", ")}</small>
                    </div>`;
            }
        }
    } catch (e) {
        div.innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

// 4. BUSCADOR DE VENTAS (Mantenemos la función para que no tire error)
function buscarVenta() {
    console.log("Buscando...");
}
