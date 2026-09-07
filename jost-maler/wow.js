(() => {
  'use strict';
  const comparison = document.querySelector('[data-paint-comparison]');
  if (!comparison) return;
  const slider = comparison.querySelector('#paint-slider');
  const buttons = [...comparison.querySelectorAll('[data-paint-position]')];
  const update = () => {
    const value = Number(slider.value);
    comparison.style.setProperty('--paint-reveal', `${value}%`);
    slider.setAttribute('aria-valuetext', `${value} Prozent renovierter Raum sichtbar`);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.paintPosition) === value)));
    comparison.querySelector('.paint-state--after').hidden = value < 20;
    comparison.querySelector('.paint-state--before').hidden = value > 80;
  };
  slider.addEventListener('input', update);
  buttons.forEach(button => button.addEventListener('click', () => { slider.value = button.dataset.paintPosition; update(); }));
  update();
})();
