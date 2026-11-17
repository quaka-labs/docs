import type { ReactNode } from "react";
import { DocsShell } from "@/components/docs/docs-shell";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-root">
      <DocsShell tree={source.getPageTree()}>{children}</DocsShell>
    </div>
  );
}
