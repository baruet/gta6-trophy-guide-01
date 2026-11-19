// views/checklist.js — the trophy list: one row per trophy with its official
// name, description and grade, its earliest-chapter tag, its missable flag,
// and a checkbox that saves to localStorage.
import { earliestChapter } from '../data.js';
import { spoilerHidden, applyFilters } from '../filters.js';
import { isEarned, markEarned } from '../store.js';

function tag(text, className) {
  const span = document.createElement('span');
  span.className = 'tag ' + className;
  span.textContent = text;
  return span;
}

function trophyRow(trophy, save, selectedId, onSelect, onToggle) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'trophy-row';
  row.setAttribute('role', 'listitem');
  if (trophy.id === selectedId) row.classList.add('is-selected');
  const earned = isEarned(save, trophy);
  if (earned) row.classList.add('is-earned');
  row.addEventListener('click', (event) => {
    if (event.target.tagName === 'INPUT') return;
    onSelect(trophy.id);
  });

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => onToggle(trophy, box.checked));
  row.append(box);

  const dot = document.createElement('span');
  dot.className = 'grade-dot ' + trophy.grade;
  dot.title = trophy.grade;
  row.append(dot);

  const body = document.createElement('span');
  const hidden = spoilerHidden(save, trophy);
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  if (earned) {
    const mark = document.createElement('span');
    mark.className = 'earned-mark';
    mark.textContent = ' ✓';
    name.append(mark);
  }
  body.append(name);
  const desc = document.createElement('span');
  desc.className = 'trophy-desc';
  desc.style.display = 'block';
  desc.textContent = hidden ? 'Hidden until earned — spoiler-safe mode is on.' : (trophy.description || '');
  body.append(desc);
  const tags = document.createElement('span');
  tags.className = 'trophy-tags';
  tags.append(tag(trophy.grade, 'grade-' + trophy.grade));
  if (trophy.missable) tags.append(tag('Missable', 'missable'));
  tags.append(tag('Earliest: ' + earliestChapter(trophy), 'earliest'));
  for (const kind of trophy.kinds || []) tags.append(tag(kind, 'kind-' + kind));
  body.append(tags);
  row.append(body);

  const gradeLabel = document.createElement('span');
  gradeLabel.className = 'trophy-grade-label';
  gradeLabel.textContent = trophy.grade;
  row.append(gradeLabel);
  return row;
}

export function renderChecklist(trophies, save, query, selectedId, handlers) {
  const list = document.getElementById('trophy-list');
  const filtered = applyFilters(trophies, save, query);
  list.replaceChildren();
  const count = document.getElementById('result-count');
  if (query.kind === 'online') {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'The official list has no online trophies — all 55 are earned in single-player story or free roam, so this filter is empty by design.';
    list.append(empty);
  } else if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
    list.append(empty);
  } else {
    for (const t of filtered) list.append(trophyRow(t, save, selectedId, handlers.onSelect, handlers.onToggle));
  }
  count.textContent = filtered.length + ' of ' + trophies.length + ' trophies shown'
    + (query.kind === 'online' ? ' — the official list holds no online trophies.' : '.');
}
