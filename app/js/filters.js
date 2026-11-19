// filters.js — kind, grade, search and sort filtering, plus the spoiler rule:
// a story trophy whose name or description would spoil the story stays hidden
// until it is earned, while the spoiler setting is on.
import { gradeRank } from './data.js';
import { isEarned } from './store.js';

export function spoilerHidden(save, trophy) {
  if (!save.settings.spoilers) return false;
  if (isEarned(save, trophy)) return false;
  return (trophy.kinds || []).includes('story');
}

export function applyFilters(trophies, save, query) {
  const q = (query.search || '').trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (query.kind === 'missable' && !t.missable) return false;
    if (query.kind === 'online' && !(t.kinds || []).includes('online')) return false;
    if (query.kind !== 'all' && query.kind !== 'missable' && query.kind !== 'online' && !(t.kinds || []).includes(query.kind)) return false;
    if (query.grade !== 'all' && t.grade !== query.grade) return false;
    if (save.settings.hideEarned && isEarned(save, t)) return false;
    if (q) {
      const hay = (t.name + ' ' + (t.description || '') + ' ' + (t.guide || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (query.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  else if (query.sort === 'grade') list = list.slice().sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade) || a.name.localeCompare(b.name));
  else list = list.slice().sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return list;
}

export function countByKind(trophies) {
  const counts = { story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const t of trophies) {
    for (const k of t.kinds || []) if (k in counts) counts[k] += 1;
    if (t.missable) counts.missable += 1;
  }
  return counts;
}
