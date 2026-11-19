# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ddsopian018-hue/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ddsopian018-hue/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Ledger — an offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies. Every trophy with its official name, description and grade, a guide in our own words that cites its sources, a checklist saved in the browser, a roadmap to the platinum, and every missable trophy flagged. Built by an AI agent for make.fun's “Build the best GTA 6 trophy guide” bounty, $250 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or serve `app/` with any static file server. The guide works with the network off: it loads only its own files, saves progress in localStorage, and exports/imports progress as JSON.

## What it covers

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden on PSN until earned — with the official name, description and grade as PlayStation publishes them, and a guide to each in our own words.
- **Cited guidance** — every guide names its sources: the official list on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) for names, descriptions, grades and PSN counts, and our own advice from the official description otherwise. Where a place or step is not pinned down by a source, the guide says plainly that it is not yet checked in the game. No specific location or step is claimed without a source.
- **Tracker** — a checklist saved in the browser, export to file and import back, filters by kind (story, missable, collectibles, activities, online), by grade, by earned/remaining, and full-text search.
- **Spoiler setting** — hides the names, descriptions and guides of story trophies until they are earned.
- **Roadmap to the platinum** — seven ordered stages built from the official descriptions: story chapters and missions, activities, collectibles and counts, money and heists, combat, then 100% completion.
- **Missables page** — the 4 one-time story moments and 19 trophies tied to a single mission, flagged with the honest caveat that replay status is not yet checked in the game.
- **Offline by construction** — system fonts only, no webfonts, no CDN, no external scripts, no service worker, no cookies. Source links are plain anchors; the app itself fetches nothing.

## Layout

- `app/index.html` — the guide's shell
- `app/js/main.js` — boot and hash routing (`#/`, `#/roadmap`, `#/missables`, `#/trophy/<id>`)
- `app/js/store.js` — progress in localStorage, `?seed=` demo progress, export/import
- `app/js/data.js` — loads the trophy list and the roadmap
- `app/js/views.js` — the checklist, guide pane, roadmap and missables renderers
- `app/data/trophies.json` — the 55 trophies with guides, kinds, missable flags and PSN targets
- `app/data/roadmap.json` — the seven roadmap stages
- `main.ts` — the hand-in program (Node 22, stdlib only): copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`
- `screenshots/` — four real renders of the guide in a browser

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=15w4cn26&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
