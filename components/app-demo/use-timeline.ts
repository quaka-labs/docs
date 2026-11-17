"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { INITIAL, reduce, stateAt, type DemoState, type Step } from "./model";
import { END, STEPS, TOTAL } from "./script";

type Msg = { kind: "step"; step: Step } | { kind: "replace"; state: DemoState };

function reducer(state: DemoState, msg: Msg): DemoState {
  return msg.kind === "replace" ? msg.state : reduce(state, msg.step);
}

const looped = (): DemoState => ({ ...INITIAL, cursor: { ...INITIAL.cursor, jump: true, seq: 1 } });
/** Before it first plays, the window is already on the desktop: the demo peeks out of the hero at rest. */
const RESTING: DemoState = { ...INITIAL, hidden: false };

/**
 * Plays the script on one timer: each timeout applies every step that is due, then waits for the
 * next one, and the end loops back to the start. `playing` pauses it in place; `seek` jumps to any
 * time by replaying the steps up to it. With `still`, nothing plays and the finished thread shows.
 */
export function useTimeline(playing: boolean, still: boolean) {
  const [state, dispatch] = useReducer(reducer, RESTING);
  const clock = useRef({ base: 0, startedAt: 0, index: 0, timer: 0, running: false });

  const now = useCallback(() => {
    const c = clock.current;
    return c.running ? c.base + performance.now() - c.startedAt : c.base;
  }, []);

  const stop = useCallback(() => {
    const c = clock.current;
    if (!c.running) return;
    window.clearTimeout(c.timer);
    c.base = now();
    c.running = false;
  }, [now]);

  const start = useCallback(() => {
    const c = clock.current;
    if (c.running) return;
    c.running = true;
    c.startedAt = performance.now();
    const tick = () => {
      const t = now();
      while (c.index < STEPS.length && STEPS[c.index].at <= t) {
        dispatch({ kind: "step", step: STEPS[c.index] });
        c.index++;
      }
      if (c.index >= STEPS.length && t >= TOTAL) {
        dispatch({ kind: "replace", state: looped() });
        c.base = 0;
        c.startedAt = performance.now();
        c.index = 0;
      }
      const due = c.index < STEPS.length ? STEPS[c.index].at : TOTAL;
      c.timer = window.setTimeout(tick, Math.max(0, due - now()));
    };
    tick();
  }, [now]);

  const seek = useCallback(
    (t: number) => {
      const wasRunning = clock.current.running;
      stop();
      const c = clock.current;
      c.base = t;
      c.index = STEPS.findIndex((s) => s.at > t);
      if (c.index < 0) c.index = STEPS.length;
      dispatch({ kind: "replace", state: stateAt(STEPS, t) });
      if (wasRunning) start();
    },
    [start, stop],
  );

  useEffect(() => {
    if (still) {
      stop();
      // The finished afternoon: the pull request open beside the paused game.
      dispatch({ kind: "replace", state: stateAt(STEPS, END) });
      return;
    }
    if (playing) start();
    else stop();
    return stop;
  }, [playing, still, start, stop]);

  return { state, seek, now };
}
