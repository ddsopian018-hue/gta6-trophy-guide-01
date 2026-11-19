// Leonida Ledger — the hand-in program for gta6-trophy-guide-01 (Node 22, stdlib only).
//
// The guide itself is plain static files in app/ (index.html, its modules and styles,
// app/data/trophies.json with a guide to each of the 55 trophies, and the roadmap data),
// and screenshots/ holds four real renders of it in a browser. This program copies both
// folders into the output directory and writes dossier.json with the kit's vendored
// library, vendor/makefun-frontend.ts — leave that file exactly as the kit shipped it,
// because the scorer rebuilds the dossier with its own copy and compares the bytes.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output; without it the program
// writes to /output. Run it twice: both runs must write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The gate's caps, as the kit documents them: at most 4 screenshots, each at most 256 KiB;
// app/ at most 993 files and directories and 48 MiB in all; the dossier text at most
// 163,840 bytes. buildDossier refuses anything past those limits, so a bad hand-in
// fails here, loudly, instead of silently reaching the judge.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
