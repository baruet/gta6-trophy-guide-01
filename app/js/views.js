// Vice Ledger — the views: checklist, chapters, roadmap, missables, planner,
// save. Every view is a function of (trophies, state) returning HTML; main.js
// owns the state and re-renders on change.

import { SOURCES, GROUPS, GROUP_TITLE, ROADMAP, gradeLabel, formatHours } from "./data.js";
import { isEarned } from "./store.js";
import { nextUp, planSession, forecast } from "./planner.js";

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id) || null;
}

// The spoiler rule: a story trophy the player has not earned shows no name
// and no description while spoilers are on.
export function isSpoiled(state, t) {
  return state.spoiler && t.kind === "story" && !isEarned(state, t.id);
}

export function displayName(state, t) {
  if (isSpoiled(state, t)) return "Hidden story trophy";
  return t.name;
}

export function displayDesc(state, t) {
  if (isSpoiled(state, t)) return "Earn it to reveal its name and description.";
  return t.description;
}

export function kindTag(t) {
  return '<span class="tag ' + t.kind + '">' + t.kind + "</span>";
}

export function medalHtml(t) {
  return '<span class="medal ' + t.grade + '">' + gradeLabel(t.grade) + "</span>";
}

export function targetLine(state, t) {
  if (t.target == null) return "";
  const have = state.progress[t.id] || 0;
  const label = t.targetLabel || "progress";
  if (t.target >= 1000) {
    return '<div class="t-target">PSN target: $' + t.target.toLocaleString("en-US") + " " + escapeHtml(label) + "</div>";
  }
  return '<div class="t-target">PSN target: ' + have + " / " + t.target + " " + escapeHtml(label) + "</div>";
}

function gradeCounts(trophies, state) {
  const out = {};
  for (const t of trophies) {
    if (!isEarned(state, t.id)) continue;
    out[t.grade] = (out[t.grade] || 0) + 1;
  }
  return out;
}

export function headerStats(trophies, state) {
  const earned = state.earned.length;
  const counts = gradeCounts(trophies, state);
  const parts = ["platinum", "gold", "silver", "bronze"].map(
    (g) => "<b>" + (counts[g] || 0) + "</b> " + g
  );
  const f = forecast(trophies, state);
  return { earned, gradeLine: "Earned: " + parts.join(" &middot; "), forecast: f };
}

// ---------------------------------------------------------------- checklist

