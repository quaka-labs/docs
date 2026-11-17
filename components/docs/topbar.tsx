"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Search } from "@keyline-icons/react";
import type { ReactNode } from "react";
import * as PageTree from "fumadocs-core/page-tree";
import { SidebarTrigger } from "fumadocs-ui/components/sidebar/base";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useTreeContext } from "fumadocs-ui/contexts/tree";

function trailIn(nodes: PageTree.Node[], pathname: string, trail: ReactNode[] = []): ReactNode[] | null {
  for (const node of nodes) {
    if (node.type === "page" && node.url === pathname) return [...trail, node.name];
    if (node.type === "folder") {
      if (node.index?.url === pathname) return [...trail, node.name];
      const found = trailIn(node.children, pathname, [...trail, node.name]);
      if (found) return found;
    }
  }
  return null;
}

function Crumb({ children, href, current }: { children: ReactNode; href?: string; current?: boolean }) {
  if (href) {
    return (
      <Link href={href} className="docs-crumb">
        {children}
      </Link>
    );
  }
  return (
    <span className="docs-crumb docs-crumb-current" aria-current={current ? "page" : undefined}>
      {children}
    </span>
  );
}

function GithubMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden focusable="false">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/** The sticky bar over the page: breadcrumbs on the left, the way out on the right. */
export function Topbar() {
  const pathname = usePathname();
  const { root } = useTreeContext();
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const rawTrail = pathname === "/docs" ? [] : trailIn(root.children, pathname) ?? [];
  // A folder index is a page inside the folder, often with the folder's own name. Show it once.
  const trail = rawTrail.filter((name, index) => index === 0 || name !== rawTrail[index - 1]);

  return (
    <header id="nd-subnav" data-transparent="false" className="docs-topbar">
      <div className="docs-topbar-left">
        <SidebarTrigger className="docs-icon-button docs-menu-button">
          <Menu aria-hidden />
        </SidebarTrigger>
        <Link href="/docs" className="docs-topbar-wordmark" aria-label="Quaka Docs">
          <Image src="/quaka-wordmark.svg" alt="Quaka" width={119} height={38} className="docs-topbar-wordmark-img" unoptimized priority />
          <span className="docs-wordmark-chip" aria-hidden>
            Docs
          </span>
        </Link>
        <nav className="docs-breadcrumbs" aria-label="Breadcrumb">
          <Crumb href={pathname === "/docs" ? undefined : "/docs"} current={pathname === "/docs"}>
            Docs
          </Crumb>
          {trail.map((name, index) => (
            <span className="docs-crumb-group" key={`${name}-${index}`}>
              <ChevronRight className="docs-crumb-sep" aria-hidden />
              <Crumb current={index === trail.length - 1}>{name}</Crumb>
            </span>
          ))}
        </nav>
      </div>

      <div className="docs-topbar-right">
        {enabled && (
          <button type="button" className="docs-search-trigger" onClick={() => setOpenSearch(true)} aria-label="Search documentation">
            <Search className="docs-topbar-search-icon" aria-hidden />
            <span className="docs-search-trigger-label">Search docs</span>
            <span className="docs-kbd" aria-hidden>
              {hotKey.map((key, index) => (
                <kbd key={index}>{key.display}</kbd>
              ))}
            </span>
          </button>
        )}
        <a
          className="docs-icon-button docs-topbar-github"
          href="https://github.com/quaka-labs/docs"
          target="_blank"
          rel="noreferrer"
          aria-label="Quaka docs on GitHub"
          title="Quaka docs on GitHub"
        >
          <GithubMark className="docs-github-mark" />
        </a>
        <Link href="/docs#waitlist" className="btn-app docs-topbar-cta">
          Join waitlist
        </Link>
      </div>
    </header>
  );
}
