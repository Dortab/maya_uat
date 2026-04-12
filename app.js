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

    // 3. Carga Dinámica de Productos desde CSV
    const contenedor = document.getElementById('contenedor-productos');

    if (contenedor) {
        cargarInventario();
    }

    async function cargarInventario() {
        try {
            const respuesta = await fetch('inventario.csv');
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo");

            const texto = await respuesta.text();
            const lineas = texto.split('\n').slice(1);

            const fragmento = document.createDocumentFragment();

            lineas.forEach(linea => {
                if (linea.trim() === '') return;

                const [id, categoria, nombre, descripcion, precio, imagen] = linea.split(',');

                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-categoria';

                const precioNum = parseFloat(precio).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                tarjeta.innerHTML = `
                    <img src="productos/${imagen.trim()}" alt="${nombre.trim()}" loading="lazy">
                    <small style="color: var(--oro); text-transform: uppercase;">${categoria.trim()}</small>
                    <h3 style="margin: 10px 0;">${nombre.trim()}</h3>
                    <p style="font-size: 0.9rem; color: #666; height: 50px; overflow: hidden;">${descripcion.trim()}</p>
                    <p style="font-size: 1.25rem; font-weight: bold; margin: 15px 0;">$${precioNum} MXN</p>
                    <a href="https://wa.me/527228603383?text=Hola! Me interesa el producto: ${encodeURIComponent(nombre.trim())}" 
                       target="_blank" rel="noopener" class="btn-principal">
                       <i class="fab fa-whatsapp"></i> Pedir ahora
                    </a>
                `;
                fragmento.appendChild(tarjeta);
            });

            contenedor.innerHTML = '';
            contenedor.appendChild(fragmento);

        } catch (error) {
            console.error("Error:", error);
            if (contenedor) {
                contenedor.innerHTML = '<p style="text-align:center; padding: 2rem; color:#666;">Error al cargar el catálogo. Por favor intenta más tarde.</p>';
            }
        }
    }
});
