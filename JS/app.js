import { obtenerProductos, actualizarCarrito , actualizarContador, obtenerCodigoDescuento} from "./functions.js";
let productos = [];
async function fetchJsonPlaceHolder(){

    try{ const response = await fetch("../../JSON/productos.json");
         const data = await response.json();
         productos = data;
         return data;
    }
    
    catch(error){
        console.error('Estamos reacomodando el stock');
        return []; 
    }
    

}
document.addEventListener("DOMContentLoaded",()=>{
    const boton = document.getElementById("btnBuscar");
    const input = document.getElementById("buscador");
    if (boton && input) {
        boton.addEventListener("click", () => {
          const texto = input.value.trim().toLowerCase();
          if (texto !== "") {
            const query = encodeURIComponent(texto);
            window.location.href = `/HTML/busqueda/resultados.html?query=${query}`;
          }
        });
      }


if (window.location.pathname.includes("resultados.html")){
    const params = new URLSearchParams(window.location.search);
    const texto = (params.get("query") || "").toLowerCase();
    const titulo = document.getElementById("tituloResultados");
    if(titulo){
        titulo.textContent=`Tu estilo, tus reglas. Mirá lo que tenemos`
}
  fetchJsonPlaceHolder().then(productos => {

    const filtrados = productos.filter(p => {
      const busquedaArray = Array.isArray(p.busqueda) ? p.busqueda : [];
      const categoria = p.categoria?.toLowerCase() || '';

      const nombreMatch = busquedaArray.some(item =>
        (item || '').toLowerCase().includes(texto)
      );
    
      const categoriaMatch = categoria.includes(texto);
    
      return nombreMatch || categoriaMatch;
    });
    const contenedor = document.getElementById("resultados");
    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    } else {
      obtenerProductos(filtrados, "resultados");
    }
  });
}

fetchJsonPlaceHolder().then((productos) => {
    const secciones = [
        {id:"pRemeras", filtro: p => p.seccion === "remeras"},
        {id:"pHoodies", filtro: p => p.seccion === "hoodies"},
        {id:"pAccesorios", filtro: p => p.seccion === "accesorios"},
        {id:"pNewdrop", filtro: p => p.nuevaTemporada === true},
        {id:"pJeans", filtro: p => p.seccion === "jeans"}
    ];

    secciones.forEach(({id, filtro}) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            const filtrados = productos.filter(filtro);
            obtenerProductos(filtrados, id);
        }
    });
});
})

document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();
  actualizarContador();
});

document.querySelector("#ingresar").addEventListener("click", () => {
     obtenerCodigoDescuento();
  });
