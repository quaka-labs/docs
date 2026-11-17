"use client";

import { useState, type FormEvent } from "react";
import { User } from "@keyline-icons/react";
import { QuakaFace } from "@/components/pixel-quaka";

type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "done"; email: string } | { kind: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface WaitlistFormProps {
  /** Distinguishes the hero and footer instances for a11y ids. */
  id: string;
  /** Aligns the note under the form with the copy around it. */
  align?: "center" | "start";
}

/**
 * The app's composer as a signup form: email on the left, the New Thread button on the right. Once
 * it is sent, the composer plays the exchange it started, like a message app: the address goes out
 * as a sent bubble, Quaka types and replies, and then the exchange gives way to one quiet line.
 */
export default function WaitlistForm({ id, align = "center" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const error = status.kind === "error";

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "submitting") return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }
    const form = new FormData(e.currentTarget);
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: value, company: form.get("company") ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
      setStatus({ kind: "done", email: value });
    } catch (err) {
      // fetch throws a TypeError when the server can't be reached at all
      const message =
        err instanceof TypeError
          ? "Could not reach the server. Try again in a minute."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Try again.";
      setStatus({ kind: "error", message });
    }
  };

  return (
    <div className="w-full max-w-[520px]" role="status" aria-live="polite">
      {status.kind === "done" ? (
        <div className="wl-done" data-align={align}>
          {/* The exchange plays once, then gives way to the line below; screen readers get that line. */}
          <div className="wl-thread" aria-hidden="true">
            <div className="wl-row is-you">
              <p className="wl-bubble is-sent">{status.email}</p>
              <span className="wl-avatar">
                <User className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="wl-row is-quaka">
              <QuakaFace className="wl-face" />
              <div className="wl-stack">
                <p className="wl-bubble is-typing">
                  <i />
                  <i />
                  <i />
                </p>
                <p className="wl-bubble is-reply">You&rsquo;re on the list.</p>
              </div>
            </div>
          </div>
          <p className="wl-final">
            <QuakaFace className="wl-face" />
            <span>
              <span className="wl-final-title">You&rsquo;re on the list.</span>
              <span className="wl-final-note">One email when your invite is ready. Nothing else.</span>
            </span>
          </p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="composer" data-error={error}>
            <label htmlFor={`${id}-email`} className="sr-only">
              Email address
            </label>
            <input
              id={`${id}-email`}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              enterKeyHint="send"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setStatus({ kind: "idle" });
              }}
              aria-invalid={error || undefined}
              aria-describedby={error ? `${id}-err` : undefined}
            />
            {/* Honeypot: hidden from people, filled by bots. */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <button type="submit" className="btn-app" disabled={status.kind === "submitting"}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              {status.kind === "submitting" ? "Sending…" : "Join waitlist"}
              <span className="kbd">Enter</span>
            </button>
          </div>
          <p id={error ? `${id}-err` : undefined} className={`t-caption mt-[var(--spacing-12)] ${align === "start" ? "text-left" : "text-center"} ${error ? "!text-[#e46b6b]" : ""}`}>
            {error ? status.message : "No spam. One email when your invite is ready."}
          </p>
        </form>
      )}
    </div>
  );
}
