import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "baliyoban — Social Media API for Developers & AI Agents | 15 Platforms, One Call",
  description:
    "Unified social media API: post, schedule, promote and engage across 15 platforms with one REST call. Free up to 2 accounts. MCP server for AI agents.",
};

const FOOTER = {
  PRODUCT: ["Documentation", "Dashboard", "Pricing", "Enterprise", "Features", "Changelog", "AI Agents", "Roadmap"],
  INTEGRATIONS: [
    "Twitter/X", "Instagram", "TikTok", "WhatsApp", "LinkedIn", "Facebook",
    "YouTube", "Threads", "Reddit", "Pinterest", "Bluesky", "Telegram",
    "Snapchat", "Google Business", "Discord", "Meta Ads", "Google Ads",
  ],
  COMPANY: ["Blog", "Terms", "Privacy", "Content Guidelines", "About", "Customers", "Careers", "Status"],
  COMPARISONS: ["vs Buffer", "vs Ayrshare", "vs Blotato", "vs Publer", "vs Postiz", "vs Unipile"],
  COMMUNITY: ["LinkedIn", "YouTube", "Telegram", "GitHub"],
} as const;

const LINK_HREF: Record<string, string> = {
  Documentation: "/docs",
  Dashboard: "/dashboard",
  Pricing: "/pricing",
  Enterprise: "/enterprise",
  Features: "/features",
  Changelog: "/changelog",
  "AI Agents": "/ai-agents",
  Roadmap: "/roadmap",
  "Twitter/X": "/docs",
  Instagram: "/docs",
  TikTok: "/docs",
  WhatsApp: "/docs",
  LinkedIn: "/docs",
  Facebook: "/docs",
  YouTube: "/docs",
  Threads: "/docs",
  Reddit: "/docs",
  Pinterest: "/docs",
  Bluesky: "/docs",
  Telegram: "/docs",
  Snapchat: "/docs",
  "Google Business": "/docs",
  Discord: "/docs",
  "Meta Ads": "/docs",
  "Google Ads": "/docs",
  Blog: "/blog",
  Terms: "/terms",
  Privacy: "/privacy",
  "Content Guidelines": "/content-guidelines",
  About: "/about",
  Customers: "/customers",
  Careers: "/careers",
  Status: "/status",
  "vs Buffer": "/docs",
  "vs Ayrshare": "/docs",
  "vs Blotato": "/docs",
  "vs Publer": "/docs",
  "vs Postiz": "/docs",
  "vs Unipile": "/docs",
  GitHub: "/docs",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{ baseTheme: dark }}
    >
      <html lang="en" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-100 font-[family-name:var(--font-geist)]">
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="border-t border-white/10 bg-[#0a0a0a]">
            <div className="mx-auto max-w-6xl px-6 py-14">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(FOOTER).map(([heading, links]) => (
                  <div key={heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{heading}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                      {links.map((label) => (
                        <li key={label}>
                          <Link href={LINK_HREF[label] ?? "#"} className="text-zinc-400 transition-colors hover:text-white">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-zinc-500 sm:flex-row">
                <span className="font-semibold text-zinc-300">baliyoban</span>
                <div className="flex items-center gap-6">
                  <Link href="/privacy" className="hover:text-white">Privacy</Link>
                  <Link href="/terms" className="hover:text-white">Terms</Link>
                  <Link href="/data-deletion" className="hover:text-white">Data Deletion</Link>
                  <span>© 2026 baliyoban</span>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