export function renderChecklist(trophies, state, ui) {
  const q = (ui.q || "").trim().toLowerCase();
  const kind = ui.kind || "all";
  const grade = ui.grade || "all";
  const sort = ui.sort || "roadmap";
  const order = { ch1: 0, ch2: 1, ch3: 2, ch4: 3, ch5: 4, strangers: 5, collect: 6, activities: 7, combat: 8, longroad: 9, platinum: 10 };

  let list = trophies.filter((t) => {
    if (kind === "online") return false;
    if (kind !== "all" && t.kind !== kind) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (sort === "name") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "grade") {
    const rank = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
    list = list.slice().sort((a, b) => rank[a.grade] - rank[b.grade] || a.id - b.id);
  } else if (sort === "id") list = list.slice().sort((a, b) => a.id - b.id);
  else list = list.slice().sort((a, b) => (order[a.group] ?? 99) - (order[b.group] ?? 99) || a.id - b.id);

  const kinds = [["all", "All"], ["story", "Story"], ["missable", "Missable"], ["collectibles", "Collectibles"], ["activities", "Activities"], ["online", "Online"], ["platinum", "Platinum"]];
  const chips = kinds.map(([v, label]) =>
    '<button type="button" class="chip' + (kind === v ? " active" : "") + '" data-action="kind" data-value="' + v + '">' + label + "</button>"
  ).join("");

  let body = "";
  if (kind === "online") {
    body = '<p class="empty">No online trophies. All 55 are single-player (PowerPyx) — this filter is here so you can check that for yourself.</p>';
  } else if (list.length === 0) {
    body = '<p class="empty">Nothing matches those filters. Clear the search or pick another kind.</p>';
  } else {
    body = '<ul class="trophy-list">' + list.map((t) => {
      const earned = isEarned(state, t.id);
      const spoiled = isSpoiled(state, t);
      return '<li class="trophy-row' + (earned ? " earned" : "") + (ui.selected === t.id ? " selected" : "") + '" data-action="select" data-id="' + t.id + '">' +
        '<input type="checkbox" data-action="toggle" data-id="' + t.id + '"' + (earned ? " checked" : "") + ' aria-label="Mark ' + escapeHtml(t.name) + ' earned">' +
        '<div><div class="t-name' + (spoiled ? " spoiler-hidden" : "") + '">' + escapeHtml(displayName(state, t)) + "</div>" +
        '<div class="t-desc">' + escapeHtml(displayDesc(state, t)) + "</div>" +
        '<div class="t-meta">' + kindTag(t) + medalHtml(t) +
        (t.hidden ? ' <span class="tag">hidden</span>' : "") +
        (t.verified === "guide" ? ' <span class="tag">guide-backed</span>' : ' <span class="tag">description-only</span>') +
        "</div>" + targetLine(state, t) + "</div>" +
        '<div class="t-side">' + medalHtml(t) + "<br>" +
        '<span class="small muted">' + escapeHtml(GROUP_TITLE[t.group] || t.group) + "</span>" +
        (t.chapter ? "<br><span class=\"small muted\">Ch. " + t.chapter + "</span>" : "") +
        "</div></li>";
    }).join("") + "</ul>";
  }

  const selected = trophyById(trophies, ui.selected) || list[0] || null;
  return '<h2>Checklist</h2>' +
    '<p class="lede">Every trophy, its official name, description and grade, with a guide that cites its sources. Tick a trophy when you earn it — progress saves in your browser. ' + state.earned.length + ' of 55 earned.</p>' +
    '<div class="check-layout"><div>' +
    '<div class="toolbar"><input type="search" id="searchBox" placeholder="Search trophies, descriptions, guides…  ( / )" value="' + escapeHtml(ui.q || "") + '" aria-label="Search trophies">' +
    '<select id="gradeFilter" aria-label="Filter by grade">' +
    [["all", "All grades"], ["platinum", "Platinum"], ["gold", "Gold"], ["silver", "Silver"], ["bronze", "Bronze"]].map(([v, l]) => '<option value="' + v + '"' + (grade === v ? " selected" : "") + ">" + l + "</option>").join("") +
    "</select>" +
    '<select id="sortFilter" aria-label="Sort trophies">' +
    [["roadmap", "Sort: roadmap order"], ["id", "Sort: list order"], ["grade", "Sort: grade"], ["name", "Sort: name"]].map(([v, l]) => '<option value="' + v + '"' + (sort === v ? " selected" : "") + ">" + l + "</option>").join("") +
    "</select></div>" +
    '<div class="chips">' + chips + "</div>" +
    '<div style="height:12px"></div>' + body +
    "</div>" +
    '<div class="detail">' + (selected ? renderDetail(trophies, state, selected) : "") + "</div>" +
    "</div>";
}

// -------------------------------------------------------------------- detail

export function renderDetail(trophies, state, t) {
  const earned = isEarned(state, t.id);
  const spoiled = isSpoiled(state, t);
  const sources = (t.sources || []).map((code) => {
    const s = SOURCES[code];
    if (!s) return "";
    return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + "</a></li>";
  }).join("");
  const verified = t.verified === "guide"
    ? '<span class="verdict guide">Guide-backed</span> <span class="small muted">the method below follows a named external guide</span>'
    : '<span class="verdict description">From the official description only</span> <span class="small muted">our own advice from the description — not yet checked in-game</span>';
  const note = state.notes[t.id] || "";
  const counter = t.target != null
    ? '<div class="counter-row"><label for="counterInput">Your count:</label>' +
      '<span class="stepper"><button type="button" class="btn" data-action="count-down" data-id="' + t.id + '" aria-label="Decrease count">&minus;</button>' +
      '<button type="button" class="btn" data-action="count-up" data-id="' + t.id + '" aria-label="Increase count">+</button></span>' +
      '<input type="number" id="counterInput" min="0" max="' + t.target + '" value="' + (state.progress[t.id] || 0) + '" data-action="count-set" data-id="' + t.id + '">' +
      '<span class="small muted">of ' + (t.target >= 1000 ? "$" + t.target.toLocaleString("en-US") : t.target) + " " + escapeHtml(t.targetLabel || "progress") + "</span></div>"
    : "";
  return '<div class="card">' +
    '<div>' + kindTag(t) + medalHtml(t) + (t.hidden ? ' <span class="tag">hidden on PSN</span>' : "") + "</div>" +
    '<h2>' + escapeHtml(displayName(state, t)) + "</h2>" +
    '<div class="official"><p class="small"><strong>Official description:</strong> ' + escapeHtml(displayDesc(state, t)) + "</p></div>" +
    (spoiled ? "" : '<p class="guide-text">' + escapeHtml(t.guide) + "</p>") +
    '<p>' + verified + "</p>" +
    '<p class="small muted">Earliest chapter: ' + (t.chapter ? "Chapter " + t.chapter : "any time / after the story") +
    " &middot; Chapter group: " + escapeHtml(GROUP_TITLE[t.group] || t.group) +
    " &middot; Planning estimate: " + formatHours(t.hours) + "</p>" +
    '<div class="sources"><h4>Sources</h4><ul>' + sources + "</ul>" +
    '<p class="small muted">Guides are written in our own words for this ledger. A source is cited, never copied; the official name and description are shown as PlayStation publishes them.</p></div>' +
    counter +
    '<p><button type="button" class="btn" data-action="toggle" data-id="' + t.id + '">' + (earned ? "Mark as not earned" : "Mark as earned") + "</button></p>" +
    '<div><label class="small muted" for="noteBox">Your note (saved in this browser):</label>' +
    '<textarea id="noteBox" class="note-box" data-action="note" data-id="' + t.id + '" maxlength="500" placeholder="e.g. best spot, loadout, what worked…">' + escapeHtml(note) + "</textarea></div>" +
    "</div>";
}

// ------------------------------------------------------------------ chapters

export function renderChapters(trophies, state) {
  const cards = GROUPS.map((g) => {
    const members = trophies.filter((t) => t.group === g.id);
    if (members.length === 0) return "";
    const done = members.filter((t) => isEarned(state, t.id)).length;
    const pct = Math.round((done / members.length) * 100);
    const rows = members.map((t) => {
      const earned = isEarned(state, t.id);
      return '<li class="' + (earned ? "done" : "") + '">' + (earned ? "✓ " : "○ ") + escapeHtml(displayName(state, t)) +
        ' <span class="muted">· ' + gradeLabel(t.grade) + "</span></li>";
    }).join("");
    return '<div class="chapter-card"><h3>' + escapeHtml(g.title) + "</h3>" +
      '<p class="count-line">' + done + " / " + members.length + " earned · " + pct + "%</p>" +
      '<div class="mini-bar"><div class="mini-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="small muted">' + escapeHtml(g.note) + "</p><ul>" + rows + "</ul></div>";
  }).join("");
  const plat = trophyById(trophies, 1);
  const platLine = plat && isEarned(state, 1)
    ? "<p><strong>Vice Got a Price!</strong> — earned. You are a Leonida Legend.</p>"
    : "<p><strong>Vice Got a Price!</strong> — the platinum sits above the chapters: it pops when the other 54 are earned.</p>";
  return '<h2>Chapters</h2>' +
    '<p class="lede">Ten groups, in the order the roadmap plays them — five story chapters, then the strands, the collectibles, the activities, the robberies and the long clean-up. Each group carries its own progress bar.</p>' +
    '<div class="card">' + platLine + "</div>" +
    '<div class="chapter-grid">' + cards + "</div>";
}

// ------------------------------------------------------------------ roadmap

export function renderRoadmap(trophies, state) {
  const stepTrophies = [
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 22, 23, 24, 26, 27, 28, 29, 33, 34, 39, 52],
    [14, 15, 17, 18, 30, 31, 32, 35, 40, 42, 43, 54, 55],
    [16, 19, 21, 25, 36, 37, 38, 41, 44, 45, 46, 47, 48, 49, 50, 51, 53],
  ];
  const steps = ROADMAP.map((s, i) => {
    const ids = stepTrophies[i] || [];
    const members = ids.map((id) => trophyById(trophies, id)).filter(Boolean);
    const done = members.filter((t) => isEarned(state, t.id)).length;
    const items = members.map((t) =>
      '<li class="' + (isEarned(state, t.id) ? "done" : "") + '">' + (isEarned(state, t.id) ? "✓ " : "○ ") +
      escapeHtml(displayName(state, t)) + ' <span class="muted">· ' + gradeLabel(t.grade) + "</span></li>"
    ).join("");
    return '<div class="card step"><h3>Step ' + s.step + " — " + escapeHtml(s.title) + '</h3>' +
      '<p><span class="step-time">' + escapeHtml(s.time) + "</span> &middot; " + done + " / " + members.length + " of this step's trophies earned</p>" +
      s.points.map((p) => "<p>" + escapeHtml(p) + "</p>").join("") +
      '<ul class="road-list">' + items + "</ul></div>";
  }).join("");
  return '<h2>Roadmap to the platinum</h2>' +
    '<p class="lede">Three steps, built from the official descriptions and the cited guides. PowerPyx puts the platinum at about 200 hours and difficulty 4/10; Push Square says 250+ hours. One playthrough is enough, there is no mission replay, and free roam continues after the story.</p>' +
    steps +
    '<div class="card"><h3>Save advice</h3>' +
    "<p>The game has 15 manual save slots plus 1 autosave. Because missions cannot be replayed, keep a save at the start and end of each chapter, then rotate the rest during free roam (PowerPyx, via SixShore).</p>" +
    "<p><strong>Cheats disable trophies</strong> — and stop the game from saving. Keep them off the file you use for the platinum run (PowerPyx, Push Square).</p>" +
    "<p>There are no difficulty settings, so difficulty cannot block a trophy. Push Square notes you can turn on the Accessible Combat and Reduced Vehicle Damage options.</p></div>";
}

