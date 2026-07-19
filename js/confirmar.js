const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTbd4EnvoME0szwB8cwkUNLqzKrO89Dz1mW5cIPXpmUuwMjDnFFPFBFDYjAVX4LZK5/exec';

let guestData = null;

function showState(id) {
  document.querySelectorAll('.rsvp-state').forEach(function(el) {
    el.classList.add('rsvp-hidden');
  });
  document.getElementById(id).classList.remove('rsvp-hidden');
}

function cConfirm() { cSend('si'); }
function cDeny()    { cSend('no'); }

function cSend(asistencia) {
  showState('c-loading');

  var params = new URLSearchParams({
    action:     'fase2submit',
    inv:        guestData.id,
    asistencia: asistencia
  });

  fetch(APPS_SCRIPT_URL + '?' + params.toString())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.ok) {
        var title = document.getElementById('c-success-title');
        var msg   = document.getElementById('c-success-msg');
        if (asistencia === 'si') {
          title.textContent = '¡Te esperamos!';
          msg.textContent   = 'Tu asistencia está confirmada. ¡Nos vemos el 24 de octubre!';
        } else {
          title.textContent = 'Lo sentiremos mucho';
          msg.textContent   = 'Gracias por avisarnos. Te tendremos en nuestros pensamientos ese día.';
        }
        showState('c-success');
      } else {
        alert('Error al guardar. Intenta de nuevo.');
        showState('c-form');
      }
    })
    .catch(function() {
      alert('Error de conexión. Intenta de nuevo.');
      showState('c-form');
    });
}

function doFase2Lookup(inv) {
  fetch(APPS_SCRIPT_URL + '?action=fase2lookup&inv=' + encodeURIComponent(inv))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.found) {
        showState('c-notfound');
        return;
      }
      if (data.yaConfirmo) {
        showState('c-already');
        return;
      }
      guestData = data;
      var passes = data.pasesFinales;
      document.getElementById('c-name').textContent    = data.nombre;
      document.getElementById('c-passes').textContent  = passes;
      document.getElementById('c-plural').textContent  = passes === 1 ? '' : 's';
      document.getElementById('c-plural2').textContent = passes === 1 ? '' : 's';
      showState('c-form');
    })
    .catch(function() {
      showState('c-notfound');
    });
}

(function init() {
  var urlParams = new URLSearchParams(window.location.search);
  var inv       = urlParams.get('inv');

  showState('c-loading');

  fetch(APPS_SCRIPT_URL + '?action=config')
    .then(function(r) { return r.json(); })
    .then(function(cfg) {
      var fechaFase2 = cfg.fechaFase2 || '2026-09-01';

      if (new Date() < new Date(fechaFase2 + 'T00:00:00')) {
        showState('c-soon');
        return;
      }

      if (!inv) {
        showState('c-noparam');
        return;
      }

      doFase2Lookup(inv);
    })
    .catch(function() {
      // Fallback si el config falla
      if (new Date() < new Date('2026-09-01T00:00:00')) {
        showState('c-soon');
      } else if (!inv) {
        showState('c-noparam');
      } else {
        doFase2Lookup(inv);
      }
    });
})();
