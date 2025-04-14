document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('carousel');
    const leftButton = document.getElementById('left');
    const rightButton = document.getElementById('right');
    
    let scrollAmount = 0;
    const scrollStep = 300;
    leftButton.addEventListener('click', function() {
      scrollAmount -= scrollStep;
      carousel.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });
    rightButton.addEventListener('click', function() {
      scrollAmount += scrollStep;
      carousel.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });
  });
  