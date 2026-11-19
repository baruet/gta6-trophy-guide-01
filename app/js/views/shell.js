// views/shell.js — the header progress block and the section tabs: which view
// is showing, and the earned count that every view reads from.
import { isEarned } from '../store.js';

export const VIEW_IDS = ['checklist', 'roadmap', 'missables', 'planner', 'save'];

export function renderProgress(trophies, save) {
  const earned = trophies.filter((t) => isEarned(save, t)).length;
  const total = trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const text = document.getElementById('progress-text');
  text.innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = earned + ' of ' + total + ' earned';
  text.append(strong, document.createTextNode(' · ' + pct + '% to the platinum'));
  const fill = document.getElementById('progress-fill');
  fill.style.width = pct + '%';
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(earned));
  bar.setAttribute('aria-valuemax', String(total));
  const note = document.getElementById('progress-note');
  const remaining = total - earned;
  note.textContent = remaining === 0
    ? 'Platinum earned — congratulations, Leonida Legend.'
    : remaining + ' to go. The roadmap below is the order to earn them in.';
}

export function showView(view) {
  for (const id of VIEW_IDS) {
    const section = document.getElementById('view-' + id);
    if (section) section.hidden = id !== view;
    const tab = document.getElementById('tab-' + id);
    if (tab) tab.classList.toggle('is-active', id === view);
  }
  if (window.location.hash !== '#/' + view) history.replaceState(null, '', '#/' + view);
}
