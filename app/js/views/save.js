// views/save.js — the save page: export and import the progress file, reset,
// the spoiler setting, your notes, and the keyboard shortcuts.
import { exportSave, importSaveFile, blankSave, persistSave } from '../store.js';
import { countByKind } from '../filters.js';

function el(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderSavePage(trophies, save, onSaveChange) {
  const section = document.getElementById('view-save');
  section.replaceChildren();
  section.append(el('h2', null, 'Save & settings'));
  const grid = el('div', 'save-grid');

  const progressCard = el('div', 'save-card');
  progressCard.append(el('h3', null, 'Your progress file'));
  const earned = save.earned.length;
  progressCard.append(el('p', null, earned + ' of ' + trophies.length + ' trophies earned. Your progress lives in this browser (localStorage) and can be exported to a file and imported back on any device.'));
  const row = el('div', 'row');
  const exportBtn = el('button', 'btn primary', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => exportSave(save));
  const importLabel = el('label', 'btn', 'Import progress');
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json';
  importInput.className = 'file-input';
  importInput.style.display = 'none';
  importInput.addEventListener('change', async () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    try {
      const next = await importSaveFile(file);
      onSaveChange(next);
    } catch {
      alert('That file could not be read as a progress file.');
    }
  });
  importLabel.append(importInput);
  row.append(exportBtn, importLabel);
  progressCard.append(row);
  const resetBtn = el('button', 'btn', 'Reset all progress');
  resetBtn.type = 'button';
  resetBtn.style.marginTop = '10px';
  resetBtn.addEventListener('click', () => {
    if (confirm('Clear every earned trophy, counter and note?')) {
      const fresh = blankSave();
      fresh.settings = { ...save.settings };
      persistSave(fresh);
      onSaveChange(fresh);
    }
  });
  progressCard.append(resetBtn);
  grid.append(progressCard);

  const settingsCard = el('div', 'save-card');
  settingsCard.append(el('h3', null, 'Spoiler setting'));
  settingsCard.append(el('p', null, 'Spoiler-safe mode hides the names and descriptions of story trophies — and their guides — until they are earned. It is on by default.'));
  const spoilerLabel = el('label', 'check-label');
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = save.settings.spoilers;
  spoilerBox.addEventListener('change', () => {
    save.settings.spoilers = spoilerBox.checked;
    persistSave(save);
    onSaveChange(save);
  });
  spoilerLabel.append(spoilerBox, document.createTextNode(' Spoiler-safe mode'));
  settingsCard.append(spoilerLabel);
  grid.append(settingsCard);

  const counts = countByKind(trophies);
  const dataCard = el('div', 'save-card');
  dataCard.append(el('h3', null, 'The list at a glance'));
  dataCard.append(el('p', null, 'Story ' + counts.story + ' · Missable ' + counts.missable + ' · Collectibles ' + counts.collectibles + ' · Activities ' + counts.activities + ' · Online 0 — the official list holds no online trophies. ' + trophies.filter((t) => t.target).length + ' trophies have a PSN progress count you can track with the counter in each guide.'));
  grid.append(dataCard);

  const keysCard = el('div', 'save-card');
  keysCard.append(el('h3', null, 'Keyboard shortcuts'));
  const keys = el('ul', 'keys-list');
  const shortcuts = [
    ['/', 'focus the search box'],
    ['1 – 5', 'switch section: Checklist, Roadmap, Missables, Next up, Save'],
    ['Esc', 'close the guide pane selection'],
  ];
  for (const [key, what] of shortcuts) {
    const li = document.createElement('li');
    const kbd = document.createElement('kbd');
    kbd.textContent = key;
    li.append(kbd, document.createTextNode(' — ' + what));
    keys.append(li);
  }
  keysCard.append(keys);
  grid.append(keysCard);

  const notesCard = el('div', 'save-card');
  notesCard.append(el('h3', null, 'Your notes'));
  const noteNames = Object.keys(save.notes);
  if (!noteNames.length) {
    notesCard.append(el('p', null, 'No notes yet. Open any trophy and write one in its guide pane.'));
  } else {
    const list = el('ul', 'notes-list');
    for (const name of noteNames) {
      const li = document.createElement('li');
      li.append(el('span', 'n-name', name + ': '));
      li.append(el('span', 'n-text', save.notes[name]));
      list.append(li);
    }
    notesCard.append(list);
  }
  grid.append(notesCard);

  section.append(grid);
}
