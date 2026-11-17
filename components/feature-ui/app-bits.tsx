import { cx } from "@/components/app-demo/ui/bits";

/*
 * Pieces of the desktop app the sections reuse, ported from chat-ui with its own class names and
 * wording. Each is fluid up to the width the app gives it, so it fits its stage at every size.
 */

/** components/ui/switch.tsx, at rest. */
export function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full ring-1 ring-inset",
        on ? "bg-primary ring-primary" : "bg-foreground/10 ring-border/70",
      )}
    >
      <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.35)]", on ? "left-[18px]" : "left-0.5")} />
    </span>
  );
}

/* ---------------------------------------------------------------- Replay */

interface ReplayConfig {
  label: string;
  resolved: number;
  graded: number;
  regressed: number;
  noChange: number;
  failed: number;
  tasks: number;
  costPerAttempt: number;
  steps: number;
  seconds: number;
  tokens: string;
  leftOut: number;
}

/** Three configs over 12 merged PRs, 3 attempts each. Neutral labels: these are not results for any real model. */
const REPLAY: ReplayConfig[] = [
  { label: "large", resolved: 25, graded: 36, regressed: 2, noChange: 1, failed: 8, tasks: 12, costPerAttempt: 0.41, steps: 23.4, seconds: 372, tokens: "412k", leftOut: 1 },
  { label: "fast", resolved: 20, graded: 36, regressed: 1, noChange: 3, failed: 12, tasks: 12, costPerAttempt: 0.08, steps: 31.7, seconds: 288, tokens: "655k", leftOut: 0 },
  { label: "local", resolved: 9, graded: 36, regressed: 3, noChange: 6, failed: 18, tasks: 12, costPerAttempt: 0, steps: 38.2, seconds: 665, tokens: "702k", leftOut: 2 },
];

/** replay/stats.rs `wilson` with z = 1.96. */
function wilson(successes: number, n: number): [number, number] {
  const z = 1.96;
  const p = successes / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

const REPLAY_ROWS = REPLAY.map((c) => ({ ...c, rate: c.resolved / c.graded, interval: wilson(c.resolved, c.graded) }));
const overlapsOf = (i: number) =>
  REPLAY_ROWS.filter((o, j) => j !== i && o.interval[0] <= REPLAY_ROWS[i].interval[1] && REPLAY_ROWS[i].interval[0] <= o.interval[1]).map((o) => o.label);

/** replay/stats.rs `verdict`: never ranks configs whose intervals overlap. */
function replayVerdict(): string {
  const [first, second] = REPLAY_ROWS;
  const firstOverlaps = overlapsOf(0);
  if (firstOverlaps.includes(second.label))
    return `No config is ahead: the 95% intervals of ${[first.label, ...firstOverlaps].join(", ")} overlap, so their order here could be chance. More tasks narrow them more than more repeats do.`;
  if (firstOverlaps.length === 0) return `${first.label} is ahead: its 95% interval overlaps no other config's.`;
  return `${first.label} is ahead of ${second.label}, but can't be told apart from ${firstOverlaps.join(", ")}: too few attempts there.`;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const cost = (usd: number) => (usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`);
const duration = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);

const REPLAY_WARNING =
  "Intervals treat each attempt as independent. Repeats of the same task are not, so with few tasks the real uncertainty is wider than shown.";
/** Columns the card drops on narrower screens, where the app's table would scroll instead. */
const XL = "max-xl:hidden";
const WIDE = "max-lg:hidden";
const MID = "max-sm:hidden";

/** replay/set-panel.tsx: a set's results table (results-table.tsx) with its verdict and warning. */
export function ReplayFragment() {
  const th = "whitespace-nowrap py-1 pr-3 font-normal";
  const td = "py-1.5 pr-3";
  return (
    <div className="flex w-full flex-col gap-6 rounded-xl border border-border/30 bg-background p-6 max-sm:gap-4 max-sm:p-4">
      <div className="min-w-0">
        <h2 className="truncate text-sm font-medium">storefront: merged PRs since August</h2>
        <div className="truncate text-xs text-muted-foreground">acme/storefront · /Users/maya/code/storefront</div>
      </div>
      <ul className="flex flex-col gap-1 rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 text-[11.5px] text-amber-200/90">
        <li>{REPLAY_WARNING}</li>
      </ul>
      <section className="flex flex-col gap-2">
        <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground/70">Results</h3>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-foreground/90">{replayVerdict()}</div>
          <table className="w-full text-xs tabular-nums">
            <thead className="text-[11px] text-muted-foreground">
              <tr className="text-left">
                <th className={th}>Config</th>
                <th className={th}>Pass rate (95% interval)</th>
                <th className={cx(th, MID)}>Resolved</th>
                <th className={cx(th, WIDE)}>Tasks</th>
                <th className={cx(th, WIDE)}>Cost / attempt</th>
                <th className={cx(th, MID)}>Cost / resolved</th>
                <th className={cx(th, XL)}>Steps</th>
                <th className={cx(th, XL)}>Time</th>
                <th className={cx(th, XL)}>Tokens</th>
                <th className={cx(th, XL)}>Left out</th>
              </tr>
            </thead>
            <tbody>
              {REPLAY_ROWS.map((r, i) => {
                const overlaps = overlapsOf(i);
                return (
                  <tr key={r.label} className="border-t border-border/20 align-top">
                    <td className={td}>
                      <div className="font-mono">{r.label}</div>
                      {overlaps.length > 0 && <div className="text-[10.5px] text-muted-foreground/70">{`can't be told apart from ${overlaps.join(", ")}`}</div>}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <IntervalBar low={r.interval[0]} high={r.interval[1]} rate={r.rate} />
                        <span className="whitespace-nowrap">
                          {pct(r.rate)}{" "}
                          <span className="text-muted-foreground">
                            ({pct(r.interval[0])} to {pct(r.interval[1])})
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className={cx(td, MID)}>
                      {r.resolved}/{r.graded}
                      <div className="whitespace-nowrap text-[10.5px] text-muted-foreground/70">
                        {r.regressed} regressed · {r.noChange} no change · {r.failed} failed
                      </div>
                    </td>
                    <td className={cx(td, WIDE)}>{r.tasks}</td>
                    <td className={cx(td, WIDE)}>{cost(r.costPerAttempt)}</td>
                    <td className={cx(td, MID)}>{cost((r.costPerAttempt * r.graded) / r.resolved)}</td>
                    <td className={cx(td, XL)}>{r.steps.toFixed(1)}</td>
                    <td className={cx(td, XL, "whitespace-nowrap")}>{duration(r.seconds)}</td>
                    <td className={cx(td, XL)}>{r.tokens}</td>
                    <td className={cx(td, XL)}>{r.leftOut}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <div className="text-[11px] text-muted-foreground">Last batch: done · spent $18.04 of $25.00</div>
    </div>
  );
}

function IntervalBar({ low, high, rate }: { low: number; high: number; rate: number }) {
  return (
    <div className="relative h-2 w-28 shrink-0 rounded bg-muted/30" aria-label={`95% interval ${pct(low)} to ${pct(high)}`}>
      <div className="absolute inset-y-0 rounded bg-primary/30" style={{ left: `${low * 100}%`, width: `${Math.max((high - low) * 100, 1)}%` }} />
      <div className="absolute inset-y-[-2px] w-0.5 bg-primary" style={{ left: `calc(${rate * 100}% - 1px)` }} />
    </div>
  );
}
