import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  FileText,
  FolderOpen,
  GitBranch,
  GitCompare,
  GitPullRequest,
  Globe,
  GlobeCursor,
  Link,
  Loader,
  Search,
  Terminal,
  X,
} from "@keyline-icons/react";
import { Merge } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { useTarget } from "../cursor";
import { BRANCH, CONCERN, EPERM_LINE, MODEL, PROJECT, PROVIDER, PR_NUMBER, SECOND_LAB, TEST_NAME, THREAD_TITLE } from "../data";
import type { AgentEvent, FailPass, PlanStatus, PlanStep, ToolInput, ToolName } from "../model";
import { AppButton, cx, GithubMark, ProviderLogo, ShinyText } from "./bits";

type Call = Extract<AgentEvent, { type: "tool_call" }>;
type Result = Extract<AgentEvent, { type: "tool_result" }>;
type Kind = "read" | "list" | "search" | "run" | "edit" | "web" | "browser" | "git";

const KIND: Record<ToolName, Kind> = {
  read_file: "read",
  grep: "search",
  bash: "run",
  edit_file: "edit",
  write_file: "edit",
  browser_navigate: "browser",
  create_pull_request: "git",
};

const ICON: Record<Kind, typeof FileText> = {
  read: FileText,
  list: FolderOpen,
  search: Search,
  run: Terminal,
  edit: GitCompare,
  web: Globe,
  browser: GlobeCursor,
  git: GitBranch,
};

function ToolIcon({ name, className }: { name?: ToolName; className?: string }) {
  const Icon = ICON[name ? KIND[name] : "run"];
  return <Icon className={cx("h-3.5 w-3.5 shrink-0", className)} aria-hidden />;
}

/** chat-ui src/lib/tool-summary.ts `summarize`, for the tools the demo calls. */
function summarize(name: ToolName, input: ToolInput, result?: Result): string {
  switch (name) {
    case "bash": {
      const cmd = input.command ?? "";
      const short = cmd.length > 50 ? `${cmd.slice(0, 50)}…` : cmd;
      if (!result) return `Running $ ${short}`;
      return result.isError ? `Failed: $ ${short}` : `Ran $ ${short}`;
    }
    case "write_file": {
      const bytes = result?.output?.match(/Wrote (\d+) bytes/)?.[1];
      return bytes ? `Wrote ${bytes} bytes to ${input.path}` : `Writing ${input.path}…`;
    }
    case "edit_file":
      return result ? `Edited ${input.path}` : `Editing ${input.path}…`;
    case "read_file":
      return result ? `Read ${input.path}` : `Reading ${input.path}…`;
    case "grep":
      return result ? `Searched for ${input.pattern}` : `Searching for ${input.pattern}…`;
    case "browser_navigate":
      return result ? `Opened ${input.url}` : `Opening ${input.url}…`;
    case "create_pull_request":
      return result ? `Opened PR: ${input.title}` : `Opening PR: ${input.title}…`;
  }
}

