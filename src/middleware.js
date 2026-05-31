import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or empty in .env.local! Middleware auth checks are bypassed.');
    
    const mockSession = request.cookies.get('sb-mock-session')?.value;

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!mockSession) {
        return NextResponse.redirect(new URL('/auth/entrar', request.url))
      }
      const mockSessionLower = String(mockSession).toLowerCase();
      const isAdmin = mockSessionLower === 'admin' || mockSessionLower.includes('admin');
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
    }

    // Redirect logged-in users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth/entrar') && mockSession) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    return supabaseResponse;
  }


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/entrar', request.url))
    }
    if (user.user_metadata?.tipo !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth/entrar') && user) {
    return NextResponse.redirect(new URL('/home', request.url))
  }


  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
}
