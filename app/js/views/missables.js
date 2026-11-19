// views/missables.js — every missable trophy on one page: what it is, when it
// can be missed, and the earliest point it can be earned, built from the
// official descriptions.
import { earliestChapter } from '../data.js';
import { isEarned } from '../store.js';
import { spoilerHidden } from '../filters.js';

function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderMissables(trophies, save, onSelect) {
  const section = document.getElementById('view-missables');
  section.replaceChildren();
  const missable = trophies.filter((t) => t.missable);
  section.append(el('h2', null, 'Missable trophies — ' + missable.length + ' of 55'));
  const intro = el('p', 'view-intro');
  intro.append(
    document.createTextNode('A missable trophy is one tied to a story mission or a one-time choice: '),
    el('strong', null, 'once its moment passes, that playthrough cannot earn it.'),
    document.createTextNode(' The flags below come from the official descriptions — a trophy that names a chapter, a named mission or a choice is flagged, and the guide for each says when its moment is. Story trophies stay hidden here while spoiler-safe mode is on and they are not earned yet.'),
  );
  section.append(intro);
  for (const t of missable) {
    const hidden = spoilerHidden(save, t);
    const card = el('div', 'missable-card');
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onSelect(t.id));
    const title = el('h3', null, (hidden ? 'Hidden story trophy' : t.name) + (isEarned(save, t) ? ' ✓' : ''));
    card.append(title);
    card.append(el('p', 'why', 'Earliest: ' + earliestChapter(t) + ' · ' + t.grade + ' trophy · ' + (hidden ? 'Hidden until earned.' : (t.description || ''))));
    if (!hidden) card.append(el('p', 'guide-text', t.guide || ''));
    section.append(card);
  }
}
