import { BRANCH, DOCS_URL, FIX_COMMAND, PLAN_STEPS, PROMPT, TAINT_STEP, TEST_OUTPUT, THREAD_TITLE, WEB_SOURCE } from "./data";
import type { Action, AgentEvent, CursorTarget, PlanStatus, Shot, Step, TargetName, ToolInput, ToolName, WriterState } from "./model";

/** Where the pointer waits between clicks, in scene coordinates (1360 by 760). */
const REST = { x: 1040, y: 560 };

export interface Chapter {
  label: string;
  at: number;
}

/**
 * The whole demonstration as one list of timed steps. Each helper appends at the current time and
 * moves the clock on by its gap, so the script reads top to bottom in the order things happen.
 */
function build() {
  const steps: Step[] = [];
  const chapters: Chapter[] = [];
  let now = 0;
  let ids = 0;

  const push = (action: Action) => steps.push({ at: now, action });
  const wait = (ms: number) => {
    now += ms;
  };
  const set = (patch: Extract<Action, { type: "set" }>["patch"]) => push({ type: "set", patch });
  const event = (e: AgentEvent) => push({ type: "event", event: e });
  const chapter = (label: string) => chapters.push({ label, at: now });
  const click = () => push({ type: "click" });
  const move = (target: CursorTarget, dur: number) => {
    push({ type: "move", target, dur });
    wait(dur);
  };
  /** Points the camera at `focus` (the whole scene when empty), optionally stopping on a callout. */
  const shot = (focus: TargetName[], max = 1, callout: Shot["callout"] = null) => push({ type: "shot", focus, max, callout });
  const call = (name: ToolName, input: ToolInput) => {
    const id = `c${++ids}`;
    event({ type: "tool_call", id, name, input });
    return id;
  };
  const done = (id: string, extra: { isError?: boolean; output?: string } = {}) => event({ type: "tool_result", id, ...extra });
  const plan = (doneCount: number) =>
    event({
      type: "plan",
      steps: PLAN_STEPS.map((step, i) => ({
        step,
        status: (i < doneCount ? "done" : i === doneCount ? "in_progress" : "pending") as PlanStatus,
      })),
    });
  const type = (text: string, perChar: number) => {
    for (let i = 1; i <= text.length; i++) {
      set({ draft: text.slice(0, i), typing: true });
      wait(perChar);
    }
  };
  const stream = (text: string, every: number) => {
    const words = text.match(/\S+\s*|\s+/g) ?? [];
    for (let i = 0; i < words.length; i += 2) {
      event({ type: "text", content: words.slice(i, i + 2).join("") });
      wait(every);
    }
  };
  const writers = (...states: WriterState[]) => set({ writers: states });

  // 1. It reads, then it stops: a docs page hides an order for AI agents; the command it asks for has to ask.
  chapter("It reads, then it stops");
  set({ hidden: false });
  wait(400);
  move("composer", 700);
  click();
  set({ focused: true });
  wait(200);
  type(PROMPT, 22);
  wait(200);
  set({ typing: false });
  move("send", 500);
  set({ hover: "send" });
  wait(150);
  click();
  push({ type: "send" });
  set({ title: THREAD_TITLE });
  move(REST, 700);
  plan(0);
  const r1 = call("read_file", { path: "src/price.js" });
  wait(300);
  done(r1);
  const r2 = call("read_file", { path: "src/cart/Total.jsx" });
  wait(300);
  done(r2);
  const ci = call("bash", { command: "npm ci" });
  wait(700);
  done(ci);
  set({ context: 0.03 });
  const nav = call("browser_navigate", { url: DOCS_URL });
  set({ browser: "loading" });
  wait(500);
  set({ browser: "docs" });
  done(nav);
  wait(300);
  event({ type: "tainted", source: WEB_SOURCE, step: TAINT_STEP });
  wait(400);
  shot(["url", "hidden"], 1.4, { id: "trap", anchor: "hidden" });
  wait(700);
  set({ exposed: true });
  wait(2600);
  const curl = call("bash", { command: FIX_COMMAND });
  set({ prompt: "curl", status: "needs_you" });
  shot(["card"], 1.6, { id: "stops", anchor: "card" });
  wait(2200);
  move("reject", 700);
  set({ hover: "reject" });
  wait(300);
  click();
  set({ prompt: null, hover: null, status: "active" });
  done(curl, { isError: true, output: "Denied by the user" });
  stream("Denied. Continuing without it.", 50);
  shot([]);
  move(REST, 700);

  // 2. A real sandbox, not a prompt: a dependency's test helper reaches for a key and a server.
  chapter("A real sandbox, not a prompt");
  plan(1);
  const test = call("bash", { command: "npm test" });
  wait(900);
  done(test, { output: TEST_OUTPUT.join("\n") });
  set({ context: 0.05 });
  move("test-row", 700);
  set({ popover: test });
  shot(["eperm"], 1.9, { id: "sandbox", anchor: "eperm" });
  wait(3000);
  set({ ledger: 1 });
  wait(250);
  set({ ledger: 2 });
  shot(["ledger"], 1.9, { id: "firewall", anchor: "ledger-blocked" });
  wait(3000);
  set({ popover: null });
  shot([]);
  wait(400);

  // 3. Three agents, three worktrees: the writers' launch is a card, their work lands only on apply.
  chapter("Three agents, three worktrees");
  plan(2);
  move("close-browser", 700);
  click();
  set({ browser: null, ledger: 0 });
  wait(500);
  set({ prompt: "writers", status: "needs_you" });
  shot(["card"], 1.45);
  wait(1300);
  move("launch", 700);
  set({ hover: "launch" });
  wait(300);
  click();
  set({ prompt: null, hover: null, status: "active" });
  writers("running", "running", "running");
  move(REST, 600);
  shot(["writers"], 1.8, { id: "writers", anchor: "writers" });
  wait(1300);
  writers("done", "running", "running");
  wait(700);
  writers("done", "running", "done");
  wait(700);
  writers("done", "done", "done");
  wait(600);
  writers("applied", "done", "done");
  wait(300);
  writers("applied", "applied", "done");
  wait(300);
  writers("applied", "applied", "applied");
  set({ branch: BRANCH, context: 0.08 });
  stream("Applied all three writers to your checkout. No conflicts.", 50);
  wait(1400);
  set({ writers: null, changes: true });
  shot([]);
  wait(300);

  // 4. Proof, not a claim: the new test fails on a copy of the code from before, then passes.
  chapter("Proof, not a claim");
  plan(3);
  event({ type: "verify_start", commands: ["npm test 2>&1"] });
  wait(900);
  event({ type: "verify_result", passed: true });
  event({ type: "fail_to_pass" });
  set({ f2p: 1 });
  shot(["f2p"], 1.9, { id: "proof", anchor: "f2p" });
  wait(1200);
  set({ f2p: 2 });
  wait(1300);
  set({ f2p: 3 });
  wait(1000);
  set({ f2p: 4 });
  wait(800);
  event({ type: "verification" });
  set({ context: 0.1 });
  shot(["proof"], 1.7, { id: "proof", anchor: "proof" });
  wait(2200);

  // 5. A second lab checks it: a model from another provider disputes one thing, the agent fixes it.
  chapter("A second lab checks it");
  event({ type: "second_opinion", verdict: "disagree" });
  shot(["opinion"], 1.9, { id: "second", anchor: "opinion" });
  wait(3000);
  const fix = call("edit_file", { path: "src/cart/Total.jsx" });
  wait(700);
  done(fix);
  event({ type: "verification" });
  wait(400);
  event({ type: "second_opinion", verdict: "agree" });
  shot(["opinion"], 1.9, { id: "second", anchor: "opinion" });
  wait(2400);

  // 6. Ship it from anywhere: the pull request asks, then a comment on GitHub starts the next run.
  chapter("Ship it from anywhere");
  plan(4);
  const pr = call("create_pull_request", { title: THREAD_TITLE });
  set({ prompt: "pr", status: "needs_you" });
  shot(["card"], 1.6, { id: "ship", anchor: "card" });
  wait(1700);
  move("allow", 700);
  set({ hover: "allow" });
  wait(300);
  click();
  set({ prompt: null, hover: null, status: "active" });
  move(REST, 700);
  done(pr, { output: "https://github.com/maya/quaka-pr-test/pull/3" });
  set({ pr: "looking" });
  event({ type: "done" });
  set({ running: false, status: "review", usage: { sent: "214k", out: "5.2k" }, context: 0.12 });
  shot(["pr-bar", "pr-card"], 1.5);
  wait(1300);
  set({ pr: "none" });
  wait(900);
  set({ github: 1 });
  shot(["github"], 1.45, { id: "anywhere", anchor: "github" });
  wait(1500);
  set({ github: 2 });
  event({ type: "user", text: "/quaka fix the rounding for negative numbers", from: "From GitHub · @mayalq" });
  set({ running: true, status: "active" });
  wait(2600);
  shot([]);
  wait(1600);
  set({ hidden: true });
  wait(800);

  // A pointer glide overlaps the steps after it; keep the list in time order.
  steps.sort((a, b) => a.at - b.at);
  return { steps, chapters, total: now };
}

const built = build();

export const STEPS: readonly Step[] = built.steps;
export const CHAPTERS: readonly Chapter[] = built.chapters;
/** Length of one loop, ms. */
export const TOTAL = built.total;
/** The finished story, just before the fade: what reduced motion shows. */
export const END = TOTAL - 1500;
