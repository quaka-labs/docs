"use client";

import { createContext, useContext, useLayoutEffect, useRef, type RefObject } from "react";
import type { CursorState, TargetName } from "./model";

/** Elements the pointer can travel to, by name; each component registers its own. */
export type Targets = Map<TargetName, HTMLElement>;

export const TargetsContext = createContext<Targets | null>(null);

/** A ref callback that records `el` as the pointer's target `name`. */
export function useTarget(name: TargetName) {
  const targets = useContext(TargetsContext);
  return (el: HTMLElement | null) => {
    if (!targets) return;
    if (el) targets.set(name, el);
    else targets.delete(name);
  };
}

/** An element's own `zoom` times every ancestor's below `root`: how many root pixels one of its pixels spans. */
export function zoomIn(el: HTMLElement, root: HTMLElement): number {
  let z = 1;
  for (let n: HTMLElement | null = el; n && n !== root; n = n.parentElement) z *= parseFloat(getComputedStyle(n).zoom) || 1;
  return z;
}

/**
 * Where `el` sits in the root's own coordinates. Layout offsets ignore the section's tilt, which a
 * bounding rect would include. Under CSS zoom each offset is in its element's own pixels, so it is
 * scaled by that element's zoom within the root (the windows zoom their contents).
 */
export function rootPoint(el: HTMLElement, root: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    const z = zoomIn(node, root);
    x += node.offsetLeft * z;
    y += node.offsetTop * z;
    const parent = node.offsetParent as HTMLElement | null;
    for (let s: HTMLElement | null = node.parentElement; s && s !== parent; s = s.parentElement) {
      const zs = zoomIn(s, root);
      x -= s.scrollLeft * zs;
      y -= s.scrollTop * zs;
    }
    if (parent && parent !== root) {
      const zp = zoomIn(parent, root);
      x -= parent.scrollLeft * zp;
      y -= parent.scrollTop * zp;
    }
    node = parent;
  }
  return { x, y };
}

/** A target's box in the coordinates of `root` (the camera's content, before the camera's zoom). */
export function rectOf(el: HTMLElement, root: HTMLElement): { x: number; y: number; w: number; h: number } {
  const p = rootPoint(el, root);
  const z = zoomIn(el, root);
  return { x: p.x, y: p.y, w: el.offsetWidth * z, h: el.offsetHeight * z };
}

/** The camera at rest: content offset by (ox, oy) in scene pixels and zoomed by s. */
export interface Camera {
  ox: number;
  oy: number;
  s: number;
}
export const NO_CAMERA: Camera = { ox: 0, oy: 0, s: 1 };

/** Where on a target the pointer lands: a text field near its start, a button at its centre. */
function aim(name: TargetName, el: HTMLElement, root: HTMLElement) {
  const r = rectOf(el, root);
  if (name === "composer") return { x: r.x + 56, y: r.y + r.h / 2 };
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

/** Moves the pointer element to a point over `ms`; at 0 it lands at once. */
export function placePointer(el: HTMLElement | null, x: number, y: number, ms = 0) {
  if (!el) return;
  el.style.transitionDuration = `${ms}ms`;
  el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

/**
 * A macOS-style arrow pointer that glides between targets and rings on each click. Targets are
 * measured inside the camera's content and carried through the camera, so a click lands where the
 * camera is going to be.
 */
export function Cursor({
  cursor,
  targets,
  content,
  camera,
}: {
  cursor: CursorState;
  targets: Targets;
  content: RefObject<HTMLDivElement | null>;
  camera: Camera;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const root = content.current;
    if (!el || !root) return;
    const { target } = cursor;
    let point: { x: number; y: number } | null = null;
    if (typeof target === "object") point = target;
    else {
      const node = targets.get(target);
      if (node) {
        const p = aim(target, node, root);
        point = { x: camera.ox + p.x * camera.s, y: camera.oy + p.y * camera.s };
      }
    }
    if (!point) return;
    placePointer(el, point.x, point.y, cursor.jump ? 0 : cursor.dur);
  }, [cursor, targets, content, camera]);

  return (
    <div ref={ref} className="ad-cursor">
      {cursor.click > 0 && <span key={cursor.click} className="ad-ripple" />}
      <svg
        key={`p${cursor.click}`}
        className={cursor.click > 0 ? "ad-press" : undefined}
        width="22"
        height="28"
        viewBox="0 0 22 28"
        style={{ transformOrigin: "2px 2px", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.45)) drop-shadow(0 0 1px rgba(0,0,0,0.6))", marginLeft: -2, marginTop: -2 }}
        aria-hidden
      >
        <path d="M2 2 L2 22.5 L7.2 17.6 L10.6 25.4 L14 23.9 L10.7 16.3 L17.6 16.3 Z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
