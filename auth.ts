import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Twitter from "next-auth/providers/twitter";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";
import TikTok from "next-auth/providers/tiktok";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
      authorization: {
        params: {
          scope: "tweet.read tweet.write users.read offline.access",
        },
      },
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      authorization: {
        params: {
          scope: "public_profile,pages_manage_posts,instagram_basic,instagram_content_publish",
        },
      },
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
    }),
    TikTok({
      clientId: process.env.AUTH_TIKTOK_ID!,
      clientSecret: process.env.AUTH_TIKTOK_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
