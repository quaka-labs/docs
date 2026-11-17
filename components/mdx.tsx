import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/docs/figure";
import { HomeCard, HomeGrid } from "@/components/docs/home";
import { WorkspaceFragment } from "@/components/feature-ui/workspace-fragment";
import {
  ApplyFragment,
  ConnectionCardFragment,
  IssueStartFragment,
  ProvenFragment,
  SandboxDenialFragment,
} from "@/components/feature-ui/run-fragments";
import { SettingsReference } from "@/components/docs/settings-reference";
import { ShortcutsReference } from "@/components/docs/shortcuts-reference";
import WaitlistForm from "@/components/waitlist-form";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Figure,
    HomeCard,
    HomeGrid,
    SettingsReference,
    ShortcutsReference,
    WaitlistForm,
    WorkspaceFragment,
    ApplyFragment,
    ConnectionCardFragment,
    IssueStartFragment,
    ProvenFragment,
    SandboxDenialFragment,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
