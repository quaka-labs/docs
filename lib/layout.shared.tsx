import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Quaka Docs",
      url: "/docs",
    },
    githubUrl: "https://github.com/quaka-labs/docs",
  };
}
