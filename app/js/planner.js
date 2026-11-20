// Vice Ledger — Next-up planner and session planner.
// Next-up orders the unearned trophies the way the roadmap plays them: story
// order first, then the strands, then the grind. A session plan fills a
// 60/90/120/180-minute block from that order without exceeding it.

import { isEarned } from "./store.js";

const CHAPTER_ORDER = { ch1: 0, ch2: 1, ch3: 2, ch4: 3, ch5: 4, strangers: 5, collect: 6, activities: 7, combat: 8, longroad: 9, platinum: 10 };

// The next trophies to chase, in roadmap order.
export function nextUp(trophies, state, count) {
  const rest = trophies.filter((t) => !isEarned(state, t.id));
  rest.sort((a, b) => {
    const ga = CHAPTER_ORDER[a.group] ?? 99;
    const gb = CHAPTER_ORDER[b.group] ?? 99;
    if (ga !== gb) return ga - gb;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    if (a.hours !== b.hours) return a.hours - b.hours;
    return a.id - b.id;
  });
  return rest.slice(0, count || 10);
}

// Fill a session of `minutes` from the next-up order. A trophy fits when its
// own estimate fits the time left; the platinum (0 h) never fills a session.
export function planSession(trophies, state, minutes) {
  const picked = [];
  let used = 0;
  for (const t of nextUp(trophies, state, 55)) {
    if (t.hours <= 0) continue;
    const need = t.hours * 60;
    if (used + need <= minutes) {
      picked.push(t);
      used += need;
    }
    if (used >= minutes) break;
  }
  return { picked, usedMinutes: used, minutes };
}

// Hours left on the platinum, by the ledger's own per-trophy model. The model
// is a planning figure: its parts overlap (checklist trophies share hours),
// and it sits between PowerPyx (~200 h) and Push Square (250+ h).
export function forecast(trophies, state) {
  const total = trophies.reduce((s, t) => s + (t.hours || 0), 0);
  const left = trophies
    .filter((t) => !isEarned(state, t.id))
    .reduce((s, t) => s + (t.hours || 0), 0);
  return { total, left };
}
