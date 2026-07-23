(() => {
  const carousel = document.querySelector(".carousel");
  const images = Array.from(document.querySelectorAll(".carousel-img"));
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));

  if (!carousel || images.length === 0) return;

  let index = 0;
  let timer = null;
  let transitionId = 0;

  function loadImage(position) {
    const image = images[position];
    if (!image) return Promise.resolve();

    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }

    if (image.complete && image.naturalWidth > 0) return Promise.resolve();

    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }

  function preloadNext(position) {
    loadImage((position + 1) % images.length);
  }

  async function goToSlide(position) {
    const nextIndex = (position + images.length) % images.length;
    const currentTransition = ++transitionId;

    await loadImage(nextIndex);
    if (currentTransition !== transitionId) return;

    images[index].classList.remove("active");
    dots[index]?.classList.remove("active");

    index = nextIndex;
    images[index].classList.add("active");
    dots[index]?.classList.add("active");
    preloadNext(index);
  }

  function startCarousel() {
    if (timer || document.hidden) return;
    timer = window.setInterval(() => goToSlide(index + 1), 4000);
  }

  function stopCarousel() {
    window.clearInterval(timer);
    timer = null;
  }

  window.goToSlide = goToSlide;
  window.prevSlide  = () => goToSlide(index - 1);
  window.nextSlide  = () => goToSlide(index + 1);
  preloadNext(index);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startCarousel();
      else stopCarousel();
    }, { threshold: 0.2 });

    observer.observe(carousel);
  } else {
    startCarousel();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCarousel();
    else startCarousel();
  });

  carousel.addEventListener("mouseenter", stopCarousel);
  carousel.addEventListener("mouseleave", startCarousel);
})();
