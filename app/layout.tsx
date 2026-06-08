import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "baliyoban — Post everywhere at once",
  description: "Connect your social accounts and publish to all of them at the same time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-white text-zinc-900 font-[family-name:var(--font-geist)]">
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="border-t border-zinc-200 px-6 py-8">
            <nav className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">baliyoban</span>
              <Link href="/privacy" className="hover:text-zinc-900">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-zinc-900">Terms of Service</Link>
              <Link href="/data-deletion" className="hover:text-zinc-900">Data Deletion</Link>
            </nav>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
