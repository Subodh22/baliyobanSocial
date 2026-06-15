import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Pricing — baliyoban",
  description: "Simple, transparent pricing. Free up to 2 connected accounts.",
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For side projects and personal use",
    features: [
      "2 connected accounts",
      "100 posts / month",
      "10,000 API calls / month",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    desc: "For creators and small teams",
    features: [
      "10 connected accounts",
      "Unlimited posts",
      "100,000 API calls / month",
      "Advanced analytics",
      "Webhook notifications",
      "Priority support",
      "Scheduling",
    ],
    cta: "Coming Soon",
    highlight: true,
  },
  {
    name: "Business",
    price: "$99",
    period: "/ month",
    desc: "For agencies and growing businesses",
    features: [
      "50 connected accounts",
      "Unlimited posts",
      "1M API calls / month",
      "Full analytics + exports",
      "Ad campaign management",
      "Team collaboration (5 seats)",
      "Dedicated support",
      "Custom webhooks",
    ],
    cta: "Coming Soon",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <main className="text-[#0A0A0A]">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5A5A5A]">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlight
                  ? "border-[#0A0A0A]/20 bg-[#F6F6F6]"
                  : "border-[#E8E8E8] bg-[#F6F6F6]"
              }`}
            >
              {plan.highlight && (
                <span className="inline-block rounded-full bg-[#0A0A0A]/10 px-3 py-1 text-xs font-semibold text-[#0A0A0A] mb-4">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-bold text-[#0A0A0A]">{plan.name}</h2>
              <p className="mt-1 text-sm text-[#969696]">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#0A0A0A]">{plan.price}</span>
                <span className="text-sm text-[#969696]">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#5A5A5A]">
                    <span className="mt-0.5 text-[#0A0A0A]">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-[#0A0A0A] text-white hover:opacity-85"
                    : "border border-[#E8E8E8] text-[#5A5A5A] hover:bg-[#F6F6F6]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#969696]">
            Need more? <Link href="/enterprise" className="text-[#0A0A0A] hover:underline">Contact us for Enterprise pricing</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
