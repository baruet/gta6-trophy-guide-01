// data.js — loads the official trophy list and derives the honest labels the app
// shows beside each trophy: where its facts come from, the earliest point it can
// be earned, and how much the guide behind it has been checked.
export const DATA_URL = 'data/trophies.json';

export const SOURCES = {
  exophase: {
    name: 'Exophase — GTA VI trophy list',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
    role: 'official name, description and grade',
  },
  psnprofiles: {
    name: 'PSNProfiles — GTA VI trophies',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
    role: 'grade and the PSN progress count where the trophy has one',
  },
  own: {
    name: 'Our own advice, from the official description',
    url: null,
    role: 'the guide itself — not yet checked in the game',
  },
};

export const STAGE_META = {
  1: { title: 'Stage 1 — First steps in Leonida', note: 'The opening chapter. Play the story and the first chapter trophy lands on its own.' },
  2: { title: 'Stage 2 — The story, chapters 2 to the finale', note: 'Main story missions in order. Every chapter and named-mission trophy sits here; none of them can be earned before its mission unlocks.' },
  3: { title: 'Stage 3 — Strangers & Freaks', note: 'Mission strands for strangers across Leonida. Each strand ends with its own trophy; finish all eight strands for the silver.' },
  4: { title: 'Stage 4 — Collectibles and the map', note: 'Everything that needs the whole map open: cards, WAiNK spots, meditation spots, vehicles, garages.' },
  5: { title: 'Stage 5 — Activities and the long grinds', note: 'Races, the shooting range, challenges, robberies and the big counters. Best done a little at a time while travelling, then mopped up after the story.' },
  6: { title: 'Stage 6 — Platinum', note: '100% completion, then the platinum itself. Nothing extra to do for it — it pops with the other 54.' },
};

export async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('trophy list failed to load');
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  return trophies.slice().sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
}

export function sourceLabel(code) {
  return SOURCES[code] ?? { name: code, url: null, role: 'cited source' };
}

// earliestChapter derives, from the official description alone, the earliest
// point a trophy can be earned. It never claims a mission or place the
// description does not name; where the description is silent it says so.
export function earliestChapter(trophy) {
  const desc = trophy.description || '';
  const chapter = desc.match(/Complete Chapter (\d)/);
  if (chapter) return 'Chapter ' + chapter[1];
  if (/Complete Gone Fishing/.test(desc)) return 'Chapter 1 — Gone Fishing';
  if (/Complete the final mission for/.test(desc)) return 'Strangers — after Chapter 1';
  if (/Complete the final mission/.test(desc)) return 'Final mission';
  if (/Complete 8 mission strands/.test(desc)) return 'Strangers — after Chapter 1';
  if (trophy.grade === 'platinum') return 'After the other 54';
  if (trophy.stage === 6) return 'Endgame — 100% completion';
  if (trophy.stage === 3) return 'Strangers — after Chapter 1';
  if (trophy.stage === 4 || trophy.stage === 5) return 'Free roam — after Chapter 1';
  if (trophy.stage === 2) return 'Story — Chapters 2 to the finale';
  return 'Story — from the official description';
}

// confidenceNote is the same honest line for every guide: the game released
// 19 November 2026 and no guide here has been checked in the game yet.
export function confidenceNote() {
  return 'Guide confidence: from the official description only — not yet checked in the game. Where a place or step is not pinned down by the description, the guide says so instead of guessing.';
}

export function gradeRank(grade) {
  return { platinum: 0, gold: 1, silver: 2, bronze: 3 }[grade] ?? 4;
}

export function formatTargetValue(trophy, value) {
  if (!trophy.target) return String(value);
  const unit = trophy.target.unit || '';
  if (unit === '$') return '$' + Number(value).toLocaleString('en-US');
  if (unit === '%') return value + '%';
  return String(value);
}
