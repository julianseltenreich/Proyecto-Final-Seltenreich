export function setInfoStorage( key = '', value = ''){
    localStorage.setItem(key, JSON.stringify(value));
};

export function getInfoStorage(key = ''){
    return JSON.parse(localStorage.getItem(key));
};

export function removeInfoStorage(key = ''){
    localStorage.removeItem(key);
};

export function clearInfoStorage(){
    localStorage.clear();
};


export function actualizarContador() {
    const contador = document.getElementById('contador');
    const carrito = getInfoStorage('carrito') || [];
    const totalProductos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (contador) {
      contador.textContent = totalProductos;
      contador.style.display = totalProductos > 0 ? 'inline' : 'none';
    }
  }


export function vaciarCarrito(){
    setInfoStorage('carrito',[]);
    removeInfoStorage('total');
    removeInfoStorage('itemsCarrito');
    actualizarCarrito();
    actualizarContador();
}
export function agregarAlCarrito(producto){
  const carrito = getInfoStorage('carrito') || [];

  const existente = carrito.find(p => p.id === producto.id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ id: producto.id, cantidad: 1 });
  }

  setInfoStorage('carrito', carrito);
  actualizarContador();
}

export function quitarProducto(productoId) {
    let carrito = getInfoStorage('carrito') || [];
    carrito = carrito.filter(p => p.id !== productoId);
    setInfoStorage('carrito',carrito);
    actualizarCarrito();
    actualizarContador();
  
  }

export function actualizarCarrito() {
  const carrito = getInfoStorage('carrito') || [];
  const tablaCarrito = document.getElementById('tablaCarrito');
  if (!tablaCarrito) return;
  tablaCarrito.innerHTML = '';

  if (carrito.length === 0) {
    const filaVacia = document.createElement('tr');
    filaVacia.innerHTML = `
      <td colspan="4" class="text-center py-4">Que estas esperando para llenar el carrito con las mejores prendas!!</td>
    `;
    tablaCarrito.appendChild(filaVacia);
    return;
  }
  fetch("../../JSON/productos.json")
    .then(res => res.json())
    .then(productos => {
      localStorage.setItem('productosCache', JSON.stringify(productos));
      let total = 0;
      carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
          total += producto.precio * item.cantidad;
        
          const fila = document.createElement('tr');
          fila.innerHTML = `
            <td class="py-4">
             <div class="flex items-center">
                <img src="${producto.imagen}" alt="${producto.descripcion}" class="w-16 h-16 rounded-full mr-4">
                <span class="font-semibold product-name">${producto.descripcion}</span>
              </div>
            </td>
            <td class="py-4 price">$${producto.precio}</td>
            <td class="py-4">
                <div class="flex items-center">
                  <button class="btn btn-decrease border rounded-md py-1 px-3 mr-2 bg-red-100" data-action="decrease" data-id="${producto.id}">-</button>
                  <span class="quantity">${item.cantidad}</span>
                  <button class="btn btn-increase border rounded-md py-1 px-3 ml-2 bg-green-100" data-action="increase" data-id="${producto.id}">+</button>
                  <button class="btn btn-remove border rounded-md py-1 px-3 ml-4 bg-gray-200" data-action="remove" data-id="${producto.id}">Eliminar</button>
                </div>
            </td>
            <td class="py-4 total">$${(producto.precio * item.cantidad).toFixed(2)}</td>
          `;
          tablaCarrito.appendChild(fila);
        }
      });
      const filaDescuento = document.createElement('tr');
      filaDescuento.innerHTML = `
        <td colspan="3" class="text-right py-2 px-6">
          <input id="codigoDescuento" type="text" placeholder="Código de descuento" class="border px-3 py-2 rounded w-60">
          <button id="aplicarDescuento" class="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded">Aplicar</button>
        </td>
        <td id="descuentoAplicado" class="py-2 px-6 text-green-600 font-semibold"></td>
      `;
      tablaCarrito.appendChild(filaDescuento);
      const filaTotal = document.createElement('tr');
      filaTotal.innerHTML = `
        <td colspan="3" class="text-right font-bold py-4 px-6">Total:</td>
        <td id="totalCarrito" class="py-4 px-6 font-bold text-green-700">$${total.toFixed(2)}</td>
      `;
      tablaCarrito.appendChild(filaTotal);

      const filaBoton = document.createElement('tr');
      filaBoton.innerHTML = `
        <td colspan="4" class="text-right">
          <button class="btn-comprar bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Comprar</button>
        </td>
      `;
      tablaCarrito.appendChild(filaBoton);

      document.getElementById('aplicarDescuento').addEventListener('click', () => {
        const input = document.getElementById('codigoDescuento');
        const codigo = input.value.trim().toUpperCase();
        let descuento = 0;
        if (codigo === 'FVCK10') {
          descuento = 0.10;
        }
        if (descuento > 0) {
          const nuevoTotal = total * (1 - descuento);
          document.getElementById('totalCarrito').textContent = `$${nuevoTotal.toFixed(2)}`;
          document.getElementById('descuentoAplicado').textContent = `-${(descuento * 100)}% aplicado`;
        } else {
          document.getElementById('descuentoAplicado').textContent = 'Código inválido';
          document.getElementById('descuentoAplicado').classList.replace('text-green-600', 'text-red-600');
        }
      });
      document.querySelector('.btn-comprar').addEventListener('click', () => {
        
        compraProudcto();
        vaciarCarrito();
        
      });

      tablaCarrito.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = obtenerIdDesdeBoton(e.target);
          modificarCantidad(id, 1);
        });
      });

      tablaCarrito.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = obtenerIdDesdeBoton(e.target);
          modificarCantidad(id, -1);
        });
      });

      tablaCarrito.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = obtenerIdDesdeBoton(e.target);
          eliminarProducto(id);
        });
      });
    });
}
function obtenerIdDesdeBoton(boton) {
  const fila = boton.closest('tr');
  const nombre = fila.querySelector('.product-name').textContent;
  const productos = JSON.parse(localStorage.getItem('productosCache')) || [];
  const producto = productos.find(p => p.descripcion === nombre);
  return producto ? producto.id : null;
}

