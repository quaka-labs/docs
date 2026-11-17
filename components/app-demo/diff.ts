/** The app's two line diffs: the Changes panel's full file (diff-file.tsx) and the chat's collapsed view (diff-viewer.tsx). */

export interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
  oldNum?: number;
  newNum?: number;
}

function lcs(before: string, after: string): DiffLine[] {
  const oldLines = before.split("\n");
  const newLines = after.split("\n");
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldLines[i - 1] === newLines[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  let i = m;
  let j = n;
  const result: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({ type: "context", content: oldLines[i - 1], oldNum: i, newNum: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ type: "added", content: newLines[j - 1], newNum: j });
      j--;
    } else {
      result.push({ type: "removed", content: oldLines[i - 1], oldNum: i });
      i--;
    }
  }
  return result.reverse();
}

const cache = new Map<string, DiffLine[]>();

/** Every line, numbered as the Changes panel numbers them (new numbers, old ones for removals). */
export function fullDiff(before: string, after: string): DiffLine[] {
  const key = `${before}\u0000${after}`;
  let lines = cache.get(key);
  if (!lines) {
    lines = lcs(before, after);
    cache.set(key, lines);
  }
  return lines;
}

/** Changes with three lines of context, the rest folded into "··· N lines ···". */
export function collapsedDiff(before: string, after: string): DiffLine[] {
  const result = fullDiff(before, after);
  const keep = new Set<number>();
  result.forEach((line, idx) => {
    if (line.type === "context") return;
    for (let k = Math.max(0, idx - 3); k <= Math.min(result.length - 1, idx + 3); k++) keep.add(k);
  });
  for (let idx = 0; idx < Math.min(2, result.length); idx++) keep.add(idx);
  for (let idx = Math.max(0, result.length - 2); idx < result.length; idx++) keep.add(idx);

  const collapsed: DiffLine[] = [];
  let skipped = 0;
  result.forEach((line, idx) => {
    if (!keep.has(idx)) {
      skipped++;
      return;
    }
    if (skipped > 0) collapsed.push({ type: "context", content: `··· ${skipped} lines ···` });
    skipped = 0;
    collapsed.push(line);
  });
  if (skipped > 0) collapsed.push({ type: "context", content: `··· ${skipped} lines ···` });
  return collapsed;
}

export function counts(before: string, after: string): { added: number; removed: number } {
  const lines = fullDiff(before, after);
  return {
    added: lines.filter((l) => l.type === "added").length,
    removed: lines.filter((l) => l.type === "removed").length,
  };
}
