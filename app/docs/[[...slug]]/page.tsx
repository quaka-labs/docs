import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { DocsPager } from "@/components/docs/pager";
import { PageActions } from "@/components/docs/page-actions";
import { getMDXComponents } from "@/components/mdx";
import { getPageMarkdownUrl, source } from "@/lib/source";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const EDIT_BASE = "https://github.com/quaka-labs/docs/blob/main/content/docs";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    url: `${SITE_URL}${page.url}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: "Quaka", url: "https://quaka.app" },
  };

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ enabled: false }}
      footer={{ enabled: false }}
    >
      <div className="docs-page-head">
        <div className="docs-page-heading">
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription>{page.data.description}</DocsDescription>
        </div>
        <PageActions markdownUrl={markdownUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <DocsPager />
      <footer className="docs-page-foot">
        <div className="docs-page-foot-meta">
          {page.data.lastModified ? <PageLastUpdate date={page.data.lastModified} /> : null}
          <a href={`${EDIT_BASE}/${page.path}`} target="_blank" rel="noreferrer">
            Edit this page
          </a>
        </div>
        <p className="docs-page-foot-note">
          Quaka is invite only. Questions go to <a href="mailto:hello@quaka.app">hello@quaka.app</a>.
        </p>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = page.data.title;
  const description = page.data.description ?? "";
  const og = `/docs-og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: {
      canonical: page.url,
      types: { "text/markdown": getPageMarkdownUrl(page) },
    },
    openGraph: {
      title,
      description,
      url: page.url,
      type: "article",
      images: [{ url: og, width: 1200, height: 630, alt: `${title} · ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}
