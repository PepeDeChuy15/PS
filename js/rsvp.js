const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTbd4EnvoME0szwB8cwkUNLqzKrO89Dz1mW5cIPXpmUuwMjDnFFPFBFDYjAVX4LZK5/exec';

let guestData    = null;
let guestId      = null;
let pasesVal     = 1;
let fechaFase2Cfg = null;

function showState(id) {
  document.querySelectorAll('.rsvp-state').forEach(function(el) {
    el.classList.add('rsvp-hidden');
  });
  document.getElementById(id).classList.remove('rsvp-hidden');
}

function formatDate(dateStr) {
  var meses = ['enero','febrero','marzo','abril','mayo','junio','julio',
               'agosto','septiembre','octubre','noviembre','diciembre'];
  var p = dateStr.split('-');
  return parseInt(p[2], 10) + ' de ' + meses[parseInt(p[1], 10) - 1] + ' de ' + p[0];
}

function showFase2Notice() {
  if (!fechaFase2Cfg || !guestId) return;
  var notice = document.getElementById('rsvp-fase2-notice');
  var dateEl = document.getElementById('rsvp-fase2-date');
  var link   = document.getElementById('rsvp-fase2-link');
  if (!notice) return;
  dateEl.textContent = formatDate(fechaFase2Cfg);
  link.href = 'confirmar.html?inv=' + encodeURIComponent(guestId);
  notice.classList.remove('rsvp-hidden');
}

function setDeadlineDates(dateStr) {
  var display = formatDate(dateStr);
  document.querySelectorAll('.rsvp-deadline-date').forEach(function(el) {
    el.textContent = display;
  });
}

function rsvpChange(type, delta) {
  if (type === 'pases') {
    pasesVal = Math.max(1, Math.min(guestData.pases, pasesVal + delta));
    document.getElementById('rsvp-val-pases').textContent = pasesVal;
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
  send('si', pasesVal, 0, comentarios);
}

function send(asistencia, pases, extra, comentarios) {
  showState('rsvp-loading');

  var params = new URLSearchParams({
    action:      'submit',
    inv:         guestId,
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
          showFase2Notice();
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

function doLookup(inv) {
  fetch(APPS_SCRIPT_URL + '?action=lookup&inv=' + encodeURIComponent(inv))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.found) {
        showState('rsvp-notfound');
        return;
      }
      if (data.yaConfirmo) {
        var title = document.getElementById('rsvp-success-title');
        var msg   = document.getElementById('rsvp-success-msg');
        if (data.asistencia === 'si') {
          title.textContent = '¡Ya confirmaste tu asistencia!';
          msg.textContent   = 'Tu lugar ya está reservado. ¡Nos vemos el 24 de octubre!';
          showFase2Notice();
        } else {
          title.textContent = 'Ya enviaste tu respuesta';
          msg.textContent   = 'Registramos que no podrás asistir. ¡Te extrañaremos!';
        }
        showState('rsvp-success');
        return;
      }
      guestData = data;
      pasesVal  = 1;
      document.getElementById('rsvp-name-display').textContent  = data.nombre;
      document.getElementById('rsvp-passes-display').textContent = data.pases;
      document.getElementById('rsvp-passes-plural').textContent  = data.pases === 1 ? '' : 's';
      document.getElementById('rsvp-val-pases').textContent      = pasesVal;
      document.getElementById('rsvp-step-1').classList.remove('rsvp-hidden');
      document.getElementById('rsvp-step-2').classList.add('rsvp-hidden');
      showState('rsvp-form');
    })
    .catch(function() {
      showState('rsvp-notfound');
    });
}

(function init() {
  var urlParams = new URLSearchParams(window.location.search);
  var inv       = urlParams.get('inv');
  guestId       = inv;

  showState('rsvp-loading');

  fetch(APPS_SCRIPT_URL + '?action=config')
    .then(function(r) { return r.json(); })
    .then(function(cfg) {
      var fechaLimite = cfg.fechaLimite || '2026-09-01';
      fechaFase2Cfg   = cfg.fechaFase2  || '2026-09-01';

      setDeadlineDates(fechaLimite);

      if (new Date() >= new Date(fechaLimite + 'T00:00:00')) {
        if (inv) {
          var btn = document.getElementById('rsvp-fase2-btn');
          btn.href = 'confirmar.html?inv=' + encodeURIComponent(inv);
          btn.classList.remove('rsvp-hidden');
        }
        showState('rsvp-closed');
        return;
      }

      if (!inv) {
        showState('rsvp-noparam');
        return;
      }

      doLookup(inv);
    })
    .catch(function() {
      // Fallback si el config falla
      setDeadlineDates('2026-09-01');
      if (new Date() >= new Date('2026-09-01T00:00:00')) {
        showState('rsvp-closed');
      } else if (!inv) {
        showState('rsvp-noparam');
      } else {
        doLookup(inv);
      }
    });
})();
