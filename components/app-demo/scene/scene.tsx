"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Cursor, NO_CAMERA, rectOf, TargetsContext, useTarget, type Camera, type Targets } from "../cursor";
import { CALLOUTS, type CalloutId } from "../data";
import type { DemoState } from "../model";
import { QuakaApp } from "../quaka-app";
import { cx } from "../ui/bits";
import Thread, { SelfMention } from "../../github-thread";

export const SCENE_W = 1360;
export const SCENE_H = 760;

/** The Quaka window: the scene, less a thin margin of the dithered city around it. */
const WINDOW = { x: 14, y: 14, w: SCENE_W - 28, h: SCENE_H - 28 };
/** Room kept beside the framed UI for a callout, in scene pixels. */
const BAND = 380;
const CALLOUT_W = 340;
const MOVE_MS = 750;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Placed {
  id: CalloutId;
  key: number;
  box: { x: number; y: number };
  /** The leader line, from the box's edge to the anchor. */
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const union = (rs: Rect[]): Rect => {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
};
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/**
 * The camera for a focus region: as large as fits beside the callout band, up to `max`, with the
 * region centred in the room left and the content never pulled off the scene's edges. The band goes
 * on whichever side needs the content moved least past those edges.
 */
function frame(region: Rect, callout: boolean, max: number): Camera {
  const pad = 20;
  const band = callout ? BAND : 0;
  const s = clamp(Math.min((SCENE_W - band - 2 * pad) / (region.w + 2 * pad), (SCENE_H - 2 * pad) / (region.h + 2 * pad), max), 1, max);
  const oy = clamp(SCENE_H / 2 - (region.y + region.h / 2) * s, SCENE_H - SCENE_H * s, 0);
  const options = [(SCENE_W - band) / 2, band + (SCENE_W - band) / 2].map((cx) => {
    const want = cx - (region.x + region.w / 2) * s;
    const ox = clamp(want, SCENE_W - SCENE_W * s, 0);
    return { ox, miss: Math.abs(ox - want) };
  });
  const best = options[0].miss <= options[1].miss ? options[0] : options[1];
  return { ox: best.ox, oy, s };
}

const BOX_H = 120;

/**
 * Where a callout sits for an anchor already carried through the camera: beside it on the side with
 * room, or above or below it when neither side has room, never over the anchor itself.
 */
function place(id: CalloutId, key: number, a: Rect): Placed {
  const gap = 44;
  const right = SCENE_W - (a.x + a.w) - gap - 16;
  const left = a.x - gap - 16;
  const cy = a.y + a.h / 2;
  if (Math.max(left, right) >= CALLOUT_W) {
    const onLeft = left >= right;
    const x = onLeft ? a.x - gap - CALLOUT_W : a.x + a.w + gap;
    const y = clamp(cy - 50, 16, SCENE_H - BOX_H - 40);
    return {
      id,
      key,
      box: { x, y },
      from: { x: onLeft ? x + CALLOUT_W : x, y: y + 32 },
      to: { x: onLeft ? a.x - 4 : a.x + a.w + 4, y: clamp(cy, a.y, a.y + a.h) },
    };
  }
  const above = a.y - 16 - 28 >= BOX_H;
  const x = clamp(a.x + 24, 16, SCENE_W - CALLOUT_W - 16);
  const y = above ? a.y - 28 - BOX_H : Math.min(a.y + a.h + 28, SCENE_H - BOX_H - 16);
  const lx = clamp(x + 40, a.x + 8, a.x + a.w - 8);
  return { id, key, box: { x, y }, from: { x: lx, y: above ? y + BOX_H - 6 : y + 6 }, to: { x: lx, y: above ? a.y - 4 : a.y + a.h + 4 } };
}

/** A bold line and one sentence, joined to the UI it is about by a thin leader line. */
function CalloutCard({ placed }: { placed: Placed }) {
  const c = CALLOUTS[placed.id];
  return (
    <div key={placed.key} className="pointer-events-none absolute inset-0 z-40 ad-callout">
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <line x1={placed.from.x} y1={placed.from.y} x2={placed.to.x} y2={placed.to.y} stroke="#ededed" strokeWidth="1.25" />
        <circle cx={placed.to.x} cy={placed.to.y} r="4" fill="#ededed" />
        <circle cx={placed.to.x} cy={placed.to.y} r="9" fill="none" stroke="#ededed" strokeOpacity="0.45" />
      </svg>
      <div
        className="absolute rounded-xl bg-[#f2f2f0] px-4 py-3 text-[#141414] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        style={{ left: placed.box.x, top: placed.box.y, width: CALLOUT_W }}
      >
        <p className="text-[18px] font-semibold leading-snug tracking-[-0.015em]">{c.title}</p>
        <p className="mt-1 text-[14.5px] leading-[1.45] text-[#3c3c3c]">{c.body}</p>
      </div>
    </div>
  );
}

/** The pull request's conversation on GitHub: a /quaka command, and the reply Quaka posts as you (command/reply.rs). */
function GithubThread({ step }: { step: 1 | 2 }) {
  const ref = useTarget("github");
  return (
    <div ref={ref} className="absolute bottom-[34px] left-[30px] z-30 w-[400px] space-y-2.5 rounded-2xl border border-white/10 bg-[#0b0c10]/95 p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ad-enter ad-up-4">
      <div className="flex items-center gap-2 px-0.5 text-[12px] text-white/60">
        <svg className="h-4 w-4 text-white/80" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
        </svg>
        <span className="font-mono">maya/quaka-pr-test #3</span>
      </div>
      <Thread
        width={372}
        comments={[
          { time: "now", body: <span className="font-mono text-[12.5px]">/quaka fix the rounding for negative numbers</span> },
          ...(step === 2
            ? [
                {
                  time: "now",
                  className: "ad-enter ad-up-2",
                  body: (
                    <>
                      <SelfMention /> Starting a Quaka run on this pull request.
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}

interface SceneProps {
  state: DemoState;
  targets: Targets;
  /** Reduced motion: no camera, no pointer, no callouts over the scene. */
  still: boolean;
  /** Callouts are drawn over the scene; on small frames they are shown under it instead. */
  overlays: boolean;
}

/**
 * The scene at its design size, 1360 by 760: one Quaka window over the frame's dithered city, a
 * camera that frames each beat, and callouts that name what it shows. At rest the camera is a CSS
 * zoom and an offset, so text is laid out at the size it is seen; it uses a transform only while
 * it moves.
 */
export function Scene({ state, targets, still, overlays }: SceneProps) {
  const layer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Camera>(NO_CAMERA);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const previous = useRef<Camera>(NO_CAMERA);
  const { shot } = state;

  // A new shot: work out where the camera goes and where its callout sits. Measured again once
  // panels that opened in the same moment (a chapter jump) have finished sliding in.
  const [settle, setSettle] = useState(0);
  useLayoutEffect(() => {
    const timer = window.setTimeout(() => setSettle((n) => n + 1), 560);
    return () => window.clearTimeout(timer);
  }, [shot.seq]);
  useLayoutEffect(() => {
    const root = content.current;
    if (!root) return;
    const rect = (n: string) => {
      const el = targets.get(n as never);
      return el ? rectOf(el, root) : null;
    };
    const focus = still ? [] : shot.focus.map(rect).filter((r): r is Rect => r !== null);
    const next = focus.length ? frame(union(focus), !!shot.callout && overlays, shot.max) : NO_CAMERA;
    setCamera((cur) => (Math.abs(cur.ox - next.ox) < 1 && Math.abs(cur.oy - next.oy) < 1 && Math.abs(cur.s - next.s) < 0.002 ? cur : next));
    const anchor = shot.callout && !still ? rect(shot.callout.anchor) : null;
    setPlaced(
      anchor && shot.callout
        ? place(shot.callout.id, shot.seq, { x: next.ox + anchor.x * next.s, y: next.oy + anchor.y * next.s, w: anchor.w * next.s, h: anchor.h * next.s })
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a shot is measured when it starts and once more when it settles
  }, [shot.seq, settle, still, overlays]);

  // The move itself: the layer is already where it ends, so start it where it was and let it settle.
  useLayoutEffect(() => {
    const el = layer.current;
    const from = previous.current;
    previous.current = camera;
    if (!el || (from.ox === camera.ox && from.oy === camera.oy && from.s === camera.s)) return;
    el.style.transition = "none";
    el.style.transform = `translate(${from.ox - camera.ox}px, ${from.oy - camera.oy}px) scale(${from.s / camera.s})`;
    void el.offsetWidth;
    el.style.transition = `transform ${MOVE_MS}ms cubic-bezier(0.45, 0, 0.2, 1)`;
    el.style.transform = "none";
  }, [camera]);

  return (
    <TargetsContext.Provider value={targets}>
      <div className="app-demo relative overflow-hidden text-white" style={{ width: SCENE_W, height: SCENE_H }}>
        <div className={cx("absolute inset-0 transition-opacity duration-700", state.hidden ? "opacity-0" : "opacity-100")}>
          <div ref={layer} className="absolute origin-top-left" style={{ left: camera.ox, top: camera.oy, width: SCENE_W, height: SCENE_H }}>
            <div ref={content} className="relative" style={{ zoom: camera.s, width: SCENE_W, height: SCENE_H }}>
              <div
                className="absolute overflow-hidden rounded-[12px] ring-1 ring-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.55),0_6px_18px_rgba(0,0,0,0.35)]"
                style={{ left: WINDOW.x, top: WINDOW.y, width: WINDOW.w, height: WINDOW.h }}
              >
                <QuakaApp state={state} width={WINDOW.w} height={WINDOW.h} />
              </div>
              {state.github > 0 && <GithubThread step={state.github as 1 | 2} />}
            </div>
          </div>
          {overlays && placed && <CalloutCard placed={placed} />}
        </div>
        {!still && (
          <div className={cx("absolute inset-0 z-50 transition-opacity duration-700", state.hidden && "opacity-0")}>
            <Cursor cursor={state.cursor} targets={targets} content={content} camera={camera} />
          </div>
        )}
      </div>
    </TargetsContext.Provider>
  );
}
