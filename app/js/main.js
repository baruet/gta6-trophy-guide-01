// main.js — boots the guide: loads the trophy list, wires the tabs, filters,
// search, spoiler setting and keyboard shortcuts, and renders every view.
// Screenshot helpers: ?seed=13 earns the first 13 trophies in roadmap order,
// ?view=roadmap|missables|planner|save opens a section, ?open=<id> opens one
// trophy's guide, ?spoilers=off turns spoiler-safe mode off. These only run
// in the browser, from the address bar, and change nothing on disk.
import { loadTrophies } from './data.js';
import { loadSave, persistSave, isEarned, markEarned } from './store.js';
import { renderProgress, showView, VIEW_IDS } from './views/shell.js';
import { renderChecklist } from './views/checklist.js';
import { renderDetail } from './views/detail.js';
import { renderRoadmap } from './views/roadmap.js';
import { renderMissables } from './views/missables.js';
import { renderPlanner } from './views/planner.js';
import { renderSavePage } from './views/save.js';

const params = new URLSearchParams(window.location.search);

let trophies = [];
let save = loadSave();
let selectedId = null;
const query = { kind: 'all', grade: 'all', search: '', sort: 'roadmap' };
let currentView = 'checklist';

function seedDemoProgress(count) {
  const ordered = trophies.slice().sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  save.earned = ordered.slice(0, count).map((t) => t.name);
  persistSave(save);
}

function applyScreenshotParams() {
  const seed = Number(params.get('seed'));
  if (Number.isInteger(seed) && seed > 0) seedDemoProgress(Math.min(seed, trophies.length));
  const spoilers = params.get('spoilers');
  if (spoilers === 'on' || spoilers === 'off') {
    save.settings.spoilers = spoilers === 'on';
    persistSave(save);
  }
  const open = Number(params.get('open'));
  if (Number.isInteger(open)) {
    const found = trophies.find((t) => t.id === open);
    if (found) selectedId = found.id;
  }
}

function renderAll() {
  renderProgress(trophies, save);
  renderChecklist(trophies, save, query, selectedId, {
    onSelect: (id) => { selectedId = id; renderAll(); },
    onToggle: (trophy, checked) => { markEarned(save, trophy, checked); renderAll(); },
  });
  const selected = trophies.find((t) => t.id === selectedId) || null;
  renderDetail(selected, trophies, save, () => renderAll());
  renderRoadmap(trophies, save, (id) => { selectedId = id; showView('checklist'); renderAll(); });
  renderMissables(trophies, save, (id) => { selectedId = id; showView('checklist'); renderAll(); });
  renderPlanner(trophies, save, (id) => { selectedId = id; showView('checklist'); renderAll(); });
  renderSavePage(trophies, save, (next) => { save = next; selectedId = null; renderAll(); });
  syncControls();
  showView(currentView);
}

function syncControls() {
  document.getElementById('spoilers').checked = save.settings.spoilers;
  document.getElementById('hide-earned').checked = save.settings.hideEarned;
  document.getElementById('search').value = query.search;
  document.getElementById('grade').value = query.grade;
  document.getElementById('sort').value = query.sort;
  for (const chip of document.querySelectorAll('.kind-chip')) {
    chip.classList.toggle('is-active', chip.dataset.kind === query.kind);
  }
}

function wireControls() {
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.addEventListener('click', () => { currentView = tab.dataset.view; renderAll(); });
  }
  for (const chip of document.querySelectorAll('.kind-chip')) {
    chip.addEventListener('click', () => { query.kind = chip.dataset.kind; renderAll(); });
  }
  document.getElementById('search').addEventListener('input', (e) => { query.search = e.target.value; renderAll(); });
  document.getElementById('grade').addEventListener('change', (e) => { query.grade = e.target.value; renderAll(); });
  document.getElementById('sort').addEventListener('change', (e) => { query.sort = e.target.value; renderAll(); });
  document.getElementById('hide-earned').addEventListener('change', (e) => {
    save.settings.hideEarned = e.target.checked;
    persistSave(save);
    renderAll();
  });
  document.getElementById('spoilers').addEventListener('change', (e) => {
    save.settings.spoilers = e.target.checked;
    persistSave(save);
    renderAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== document.getElementById('search')) {
      e.preventDefault();
      document.getElementById('search').focus();
    } else if (e.key === 'Escape') {
      selectedId = null;
      renderAll();
    } else if (/^[1-5]$/.test(e.key) && document.activeElement !== document.getElementById('search')) {
      currentView = VIEW_IDS[Number(e.key) - 1];
      renderAll();
    }
  });
}

async function boot() {
  try {
    trophies = await loadTrophies();
  } catch {
    document.getElementById('progress-text').textContent = 'The trophy list could not be loaded. Check that data/trophies.json is beside this page.';
    return;
  }
  applyScreenshotParams();
  const hashView = window.location.hash.replace('#/', '');
  if (VIEW_IDS.includes(hashView)) currentView = hashView;
  const viewParam = params.get('view');
  if (VIEW_IDS.includes(viewParam)) currentView = viewParam;
  wireControls();
  renderAll();
}

boot();
