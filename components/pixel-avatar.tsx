/**
 * Maya's profile picture: a pixel portrait drawn like the pixel Quaka (`app-demo/ui/mascot.tsx`),
 * so the made-up user looks like part of the page rather than a stock photo of a real person.
 */
const PALETTE: Record<string, string> = {
  h: "#3a2418", // hair
  s: "#f1c7a4", // skin
  e: "#1a1210", // eyes
  c: "#f39ab0", // cheeks
  m: "#b5545c", // mouth
  n: "#d9a883", // neck
  t: "#f48a5a", // top
};

// 14 wide, '.' = background
const MAYA = [
  "..............",
  "....hhhhhh....",
  "...hhhhhhhh...",
  "..hhhhhhhhhh..",
  "..hhsssssshh..",
  ".hhsssssssshh.",
  ".hhsesssseshh.",
  ".hhcsssssschh.",
  ".hhsssmmssshh.",
  ".hhhsssssshhh.",
  ".hhh..nn..hhh.",
  ".hh.tttttt.hh.",
  "...tttttttt...",
  "..tttttttttt..",
];

export default function PixelAvatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-block shrink-0 overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 14 14" width={size} height={size} shapeRendering="crispEdges" className="block">
        <rect width="14" height="14" fill="#5560d4" />
        {MAYA.flatMap((row, y) => [...row].map((c, x) => (PALETTE[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETTE[c]} /> : null)))}
      </svg>
    </span>
  );
}
