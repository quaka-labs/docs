import type { CSSProperties, ReactNode } from "react";

/**
 * Quaka, the app's pixel mascot (src/features/chat/quaka.tsx in the app), drawn large in new poses.
 * Same 18-wide grid, palette and character; the poses around it (laptop, invite, asleep) are new.
 * Each art pixel is `--px` css pixels, set to a whole number so it stays sharp, and every motion
 * moves in whole art pixels (steps) for the same reason. See quaka.css for the keyframes.
 */

const PALETTE: Record<string, string> = {
  o: "#3b2416", // outline
  b: "#c9955f", // fur
  d: "#a3743f", // fur shadow
  l: "#f1dcb8", // muzzle and belly
  p: "#f39ab0", // cheeks and inner ear
  e: "#1a1210", // eyes
  w: "#ffffff", // eye shine
  n: "#2b1a12", // nose and mouth
  h: "#e2b27a", // fur lit by a screen
  L: "#fff1d8", // muzzle lit by a screen
  k: "#24252f", // laptop edge
  g: "#5d6176", // laptop lid
  G: "#8a8fa6", // lid highlight
  D: "#c6cbe0", // laptop deck
  c: "#f48a5a", // coral: sticker, seal, sleep light
  v: "#f3ece0", // envelope paper
  f: "#cbbfae", // envelope fold
  z: "#c9b8ff", // sleep letters
  s: "#fff6e0", // sparkle
};

export const EARS = ["...ooo......ooo...", "..obbbo....obbbo..", "..obppbo..obppbo..", "..obbbb....bbbbo.."];
const EARS_L = EARS.map((r) => r.slice(0, 9));
const EARS_R = EARS.map((r) => r.slice(9));
export const FACE = [
  "..obbbbbbbbbbbbo..",
  ".obbbbbbbbbbbbbbo.",
  ".obbbbbbbbbbbbbbo.",
  ".obbweebbbbbweebo.",
  ".obbeeebbbbbeeebo.",
  ".obpbbbllllllbbpbo",
  "..obbbllnnllllbbo.",
  "..obbnllllllllnbo.",
  "..obbbnllllllnbbo.",
  "...obbbnnnnnnbbo..",
  "....obbbbbbbbbo...",
];
const BODY = ["...obbbbbbbbbbbo..", "..obbbllllllllbbbo", "..obbblllllllldbbo", "..oobdoooooooodboo"];
/** Eyes shut: the eye rows as fur with a short dark line. */
const ASLEEP_EYES = [".obbbbbbbbbbbbbbo.", ".obbeeebbbbbeeebo."];
/** The app's blink: lids over both eyes for a moment. */
const BLINK = ["....bbb.....bbb...", "....ooo.....ooo..."];

/** One <rect> per run of a colour in a row, so a sprite is a few dozen nodes, not hundreds. */
function Pixels({ rows, x0 = 0, y0 = 0, recolor }: { rows: string[]; x0?: number; y0?: number; recolor?: Record<string, string> }) {
  const out: ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== ".") {
        const key = recolor?.[ch] ?? ch;
        out.push(<rect key={`${x}-${y}`} x={x0 + x} y={y0 + y} width={end - x} height="1" fill={PALETTE[key]} />);
      }
      x = end;
    }
  });
  return <>{out}</>;
}

