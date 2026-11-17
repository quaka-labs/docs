import type { ReactNode } from "react";
import { cx } from "@/components/app-demo/ui/bits";

/*
 * One moment in the workspace: a thread's changed files, the diff it is reading, and the Run
 * control the workspace environment provides. A port of the app's diff panel and run controls,
 * not a screenshot.
 */

const FILES = [
  { path: "src/refund.js", state: "M" },
  { path: "test/refund.test.js", state: "M" },
  { path: "package.json", state: "" },
  { path: "src/retry.ts", state: "" },
];

function Line({ n, sign, tone, children }: { n: number; sign: string; tone: "add" | "del" | "same"; children: ReactNode }) {
  return (
    <div
      className={cx(
        "flex leading-[1.65]",
        tone === "add" && "bg-emerald-500/[0.08]",
        tone === "del" && "bg-red-500/[0.08]",
      )}
    >
      <span className="w-8 shrink-0 select-none pr-2 text-right text-muted-foreground/30">{n}</span>
      <span className="w-4 shrink-0 select-none text-muted-foreground/50">{sign}</span>
      <span className="whitespace-pre-wrap break-all text-foreground/80">{children}</span>
    </div>
  );
}

export function WorkspaceFragment() {
  return (
    <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-border/40 bg-background shadow-xl">
      <header className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5">
        <span className="truncate text-[12.5px] font-medium">storefront</span>
        <span className="truncate font-mono text-[10.5px] text-muted-foreground/60">fix/refund-rounding</span>
        <span className="flex-1" />
        <span className="rounded-md border border-border/40 px-2 py-1 text-[10.5px] text-muted-foreground">Review changes</span>
        <span className="rounded-md bg-foreground px-2.5 py-1 text-[10.5px] font-medium text-background">Run</span>
      </header>
      <div className="grid grid-cols-[150px_minmax(0,1fr)] max-sm:grid-cols-1">
        <div className="border-r border-border/30 p-2 max-sm:border-b max-sm:border-r-0">
          <p className="px-1.5 pb-1 text-[9px] uppercase tracking-wide text-muted-foreground/50">Files</p>
          <ul className="flex flex-col">
            {FILES.map((file) => (
              <li
                key={file.path}
                className={cx(
                  "flex items-center gap-2 rounded px-1.5 py-1 font-mono text-[10.5px]",
                  file.state === "M" ? "bg-accent/50 text-foreground/90" : "text-muted-foreground/60",
                )}
              >
                <span className={cx("w-2.5 shrink-0 text-[9px]", file.state === "M" ? "text-amber-400" : "text-transparent")}>
                  {file.state || "-"}
                </span>
                <span className="truncate">{file.path}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 border-b border-border/20 px-3 py-1.5">
            <span className="truncate font-mono text-[10.5px] text-foreground/70">src/refund.js</span>
            <span className="ml-auto shrink-0 font-mono text-[9.5px] text-muted-foreground/50">+1 -1</span>
          </div>
          <div className="overflow-hidden px-3 py-2 font-mono text-[10.5px]">
            <Line n={6} sign=" " tone="same">export function refund(cents, rate) {"{"}</Line>
            <Line n={7} sign=" " tone="same">  const total = cents * rate</Line>
            <Line n={8} sign="-" tone="del">  return Math.floor(total) / 100</Line>
            <Line n={8} sign="+" tone="add">  return roundHalfAway(total) / 100</Line>
            <Line n={9} sign=" " tone="same">{"}"}</Line>
          </div>
        </div>
      </div>
      <footer className="flex flex-wrap items-center gap-2 border-t border-border/30 px-4 py-2">
        <span className="font-mono text-[10px] text-muted-foreground/60">Run: npm test</span>
        <span className="flex-1" />
        <span className="rounded border border-emerald-500/25 bg-emerald-500/[0.06] px-2 py-0.5 font-mono text-[9.5px] text-emerald-400/90">
          localhost:5173
        </span>
      </footer>
    </div>
  );
}
