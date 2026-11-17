import { useTarget } from "../cursor";
import { MODEL, WRITERS } from "../data";
import type { WriterState } from "../model";
import { cx, ShinyText } from "./bits";

const box = "rounded-md border border-border/40 bg-background/60 px-2 py-1 text-[11.5px]";
const field = `w-full ${box}`;
const button = "h-7 px-3 rounded-md text-[11px] border transition-colors flex items-center";

/** chat-ui writers/writer-launch-card.tsx: the card is the approval for launching the writers. */
export function WriterLaunchCard({ hover }: { hover: boolean }) {
  const card = useTarget("card");
  const launch = useTarget("launch");
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-2 ad-enter ad-up-4">
      <div ref={card} className="rounded-xl border border-border/30 bg-card/95 px-4 py-3 space-y-3">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground/85">Launch {WRITERS.length} writers, each in its own worktree</p>
          <p className="text-[11px] text-muted-foreground/70">
            Nothing changes in this workspace until the thread applies their work. About 1.4M tokens in all, roughly {WRITERS.length}× a single run (≈$2.10 as
            proposed). 3 run at once.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="text-muted-foreground/80">Strategy</span>
            <span className={box}>Parallel (disjoint scopes)</span>
          </span>
        </div>
        <ol className="space-y-1.5">
          {WRITERS.map((w, i) => (
            <li key={w.branch} className="rounded-lg border border-border/30 p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground/70 w-4">{i + 1}.</span>
                <span className={field}>{w.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-6 text-[11px]">
                <span className={cx(box, "min-w-[12rem] flex-1 font-mono")}>{w.scope}</span>
                <span className={cx(box, "shrink-0 whitespace-nowrap")}>{MODEL.split("/").pop()} (thread)</span>
                <span className="shrink-0 text-muted-foreground/60">≈480k tokens</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-1.5">
          <span ref={launch} className={cx(button, "border-border/40 text-foreground/90", hover && "bg-accent")}>
            Launch {WRITERS.length}
          </span>
          <span className={cx(button, "border-border/40 text-muted-foreground")}>Decline</span>
        </div>
      </div>
    </div>
  );
}

const DOT: Record<WriterState, string> = {
  running: "bg-sky-500 animate-pulse",
  done: "bg-emerald-500",
  applied: "bg-emerald-500/50",
};
const LABEL: Record<WriterState, string> = { running: "Running", done: "Done", applied: "Applied" };

/**
 * chat-ui writers/writers-panel.tsx: the thread's writers above the composer, each on its own branch,
 * with what it is doing under its title while it runs.
 */
export function WritersPanel({ states }: { states: WriterState[] }) {
  const ref = useTarget("writers");
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-1.5 ad-enter ad-up-2">
      <div ref={ref} className="rounded-xl border border-border/30 bg-card/70 px-3 py-2 space-y-1">
        <div className="text-[10.5px] uppercase tracking-wide text-muted-foreground/60">Writers</div>
        <ul className="space-y-1.5">
          {WRITERS.map((w, i) => {
            const state = states[i];
            return (
              <li key={w.branch} className="text-[11.5px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", DOT[state])} aria-hidden />
                  <span className="text-muted-foreground/70 shrink-0">{i + 1}</span>
                  <span className="truncate">{w.title}</span>
                  <span className="ml-auto shrink-0 font-mono text-[10.5px] text-muted-foreground/50">{w.branch}</span>
                  <span className="w-14 shrink-0 text-right text-[10.5px] text-muted-foreground/70">{LABEL[state]}</span>
                </div>
                <div className="ml-[22px] mt-0.5 h-4 font-mono text-[10.5px] leading-4">
                  {state === "running" ? (
                    <ShinyText text={`${w.activity}…`} color="hsl(var(--primary) / 0.55)" shine="hsl(var(--primary))" className="text-[10.5px] font-mono" />
                  ) : (
                    <span className="text-muted-foreground/50">{state === "applied" ? "Applied to your checkout, uncommitted" : "Tested in its worktree"}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
