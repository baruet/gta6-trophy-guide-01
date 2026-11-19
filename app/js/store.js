// store.js — the save file: earned trophies, per-trophy counters, notes and
// settings, kept in localStorage under one key and exportable to a file.
export const SAVE_KEY = 'sunset-platinum-save-v1';

export function blankSave() {
  return { earned: [], counters: {}, notes: {}, settings: { spoilers: true, hideEarned: false } };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return blankSave();
    const parsed = JSON.parse(raw);
    const save = blankSave();
    if (Array.isArray(parsed.earned)) save.earned = parsed.earned.filter((n) => typeof n === 'string');
    if (parsed.counters && typeof parsed.counters === 'object') save.counters = parsed.counters;
    if (parsed.notes && typeof parsed.notes === 'object') save.notes = parsed.notes;
    if (parsed.settings && typeof parsed.settings === 'object') save.settings = { ...save.settings, ...parsed.settings };
    return save;
  } catch {
    return blankSave();
  }
}

export function persistSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function isEarned(save, trophy) {
  return save.earned.includes(trophy.name);
}

export function markEarned(save, trophy, earned) {
  const has = save.earned.includes(trophy.name);
  if (earned && !has) save.earned.push(trophy.name);
  if (!earned && has) save.earned = save.earned.filter((n) => n !== trophy.name);
  persistSave(save);
}

export function setCounter(save, trophy, value) {
  const total = trophy.target ? trophy.target.total : 0;
  const clamped = Math.max(0, Math.min(total, Math.floor(value) || 0));
  save.counters[trophy.name] = clamped;
  persistSave(save);
  return clamped;
}

export function getCounter(save, trophy) {
  const value = save.counters[trophy.name];
  return typeof value === 'number' ? value : 0;
}

export function setNote(save, trophy, text) {
  const trimmed = text.trim();
  if (trimmed) save.notes[trophy.name] = trimmed;
  else delete save.notes[trophy.name];
  persistSave(save);
}

export function exportSave(save) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sunset-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importSaveFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const save = blankSave();
  if (Array.isArray(parsed.earned)) save.earned = parsed.earned.filter((n) => typeof n === 'string');
  if (parsed.counters && typeof parsed.counters === 'object') save.counters = parsed.counters;
  if (parsed.notes && typeof parsed.notes === 'object') save.notes = parsed.notes;
  if (parsed.settings && typeof parsed.settings === 'object') save.settings = { ...save.settings, ...parsed.settings };
  persistSave(save);
  return save;
}