// ---------------------------------------------------------------- missables

export function renderMissables(trophies, state) {
  const pma = trophyById(trophies, 28);
  const watch = [22, 23, 24, 26, 27].map((id) => trophyById(trophies, id)).filter(Boolean);
  const watchRows = watch.map((t) =>
    '<li>' + (isEarned(state, t.id) ? "✓ " : "○ ") + "<strong>" + escapeHtml(displayName(state, t)) + "</strong> — " +
    escapeHtml(t.description) + ' <span class="muted">(start the strand when it unlocks; the giver may go quiet mid-story and return later)</span></li>'
  ).join("");
  return '<h2>Missables</h2>' +
    '<p class="lede">Only one trophy is reported as possibly missable — and even that one is unconfirmed. Everything else can be finished in free roam after the story.</p>' +
    '<div class="card step"><h3>Possibly missable: Positive Mental Attitude</h3>' +
    "<p><strong>The flag:</strong> PowerPyx flags this trophy, and only as a maybe. Push Square lists no known missables. Nobody has confirmed either way yet.</p>" +
    "<p><strong>What to do:</strong> during Chapter 1, one morning at Jason's house, Lucia says she is going to meditate and walks out to the balcony. Follow her and accept the optional quest. She shows you how it works. That meditation is gone after Chapter 1.</p>" +
    "<p><strong>Why it might not matter:</strong> PowerPyx reports that it raises the meditation counter by one, but it is not marked as a meditation spot like the other 18 — so it is unclear whether the trophy needs it. PowerPyx had done it when the trophy unlocked. Do it when it comes up: it takes a minute and removes the risk.</p>" +
    (pma ? '<p><button type="button" class="btn" data-action="select" data-id="28">Open the full guide</button> ' +
      (isEarned(state, 28) ? '<span class="small muted">Earned — the risk is gone.</span>' : '<span class="small muted">Not earned yet.</span>') + "</p>" : "") +
    "</div>" +
    '<div class="card"><h3>Start early, just in case</h3>' +
    "<p>TechWiser adds a single-source warning (via CryptoGames): the stranger mission chains behind five hidden trophies have windows tied to story progress. It is one source, so this ledger does not call them missable — but starting each strand when it unlocks costs nothing.</p>" +
    "<ul class=\"road-list\">" + watchRows + "</ul></div>" +
    '<div class="card"><h3>Looks missable, but is not</h3>' +
    "<p>PowerPyx lists things that look missable but do not affect any trophy or 100% completion (via SixShore): many optional missions disappear after a while — there are far more than you need; some quest givers, Kenton for one, go away for part of the story, but all trophy quest givers come back and stay after the story; some fences leave for good, but none has a trophy quest; a few magazine collectibles sit in story buildings that close off, but they also spawn elsewhere; quests with an hourglass icon can fail on a timer, but none is tied to a trophy; and the relationship between Jason and Lucia does not matter for trophies.</p>" +
    "<p><strong>One warning that is not about trophies:</strong> PowerPyx says the Irredeemable criminal profile is permanent and makes police more aggressive. You can still earn everything, but it makes the clean-up harder.</p></div>";
}

