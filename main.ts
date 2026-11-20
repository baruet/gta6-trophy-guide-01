// Vice Ledger v3 — Grand Theft Auto VI trophy guide, entrypoint.
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with the kit's dossier library
// (vendor/makefun-frontend.ts, unchanged). Node 22, standard library only,
// no network. Two runs write the same bytes: the copies are plain file
// copies and buildDossier is deterministic.
//
// Run locally:  MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

// The gate's caps for this bounty (RULES.txt, The gate): 4 screenshots of
// at most 256 KiB, app/ at most 993 entries and 48 MiB, paths at most 1000
// bytes, dossier text at most 163,840 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyEntry(name) {
  const src = join(REPO_ROOT, name);
  if (!existsSync(src)) throw new Error("Vice Ledger: missing " + name + "/ in " + REPO_ROOT);
  cpSync(src, join(OUT_DIR, name), { recursive: true });
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
copyEntry("app");
copyEntry("screenshots");
writeFileSync(join(OUT_DIR, "dossier.json"), buildDossier(OUT_DIR, DOSSIER_CAPS));
console.log("Vice Ledger: wrote " + OUT_DIR + " (app/, screenshots/, dossier.json)");
