import Link from "next/link";
import { QuakaAsleep } from "@/components/pixel-quaka";

/** The 404, shared by the docs shell and the root not-found route. */
export function DocsNotFound() {
  return (
    <div className="docs-not-found">
      <QuakaAsleep className="docs-not-found-art" label="Quaka asleep beside a closed laptop" />
      <h1>This page is not here</h1>
      <p>
        The URL may be old, or the page may have moved. The docs index is the shortest way back to
        something useful.
      </p>
      <div className="docs-not-found-links">
        <Link href="/docs">Go to the docs</Link>
        <a href="mailto:hello@quaka.app">hello@quaka.app</a>
      </div>
    </div>
  );
}
