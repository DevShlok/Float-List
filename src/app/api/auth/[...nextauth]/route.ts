import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const allowedDomain = process.env.ALLOWED_DOMAIN;
        // If allowedDomain is set in env, restrict access.
        // Otherwise, allow anyone (for testing).
        if (allowedDomain && profile?.email) {
          return profile.email.endsWith(`@${allowedDomain}`);
        }
      }
      return true; 
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

export { handler as GET, handler as POST };
