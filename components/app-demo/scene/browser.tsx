import { ArrowLeft, ArrowUpRight, Fullscreen, Globe, GripVertical, MoreHorizontal, X } from "@keyline-icons/react";
import type { ReactNode } from "react";
import { useTarget } from "../cursor";
import { DOCS_HOST, DOCS_URL, HIDDEN_TEXT, LEDGER } from "../data";
import { cx } from "../ui/bits";

/* ---------- Readouts (chat-ui src/features/browser/stats-overlay.tsx) ---------- */

const HISTORY = 40;
const GRAPH_W = 96;
const GRAPH_H = 14;
const pill = "rounded-lg border border-white/10 bg-[#16181f]/80 text-white shadow-lg backdrop-blur-md";

/** `graphPoints` from frame-stream.ts: samples to points, newest on the right. */
function graphPoints(samples: readonly (number | null)[], w: number, h: number, ceiling: number) {
  const top = Math.max(ceiling, ...samples.map((s) => s ?? 0), 1e-9);
  const step = w / (HISTORY - 1);
  const offset = HISTORY - samples.length;
  return samples.map((s, i) => (s === null ? null : { x: (offset + i) * step, y: h - (Math.min(Math.max(s, 0), top) / top) * h }));
}

function LineGraph({ samples, ceiling }: { samples: readonly (number | null)[]; ceiling: number }) {
  const points = graphPoints(samples, GRAPH_W, GRAPH_H - 2, ceiling).filter((p) => p !== null);
  return (
    <svg width={GRAPH_W} height={GRAPH_H} className="block" aria-hidden>
      <polyline
        points={points.map((p) => `${p.x.toFixed(1)},${(p.y + 1).toFixed(1)}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DotGraph({ samples, ceiling }: { samples: readonly (number | null)[]; ceiling: number }) {
  const points = graphPoints(samples, GRAPH_W - 2, GRAPH_H - 3, ceiling);
  return (
    <svg width={GRAPH_W} height={GRAPH_H} className="block" aria-hidden>
      {points.map((p, i) => p && <circle key={i} cx={p.x + 1} cy={p.y + 1.5} r={1} fill="currentColor" />)}
    </svg>
  );
}

function Readout({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className={cx(pill, "w-[118px] px-2.5 pb-1.5 pt-1")}>
      <div className="flex items-baseline justify-between text-[11px] leading-5">
        <span className="text-white/55">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="text-white/70">{children}</div>
    </div>
  );
}

export function StatsOverlay({ fps, ping }: { fps: readonly number[]; ping: readonly number[] }) {
  const fpsNow = fps.at(-1);
  const pingNow = ping.at(-1);
  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5">
      <div className="flex items-stretch gap-1.5">
        <Readout label="FPS" value={fpsNow === undefined ? "n/a" : `${fpsNow.toFixed(0)} fps`}>
          <LineGraph samples={fps} ceiling={60} />
        </Readout>
        <Readout label="Ping" value={pingNow === undefined ? "…" : `${pingNow.toFixed(0)} ms`}>
          <DotGraph samples={ping} ceiling={50} />
        </Readout>
        <div className={cx(pill, "flex min-h-8 items-center gap-1 pl-2.5 pr-1")}>
          <span className="relative flex h-2 w-2" aria-hidden>
            {(fpsNow ?? 0) >= 1 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="ml-1 text-[12px] font-medium">Live</span>
          <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-white/60">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </span>
        </div>
        <span className={cx(pill, "flex min-h-8 w-6 items-center justify-center text-white/50")}>
          <GripVertical className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

/* ---------- The docs page the agent opens ---------- */

/**
 * A plain docs page, light like most of the web. One paragraph is white on white: a reader never
 * sees it, the agent reads it. `exposed` outlines it for the viewer.
 */
function DocsPage({ exposed }: { exposed: boolean }) {
  const hidden = useTarget("hidden");
  return (
    <div className="absolute inset-0 overflow-hidden bg-white text-[#1d2330]">
      <div className="flex h-11 items-center gap-5 border-b border-[#e6e8ee] px-6 text-[13px]">
        <span className="font-semibold">Example Docs</span>
        <span className="text-[#6b7280]">Guides</span>
        <span className="text-[#6b7280]">API</span>
      </div>
      <div className="px-6 pt-5">
        <p className="text-[12px] text-[#6b7280]">Guides / Formatting</p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.01em]">Rounding currency in JavaScript</h1>
        <p className="mt-3 text-[13.5px] leading-[1.65] text-[#374151]">
          <code className="rounded bg-[#f1f3f7] px-1 font-mono text-[12.5px]">Intl.NumberFormat</code> rounds half away from zero when you set{" "}
          <code className="rounded bg-[#f1f3f7] px-1 font-mono text-[12.5px]">maximumFractionDigits</code> to 0. Pair it with a currency to get whole-dollar prices.
        </p>
        <pre className="mt-3 overflow-hidden rounded-lg bg-[#f6f7f9] px-3 py-2.5 font-mono text-[12px] leading-[1.6] text-[#1d2330]">
          {'new Intl.NumberFormat("en-US", {\n  style: "currency",\n  currency: "USD",\n  maximumFractionDigits: 0,\n}).format(12.5) // "$13"'}
        </pre>
        <p
          ref={hidden}
          className={cx(
            "mt-3 rounded-md px-1.5 py-1 text-[13px] leading-[1.6] transition-[color,background-color,box-shadow] duration-700",
            exposed ? "bg-[#fff1f2] text-[#be123c] shadow-[0_0_0_1.5px_#e11d48]" : "text-white",
          )}
        >
          {HIDDEN_TEXT}
        </p>
        <p className="mt-3 text-[13.5px] leading-[1.65] text-[#374151]">
          Round once, at the end. Rounding each line before you add them up can leave a total a dollar off.
        </p>
      </div>
    </div>
  );
}

/* ---------- The network ledger (netproxy/store.rs `network_ledger`) ---------- */

/**
 * The run's rows from the firewall's ledger: every host its tools reached through the run's proxy,
 * what the proxy decided, and the bytes each way. The app records it; this is a compact view of it.
 */
function Ledger({ rows }: { rows: number }) {
  const ledger = useTarget("ledger");
  const blocked = useTarget("ledger-blocked");
  return (
    <div ref={ledger} className="mt-1.5 shrink-0 overflow-hidden rounded-xl border border-border/30 bg-card ad-enter ad-up-2">
      <div className="flex h-9 items-center gap-2 border-b border-border/10 px-3">
        <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="flex-1 text-[12px] font-semibold tracking-tight text-foreground/70">Network</span>
        <span className="text-[10px] font-mono text-muted-foreground/40">this run · allowlist · enforced</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 px-3 py-1.5 text-[11px]">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40">Host</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/40">Decision</span>
        <span className="text-right text-[10px] uppercase tracking-wide text-muted-foreground/40">Conns</span>
        <span className="text-right text-[10px] uppercase tracking-wide text-muted-foreground/40">Up / down</span>
        {LEDGER.slice(0, rows).map((r) => {
          const bad = r.decision === "blocked";
          return (
            <div key={r.host} ref={bad ? blocked : undefined} className={cx("col-span-4 grid grid-cols-subgrid items-center rounded-md py-1 ad-enter", bad && "bg-red-500/[0.07]")}>
              <span className={cx("truncate font-mono", bad ? "text-red-400" : "text-foreground/80")}>{r.host}</span>
              <span
                className={cx(
                  "justify-self-start rounded-full px-2 py-px text-[10.5px] font-medium",
                  bad ? "bg-red-500/15 text-red-400" : "bg-emerald-500/10 text-emerald-400",
                )}
              >
                {r.decision}
              </span>
              <span className="text-right font-mono tabular-nums text-muted-foreground/70">{r.connections}</span>
              <span className="text-right font-mono tabular-nums text-muted-foreground/70">
                {r.up} / {r.down}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- The panel (chat-ui src/features/browser/browser-panel.tsx) ---------- */

const iconButton = "h-7 w-7 flex shrink-0 items-center justify-center rounded-md text-muted-foreground/60";

/** Quaka's browser beside the chat, with the run's network ledger under it once there is one. */
export function BrowserPanel({ page, exposed, ledger }: { page: "loading" | "docs"; exposed: boolean; ledger: number }) {
  const panel = useTarget("browser");
  const close = useTarget("close-browser");
  const address = useTarget("url");
  const fps = [0, 0, 12, 34, 8, 0, 0, 0, 0, 0, 0, 0];
  const ping = [4, 3, 5, 4, 3, 4, 6, 4, 3, 4, 5, 4];
  return (
    <div className="flex h-full flex-col">
      <div ref={panel} className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/30 bg-background/40">
        <div className="flex items-center gap-1.5 px-2 h-10 border-b border-border/20 shrink-0">
          <span className={iconButton}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          <div ref={address} className="flex-1 flex items-center gap-2 h-7 px-2.5 rounded-md bg-card/60 border border-border/30 min-w-0">
            <Globe className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            <span className="flex-1 truncate text-[11px] font-mono min-w-0">{DOCS_URL}</span>
          </div>
          <span className={iconButton}>
            <Fullscreen className="h-3.5 w-3.5" />
          </span>
          <span className={iconButton}>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          <span ref={close} className={iconButton}>
            <X className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="relative flex-1 min-h-0 bg-black overflow-hidden">
          {page === "docs" ? (
            <>
              <DocsPage exposed={exposed} />
              <StatsOverlay fps={fps} ping={ping} />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
              <Globe className="h-6 w-6" />
              <p className="text-[11px]">Waiting for the first frame…</p>
            </div>
          )}
        </div>
        <div className="h-6 px-3 flex items-center border-t border-border/20 shrink-0">
          <span className="text-[10px] text-muted-foreground/40 truncate">{page === "docs" ? `Rounding currency in JavaScript · ${DOCS_HOST}` : "Loading…"}</span>
          <span className="ml-auto shrink-0 pl-2 text-[9px] text-muted-foreground/30">click the page to use the keyboard</span>
        </div>
      </div>
      {ledger > 0 && <Ledger rows={ledger} />}
    </div>
  );
}
