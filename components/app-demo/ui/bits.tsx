import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { highlightJs, highlightShell, TONE, type Token } from "../highlight";

/** Joins class names, skipping the falsy ones. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** The app's shadcn `Button` with `variant="ghost"`: note `[&_svg]:size-4` wins over an icon's own size. */
export function GhostButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md transition-colors [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** chat-ui src/features/providers/provider-logo.tsx, the fallback the demo's custom provider gets. */
export function ProviderLogo({ provider, className }: { provider: string; className?: string }) {
  const letter = provider.charAt(0).toUpperCase();
  return (
    <div className={cx("h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary", className)}>
      {letter}
    </div>
  );
}

export function GithubMark({ className }: { className?: string }) {
  return (
    <svg className={cx("h-4 w-4", className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

/** ShinyText as the app configures it: a highlight sweeping across muted text. */
export function ShinyText({ text, color, shine, speed = 2, className }: { text: string; color: string; shine: string; speed?: number; className?: string }) {
  const style = {
    backgroundImage: `linear-gradient(120deg, ${color} 0%, ${color} 35%, ${shine} 50%, ${color} 65%, ${color} 100%)`,
    "--ad-speed": `${speed}s`,
  } as CSSProperties;
  return (
    <span className={cx("ad-shiny", className)} style={style}>
      {text}
    </span>
  );
}

function Tokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={t.tone ? TONE[t.tone] : undefined}>
          {t.text}
        </span>
      ))}
    </>
  );
}

export function JsLine({ code }: { code: string }) {
  return <Tokens tokens={highlightJs(code)} />;
}

export function ShellCode({ code }: { code: string }) {
  return <Tokens tokens={highlightShell(code)} />;
}

/** Status dots (chat-ui threads/status-dot.tsx). */
export type DotStatus = "active" | "needs_you" | "review";
const DOTS: Record<DotStatus, string> = {
  active: "bg-primary animate-pulse",
  needs_you: "bg-amber-400 animate-pulse",
  review: "bg-emerald-400",
};
export function StatusDot({ status }: { status: DotStatus | null | undefined }) {
  if (!status) return null;
  return <span className={cx("shrink-0 h-1.5 w-1.5 rounded-full", DOTS[status])} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <span className="text-white/30 text-[10px] font-normal ml-auto">{children}</span>;
}

/** components/ui/app-button.tsx: the app's gradient button with its 6px mosaic. */
export function AppButton({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative h-8 min-w-[92px] overflow-hidden rounded-lg"
      style={{ background: "linear-gradient(135deg, #4a54c4 0%, #5560d4 50%, #4a50b8 100%)" }}
    >
      <span
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />
      <span className="relative flex h-full items-center justify-center gap-2 px-3 text-[11px] font-medium text-white/90">{children}</span>
    </span>
  );
}
