import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request
  });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({
          name,
          value,
          options
        }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({
          name,
          value,
          options
        }) => supabaseResponse.cookies.set(name, value, options));
      }
    }
  });

  // refreshing the auth token
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Protect shop-portal and admin routes (except login pages)
  if (pathname.startsWith('/shop-portal') && !pathname.startsWith('/shop-portal/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/shop-portal/login', request.url));
    }
  }
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is admin for admin-dashboard routes
    if (pathname.startsWith('/admin-dashboard')) {
      const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@kulhadchai.shop';
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }
  return supabaseResponse;
}
