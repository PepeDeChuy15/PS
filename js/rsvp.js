// Pega aquí la URL de tu Apps Script Web App después de publicarla
const APPS_SCRIPT_URL = 'TU_APPS_SCRIPT_URL_AQUI';

let guestData = null;
let pasesVal  = 1;
let extraVal  = 0;

function showState(id) {
  document.querySelectorAll('.rsvp-state').forEach(function(el) {
    el.classList.add('rsvp-hidden');
  });
  document.getElementById(id).classList.remove('rsvp-hidden');
}

function rsvpChange(type, delta) {
  if (type === 'pases') {
    pasesVal = Math.max(1, Math.min(guestData.pases, pasesVal + delta));
    document.getElementById('rsvp-val-pases').textContent = pasesVal;
  } else {
    extraVal = Math.max(0, extraVal + delta);
    document.getElementById('rsvp-val-extra').textContent = extraVal;
  }
}

function rsvpGoStep2() {
  document.getElementById('rsvp-step-1').classList.add('rsvp-hidden');
  document.getElementById('rsvp-step-2').classList.remove('rsvp-hidden');
}

function rsvpBack() {
  document.getElementById('rsvp-step-2').classList.add('rsvp-hidden');
  document.getElementById('rsvp-step-1').classList.remove('rsvp-hidden');
}

function rsvpDeny() {
  send('no', 0, 0, '');
}

function rsvpSubmit() {
  var comentarios = document.getElementById('rsvp-comments').value.trim();
  send('si', pasesVal, extraVal, comentarios);
}

function send(asistencia, pases, extra, comentarios) {
  showState('rsvp-loading');

  var params = new URLSearchParams({
    action:      'submit',
    inv:         guestData.nombre,
    asistencia:  asistencia,
    pases:       pases,
    extra:       extra,
    comentarios: comentarios
  });

  fetch(APPS_SCRIPT_URL + '?' + params.toString())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.ok) {
        var title = document.getElementById('rsvp-success-title');
        var msg   = document.getElementById('rsvp-success-msg');
        if (asistencia === 'si') {
          title.textContent = '¡Te esperamos!';
          msg.textContent   = 'Tu asistencia ha sido confirmada. ¡Nos vemos el 24 de octubre!';
        } else {
          title.textContent = 'Lo sentiremos mucho';
          msg.textContent   = 'Gracias por avisarnos. Te tendremos en nuestros pensamientos ese día.';
        }
        showState('rsvp-success');
      } else {
        alert('Hubo un problema al guardar tu respuesta. Intenta de nuevo.');
        showState('rsvp-form');
      }
    })
    .catch(function() {
      alert('Error de conexión. Verifica tu internet e intenta de nuevo.');
      showState('rsvp-form');
    });
}

(function init() {
  var params = new URLSearchParams(window.location.search);
  var inv    = params.get('inv');

  if (!inv) {
    showState('rsvp-noparam');
    return;
  }

  showState('rsvp-loading');

  fetch(APPS_SCRIPT_URL + '?action=lookup&inv=' + encodeURIComponent(inv))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.found) {
        showState('rsvp-notfound');
        return;
      }

      guestData = data;
      pasesVal  = 1;
      extraVal  = 0;

      document.getElementById('rsvp-name-display').textContent  = data.nombre;
      document.getElementById('rsvp-passes-display').textContent = data.pases;
      document.getElementById('rsvp-passes-plural').textContent  = data.pases === 1 ? '' : 's';
      document.getElementById('rsvp-val-pases').textContent      = pasesVal;
      document.getElementById('rsvp-val-extra').textContent      = extraVal;

      document.getElementById('rsvp-step-1').classList.remove('rsvp-hidden');
      document.getElementById('rsvp-step-2').classList.add('rsvp-hidden');

      showState('rsvp-form');
    })
    .catch(function() {
      showState('rsvp-notfound');
    });
})();
