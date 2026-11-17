#!/usr/bin/env node
/**
 * Builds the Settings reference from the app's settings registry.
 *
 *   QUAKA_SOURCE=/path/to/app npm run docs:gen
 *
 * The app checkout is not part of this repository. The generated JSON is committed so the
 * docs build never needs the app. `settings-meta.mjs` supplies the public labels and the
 * grouping; this script fails when a key is added, removed or changed without a matching row.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUPS, META } from "./settings-meta.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const source = process.env.QUAKA_SOURCE;

if (!source) {
  console.error("Set QUAKA_SOURCE to the app checkout before running this script.");
  process.exit(1);
}

const generatedTs = readFileSync(join(source, "src/lib/settings.generated.ts"), "utf8");
const settingsRs = readFileSync(
  join(source, "src-tauri/crates/quaka-core/src/settings.rs"),
  "utf8",
);

/** `key: { kind: "...", ... },` from SETTINGS. */
const specs = new Map();
const specRe = /^ {2}([a-z0-9_]+): \{ kind: "(\w+)"(.*?) \},$/gm;
for (const match of generatedTs.matchAll(specRe)) {
  const [, key, kind, rest] = match;
  const spec = { kind };
  const choice = /options: \[([^\]]*)\]/.exec(rest);
  if (choice) {
    spec.options = [...choice[1].matchAll(/"([^"]*)"/g)].map((m) => m[1]);
  }
  const count = /min: (\d+), max: (\d+), default: (\d+)/.exec(rest);
  if (count) {
    spec.min = Number(count[1]);
    spec.max = Number(count[2]);
    spec.default = Number(count[3]);
  }
  const flag = /default: (true|false)/.exec(rest);
  if (flag) spec.default = flag[1] === "true";
  const number = /default: (-?[\d.]+)/.exec(rest);
  if (number && kind === "number") spec.default = Number(number[1]);
  const text = /maxChars: (\d+)/.exec(rest);
  if (text) spec.maxChars = Number(text[1]);
  const str = /default: "([^"]*)"/.exec(rest);
  if (str) spec.default = str[1];
  specs.set(key, spec);
}

/** Scope and sync flag from the Rust registry: `webview` / `backend`, `.syncing()`. */
const scope = new Map();
const entryRe = /^\s*[A-Z0-9_]+:\s+\w+\s*=\s*(webview|backend)\("([^"]+)"[^;]*;/gm;
for (const match of settingsRs.matchAll(entryRe)) {
  const [, access, key] = match;
  const line = match[0];
  scope.set(key, { access, syncs: line.includes(".syncing()") });
}

const missingMeta = [...specs.keys()].filter((key) => !META[key]);
const staleMeta = Object.keys(META).filter((key) => !specs.has(key));
if (missingMeta.length || staleMeta.length) {
  if (missingMeta.length) console.error(`No row in settings-meta.mjs for: ${missingMeta.join(", ")}`);
  if (staleMeta.length) console.error(`Row in settings-meta.mjs with no source key: ${staleMeta.join(", ")}`);
  process.exit(1);
}

const groupIds = new Set(GROUPS.map((group) => group.id));
for (const [key, meta] of Object.entries(META)) {
  if (!groupIds.has(meta.group)) {
    console.error(`Unknown group "${meta.group}" for ${key}.`);
    process.exit(1);
  }
}

const rows = [...specs.entries()].map(([key, spec]) => {
  const meta = META[key];
  const where = scope.get(key) ?? { access: "webview", syncs: false };
  return {
    key,
    label: meta.label,
    summary: meta.summary,
    kind: spec.kind,
    default: spec.default ?? null,
    options: spec.options ?? null,
    min: spec.min ?? null,
    max: spec.max ?? null,
    maxChars: spec.maxChars ?? null,
    scope: where.syncs ? "synced" : "device",
    access: where.access,
  };
});

const groups = GROUPS.map((group) => ({
  ...group,
  rows: rows.filter((row) => META[row.key].group === group.id),
})).filter((group) => group.rows.length > 0);

const out = {
  source: "the app's settings registry",
  count: rows.length,
  groups,
};

const target = join(root, "content/generated/settings.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${rows.length} settings in ${groups.length} groups to ${target}`);
