import { ArrowUpRight, FolderOpen, GitBranch, MoreHorizontal, PanelLeft, SquareTerminal } from "@keyline-icons/react";
import { History, MessageCircleQuestion } from "lucide-react";
import { cx, GhostButton, GithubMark } from "./bits";
import { AgentOrb } from "./mascot";

/** The context ring (chat-ui context-meter.tsx), closed. */
function ContextMeter({ pct }: { pct: number }) {
  const r = 6.5;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative">
      <div className="h-7 px-1.5 rounded-md flex items-center gap-1.5 text-muted-foreground/60">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 -rotate-90 text-primary">
          <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
          <circle
            cx="8"
            cy="8"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span className="text-[10px] font-mono tabular-nums">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
}

interface ChatHeaderProps {
  title: string;
  running: boolean;
  project: string | null;
  branch: string | null;
  pr: number | null;
  context: number;
  /** The sidebar is collapsed: the header offers to open it. */
  collapsed?: boolean;
}

/** chat-ui src/features/chat/chat-header.tsx */
export function ChatHeader({ title, running, project, branch, pr, context, collapsed }: ChatHeaderProps) {
  return (
    <header className="flex items-center h-[52px] shrink-0 border-b border-border/15 gap-2 px-5">
      {collapsed && (
        <div className="shrink-0 overflow-hidden w-8 mr-3">
          <GhostButton className="h-8 w-8 text-muted-foreground">
            <PanelLeft className="h-4 w-4" />
          </GhostButton>
        </div>
      )}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <AgentOrb active={running} />
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold tracking-[-0.01em] truncate leading-tight">{title || "New thread"}</span>
          {project && (
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0 whitespace-nowrap overflow-hidden ad-enter">
              <FolderOpen className="h-2.5 w-2.5 shrink-0 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 truncate max-w-[180px] shrink-[2]">{project}</span>
              {branch && (
                <span className="text-[10px] text-muted-foreground/40 font-mono flex min-w-0 items-center gap-0.5">
                  <GitBranch className="h-2 w-2 shrink-0" />
                  <span className="truncate">{branch}</span>
                </span>
              )}
              {pr !== null && <span className="text-[10px] text-muted-foreground/50 font-mono">#{pr}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {context > 0 && <ContextMeter pct={context} />}
        <GhostButton className="h-7 w-7 text-muted-foreground/50">
          <MessageCircleQuestion className="h-3.5 w-3.5" />
        </GhostButton>
        <GhostButton className="h-7 w-7 text-muted-foreground/50">
          <History className="h-3.5 w-3.5" />
        </GhostButton>
        <GhostButton className="h-7 w-7 text-muted-foreground/50">
          <SquareTerminal className="h-3.5 w-3.5" />
        </GhostButton>
        {project ? (
          <GhostButton className="h-7 w-7 text-muted-foreground/50">
            <GitBranch className="h-3.5 w-3.5" />
          </GhostButton>
        ) : (
          <GhostButton className="h-7 px-3 text-[11px] font-medium gap-1.5 text-muted-foreground/60">
            <FolderOpen className="h-3 w-3" />
            Open Project
          </GhostButton>
        )}
        <GhostButton className="h-7 w-7 text-muted-foreground/40">
          <MoreHorizontal className="h-4 w-4" />
        </GhostButton>
      </div>
    </header>
  );
}

const PR_TONE = { looking: "bg-amber-300 animate-pulse", none: "bg-emerald-400" } as const;
const PR_LINE = { looking: "Looking for CI checks on the new push", none: "No checks on this repository" } as const;

/** chat-ui src/features/threads/pr-status-card.tsx, for the thread's own open PR. */
export function PrStatus({ number, state }: { number: number; state: "looking" | "none" }) {
  return (
    <div className="border-b border-border/15 px-5 py-2 text-[11px] ad-enter ad-up-1">
      <div className="flex items-center gap-2 min-w-0">
        <GithubMark className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
        <span className="font-mono text-muted-foreground/60">#{number}</span>
        <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", PR_TONE[state])} />
        <span className="truncate text-foreground/80">{PR_LINE[state]}</span>
        <span className="flex-1" />
        <span className="h-6 shrink-0 rounded-md px-2 text-[11px] text-muted-foreground flex items-center gap-1">
          GitHub <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
      <p className="mt-0.5 pl-[22px] text-[10px] text-muted-foreground/40">
        Failing checks and review comments wake this thread while Quaka is open and this Mac is awake.
      </p>
    </div>
  );
}
