import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";

/**
 * The docs collection. `lastModified` reads the file's git date; on Vercel set
 * VERCEL_DEEP_CLONE=true so the history is there. `includeProcessedMarkdown`
 * is what powers /docs/<slug>.md and llms-full.txt.
 */
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      /** Marks a Security layer page. Drives the dot in the sidebar and the accent in the page. */
      layer: z.enum(["sandbox", "firewall", "untrusted-input", "proof", "approval"]).optional(),
      /** Set on pages that are not ready to publish. */
      draft: z.boolean().default(false),
    }),
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  mdxOptions: {
    // Tables stay on the page but out of the search index: a table row makes a poor result,
    // and one mode table would otherwise fill the list with near-duplicates.
    remarkStructureOptions: {
      types: ["heading", "paragraph", "blockquote", "mdxJsxFlowElement"],
    },
  },
});
