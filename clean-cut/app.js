/* CLEAN CUT Demo — Terminplaner, Reveals, Link-Kopieren.
   Reine Demo: speichert nichts, versendet nichts, kein alert/confirm. */
(function () {
  'use strict';

  /* ---------- Scroll-Reveals ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero-Slideshow ---------- */
  document.querySelectorAll('[data-slideshow]').forEach(function (show) {
    var slides = [].slice.call(show.querySelectorAll('.slide'));
    var dots = [].slice.call(show.querySelectorAll('.slide-dot'));
    var captionEl = document.querySelector('[data-slide-caption]');
    var initialCaptionHtml = captionEl ? captionEl.innerHTML : '';
    var current = 0;
    var timer = null;

    function render(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
        if (i === current) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
      });
      dots.forEach(function (dot, i) {
        if (i === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (captionEl) {
        if (current === 0) captionEl.innerHTML = initialCaptionHtml;
        else captionEl.textContent = slides[current].getAttribute('data-caption') || '';
      }
    }

    function stopAutoplay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
        show.setAttribute('data-autoplay', 'off');
      }
    }

    show.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () { stopAutoplay(); render(current + 1); });
    });
    show.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () { stopAutoplay(); render(current - 1); });
    });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopAutoplay();
        render(Number(dot.getAttribute('data-goto')) || 0);
      });
    });

    if (reduceMotion) {
      show.setAttribute('data-autoplay', 'off');
    } else {
      show.setAttribute('data-autoplay', 'on');
      timer = window.setInterval(function () { render(current + 1); }, 5500);
      show.addEventListener('mouseenter', function () {
        if (timer) { window.clearInterval(timer); timer = null; }
      });
      show.addEventListener('mouseleave', function () {
        if (!timer && show.getAttribute('data-autoplay') === 'on') {
          timer = window.setInterval(function () { render(current + 1); }, 5500);
        }
      });
    }

    render(0);
  });

  /* ---------- Öffnungsstatus (nach Vorlage-Zeiten, rein lokal berechnet) ---------- */
  var statusBadge = document.querySelector('[data-open-status]');
  if (statusBadge) {
    var jetzt = new Date();
    var tag = jetzt.getDay(); // 0 = Sonntag … 6 = Samstag
    var minuten = jetzt.getHours() * 60 + jetzt.getMinutes();
    var vorlageZeiten = {
      2: [540, 1110], // Di 09:00–18:30
      3: [540, 1110], // Mi
      4: [540, 1110], // Do
      5: [540, 1140], // Fr 09:00–19:00
      6: [540, 870], // Sa 09:00–14:30
    };
    var fenster = vorlageZeiten[tag];
    var offen = Boolean(fenster) && minuten >= fenster[0] && minuten < fenster[1];
    statusBadge.textContent = offen
      ? 'Nach Vorlage-Zeiten: jetzt geöffnet'
      : 'Nach Vorlage-Zeiten: derzeit geschlossen';
    statusBadge.dataset.state = offen ? 'open' : 'closed';
    statusBadge.hidden = false;
  }

  /* ---------- Vorschau-Link kopieren ---------- */
  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener('click', function () {
      var url = new URL(btn.getAttribute('data-link'), window.location.href).href;
      var done = function () {
        btn.textContent = 'Link kopiert ✓';
        window.setTimeout(function () { btn.textContent = original; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          btn.textContent = url;
        });
      } else {
        btn.textContent = url;
      }
    });
  });

  /* ---------- Terminplaner ---------- */
  document.querySelectorAll('[data-planner]').forEach(function (form) {
    var state = { day: null, time: null };
    var confirmBtn = form.querySelector('[data-confirm]');
    var statusEl = form.querySelector('[data-status]');
    var panel = form.querySelector('[data-confirm-panel]');
    var vorname = form.querySelector('input[name="vorname"]');
    var nachname = form.querySelector('input[name="nachname"]');
    var handy = form.querySelector('input[name="handy"]');

    function digits(value) {
      return (value.match(/\d/g) || []).length;
    }

    function missing() {
      var parts = [];
      if (!state.day) parts.push('Beispieltag');
      if (!state.time) parts.push('Uhrzeit');
      if (!vorname.value.trim()) parts.push('Vorname');
      if (!nachname.value.trim()) parts.push('Nachname');
      if (digits(handy.value) < 7) parts.push('Handynummer (mind. 7 Ziffern)');
      return parts;
    }

    function update() {
      var open = missing();
      confirmBtn.disabled = open.length > 0;
      if (open.length === 0) {
        statusEl.textContent = 'Alles gewählt — der Demo-Termin kann bestätigt werden.';
      } else {
        statusEl.textContent = 'Es fehlt noch: ' + open.join(', ') + '.';
      }
    }

    function bindChips(container, key, attr) {
      if (!container) return;
      var chips = container.querySelectorAll('.chip');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (other) { other.setAttribute('aria-pressed', 'false'); });
          chip.setAttribute('aria-pressed', 'true');
          state[key] = chip.getAttribute(attr);
          if (panel && !panel.hidden) { panel.hidden = true; }
          update();
        });
      });
    }

    bindChips(form.querySelector('[data-days]'), 'day', 'data-day');
    bindChips(form.querySelector('[data-times]'), 'time', 'data-time');

    [vorname, nachname, handy].forEach(function (input) {
      input.addEventListener('input', update);
    });
    form.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (panel && !panel.hidden) { panel.hidden = true; }
        update();
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (missing().length > 0) { update(); return; }
      var leistung = form.querySelector('input[name="leistung"]:checked');
      var friseur = form.querySelector('input[name="friseur"]:checked');
      form.querySelector('[data-sum-leistung]').textContent = leistung ? leistung.value : '—';
      form.querySelector('[data-sum-friseur]').textContent = friseur ? friseur.value : '—';
      form.querySelector('[data-sum-termin]').textContent =
        state.day + ' · ' + state.time + ' Uhr (Beispiel)';
      form.querySelector('[data-sum-name]').textContent =
        vorname.value.trim() + ' ' + nachname.value.trim();
      panel.hidden = false;
      statusEl.textContent =
        'Demo abgeschlossen — es wurden keine Daten gespeichert oder versendet.';
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });

    update();
  });
})();
