(() => {
  'use strict';
  const stage = document.querySelector('[data-stage]');
  if (!stage) return;
  const power = stage.querySelector('[data-stage-power]');
  const label = stage.querySelector('[data-stage-power-label]');
  const status = stage.querySelector('[data-stage-state]');
  const occasion = stage.querySelector('#check-anlass');
  const choices = [...stage.querySelectorAll('[data-stage-choice]')];
  const moods = {
    hochzeit: { occasion: 'hochzeit', text: 'Warmes Licht. Ihr erster Tanz.' },
    gala: { occasion: 'gala', text: 'Goldenes Licht für einen besonderen Abend.' },
    party: { occasion: 'party', text: 'Farbe auf der Bühne. Bewegung auf der Tanzfläche.' },
  };
  let on = false;
  let mood = 'hochzeit';
  const render = () => {
    stage.classList.toggle('is-lit', on);
    stage.dataset.stageMood = mood;
    power.setAttribute('aria-pressed', String(on));
    label.textContent = on ? 'Licht aus' : 'Licht an';
    status.textContent = on ? moods[mood].text : 'Die Bühne gehört Ihnen.';
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stageChoice === mood)));
  };
  power.addEventListener('click', () => { on = !on; render(); });
  choices.forEach(button => button.addEventListener('click', () => {
    mood = button.dataset.stageChoice;
    on = true;
    occasion.value = moods[mood].occasion;
    render();
  }));
  occasion.addEventListener('change', () => {
    if (occasion.value === 'hochzeit' || occasion.value === 'gala') mood = occasion.value;
    else if (occasion.value) mood = 'party';
    render();
  });
  // Match the visible initial wedding mood to the submitted occasion.
  if (!occasion.value) occasion.value = moods[mood].occasion;
  render();
})();
