const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

(function() {
  var inv = new URLSearchParams(window.location.search).get('inv');
  var navPase = document.getElementById('nav-pase');
  if (inv && navPase) {
    navPase.href = 'pase.html?inv=' + encodeURIComponent(inv);
    navPase.style.display = '';
  }
})();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade').forEach(el => observer.observe(el));
