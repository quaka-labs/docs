"use client";

import type { ReactNode } from "react";
import type * as PageTree from "fumadocs-core/page-tree";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { NavTitle } from "./nav-title";
import { MobileSearch, SidebarSearch } from "./search";
import { SidebarFooter, sidebarComponents } from "./sidebar-nav";
import { Topbar } from "./topbar";

/**
 * The Fumadocs shell, with every stock surface replaced: the sidebar tree, the search field, the
 * top bar, and the footer. The page tree still comes from the content source, so search, the
 * sitemap and llms.txt stay in step with the sidebar.
 */
export function DocsShell({ tree, children }: { tree: PageTree.Root; children: ReactNode }) {
  return (
    <DocsLayout
      tree={tree}
      nav={{ title: "Quaka Docs", url: "/docs" }}
      themeSwitch={{ enabled: false }}
      sidebar={{
        components: sidebarComponents,
        footer: <SidebarFooter />,
      }}
      slots={{
        header: Topbar,
        navTitle: NavTitle,
        searchTrigger: {
          sm: MobileSearch,
          full: SidebarSearch,
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
