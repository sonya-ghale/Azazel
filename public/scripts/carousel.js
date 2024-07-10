// dashboard's image carousel 
document.addEventListener("DOMContentLoaded", function () {
    let carouselItems = document.querySelectorAll(".carousel-item");
    let activeIndex = 0;
  
    carouselItems[activeIndex].classList.add("active");
  
    function nextSlide() {
      carouselItems[activeIndex].classList.remove("active");
      activeIndex = (activeIndex + 1) % carouselItems.length;
      carouselItems[activeIndex].classList.add("active");
    }
  
    function prevSlide() {
      carouselItems[activeIndex].classList.remove("active");
      activeIndex = (activeIndex - 1 + carouselItems.length) % carouselItems.length;
      carouselItems[activeIndex].classList.add("active");
    }
  
    setInterval(nextSlide, 3000); // Change slide every 5 seconds, adjust as needed
  });
  