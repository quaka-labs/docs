"use client";

import { useLayoutEffect, useRef } from "react";
import { CART_PATH, FILES, OPEN_TABS, PRICE_PATH, PROJECT, PR_NUMBER, SEED_THREADS, TEST_PATH } from "./data";
import { fullDiff } from "./diff";
import type { DemoState } from "./model";
import { BrowserPanel } from "./scene/browser";
import { cx } from "./ui/bits";
import { ChatHeader, PrStatus } from "./ui/chat-header";
import { Composer } from "./ui/composer";
import { DiffPanel } from "./ui/diff-panel";
import { Quaka } from "./ui/mascot";
import { PermissionCard } from "./ui/permission-card";
import { Sidebar, type SidebarThread } from "./ui/sidebar";
import { activity, EventStream, ModelBadge } from "./ui/stream";
import { TabBar, type Tab } from "./ui/tab-bar";
import { WriterLaunchCard, WritersPanel } from "./ui/writers";

const PATHS = [PRICE_PATH, CART_PATH, TEST_PATH];
const ALL_ROWS = Object.fromEntries(PATHS.map((p) => [p, fullDiff(FILES[p].before, FILES[p].after).length]));

/**
 * The thread's messages, kept scrolled to the newest as the app does. The scroll lands at once, so
 * the camera measures the content where it will stay.
 */
function Messages({ state }: { state: DemoState }) {
  const ref = useRef<HTMLDivElement>(null);
  const { events, running, sent, usage, prompt, popover, f2p, writers } = state;

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [events.length, prompt, running, popover, f2p, writers]);

  return (
    <div ref={ref} className="flex-1 min-h-0 overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-1">
        <div className="group flex flex-col items-end mt-4 mb-2 ad-enter ad-up-2">
          <div className="max-w-[85%] flex flex-col items-end gap-1.5 rounded-2xl">
            <div className="rounded-2xl rounded-br-sm bg-secondary px-4 py-3">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{sent}</div>
            </div>
          </div>
        </div>
        {events.length > 0 && (
          <div className="py-2">
            <EventStream events={events} shine={running} popover={popover} f2p={f2p} />
            {!running && events.some((e) => e.type === "done") && <ModelBadge usage={usage} />}
          </div>
        )}
        {running && <Quaka label={events.length === 0 ? "Quaka is thinking" : "Quaka is working"} />}
      </div>
    </div>
  );
}

/** Sidebar width (chat-ui sidebar-frame.tsx), and the curve it opens and closes on. */
const SIDEBAR_W = 256;
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/**
 * The Quaka app, drawn at `width` by `height` from one state. The browser crowds the sidebar out, as
 * useSidebarLayout does, and it comes back when the browser closes. macOS draws the traffic lights
 * over the window's corner; with the sidebar collapsed the tab bar makes room for them.
 */
export function QuakaApp({ state, width, height }: { state: DemoState; width: number; height: number }) {
  const collapsed = state.browser !== null;
  const started = state.sent !== null;

  const current: SidebarThread | null = started
    ? {
        id: "demo",
        title: state.title || "New thread",
        ago: "just now",
        project: PROJECT,
        status: state.status,
        active: true,
        activity: state.running ? activity(state.events) : null,
      }
    : null;

  const tabs: Tab[] = [
    ...OPEN_TABS.map((id) => {
      const seed = SEED_THREADS.find((s) => s.id === id)!;
      return { id, title: seed.title, status: seed.review ? ("review" as const) : null };
    }),
    { id: "demo", title: state.title || "New thread", status: state.status, active: true },
  ];

  return (
    <div className="app-demo relative flex overflow-hidden bg-background text-foreground" style={{ width, height }}>
      <div className={cx("relative h-full shrink-0 overflow-hidden transition-[width] duration-300", EASE)} style={{ width: collapsed ? 0 : SIDEBAR_W }}>
        <div className={cx("h-full transition-[transform,opacity] duration-300", EASE, collapsed ? "-translate-x-6 opacity-0" : "opacity-100")} style={{ width: SIDEBAR_W }}>
          <Sidebar current={current} workspace={PROJECT} inbox={state.status === "needs_you" ? 1 : 0} />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <TabBar tabs={tabs} corner={collapsed} />
        <div className="flex flex-1 min-h-0">
          <main
            className={cx(
              "relative flex flex-col mb-1.5 mr-1.5 rounded-xl border border-border/30 overflow-hidden bg-background flex-1 min-w-[320px]",
              collapsed && "ml-1.5",
            )}
          >
            <div className="ad-ambience absolute inset-0 pointer-events-none select-none" aria-hidden />
            <div className="relative z-[1] flex flex-col flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] mx-1.5 mb-1.5 overflow-hidden">
                <ChatHeader
                  title={state.title}
                  running={state.running}
                  project={PROJECT}
                  branch={state.branch}
                  pr={state.pr ? PR_NUMBER : null}
                  context={state.context}
                  collapsed={collapsed}
                />
                {state.pr && <PrStatus number={PR_NUMBER} state={state.pr} />}
                {started && <Messages state={state} />}
                {state.writers && <WritersPanel states={state.writers} />}
                {(state.prompt === "curl" || state.prompt === "pr") && <PermissionCard key={state.prompt} kind={state.prompt} hover={state.hover} />}
                {state.prompt === "writers" && <WriterLaunchCard hover={state.hover === "launch"} />}
                <Composer
                  draft={state.draft}
                  focused={state.focused}
                  typing={state.typing}
                  running={state.running}
                  centered={!started}
                  repo={PROJECT}
                  sendHover={state.hover === "send"}
                />
              </div>
            </div>
          </main>

          {state.browser ? (
            <div className="my-1.5 mr-1.5 min-w-[380px] shrink-0 grow-0 ad-enter" style={{ flexBasis: "45%" }}>
              <BrowserPanel page={state.browser} exposed={state.exposed} ledger={state.ledger} />
            </div>
          ) : (
            <div
              className="shrink-0 overflow-hidden transition-[width,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ width: state.changes ? 386 : 0, opacity: state.changes ? 1 : 0 }}
            >
              <div className="h-full w-[386px] pb-1.5 pr-1.5 pt-1.5">{state.changes && <DiffPanel paths={PATHS} reveal={ALL_ROWS} />}</div>
            </div>
          )}
        </div>
      </div>

      <span className="absolute left-[13px] top-[13px] z-[60] flex gap-2" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </span>
    </div>
  );
}
