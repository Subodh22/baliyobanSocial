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
  PRODUCT: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Compose", href: "/compose" },
    { label: "Documentation", href: "/#endpoints" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Features", href: "/#what" },
    { label: "AI Agents", href: "/#endpoints" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Sign Up", href: "/sign-up" },
  ],
  INTEGRATIONS: [
    { label: "Twitter/X", href: "/#platforms" },
    { label: "Instagram", href: "/#platforms" },
    { label: "TikTok", href: "/#platforms" },
    { label: "WhatsApp", href: "/#platforms" },
    { label: "LinkedIn", href: "/#platforms" },
    { label: "Facebook", href: "/#platforms" },
    { label: "YouTube", href: "/#platforms" },
    { label: "Threads", href: "/#platforms" },
    { label: "Reddit", href: "/#platforms" },
    { label: "Pinterest", href: "/#platforms" },
    { label: "Bluesky", href: "/#platforms" },
    { label: "Telegram", href: "/#platforms" },
    { label: "Snapchat", href: "/#platforms" },
    { label: "Google Business", href: "/#platforms" },
    { label: "Discord", href: "/#platforms" },
    { label: "Meta Ads", href: "/#platforms" },
    { label: "Google Ads", href: "/#platforms" },
  ],
  LEGAL: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Data Deletion", href: "/data-deletion" },
    { label: "Content Guidelines", href: "/terms" },
  ],
  COMPANY: [
    { label: "About", href: "/" },
    { label: "Blog", href: "/" },
    { label: "Customers", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Status", href: "/" },
  ],
  COMPARISONS: [
    { label: "vs Buffer", href: "/" },
    { label: "vs Ayrshare", href: "/" },
    { label: "vs Blotato", href: "/" },
    { label: "vs Publer", href: "/" },
    { label: "vs Postiz", href: "/" },
    { label: "vs Unipile", href: "/" },
  ],
} as const;

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
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                {Object.entries(FOOTER).map(([heading, links]) => (
                  <div key={heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{heading}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                      {links.map((item) => (
                        <li key={item.label}>
                          <Link href={item.href} className="text-zinc-400 transition-colors hover:text-white">
                            {item.label}
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
