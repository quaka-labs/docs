import { MoreHorizontal, Pencil, SmilePlus } from "lucide-react";
import type { ReactNode } from "react";
import PixelAvatar from "./pixel-avatar";

/**
 * A pull request conversation as GitHub's dark theme draws it: the avatar beside a boxed comment
 * whose header carries the author, the time, the Author label and the edit and menu buttons, a
 * reaction button under the body, and the timeline rule joining the comments. Quaka posts its
 * replies as you (command/reply.rs), so every comment here is the PR author's.
 */
const GH = {
  canvas: "#0d1117",
  header: "#151b23",
  border: "#3d444d",
  fg: "#f0f6fc",
  muted: "#9198a1",
};

export const AUTHOR = "mayalq";

export interface GithubComment {
  time: string;
  body: ReactNode;
  /** Plays the arrival animation (the class is the caller's). */
  className?: string;
}

/** `@mayalq`, highlighted the way GitHub marks a mention of the viewer. */
export function SelfMention() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] px-1 align-baseline font-semibold" style={{ background: "rgba(187,128,9,0.15)", color: "#e3b341" }}>
      <PixelAvatar size={14} />@{AUTHOR}
    </span>
  );
}

export default function GithubThread({ comments, width = 400 }: { comments: GithubComment[]; width?: number | string }) {
  return (
    <div className="relative text-[13px]" style={{ width, color: GH.fg }}>
      <div className="relative">
        {comments.map((c, i) => (
          <div key={i} className={`relative flex gap-3 ${i > 0 ? "pt-3" : ""} ${c.className ?? ""}`}>
            {/* The timeline rule from the comment above belongs to this one, so it arrives with it. */}
            {i > 0 && <span className="absolute top-0 h-3 w-[2px]" style={{ left: 32 + 12 + 14, background: GH.border }} aria-hidden />}
            <PixelAvatar size={32} className="mt-0.5" />
            <div className="relative min-w-0 flex-1 rounded-md border" style={{ background: GH.canvas, borderColor: GH.border }}>
              {/* The speech caret pointing at the avatar. */}
              <span className="absolute -left-[6px] top-[11px] h-[10px] w-[10px] rotate-45 border-b border-l" style={{ background: GH.header, borderColor: GH.border }} aria-hidden />
              <div className="relative flex items-center gap-1.5 rounded-t-md border-b px-3 py-[7px] text-[12px]" style={{ background: GH.header, borderColor: GH.border }}>
                <span className="font-semibold" style={{ color: GH.fg }}>
                  {AUTHOR}
                </span>
                <span className="truncate" style={{ color: GH.muted }}>
                  commented <span className="underline decoration-1 underline-offset-2">{c.time}</span>
                </span>
                <span className="ml-auto shrink-0 rounded-full border px-1.5 text-[11px] leading-[18px]" style={{ borderColor: GH.border, color: GH.muted }}>
                  Author
                </span>
                <Pencil className="h-3.5 w-3.5 shrink-0" style={{ color: GH.muted }} aria-hidden />
                <MoreHorizontal className="h-4 w-4 shrink-0" style={{ color: GH.muted }} aria-hidden />
              </div>
              <div className="px-3 pb-2.5 pt-2.5 leading-relaxed">{c.body}</div>
              <div className="px-3 pb-2.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: GH.border, color: GH.muted }} aria-hidden>
                  <SmilePlus className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
