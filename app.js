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
                const { nombre, categoria, descripcion, precio, imagen, tonos } = producto;
                const grid = secciones[categoria];
                if (!grid) return; // ignorar categorías no mapeadas

                const precioNum = parseFloat(precio).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                const tonosHTML = tonos && tonos.length > 0 ? `
                    <div class="tonos-container">
                        <label class="tonos-label">Tono:</label>
                        <select class="tonos-select">
                            <option value="">-- Selecciona un tono --</option>
                            ${tonos.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                ` : '';

                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-categoria';
                tarjeta.innerHTML = `
                    <img src="productos/${imagen}" alt="${nombre}" loading="lazy">
                    <h3 style="margin: 10px 0;">${nombre}</h3>
                    <p style="font-size: 0.9rem; color: #666; min-height: 50px;">${descripcion}</p>
                    ${tonosHTML}
                    <p style="font-size: 1.25rem; font-weight: bold; margin: 15px 0;">$${precioNum} MXN</p>
                    <a href="https://wa.me/527228603383?text=Hola! Me interesa el producto: ${encodeURIComponent(nombre)}" 
                       target="_blank" rel="noopener" class="btn-principal">
                       <i class="fab fa-whatsapp"></i> Pedir ahora
                    </a>
                `;
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
