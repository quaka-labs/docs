import PixelAvatar from "../../pixel-avatar";
import { ChevronRight, ChevronsUpDown, Folder, FolderOpen, Inbox, PanelLeftCloseDashed, RefreshCw, Repeat, Search } from "@keyline-icons/react";
import type { ReactNode } from "react";
import { CLOSED_PROJECTS, PROJECTS, SEED_THREADS } from "../data";
import { cx, GhostButton, StatusDot, type DotStatus } from "./bits";

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

export interface SidebarThread {
  id: string;
  title: string;
  ago: string;
  project?: string;
  status?: DotStatus | null;
  active?: boolean;
  /** What the running agent is doing, under the title of the thread on screen. */
  activity?: string | null;
}

function ThreadRow({ thread, nested }: { thread: SidebarThread; nested?: boolean }) {
  const { active } = thread;
  return (
    <div className={cx("group relative flex items-center ad-enter ad-left-1", active ? "text-foreground" : "text-foreground/70")}>
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-y-0 right-0 rounded-lg border transition-[background-color,border-color,box-shadow] duration-200",
          EASE,
          nested ? "-left-[14px]" : "left-0",
          active ? "border-border/50 bg-accent/80 shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]" : "border-transparent",
        )}
      />
      {nested && (
        <span
          aria-hidden
          className={cx(
            "pointer-events-none absolute -left-[8.5px] bottom-[9px] top-[9px] w-[2px] rounded-full bg-foreground/85 transition-transform duration-200",
            EASE,
            active ? "scale-y-100" : "scale-y-0",
          )}
        />
      )}
      <div className={cx("relative flex min-w-0 flex-1 items-center py-[7px] pr-2 text-left", nested ? "gap-2 pl-1.5" : "gap-2.5 pl-3")}>
        <span className="flex w-1.5 shrink-0 justify-center">
          <StatusDot status={thread.status} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] leading-5">{thread.title}</span>
          {thread.activity && <span className="truncate font-mono text-[10.5px] leading-4 text-primary/80">{thread.activity}</span>}
        </span>
      </div>
      <div className="relative flex items-center gap-1.5 mr-2">
        <span className="text-[10px] text-muted-foreground/30">{thread.ago}</span>
      </div>
    </div>
  );
}

function SectionHeader({ label, count, open = true, project }: { label: string; count?: number; open?: boolean; project?: { active: boolean } }) {
  const Icon = open ? FolderOpen : Folder;
  return (
    <div
      className={cx(
        "group/section flex w-full min-w-0 items-center gap-1.5 rounded-md text-left",
        project ? "h-8 px-2 text-[13px]" : "mt-2 h-7 px-2 text-[11.5px] font-medium text-muted-foreground/70",
        project && (project.active ? "font-medium text-foreground" : "text-foreground/70"),
      )}
    >
      {!project && <ChevronRight className={cx("h-3 w-3 shrink-0 opacity-50", open && "rotate-90")} aria-hidden />}
      {project && <Icon className={cx("h-3.5 w-3.5 shrink-0", project.active ? "text-primary" : "text-muted-foreground/70")} aria-hidden />}
      <span className="truncate">{label}</span>
      {project && <ChevronRight className={cx("h-3 w-3 shrink-0 opacity-40", open && "rotate-90")} aria-hidden />}
      {count !== undefined && <span className="ml-auto pl-2 text-[10.5px] font-normal tabular-nums text-muted-foreground/50">{count}</span>}
    </div>
  );
}

/** chat-ui sidebar/tree.tsx `Rail`, at PROJECT_RAIL. */
function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col gap-px pb-0.5 pl-2 pt-0.5" style={{ marginLeft: 14.5 }}>
      <span className="pointer-events-none absolute bottom-1 left-0 top-0.5 w-px rounded-full bg-foreground/15" aria-hidden />
      {children}
    </div>
  );
}

const STATUS_GROUPS: { status: DotStatus; label: string }[] = [
  { status: "needs_you", label: "Needs you" },
  { status: "review", label: "Ready for review" },
  { status: "active", label: "Working" },
];

