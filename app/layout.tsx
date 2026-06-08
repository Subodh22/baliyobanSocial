import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialHub — Post everywhere at once",
  description: "Connect your social accounts and post to all of them simultaneously.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-[family-name:var(--font-geist)]">
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t border-zinc-900 px-6 py-6">
          <nav className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span>© SocialHub</span>
            <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
            <Link href="/data-deletion" className="hover:text-zinc-300">Data Deletion</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
