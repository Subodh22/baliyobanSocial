import type { Metadata } from "next";
import { MarketingNav } from "@/app/components/marketing-nav";

export const metadata: Metadata = {
  title: "Enterprise — baliyoban",
  description: "Enterprise-grade social media API with unlimited accounts, SLA, and dedicated support.",
};

const FEATURES = [
  { title: "Unlimited Accounts", desc: "Connect as many social accounts as you need. No caps, no tiers." },
  { title: "99.9% SLA", desc: "Guaranteed uptime with enterprise-grade infrastructure and monitoring." },
  { title: "Dedicated Support", desc: "Named account manager with priority response times and Slack channel." },
  { title: "Custom Integrations", desc: "Bespoke platform integrations, custom endpoints, and data pipelines." },
  { title: "SSO & SAML", desc: "Enterprise SSO with SAML 2.0 and SCIM provisioning for your team." },
  { title: "Compliance", desc: "SOC 2 Type II audit, GDPR-compliant data handling, and custom DPAs." },
  { title: "Volume Pricing", desc: "Custom pricing based on your usage. Pay only for what you use." },
  { title: "On-Premise Option", desc: "Self-hosted deployment for maximum control and data sovereignty." },
];

export default function Enterprise() {
  return (
    <main className="bg-[#0a0a0a] text-zinc-100">
      <MarketingNav />

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Enterprise
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Social media infrastructure for large teams, agencies, and platforms.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 mx-auto max-w-xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-100">Talk to Sales</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Tell us about your use case and we&apos;ll put together a custom plan.
          </p>
          <a
            href="mailto:subodhmaharjan3@gmail.com?subject=Enterprise%20Inquiry"
            className="mt-6 inline-block rounded-lg bg-[#EB3514] px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Contact Us
          </a>
        </div>
      </div>
    </main>
  );
}
