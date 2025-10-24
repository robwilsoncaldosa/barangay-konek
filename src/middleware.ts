// middleware.ts (FIXED for Official and Super Admin)
import { NextResponse, type NextRequest } from 'next/server'

const BLOCKED_LOGIN_PAGES = [
  '/',
  '/admin/login',
  '/official/login',
  '/resident/login'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userCookie = request.cookies.get('user-session')
  let user = null
  const response = NextResponse.next()

  // --- 1. Get User Session and Set Headers ---
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value)
      // Pass user data via header for Server Components (like /official/page.tsx)
      response.headers.set('x-user-data', userCookie.value)
    } catch (error) {
      console.error('Error parsing user session in middleware:', error)
      response.cookies.delete('user-session')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // --- 2. GLOBAL REDIRECTION LOGIC ---
  if (user) {
    const userType = user.user_type

    if (BLOCKED_LOGIN_PAGES.includes(pathname) || pathname === '/') {
      let redirectPath = '';
      if (userType === 'super_admin') redirectPath = '/admin';
      else if (userType === 'official') redirectPath = '/official'; // 👈 Official redirect path
      else if (userType === 'resident') redirectPath = '/resident';

      if (redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // --- 3. ROLE-BASED ACCESS CONTROL (Rerouting users if they access the wrong portal) ---

    // Block non-Admins from /admin
    if (pathname.startsWith('/admin') && userType !== 'super_admin') {
      const url = new URL(userType === 'official' ? '/official' : '/resident', request.url);
      return NextResponse.redirect(url);
    }

    // Block non-Officials from /official
    if (pathname.startsWith('/official') && userType !== 'official') {
      const url = new URL(userType === 'super_admin' ? '/admin' : '/resident', request.url);
      return NextResponse.redirect(url);
    }

    // Block non-Residents from /resident
    if (pathname.startsWith('/resident') && userType !== 'resident') {
      const url = new URL(userType === 'super_admin' ? '/admin' : '/official', request.url);
      return NextResponse.redirect(url);
    }
  }

  // --- 4. General Logout Check ---
  // If user is NOT signed in and trying to access a protected dashboard, redirect to /login
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/official') || pathname.startsWith('/resident'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Final return with updated headers
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}