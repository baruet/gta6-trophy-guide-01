// views/roadmap.js — the road to the platinum: six stages in the order to
// earn them, each with its trophies, its progress, and the earliest chapter
// each trophy can be earned, all built from the official descriptions.
import { STAGE_META, earliestChapter } from '../data.js';
import { isEarned } from '../store.js';

function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(trophies, save, onSelect) {
  const section = document.getElementById('view-roadmap');
  section.replaceChildren();
  section.append(el('h2', null, 'Roadmap to the platinum'));
  const intro = el('p', 'view-intro');
  intro.innerHTML = '';
  intro.append(
    document.createTextNode('Play the story first, then the strangers, then collectibles and activities, and mop up the counters last. The order below comes from the official descriptions: '),
    el('strong', null, 'which chapter or mission each trophy names, and which counts PSN tracks.'),
    document.createTextNode(' Nothing here is guessed from a playthrough — the game released 19 November 2026, so every step is built from the list itself.'),
  );
  section.append(intro);
  const stages = [1, 2, 3, 4, 5, 6];
  for (const stage of stages) {
    const stageTrophies = trophies.filter((t) => t.stage === stage);
    if (!stageTrophies.length) continue;
    const earned = stageTrophies.filter((t) => isEarned(save, t)).length;
    const meta = STAGE_META[stage] || { title: 'Stage ' + stage, note: '' };
    const box = el('div', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h3', null, meta.title));
    head.append(el('span', 'stage-count', earned + ' of ' + stageTrophies.length + ' earned'));
    box.append(head);
    box.append(el('p', null, meta.note));
    const list = el('ul', 'stage-list');
    for (const t of stageTrophies) {
      const li = document.createElement('li');
      const mark = el('span', isEarned(save, t) ? 'done' : 'todo', isEarned(save, t) ? '✓' : '○');
      const name = el('span', 't-name', t.name);
      const why = el('span', 't-why', ' — ' + earliestChapter(t) + (t.missable ? ' · missable' : ''));
      li.append(mark, name, why);
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => onSelect(t.id));
      list.append(li);
    }
    box.append(list);
    section.append(box);
  }
}
