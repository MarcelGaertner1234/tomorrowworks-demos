// Local inquiry handoff; no real booking or transmission.
(() => {
  'use strict';
  const form = document.querySelector('[data-hotel-form]');
  if (!form) return;
  const error = form.querySelector('[data-fehler]');
  const confirmation = document.querySelector('[data-bestaetigung]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const period = form.elements.zeitraum.value.trim();
    let message = '';
    if (!name) message = 'Bitte geben Sie Ihren Namen an.';
    else if (!email || !form.elements.email.validity.valid) message = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
    else if (!period) message = 'Bitte geben Sie Ihren gewünschten Zeitraum an oder übernehmen Sie ihn aus dem Aufenthaltsplaner.';
    if (message) {
      error.textContent = message;
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const room = form.elements.zimmertyp.selectedOptions[0].textContent;
    const note = form.elements.nachricht.value.trim();
    confirmation.querySelector('[data-zusammenfassung]').textContent =
      `${name} · ${email}\n${room} · ${period}${note ? `\n${note}` : ''}`;
    if (!BranchDemo.accept(form, confirmation)) return;
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  });
  document.querySelector('[data-hotel-bearbeiten]').addEventListener('click', () => {
    confirmation.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
