let index = 0;

const images = document.querySelectorAll(".carousel-img");
const dots   = document.querySelectorAll(".carousel-dot");

function goToSlide(n) {
  images[index].classList.remove("active");
  dots[index].classList.remove("active");
  index = (n + images.length) % images.length;
  images[index].classList.add("active");
  dots[index].classList.add("active");
}

function showNext() {
  goToSlide(index + 1);
}

setInterval(showNext, 4000);