// ------------------------------------------------------------------ planner

export function renderPlanner(trophies, state, ui) {
  const minutes = ui.sessionMinutes || 120;
  const plan = planSession(trophies, state, minutes);
  const next = nextUp(trophies, state, 8);
  const f = forecast(trophies, state);
  const nextRows = next.map((t) =>
    '<div class="plan-item"><span>' + escapeHtml(displayName(state, t)) + ' <span class="muted">· ' + escapeHtml(GROUP_TITLE[t.group] || t.group) + "</span></span>" +
    "<span>" + formatHours(t.hours) + "</span></div>"
  ).join("");
  const planRows = plan.picked.length === 0
    ? '<p class="empty">Nothing in the next-up list fits a ' + minutes + '-minute session on its own. Take a longer session, or tick off a big trophy first.</p>'
    : plan.picked.map((t) =>
      '<div class="plan-item"><span>' + escapeHtml(displayName(state, t)) + ' <span class="muted">· ' + escapeHtml(GROUP_TITLE[t.group] || t.group) + "</span></span>" +
      "<span>" + formatHours(t.hours) + "</span></div>"
    ).join("") +
    '<p class="plan-total">Planned: ' + plan.picked.length + " trophies · " + Math.round(plan.usedMinutes) + " of " + minutes + " minutes</p>";
  const buttons = [60, 90, 120, 180].map((m) =>
    '<button type="button" class="btn' + (minutes === m ? " active" : "") + '" data-action="session" data-value="' + m + '">' + m + " min</button>"
  ).join("");
  return '<h2>Next-up planner</h2>' +
    '<p class="lede">What to chase next, in roadmap order — and what fits in one sitting. The forecast is the ledger\u2019s own per-trophy model: about ' +
    Math.round(f.total) + " h in total, about " + Math.round(f.left) + " h left. PowerPyx says about 200 h; Push Square says 250+ h. The model\u2019s parts overlap (checklist trophies share the same hours), so treat it as a planning figure, not a measurement.</p>" +
    '<div class="card"><h3>Session planner</h3><p class="small muted">Pick a session length; the planner fills it from the next-up list without exceeding it.</p>' +
    '<div class="plan-pick">' + buttons + "</div>" + planRows + "</div>" +
    '<div class="card"><h3>Next up</h3>' + nextRows + "</div>";
}

