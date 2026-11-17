import { ShinyText } from "./bits";

/** chat-ui src/features/chat/agent-orb.tsx */
export function AgentOrb({ active }: { active: boolean }) {
  return (
    <div className="relative h-5 w-5 shrink-0">
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <rect
          x="8"
          y="8"
          width="24"
          height="24"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          stroke={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.25)"}
          className="transition-[stroke] duration-500"
        >
          <animate attributeName="rx" values={active ? "12;6;12" : "12;12;12"} dur="3s" repeatCount="indefinite" />
          <animate attributeName="ry" values={active ? "12;6;12" : "12;12;12"} dur="3s" repeatCount="indefinite" />
          {active && <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="90 20 20" dur="6s" repeatCount="indefinite" />}
        </rect>
        <rect
          x="13"
          y="13"
          width="14"
          height="14"
          fill="none"
          strokeWidth="1.2"
          strokeLinecap="round"
          stroke={active ? "hsl(var(--primary) / 0.5)" : "hsl(var(--muted-foreground) / 0.12)"}
          className="transition-[stroke] duration-500"
        >
          <animate attributeName="rx" values={active ? "7;3;7" : "7;7;7"} dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="ry" values={active ? "3;7;3" : "7;7;7"} dur="2.5s" repeatCount="indefinite" />
          {active && (
            <animateTransform attributeName="transform" type="rotate" from="45 20 20" to="-45 20 20" dur="4s" repeatCount="indefinite" additive="sum" />
          )}
        </rect>
        <circle cx="20" cy="20" r="2.5" fill={active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)"} className="transition-[fill] duration-500">
          {active && <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />}
          {active && <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
        </circle>
      </svg>
    </div>
  );
}

const PALETTE: Record<string, string> = {
  o: "#3b2416",
  b: "#c9955f",
  d: "#a3743f",
  l: "#f1dcb8",
  p: "#f39ab0",
  e: "#1a1210",
  w: "#ffffff",
  n: "#2b1a12",
};

const EARS = ["...ooo......ooo...", "..obbbo....obbbo..", "..obppbo..obppbo..", "..obbbb....bbbbo.."];
const FACE = [
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

function Pixels({ rows, y0 = 0 }: { rows: string[]; y0?: number }) {
  return (
    <>
      {rows.flatMap((row, y) =>
        [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y0 + y} width="1" height="1" fill={PALETTE[c]} />)),
      )}
    </>
  );
}

/** The app's src/features/chat/quaka.tsx: the pixel Quaka that hops while a run works. */
export function Quaka({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 select-none">
      <svg viewBox="0 0 20 19" className="h-10 w-10 overflow-visible" shapeRendering="crispEdges" aria-hidden>
        <g className="animate-[quaka-tail_1.4s_ease-in-out_infinite]" style={{ transformOrigin: "17px 17px" }}>
          <rect x="17" y="16" width="1" height="1" fill={PALETTE.o} />
          <rect x="18" y="15" width="1" height="1" fill={PALETTE.o} />
          <rect x="18" y="14" width="1" height="1" fill={PALETTE.b} />
          <rect x="17" y="17" width="1" height="1" fill={PALETTE.b} />
        </g>
        <g className="animate-[quaka-hop_1.4s_cubic-bezier(0.45,0,0.2,1)_infinite]" style={{ transformOrigin: "9px 19px" }}>
          <Pixels rows={BODY} y0={15} />
          <g className="animate-[quaka-nod_1.4s_cubic-bezier(0.45,0,0.2,1)_infinite]" style={{ transformOrigin: "9px 14px" }}>
            <g className="animate-[quaka-ear_2.8s_ease-in-out_infinite]" style={{ transformOrigin: "4px 4px" }}>
              <Pixels rows={EARS.map((r) => r.slice(0, 9).padEnd(18, "."))} />
            </g>
            <g className="animate-[quaka-ear_2.8s_ease-in-out_infinite_reverse]" style={{ transformOrigin: "14px 4px", animationDelay: "0.4s" }}>
              <Pixels rows={EARS.map((r) => ".".repeat(9) + r.slice(9))} />
            </g>
            <Pixels rows={FACE} y0={4} />
            <g className="animate-[quaka-blink_3.6s_steps(1)_infinite]" style={{ opacity: 0 }}>
              <rect x="4" y="7" width="3" height="2" fill={PALETTE.b} />
              <rect x="12" y="7" width="3" height="2" fill={PALETTE.b} />
              <rect x="4" y="8" width="3" height="1" fill={PALETTE.o} />
              <rect x="12" y="8" width="3" height="1" fill={PALETTE.o} />
            </g>
          </g>
        </g>
      </svg>
      <ShinyText text={label} speed={1.8} color="hsl(var(--muted-foreground) / 0.45)" shine="hsl(var(--foreground) / 0.8)" className="text-[12px]" />
    </div>
  );
}
