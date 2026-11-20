// Vice Ledger smoke test — run inside the recorded session after the build:
//   node scripts/smoke-test.mjs
// Checks: trophies.json is the official 55 (grades 1/2/6/46, 26 guide-backed
// + 29 description-only, every guide non-blank, every guide 2+ sources);
// main.ts runs twice to two fresh directories and writes byte-identical
// trees (determinism); screenshots are 3-4 JPEGs within the gate's caps.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
let failures = 0;
function check(ok, label) {
  console.log((ok ? "PASS " : "FAIL ") + label);
  if (!ok) failures++;
}

// --- trophies.json ---------------------------------------------------------
const data = JSON.parse(readFileSync(join(ROOT, "app/data/trophies.json"), "utf8"));
const t = data.trophies;
check(Array.isArray(t) && t.length === 55, "trophies: 55 entries");
const grades = {};
for (const x of t) grades[x.grade] = (grades[x.grade] || 0) + 1;
check(grades.platinum === 1 && grades.gold === 2 && grades.silver === 6 && grades.bronze === 46,
  "grades: 1 platinum / 2 gold / 6 silver / 46 bronze (got " + JSON.stringify(grades) + ")");
check(t.filter((x) => x.hidden).length === 28, "hidden: 28");
check(t.filter((x) => x.verified === "guide").length === 26, "guide-backed: 26");
check(t.filter((x) => x.verified === "description").length === 29, "description-only: 29");
check(t.every((x) => typeof x.guide === "string" && x.guide.trim().length > 0), "every guide non-blank");
check(t.every((x) => Array.isArray(x.sources) && x.sources.length >= 2), "every guide cites 2+ sources");
check(new Set(t.map((x) => x.name)).size === 55, "55 unique names");
check(t.reduce((s, x) => s + x.hours, 0) > 150, "forecast model: total hours sane");

// --- determinism: main.ts twice -------------------------------------------
function treeHash(dir) {
  const files = [];
  (function walk(d, rel) {
    for (const name of readdirSync(d).sort()) {
      const p = join(d, name);
      const r = rel ? rel + "/" + name : name;
      if (statSync(p).isDirectory()) walk(p, r);
      else files.push(r);
    }
  })(dir, "");
  const h = createHash("sha256");
  for (const f of files) {
    h.update(f);
    h.update(readFileSync(join(dir, f)));
  }
  return h.digest("hex");
}
const outA = join(ROOT, ".smoke-a");
const outB = join(ROOT, ".smoke-b");
for (const d of [outA, outB]) rmSync(d, { recursive: true, force: true });
execFileSync("node", ["main.ts"], { cwd: ROOT, env: { ...process.env, MAKEFUN_OUTPUT_DIR: outA }, stdio: "pipe" });
execFileSync("node", ["main.ts"], { cwd: ROOT, env: { ...process.env, MAKEFUN_OUTPUT_DIR: outB }, stdio: "pipe" });
const hashA = treeHash(outA);
const hashB = treeHash(outB);
check(hashA === hashB, "main.ts deterministic: two runs byte-identical (" + hashA.slice(0, 12) + ")");
const dossier = JSON.parse(readFileSync(join(outA, "dossier.json"), "utf8"));
check(dossier.schema === "makefun/dossier/v1", "dossier schema makefun/dossier/v1");
check(typeof dossier.text === "string" && dossier.text.length > 1000, "dossier text present");
rmSync(outA, { recursive: true, force: true });
rmSync(outB, { recursive: true, force: true });

// --- screenshots -----------------------------------------------------------
function jpegSize(buf) {
  // Scan JPEG markers for the SOF0/SOF2 frame header.
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}
const shotsDir = join(ROOT, "screenshots");
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort() : [];
check(shots.length >= 3 && shots.length <= 4, "screenshots: 3-4 images (got " + shots.length + ")");
for (const f of shots) {
  const buf = readFileSync(join(shotsDir, f));
  check(buf.length <= 262144, "screenshot " + f + " <= 256 KiB (" + buf.length + " B)");
  const size = jpegSize(buf);
  if (size) {
    check(Math.max(size.width, size.height) <= 1280 && Math.min(size.width, size.height) >= 480,
      "screenshot " + f + " dimensions " + size.width + "x" + size.height);
  } else {
    check(buf[0] === 0x89 && buf[1] === 0x50, "screenshot " + f + " is a readable image");
  }
}

if (failures > 0) {
  console.error("SMOKE TEST: " + failures + " failure(s)");
  process.exit(1);
}
console.log("SMOKE TEST: all passed");
