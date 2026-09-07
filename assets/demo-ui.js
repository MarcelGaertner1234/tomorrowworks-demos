/* Shared, local-only navigation and form feedback for the design studies. */
(() => {
  'use strict';

  const mobile = window.matchMedia('(max-width: 900px)');
  const nav = document.querySelector('nav[aria-label="Hauptnavigation"]');
  if (nav && nav.querySelectorAll('a').length > 2) {
    const host = nav.parentElement;
    const brand = host.querySelector(':scope > a.wordmark, :scope > a.wortmarke, :scope > a.brand, :scope > a.masthead-marke');
    if (brand) {
      host.setAttribute('data-demo-nav-host', '');
      brand.setAttribute('data-demo-brand', '');
      nav.setAttribute('data-demo-nav', '');
      if (!nav.id) nav.id = 'demo-main-nav';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'demo-menu-toggle';
      button.setAttribute('aria-controls', nav.id);
      button.innerHTML = '<span class="demo-menu-icon" aria-hidden="true">☰</span><span>Menü</span>';
      host.insertBefore(button, nav);

      // Keep desktop composition; include its separate actions in the mobile menu.
      host.querySelectorAll(':scope > a.btn, :scope > .header-side').forEach((action) => {
        action.setAttribute('data-demo-desktop-action', '');
        const links = action.matches('a') ? [action] : [...action.querySelectorAll('a')];
        links.forEach((link) => {
          const copy = link.cloneNode(true);
          copy.removeAttribute('id');
          copy.classList.add('demo-mobile-link');
          nav.append(copy);
        });
      });

      let expanded = false;
      const render = () => {
        nav.hidden = mobile.matches && !expanded;
        button.setAttribute('aria-expanded', String(mobile.matches && expanded));
        button.querySelector('.demo-menu-icon').textContent = expanded ? '×' : '☰';
        button.lastElementChild.textContent = expanded ? 'Schließen' : 'Menü';
      };
      const close = (restoreFocus = false) => {
        expanded = false;
        render();
        if (restoreFocus && mobile.matches) button.focus();
      };
      button.addEventListener('click', () => { expanded = !expanded; render(); });
      nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) close();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && expanded) close(true);
      });
      document.addEventListener('click', (event) => {
        if (expanded && !host.contains(event.target)) close();
      });
      mobile.addEventListener('change', () => close());
      render();

      const header = host.closest('.site-header, .sidebar') || host;
      const measure = () => {
        const sticky = ['sticky', 'fixed'].includes(getComputedStyle(header).position);
        document.documentElement.style.setProperty('--demo-header-height', `${sticky ? header.offsetHeight : 0}px`);
      };
      new ResizeObserver(measure).observe(header);
    }
  }

  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const sync = () => tabs.forEach((tab) => { tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1; });
    tablist.addEventListener('click', () => queueMicrotask(sync));
    tablist.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].click();
      tabs[next].focus();
      sync();
    });
    sync();
  });

  const dateValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dates = [...document.querySelectorAll('input[type="date"]')];
  const updateDates = () => {
    const today = dateValue(new Date());
    dates.forEach((field) => {
      field.min = today;
      if (/abreise/.test(field.id)) {
        const arrival = document.getElementById(field.id.replace('abreise', 'anreise'));
        if (arrival?.value && arrival.value >= today) {
          const next = new Date(`${arrival.value}T12:00:00`);
          next.setDate(next.getDate() + 1);
          field.min = dateValue(next);
        }
      }
    });
  };
  const clearDateError = (field) => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
    const message = document.getElementById(`${field.id}-date-error`);
    if (message) message.remove();
  };
  dates.forEach((field) => {
    field.addEventListener('input', () => { clearDateError(field); updateDates(); });
    field.addEventListener('change', () => { clearDateError(field); updateDates(); });
  });
  updateDates();

  document.addEventListener('submit', (event) => {
    updateDates();
    const invalid = dates.find((field) => event.target.contains(field) && !field.disabled && field.getClientRects().length && field.value && field.value < field.min);
    if (!invalid) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    clearDateError(invalid);
    const message = document.createElement('p');
    message.id = `${invalid.id}-date-error`;
    message.className = 'demo-field-error';
    message.setAttribute('role', 'alert');
    message.textContent = /abreise/.test(invalid.id)
      ? 'Bitte eine Abreise nach der Anreise wählen.'
      : 'Bitte ein Datum ab heute wählen.';
    invalid.setAttribute('aria-invalid', 'true');
    invalid.setAttribute('aria-errormessage', message.id);
    invalid.insertAdjacentElement('afterend', message);
    invalid.focus();
  }, true);

  // Existing demo handlers own validation and confirmation content.
  document.addEventListener('submit', () => queueMicrotask(() => {
    const visible = (element) => element && !element.hidden && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
    const error = [...document.querySelectorAll('[data-fehler]')].find((element) => visible(element) && element.textContent.trim());
    const confirmation = [...document.querySelectorAll('[data-bestaetigung]')].find(visible);
    const target = error || confirmation;
    if (target) { target.tabIndex = -1; target.focus(); }
  }));
  document.addEventListener('reset', (event) => {
    dates.filter((field) => event.target.contains(field)).forEach(clearDateError);
    queueMicrotask(updateDates);
  });
})();
