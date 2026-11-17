import { CircleAlert, GitPullRequest, Terminal } from "@keyline-icons/react";
import { useTarget } from "../cursor";
import { BRANCH, FIX_COMMAND, TAINT_STEP, THREAD_TITLE, WEB_SOURCE } from "../data";
import type { PromptCard, TargetName } from "../model";
import { cx, ShellCode } from "./bits";

const CARDS: Record<Exclude<PromptCard, "writers">, { icon: typeof Terminal; title: string; badge?: string; command?: string; subtitle?: string }> = {
  curl: { icon: Terminal, title: "Run a command", badge: "Makes changes", command: FIX_COMMAND },
  pr: { icon: GitPullRequest, title: "Open a pull request", subtitle: `Push ${BRANCH} and open a pull request into main: ${THREAD_TITLE}` },
};

/** chat-ui permission-dialog.tsx: the approval card above the composer. */
export function PermissionCard({ kind, hover }: { kind: Exclude<PromptCard, "writers">; hover: TargetName | null }) {
  const card = CARDS[kind];
  const Icon = card.icon;
  const cardRef = useTarget("card");
  const reject = useTarget("reject");
  const allow = useTarget("allow");
  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-1.5 ad-enter ad-up-4">
      <div ref={cardRef} className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border bg-card/95 shadow-xl backdrop-blur-lg border-border/40">
        <div className="flex items-start gap-3 px-4 pt-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-foreground">{card.title}</p>
              {card.badge && <span className="rounded-full px-2 py-px text-[10.5px] font-medium bg-muted text-muted-foreground">{card.badge}</span>}
              <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/60">Waiting for you</span>
            </div>
            {card.subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground truncate">{card.subtitle}</p>}
          </div>
        </div>

        <div className="px-4 pt-3">
          {card.command ? (
            <div className="relative rounded-lg border border-border/40 bg-black/30">
              <pre className="max-h-36 overflow-hidden whitespace-pre-wrap [overflow-wrap:anywhere] px-3 py-2.5 pr-14 font-mono text-[12.5px] leading-relaxed text-foreground/90">
                <span className="select-none text-muted-foreground/50">$ </span>
                <code>
                  <ShellCode code={card.command} />
                </code>
              </pre>
            </div>
          ) : (
            <details className="rounded-lg border border-border/40 bg-black/20">
              <summary className="select-none px-3 py-1.5 text-[11px] text-muted-foreground">Details</summary>
            </details>
          )}
          <p className="mt-2.5 flex items-start gap-1.5 text-[12px] text-amber-500">
            <CircleAlert className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Always asks: this run read untrusted content: {WEB_SOURCE} at step {TAINT_STEP}.</span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border/30 bg-muted/20 px-4 py-2.5">
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <span
              ref={reject}
              className={cx(
                "flex h-8 items-center rounded-lg px-3 text-[12px] transition-colors",
                hover === "reject" ? "bg-accent text-foreground" : "text-muted-foreground",
              )}
            >
              Reject
            </span>
            <span
              ref={allow}
              className={cx(
                "flex h-8 items-center rounded-lg px-3.5 text-[12px] font-medium transition-colors text-background",
                hover === "allow" ? "bg-foreground/90" : "bg-foreground",
              )}
            >
              Allow
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
