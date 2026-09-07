// The hero edits Ring 1 in the existing configurator; one shared selection.
(() => {
  'use strict';
  const hero = document.querySelector('.atelier-hero');
  const configurator = document.querySelector('[data-ring-konfigurator]');
  if (!hero || !configurator) return;
  const image = hero.querySelector('[data-atelier-image]');
  const name = hero.querySelector('[data-atelier-metal-name]');
  const input = hero.querySelector('#atelier-gravur');
  const originalInput = configurator.querySelector('#gravur-1');
  const preview = hero.querySelector('[data-atelier-engraving-preview]');
  const request = hero.querySelector('[data-atelier-request]');
  const materials = {
    gelbgold: { name: 'Gelbgold', image: 'assets/wow-ring-gold.webp' },
    weissgold: { name: 'Weißgold', image: 'assets/wow-ring-white.webp' },
    'roségold': { name: 'Roségold', image: 'assets/wow-ring-rose.webp' },
    platin: { name: 'Platin', image: 'assets/wow-ring-white.webp' },
  };
  let metal = 'gelbgold';
  const sync = () => {
    const material = materials[metal];
    if (image.getAttribute('src') !== material.image) image.src = material.image;
    image.alt = `Ring aus ${material.name} auf tiefgrünem Samt — KI-generierte Materialstudie`;
    name.textContent = material.name;
    hero.querySelectorAll('[data-atelier-metal]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.atelierMetal === metal)));
    if (input.value !== originalInput.value) input.value = originalInput.value;
    preview.textContent = input.value.trim() ? `Ihre Gravur: „${input.value.trim()}“` : 'Bis zu 20 Zeichen für Ihren persönlichen Moment.';
    hero.querySelector('[data-atelier-engraving-text]').textContent = input.value.trim();
    request.href = configurator.querySelector('[data-ring-cta]').href;
  };
  hero.querySelectorAll('[data-atelier-metal]').forEach(button => button.addEventListener('click', () => {
    configurator.querySelector('[data-ring-tab="1"]').click();
    configurator.querySelector(`[data-ring-material="${button.dataset.atelierMetal}"]`).click();
  }));
  input.addEventListener('input', () => {
    originalInput.value = input.value;
    originalInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
  configurator.addEventListener('ringchange', event => {
    if (event.detail.index === 0) metal = event.detail.material;
    queueMicrotask(sync);
  });
  configurator.addEventListener('click', () => queueMicrotask(sync));
  const photo = hero.querySelector('[data-atelier-photo]');
  const lettering = hero.querySelector('.atelier-lettering');
  // Align lettering with the photograph's intrinsic coordinates at every crop.
  const alignLettering = () => {
    const width = image.clientWidth;
    const height = image.clientHeight;
    const scale = Math.max(width / 1536, height / 1024);
    const position = getComputedStyle(image).objectPosition.split(' ').map(Number.parseFloat);
    lettering.style.width = `${1536 * scale}px`;
    lettering.style.height = `${1024 * scale}px`;
    lettering.style.left = `${(width - 1536 * scale) * position[0] / 100}px`;
    lettering.style.top = `${(height - 1024 * scale) * position[1] / 100}px`;
  };
  new ResizeObserver(alignLettering).observe(image);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  photo.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    const rect = photo.getBoundingClientRect();
    photo.style.setProperty('--light-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
    photo.style.setProperty('--light-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
  });
  sync();
})();
