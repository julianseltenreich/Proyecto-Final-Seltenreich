import { obtenerProductos } from "./functions.js"; 
const SECCIONES_CONOCIDAS = ["remeras", "jeans", "hoodies", "accesorios"];
const RUTA_PRODUCTOS_JSON = "../../JSON/productos.json";
const VALOR_DEFAULT_SELECT = "all";
const CLASES_BOTON_ACTIVO = ["ring-2", "ring-offset-2"];

function capitalizar(palabra = '') {
    if (!palabra) return '';
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

function detectarSeccionDesdeURL() {
    const archivo = window.location.pathname.split("/").pop()?.toLowerCase() || '';
    const seccionEncontrada = SECCIONES_CONOCIDAS.find(s => archivo.includes(s));
    return seccionEncontrada || "todos";
}
    document.addEventListener("DOMContentLoaded", async () => {
    const seccionActual = detectarSeccionDesdeURL();
    const contenedorId = `p${capitalizar(seccionActual)}`;
    const contenedor = document.querySelector(`#${contenedorId}`);
    
    try {
        const res = await fetch(RUTA_PRODUCTOS_JSON);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        const productosIniciales = seccionActual === "todos"
            ? data
            : data.filter(p => p.seccion?.toLowerCase() === seccionActual);

        window.productosOriginales = [...productosIniciales];
        obtenerProductos(productosIniciales, contenedorId);
        configurarListeners(window.productosOriginales, contenedorId);

    } catch (error) {
        contenedor.innerHTML = "<p>Error al cargar productos. Intente más tarde.</p>";
    }
});
function configurarListeners(productosOriginales, contenedorId) {
    document.getElementById("AplicarFiltros")?.addEventListener("click", () => {
        aplicarFiltros(productosOriginales, contenedorId);
    });
    document.getElementById("EliminarFiltros")?.addEventListener("click", () => {
        resetearFiltros(productosOriginales, contenedorId);
    });
    const slider = document.querySelector('input[type="range"]#precioRange');
    const precioMaxDisplay = document.getElementById("precioMax");
    if (slider && precioMaxDisplay) {
        const actualizarDisplayPrecio = () => {
            precioMaxDisplay.textContent = `Hasta $${slider.value} USD`;
        };
        slider.addEventListener("input", actualizarDisplayPrecio);
        actualizarDisplayPrecio(); 
    }
    const configurarToggleActivo = (selector) => {
        const botones = document.querySelectorAll(selector);
        botones.forEach(btn => {
            btn.addEventListener("click", (event) => {
                botones.forEach(b => b.classList.remove(...CLASES_BOTON_ACTIVO));
                event.currentTarget.classList.add(...CLASES_BOTON_ACTIVO);
            });
        });
    };

    configurarToggleActivo('.filtro-color button');
    configurarToggleActivo('.filtro-talle button');
}

function aplicarFiltros(productosBase, contenedorId) {
    const colorSeleccionado = document.querySelector(".filtro-color button.ring-2")?.id?.toLowerCase();
    const talleSeleccionado = document.querySelector(".filtro-talle button.ring-2")?.innerText?.toUpperCase();
    const categoriaSeleccionada = document.getElementById("selectCategoria")?.value?.toLowerCase();
    const precioMaxSlider = parseInt(document.getElementById("precioRange")?.value || "0", 10);
    const ordenSeleccionado = document.getElementById("selectTemporada")?.value; 

    const precioMaxTeorico = parseInt(document.getElementById("precioRange")?.max || "100", 10); 

    const filterSteps = [
        {
            condition: !!colorSeleccionado,
            filterFn: p => Array.isArray(p.color) && p.color.some(c => c.toLowerCase() === colorSeleccionado)
        },
        {
            condition: !!talleSeleccionado,
            filterFn: p => Array.isArray(p.talla) && p.talla.some(t => t.toUpperCase() === talleSeleccionado)
        },
        {
            condition: !!categoriaSeleccionada && categoriaSeleccionada !== VALOR_DEFAULT_SELECT,
            filterFn: p => p.categoria?.toLowerCase() === categoriaSeleccionada
        },
        {
            condition: precioMaxSlider > 0 && precioMaxSlider < precioMaxTeorico,
            filterFn: p => {
                const precioProducto = Array.isArray(p.precio) ? Math.min(...p.precio.map(Number)) : Number(p.precio);
                return !isNaN(precioProducto) && precioProducto <= precioMaxSlider;
            }
        },
        {
            condition: ordenSeleccionado === "Nueva Temporada 2025", 
            filterFn: p => p.nuevaTemporada === true
        },
        {
            condition: ordenSeleccionado === "Temporada 2024", 
            filterFn: p => p.nuevaTemporada === false
        }
    ];
    let productosFiltrados = filterSteps.reduce((productos, step) => {
        return step.condition ? productos.filter(step.filterFn) : productos;
    }, [...productosBase]);
    const sortFunctions = {
        "Mayor precio": (a, b) => {
            const precioB = Math.max(-Infinity, ...(Array.isArray(b.precio) ? b.precio : [b.precio]).map(Number).filter(n => !isNaN(n)));
            const precioA = Math.max(-Infinity, ...(Array.isArray(a.precio) ? a.precio : [a.precio]).map(Number).filter(n => !isNaN(n)));
            return precioB - precioA;
        },
        "Menor precio": (a, b) => {
            const precioA = Math.min(Infinity, ...(Array.isArray(a.precio) ? a.precio : [a.precio]).map(Number).filter(n => !isNaN(n)));
            const precioB = Math.min(Infinity, ...(Array.isArray(b.precio) ? b.precio : [b.precio]).map(Number).filter(n => !isNaN(n)));
            return precioA - precioB;
        }
    };

    if (sortFunctions[ordenSeleccionado]) {
        productosFiltrados.sort(sortFunctions[ordenSeleccionado]);
    }

    actualizarFiltrosActivosUI({ color: colorSeleccionado, talle: talleSeleccionado, categoria: categoriaSeleccionada, precio: precioMaxSlider, orden: ordenSeleccionado, precioMaxTeorico });
    obtenerProductos(productosFiltrados, contenedorId);
}

function resetearFiltros(productosOriginales, contenedorId) {
    document.querySelectorAll(".filtro-color button, .filtro-talle button").forEach(b => {
        b.classList.remove(...CLASES_BOTON_ACTIVO);
    });
    const selectCategoria = document.getElementById("selectCategoria");
    const selectTemporada = document.getElementById("selectTemporada");
    if (selectCategoria) selectCategoria.value = VALOR_DEFAULT_SELECT;
    if (selectTemporada) selectTemporada.value = VALOR_DEFAULT_SELECT;

    const slider = document.getElementById("precioRange");
    const precioMaxDisplay = document.getElementById("precioMax");
    const valorResetSlider = slider ? Math.round(parseInt(slider.max || "100", 10) / 2) : 50; 
    if (slider) slider.value = valorResetSlider;
    if (precioMaxDisplay) precioMaxDisplay.textContent = `Hasta $${valorResetSlider} USD`;

    const filtrosActivosEl = document.getElementById("filtrosActivos");
    if (filtrosActivosEl) filtrosActivosEl.textContent = "Filtros: Ninguno";
    obtenerProductos(productosOriginales, contenedorId);
}

function actualizarFiltrosActivosUI({ color, talle, categoria, precio, orden, precioMaxTeorico }) {
    const filtrosActivosEl = document.getElementById("filtrosActivos");
    if (!filtrosActivosEl) return;

    const descripciones = [
        { condition: !!color, text: `Color: ${capitalizar(color)}` },
        { condition: !!talle, text: `Talle: ${talle}` },
        { condition: !!categoria && categoria !== VALOR_DEFAULT_SELECT, text: `Categoría: ${capitalizar(categoria)}` },
        { condition: precio > 0 && precio < precioMaxTeorico, text: `Precio <= $${precio}` },
        { condition: orden === "Nueva Temporada 2025", text: 'Nueva Temp.' }, // Texto más corto
        { condition: orden === "Temporada 2024", text: 'Temp. Anterior' }
    ];

    const filtrosAplicados = descripciones
        .filter(d => d.condition)
        .map(d => d.text);

    const texto = filtrosAplicados.length ? filtrosAplicados.join(" / ") : "Ninguno";
    filtrosActivosEl.textContent = `Filtros: ${texto}`;
}