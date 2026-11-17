import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} share card`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = path.join(process.cwd(), "public/fonts");

let fontsPromise: Promise<{ serif: Buffer; sans: Buffer }> | null = null;

function fonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(FONT_DIR, "source-serif-4-600.ttf")),
    readFile(path.join(FONT_DIR, "inter-500.ttf")),
  ]).then(([serif, sans]) => ({ serif, sans }));
  return fontsPromise;
}

function clean(value: string | null, fallback: string, limit: number) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, limit);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clean(searchParams.get("title"), "Quaka Docs", 110);
  const description = clean(
    searchParams.get("description"),
    "Any model, working side by side like teammates on your own machine.",
    180,
  );
  const { serif, sans } = await fonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0b0b0b",
          color: "#f2efe9",
          padding: "56px 64px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "radial-gradient(circle, rgba(123,132,255,0.18), rgba(11,11,11,0) 70%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 9, height: 9, background: "#ff6b5e" }} />
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 19,
              fontWeight: 500,
              letterSpacing: 8,
              color: "#f2efe9",
            }}
          >
            QUAKA
          </div>
          <div
            style={{
              border: "1px solid #333333",
              padding: "3px 9px",
              fontFamily: "Inter",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 3,
              color: "#9a9a9a",
            }}
          >
            DOCS
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: "Inter", fontSize: 15, fontWeight: 500, color: "#707070" }}>docs.quaka.app</div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
            padding: "24px 0 18px",
          }}
        >
          <div
            style={{
              fontFamily: "Source Serif 4",
              fontSize: title.length > 54 ? 64 : title.length > 34 ? 76 : 86,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -1.6,
              maxWidth: 1010,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 24,
              fontWeight: 500,
              lineHeight: 1.45,
              color: "#a8a8a8",
              maxWidth: 900,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderTop: "1px solid #242424",
            paddingTop: 20,
            fontFamily: "Inter",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 2.4,
            color: "#6f6f6f",
          }}
        >
          <span>THE HARNESS FOR CODING AGENTS</span>
          <span style={{ flex: 1 }} />
          <span>INVITE ONLY</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Source Serif 4", data: serif, style: "normal", weight: 600 },
        { name: "Inter", data: sans, style: "normal", weight: 500 },
      ],
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
