document.addEventListener("DOMContentLoaded", () => {

    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
  
      let promoDiv = document.getElementById("promo-container");
  
      if (!promoDiv) {
        promoDiv = document.createElement("div");
        promoDiv.id = "promo-container";
        promoDiv.classList.add("my-4");
        document.body.appendChild(promoDiv);
      }
  
      setTimeout(() => {
        const promo = `
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-xl shadow-xl w-11/12 max-w-4xl relative animate-fade-in">
              <button id="close-promo" class="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-800">&times;</button>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h2 class="text-black-600 text-2xl font-bold text-center md:text-left">Reventá la escena</h2>
                  <p class="text-gray-800 mt-4 text-center md:text-left text-lg">
                    Rompe la rutina, viví tu momento
                  </p>
                  <p class="text-gray-700 mt-4 text-center md:text-left text-lg">
                    Unite a la crew y recibí promos que te rompen el coco 
                  </p>
                  <div class="text-center md:text-left mt-6">
                    <a href="/HTML/usuarios_Carrito/usuarios.html" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition font-medium shadow-md hover:shadow-lg">
                      Mandate de una
                    </a>
                  </div>
                </div>
                <div class="flex justify-center md:justufy-end">
                  <img src="../../IMAGENES/home/imgpromo.jpg" alt="promo" class="rounded-lg w-full max-h-96 object-cover md:max-w-md">
                </div>
              </div>
            </div>
          </div>
        `;
  
        promoDiv.innerHTML = promo;
  
        document.getElementById("close-promo").addEventListener("click", () => {
          promoDiv.innerHTML = "";
        });
  
      }, 3000);
    }
  });
  
