import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  let user = null

  // Development mode - check for real user session first, then fall back to mock user
  if (process.env.NODE_ENV === 'development') {
    // Check if user has a real session first
    const userCookie = request.cookies.get('user-session')
    if (userCookie) {
      try {
        user = JSON.parse(userCookie.value)
        console.log('Development mode: Using real user session', user.email)
      } catch (error) {
        console.error('Error parsing user session in dev mode:', error)
        // Fall through to mock user if session is invalid
      }
    }

    // Only use mock user if no real session exists and not on login/register pages
    if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
      console.log('Development mode: Using mock user ID 7 with super_admin access')
      user = {
        id: 7,
        first_name: 'Dev',
        last_name: 'User',
        email: 'dev@barangay-konek.local',
        user_type: 'super_admin',
        mbarangayid: 1
      }
    }
  }

  // Check if Supabase credentials are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured. Skipping authentication middleware.')
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user session from cookies or use development mode user
  const userCookie = request.cookies.get('user-session')

  if (userCookie && !user) {
    try {
      user = JSON.parse(userCookie.value)
    } catch (error) {
      console.error('Error parsing user session:', error)
      // Clear invalid cookie
      const response = NextResponse.next()
      response.cookies.delete('user-session')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // If user is not signed in and the current path is not login or register, redirect to login
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/register') && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is signed in and trying to access login or register, redirect to appropriate dashboard
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    const url = request.nextUrl.clone()

    // Get user type from session
    const userType = user.user_type

    if (userType === 'super_admin') {
      url.pathname = '/admin'
    } else if (userType === 'official') {
      url.pathname = '/official'
    } else if (userType === 'resident') {
      url.pathname = '/resident'
    } else {
      url.pathname = '/resident' // default fallback
    }

    return NextResponse.redirect(url)
  }

  // Role-based access control for specific routes
  if (user) {
    const userType = user.user_type

    // Strict role-based access control - users can only access their own routes
    if (userType === 'resident') {
      // Residents can only access /resident routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/official')) {
        const url = request.nextUrl.clone()
        url.pathname = '/resident'
        return NextResponse.redirect(url)
      }
    } else if (userType === 'official') {
      // Officials can only access /official routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/resident')) {
        const url = request.nextUrl.clone()
        url.pathname = '/official'
        return NextResponse.redirect(url)
      }
    } else if (userType === 'super_admin') {
      // Super admins can only access /admin routes
      if (pathname.startsWith('/resident') || pathname.startsWith('/official')) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    } else {
      // Unknown user type, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Add user data to request headers for pages to access
  const response = NextResponse.next()
  if (user) {
    response.headers.set('x-user-data', JSON.stringify(user))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}