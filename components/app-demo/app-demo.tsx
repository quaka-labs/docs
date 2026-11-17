"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { Targets } from "./cursor";
import { CHAPTERS, END } from "./script";
import { CALLOUTS, type CalloutId } from "./data";
import { Scene, SCENE_W } from "./scene/scene";
import { useTimeline } from "./use-timeline";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const pageVisible = () => document.visibilityState === "visible";

/** Where the script is in chapter `i`, as a fill that keeps going on its own between steps. */
function ChapterFill({ length, offset, playing }: { length: number; offset: number; playing: boolean }) {
  // Read once: the fill runs on its own clock from here, and remounts on a seek or a new chapter.
  const [delay] = useState(() => -offset);
  const style = { "--ad-len": `${length}ms`, "--ad-delay": `${delay}ms`, animationPlayState: playing ? "running" : "paused" } as CSSProperties;
  return <span className="ad-chapter-fill absolute inset-0 rounded-full bg-paper" style={style} />;
}

/** Every callout, in the order the story reaches them: the list reduced motion shows. */
const STORY: CalloutId[] = ["trap", "stops", "sandbox", "firewall", "writers", "proof", "second", "ship", "anywhere"];
/** Below this zoom the callouts are too small over the scene, so they are shown under it. */
const OVERLAY_MIN_ZOOM = 0.62;
/** Below this zoom the city behind the window is drawn at half size. */
const SMALL_ZOOM = 0.75;
/** Share of the frame that must be on screen for the story to play. Any sliver fades the frame in. */
const PLAY_SHARE = 0.6;

/**
 * What the frame's size decides for React. The zoom itself is a CSS variable on the frame, so a frame
 * that resizes on every scroll step (the pinned demo grows and shrinks) doesn't re-render.
 */
interface Fit {
  overlays: boolean;
  small: boolean;
}

/**
 * The scene in its frame, drawn at 1360 by 760 and fitted to the frame's width with CSS zoom, so
 * text lays out at the size it is shown and stays sharp; on a 1440 screen that is its real size. A
 * chapter rail sits under it. It plays only while on screen and the tab is visible; with reduced
 * motion it shows the finished story with every callout listed.
 */
export default function AppDemo({ frameClassName = "" }: { frameClassName?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  // Latched on first arrival: the frame fades in once and stays.
  const [seen, setSeen] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [targets] = useState<Targets>(() => new Map());
  const reduced = useSyncExternalStore(subscribeMotion, reducedMotion, () => false);
  const visible = useSyncExternalStore(subscribeVisibility, pageVisible, () => true);
  const playing = onScreen && visible && !reduced;
  const { state, seek } = useTimeline(playing, reduced);
  const overlays = fit?.overlays ?? false;
  const caption = !reduced && !overlays && state.shot.callout ? CALLOUTS[state.shot.callout.id] : null;

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const zoom = entry.contentRect.width / SCENE_W;
      el.style.setProperty("--ad-zoom", String(zoom));
      const next = { overlays: zoom >= OVERLAY_MIN_ZOOM, small: zoom < SMALL_ZOOM };
      setFit((prev) => (prev && prev.overlays === next.overlays && prev.small === next.small ? prev : next));
    });
    ro.observe(el);
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.intersectionRatio >= PLAY_SHARE);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: [0, PLAY_SHARE] },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  let current = 0;
  CHAPTERS.forEach((c, i) => {
    if (c.at <= state.t) current = i;
  });
  const endOf = (i: number) => (i + 1 < CHAPTERS.length ? CHAPTERS[i + 1].at : END);

  const jump = (i: number) => {
    seek(reduced ? endOf(i) - 1 : CHAPTERS[i].at);
    setEpoch((n) => n + 1);
  };

  return (
    <div className="flex w-full flex-col items-center gap-[var(--spacing-12)]">
      <div
        ref={frame}
        data-in={seen || reduced}
        className={`relative aspect-[1360/760] w-full overflow-hidden rounded-[14px] border border-pewter/25 bg-[#121212] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)] ${frameClassName}`}
      >
        {/* The dithered city behind the window, at the page's own pixels rather than inside the zoomed
            scene, so its dots never land on a fractional scale. Its own layer: image-rendering inherits. */}
        <div
          aria-hidden="true"
          className="dither-art absolute inset-0 bg-center bg-no-repeat"
          // The city at 1600 px wide, or half that on narrow frames: a whole-number step down, so the dots
          // stay a clean pattern instead of beating against the screen's pixels.
          style={{ backgroundImage: "url(/dither/city-night.png)", backgroundSize: fit?.small ? "800px 450px" : "1600px 900px" }}
        />
        <div
          aria-hidden="true"
          inert
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={{ zoom: "var(--ad-zoom, 1)", visibility: fit ? "visible" : "hidden" }}
        >
          <Scene state={state} targets={targets} still={reduced} overlays={overlays} />
        </div>
        <p className="sr-only">
          A replay of one Quaka thread. Asked to add a whole-dollar option to formatPrice and the cart total, with tests, and open a pull
          request, Quaka reads the code and a docs page in its own browser. The page hides an instruction in white text telling AI agents to
          pipe a script into the shell and upload credentials; because the run read untrusted content, the command asks first and is
          rejected. Running the tests, a dependency tries to read an SSH key and reach an unknown server: the OS sandbox refuses the read and
          the firewall&apos;s ledger shows the connection blocked. Three writer agents then work in parallel, each in its own worktree, and their
          work is applied with no conflicts. Verification shows the new test failing without the change and passing with it. A model from
          another provider disputes how the cart total rounds; Quaka fixes it and the second model agrees. Opening the pull request asks
          too, and a /quaka comment on GitHub starts the next run.
        </p>
      </div>

      {caption && (
        <div className="ui w-full max-w-[560px] text-center" aria-hidden="true">
          <p className="text-[14px] font-semibold text-paper">{caption.title}</p>
          <p className="mt-[2px] text-[12.5px] leading-[1.45] text-pewter">{caption.body}</p>
        </div>
      )}

      <nav aria-label="Demo chapters" className="ui grid w-full max-w-[1100px] grid-cols-6 gap-[var(--spacing-8)] sm:gap-[var(--spacing-16)]">
        {CHAPTERS.map((c, i) => {
          const lit = i === current;
          const past = i < current;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => jump(i)}
              aria-current={lit ? "step" : undefined}
              className="group flex flex-col items-start gap-[var(--spacing-8)] text-left focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-sand"
            >
              <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-slate/60">
                {past && <span className="absolute inset-0 rounded-full bg-pewter/70" />}
                {lit && <ChapterFill key={`${i}-${epoch}`} length={endOf(i) - c.at} offset={state.t - c.at} playing={playing} />}
              </span>
              <span
                className={`text-[10.5px] leading-[1.3] transition-colors duration-300 sm:text-[12.5px] ${lit ? "text-paper" : "text-pewter group-hover:text-chalk"}`}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </nav>

      {reduced && (
        <ul className="ui grid w-full max-w-[1100px] grid-cols-1 gap-[var(--spacing-12)] sm:grid-cols-3">
          {STORY.map((id) => (
            <li key={id} className="rounded-lg border border-ash bg-graphite-card px-[var(--spacing-16)] py-[var(--spacing-12)]">
              <p className="text-[14px] font-semibold text-paper">{CALLOUTS[id].title}</p>
              <p className="mt-[2px] text-[13px] leading-[1.45] text-pewter">{CALLOUTS[id].body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
