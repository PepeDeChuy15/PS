const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTbd4EnvoME0szwB8cwkUNLqzKrO89Dz1mW5cIPXpmUuwMjDnFFPFBFDYjAVX4LZK5/exec';

function showState(id) {
  ['s-form', 's-loading', 's-success', 's-duplicate', 's-error'].forEach(function(s) {
    document.getElementById(s).style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

function submitCode() {
  var code = document.getElementById('code-input').value.trim().toLowerCase();
  if (!code) return;
  redeem(code);
}

function redeem(code) {
  showState('s-loading');
  fetch(APPS_SCRIPT_URL + '?action=redeem&inv=' + encodeURIComponent(code))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.yaCanjeado) {
        document.getElementById('dup-name').textContent = data.nombre || code;
        document.getElementById('dup-time').textContent = data.timestamp ? 'Registrado: ' + data.timestamp : '';
        showState('s-duplicate');
      } else if (data.ok) {
        document.getElementById('ok-name').textContent = data.nombre;
        document.getElementById('ok-passes').textContent = data.pasesFinales;
        document.getElementById('ok-plural').textContent = data.pasesFinales === 1 ? '' : 's';
        showState('s-success');
      } else {
        document.getElementById('err-msg').textContent = data.error || 'Verifica el código e intenta de nuevo.';
        showState('s-error');
      }
    })
    .catch(function() {
      document.getElementById('err-msg').textContent = 'Error de conexión. Verifica el internet e intenta de nuevo.';
      showState('s-error');
    });
}

function reset() {
  document.getElementById('code-input').value = '';
  showState('s-form');
  document.getElementById('code-input').focus();
  history.replaceState(null, '', location.pathname);
}

(function init() {
  var code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    document.getElementById('code-input').value = code;
    redeem(code.trim().toLowerCase());
  } else {
    document.getElementById('code-input').focus();
  }
})();
