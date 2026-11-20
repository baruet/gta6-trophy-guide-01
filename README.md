[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/baruet/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/baruet/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Vice Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: **1 platinum, 2 gold, 6 silver, 46 bronze**, 28 hidden on PlayStation until earned, 0 online trophies. Built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) on [make.fun](https://make.fun/r/3117wh21).

## What it is

- **Checklist** — every trophy with its official name, description and grade, a guide in our own words that cites its sources, and a tick box saved in your browser (localStorage). Search, filter by kind (story, missable, collectibles, activities, online, platinum) and grade, sort by roadmap order, grade or name.
- **Chapters** — 10 groups in play order (Chapters 1–5, Strangers & Freaks, collectibles, activities, robberies, the long clean-up), each with its own progress bar.
- **Roadmap** — three steps to the platinum (story 60–80 h, 100% checklist ~100 h, strands + clean-up ~10 h), built from the official descriptions and the cited guides, plus save advice (15 manual slots, no mission replay) and the cheats warning.
- **Missables** — the one possibly missable trophy (Positive Mental Attitude, Chapter 1 balcony meditation), the strands to start early, and the things that look missable but are not.
- **Planner** — Next-up list in roadmap order, a platinum forecast from the ledger's own per-trophy model (~224 h total; PowerPyx says ~200 h, Push Square 250+ h), and a session planner for 60/90/120/180-minute sittings.
- **Save & notes** — export your progress to a file, import it back, per-trophy progress counters for the 20 PSN-tracked counts, and per-trophy notes.
- **Spoiler setting** — hides story trophy names and descriptions until they are earned.
- **Honest about what is not yet known** — 26 guides are *guide-backed* (they follow a named external guide); 29 are *from the official description only* (our own advice from the description, not yet checked in-game). The game released 19 November 2026; where guides disagree, the ledger says so.

## Run it

Static files under `app/` — no build step, no network at run time:

```sh
# serve app/ with any static server, then open http://localhost:8080
node main.ts            # writes out/ (or $MAKEFUN_OUTPUT_DIR): app/ + screenshots/ + dossier.json
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`. Two runs write identical bytes — see `scripts/smoke-test.mjs`.

## Sources

Official names, descriptions and grades as published on PlayStation, via Exophase and PSNProfiles (checked live 2026-11-20: 55/55 descriptions matched, 0 mismatches). Guides cite, per trophy: [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/), [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), [PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/), [Push Square](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap), [SixShore](https://sixshore.com/gta-6/guides/trophies-and-achievements/), [GTA Zone](https://gta-zone.com/news/gta-6-trophies-achievements/) and [CryptoGames](https://cryptogames.gg/gta-6-trophies-achievements-full-list/). Every guide is written in our own words for this ledger; a source is cited, never copied. No Rockstar logo or official artwork anywhere in the app or its screenshots — the look is our own.

## License

MIT — see [LICENSE](LICENSE).
