import type { NextConfig } from "next";

// TikTok's Content Posting API (PULL_FROM_URL) only accepts media URLs whose
// host the developer has verified. Our uploads live on Vercel Blob
// (*.public.blob.vercel-storage.com) — a host we can't verify, since we don't
// control its DNS. So we proxy them under our own (verifiable) domain at
// /media/*. A rewrite is a transparent proxy (HTTP 200), NOT a redirect —
// important because TikTok rejects any 3xx response.
//
// Set BLOB_PUBLIC_HOST to the blob store host, e.g.
//   BLOB_PUBLIC_HOST=abc123.public.blob.vercel-storage.com
// (the host portion of any uploaded blob URL).
const blobHost = process.env.BLOB_PUBLIC_HOST;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!blobHost) return [];
    return [
      {
        source: "/media/:path*",
        destination: `https://${blobHost}/:path*`,
      },
    ];
  },
};

export default nextConfig;