/** What the sidebar shows under the running thread. */
export function activity(events: readonly AgentEvent[]): string {
  const calls = events.filter((e): e is Call => e.type === "tool_call");
  const last = calls[calls.length - 1];
  if (!last) return "Thinking…";
  const result = events.find((e): e is Result => e.type === "tool_result" && e.id === last.id);
  return summarize(last.name, last.input, result);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** `summarizeGroup`: one line for a run of calls. */
function summarizeGroup(calls: Call[]): string {
  const read = new Set<string>();
  const edited = new Set<string>();
  const count: Partial<Record<Kind, number>> = {};
  for (const c of calls) {
    const kind = KIND[c.name];
    if (kind === "read" && c.input.path) read.add(c.input.path);
    else if (kind === "edit" && c.input.path) edited.add(c.input.path);
    else count[kind] = (count[kind] ?? 0) + 1;
  }
  const n = (k: Kind) => count[k] ?? 0;
  const parts = [
    read.size ? `read ${plural(read.size, "file", "files")}` : "",
    n("list") ? `listed ${plural(n("list"), "folder", "folders")}` : "",
    n("search") ? `searched ${plural(n("search"), "time", "times")}` : "",
    n("run") ? `ran ${plural(n("run"), "command", "commands")}` : "",
    edited.size ? `edited ${plural(edited.size, "file", "files")}` : "",
    n("web") ? `searched the web ${plural(n("web"), "time", "times")}` : "",
    n("browser") ? `took ${plural(n("browser"), "browser step", "browser steps")}` : "",
    n("git") ? `ran ${plural(n("git"), "git step", "git steps")}` : "",
  ].filter(Boolean);
  const text = parts.join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const shinyRow = (text: string) => (
  <ShinyText text={text} color="hsl(var(--muted-foreground) / 0.6)" shine="hsl(var(--foreground) / 0.95)" className="text-[12px] font-mono" />
);

/** The row's output, as the app shows it when the pointer rests on the row. */
function Detail({ call, result }: { call: Call; result: Result }) {
  const eperm = useTarget("eperm");
  const lines = (result.output ?? "").split("\n");
  return (
    <div
      className="absolute bottom-full left-0 mb-2 z-50 w-[660px] overflow-hidden rounded-lg border border-white/[0.04] shadow-2xl ad-enter ad-up-1"
      style={{ backgroundColor: "hsl(var(--secondary))" }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.04]">
        <ToolIcon name={call.name} className="h-3 w-3 text-white/30" />
        <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">{call.name}</span>
      </div>
      <pre className="px-3 py-2.5 text-[11px] font-mono text-white/60 whitespace-pre-wrap break-all leading-[1.7]">
        {lines.map((line, i) => (
          <span key={i} ref={i === EPERM_LINE ? eperm : undefined} className="block">
            {line || " "}
          </span>
        ))}
      </pre>
    </div>
  );
}

/** chat-ui tool-call-inline.tsx */
function ToolRow({ call, result, shine, open }: { call: Call; result?: Result; shine: boolean; open?: boolean }) {
  const testRow = useTarget("test-row");
  const error = result?.isError;
  const summary = summarize(call.name, call.input, result);
  if (call.name === "create_pull_request" && result && !error) return <PrCard />;
  return (
    <div className="relative flex min-w-0 items-center gap-2 py-0.5 ad-enter ad-up-1">
      <ToolIcon name={call.name} className={error ? "text-red-400/80" : "text-muted-foreground/70"} />
      <span
        ref={call.input.command === "npm test" ? testRow : undefined}
        className={cx("min-w-0 truncate text-[12px] font-mono", error && "text-red-400/80")}
      >
        {result || !shine ? <span className={cx(!error && (open ? "text-foreground/90" : "text-muted-foreground/80"))}>{summary}</span> : shinyRow(summary)}
      </span>
      {open && result && <Detail call={call} result={result} />}
    </div>
  );
}

/** chat-ui tool-group.tsx, closed. */
function ToolGroup({ calls, results, live }: { calls: Call[]; results: Map<string, Result>; live: boolean }) {
  const last = calls[calls.length - 1];
  const running = live && !results.get(last.id);
  const failed = calls.filter((c) => results.get(c.id)?.isError).length;
  return (
    <div className="my-0.5">
      <div className="flex max-w-full items-center gap-2 rounded py-0.5 text-left text-[12px] font-mono text-muted-foreground/80">
        <ToolIcon name={last.name} className="text-muted-foreground/70" />
        <span className="min-w-0 truncate">{running ? shinyRow(summarize(last.name, last.input)) : summarizeGroup(calls)}</span>
        {failed > 0 && <span className="shrink-0 text-red-400/80">· {failed} failed</span>}
        <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
      </div>
    </div>
  );
}

const PLAN_SECTIONS: Record<PlanStatus, { label: string; dot: string; text: string }> = {
  in_progress: { label: "IN PROGRESS", dot: "bg-amber-400", text: "text-foreground/90" },
  pending: { label: "TO DO", dot: "bg-muted-foreground/40", text: "text-foreground/90" },
  done: { label: "DONE", dot: "bg-emerald-500/70", text: "line-through text-muted-foreground/50" },
};
const PLAN_ORDER: PlanStatus[] = ["in_progress", "pending", "done"];

/** chat-ui chat-messages.tsx `PlanCard` */
function PlanCard({ steps }: { steps: PlanStep[] }) {
  const done = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  return (
    <div className="my-1.5 w-full max-w-sm rounded-2xl border border-border/20 bg-gradient-to-r from-card to-card/70 p-2 text-[12.5px] shadow-[0_1px_2px_0_rgb(0_0_0/0.05)]">
      {PLAN_ORDER.map((status) => {
        const items = steps.filter((s) => s.status === status);
        if (items.length === 0) return null;
        const section = PLAN_SECTIONS[status];
        return (
          <div key={status}>
            <div className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/50">{section.label}</div>
            {items.map((s) => (
              <div key={s.step} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", section.dot)} aria-hidden />
                <span className={cx("truncate", section.text)}>{s.step}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div className="mt-1 flex items-center gap-2 border-t border-border/15 px-2 pb-0.5 pt-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/60">
          <div className="h-full rounded-full bg-emerald-500/70 transition-[width] duration-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
        <span className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground/70">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

/** Inline markdown: `code` chips and **bold**, as the app's prose renders them. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      m[1] !== undefined ? (
        <code
          key={m.index}
          className="rounded-[4px] bg-white/[0.06] border border-white/[0.06] px-1 py-0 text-[0.9em] font-mono text-primary/90 [box-decoration-break:clone]"
        >
          {m[1]}
        </code>
      ) : (
        <strong key={m.index} className="font-semibold text-foreground">
          {m[2]}
        </strong>
      ),
    );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** chat-ui markdown.tsx's `prose prose-sm dark:prose-invert` look, for paragraphs and bullet lists. */
function Markdown({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/);
  return (
    <div className="max-w-none break-words text-[14px] leading-[1.7142857] text-[#d1d5db] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="my-1.5 list-disc pl-[1.5714em] marker:text-[#4b5563]">
              {lines.map((l, j) => (
                <li key={j} className="my-0.5 pl-[0.4286em]">
                  {inline(l.slice(2))}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-1.5 leading-relaxed">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}

/** chat-ui proof-card.tsx, for a proven report, with another lab's opinion (`Opinion`) once it arrives. */
function ProofCard({ opinion }: { opinion: "agree" | "disagree" | null }) {
  const proof = useTarget("proof");
  const row = useTarget("opinion");
  const disputed = opinion === "disagree";
  return (
    <div ref={proof} className="my-2 flex max-w-2xl flex-col gap-1.5 rounded-xl border border-border/40 bg-card/60 p-3 text-[11px] ad-enter ad-up-1">
      <div className="-mx-1 -mt-1 rounded-lg border px-2 py-1 font-medium border-green-500/30 bg-green-500/5 text-green-400">
        <Check className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
        Tested
        <span className="font-normal">: 1 test fails without the change and passes with it</span>
        {disputed && (
          <span className="ml-1.5 rounded border border-destructive/40 bg-destructive/10 px-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">Disputed</span>
        )}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="w-12 shrink-0 text-muted-foreground/60">Checks</span>
        <span className="font-mono text-foreground/70">
          <Check className="mr-1 inline h-3 w-3 align-[-1px]" aria-hidden />
          npm test 2&gt;&amp;1 <span className="text-muted-foreground/50">192 ms</span>
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="w-12 shrink-0 text-muted-foreground/60">Tests</span>
        <ul className="flex min-w-0 flex-col gap-0.5">
          <li className="min-w-0">
            <span className="inline-block w-20 font-medium text-green-400">fail→pass</span>
            <span className="font-mono text-foreground/80">{TEST_NAME}</span>
            <span className="ml-1.5 font-mono text-muted-foreground/50">test/price.test.js</span>
          </li>
        </ul>
      </div>
      {opinion && (
        <div ref={row} className="flex items-baseline gap-3 ad-enter">
          <span className="w-12 shrink-0 text-muted-foreground/60">2nd lab</span>
          <div className="flex min-w-0 flex-col gap-0.5">
            {disputed ? (
              <>
                <span className="font-medium text-destructive">
                  <CircleAlert className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                  {SECOND_LAB} disagrees
                </span>
                <span className="min-w-0">
                  <span className="font-mono text-muted-foreground/70">
                    {CONCERN.file}:{CONCERN.line}
                  </span>{" "}
                  <span className="text-foreground/75">{CONCERN.issue}</span>
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-green-400">
                  <Check className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                  {SECOND_LAB} agrees
                </span>
                <span className="text-foreground/75">· The total now rounds once, after the lines are added up.</span>
              </>
            )}
            <span className="text-[10px] text-muted-foreground/50">$0.004 · 9,812 tokens</span>
          </div>
        </div>
      )}
      <div className="text-[10px] text-muted-foreground/50">base: copy-on-write clone · 417 ms</div>
    </div>
  );
}

const F2P_LANES = [
  { label: "Without the change", note: "base: copy-on-write clone", fail: "expected '$13', got '$12.50'" },
  { label: "With the change", note: "your working tree", pass: "passes" },
];

/**
 * The fail-to-pass run as it happens (agent/verify/fail_to_pass.rs): the new test on a clone of the
 * code from before the run, then on the change. In the app this is the "Verifying" step.
 */
function FailToPass({ phase }: { phase: FailPass }) {
  const ref = useTarget("f2p");
  const lane = (i: 0 | 1) => {
    const running = phase === (i === 0 ? 1 : 3);
    const finished = phase >= (i === 0 ? 2 : 4);
    const l = F2P_LANES[i];
    return (
      <div className={cx("flex-1 rounded-lg border px-3 py-2", finished ? (i === 0 ? "border-red-500/30 bg-red-500/5" : "border-green-500/30 bg-green-500/5") : "border-border/40 bg-background/40")}>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-medium text-foreground/85">{l.label}</span>
          <span className="truncate text-muted-foreground/50">{l.note}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px]">
          {running ? (
            <Loader className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground/70" aria-hidden />
          ) : finished ? (
            i === 0 ? (
              <X className="h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden />
            ) : (
              <Check className="h-3.5 w-3.5 shrink-0 text-green-400" aria-hidden />
            )
          ) : (
            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/30" />
          )}
          <span className="truncate text-foreground/80">{TEST_NAME}</span>
        </div>
        {finished && <div className={cx("mt-1 font-mono text-[10.5px] ad-enter", i === 0 ? "text-red-400/90" : "text-green-400/90")}>{i === 0 ? l.fail : l.pass}</div>}
      </div>
    );
  };
  return (
    <div ref={ref} className="my-1 rounded-xl border border-border/40 bg-card/60 p-3 ad-enter ad-up-1">
      <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground/70">
        {phase < 4 ? <Loader className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden /> : <Check className="h-3.5 w-3.5 shrink-0 text-green-400" aria-hidden />}
        <span>Fail-to-pass: 1 new test, without the change and with it</span>
      </div>
      <div className="flex gap-2">
        {lane(0)}
        {lane(1)}
      </div>
    </div>
  );
}

/** A later user turn in the thread; one that came from GitHub says so above it. */
function UserTurn({ text, from }: { text: string; from: string }) {
  return (
    <div className="group flex flex-col items-end mt-4 mb-2 ad-enter ad-up-2">
      <span className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground/50">{from}</span>
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-4 py-3">
        <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{text}</div>
      </div>
    </div>
  );
}

/** chat-ui github/pr-card.tsx, loaded: mergeable, the repository has no CI, and the Merge row. */
function PrCard() {
  const ref = useTarget("pr-card");
  return (
    <div ref={ref} className="my-3 max-w-xl overflow-hidden rounded-2xl border border-border/40 bg-card/70 shadow-lg backdrop-blur-xl ad-enter ad-up-1">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-foreground/[0.05]">
          <GithubMark className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-[11px] text-muted-foreground/60">
              {PROJECT} #{PR_NUMBER}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium bg-emerald-500/10 text-emerald-400">
              <GitPullRequest className="h-3 w-3" aria-hidden />
              Open
            </span>
            <span className="ml-auto shrink-0 text-[10.5px] text-muted-foreground/45">updated just now</span>
          </div>
          <div className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.01em]">{THREAD_TITLE}</div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground/65">
            <span className="shrink-0">@mayalq</span>
            <span className="text-muted-foreground/30">·</span>
            <GitBranch className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate font-mono text-[10.5px]">
              {BRANCH} <span className="text-muted-foreground/40">→</span> main
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2 px-4 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-border/30 bg-foreground/[0.03] px-2.5 py-1 text-[11px]">
            <span className="text-foreground/80">2 files</span>
            <span className="font-mono text-emerald-400">+16</span>
            <span className="font-mono text-red-400">−1</span>
            <span className="flex items-center gap-[2px]" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={cx("h-2 w-2 rounded-[2px]", i < 4 ? "bg-emerald-500/80" : "bg-red-500/70")} />
              ))}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-border/30 px-2.5 py-1 text-[11px] text-muted-foreground/60">
            <Link className="h-3 w-3" aria-hidden />
            No linked issue
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
          <CircleCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-foreground/85">Ready to merge</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-muted-foreground/40" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-muted-foreground/70">No checks on this repository</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border/20 bg-background/30 px-4 py-3">
        <span className="flex h-8 items-center gap-1.5 rounded-lg border border-border/40 px-3 text-[11.5px] font-medium text-foreground/85">
          View on GitHub
          <ArrowUpRight className="h-3 w-3 text-muted-foreground/60" />
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="flex h-8 items-center gap-1.5 rounded-lg border border-border/40 px-2 text-[11.5px] text-foreground/80">
            Squash and merge <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </span>
          <AppButton>
            <Merge className="h-3.5 w-3.5 text-white/85" aria-hidden />
            Merge
          </AppButton>
        </div>
      </div>
    </div>
  );
}

/** chat-ui chat-messages.tsx `ModelBadge` */
export function ModelBadge({ usage }: { usage: { sent: string; out: string } | null }) {
  const display = MODEL.length > 25 ? `${MODEL.slice(0, 25)}…` : MODEL;
  return (
    <div className="flex items-center gap-1.5 mt-3 pt-2 ad-enter">
      <ProviderLogo provider={PROVIDER} className="h-3.5 w-3.5 opacity-50" />
      <span className="text-[11px] text-muted-foreground/60 font-mono">{display}</span>
      {usage && (
        <span className="text-[10px] text-muted-foreground/50 font-mono flex items-center gap-1.5 ml-1">
          <span>{usage.sent} in</span>
          <span aria-hidden>·</span>
          <span>{usage.out} out</span>
        </span>
      )}
    </div>
  );
}

function TaintNote({ step, source }: { step: number; source: string }) {
  const ref = useTarget("taint");
  return (
    <div ref={ref} className="text-[11px] text-muted-foreground/50 py-0.5 ad-enter">
      Read untrusted content at step {step}: {source}. Side effects ask from here on.
    </div>
  );
}

/**
 * chat-ui chat-messages.tsx `AgentEventStream`: consecutive tool calls fold into one group, and
 * anything drawn on its own (text, a diff, a card) closes it. Only the last plan draws.
 */
export function EventStream({ events, shine, popover, f2p }: { events: readonly AgentEvent[]; shine: boolean; popover: string | null; f2p: FailPass }) {
  const elements: ReactElement[] = [];
  const results = new Map<string, Result>();
  let lastPlan = -1;
  // A second opinion belongs on the proof card of the verification it follows.
  const opinions = new Map<number, "agree" | "disagree">();
  let lastVerification = -1;
  events.forEach((e, i) => {
    if (e.type === "tool_result") results.set(e.id, e);
    if (e.type === "plan") lastPlan = i;
    if (e.type === "verification") lastVerification = i;
    if (e.type === "second_opinion" && lastVerification >= 0 && !opinions.has(lastVerification)) opinions.set(lastVerification, e.verdict);
  });

  let group: Call[] = [];
  let text = "";
  const flushGroup = (tail: boolean) => {
    if (group.length === 0) return;
    const first = group[0];
    elements.push(
      group.length === 1 ? (
        <ToolRow key={`tool-${first.id}`} call={first} result={results.get(first.id)} shine={shine} open={popover === first.id} />
      ) : (
        <ToolGroup key={`group-${first.id}`} calls={group} results={results} live={shine && tail} />
      ),
    );
    group = [];
  };
  const push = (el: ReactElement) => {
    flushGroup(false);
    elements.push(el);
  };
  const flushText = (key: string) => {
    if (!text) return;
    push(<Markdown key={key} content={text} />);
    text = "";
  };

  events.forEach((e, i) => {
    if (e.type === "tool_result" || e.type === "done") return;
    if (e.type === "tool_call" && e.name !== "create_pull_request") {
      flushText(`text-${i}`);
      group.push(e);
      return;
    }
    if (e.type === "text") {
      text += e.content;
      return;
    }
    flushText(`text-${i}`);
    switch (e.type) {
      case "plan":
        if (i === lastPlan) push(<PlanCard key={`plan-${i}`} steps={e.steps} />);
        break;
      case "tool_call":
        push(<ToolRow key={`tool-${e.id}`} call={e} result={results.get(e.id)} shine={shine} />);
        break;
      case "tainted":
        push(<TaintNote key={`tn-${i}`} step={e.step} source={e.source} />);
        break;
      case "fail_to_pass":
        push(<FailToPass key={`f2p-${i}`} phase={f2p} />);
        break;
      case "user":
        push(<UserTurn key={`u-${i}`} text={e.text} from={e.from} />);
        break;
      case "verify_start":
        if (!events.slice(i + 1).some((n) => n.type === "verify_result" || n.type === "verification"))
          push(
            <div key={`vs-${i}`} className="flex items-center gap-2 text-[11px] text-muted-foreground/60 py-1 ad-enter">
              <Loader className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
              <span>Verifying: {e.commands.join(", ")}</span>
            </div>,
          );
        break;
      case "verify_result":
        push(
          <details key={`vr-${i}`} className="my-1 rounded-lg border px-3 py-2 text-[11px] border-green-500/30 bg-green-500/5 text-green-400 ad-enter ad-up-1">
            <summary className="select-none font-medium">
              <Check className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
              All checks passed
            </summary>
          </details>,
        );
        break;
      case "verification":
        push(<ProofCard key={`pf-${i}`} opinion={opinions.get(i) ?? null} />);
        break;
    }
  });
  flushGroup(true);
  flushText("text-final");
  return <div className="flex flex-col gap-0.5">{elements}</div>;
}
