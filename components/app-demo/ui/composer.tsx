import { ArrowUp, ChevronDown, Mic, Plus } from "@keyline-icons/react";
import { useTarget } from "../cursor";
import { MODEL, PROVIDER } from "../data";
import { cx, GithubMark, ProviderLogo } from "./bits";

interface ComposerProps {
  draft: string;
  focused: boolean;
  typing: boolean;
  running: boolean;
  centered: boolean;
  repo: string | null;
  sendHover: boolean;
}

const IDLE = "Plan, Build, Automate / @ for context";
const RUNNING = "Enter to steer · ⌘Enter to queue · ⌥Enter to interrupt · Esc to stop";

/** chat-ui src/features/chat/chat-input.tsx */
export function Composer({ draft, focused, typing, running, centered, repo, sendHover }: ComposerProps) {
  const field = useTarget("composer");
  const send = useTarget("send");
  const canSend = draft.trim().length > 0 && !running;
  const model = MODEL.length > 18 ? `${MODEL.slice(0, 18)}…` : MODEL;

  return (
    <div className={cx("p-4 pt-2", centered && "flex-1 flex flex-col items-center justify-center pb-20")}>
      <div className={cx("mx-auto w-full", centered ? "max-w-2xl" : "max-w-3xl")}>
        {centered && (
          <p className="text-center mb-6 text-4xl font-semibold tracking-[-0.03em] text-foreground/80 [text-shadow:0_1px_12px_hsl(var(--background)/0.8)]">
            What would you like to build?
          </p>
        )}
        <div className="relative">
          <div aria-hidden className={cx("pointer-events-none absolute -inset-4 transition-opacity duration-500", typing ? "opacity-100" : "opacity-0")}>
            <div className="absolute inset-x-6 top-0 h-10 rounded-full bg-[#5533d2] opacity-[0.22] blur-2xl" />
            <div className="absolute inset-x-0 top-1/2 h-16 -translate-y-1/2 rounded-full bg-[#a03bd0] opacity-[0.16] blur-2xl" />
            <div className="absolute inset-x-10 bottom-0 h-10 rounded-full bg-[#e2415a] opacity-[0.2] blur-2xl" />
            <div className="absolute -right-2 bottom-0 h-8 w-20 rounded-full bg-[#f5a06c] opacity-[0.18] blur-xl" />
          </div>
          <div className="relative rounded-2xl bg-card/90 shadow-lg backdrop-blur-sm border border-border/50">
            <span className="ad-beam" data-on={typing} aria-hidden />
            <div className="px-4 pb-2 pt-4">
              <div ref={field} className="min-h-[28px] w-full text-sm leading-relaxed whitespace-pre-wrap break-words">
                {draft ? (
                  <span>
                    {draft}
                    {focused && <span className="ad-caret" aria-hidden />}
                  </span>
                ) : (
                  <span className="relative text-muted-foreground/40">
                    {focused && !running && <span className="ad-caret absolute -left-px top-[3px]" aria-hidden />}
                    {running ? RUNNING : IDLE}
                  </span>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2 px-3 pb-3 pt-1">
              <span className="shrink-0 h-8 w-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground">
                <Plus className="h-3.5 w-3.5 shrink-0" />
              </span>
              <span className="min-w-0 shrink-[3]">
                <span className="h-8 max-w-full min-w-0 px-3 rounded-full border border-border/60 flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                  <GithubMark className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 max-w-[120px] truncate">{repo ?? "GitHub"}</span>
                  <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                </span>
              </span>
              <span className="shrink-0 h-8 max-w-full min-w-0 px-3 rounded-full border border-border/60 flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                <span className="min-w-0 truncate">Build</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              </span>
              <span className="flex min-w-0 shrink-[2] items-center gap-1.5 px-2 h-8 text-xs text-muted-foreground">
                <span className="shrink-0">
                  <ProviderLogo provider={PROVIDER} />
                </span>
                <span className="min-w-0 font-mono text-foreground/70 max-w-[140px] truncate">{model}</span>
                <ChevronDown className="h-3 w-3 shrink-0" />
              </span>
              <div className="flex-1 min-w-2" />
              <span className="shrink-0 h-8 w-8 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground">
                <Mic className="h-3.5 w-3.5 shrink-0" />
              </span>
              {running ? (
                <span className="shrink-0 h-8 w-8 rounded-full border border-foreground/20 bg-foreground text-background flex items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-current" />
                </span>
              ) : (
                <span
                  ref={send}
                  className={cx(
                    "shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-150",
                    canSend ? "border-foreground/20 text-background" : "border-border/60 text-muted-foreground/30",
                    canSend && (sendHover ? "bg-foreground/90" : "bg-foreground"),
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
