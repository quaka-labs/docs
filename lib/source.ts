import { docs } from "@/.source/server";
import { llms, loader } from "fumadocs-core/source";

/** One source of truth for the sidebar, search, sitemap, llms.txt and page metadata. */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/** The Markdown renderer behind /docs/<slug>.md, llms.txt and llms-full.txt. */
export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText("processed")}`,
});

/** The public Markdown URL for a page. The rewrite in next.config.ts serves the processed text. */
export function getPageMarkdownUrl(page: { url: string }) {
  return `${page.url}.md`;
}
