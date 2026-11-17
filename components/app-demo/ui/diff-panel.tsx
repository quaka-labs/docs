import { CaretRight, CaretUp, FolderOpen, X } from "@keyline-icons/react";
import { FILES } from "../data";
import { counts, fullDiff } from "../diff";
import { cx, JsLine } from "./bits";

/** chat-ui diff/diff-file.tsx: the whole file, its changed lines tinted, filling in as the edit lands. */
function DiffFile({ path, rows }: { path: string; rows: number }) {
  const { before, after } = FILES[path];
  const lines = fullDiff(before, after).slice(0, rows);
  return (
    <div className="text-[11px] font-mono">
      {lines.map((line, i) => (
        <div
          key={i}
          className={cx("flex leading-[1.7]", line.type === "added" && "bg-emerald-500/[0.06]", line.type === "removed" && "bg-red-500/[0.06]")}
        >
          <span className="w-8 shrink-0 text-right pr-1.5 select-none text-white/15 border-r border-white/[0.04]">
            {line.type === "removed" ? line.oldNum : line.newNum}
          </span>
          <span
            className={cx(
              "w-5 shrink-0 text-center select-none",
              line.type === "added" && "text-emerald-400/50",
              line.type === "removed" && "text-red-400/50",
            )}
          >
            {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
          </span>
          <span className="flex-1 whitespace-pre-wrap break-all px-1">
            <JsLine code={line.content} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** chat-ui diff/diff-panel.tsx: the Changes panel, first file open, the rest as rows with counts. */
export function DiffPanel({ paths, reveal }: { paths: string[]; reveal: Record<string, number> }) {
  return (
    <div className="w-[380px] h-full shrink-0 flex flex-col rounded-xl border border-border/20 overflow-hidden" style={{ backgroundColor: "hsl(0 0% 9%)" }}>
      <div className="flex items-center h-11 gap-2 px-4 border-b border-border/10 shrink-0">
        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="text-[12px] font-semibold text-foreground/70 flex-1 tracking-tight">Changes</span>
        <span className="text-[10px] font-mono text-muted-foreground/40 mr-1">
          {paths.length} file{paths.length > 1 ? "s" : ""}
        </span>
        <span className="h-6 w-6 flex items-center justify-center text-muted-foreground/40 rounded">
          <X className="h-3 w-3" />
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="p-2">
          {paths.map((path, i) => {
            const active = i === 0;
            const name = path.split("/").pop() ?? path;
            const dir = path.slice(0, path.length - name.length);
            const { added, removed } = counts(FILES[path].before, FILES[path].after);
            return (
              <div key={path} className="mb-1 ad-enter ad-up-1">
                <div
                  className={cx(
                    "flex h-9 w-full items-center gap-2.5 rounded-lg border px-2.5 text-left",
                    active ? "border-border/40 bg-accent/60" : "border-transparent",
                  )}
                >
                  {active ? <CaretUp className="h-3.5 w-3.5 shrink-0 text-primary" /> : <CaretRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
                  <span className="flex-1 truncate text-[11px] font-mono text-muted-foreground">
                    {dir}
                    <span className="font-medium text-foreground">{name}</span>
                  </span>
                  <span className="flex items-center gap-2 font-medium tabular-nums text-[10px]">
                    <span className="text-emerald-400/70">+{added}</span>
                    <span className="text-red-400/70">−{removed}</span>
                  </span>
                </div>
                {active && (
                  <div className="mt-1 overflow-hidden rounded-lg bg-background/40">
                    <DiffFile path={path} rows={reveal[path] ?? 0} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-7 flex items-center justify-center border-t border-border/10 shrink-0">
        <span className="text-[9px] text-muted-foreground/40">click any line to edit · auto-saves</span>
      </div>
    </div>
  );
}
