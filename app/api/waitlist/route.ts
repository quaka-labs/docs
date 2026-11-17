import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The docs site's waitlist, proxied so the form works from docs.quaka.app: the waitlist API
 * allows quaka.app as its browser origin, not this one. The request is forwarded server to
 * server with the visitor's address, so the API's own rate limit still sees one person.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; company?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  try {
    const res = await fetch("https://api.quaka.app/waitlist", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(forwarded ? { "x-forwarded-for": forwarded } : {}),
      },
      body: JSON.stringify({
        email,
        company: typeof body?.company === "string" ? body.company : "",
      }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Could not reach the server. Try again in a minute." }, { status: 502 });
  }
}
