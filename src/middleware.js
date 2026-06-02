import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl
  const isAuthPage = pathname.startsWith('/auth')
  const isWaitingPage = pathname === '/auth/aguardando-aprovacao'

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or empty in .env.local! Middleware auth checks are bypassed.');
    
    const mockSession = request.cookies.get('sb-mock-session')?.value;

    if (!mockSession) {
      if (isAuthPage) return supabaseResponse
      return NextResponse.redirect(new URL('/auth/entrar', request.url))
    }

    const mockSessionLower = String(mockSession).toLowerCase();
    const isPending = mockSessionLower.includes('pending') || mockSessionLower.includes('pendente');

    if (isPending) {
      if (isWaitingPage) return supabaseResponse
      return NextResponse.redirect(new URL('/auth/aguardando-aprovacao', request.url))
    }

    // Redirect logged-in active users away from auth pages (except waiting page)
    if (isAuthPage && !isWaitingPage) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      const isAdmin = mockSessionLower === 'admin' || mockSessionLower.includes('admin');
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
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

  if (!user) {
    if (isAuthPage) return supabaseResponse
    return NextResponse.redirect(new URL('/auth/entrar', request.url))
  }

  // Fetch user status and tipo from profiles table to ensure database accuracy
  let userStatus = user.user_metadata?.status || 'pendente';
  let userTipo = user.user_metadata?.tipo || 'atleta';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, tipo')
      .eq('id', user.id)
      .single()

    if (profile) {
      userStatus = profile.status;
      userTipo = profile.tipo;
    }
  } catch (err) {
    console.error('⚠️ Middleware: erro ao carregar perfil do banco:', err.message);
  }

  // If status is pendente, redirect to waiting page
  if (userStatus === 'pendente') {
    if (isWaitingPage) return supabaseResponse
    return NextResponse.redirect(new URL('/auth/aguardando-aprovacao', request.url))
  }

  // If status is not active (suspenso, reprovado, desfiliado), block access
  if (userStatus !== 'ativo') {
    if (isAuthPage) return supabaseResponse
    return NextResponse.redirect(new URL('/auth/entrar', request.url))
  }

  // If logged in and active, redirect away from auth pages
  if (isAuthPage && !isWaitingPage) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (userTipo !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/auth/:path*',
    '/home',
    '/home/:path*',
    '/atletas',
    '/atletas/:path*',
    '/filiais',
    '/filiais/:path*',
    '/filial',
    '/filial/:path*',
    '/eventos-dash',
    '/eventos-dash/:path*',
    '/noticias',
    '/noticias/:path*',
    '/exames',
    '/exames/:path*',
    '/financeiro',
    '/financeiro/:path*',
    '/ranking',
    '/ranking/:path*',
    '/configuracoes',
    '/configuracoes/:path*',
    '/documentos',
    '/documentos/:path*',
    '/auditoria',
    '/auditoria/:path*',
  ],
}
