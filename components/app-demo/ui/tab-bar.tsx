import { Plus, X } from "@keyline-icons/react";
import { cx, StatusDot, type DotStatus } from "./bits";

export interface Tab {
  id: string;
  title: string;
  status?: DotStatus | null;
  active?: boolean;
  fresh?: boolean;
}

/** chat-ui src/features/threads/tab-bar.tsx, macOS: at the window corner it makes room for the traffic lights. */
export function TabBar({ tabs, corner }: { tabs: Tab[]; corner?: boolean }) {
  return (
    <div className={cx("flex items-center shrink-0 h-10 pt-0.5 bg-background/80", corner && "pl-[76px]")}>
      <div className="flex min-w-0 items-center gap-1.5 px-2 py-1 overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cx(
              "group relative flex items-center gap-2 h-7 pl-3 pr-5 w-[150px] min-w-[56px] shrink overflow-hidden select-none rounded-md border",
              "transition-[background-color,border-color,color] duration-200",
              tab.fresh && "ad-tab-in",
              tab.active
                ? "bg-white/10 border-white/10 text-foreground shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]"
                : "bg-white/[0.04] border-transparent text-muted-foreground/50",
            )}
          >
            <StatusDot status={tab.status} />
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium leading-none">{tab.title}</span>
            {tab.active && (
              <span className="absolute right-1 top-1/2 -translate-y-1/2 shrink-0 h-5 w-5 rounded flex items-center justify-center text-muted-foreground/50">
                <X className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
        ))}
        <span className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/30">
          <Plus className="h-3 w-3" />
        </span>
      </div>
      <div className="flex-1 min-w-0 self-stretch" />
    </div>
  );
}
