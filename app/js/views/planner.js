// views/planner.js — "Next up": the next trophies to chase, in roadmap order,
// with the earliest point each can be earned and why it comes next.
import { earliestChapter } from '../data.js';
import { isEarned } from '../store.js';

function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function nextReason(trophy) {
  if (trophy.missable) return 'Missable — earn it before its moment passes.';
  if (trophy.stage === 1) return 'Opening chapter — it comes to you by playing the story.';
  if (trophy.stage === 2) return 'Next story mission in order — keep playing the story.';
  if (trophy.stage === 3) return 'Stranger strand — pick it up between story missions.';
  if (trophy.stage === 4) return 'Collectible — grab it while you are out exploring.';
  if (trophy.stage === 5) return 'Activity or counter — chip at it while travelling, finish it after the story.';
  return 'Endgame — it pops once everything else is done.';
}

export function renderPlanner(trophies, save, onSelect) {
  const section = document.getElementById('view-planner');
  section.replaceChildren();
  section.append(el('h2', null, 'Next up'));
  const intro = el('p', 'view-intro');
  intro.append(
    document.createTextNode('Your next eight trophies, in roadmap order — '),
    el('strong', null, 'missables first, then the story, then whatever is closest.'),
    document.createTextNode(' Tick one off in the checklist and the plan moves on to the next.'),
  );
  section.append(intro);
  const remaining = trophies.filter((t) => !isEarned(save, t));
  const next = remaining.slice(0, 8);
  if (!next.length) {
    section.append(el('p', 'view-intro', 'Nothing left — every trophy is earned. Platinum complete.'));
    return;
  }
  next.forEach((t, i) => {
    const card = el('div', 'plan-card');
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => onSelect(t.id));
    card.append(el('h3', null, (i + 1) + '. ' + t.name));
    card.append(el('p', 'why', nextReason(t) + ' Earliest: ' + earliestChapter(t) + ' · ' + t.grade + (t.missable ? ' · missable' : '') + '.'));
    card.append(el('p', 'guide-text', t.guide || ''));
    section.append(card);
  });
  const done = trophies.length - remaining.length;
  section.append(el('p', 'view-intro', done + ' of ' + trophies.length + ' earned — ' + remaining.length + ' left after these eight.'));
}
