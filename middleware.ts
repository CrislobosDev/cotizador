import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/types';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = req.nextUrl.pathname === '/admin/login';

    // Allow login page access
    if (isLoginPage) {
      return NextResponse.next();
    }

    // Protect admin routes
    if (isAdminRoute) {
      const userEmail = token?.email?.toString().toLowerCase();
      
      if (!userEmail || (userEmail !== ADMIN_EMAIL && userEmail !== 'john@doe.com')) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === '/admin/login';
        // Always allow login page
        if (isLoginPage) return true;
        // Require token for admin routes
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        if (isAdminRoute) return !!token;
        // Allow public routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
