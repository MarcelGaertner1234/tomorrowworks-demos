/* CLEAN CUT Demo — Terminplaner, Reveals, Link-Kopieren.
   Reine Demo: Vorgänge im Browser-Tab, kein Versand, keine gespeicherten Kontaktdaten. */
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

    var pauseButton = show.querySelector('[data-slide-pause]');

    function stopAutoplay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      show.setAttribute('data-autoplay', 'off');
      if (pauseButton) {
        pauseButton.textContent = 'Bilder abspielen';
        pauseButton.setAttribute('aria-pressed', 'true');
      }
    }

    function startAutoplay() {
      stopAutoplay();
      show.setAttribute('data-autoplay', 'on');
      timer = window.setInterval(function () { render(current + 1); }, 5500);
      if (pauseButton) {
        pauseButton.textContent = 'Bilder pausieren';
        pauseButton.setAttribute('aria-pressed', 'false');
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

    if (reduceMotion) stopAutoplay();
    else startAutoplay();

    if (pauseButton) pauseButton.addEventListener('click', function () {
      if (show.getAttribute('data-autoplay') === 'on') stopAutoplay();
      else startAutoplay();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay();
    });

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
     Kalender mit festen Beispieldaten, keine Übertragung. */
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

  function rasterZeiten(raster) {
    var zeiten = [];
    for (
      var minute = minutenAus(raster.start);
      minute <= minutenAus(raster.ende);
      minute += raster.schrittMinuten
    ) {
      zeiten.push(zeitAus(minute));
    }
    return zeiten;
  }

  function belegungFuer(stylist, zeit, tag, raster, dauer, ignorieren) {
    var beginn = minutenAus(zeit);
    var ende = beginn + (dauer || raster.schrittMinuten);
    if (ende > minutenAus(raster.ende) + 30) return {von:zeit,bis:zeitAus(ende),label:"außerhalb der Beispiel-Öffnungszeit",art:"pause"};
    var treffer = null;
    stylist.eintraege.forEach(function (eintrag) {
      if (!treffer && minutenAus(eintrag.von) < ende && minutenAus(eintrag.bis) > beginn) {
        treffer = eintrag;
      }
    });
    if (!treffer) {
      // Zweite Belegungsquelle: Sitzungs-Buchungen aus dem Demo-Planer (Schritt 05),
      // die denselben Platz zur selben Zeit am selben Beispieltag belegen.
      Object.keys(buchungen).forEach(function (code) {
        if (treffer || code === ignorieren) return;
        var buchung = buchungen[code];
        if (buchung.stylist !== stylist.id || buchung.tag !== tag) return;
        var buchungsBeginn = minutenAus(buchung.zeit);
        var buchungsEnde = buchungsBeginn + (buchung.duration || 30);
        if (buchungsBeginn < ende && buchungsEnde > beginn) {
          treffer = {
            von: buchung.zeit,
            bis: zeitAus(buchungsEnde),
            label: 'belegt · ' + code,
            art: 'termin',
          };
        }
      });
    }
    return treffer;
  }

  var RASTER_SA = { start: '09:00', ende: '14:00', schrittMinuten: 30 };

  function rasterFuerTag(tag) {
    return tag === 'sa' ? RASTER_SA : RASTER;
  }

  var TAG_NAMEN = {
    mo: 'Montag',
    di: 'Dienstag',
    mi: 'Mittwoch',
    do: 'Donnerstag',
    fr: 'Freitag',
    sa: 'Samstag',
  };

  /* ---------- Beispielwoche: weitere Beispieltage neben Dienstag ----------
     Nur „di" ist die 1:1-Spiegelung des Team-Portals (Referenz auf
     BEISPIELTAG_DIENSTAG, keine Kopie — siehe bestehender Spiegelungs-Check
     in verify.mjs). Die übrigen Tage sind zusätzliche, eigenständige
     Beispieldaten in derselben Objektform — ebenfalls reine Demo, kein
     echter Kalender mit festen Beispieldaten, keine Übertragung. */
  var BEISPIELWOCHE = {
    mo: [
      {
        id: 'max',
        name: 'Max · Inhaber',
        platz: 'Platz A',
        eintraege: [
          { von: '09:00', bis: '09:45', label: 'belegt · B-1061', art: 'termin' },
          { von: '11:15', bis: '12:00', label: 'belegt · B-1062', art: 'termin' },
          { von: '15:00', bis: '15:45', label: 'belegt · B-1063', art: 'termin' },
        ],
      },
      {
        id: 'leon',
        name: 'Leon',
        platz: 'Platz B',
        eintraege: [
          { von: '09:30', bis: '10:15', label: 'belegt · B-1064', art: 'termin' },
          { von: '12:00', bis: '13:00', label: 'Pause', art: 'pause' },
          { von: '13:30', bis: '14:15', label: 'belegt · B-1065', art: 'termin' },
          { von: '16:00', bis: '16:45', label: 'belegt · B-1066', art: 'termin' },
        ],
      },
      {
        id: 'lena',
        name: 'Lena',
        platz: 'Platz C',
        eintraege: [
          { von: '10:00', bis: '10:30', label: 'belegt · B-1067', art: 'termin' },
          { von: '13:00', bis: '14:00', label: 'belegt · B-1068', art: 'termin' },
          { von: '16:30', bis: '17:00', label: 'belegt · B-1069', art: 'termin' },
        ],
      },
    ],
    di: BEISPIELTAG_DIENSTAG,
    mi: [
      {
        id: 'max',
        name: 'Max · Inhaber',
        platz: 'Platz A',
        eintraege: [
          { von: '09:15', bis: '10:00', label: 'belegt · B-1070', art: 'termin' },
          { von: '11:30', bis: '12:15', label: 'belegt · B-1071', art: 'termin' },
          { von: '14:30', bis: '15:15', label: 'belegt · B-1072', art: 'termin' },
        ],
      },
      {
        id: 'leon',
        name: 'Leon',
        platz: 'Platz B',
        eintraege: [
          { von: '09:00', bis: '09:45', label: 'belegt · B-1073', art: 'termin' },
          { von: '12:00', bis: '13:00', label: 'Pause', art: 'pause' },
          { von: '13:00', bis: '13:45', label: 'belegt · B-1074', art: 'termin' },
          { von: '15:30', bis: '16:15', label: 'belegt · B-1075', art: 'termin' },
        ],
      },
      {
        id: 'lena',
        name: 'Lena',
        platz: 'Platz C',
        eintraege: [
          { von: '10:30', bis: '11:00', label: 'belegt · B-1076', art: 'termin' },
          { von: '13:15', bis: '14:00', label: 'belegt · B-1077', art: 'termin' },
          { von: '16:00', bis: '16:45', label: 'belegt · B-1078', art: 'termin' },
        ],
      },
    ],
    do: [
      {
        id: 'max',
        name: 'Max · Inhaber',
        platz: 'Platz A',
        eintraege: [
          { von: '09:00', bis: '09:30', label: 'belegt · B-1079', art: 'termin' },
          { von: '10:45', bis: '11:30', label: 'belegt · B-1080', art: 'termin' },
          { von: '14:00', bis: '14:45', label: 'belegt · B-1081', art: 'termin' },
        ],
      },
      {
        id: 'leon',
        name: 'Leon',
        platz: 'Platz B',
        eintraege: [
          { von: '09:30', bis: '10:15', label: 'belegt · B-1082', art: 'termin' },
          { von: '12:00', bis: '13:00', label: 'Pause', art: 'pause' },
          { von: '13:30', bis: '14:15', label: 'belegt · B-1083', art: 'termin' },
          { von: '16:15', bis: '17:00', label: 'belegt · B-1084', art: 'termin' },
        ],
      },
      {
        id: 'lena',
        name: 'Lena',
        platz: 'Platz C',
        eintraege: [
          { von: '09:45', bis: '10:30', label: 'belegt · B-1085', art: 'termin' },
          { von: '12:30', bis: '13:15', label: 'belegt · B-1086', art: 'termin' },
          { von: '15:30', bis: '16:00', label: 'belegt · B-1087', art: 'termin' },
        ],
      },
    ],
    fr: [
      {
        id: 'max',
        name: 'Max · Inhaber',
        platz: 'Platz A',
        eintraege: [
          { von: '09:00', bis: '09:45', label: 'belegt · B-1088', art: 'termin' },
          { von: '11:00', bis: '11:45', label: 'belegt · B-1089', art: 'termin' },
          { von: '15:00', bis: '15:45', label: 'belegt · B-1090', art: 'termin' },
        ],
      },
      {
        id: 'leon',
        name: 'Leon',
        platz: 'Platz B',
        eintraege: [
          { von: '09:15', bis: '10:00', label: 'belegt · B-1091', art: 'termin' },
          { von: '12:00', bis: '13:00', label: 'Pause', art: 'pause' },
          { von: '13:15', bis: '14:00', label: 'belegt · B-1092', art: 'termin' },
          { von: '16:30', bis: '17:15', label: 'belegt · B-1093', art: 'termin' },
        ],
      },
      {
        id: 'lena',
        name: 'Lena',
        platz: 'Platz C',
        eintraege: [
          { von: '10:15', bis: '11:00', label: 'belegt · B-1094', art: 'termin' },
          { von: '13:30', bis: '14:15', label: 'belegt · B-1095', art: 'termin' },
          { von: '16:00', bis: '16:45', label: 'belegt · B-1096', art: 'termin' },
        ],
      },
    ],
    sa: [
      {
        id: 'max',
        name: 'Max · Inhaber',
        platz: 'Platz A',
        eintraege: [
          { von: '09:00', bis: '09:45', label: 'belegt · B-1097', art: 'termin' },
          { von: '10:00', bis: '10:45', label: 'belegt · B-1098', art: 'termin' },
          { von: '12:00', bis: '12:45', label: 'belegt · B-1099', art: 'termin' },
        ],
      },
      {
        id: 'leon',
        name: 'Leon',
        platz: 'Platz B',
        eintraege: [
          { von: '09:30', bis: '10:15', label: 'belegt · B-1043', art: 'termin' },
          { von: '11:00', bis: '11:45', label: 'belegt · B-1045', art: 'termin' },
          { von: '13:00', bis: '13:45', label: 'belegt · B-1048', art: 'termin' },
        ],
      },
      {
        id: 'lena',
        name: 'Lena',
        platz: 'Platz C',
        eintraege: [
          { von: '09:00', bis: '09:30', label: 'belegt · B-1050', art: 'termin' },
          { von: '10:30', bis: '11:15', label: 'belegt · B-1052', art: 'termin' },
          { von: '12:30', bis: '13:15', label: 'belegt · B-1056', art: 'termin' },
        ],
      },
    ],
  };

  /* ---------- Sitzungs-Buchungen (Demo) ----------
     Nur in sessionStorage dieses Browser-Tabs, kein Versand.
     Codes B-11xx, vergeben beim Abschluss des Planers (Schritt 05). B-1042
     ist ein fest hinterlegter Beispielcode für die Verwaltungs-Demo
     (Leon, Dienstag, 09:30 — siehe BEISPIELTAG_DIENSTAG oben). */
  var buchungen = Object.fromEntries(DemoFlow.list('clean-cut').filter(r=>r.status!=='cancelled').map(r=>[r.id,r]));
  var FESTCODE = 'B-1042';
  var FESTTERMIN = { stylist: 'leon', tag: 'di', zeit: '09:30', leistung: 'Haarschnitt' };

  function dauerFuer(leistung) { return {'Haarschnitt':45,'Bartpflege':30,'Schnitt & Bart':60}[leistung] || 30; }
  window.CleanCalendar = {
    week:BEISPIELWOCHE,days:TAG_NAMEN,minutes:minutenAus,time:zeitAus,duration:dauerFuer,
    available:function(person,tag,zeit,dauer,ignore){
      buchungen=Object.fromEntries(DemoFlow.list('clean-cut').filter(r=>r.status!=='cancelled').map(r=>[r.id,r]));
      var stylist=(BEISPIELWOCHE[tag]||[]).find(s=>s.id===person);
      if(!stylist || !rasterZeiten(rasterFuerTag(tag)).includes(zeit))return 'Bitte eine gültige Beispielzeit wählen.';
      var occupied=belegungFuer(stylist,zeit,tag,rasterFuerTag(tag),dauer,ignore);
      return occupied ? occupied.label : '';
    }
  };

  /* ---------- Terminplaner ---------- */
  document.querySelectorAll('[data-planner]').forEach(function (form) {
    var state = { day: null, time: null, stylist: 'max', slot: null, tag: 'di' };
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
      if (!state.slot) parts.push('konkrete Uhrzeit in Schritt 04');
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
    function aktuellerTagListe() {
      return BEISPIELWOCHE[state.tag] || BEISPIELWOCHE.di;
    }

    function aktuellerStylist() {
      var tagListe = aktuellerTagListe();
      var gefunden = tagListe[0];
      tagListe.forEach(function (eintrag) {
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
        var raster = rasterFuerTag(state.tag);
        var zeiten = rasterZeiten(raster);
        var frei = 0;
        slotGrid.setAttribute(
          'aria-label',
          'Beispielzeiten am Beispieltag ' +
            (TAG_NAMEN[state.tag] || 'Dienstag') +
            ' (belegte Zeiten sind gesperrt)',
        );
        slotGrid.textContent = '';
        zeiten.forEach(function (zeit) {
          var duration = dauerFuer(form.querySelector('input[name="leistung"]:checked')?.value);
          var belegung = belegungFuer(stylist, zeit, state.tag, raster, duration);
          var bis = zeitAus(minutenAus(zeit) + duration);
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
            ' Beispielzeiten frei am Beispiel-' +
            (TAG_NAMEN[state.tag] || 'Dienstag') +
            '. Belegte Zeiten stammen aus der Beispielwoche (Dienstag 1:1 aus dem Team-Portal, andere Tage als weitere Beispieldaten) und sind keine echte Verfügbarkeit.',
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

      /* --- Wochentabs: welchen Beispieltag der Woche zeigt das Raster? --- */
      var wochentabs = slotpicker.querySelector('[data-wochentabs]');
      var tagBtns = wochentabs ? [].slice.call(wochentabs.querySelectorAll('[data-tag]')) : [];
      tagBtns.forEach(function (knopf) {
        knopf.addEventListener('click', function () {
          state.tag = knopf.getAttribute('data-tag');
          state.slot = null;
          tagBtns.forEach(function (anderer) {
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
        state.slot = null;
        if(slotpicker)zeichneSlots();
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
      var gewaehlt = null;
      if (stylistZeile && slotpicker) {
        gewaehlt = aktuellerStylist();
        var raster = rasterFuerTag(state.tag);
        stylistZeile.textContent =
          gewaehlt.name +
          ' · ' +
          gewaehlt.platz +
          ' · ' +
          (state.slot
            ? state.slot + '–' + zeitAus(minutenAus(state.slot) + dauerFuer(leistung?.value)) + ' Uhr'
            : 'noch keine Beispielzeit gewählt');
      }
      form.querySelector('[data-sum-name]').textContent =
        vorname.value.trim() + ' ' + nachname.value.trim();

      /* Buchungscode nur, wenn tatsächlich ein konkreter Slot (Schritt 04)
         gewählt wurde — das grobe Wunsch-Zeitfenster (Schritt 03) allein
         belegt keinen Platz. Der Code fließt als zweite Belegungsquelle in
         belegungFuer() ein und sperrt den Slot sofort im Raster. */
      var sumCode = form.querySelector('[data-sum-code]');
      if (sumCode) {
        if (state.slot && slotpicker && gewaehlt) {
          /* Doppel-Submit auf denselben Slot (Button bleibt nach dem ersten
             Abschluss aktiv, state.slot bleibt gesetzt) darf keinen zweiten
             Zwillings-Code erzeugen — sonst würde ein Storno später nur
             einen der beiden Codes löschen und der Slot bliebe sichtbar
             belegt. belegungFuer() ist hier die Quelle der Wahrheit: findet
             sie für genau diesen Platz/Tag/Slot bereits eine eigene
             Sitzungs-Buchung (Code-Muster B-11xx), wird deren Code erneut
             angezeigt statt ein neuer vergeben. */
          var existing=Object.values(buchungen).find(r=>r.stylist===state.stylist && r.tag===state.tag && r.zeit===state.slot);
          var issue=CleanCalendar.available(state.stylist,state.tag,state.slot,dauerFuer(leistung?.value),existing?.id);
          if(issue){statusEl.textContent='Dieser Termin ist nicht frei: '+issue;state.slot=null;zeichneSlots();update();return;}
          var record;
          try {
            record=existing || DemoFlow.create('clean-cut',{status:'booked',stylist:gewaehlt.id,tag:state.tag,zeit:state.slot,leistung:leistung?leistung.value:'Haarschnitt',duration:dauerFuer(leistung?.value)},crypto.randomUUID());
          }catch(error){statusEl.textContent=error.message;return;}
          var neuerCode=record.id;
          buchungen[neuerCode]=record;
          DemoFlow.handoff(panel,'clean-cut',record);
          sumCode.hidden = false;
          sumCode.innerHTML =
            'Buchungscode <strong>' +
            neuerCode +
            '</strong> — ' +
            gewaehlt.name +
            ', ' +
            (TAG_NAMEN[state.tag] || state.tag) +
            ' ' +
            state.slot +
            ' Uhr. Mit diesem Code lässt sich der Demo-Termin unten unter „Termin verwalten" wiederfinden.';
          zeichneSlots();
        } else {
          sumCode.hidden = true;
          sumCode.textContent = '';
        }
      }

      panel.hidden = false;
      statusEl.textContent =
        'Demo abgeschlossen — der Termin bleibt in diesem Browser-Tab und ist jetzt im Teamkalender sichtbar.';
      panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      if (sumCode && !sumCode.hidden) sumCode.focus();
    });

    /* ---------- Termin verwalten (Demo) ----------
       Eigener Bereich am Seitenende, außerhalb des Planer-Formulars. Sucht
       Codes zuerst in den Sitzungs-Buchungen dieser Seite, danach im
       Festcode B-1042. Storno gibt den Slot im Planer-Raster wieder frei. */
    var verwaltung = document.querySelector('[data-verwaltung]');
    if (verwaltung) {
      var codeInput = verwaltung.querySelector('[data-verwaltung-code]');
      var suchenBtn = verwaltung.querySelector('[data-verwaltung-suchen]');
      var karte = verwaltung.querySelector('[data-verwaltung-karte]');
      var fehlerText = verwaltung.querySelector('[data-verwaltung-fehler]');

      var stylistAusListe = function (id, tag) {
        var liste = BEISPIELWOCHE[tag] || BEISPIELWOCHE.di;
        var gefunden = null;
        liste.forEach(function (eintrag) {
          if (eintrag.id === id) gefunden = eintrag;
        });
        return gefunden;
      };

      var zeigeFehler = function () {
        karte.hidden = true;
        karte.innerHTML = '';
        fehlerText.hidden = false;
        fehlerText.focus();
      };

      var zeigeTreffer = function (code, eintrag) {
        fehlerText.hidden = true;
        var stylist = stylistAusListe(eintrag.stylist, eintrag.tag);
        var name = stylist ? stylist.name + ' · ' + stylist.platz : eintrag.stylist;
        var eintragRaster = rasterFuerTag(eintrag.tag);
        var ende = zeitAus(minutenAus(eintrag.zeit) + (eintrag.duration || 30));
        var istFestcode = code === FESTCODE;

        karte.hidden = false;
        karte.innerHTML =
          '<p class="verwaltung-treffer-code">Buchungscode <strong>' +
          code +
          '</strong></p>' +
          '<dl class="confirm-summary">' +
          '<dt>Stylist</dt><dd>' +
          name +
          '</dd>' +
          '<dt>Beispieltag</dt><dd>' +
          (TAG_NAMEN[eintrag.tag] || eintrag.tag) +
          '</dd>' +
          '<dt>Uhrzeit</dt><dd>' +
          eintrag.zeit +
          '–' +
          ende +
          ' Uhr</dd>' +
          '<dt>Leistung</dt><dd>' +
          (eintrag.leistung || '—') +
          '</dd>' +
          '</dl>' +
          (istFestcode
            ? '<p class="small">Beispieltermin — Demo. Dieser Festcode dient nur der Vorschau und lässt sich hier nicht stornieren.</p>'
            : '<button type="button" class="btn btn--ghost" data-verwaltung-storno>Stornieren (Beispiel)</button>');

        if (!istFestcode) {
          var stornoBtn = karte.querySelector('[data-verwaltung-storno]');
          stornoBtn.addEventListener('click', function () {
            DemoFlow.update('clean-cut',code,{status:'cancelled'},'Termin abgesagt; Zeit wieder frei');
            delete buchungen[code];
            karte.hidden = true;
            karte.innerHTML = '';
            if (slotpicker) zeichneSlots();
            // Die fokussierte Karte samt Storno-Button ist gerade aus dem DOM
            // gefallen — Fokus geht sonst ins Leere, darum zurück ins Eingabefeld.
            codeInput.focus();
          });
        }
        karte.focus();
      };

      var sucheCode = function () {
        var code = (codeInput.value || '').trim().toUpperCase();
        if (!code) {
          zeigeFehler();
          return;
        }
        if (code === FESTCODE) {
          zeigeTreffer(code, FESTTERMIN);
          return;
        }
        if (buchungen[code]) {
          zeigeTreffer(code, buchungen[code]);
          return;
        }
        zeigeFehler();
      };

      suchenBtn.addEventListener('click', sucheCode);
      // Das Code-Feld liegt außerhalb des Planer-<form> — ohne eigenen
      // Handler löst Enter dort keine Suche aus.
      codeInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          sucheCode();
        }
      });
    }

    update();
  });
})();
