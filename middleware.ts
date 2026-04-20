import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Separate Edge-safe NextAuth instance — only uses authConfig (no bcryptjs)
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ['/admin/:path*'],
};
