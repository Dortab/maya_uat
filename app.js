// --- VARIABLES GLOBALES DEL CARRITO ---
// Leemos la memoria del navegador por si el cliente ya tenía cosas guardadas
let carrito = JSON.parse(localStorage.getItem('carritoMaya')) || [];
let productosCatalogo = []; // Aquí guardaremos los datos del JSON para buscarlos fácil

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DEL MENÚ MÓVIL (INTACTA) ---
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- 2. LÓGICA PARA ABRIR Y CERRAR EL PANEL DEL CARRITO ---
    const btnCarritoFlotante = document.getElementById('btn-carrito-flotante');
    const panelCarrito = document.getElementById('panel-carrito');
    const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
    const overlay = document.getElementById('carrito-overlay');

    if (btnCarritoFlotante && panelCarrito) {
        btnCarritoFlotante.addEventListener('click', () => {
            panelCarrito.classList.add('abierto');
            if(overlay) overlay.classList.add('abierto');
        });

        btnCerrarCarrito.addEventListener('click', () => {
            panelCarrito.classList.remove('abierto');
            if(overlay) overlay.classList.remove('abierto');
        });

        if(overlay) {
            overlay.addEventListener('click', () => {
                panelCarrito.classList.remove('abierto');
                overlay.classList.remove('abierto');
            });
        }
    }

    // --- 3. CARGA DINÁMICA DE PRODUCTOS DESDE JSON ---
    const contenedor = document.getElementById('contenedor-productos');
    
    if (contenedor) {
        cargarInventarioJSON();
    }

    async function cargarInventarioJSON() {
        try {
            contenedor.innerHTML = '<p style="text-align: center; width: 100%;">Cargando catálogo...</p>';
            const respuesta = await fetch('inventario.json');
            productosCatalogo = await respuesta.json(); // Guardamos los productos globalmente
            
            renderizarProductos(productosCatalogo);
            actualizarCarritoUI(); // Pintamos el carrito por si ya había cosas guardadas

        } catch (error) {
            console.error('Error al cargar el inventario JSON:', error);
            contenedor.innerHTML = '<p style="text-align: center; width: 100%; color: red;">Error al cargar el catálogo.</p>';
        }
    }

    function renderizarProductos(productos) {
        contenedor.innerHTML = '';

        productos.forEach(producto => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-categoria';

            let htmlTonos = '';
            if (producto.tonos && producto.tonos.length > 0) {
                let opciones = producto.tonos.map(tono => `<option value="${tono}">${tono}</option>`).join('');
                htmlTonos = `
                    <select class="select-tonos" id="tono-${producto.id}">
                        <option value="" disabled selected>Elige tu tono...</option>
                        ${opciones}
                    </select>
                `;
            }

            tarjeta.innerHTML = `
                <div>
                    <img src="productos/${producto.imagen}" alt="${producto.nombre}" onerror="this.src='logos/logo-sin-fondo.png'">
                    <h3 style="color: var(--rosa-palo); margin-bottom: 10px; font-size: 1.2rem;">${producto.nombre}</h3>
                    <p style="font-size: 0.9rem; color: gray; margin-bottom: 15px;">${producto.descripcion}</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 15px; font-size: 1.3rem;">$${producto.precio.toFixed(2)} MXN</h4>
                    ${htmlTonos}
                    <button class="btn-principal" onclick="agregarAlCarrito('${producto.id}')" style="width: 100%;">Añadir al carrito</button>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });
    }
});

// --- 4. LA VERDADERA LÓGICA DEL CARRITO DE COMPRAS ---

window.agregarAlCarrito = function(idProducto) {
    // 1. Buscamos la info del producto en nuestro catálogo global
    const producto = productosCatalogo.find(p => p.id === idProducto);
    if (!producto) return;

    // 2. Revisamos si es un producto con tonos
    let tonoSeleccionado = '';
    if (producto.tonos && producto.tonos.length > 0) {
        const selectTono = document.getElementById(`tono-${producto.id}`);
        tonoSeleccionado = selectTono.value;
        
        // Validación: Obligar a elegir un tono
        if (!tonoSeleccionado) {
            alert('Por favor, selecciona un tono antes de añadir el producto al carrito.');
            selectTono.focus();
            return;
        }
    }

    // 3. Revisamos si ese producto (con ese tono exacto) ya está en el carrito
    const indiceExistente = carrito.findIndex(item => item.id === idProducto && item.tono === tonoSeleccionado);

    if (indiceExistente !== -1) {
        // Si ya existe, solo le sumamos 1 a la cantidad
        carrito[indiceExistente].cantidad += 1;
    } else {
        // Si es nuevo, lo metemos al carrito
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            tono: tonoSeleccionado,
            cantidad: 1
        });
    }

    // 4. Guardamos en memoria y actualizamos la pantalla
    guardarCarrito();
    actualizarCarritoUI();

    // 5. Abrimos el panel lateral automáticamente para que el cliente vea que sí se agregó
    document.getElementById('panel-carrito').classList.add('abierto');
    const overlay = document.getElementById('carrito-overlay');
    if(overlay) overlay.classList.add('abierto');
};

// Función para guardar en el navegador
function guardarCarrito() {
    localStorage.setItem('carritoMaya', JSON.stringify(carrito));
}

// Función para repintar el carrito y calcular totales
window.actualizarCarritoUI = function() {
    const contenedorItems = document.getElementById('carrito-items');
    const contadorFlotante = document.getElementById('contador-carrito');
    const spanSubtotal = document.getElementById('carrito-subtotal');
    const spanEnvio = document.getElementById('carrito-envio');
    const spanTotal = document.getElementById('carrito-total');

    // Limpiamos la lista actual
    contenedorItems.innerHTML = '';

    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p style="text-align: center; color: gray; margin-top: 20px;">Tu carrito está vacío.</p>';
        contadorFlotante.innerText = '0';
        spanSubtotal.innerText = '$0.00';
        spanEnvio.innerText = '$0.00';
        spanTotal.innerText = '$0.00';
        return;
    }

    let subtotal = 0;
    let cantidadItems = 0;

    // Dibujamos cada producto del carrito
    carrito.forEach((item, index) => {
        subtotal += (item.precio * item.cantidad);
        cantidadItems += item.cantidad;

        const infoTono = item.tono ? `<br><small style="color: gray;">Tono: ${item.tono}</small>` : '';

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.marginBottom = '15px';
        div.style.borderBottom = '1px solid #eee';
        div.style.paddingBottom = '10px';

        div.innerHTML = `
            <div style="flex: 1; padding-right: 10px;">
                <h5 style="margin: 0; font-size: 0.95rem; color: var(--negro-mate);">${item.nombre}${infoTono}</h5>
                <p style="margin: 5px 0 0 0; color: var(--rosa-palo); font-weight: bold;">$${item.precio.toFixed(2)}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="cambiarCantidad(${index}, -1)" style="border: 1px solid #ccc; background: #f9f9f9; padding: 2px 8px; cursor: pointer; border-radius: 4px;">-</button>
                <span style="font-weight: bold;">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)" style="border: 1px solid #ccc; background: #f9f9f9; padding: 2px 8px; cursor: pointer; border-radius: 4px;">+</button>
                <button onclick="eliminarItem(${index})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 5px;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        contenedorItems.appendChild(div);
    });

    // Actualizamos el contador flotante
    contadorFlotante.innerText = cantidadItems;

    // Matemáticas de totales y envíos
    spanSubtotal.innerText = `$${subtotal.toFixed(2)}`;

    let costoEnvio = 99.00;
    if (subtotal >= 999) {
        costoEnvio = 0;
        spanEnvio.innerHTML = '<span style="color: green; font-weight: bold;">¡Gratis!</span>';
    } else {
        spanEnvio.innerText = `$${costoEnvio.toFixed(2)}`;
    }

    const totalCalculado = subtotal + costoEnvio;
    spanTotal.innerText = `$${totalCalculado.toFixed(2)} MXN`;
};

// Funciones para los botones de + / - y Bote de Basura
window.cambiarCantidad = function(indice, cantidadParaSumar) {
    carrito[indice].cantidad += cantidadParaSumar;
    
    // Si la cantidad baja de 1, lo borramos del carrito
    if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
    }
    
    guardarCarrito();
    actualizarCarritoUI();
};

window.eliminarItem = function(indice) {
    carrito.splice(indice, 1);
    guardarCarrito();
    actualizarCarritoUI();
};