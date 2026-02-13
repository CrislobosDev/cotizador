import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { ADMIN_EMAIL } from '@/lib/types';

const ADMIN_HASHED_PASSWORD = bcrypt.hashSync('admin123', 10);
const TEST_HASHED_PASSWORD = bcrypt.hashSync('johndoe123', 10);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        
        // Admin user
        if (email === ADMIN_EMAIL) {
          const isValid = await bcrypt.compare(credentials.password, ADMIN_HASHED_PASSWORD);
          if (isValid) {
            return {
              id: '1',
              email: ADMIN_EMAIL,
              name: 'Admin VillaWeb',
              role: 'admin',
            };
          }
        }
        
        // Test user
        if (email === 'john@doe.com') {
          const isValid = await bcrypt.compare(credentials.password, TEST_HASHED_PASSWORD);
          if (isValid) {
            return {
              id: '2',
              email: 'john@doe.com',
              name: 'John Doe',
              role: 'admin',
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string })?.role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { role?: string }).role = token?.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
