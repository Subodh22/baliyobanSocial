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
  title: "baliyoban",
  description:
    "Unified social media API: post, schedule, promote and engage across 15 platforms with one REST call. Free up to 2 accounts. MCP server for AI agents.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

const FOOTER: Record<string, { label: string; href: string }[]> = {
  PRODUCT: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Compose", href: "/compose" },
    { label: "Documentation", href: "/docs" },
    { label: "Pricing", href: "/pricing" },
    { label: "Features", href: "/features" },
    { label: "AI Agents", href: "/ai-agents" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Sign Up", href: "/sign-up" },
  ],
  INTEGRATIONS: [
    { label: "Twitter/X", href: "/integrations/twitter" },
    { label: "Instagram", href: "/integrations/instagram" },
    { label: "TikTok", href: "/integrations/tiktok" },
    { label: "WhatsApp", href: "/integrations/whatsapp" },
    { label: "LinkedIn", href: "/integrations/linkedin" },
    { label: "Facebook", href: "/integrations/facebook" },
    { label: "YouTube", href: "/integrations/youtube" },
    { label: "Threads", href: "/integrations/threads" },
    { label: "Reddit", href: "/integrations/reddit" },
    { label: "Pinterest", href: "/integrations/pinterest" },
    { label: "Bluesky", href: "/integrations/bluesky" },
    { label: "Telegram", href: "/integrations/telegram" },
    { label: "Snapchat", href: "/integrations/snapchat" },
    { label: "Google Business", href: "/integrations/google-business" },
    { label: "Discord", href: "/integrations/discord" },
    { label: "Meta Ads", href: "/integrations/meta-ads" },
    { label: "Google Ads", href: "/integrations/google-ads" },
  ],
  LEGAL: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Data Deletion", href: "/data-deletion" },
    { label: "Content Guidelines", href: "/content-guidelines" },
  ],
  COMPANY: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Customers", href: "/customers" },
    { label: "Careers", href: "/careers" },
    { label: "Status", href: "/status" },
  ],
  COMPARISONS: [
    { label: "vs Buffer", href: "/compare/buffer" },
    { label: "vs Ayrshare", href: "/compare/ayrshare" },
    { label: "vs Blotato", href: "/compare/blotato" },
    { label: "vs Publer", href: "/compare/publer" },
    { label: "vs Postiz", href: "/compare/postiz" },
    { label: "vs Unipile", href: "/compare/unipile" },
  ],
  COMMUNITY: [
    { label: "LinkedIn", href: "https://linkedin.com/company/baliyoban" },
    { label: "YouTube", href: "https://youtube.com/@baliyoban" },
    { label: "Telegram", href: "https://t.me/baliyoban" },
    { label: "GitHub", href: "https://github.com/baliyoban" },
  ],
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
                      {links.map((item) => (
                        <li key={item.label}>
                          <Link href={item.href} className="text-[#5A5A5A] transition-colors hover:text-[#0A0A0A]">
                            {item.label}
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
