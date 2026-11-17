"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "@keyline-icons/react";

/** Copy the page's processed Markdown, or open it as a file. */
export function PageActions({ markdownUrl }: { markdownUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copy() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch(markdownUrl);
      if (!response.ok) throw new Error(String(response.status));
      await navigator.clipboard.writeText(await response.text());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = markdownUrl;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="docs-page-actions">
      <button type="button" className="docs-page-action" onClick={copy} disabled={busy} aria-live="polite">
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        <span>{copied ? "Copied" : "Copy page"}</span>
      </button>
      <a
        className="docs-page-action docs-page-action-icon"
        href={markdownUrl}
        aria-label="View this page as Markdown"
        title="View as Markdown"
      >
        <FileText aria-hidden />
      </a>
    </div>
  );
}
