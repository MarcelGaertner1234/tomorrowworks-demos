(() => {
  'use strict';

  const toggle = document.querySelector('.nav-toggle');
  const liste = document.getElementById('nav-liste');

  if (toggle && liste) {
    toggle.addEventListener('click', () => {
      const offen = liste.classList.toggle('offen');
      toggle.setAttribute('aria-expanded', offen ? 'true' : 'false');
    });

    liste.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        liste.classList.remove('offen');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
