/**
 * One source of truth for the docs site's metadata.
 * The tagline and sub-headline come from the landing site, word for word.
 */

export const SITE_URL = "https://docs.quaka.app";
export const SITE_NAME = "Quaka Docs";

export const TAGLINE_LEAD = "Ship with agents.";
export const TAGLINE_TURN = "Like a team of ten.";
export const TAGLINE = "Ship with agents. Like a team of ten";

export const SUBHEAD =
  "Watch Claude, GPT, Gemini or a local model work side by side like teammates on your own machine. Every command, diff and test in view, inside a harness that enforces what prompts only ask for.";

export const DESCRIPTION = SUBHEAD;

export const SHORT_DESCRIPTION =
  "Any model, working side by side like teammates on your own machine, inside a harness that enforces what prompts only ask for.";

export const OG_IMAGE = {
  url: "/docs-og",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} · ${TAGLINE}`,
} as const;
