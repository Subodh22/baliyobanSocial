export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-40 rounded-lg bg-white/[0.06]" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-white/[0.04]" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-28" />
        ))}
      </div>
    </div>
  );
}
