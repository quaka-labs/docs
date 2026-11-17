"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@keyline-icons/react";
import { useFooterItems } from "fumadocs-ui/utils/use-footer-items";

function isActive(url: string, pathname: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

/** Previous and next, as two quiet cards rather than a stock pagination row. */
export function DocsPager() {
  const items = useFooterItems();
  const pathname = usePathname();
  // Exact first: a folder index's URL is a prefix of every page inside it.
  const exact = items.findIndex((item) => item.url === pathname);
  const index = exact !== -1 ? exact : items.findIndex((item) => isActive(item.url, pathname));
  if (index === -1) return null;
  const previous = items[index - 1];
  const next = items[index + 1];
  if (!previous && !next) return null;

  return (
    <nav className="docs-pager" aria-label="Previous and next pages">
      {previous ? (
        <Link href={previous.url} className="docs-pager-card">
          <span className="docs-pager-label">
            <ArrowLeft aria-hidden /> Previous
          </span>
          <span className="docs-pager-title">{previous.name}</span>
          {previous.description && <span className="docs-pager-desc">{previous.description}</span>}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.url} className="docs-pager-card docs-pager-card-next">
          <span className="docs-pager-label">
            Next <ArrowRight aria-hidden />
          </span>
          <span className="docs-pager-title">{next.name}</span>
          {next.description && <span className="docs-pager-desc">{next.description}</span>}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
