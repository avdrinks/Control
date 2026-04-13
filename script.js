const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbw5g1fL39NooFtXgkTAYVbnf3bxkYTB5o10I9APAbxq8Vrz1Zbnoe5u93aTQXssGy_8/exec";

// 1. FUNCIÓN PARA CAMBIAR DE PANTALLA
function openView(viewId) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    // Mostrar la vista que pedimos
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
    }
}

// 2. FUNCIÓN PARA GUARDAR PRODUCTOS (Múltiples sabores)
async function guardarNuevo() {
    const btn = event.target;
    const nombrePadre = document.getElementById('n-nombre').value;
    const saboresTexto = document.getElementById('n-sabores').value;

    if (!nombrePadre || !saboresTexto) {
        alert("Completá el nombre y los sabores");
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
                padre: nombrePadre,
                sabor: sabor,
                pCompra: document.getElementById('n-compra').value,
                pVenta: document.getElementById('n-venta').value,
                pPromo: 0, // Si no tenés el campo en el HTML lo mandamos en 0
                mezclador: document.getElementById('n-mezclador').value
            };
            await fetch(URL_WEB_APP, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        }
        alert("¡Producto(s) guardado(s) con éxito!");
        location.reload();
    } catch (e) {
        alert("Error al conectar con la base de datos");
        btn.disabled = false;
        btn.innerText = "GUARDAR PRODUCTO";
    }
}

// 3. FUNCIÓN PARA VER QUÉ COMPRAR
async function actualizarFaltantes() {
    openView('v-comprar');
    const div = document.getElementById('lista-faltantes');
    div.innerHTML = "Escaneando stock...";

    try {
        const res = await fetch(URL_WEB_APP);
        const datos = await res.json();
        
        let agrupado = {};
        for (let i = 1; i < datos.length; i++) {
            let padre = datos[i][0];
            let sabor = datos[i][1];
            let stock = datos[i][2];

            if (stock <= 0) {
                if (!agrupado[padre]) agrupado[padre] = [];
                agrupado[padre].push(sabor + " (" + stock + ")");
            }
        }

        if (Object.keys(agrupado).length === 0) {
            div.innerHTML = "<p style='color: #39ff14;'>✅ Todo en stock</p>";
        } else {
            div.innerHTML = "";
            for (let p in agrupado) {
                div.innerHTML += `
                    <div style="border: 1px solid #ff00ff; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
                        <strong style="color: #00d4ff;">${p}</strong><br>
                        <small>${agrupado[p].join(", ")}</small>
                    </div>`;
            }
        }
    } catch (e) {
        div.innerHTML = "Error al leer el Excel.";
    }
}

// 4. BUSCADOR DE VENTAS
function buscarVenta() {
    const term = document.getElementById('busqueda').value.toLowerCase();
    const lista = document.getElementById('lista-ventas');
    lista.innerHTML = "";

    if (term.length < 2) return;

    // Aquí podrías cargar los productos reales, por ahora una prueba
    const items = [{n: "Ejemplo Skyy", p: 12000}]; 
    items.forEach(i => {
        if(i.n.toLowerCase().includes(term)) {
            lista.innerHTML += `<div class="item-busqueda">
                <span>${i.n}</span>
                <button onclick="alert('Venta registrada')">Vender $${i.p}</button>
            </div>`;
        }
    });
}
