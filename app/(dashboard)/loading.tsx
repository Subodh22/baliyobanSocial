export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Page heading */}
      <div className="mb-11">
        <div className="h-6 w-36 rounded bg-[#E8E8E8]" />
        <div className="mt-3 h-4 w-64 rounded bg-[#F4F4F4]" />
      </div>

      {/* Section label */}
      <div className="flex items-baseline justify-between mb-[18px]">
        <div className="h-3 w-20 rounded bg-[#F4F4F4]" />
        <div className="h-3 w-24 rounded bg-[#F4F4F4]" />
      </div>

      {/* List rows */}
      <div className="border border-[#E8E8E8] rounded overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-[18px] ${
              i < 4 ? "border-b border-[#E8E8E8]" : ""
            }`}
          >
            <div className="h-[34px] w-[34px] rounded bg-[#E8E8E8] shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-28 rounded bg-[#E8E8E8]" />
              <div className="h-3 w-40 rounded bg-[#F4F4F4]" />
            </div>
            <div className="h-3 w-16 rounded bg-[#F4F4F4]" />
          </div>
        ))}
      </div>
    </div>
  );
}
