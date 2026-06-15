import Link from "next/link";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#E8E8E8] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-[10px]">
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#0A0A0A] text-white text-xs font-semibold">S</div>
            <span className="text-sm font-semibold tracking-[-0.02em]">baliyoban</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-[#5A5A5A] md:flex">
            <Link href="/docs" className="hover:text-[#0A0A0A]">Docs</Link>
            <Link href="/features" className="hover:text-[#0A0A0A]">Features</Link>
            <Link href="/pricing" className="hover:text-[#0A0A0A]">Pricing</Link>
            <Link href="/blog" className="hover:text-[#0A0A0A]">Blog</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/sign-in" className="text-[#5A5A5A] hover:text-[#0A0A0A]">Sign in</Link>
          <Link
            href="/sign-up"
            className="rounded bg-[#0A0A0A] px-4 py-2 font-medium text-white transition-opacity hover:opacity-85"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