function modificarCantidad(id, cambio) {
  const carrito = getInfoStorage('carrito') || [];
  const producto = carrito.find(p => p.id === id);

  if (producto) {
    producto.cantidad += cambio;
    if (producto.cantidad <= 0) {
      quitarProducto(id);
      return;
    }
  }

  setInfoStorage('carrito', carrito);
  actualizarCarrito();
  actualizarContador();
}

export function obtenerProductos(array, id){
    const contenedor = document.getElementById(id);
    contenedor.innerHTML ="";
    array.forEach((producto) =>{ 
        const card = document.createElement('div');
        card.className = 'transform transition duration-300 hover:scale-105 hover:shadow-xl bg-white shadow-lg rounded-2xl overflow-hidden w-72';
        card.innerHTML = `
        
              <img src='${producto.imagen}' alt='${producto.seccion}'class='w-full aspect-square object-cover rounded-t-2xl'>

            <div class="p-4 flex flex-col items-center text-center gap-2">
              <h3 class='text-lg font-semibold text-gray-800'>${producto.descripcion}</h3>
              <p class='text-sm text-gray-600'>Precio: ${producto.precio} USD</p>
              <p class='text-sm text-gray-600'>Talles: ${producto.talla}</p>
              <p class='text-sm text-gray-600'>color: ${producto.color}</p>
              <button class='botonCompra mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition'>Agregar al Carrito</button>
             </div>
            `
       contenedor.appendChild(card)
       const boton = card.querySelector('.botonCompra')
       boton.addEventListener('click', () => agregarAlCarrito(producto));

});
}



function compraProudcto(){
  Swal.fire({
     title: "Compra Realizada!",
     text: "Gracias por tu compra!",
    icon: "success",
    showConfirmButton: false,
    timer: 2000 
});

}

function eliminarProducto(id){
  Swal.fire({
    title: "Estas seguro de eliminar este producto?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    denyButtonText: `Volver a la compra`
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Producto Eliminado", "","error" );
      
      quitarProducto(id);

    } else if (result.isDenied) {
      Swal.fire("Continua Con tu compra", "", "success");
    }
  });
}


export function obtenerCodigoDescuento(){
  Swal.fire({
   title: "Gracias por ingresar!",
   text: "tu codigo de descuento es: FVCK10",
   icon: "success",
   showConfirmButton: false,
   timer: 5000
  });

}