function Sprite({ cols, rows, label, className = "", children, style }: { cols: number; rows: number; label?: string; className?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      className={`pixel-sprite ${className}`}
      style={{ "--cols": cols, "--rows": rows, ...style } as CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** Head: ears that twitch on their own beat, the face, and the blink. */
function Head({ x0, eyes = "open", lit = false }: { x0: number; eyes?: "open" | "shut"; lit?: boolean }) {
  const face = eyes === "shut" ? FACE.map((r, i) => (i === 3 ? ASLEEP_EYES[0] : i === 4 ? ASLEEP_EYES[1] : r)) : FACE;
  return (
    <g className="qk-nod">
      <g className="qk-ear-l">
        <Pixels rows={EARS_L} x0={x0} />
      </g>
      <g className="qk-ear-r">
        <Pixels rows={EARS_R} x0={x0 + 9} />
      </g>
      <Pixels rows={face} x0={x0} y0={4} />
      {lit && (
        // The laptop's light on the lower face, flickering a little as the screen changes.
        <g className="qk-glow">
          <Pixels rows={face.slice(8, 11)} x0={x0} y0={12} recolor={{ b: "h", l: "L" }} />
        </g>
      )}
      {eyes === "open" && (
        <g className="qk-blink">
          <Pixels rows={BLINK} x0={x0} y0={7} />
        </g>
      )}
    </g>
  );
}

const LAPTOP_LID = (() => {
  const rows = [".." + "k".repeat(22) + "..", "..k" + "G".repeat(20) + "k.."];
  for (let i = 0; i < 4; i++) rows.push("..k" + "g".repeat(20) + "k..");
  rows.push(".." + "k".repeat(22) + "..");
  return rows;
})();
const LID_Q = [".ccc.", "c...c", "c...c", "c..cc", ".cccc"];
const LAPTOP_DECK = ["D".repeat(26), "." + "k".repeat(24) + "."];

/** Typing: single pixels of work drift up from the corners of the screen, beside Quaka's face. */
const SPARKS: { x: number; color: string; delay: number }[] = [
  { x: 3, color: "c", delay: 0 },
  { x: 22, color: "z", delay: 0.6 },
  { x: 2, color: "s", delay: 1.2 },
  { x: 23, color: "c", delay: 1.8 },
];

/** Hero: Quaka behind its laptop, the screen lighting its face, work drifting up off the screen. */
export function QuakaAtLaptop({ className = "", label }: { className?: string; label?: string }) {
  return (
    <Sprite cols={26} rows={24} className={className} label={label}>
      <g className="qk-sparks">
        {SPARKS.map((s) => (
          <rect key={s.x} x={s.x} y={15} width="1" height="1" fill={PALETTE[s.color]} className="qk-spark" style={{ animationDelay: `${s.delay}s` }} />
        ))}
      </g>
      <Pixels rows={BODY} x0={4} y0={15} />
      <Head x0={4} lit />
      <Pixels rows={LAPTOP_LID} y0={15} />
      <Pixels rows={LID_Q} x0={11} y0={16} />
      <Pixels rows={LAPTOP_DECK} y0={22} />
    </Sprite>
  );
}

const ENVELOPE = [
  "oooooooooooooo",
  "ofvvvvvvvvvvfo",
  "ovfvvvvvvvvfvo",
  "ovvfvvvvvvfvvo",
  "ovvvffccffvvvo",
  "ovvvvvccvvvvvo",
  "ovvvvvvvvvvvvo",
  "oooooooooooooo",
];
const TAIL_A = ["o..", "ob.", ".bo", "..o"];
const TAIL_B = [".o.", ".bo", ".bo", "..o"];

/** Just the head, ears twitching and blinking: Quaka's avatar where it speaks in a thread. */
export function QuakaFace({ className = "", label }: { className?: string; label?: string }) {
  return (
    <Sprite cols={18} rows={EARS.length + FACE.length} className={className} label={label}>
      <Head x0={0} />
    </Sprite>
  );
}

/** Invite: Quaka holding up an invitation, bobbing a little, with a glint on the envelope. */
export function QuakaWithInvite({ className = "", label }: { className?: string; label?: string }) {
  return (
    <Sprite cols={23} rows={22} className={className} label={label}>
      <g className="qk-tail-a">
        <Pixels rows={TAIL_A} x0={19} y0={17} />
      </g>
      <g className="qk-tail-b">
        <Pixels rows={TAIL_B} x0={19} y0={17} />
      </g>
      <g className="qk-bob">
        <Pixels rows={BODY} x0={2} y0={15} />
        <Head x0={2} />
        <Pixels rows={ENVELOPE} x0={4} y0={14} />
        <Pixels rows={["obbo", "obbo"]} x0={2} y0={15} />
        <Pixels rows={["obbo", "obbo"]} x0={16} y0={15} />
        <g className="qk-glint">
          <Pixels rows={[".s.", "sss", ".s."]} x0={0} y0={10} />
        </g>
      </g>
    </Sprite>
  );
}

const CLOSED_LAPTOP = ["." + "k".repeat(24) + ".", "k" + "G".repeat(24) + "k", "k" + "g".repeat(24) + "k", "." + "k".repeat(24) + "."];
const Z_BIG = ["zzzzz", "...z.", "..z..", ".z...", "zzzzz"];
const Z_SMALL = ["zzzz", "..z.", ".z..", "zzzz"];

/** Footer: the day is done; Quaka asleep on its closed laptop, the sleep light breathing. */
export function QuakaAsleep({ className = "", label }: { className?: string; label?: string }) {
  return (
    <Sprite cols={26} rows={29} className={className} label={label}>
      <g className="qk-z" style={{ animationDelay: "0s" }}>
        <Pixels rows={Z_SMALL} x0={16} y0={7} />
      </g>
      <g className="qk-z" style={{ animationDelay: "1.6s" }}>
        <Pixels rows={Z_BIG} x0={21} y0={0} />
      </g>
      <g className="qk-tail-a">
        <Pixels rows={TAIL_A} x0={20} y0={20} />
      </g>
      <g className="qk-breathe">
        <Pixels rows={BODY} x0={4} y0={21} />
        <g transform="translate(0 6)">
          <Head x0={4} eyes="shut" />
        </g>
      </g>
      <Pixels rows={CLOSED_LAPTOP} y0={25} />
      <rect x="21" y="27" width="2" height="1" fill={PALETTE.c} className="qk-led" />
    </Sprite>
  );
}
