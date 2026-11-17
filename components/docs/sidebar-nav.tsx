"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import * as PageTree from "fumadocs-core/page-tree";
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
} from "fumadocs-ui/components/sidebar/base";
import type { SidebarPageTreeComponents } from "fumadocs-ui/components/sidebar/page-tree";
import {
  FALLBACK_PAGE_ICON,
  FOLDER_ICONS,
  PAGE_ICONS,
  SECURITY_LAYERS,
} from "@/lib/docs-nav";

function isActive(url: string, pathname: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function contains(item: PageTree.Folder, pathname: string): boolean {
  if (item.index && isActive(item.index.url, pathname)) return true;
  return item.children.some((child) => {
    if (child.type === "folder") return contains(child, pathname);
    if (child.type === "page") return isActive(child.url, pathname);
    return false;
  });
}

function PageGlyph({ url }: { url: string }) {
  const layer = SECURITY_LAYERS[url];
  if (layer) {
    return <span className="docs-layer-dot" style={{ "--layer": layer.color } as CSSProperties} aria-hidden />;
  }
  const Icon = PAGE_ICONS[url] ?? FALLBACK_PAGE_ICON;
  return <Icon className="docs-nav-icon" />;
}

function FolderGlyph({ name }: { name: ReactNode }) {
  const Icon = typeof name === "string" ? FOLDER_ICONS[name] : undefined;
  return Icon ? <Icon className="docs-nav-icon docs-nav-folder-icon" /> : null;
}

function Item({ item }: { item: PageTree.Item }) {
  const pathname = usePathname();
  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={isActive(item.url, pathname)}
      icon={<PageGlyph url={item.url} />}
      className="docs-nav-item"
    >
      {item.name}
    </SidebarItem>
  );
}

function Folder({ item, children }: { item: PageTree.Folder; children: ReactNode }) {
  const pathname = usePathname();
  const active = contains(item, pathname);

  return (
    <SidebarFolder collapsible={item.collapsible} active={active} defaultOpen={active || item.defaultOpen}>
      {item.index ? (
        <SidebarFolderLink
          href={item.index.url}
          external={item.index.external}
          active={isActive(item.index.url, pathname)}
          className="docs-nav-folder-trigger"
        >
          <FolderGlyph name={item.name} />
          <span>{item.name}</span>
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger className="docs-nav-folder-trigger">
          <FolderGlyph name={item.name} />
          <span>{item.name}</span>
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent className="docs-nav-folder-content">{children}</SidebarFolderContent>
    </SidebarFolder>
  );
}

function Separator({ item }: { item: PageTree.Separator }) {
  return <p className="docs-nav-separator">{item.name}</p>;
}

export const sidebarComponents: Partial<SidebarPageTreeComponents> = {
  Item,
  Folder,
  Separator,
};

/** A tiny link list under the tree, so a reader never has to hunt for the way out. */
export function SidebarFooter() {
  return (
    <div className="docs-side-footer">
      <p className="docs-side-kicker">Quaka is invite only</p>
      <Link href="/docs#waitlist" className="btn-app docs-side-cta">
        Join the waitlist
      </Link>
      <a href="mailto:hello@quaka.app" className="docs-side-mail">
        hello@quaka.app
      </a>
    </div>
  );
}
