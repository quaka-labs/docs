import type { Metadata } from "next";
import { DocsNotFound } from "@/components/docs/not-found";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="docs-not-found-main">
      <DocsNotFound />
    </main>
  );
}
