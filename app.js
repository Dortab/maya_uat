document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lógica del Menú Móvil
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // 2. Carga Dinámica de Productos desde CSV
    const contenedor = document.getElementById('contenedor-productos');
    
    if (contenedor) {
        cargarInventario();
    }

    async function cargarInventario() {
        try {
            const respuesta = await fetch('inventario.csv');
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo");
            
            const texto = await respuesta.text();
            const lineas = texto.split('\n').slice(1); // Saltar encabezado
            
            const fragmento = document.createDocumentFragment();

            lineas.forEach(linea => {
                if (linea.trim() === '') return;
                
                const [id, categoria, nombre, descripcion, precio, imagen] = linea.split(',');

                const tarjeta = document.createElement('div');
                tarjeta.className = 'tarjeta-categoria';
                
                // Formatear precio
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
                contenedor.innerHTML = '<p>Error al cargar el catálogo. Por favor intenta más tarde.</p>';
            }
        }
    }
});