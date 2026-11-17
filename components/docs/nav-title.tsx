"use client";

import type { ComponentProps } from "react";
import { Wordmark } from "./wordmark";

/** The sidebar's title slot. It receives Fumadocs' anchor props, so it stays a link. */
export function NavTitle({ className = "", ...props }: ComponentProps<"a">) {
  void props;
  return <Wordmark className={className} />;
}
