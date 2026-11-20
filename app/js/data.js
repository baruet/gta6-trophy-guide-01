// Vice Ledger — static data: source directory, chapter groups, roadmap.
// Trophy records themselves live in data/trophies.json and are fetched at run
// time from the app's own files (no network).

export const SOURCES = {
  EXO: { name: "Exophase — GTA VI trophies (PS5)", url: "https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/" },
  PSN: { name: "PSNProfiles — GTA VI trophies", url: "https://psnprofiles.com/trophies/43531-grand-theft-auto-vi" },
  PYX: { name: "PowerPyx — GTA 6 Trophy Guide & Roadmap", url: "https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/" },
  PSQ: { name: "Push Square — GTA 6 Trophy Guide & Roadmap", url: "https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap" },
  SIX: { name: "SixShore — GTA 6 Trophy and Achievement List", url: "https://sixshore.com/gta-6/guides/trophies-and-achievements/" },
  GTA: { name: "GTA Zone — GTA 6 Trophy List", url: "https://gta-zone.com/news/gta-6-trophies-achievements/" },
  CRY: { name: "CryptoGames — GTA 6 Trophies and Achievements", url: "https://cryptogames.gg/gta-6-trophies-achievements-full-list/" },
};

// The ten chapter groups of the Chapters view, in play order.
export const GROUPS = [
  { id: "ch1", title: "Chapter 1 — First Steps", note: "The opening mission, the first chapter trophy, and the one meditation that may not wait." },
  { id: "ch2", title: "Chapter 2 — Two of Us", note: "Both characters roam together from here: partner robberies and wanted-level play open up." },
  { id: "ch3", title: "Chapter 3 — Vice City", note: "Strands open (Andy, Randy, Tyrone), the Snap Gun arrives, and marked-bill laundering starts." },
  { id: "ch4", title: "Chapter 4 — The Long Game", note: "Three tracked main missions and the bank jobs that open the vault trophies." },
  { id: "ch5", title: "Chapter 5 — Finale", note: "The last tracked mission and the final mission. After the credits, free roam and the checklist." },
  { id: "strangers", title: "Strangers & Freaks", note: "Eight stranger strands. Kenton goes quiet after Chapter 1 and returns later — not missable." },
  { id: "collect", title: "Collectibles & the World", note: "Cards, WAiNK scans, vehicles, the whole map, garages and the Scooter Bros app." },
  { id: "activities", title: "Activities, Races & Ranges", note: "Stunts, the 9 activity types, shooting ranges, drone races, races, arcade and challenges." },
  { id: "combat", title: "Robberies & Combat", note: "Combat Focus, the VCIA jet, the Rhino tank, armored trucks, gang operations and strength." },
  { id: "longroad", title: "The Long Road — Clean-up", note: "The 100% gold, the criminal-profile count, and the trophies no guide has pinned down yet." },
];

export const GROUP_TITLE = Object.fromEntries(GROUPS.map((g) => [g.id, g.title]));

// Roadmap steps, built from the official descriptions plus the cited guides.
export const ROADMAP = [
  {
    step: 1,
    title: "Play the story, and do the side work as it appears",
    time: "about 60–80 hours (PowerPyx)",
    points: [
      "Finish Chapters 1–5. The 12 story trophies pop as you go; chapter trophies can pop a mission or two late, so do not worry.",
      "Do the Chapter 1 balcony meditation at Jason's house (Positive Mental Attitude) — the one possibly missable trophy.",
      "Take optional missions as they appear. 100% needs any 100 of them, out of several hundred.",
      "Scan every new vehicle with WAiNK (100% needs 200 of 277) and study new animals through the binoculars (100% needs 100 of 255).",
      "Start each stranger strand when it unlocks (Andy, Kenton, Billy, Randy, Tyrone) — some quest givers go quiet mid-story and return later.",
    ],
  },
  {
    step: 2,
    title: "The 100% checklist and the 70 challenges",
    time: "about 100 hours (PowerPyx)",
    points: [
      "After the credits, the checklist appears under Progress, then Stats, then 100% Completion. Progress made during the story already counts.",
      "The list is lenient — about 60% true completion. You need 70 of 80 challenges, 15 of 18 card sets, 15 of 18 meditations and 300 stunts.",
      "The parts that need everything: robberies, underwater discoveries, shooting ranges, drone races and Bret's quests.",
      "Nothing on the checklist is missable, and free roam continues after the story. There is no mission replay, so keep manual saves.",
    ],
  },
  {
    step: 3,
    title: "Strangers & Freaks and the last clean-up",
    time: "about 10 hours (PowerPyx)",
    points: [
      "Finish the 8 stranger strands — they are not part of 100% completion, so they may still be open.",
      "Mop up the grind trophies the checklist did not finish: vaults, gangs, cards, WAiNK scans and the profile count.",
      "When the last bronze pops, the platinum follows. One playthrough is enough; there are no online trophies.",
    ],
  },
];

// Trophies earned by the ?seed=13 screenshot state: a plausible early-game set.
export const SEED_EARNED = [2, 3, 8, 16, 19, 20, 21, 28, 33, 35, 36, 44, 51];

export async function loadTrophies() {
  const res = await fetch("data/trophies.json");
  if (!res.ok) throw new Error("could not load data/trophies.json");
  const data = await res.json();
  return data.trophies;
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function formatHours(h) {
  if (h === 0) return "—";
  if (h < 1) return "≈30 min";
  if (Number.isInteger(h)) return "≈" + h + " h";
  return "≈" + h.toFixed(1).replace(/\.0$/, "") + " h";
}
