import type { NextAuthConfig } from 'next-auth';

// Edge-safe config — no Node.js-only imports (no bcrypt, no Credentials provider)
// The Credentials provider with bcryptjs lives in auth.ts (Node.js only)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // /admin and /admin/ → redirect to dashboard or login
      if (path === '/admin' || path === '/admin/') {
        return Response.redirect(
          new URL(isLoggedIn ? '/admin/dashboard' : '/admin/login', nextUrl)
        );
      }

      // /admin/login → redirect to dashboard if already logged in
      if (path === '/admin/login') {
        if (isLoggedIn) return Response.redirect(new URL('/admin/dashboard', nextUrl));
        return true;
      }

      // All other /admin/* → require login
      if (path.startsWith('/admin')) {
        if (isLoggedIn) return true;
        return false; // NextAuth redirects to signIn page
      }

      return true;
    },
  },
  providers: [],
};
