export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-40 rounded bg-[#F4F4F4]" />
        <div className="mt-2 h-4 w-72 rounded bg-[#F6F6F6]" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded border border-[#E8E8E8] bg-[#F6F6F6] p-5 h-28" />
        ))}
      </div>
    </div>
  );
}