/** chat-ui src/features/sidebar/sidebar.tsx, with the threads grouped the way `groupThreads` does. */
export function Sidebar({
  current,
  workspace,
  inbox,
  inboxOpen = false,
}: {
  current: SidebarThread | null;
  workspace: string | null;
  inbox: number;
  /** The Inbox view is on screen, so its row is lit as the app's is. */
  inboxOpen?: boolean;
}) {
  const seeds: SidebarThread[] = SEED_THREADS.map((s) => ({ ...s, status: s.review ? "review" : null }));
  const threads = current ? [current, ...seeds] : seeds;
  const byStatus = (status: DotStatus) => threads.filter((t) => t.status === status);
  const resting = threads.filter((t) => !t.status);
  const loose = resting.filter((t) => !t.project);

  return (
    <aside className="flex w-[256px] h-full shrink-0 flex-col bg-background">
      {/* macOS draws the traffic lights over this strip (see QuakaApp). */}
      <div className="h-7 shrink-0" />
      <div className="flex items-center justify-between px-4 pb-2 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size decorative SVG inside a scaled stage */}
        <img src="/app-wordmark.svg" alt="" className="h-8 w-auto select-none" draggable={false} />
        <div className="flex items-center gap-1">
          <GhostButton className="h-7 w-7 text-muted-foreground/50">
            <PanelLeftCloseDashed className="h-4 w-4" />
          </GhostButton>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/30 px-3 h-9">
          <Search className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <span className="flex-1 text-xs text-muted-foreground/30">Search a discussion</span>
        </div>
      </div>

      <div className="px-3 py-2">
        <div
          className="group relative h-9 w-full rounded-lg overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4a54c4 0%, #5560d4 50%, #4a50b8 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "6px 6px",
            }}
          />
          <div className="relative flex h-full items-center justify-center gap-2 px-3">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="text-white/90 text-[11px] font-medium">New Thread</span>
            <span className="text-white/30 text-[10px] font-normal ml-auto">⌘N</span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-1">
        <div className={cx("w-full flex items-center gap-2.5 rounded-lg h-8 px-3 text-xs", inboxOpen ? "bg-accent/80 text-foreground" : "text-muted-foreground/70")}>
          <Inbox className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Inbox</span>
          {inbox > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-amber-400/15 text-amber-400 text-[10px] font-medium tabular-nums">
              {inbox}
            </span>
          )}
        </div>
        <div className="w-full flex items-center gap-2.5 rounded-lg h-8 px-3 text-xs text-muted-foreground/70">
          <Repeat className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Automations</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-2">
        <div className="flex flex-col gap-0.5 pb-2">
          {STATUS_GROUPS.map(({ status, label }) => {
            const rows = byStatus(status);
            if (rows.length === 0) return null;
            return (
              <div key={status} className="flex flex-col gap-0.5">
                <SectionHeader label={label} count={rows.length} />
                <div className="flex flex-col gap-px">
                  {rows.map((t) => (
                    <ThreadRow key={t.id} thread={t} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex flex-col gap-0.5">
            <SectionHeader label="Projects" />
            <div className="flex flex-col gap-0.5">
              {PROJECTS.map((project) => {
                const rows = resting.filter((t) => t.project === project);
                const open = !CLOSED_PROJECTS.has(project);
                return (
                  <div key={project} className="flex flex-col">
                    <SectionHeader label={project} count={rows.length} open={open} project={{ active: workspace === project }} />
                    {open && rows.length > 0 && (
                      <Rail>
                        {rows.map((t) => (
                          <ThreadRow key={t.id} thread={t} nested />
                        ))}
                      </Rail>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {loose.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <SectionHeader label="Chats" count={loose.length} />
              <div className="flex flex-col gap-px">
                {loose.map((t) => (
                  <ThreadRow key={t.id} thread={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {workspace && (
        <div className="flex flex-col border-t border-border/30">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-muted-foreground/70">
              <ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
              Files
            </div>
            <GhostButton className="h-5 w-5 text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
            </GhostButton>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <div className="relative p-2">
          <div className="flex w-full items-center gap-2.5 rounded-xl border border-border/30 bg-card/40 px-2.5 py-2 text-left">
            <PixelAvatar size={32} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-foreground">Maya Lindqvist</span>
              <span className="block truncate text-[11px] text-muted-foreground/60">@mayalq</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
          </div>
        </div>
      </div>
    </aside>
  );
}
