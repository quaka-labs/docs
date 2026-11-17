import Image from "next/image";
import Link from "next/link";

/** The landing's wordmark, with the docs chip that keeps the product and the docs distinct. */
export function Wordmark({ className = "", href = "/docs" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={`docs-wordmark ${className}`} aria-label="Quaka Docs">
      <Image
        src="/quaka-wordmark.svg"
        alt="Quaka"
        width={119}
        height={38}
        className="docs-wordmark-img"
        unoptimized
        priority
      />
      <span className="docs-wordmark-chip" aria-hidden>
        Docs
      </span>
    </Link>
  );
}
