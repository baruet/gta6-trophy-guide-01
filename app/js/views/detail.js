// views/detail.js — the guide pane for one trophy: official name, description
// and grade, the guide in our own words, its cited sources beside it, the
// confidence note, the PSN target counter and a personal note.
import { earliestChapter, confidenceNote, sourceLabel, formatTargetValue } from '../data.js';
import { spoilerHidden } from '../filters.js';
import { isEarned, markEarned, getCounter, setCounter, setNote } from '../store.js';

function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderDetail(trophy, trophies, save, onEarnedChange) {
  const pane = document.getElementById('detail-pane');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('h2', null, 'Pick a trophy'));
    pane.append(el('p', 'guide-text', 'Select any trophy in the checklist to read its guide, its sources and the earliest point it can be earned.'));
    return;
  }
  const hidden = spoilerHidden(save, trophy);
  pane.append(el('p', 'grade-line', trophy.grade + ' trophy · ' + (trophy.missable ? 'missable · ' : '') + 'earliest: ' + earliestChapter(trophy)));
  pane.append(el('h2', null, hidden ? 'Hidden story trophy' : trophy.name));
  const official = el('p', 'official');
  const officialLabel = el('strong', null, 'Official description: ');
  official.append(officialLabel, document.createTextNode(hidden ? 'Hidden until earned — spoiler-safe mode is on.' : (trophy.description || '')));
  pane.append(official);

  if (hidden) {
    pane.append(el('p', 'guide-text', 'The guide is hidden too — earn this trophy (or turn spoiler-safe mode off) to read it.'));
  } else {
    pane.append(el('p', 'guide-text', trophy.guide || ''));
    const sources = el('p', 'sources');
    sources.append(el('strong', null, 'Sources: '));
    const parts = (trophy.sources || ['exophase', 'psnprofiles', 'own']).map((code) => sourceLabel(code));
    parts.forEach((source, i) => {
      if (i > 0) sources.append(document.createTextNode(' · '));
      if (source.url) {
        const a = document.createElement('a');
        a.href = source.url;
        a.textContent = source.name + ' (' + source.role + ')';
        sources.append(a);
      } else {
        sources.append(document.createTextNode(source.name + ' (' + source.role + ')'));
      }
    });
    pane.append(sources);
    pane.append(el('p', 'confidence', confidenceNote()));
  }

  if (trophy.target) {
    const box = el('div', 'counter-box');
    const label = el('p', null, 'PSN target — ' + trophy.target.label + ': ' + formatTargetValue(trophy, getCounter(save, trophy)) + ' of ' + formatTargetValue(trophy, trophy.target.total));
    box.append(label);
    const row = el('div', 'counter-row');
    const minus = el('button', null, '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Decrease ' + trophy.target.label);
    const value = el('span', 'counter-value', formatTargetValue(trophy, getCounter(save, trophy)) + ' / ' + formatTargetValue(trophy, trophy.target.total));
    const plus = el('button', null, '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'Increase ' + trophy.target.label);
    const bar = el('div', 'counter-bar');
    const barFill = el('span');
    barFill.style.width = Math.round((getCounter(save, trophy) / trophy.target.total) * 100) + '%';
    bar.append(barFill);
    const refresh = (next) => {
      const v = setCounter(save, trophy, next);
      value.textContent = formatTargetValue(trophy, v) + ' / ' + formatTargetValue(trophy, trophy.target.total);
      label.textContent = 'PSN target — ' + trophy.target.label + ': ' + formatTargetValue(trophy, v) + ' of ' + formatTargetValue(trophy, trophy.target.total);
      barFill.style.width = Math.round((v / trophy.target.total) * 100) + '%';
    };
    minus.addEventListener('click', () => refresh(getCounter(save, trophy) - 1));
    plus.addEventListener('click', () => refresh(getCounter(save, trophy) + 1));
    row.append(minus, value, plus);
    box.append(row, bar);
    pane.append(box);
  }

  const noteBox = el('div', 'note-box');
  const noteLabel = el('label', null, 'Your note');
  noteLabel.setAttribute('for', 'note-' + trophy.id);
  const noteArea = document.createElement('textarea');
  noteArea.id = 'note-' + trophy.id;
  noteArea.placeholder = 'Where you found it, what worked, what to try next…';
  noteArea.value = save.notes[trophy.name] || '';
  noteArea.addEventListener('change', () => setNote(save, trophy, noteArea.value));
  noteBox.append(noteLabel, noteArea);
  pane.append(noteBox);

  const actions = el('div', 'detail-actions');
  const toggle = el('button', 'btn primary', isEarned(save, trophy) ? '✓ Earned — tap to unmark' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    markEarned(save, trophy, !isEarned(save, trophy));
    onEarnedChange();
  });
  actions.append(toggle);
  pane.append(actions);
}
