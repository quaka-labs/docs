import type { CSSProperties, ReactNode } from "react";

/**
 * A figure is one moment in the app, drawn with the app's own components, set on one of the
 * landing site's CRT backdrops. It is never a screenshot: the text stays selectable and the
 * components keep their real spacing.
 */

const BACKDROPS = {
  airgap: "/airgap-bg.webp",
  desktop: "/desktop-bg.webp",
  memory: "/memory-bg.webp",
  replay: "/replay-bg.webp",
  scheduled: "/scheduled-bg.webp",
  web: "/web-bg.webp",
} as const;

export type Backdrop = keyof typeof BACKDROPS;

export function Figure({
  backdrop = "desktop",
  moment,
  caption,
  children,
}: {
  backdrop?: Backdrop;
  moment: string;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="docs-figure">
      <div
        className="docs-figure-stage"
        style={{ backgroundImage: `url(${BACKDROPS[backdrop]})` } as CSSProperties}
      >
        <div className="docs-figure-app">{children}</div>
      </div>
      <figcaption>
        <b>{moment}</b>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
