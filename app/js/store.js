// Vice Ledger — saved progress. Everything lives in localStorage under one
// key and never leaves the browser unless the player exports it.

export const STORAGE_KEY = "vice-ledger-v3";
export const SEED_IDS_KEY = "vice-ledger-v3-seeded";

export function blankState() {
  return {
    version: 3,
    earned: [],
    progress: {},
    notes: {},
    spoiler: false,
    updatedAt: new Date().toISOString(),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return blankState();
    return {
      version: 3,
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      notes: parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
      spoiler: parsed.spoiler === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch (err) {
    return blankState();
  }
}

export function saveState(state) {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at >= 0) state.earned.splice(at, 1);
  else state.earned.push(id);
  saveState(state);
  return state;
}

export function setProgress(state, id, value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  if (n === 0) delete state.progress[id];
  else state.progress[id] = n;
  saveState(state);
  return state;
}

export function setNote(state, id, text) {
  const t = String(text || "").slice(0, 500);
  if (t === "") delete state.notes[id];
  else state.notes[id] = t;
  saveState(state);
  return state;
}

export function exportText(state) {
  return JSON.stringify(state, null, 2);
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") throw new Error("not an object");
  const state = blankState();
  if (Array.isArray(parsed.earned)) state.earned = parsed.earned.filter((n) => Number.isInteger(n));
  if (parsed.progress && typeof parsed.progress === "object") state.progress = parsed.progress;
  if (parsed.notes && typeof parsed.notes === "object") state.notes = parsed.notes;
  if (parsed.spoiler === true) state.spoiler = true;
  return state;
}

export function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
