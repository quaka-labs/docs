import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/** The docs home: a small editorial grid, not a wall of links. */
export function HomeGrid({ children }: { children: ReactNode }) {
  return <div className="docs-home-grid">{children}</div>;
}

export function HomeCard({
  href,
  kicker,
  title,
  children,
  layer,
}: {
  href: string;
  kicker: string;
  title: string;
  children: ReactNode;
  layer?: string;
}) {
  return (
    <Link href={href} className="docs-home-card">
      <span className="docs-home-kicker">
        {layer ? (
          <span
            className="docs-layer-dot"
            style={{ "--layer": layer } as CSSProperties}
            aria-hidden
          />
        ) : null}
        {kicker}
      </span>
      <span className="docs-home-title">{title}</span>
      <span className="docs-home-copy">{children}</span>
    </Link>
  );
}
