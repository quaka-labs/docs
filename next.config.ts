import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  agentRules: false,
  outputFileTracingIncludes: {
    "/docs-og": ["./public/fonts/**"],
  },
  async redirects() {
    return [{ source: "/", destination: "/docs", permanent: false }];
  },
  async rewrites() {
    return [
      {
        source: "/docs/:slug*.md",
        destination: "/llms.mdx/docs/:slug*/content.md",
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(config);
