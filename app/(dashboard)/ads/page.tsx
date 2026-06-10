const AD_NETWORKS = [
  { name: "Meta Ads", platforms: "Facebook & Instagram", status: "Not connected" },
  { name: "Google Ads", platforms: "YouTube & Search", status: "Not connected" },
  { name: "LinkedIn Ads", platforms: "LinkedIn", status: "Not connected" },
  { name: "TikTok Ads", platforms: "TikTok", status: "Not connected" },
  { name: "Pinterest Ads", platforms: "Pinterest", status: "Not connected" },
  { name: "X Ads", platforms: "Twitter / X", status: "Not connected" },
];

export default function Ads() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Ads</h1>
          <p className="mt-1 text-sm text-zinc-500">Boost posts and manage ad campaigns across 6 networks</p>
        </div>
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-indigo-600/40 px-4 py-2 text-sm font-semibold text-indigo-300/60"
        >
          + New Campaign
        </button>
      </div>

      {/* Spend overview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Spend", value: "$0.00" },
          { label: "Active Campaigns", value: "0" },
          { label: "Avg. Cost per Click", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ad networks */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-200">Ad Networks</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AD_NETWORKS.map((network) => (
            <div
              key={network.name}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              <p className="text-sm font-semibold text-zinc-200">{network.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{network.platforms}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                <span className="text-xs text-zinc-500">{network.status}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-zinc-600">
          Connect ad network accounts to boost posts and create campaigns directly from baliyoban.
        </p>
      </div>
    </>
  );
}
