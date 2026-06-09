import Link from "next/link";

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold tracking-tight">
            baliyoban
          </Link>
          <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <Link href="/docs" className="hover:text-white">Docs</Link>
            <Link href="/features" className="hover:text-white">Features</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/blog" className="hover:text-white">Blog</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/sign-in" className="text-zinc-300 hover:text-white">Sign in</Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#EB3514] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
