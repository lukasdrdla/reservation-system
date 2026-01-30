import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = req.nextUrl.pathname === '/admin/login';

    // Pokud je na login stránce a je přihlášený, přesměrovat na dashboard
    if (isLoginPage && token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        const isLoginPage = req.nextUrl.pathname === '/admin/login';

        // Povolit přístup na login stránku vždy
        if (isLoginPage) {
          return true;
        }

        // Admin routes vyžadují token
        if (isAdminRoute) {
          return !!token;
        }

        // Ostatní stránky jsou veřejné
        return true;
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
