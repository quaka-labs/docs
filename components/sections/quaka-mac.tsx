"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Wifi } from "lucide-react";
import { OPEN_TABS, PROJECT, SEED_THREADS } from "../app-demo/data";
import { Sidebar } from "../app-demo/ui/sidebar";
import { TabBar } from "../app-demo/ui/tab-bar";
import { EARS, FACE } from "../pixel-quaka";

/**
 * Everything is drawn at a design size and fitted to the stage's width with CSS zoom, so text lays
 * out at the size it is shown. The stage ends at CUT: the laptop runs on past it, cut off like a
 * photo cropped at the desk.
 */
const STAGE_W = 1200;
const CUT = 580;
const LID = { x: 64, y: 20, w: 1072 };
/** The aluminium rim plus the black bezel. */
const BEZEL = 18;
const SCREEN = { x: LID.x + BEZEL, y: LID.y + BEZEL, w: LID.w - 2 * BEZEL };
const MENU_H = 34;
const NOTCH_W = 190;
const WINDOW = { w: 880, h: 660, top: SCREEN.y + MENU_H + 34 };

const MENUS = ["File", "Edit", "View", "Window", "Help"];

/** The mascot's head as a one-colour menu-bar glyph, where macOS puts its own menu: eyes and nose cut out. */
function QuakaGlyph() {
  const rows = [...EARS, ...FACE];
  const runs: ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const solid = !".ewn".includes(row[x]);
      let end = x + 1;
      while (end < row.length && !".ewn".includes(row[end]) === solid) end++;
      if (solid) runs.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height="1" />);
      x = end;
    }
  });
  return (
    <svg viewBox={`0 0 18 ${rows.length}`} shapeRendering="crispEdges" fill="currentColor" className="h-[18px] w-auto" aria-hidden>
      {runs}
    </svg>
  );
}

function Battery() {
  return (
    <svg viewBox="0 0 27 13" className="h-[13px] w-auto" aria-hidden>
      <rect x="0.75" y="0.75" width="22.5" height="11.5" rx="3.4" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
      <rect x="2.6" y="2.6" width="15.5" height="7.8" rx="1.8" fill="currentColor" />
      <path d="M25 4.6v3.8" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Controls() {
  return (
    <svg viewBox="0 0 16 14" className="h-[14px] w-auto" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="0.65" y="0.65" width="14.7" height="5.2" rx="2.6" />
      <circle cx="4" cy="3.25" r="1.5" fill="currentColor" stroke="none" />
      <rect x="0.65" y="8.15" width="14.7" height="5.2" rx="2.6" />
      <circle cx="12" cy="10.75" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
}
const thisMinute = () => Math.floor(Date.now() / 60_000);
const noMinute = () => 0;

/** The visitor's own day and time, as their menu bar would show it. Empty until the page is in the browser. */
function Clock() {
  const minute = useSyncExternalStore(subscribeMinute, thisMinute, noMinute);
  if (!minute) return null;
  const d = new Date(minute * 60_000);
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return <span className="tabular-nums">{`${day} ${d.getDate()} ${month} ${time}`}</span>;
}

function MenuBar() {
  return (
    <div
      aria-hidden
      className="mac-menubar ui absolute flex items-center justify-between px-[22px] text-[14px] text-white/90"
      style={{ left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: MENU_H }}
    >
      <div className="flex items-center gap-[21px]">
        <QuakaGlyph />
        <span className="font-semibold">Quaka</span>
        {MENUS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="flex items-center gap-[18px]">
        <Battery />
        <Wifi className="h-[16px] w-[16px]" strokeWidth={2.4} aria-hidden />
        <Controls />
        <Clock />
      </div>
    </div>
  );
}

/** The Quaka window with a view open in it: sidebar, tabs, and the view in the main panel (QuakaApp's frame). */
function QuakaWindow({ children }: { children: ReactNode }) {
  const tabs = OPEN_TABS.map((id) => {
    const seed = SEED_THREADS.find((s) => s.id === id)!;
    return { id, title: seed.title, status: seed.review ? ("review" as const) : null };
  });
  return (
    <div
      className="app-demo absolute flex overflow-hidden rounded-[12px] bg-background text-foreground ring-1 ring-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.55),0_6px_18px_rgba(0,0,0,0.35)]"
      style={{ left: SCREEN.x + (SCREEN.w - WINDOW.w) / 2, top: WINDOW.top, width: WINDOW.w, height: WINDOW.h }}
    >
      <div aria-hidden className="h-full shrink-0">
        <Sidebar current={null} workspace={PROJECT} inbox={3} inboxOpen />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div aria-hidden>
          <TabBar tabs={tabs} />
        </div>
        <main className="relative mb-1.5 mr-1.5 flex flex-1 flex-col overflow-hidden rounded-xl border border-border/30 bg-background">
          <div className="ad-ambience pointer-events-none absolute inset-0 select-none" aria-hidden />
          <div className="relative z-[1] mx-1.5 mb-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-foreground/[0.06] bg-foreground/[0.03]">
            {children}
          </div>
        </main>
      </div>
      <span className="absolute left-[13px] top-[13px] z-[60] flex gap-2" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </span>
    </div>
  );
}

/** The desktop picture's size at a zoom: whole-number steps of the file, so its dots stay a clean pattern. */
const wallpaperSize = (zoom: number) => (zoom >= 0.6 ? "1200px 640px" : "600px 320px");

/**
 * A MacBook running Quaka, the top of it only, like a photo cropped at the desk: the lid, the notch
 * and the menu bar, a desktop picture in the logo's dusk, and the Quaka window with `children`
 * open in it. The desktop picture is drawn at the page's own pixels, outside the zoomed layers, so
 * its dither never lands on a fractional scale.
 */
export default function QuakaMac({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setZoom(entry.contentRect.width / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const z = zoom ?? 1;
  const layer = { zoom: z, width: STAGE_W, height: CUT, visibility: zoom ? ("visible" as const) : ("hidden" as const) };

  return (
    <div ref={stage} className="mac-stage relative w-full overflow-hidden" style={{ aspectRatio: `${STAGE_W} / ${CUT}` }}>
      <div aria-hidden className="pointer-events-none absolute left-0 top-0" style={layer}>
        <div className="mac-lid absolute" style={{ left: LID.x, top: LID.y, width: LID.w, height: CUT }} />
      </div>
      <div
        aria-hidden
        className="dither-art absolute bg-no-repeat"
        style={{
          left: SCREEN.x * z,
          top: SCREEN.y * z,
          width: SCREEN.w * z,
          height: (CUT - SCREEN.y) * z,
          borderRadius: `${22 * z}px ${22 * z}px 0 0`,
          backgroundColor: "#1b1233",
          backgroundImage: "url(/dither/desktop.png)",
          backgroundSize: wallpaperSize(z),
          backgroundPosition: "50% 0",
          visibility: layer.visibility,
        }}
      />
      <div className="absolute left-0 top-0" style={layer}>
        <MenuBar />
        <div
          aria-hidden
          className="mac-notch absolute"
          style={{ left: SCREEN.x + (SCREEN.w - NOTCH_W) / 2, top: SCREEN.y, width: NOTCH_W, height: MENU_H }}
        />
        <QuakaWindow>{children}</QuakaWindow>
      </div>
    </div>
  );
}
