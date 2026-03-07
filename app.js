document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DEL MENÚ MÓVIL ---
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        // Abrir y cerrar menú con el botón de hamburguesa
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Cerrar el menú automáticamente al hacer clic en cualquier enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- 2. CARGA DINÁMICA DE PRODUCTOS DESDE CSV ---
    const contenedor = document.getElementById('contenedor-productos');
    
    if (contenedor) {
        cargarInventario();
    }

    async function cargarInventario() {
        try {
            // Mensaje de carga mientras GitHub lee el archivo CSV
            contenedor.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; color: #666;">Cargando inventario...</p>';

            const respuesta = await fetch('inventario.csv');
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo");
            
            const texto = await respuesta.text();
            const lineas = texto.split('\n').slice(1); // Saltar encabezado
            
            const fragmento = document.createDocumentFragment();
            let productosCargados = 0;

            lineas.forEach(linea => {
                if (linea.trim() === '') return;
                
                const [id, categoria, nombre, descripcion, precio, imagen] = linea.split(',');

                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-categoria';
                
                // Formatear precio para que se vea como moneda mexicana ($00.00 MXN)
                const precioNum = parseFloat(precio).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

                tarjeta.innerHTML = `
                    <img src="productos/${imagen.trim()}" alt="${nombre.trim()}" loading="lazy">
                    <small style="color: var(--oro); text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">${categoria.trim()}</small>
                    <h3 style="margin: 10px 0; color: var(--negro-mate);">${nombre.trim()}</h3>
                    <p style="font-size: 0.95rem; color: #555; height: 50px; overflow: hidden; margin-bottom: 15px;">${descripcion.trim()}</p>
                    <p style="font-size: 1.4rem; font-weight: bold; margin-bottom: 20px; color: var(--rosa-palo);">$${precioNum} MXN</p>
                    <a href="https://wa.me/527228603383?text=Hola!%20Me%20interesa%20el%20producto:%20${encodeURIComponent(nombre.trim())}" 
                       target="_blank" rel="noopener" class="btn-principal" style="width: 100%; display: block;">
                       <i class="fab fa-whatsapp"></i> Pedir ahora
                    </a>
                `;
                fragmento.appendChild(tarjeta);
                productosCargados++;
            });

            contenedor.innerHTML = ''; // Limpiar el texto de "Cargando..."
            
            if (productosCargados > 0) {
                contenedor.appendChild(fragmento);
            } else {
                contenedor.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">No hay productos disponibles en este momento.</p>';
            }

        } catch (error) {
            console.error("Error:", error);
            if (contenedor) {
                contenedor.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; color: #e74c3c;">Hubo un problema al cargar los productos. Por favor, refresca la página.</p>';
            }
        }
    }
});