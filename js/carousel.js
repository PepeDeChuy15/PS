let index = 0;
let intervalId = null;
let imagesLoaded = false;

const images = document.querySelectorAll(".carousel-img");
const dots   = document.querySelectorAll(".carousel-dot");

function loadAllImages() {
  if (imagesLoaded) return;
  imagesLoaded = true;
  images.forEach(function(img) {
    if (img.dataset.src) img.src = img.dataset.src;
  });
}

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

var gallery = document.getElementById('galeria');
if (gallery && 'IntersectionObserver' in window) {
  var observer = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      loadAllImages();
      if (!intervalId) intervalId = setInterval(showNext, 4000);
      observer.disconnect();
    }
  }, { rootMargin: '400px 0px' });
  observer.observe(gallery);
} else {
  loadAllImages();
  intervalId = setInterval(showNext, 4000);
}