// --------------------------------------------------------------------- save

export function renderSave(trophies, state) {
  const earned = state.earned.length;
  return '<h2>Save &amp; notes</h2>' +
    '<p class="lede">Your progress lives in this browser only (localStorage, key <code>vice-ledger-v3</code>). Export it to a file before you clear browser data, and import it back on any machine.</p>' +
    '<div class="save-grid">' +
    '<div class="card"><h3>Export</h3><p>' + earned + ' of 55 trophies earned. Download the save file, or copy the text below.</p>' +
    '<p><button type="button" class="btn" data-action="export">Download vice-ledger-save.json</button></p>' +
    '<textarea id="exportBox" readonly aria-label="Exported save text"></textarea></div>' +
    '<div class="card"><h3>Import</h3><p>Paste a save file you exported earlier, then import it. This replaces the progress in this browser.</p>' +
    '<textarea id="importBox" placeholder="{&quot;version&quot;: 3, &quot;earned&quot;: […]}" aria-label="Save text to import"></textarea>' +
    '<p><button type="button" class="btn" data-action="import">Import this save</button> ' +
    '<span id="importMsg" class="small muted"></span></p></div>' +
    '<div class="card"><h3>Start over</h3><p>Clears every tick, counter and note in this browser. Export first if you might want it back.</p>' +
    '<p><button type="button" class="btn" data-action="reset">Reset all progress</button></p></div>' +
    '<div class="card"><h3>Your notes</h3><p class="small muted">Notes are written on a trophy\u2019s detail pane and saved with the rest of your progress. ' +
    Object.keys(state.notes).length + " note(s) saved.</p>" +
    '<p class="small muted">Keyboard: <kbd>/</kbd> search · <kbd>1</kbd>–<kbd>6</kbd> sections · <kbd>S</kbd> spoilers · <kbd>E</kbd> export.</p></div>' +
    "</div>";
}
