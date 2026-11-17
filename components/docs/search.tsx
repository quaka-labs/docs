"use client";

import { Search } from "@keyline-icons/react";
import { useSearchContext } from "fumadocs-ui/contexts/search";

type TriggerProps = {
  className?: string;
  hideIfDisabled?: boolean;
};

/** The sidebar's search field, shaped like a command palette rather than a form input. */
export function SidebarSearch({ className = "", hideIfDisabled }: TriggerProps) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  return (
    <button
      type="button"
      data-search-full=""
      className={`docs-search-full ${className}`}
      onClick={() => setOpenSearch(true)}
    >
      <Search className="docs-search-icon" aria-hidden />
      <span className="docs-search-label">Search docs</span>
      <span className="docs-kbd" aria-hidden>
        {hotKey.map((key, index) => (
          <kbd key={index}>{key.display}</kbd>
        ))}
      </span>
    </button>
  );
}

/** The small search control in the top bar, on narrow screens. */
export function MobileSearch({ className = "", hideIfDisabled }: TriggerProps) {
  const { enabled, setOpenSearch } = useSearchContext();
  if (hideIfDisabled && !enabled) return null;
  return (
    <button
      type="button"
      className={`docs-icon-button docs-topbar-search ${className}`}
      aria-label="Search documentation"
      onClick={() => setOpenSearch(true)}
    >
      <Search aria-hidden />
    </button>
  );
}
