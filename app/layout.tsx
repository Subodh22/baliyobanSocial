import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "baliyoban — Social Media API for Developers & AI Agents | 15 Platforms, One Call",
  description:
    "Unified social media API: post, schedule, promote and engage across 15 platforms with one REST call. Free up to 2 accounts. MCP server for AI agents.",
};

const FOOTER = {
  PRODUCT: ["Dashboard", "Compose", "Documentation", "Pricing", "Features", "AI Agents", "Sign In", "Sign Up"],
  INTEGRATIONS: [
    "Twitter/X", "Instagram", "TikTok", "WhatsApp", "LinkedIn", "Facebook",
    "YouTube", "Threads", "Reddit", "Pinterest", "Bluesky", "Telegram",
    "Snapchat", "Google Business", "Discord", "Meta Ads", "Google Ads",
  ],
  LEGAL: ["Terms of Service", "Privacy Policy", "Data Deletion", "Content Guidelines"],
  COMPANY: ["About", "Blog", "Customers", "Careers", "Status"],
  COMPARISONS: ["vs Buffer", "vs Ayrshare", "vs Blotato", "vs Publer", "vs Postiz", "vs Unipile"],
  COMMUNITY: ["LinkedIn", "YouTube", "Telegram", "GitHub"],
} as const;

const LINK_HREF: Record<string, string> = {
  Dashboard: "/dashboard",
  Compose: "/compose",
  Documentation: "/#endpoints",
  Pricing: "/#pricing",
  Features: "/#what",
  "AI Agents": "/#endpoints",
  "Sign In": "/sign-in",
  "Sign Up": "/sign-up",
  "Twitter/X": "/#platforms",
  Instagram: "/#platforms",
  TikTok: "/#platforms",
  WhatsApp: "/#platforms",
  LinkedIn: "/#platforms",
  Facebook: "/#platforms",
  YouTube: "/#platforms",
  Threads: "/#platforms",
  Reddit: "/#platforms",
  Pinterest: "/#platforms",
  Bluesky: "/#platforms",
  Telegram: "/#platforms",
  Snapchat: "/#platforms",
  "Google Business": "/#platforms",
  Discord: "/#platforms",
  "Meta Ads": "/#platforms",
  "Google Ads": "/#platforms",
  "Terms of Service": "/terms",
  "Privacy Policy": "/privacy",
  "Data Deletion": "/data-deletion",
  "Content Guidelines": "/terms",
  About: "/",
  Blog: "/",
  Customers: "/",
  Careers: "/",
  Status: "/",
  "vs Buffer": "/",
  "vs Ayrshare": "/",
  "vs Blotato": "/",
  "vs Publer": "/",
  "vs Postiz": "/",
  "vs Unipile": "/",
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
    >
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-white text-[#0A0A0A] font-[family-name:var(--font-inter)]">
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="border-t border-[#E8E8E8] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-14">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                {Object.entries(FOOTER).map(([heading, links]) => (
                  <div key={heading}>
                    <h3 className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">{heading}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                      {links.map((label) => (
                        <li key={label}>
                          <Link href={LINK_HREF[label] ?? "#"} className="text-[#5A5A5A] transition-colors hover:text-[#0A0A0A]">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E8E8E8] pt-8 text-sm text-[#969696] sm:flex-row">
                <span className="font-semibold text-[#0A0A0A]">baliyoban</span>
                <div className="flex items-center gap-6">
                  <Link href="/privacy" className="hover:text-[#0A0A0A]">Privacy</Link>
                  <Link href="/terms" className="hover:text-[#0A0A0A]">Terms</Link>
                  <Link href="/data-deletion" className="hover:text-[#0A0A0A]">Data Deletion</Link>
                  <span>&copy; 2026 baliyoban</span>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
