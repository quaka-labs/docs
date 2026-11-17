import {
  BookOpen,
  Calendar,
  Cpu,
  Database,
  Eye,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Package,
  PanelLeft,
  Play,
  Repeat,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  SquareCheck,
  SquareTerminal,
  SquareTerminalAsterisk,
  Users,
} from "@keyline-icons/react";
import type { ComponentType } from "react";

type Icon = ComponentType<{ className?: string }>;

/** One icon per page, keyed by the page's URL. Unknown pages fall back to a document. */
export const PAGE_ICONS: Record<string, Icon> = {
  "/docs": BookOpen,
  "/docs/install": Package,
  "/docs/quickstart": Play,
  "/docs/models": Cpu,
  "/docs/threads": MessageSquare,
  "/docs/workspace": PanelLeft,
  "/docs/automations": Calendar,
  "/docs/replay": Repeat,
  "/docs/memory": Database,
  "/docs/team-bot": Users,
  "/docs/security": Shield,
  "/docs/security/sandbox": SquareTerminal,
  "/docs/security/firewall": Globe,
  "/docs/security/untrusted-input": Eye,
  "/docs/security/proof": SquareCheck,
  "/docs/security/approvals": ShieldCheck,
  "/docs/settings": Settings,
  "/docs/shortcuts": SquareTerminalAsterisk,
  "/docs/help": Mail,
};

/** The five Security model layers, each with the colour it keeps across the site. */
export const SECURITY_LAYERS: Record<string, { name: string; color: string }> = {
  "/docs/security/sandbox": { name: "Sandbox", color: "#f48a5a" },
  "/docs/security/firewall": { name: "Firewall", color: "#f0607a" },
  "/docs/security/untrusted-input": { name: "Untrusted input", color: "#d04f9a" },
  "/docs/security/proof": { name: "Proof", color: "#9b5cf0" },
  "/docs/security/approvals": { name: "Approvals", color: "#7b84ff" },
};

/** Folder icons, keyed by the folder name in the page tree. */
export const FOLDER_ICONS: Record<string, Icon> = {
  "Start here": Play,
  "Using Quaka": MessageSquare,
  "Security model": Shield,
  Reference: SlidersHorizontal,
  Help: Mail,
};

export const FALLBACK_PAGE_ICON = FileText;
