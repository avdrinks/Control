const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

// 1. NAVEGACIÓN - Abre y cierra las pantallas
function openView(viewId) {
    console.log("Cambiando a vista:", viewId);
    // Ocultar todas las vistas (buscamos por la clase 'view')
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    // Mostrar la vista que pedimos por ID
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error("No se encontró la vista:", viewId);
    }
}

// 2. GUARDAR PRODUCTO NUEVO (Soporta múltiples sabores)
async function guardarNuevo() {
    const btn = event.target;
    const nombrePadre = document.getElementById('n-nombre').value;
    const saboresTexto = document.getElementById('n-sabores').value;

    if (!nombrePadre || !saboresTexto) {
        alert("Por favor, completa el nombre y los sabores.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Guardando...";

    // Dividimos los sabores por coma y quitamos espacios
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
        alert("¡" + listaSabores.length + " variantes guardadas con éxito!");
        location.reload(); 
    } catch (e) {
        alert("Error de conexión con el servidor.");
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// 3. ACTUALIZAR FALTANTES (Qué Comprar)
async function actualizarFaltantes() {
    openView('v-comprar');
    const div = document.getElementById('lista-faltantes');
    div.innerHTML = "<p style='color: #00d4ff;'>Analizando stock en el Excel...</p>";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let faltantes = {};
        // Empezamos en i=1 para saltar los encabezados del Sheets
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
            div.innerHTML = "<p style='color: #39ff14;'>✅ Todo el stock está al día.</p>";
        } else {
            div.innerHTML = "";
            for (let p in faltantes) {
                div.innerHTML += `
                    <div style="border: 1px solid #ff00ff; padding: 12px; margin-bottom: 10px; border-radius: 8px; background: #1a1a1a;">
                        <strong style="color: #00d4ff;">${p}</strong><br>
                        <small style="color: #eee;">Faltan: ${faltantes[p].join(", ")}</small>
                    </div>`;
            }
        }
    } catch (e) {
        div.innerHTML = "<p style='color: red;'>Error al leer la base de datos.</p>";
    }
}

// 4. BUSCADOR DE VENTAS (Básico)
function buscarVenta() {
    const term = document.getElementById('busqueda').value.toLowerCase();
    const lista = document.getElementById('lista-ventas');
    lista.innerHTML = "";
    if (term.length < 2) return;
    console.log("Buscando producto:", term);
}
.
