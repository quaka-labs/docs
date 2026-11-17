import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const contentDir = path.join(root, "content/docs");
const publicDir = path.join(root, "public");

/** Routes the app serves that are not content pages. */
const APP_ROUTES = new Set([
  "/",
  "/docs.md",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/docs-og",
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

/** The route a content file is served at. */
function routeOf(file) {
  const rel = path.relative(contentDir, file).split(path.sep).join("/");
  if (rel === "index.mdx") return "/docs";
  if (rel.endsWith("/index.mdx")) return `/docs/${rel.slice(0, -"/index.mdx".length)}`;
  return `/docs/${rel.replace(/\.mdx$/, "")}`;
}

/** GitHub's heading ids, which the docs use for anchors. */
function slug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function anchorsOf(source) {
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/```[\s\S]*?```/g, "");
  const seen = new Map();
  const ids = new Set();
  for (const line of body.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const base = slug(match[2]);
    if (!base) continue;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    ids.add(count === 0 ? base : `${base}-${count}`);
  }
  // Explicit ids, such as the waitlist block the topbar and sidebar link to.
  for (const match of body.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(match[1]);
  return ids;
}

function linksOf(source) {
  const links = [];
  const withoutFences = source.replace(/```[\s\S]*?```/g, "");
  for (const match of withoutFences.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    links.push({ href: match[1], index: match.index });
  }
  for (const match of withoutFences.matchAll(/href=["']([^"']+)["']/g)) {
    links.push({ href: match[1], index: match.index });
  }
  return links;
}

const files = await walk(contentDir);
const routes = new Map();
const headings = new Map();

for (const file of files) {
  const route = routeOf(file);
  routes.set(route, file);
  headings.set(route, anchorsOf(await readFile(file, "utf8")));
}

const problems = [];
let checked = 0;

for (const file of files) {
  const source = await readFile(file, "utf8");
  const from = routeOf(file);
  for (const { href, index } of linksOf(source)) {
    if (/^(https?:|mailto:|tel:|data:|#|\{)/.test(href)) continue;

    const [rawPath, rawHash] = href.split("#");
    const pathname = rawPath.split("?")[0];
    let target = pathname;

    if (!target) target = from;
    else if (target.startsWith("/")) {
      target = target.replace(/\/+$/, "") || "/";
    } else {
      target = path.posix.resolve(path.posix.dirname(from), target).replace(/\/+$/, "");
    }

    if (target.endsWith(".md")) target = target.slice(0, -3) || "/";
    if (target === "/docs/") target = "/docs";

    checked += 1;

    if (APP_ROUTES.has(target)) continue;

    if (!routes.has(target)) {
      const asset = path.join(publicDir, target);
      try {
        if ((await stat(asset)).isFile()) continue;
      } catch {
        // Not a public file either.
      }
      const line = source.slice(0, index).split("\n").length;
      problems.push(`${path.relative(root, file)}:${line}: ${href} points to a missing page`);
      continue;
    }

    if (rawHash) {
      const id = decodeURIComponent(rawHash);
      if (!headings.get(target)?.has(id)) {
        const line = source.slice(0, index).split("\n").length;
        problems.push(`${path.relative(root, file)}:${line}: ${href} points to a missing anchor`);
      }
    }
  }
}

if (problems.length) {
  console.error(`Checked ${checked} internal links in ${files.length} pages.`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`Checked ${checked} internal links in ${files.length} pages. All resolve.`);
