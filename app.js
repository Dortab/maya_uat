document.addEventListener('DOMContentLoaded', () => {

    // 1. Lógica del Menú Móvil
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    function cerrarMenu() {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }

    function abrirMenu() {
        navLinks.classList.add('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    }

    if (menuToggle && navLinks) {

        // Abrir / cerrar al tocar la hamburguesa
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                cerrarMenu();
            } else {
                abrirMenu();
            }
        });

        // Cerrar al tocar cualquier enlace del menú
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => cerrarMenu());
        });

        // Cerrar al tocar fuera del menú
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !menuToggle.contains(e.target) &&
                !navLinks.contains(e.target)) {
                cerrarMenu();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarMenu();
        });
    }

    // 2. Footer dinámico
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar el footer');
                return res.text();
            })
            .then(html => {
                footerPlaceholder.outerHTML = html;
            })
            .catch(err => console.error('Error cargando footer:', err));
    }

    // 3. Carga Dinámica de Productos desde JSON por sección
    const secciones = {
        'Capilar':          document.getElementById('grid-capilar'),
        'Pestañas y Cejas': document.getElementById('grid-pestanas'),
        'Uñas':             document.getElementById('grid-unas'),
    };

    const hayGrids = Object.values(secciones).some(el => el !== null);
    if (hayGrids) cargarInventario();

    async function cargarInventario() {
        try {
            const respuesta = await fetch('inventario.json');
            if (!respuesta.ok) throw new Error("No se pudo cargar el inventario");

            const productos = await respuesta.json();

            // Limpiar mensajes de carga
            Object.values(secciones).forEach(grid => {
                if (grid) grid.innerHTML = '';
            });

            productos.forEach(producto => {
                const { id, nombre, categoria, descripcion, precio, imagen, tonos } = producto;
                const grid = secciones[categoria];
                if (!grid) return;

                const precioNum = parseFloat(precio).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                // A3: Convertir saltos de línea del JSON en <br>
                const descripcionHTML = descripcion
                    ? descripcion.replace(/\n/g, '<br>')
                    : '';

                // A4: Selector de tonos con ID único
                const selectId = `tono-${id}`;
                const tonosHTML = tonos && tonos.length > 0 ? `
                    <div class="tonos-container">
                        <label class="tonos-label" for="${selectId}">Selecciona tu tono:</label>
                        <select class="tonos-select" id="${selectId}">
                            <option value="">-- Elige un tono --</option>
                            ${tonos.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                ` : '';

                // A4: Link base de WhatsApp (para productos sin tonos)
                const waMensajeBase = `Hola! Me interesa el producto: ${encodeURIComponent(nombre)}`;
                const waLinkBase = `https://wa.me/527228603383?text=${waMensajeBase}`;

                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-categoria';
                tarjeta.innerHTML = `
                    <img src="productos/${imagen}" alt="${nombre}" loading="lazy"
                         onerror="this.style.display='none'">
                    <small class="tarjeta-categoria-label">${categoria}</small>
                    <h3 class="tarjeta-nombre">${nombre}</h3>
                    <div class="tarjeta-descripcion">${descripcionHTML}</div>
                    ${tonosHTML}
                    <p class="tarjeta-precio">$${precioNum} <span>MXN</span></p>
                    <a href="${waLinkBase}"
                       class="btn-principal btn-wa"
                       target="_blank" rel="noopener">
                       <i class="fab fa-whatsapp"></i> Pedir ahora
                    </a>
                `;

                // A4: Si tiene tonos, el botón construye el mensaje dinámicamente al hacer click
                if (tonos && tonos.length > 0) {
                    const btn = tarjeta.querySelector('.btn-wa');
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const select = tarjeta.querySelector(`#${selectId}`);
                        const tonoElegido = select ? select.value : '';
                        const mensaje = tonoElegido
                            ? `Hola! Me interesa el producto: ${nombre} — Tono: ${tonoElegido}`
                            : `Hola! Me interesa el producto: ${nombre} (aún no elegí tono, ¿me pueden asesorar?)`;
                        window.open(`https://wa.me/527228603383?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener');
                    });
                }

                grid.appendChild(tarjeta);
            });

            // Si alguna sección quedó vacía, mostrar mensaje
            Object.entries(secciones).forEach(([cat, grid]) => {
                if (grid && grid.children.length === 0) {
                    grid.innerHTML = `<p class="sin-productos">No hay productos disponibles en esta categoría por el momento.</p>`;
                }
            });

        } catch (error) {
            console.error("Error:", error);
            Object.values(secciones).forEach(grid => {
                if (grid) grid.innerHTML = '<p class="sin-productos">Error al cargar productos. Por favor intenta más tarde.</p>';
            });
        }
    }
});
