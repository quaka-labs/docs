/**
 * The demo's state and the one reducer the script drives. Agent events mirror the app's
 * `AgentEvent` shapes closely enough that the stream renders with the app's own grouping rules.
 */

import type { CalloutId } from "./data";

export type ToolName = "read_file" | "grep" | "bash" | "edit_file" | "write_file" | "browser_navigate" | "create_pull_request";

export interface ToolInput {
  path?: string;
  pattern?: string;
  command?: string;
  url?: string;
  title?: string;
}

export type PlanStatus = "in_progress" | "pending" | "done";
export interface PlanStep {
  step: string;
  status: PlanStatus;
}

export type AgentEvent =
  | { type: "tool_call"; id: string; name: ToolName; input: ToolInput }
  | { type: "tool_result"; id: string; isError?: boolean; output?: string }
  | { type: "plan"; steps: PlanStep[] }
  | { type: "text"; content: string }
  | { type: "tainted"; source: string; step: number }
  | { type: "verify_start"; commands: string[] }
  | { type: "verify_result"; passed: boolean }
  /** The fail-to-pass run, drawn from `DemoState.f2p`. */
  | { type: "fail_to_pass" }
  | { type: "verification" }
  | { type: "second_opinion"; verdict: "agree" | "disagree" }
  /** A later user turn, from GitHub. */
  | { type: "user"; text: string; from: string }
  | { type: "done" };

export type ThreadStatus = "active" | "needs_you" | "review";

/** A card above the composer: a command, the writers' launch, or the pull request. */
export type PromptCard = "curl" | "writers" | "pr";

/** Elements the pointer and the camera can go to, registered by the components that draw them. */
export type TargetName =
  | "composer"
  | "send"
  | "reject"
  | "allow"
  | "launch"
  | "card"
  | "browser"
  | "url"
  | "hidden"
  | "close-browser"
  | "taint"
  | "test-row"
  | "eperm"
  | "ledger"
  | "ledger-blocked"
  | "writers"
  | "f2p"
  | "proof"
  | "opinion"
  | "pr-bar"
  | "pr-card"
  | "github";

export type CursorTarget = TargetName | { x: number; y: number };

export interface CursorState {
  target: CursorTarget;
  /** Glide time to the target, ms. */
  dur: number;
  /** Bumped on every move, so the pointer re-measures. */
  seq: number;
  /** Place without a glide (a seek or a reset). */
  jump: boolean;
  /** Bumped on every click; 0 draws no ring. */
  click: number;
}

/** What the camera frames, and the annotation it stops on. An empty focus is the whole scene. */
export interface Shot {
  focus: TargetName[];
  /** Largest zoom for this shot. */
  max: number;
  callout: { id: CalloutId; anchor: TargetName } | null;
  seq: number;
}

export type WriterState = "running" | "done" | "applied";

/** The fail-to-pass run: not started, base running, base failed, change running, change passed. */
export type FailPass = 0 | 1 | 2 | 3 | 4;

export interface DemoState {
  /** Script time of the last step applied, ms. */
  t: number;
  /** The whole stage fades out before the loop restarts. */
  hidden: boolean;
  draft: string;
  focused: boolean;
  typing: boolean;
  /** The user's message, once sent. */
  sent: string | null;
  running: boolean;
  title: string;
  branch: string;
  status: ThreadStatus | null;
  events: AgentEvent[];
  prompt: PromptCard | null;
  hover: TargetName | null;
  pr: null | "looking" | "none";
  /** Share of the context window in use, 0 to 1. */
  context: number;
  usage: { sent: string; out: string } | null;
  cursor: CursorState;
  /** The browser panel beside the chat: closed, loading, or the docs page. */
  browser: null | "loading" | "docs";
  /** The hidden instruction on the page is shown for what it is. */
  exposed: boolean;
  /** The tool call whose output is open, as when the pointer rests on its row. */
  popover: string | null;
  /** Rows of the network ledger shown, under the browser. */
  ledger: number;
  writers: WriterState[] | null;
  /** The Changes panel beside the chat, once the writers' work has landed. */
  changes: boolean;
  f2p: FailPass;
  /** The GitHub conversation: nothing, the command, then Quaka's reply. */
  github: 0 | 1 | 2;
  shot: Shot;
}

export const INITIAL: DemoState = {
  t: 0,
  hidden: true,
  draft: "",
  focused: false,
  typing: false,
  sent: null,
  running: false,
  title: "",
  branch: "main",
  status: null,
  events: [],
  prompt: null,
  hover: null,
  pr: null,
  context: 0,
  usage: null,
  cursor: { target: { x: 1010, y: 600 }, dur: 0, seq: 0, jump: true, click: 0 },
  browser: null,
  exposed: false,
  popover: null,
  ledger: 0,
  writers: null,
  changes: false,
  f2p: 0,
  github: 0,
  shot: { focus: [], max: 1, callout: null, seq: 0 },
};

type Patch = Partial<Omit<DemoState, "cursor" | "events" | "shot">>;

export type Action =
  | { type: "set"; patch: Patch }
  | { type: "move"; target: CursorTarget; dur: number }
  | { type: "click" }
  | { type: "event"; event: AgentEvent }
  | { type: "send" }
  | { type: "shot"; focus: TargetName[]; max: number; callout: Shot["callout"] };

export interface Step {
  at: number;
  action: Action;
}

export function reduce(state: DemoState, step: Step): DemoState {
  return { ...apply(state, step.action), t: step.at };
}

function apply(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "set":
      return { ...state, ...action.patch };
    case "move":
      return { ...state, cursor: { ...state.cursor, target: action.target, dur: action.dur, seq: state.cursor.seq + 1, jump: false } };
    case "click":
      return { ...state, cursor: { ...state.cursor, click: state.cursor.click + 1 } };
    case "event":
      return { ...state, events: [...state.events, action.event] };
    case "send":
      return { ...state, sent: state.draft, draft: "", typing: false, running: true, status: "active", hover: null, context: 0.01 };
    case "shot":
      return { ...state, shot: { focus: action.focus, max: action.max, callout: action.callout, seq: state.shot.seq + 1 } };
  }
}

/** The state at script time `t`, with the pointer placed rather than gliding and no click ring. */
export function stateAt(steps: readonly Step[], t: number): DemoState {
  let state = INITIAL;
  for (const step of steps) {
    if (step.at > t) break;
    state = reduce(state, step);
  }
  return { ...state, typing: false, cursor: { ...state.cursor, jump: true, seq: state.cursor.seq + 1, click: 0 } };
}
