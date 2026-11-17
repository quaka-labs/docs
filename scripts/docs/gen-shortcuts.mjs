#!/usr/bin/env node
/**
 * Builds the global keyboard shortcut table from the app's keyboard handler.
 *
 *   QUAKA_SOURCE=/path/to/app npm run docs:gen
 *
 * Only shortcuts the app handles while any window has focus are listed. Keys that belong to
 * one control (the message box, an approval card) are documented by hand on the page.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const source = process.env.QUAKA_SOURCE;

if (!source) {
  console.error("Set QUAKA_SOURCE to the app checkout before running this script.");
  process.exit(1);
}

const file = readFileSync(join(source, "src/app/use-keyboard.ts"), "utf8");
const lines = file.split("\n");

const ACTIONS = {
  onNewThread: "New thread",
  onToggleCommandPalette: "Open the command palette",
  onToggleSidebar: "Show or hide the sidebar",
  onZoomIn: "Zoom in",
  onZoomOut: "Zoom out",
  onZoomReset: "Reset zoom to 100%",
  onToggleSettings: "Open Settings",
  onNextNeedingYou: "Go to the next thread that needs you",
  onFocusInput: "Focus the message box",
  onToggleTerminal: "Show or hide the terminal",
  onRun: "Run the workspace",
  onNewTab: "New tab",
  onCloseTab: "Close the current tab",
  onSelectTab: "Jump to a tab",
  onCycleTab: "Previous or next tab",
};

/** A readable key for a condition string, or null when the condition is not a simple one. */
function keyOf(condition) {
  const parts = [];
  if (/\bmod\b/.test(condition)) parts.push("mod");
  if (/\baltKey\b/.test(condition)) parts.push("alt");
  if (/\bshiftKey\b/.test(condition) && !/!\s*e\.shiftKey/.test(condition)) {
    parts.push("shift");
  }

  let key = null;
  const literal = /e\.key === "([^"]+)"/.exec(condition);
  const code = /e\.code === "Key([A-Z])"/.exec(condition);
  if (literal) key = literal[1];
  else if (code) key = code[1].toLowerCase();
  else if (/e\.key >= "1" && e\.key <= "9"/.test(condition)) key = "1 to 9";
  else if (/e\.key === "\{"/.test(condition)) key = "[ or ]";

  if (!key) return null;
  if (key === "=" || key === "+") key = "+";
  if (key === "{" || key === "}" || key === "[" || key === "]") key = "[ or ]";
  return { parts, key };
}

const pretty = (key, mac) => {
  const names = {
    mod: mac ? "Cmd" : "Ctrl",
    alt: mac ? "Option" : "Alt",
    shift: "Shift",
  };
  const parts = key.parts.map((part) => names[part]);
  if (key.key === "1 to 9") parts.push("1 to 9");
  else if (key.key === "[ / ]") parts.push("[ or ]");
  else parts.push(key.key.length === 1 ? key.key.toUpperCase() : key.key);
  return parts.join(" ");
};

const found = [];
for (let i = 0; i < lines.length; i += 1) {
  if (!lines[i].trimStart().startsWith("if (")) continue;
  let condition = lines[i];
  let j = i;
  while (!condition.includes("{") && j < lines.length - 1) {
    j += 1;
    condition += ` ${lines[j].trim()}`;
  }
  let action = null;
  for (let k = j; k < Math.min(j + 6, lines.length); k += 1) {
    const call = /shortcuts\.(on\w+)\?*\.?\(/.exec(lines[k]);
    if (call) {
      action = call[1];
      break;
    }
  }
  if (!action || !ACTIONS[action]) continue;
  const key = keyOf(condition);
  if (!key) continue;
  const mac = pretty(key, true);
  const other = pretty(key, false);
  const existing = found.find((row) => row.action === ACTIONS[action]);
  if (existing) {
    if (!existing.mac.split(" or ").includes(mac)) existing.mac += ` or ${mac}`;
    if (!existing.other.split(" or ").includes(other)) existing.other += ` or ${other}`;
  } else {
    found.push({ mac, other, action: ACTIONS[action], id: action });
  }
}

if (found.length === 0) {
  console.error("No shortcuts found. The keyboard handler may have moved.");
  process.exit(1);
}

const out = {
  source: "the app's global keyboard handler",
  note: "Cmd on macOS, Ctrl on Windows and Linux. Option on macOS is Alt elsewhere.",
  shortcuts: found.map(({ mac, other, action }) => ({ mac, other, action })),
};

const target = join(root, "content/generated/shortcuts.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${out.shortcuts.length} shortcuts to ${target}`);
