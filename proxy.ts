import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: 31536000, // 1 YEAR
            })
          )
        },
      },
      cookieOptions: {
        maxAge: 31536000, // 1 YEAR
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public pages that anyone can see
  const isPublicPage = 
    path === '/' || 
    path.startsWith('/listing') || 
    path.startsWith('/about') || 
    path.startsWith('/privacy') ||
    path.startsWith('/api')

  // Auth pages (where logged-in users shouldn't go back to)
  const isAuthPage = path.startsWith('/auth')

  // 1. If not logged in and trying to access a PRIVATE page, redirect to login
  if (!user && !isPublicPage && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // 2. If logged in and trying to access AUTH pages, redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Admin Security
  if (path.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Check if user is admin using the security-definer RPC (avoids RLS recursion)
    const { data: adminResult } = await supabase.rpc('is_admin')

    if (!adminResult) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
