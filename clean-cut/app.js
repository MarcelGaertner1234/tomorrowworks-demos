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

  /* ---------- Hero-Höhe: Bild füllt den restlichen Viewport ---------- */
  var heroBand = document.querySelector('.hero-slideshow');
  if (heroBand) {
    var setHeroHeight = function () {
      var banner = document.querySelector('.draft-banner');
      var header = document.querySelector('.site-header');
      var rest =
        window.innerHeight -
        (banner ? banner.offsetHeight : 0) -
        (header ? header.offsetHeight : 0);
      document.documentElement.style.setProperty('--hero-h', Math.max(rest, 320) + 'px');
    };
    setHeroHeight();
    window.addEventListener('resize', setHeroHeight);
  }

  /* ---------- Hero-Slideshow ---------- */
  document.querySelectorAll('[data-slideshow]').forEach(function (show) {
    var slides = [].slice.call(show.querySelectorAll('.slide'));
    var dots = [].slice.call(show.querySelectorAll('.slide-dot'));
    var captionEl = document.querySelector('[data-slide-caption]');
    var initialCaptionHtml = captionEl ? captionEl.innerHTML : '';
    var current = 0;
    var timer = null;
    var leaveTimer = null;

    function render(index) {
      var previous = current;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.remove('is-leaving');
        // alter Slide bleibt opak unter dem neuen liegen — kein Durchblitzen des Hintergrunds
        if (i === previous && previous !== current) slide.classList.add('is-leaving');
        slide.classList.toggle('is-active', i === current);
        if (i === current) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
      });
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(function () {
        slides.forEach(function (slide) { slide.classList.remove('is-leaving'); });
      }, 1250);
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

  /* ---------- Beispieltag Dienstag: Belegung 1:1 aus portal.html ----------
     Dieselben Buchungscodes, Pausen- und Abwesenheitsblöcke wie im
     Teamkalender des Team-Portals. Reine Beispieldaten — kein echter
     Kalender, keine Speicherung, keine Übertragung. */
  var RASTER = { start: '09:00', ende: '18:00', schrittMinuten: 30 };

  var BEISPIELTAG_DIENSTAG = [
    {
      id: 'max',
      name: 'Max · Inhaber',
      platz: 'Platz A',
      eintraege: [
        { von: '09:00', bis: '09:45', label: 'belegt · B-1041', art: 'termin' },
        { von: '10:00', bis: '11:00', label: 'belegt · B-1044', art: 'termin' },
        { von: '11:30', bis: '12:00', label: 'belegt · B-1049', art: 'termin' },
        { von: '14:00', bis: '14:45', label: 'belegt · B-1053', art: 'termin' },
        { von: '16:30', bis: '17:15', label: 'belegt · B-1058', art: 'termin' },
      ],
    },
    {
      id: 'leon',
      name: 'Leon',
      platz: 'Platz B',
      eintraege: [
        { von: '09:30', bis: '10:15', label: 'belegt · B-1042', art: 'termin' },
        { von: '10:30', bis: '11:15', label: 'belegt · B-1046', art: 'termin' },
        { von: '12:00', bis: '13:00', label: 'Pause', art: 'pause' },
        { von: '13:00', bis: '14:00', label: 'belegt · B-1051', art: 'termin' },
        { von: '15:00', bis: '15:30', label: 'belegt · B-1055', art: 'termin' },
        { von: '17:30', bis: '18:15', label: 'belegt · B-1060', art: 'termin' },
      ],
    },
    {
      id: 'lena',
      name: 'Lena',
      platz: 'Platz C',
      eintraege: [
        { von: '09:00', bis: '09:30', label: 'belegt · B-1040', art: 'termin' },
        { von: '11:00', bis: '12:00', label: 'belegt · B-1047', art: 'termin' },
        { von: '14:30', bis: '15:15', label: 'belegt · B-1054', art: 'termin' },
        { von: '16:00', bis: '16:30', label: 'belegt · B-1057', art: 'termin' },
        { von: '17:00', bis: '18:30', label: 'Urlaub beantragt', art: 'abwesend' },
      ],
    },
  ];

  function minutenAus(zeit) {
    var teile = zeit.split(':');
    return Number(teile[0]) * 60 + Number(teile[1]);
  }

  function zeitAus(minuten) {
    var stunde = Math.floor(minuten / 60);
    var rest = minuten % 60;
    return (stunde < 10 ? '0' : '') + stunde + ':' + (rest < 10 ? '0' : '') + rest;
  }

  function rasterZeiten() {
    var zeiten = [];
    for (
      var minute = minutenAus(RASTER.start);
      minute <= minutenAus(RASTER.ende);
      minute += RASTER.schrittMinuten
    ) {
      zeiten.push(zeitAus(minute));
    }
    return zeiten;
  }

  function belegungFuer(stylist, zeit) {
    var beginn = minutenAus(zeit);
    var ende = beginn + RASTER.schrittMinuten;
    var treffer = null;
    stylist.eintraege.forEach(function (eintrag) {
      if (!treffer && minutenAus(eintrag.von) < ende && minutenAus(eintrag.bis) > beginn) {
        treffer = eintrag;
      }
    });
    return treffer;
  }

  /* ---------- Terminplaner ---------- */
  document.querySelectorAll('[data-planner]').forEach(function (form) {
    var state = { day: null, time: null, stylist: 'max', slot: null };
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
      if (!state.time) parts.push('Wunschzeit');
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

    /* --- Modul „Stylist & Uhrzeit am Beispieltag" --- */
    function aktuellerStylist() {
      var gefunden = BEISPIELTAG_DIENSTAG[0];
      BEISPIELTAG_DIENSTAG.forEach(function (eintrag) {
        if (eintrag.id === state.stylist) gefunden = eintrag;
      });
      return gefunden;
    }

    var slotpicker = form.querySelector('[data-slotpicker]');
    if (slotpicker) {
      var slotGrid = slotpicker.querySelector('[data-slotgrid]');
      var slotHint = slotpicker.querySelector('[data-slot-hint]');
      var stylistBtns = [].slice.call(slotpicker.querySelectorAll('[data-stylist]'));

      // Auswahl nur ummarkieren statt neu zu zeichnen — sonst verliert die
      // Tastatur den Fokus auf den gerade gewaehlten Slot.
      var markiereSlots = function () {
        slotGrid.querySelectorAll('[data-slot][aria-pressed]').forEach(function (knopf) {
          knopf.setAttribute(
            'aria-pressed',
            knopf.getAttribute('data-slot') === state.slot ? 'true' : 'false',
          );
        });
      };

      // aria-live nur bei echter Aenderung neu befuellen — sonst liest der
      // Screenreader den Hinweis schon beim Laden vor.
      var setzeSlotHinweis = function (text) {
        if (slotHint.textContent.trim() !== text.trim()) slotHint.textContent = text;
      };
      var ersterSlotAufbau = true;

      var zeichneSlots = function () {
        var stylist = aktuellerStylist();
        var zeiten = rasterZeiten();
        var frei = 0;
        slotGrid.textContent = '';
        zeiten.forEach(function (zeit) {
          var belegung = belegungFuer(stylist, zeit);
          var bis = zeitAus(minutenAus(zeit) + RASTER.schrittMinuten);
          var knopf = document.createElement('button');
          var uhrzeit = document.createElement('strong');
          var zusatz = document.createElement('small');
          knopf.type = 'button';
          knopf.className = 'chip chip--slot';
          knopf.setAttribute('data-slot', zeit);
          uhrzeit.textContent = zeit;
          knopf.appendChild(uhrzeit);
          knopf.appendChild(zusatz);
          if (belegung) {
            // aria-disabled statt disabled: belegte Zeiten bleiben per Tastatur
            // erreichbar und werden vorgelesen, lassen sich aber nicht waehlen.
            knopf.setAttribute('aria-disabled', 'true');
            knopf.setAttribute('data-art', belegung.art);
            zusatz.textContent = belegung.label;
            knopf.setAttribute(
              'aria-label',
              zeit + ' Uhr — ' + belegung.label + ' (' + belegung.von + ' bis ' + belegung.bis + ')',
            );
          } else {
            frei += 1;
            zusatz.textContent = 'frei';
            knopf.setAttribute('aria-pressed', state.slot === zeit ? 'true' : 'false');
            knopf.setAttribute('aria-label', zeit + ' bis ' + bis + ' Uhr frei — Beispielzeit wählen');
            knopf.addEventListener('click', function () {
              state.slot = state.slot === zeit ? null : zeit;
              if (panel && !panel.hidden) panel.hidden = true;
              markiereSlots();
              update();
            });
          }
          slotGrid.appendChild(knopf);
        });
        // Beim ersten Aufbau bleibt der Markup-Text stehen (keine Ansage ohne Nutzeraktion).
        if (ersterSlotAufbau) {
          ersterSlotAufbau = false;
          return;
        }
        setzeSlotHinweis(
          stylist.name +
            ' · ' +
            stylist.platz +
            ' — ' +
            frei +
            ' von ' +
            zeiten.length +
            ' Beispielzeiten frei. Belegte Zeiten stammen 1:1 aus dem Team-Portal (Beispieltag Dienstag) und sind keine echte Verfügbarkeit.',
        );
      };

      stylistBtns.forEach(function (knopf) {
        knopf.addEventListener('click', function () {
          state.stylist = knopf.getAttribute('data-stylist');
          state.slot = null;
          stylistBtns.forEach(function (anderer) {
            anderer.setAttribute('aria-pressed', anderer === knopf ? 'true' : 'false');
          });
          if (panel && !panel.hidden) panel.hidden = true;
          zeichneSlots();
          update();
        });
      });

      zeichneSlots();
    }

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
      var stylistZeile = form.querySelector('[data-sum-stylistzeit]');
      if (stylistZeile && slotpicker) {
        var gewaehlt = aktuellerStylist();
        stylistZeile.textContent =
          gewaehlt.name +
          ' · ' +
          gewaehlt.platz +
          ' · ' +
          (state.slot
            ? state.slot + '–' + zeitAus(minutenAus(state.slot) + RASTER.schrittMinuten) + ' Uhr'
            : 'noch keine Beispielzeit gewählt');
      }
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
