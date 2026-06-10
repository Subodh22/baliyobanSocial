export default function Loading() {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-1px)]">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#111]">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="min-w-0 space-y-1.5">
              <div className="h-3.5 w-24 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 pt-2">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg px-3 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <div className="h-3.5 w-20 animate-pulse rounded bg-white/[0.06]" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Main skeleton */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-4 w-64 animate-pulse rounded bg-white/[0.06]" />
          </div>
        </div>
        <div className="mt-8 h-9 w-48 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
