/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// ==========================================
// 1. CONFIGURACIÓN DE LA BASE DE DATOS
// ==========================================
// Creamos una base de datos llamada 'RestauranteDB'
const db = new Dexie("RestauranteDB");

// Definimos la tabla 'pedidos' y su llave primaria autoincrementable (id)
db.version(1).stores({
    pedidos: '++id, plato, bebida, extras, total, fecha'
});

// ==========================================
// 2. EVENTO DEL FORMULARIO
// ==========================================
document.getElementById('formularioRestaurante').addEventListener('submit', async function(event) {
    event.preventDefault();

    const PRECIOS = {
        pizza: 140.00,
        hamburguesa: 55.50,
        pequena: 3.00,
        mediana: 5.50,
        grande: 10.00,
        papas: 34.50,
        helado: 16.80
    };

    let cuentaDetalle = "<strong>🧾 DETALLE DE TU PEDIDO:</strong><br><hr>";
    let total = 0;

    // Capturar Plato
    const plato = document.getElementById('platoPrincipal').value;
    if (plato === 'pizza') {
        total += PRECIOS.pizza;
        cuentaDetalle += `• Pizza Familiar: Q${PRECIOS.pizza.toFixed(2)}<br>`;
    } else if (plato === 'hamburguesa') {
        total += PRECIOS.hamburguesa;
        cuentaDetalle += `• Hamburguesa con Queso: Q${PRECIOS.hamburguesa.toFixed(2)}<br>`;
    }

    // Capturar Bebida 
    const bebidaSeleccionada = document.querySelector('input[name="tamanoBebida"]:checked').value;
    total += PRECIOS[bebidaSeleccionada];
    cuentaDetalle += `• Bebida (${bebidaSeleccionada}): Q${PRECIOS[bebidaSeleccionada].toFixed(2)}<br>`;

    // Capturar Extras
    const quierePapas = document.getElementById('extraPapas').checked;
    const quiereHelado = document.getElementById('extraHelado').checked;
    let listaExtras = [];

    if (quierePapas) {
        total += PRECIOS.papas;
        listaExtras.push("Papas Fritas");
        cuentaDetalle += `• Extra Papas Fritas: Q${PRECIOS.papas.toFixed(2)}<br>`;
    }
    if (quiereHelado) {
        total += PRECIOS.helado;
        listaExtras.push("Helado");
        cuentaDetalle += `• Extra Helado: Q${PRECIOS.helado.toFixed(2)}<br>`;
    }

    cuentaDetalle += `<hr><strong>💰 TOTAL A PAGAR: Q${total.toFixed(2)}</strong>`;

    // Mostrar el recibo en pantalla
    const areaRecibo = document.getElementById('reciboRespuesta');
    areaRecibo.innerHTML = cuentaDetalle;
    areaRecibo.style.display = "block";

    // ==========================================
    // 3. GUARDAR LOS DATOS EN LA BASE DE DATOS
    // ==========================================
    try {
        await db.pedidos.add({
            plato: plato,
            bebida: bebidaSeleccionada,
            extras: listaExtras.join(", ") || "Ninguno",
            total: total,
            fecha: new Date().toLocaleString() // Guarda fecha y hora del sistema
        });
        
        console.log("¡Pedido guardado con éxito en la base de datos!");
    } catch (error) {
        console.error("Error al guardar en la base de datos: ", error);
    }
});

// ==========================================
// FUNCIONALIDAD DE ADMINISTRACIÓN
// ==========================================

// Función para leer la BD y pintar los pedidos en el HTML
async function actualizarHistorialPantalla() {
    const divHistorial = document.getElementById('tablaHistorial');
    
    const todosLosPedidos = await db.pedidos.toArray();
    
    if (todosLosPedidos.length === 0) {
        divHistorial.innerHTML = "<p style='text-align:center; color:#6c757d;'>No hay pedidos registrados todavía.</p>";
        return;
    }

    let htmlContenido = "";
    let gananciasTotales = 0;

    todosLosPedidos.forEach(function(pedido) {
        gananciasTotales += pedido.total;
        htmlContenido += `
            <div class="item-pedido">
                <strong>Pedido #${pedido.id}</strong> — 📅 ${pedido.fecha}<br>
                🍕 Plato: ${pedido.plato} | 🥤 Bebida: ${pedido.bebida}<br>
                🍟 Extras: ${pedido.extras}<br>
                💰 Subtotal: <strong>Q${pedido.total.toFixed(2)}</strong>
            </div>
        `;
    });

    htmlContenido = `<strong>📈 Caja Total: Q${gananciasTotales.toFixed(2)}</strong><br><hr>` + htmlContenido;
    divHistorial.innerHTML = htmlContenido;
}

// BOTÓN 1: Mostrar / Ocultar Historial
document.getElementById('btnVerHistorial').addEventListener('click', async function() {
    const divHistorial = document.getElementById('tablaHistorial');
    
    if (divHistorial.style.display === "none" || divHistorial.style.display === "") {
        await actualizarHistorialPantalla();
        divHistorial.style.display = "block"; 
    } else {
        divHistorial.style.display = "none";  
    }
});

// BOTÓN 2: Vaciar toda la Base de Datos
document.getElementById('btnBorrarHistorial').addEventListener('click', async function() {
    const confirmar = confirm("⚠ ¿Estás seguro de que deseas eliminar TODOS los pedidos del historial?");
    
    if (confirmar) {
        await db.pedidos.clear(); 
        alert("Base de datos vaciada con éxito.");
        actualizarHistorialPantalla();
    }
});