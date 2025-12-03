import { updateSession } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter';

export async function middleware(request) {
  const { pathname } = new URL(request.url);

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    try {
      // Check rate limit
      const result = await rateLimiter.check(request, {
        pathname,
        // TODO: Extract userId and userRole from session if needed
        // userId: session?.user?.id,
        // userRole: session?.user?.role
      });

      // If rate limit exceeded, return 429
      if (!result.allowed) {
        const response = NextResponse.json(
          {
            error: result.message || 'Too many requests',
            retryAfter: result.retryAfter
          },
          { status: 429 }
        );

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', result.limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
        response.headers.set('Retry-After', result.retryAfter.toString());

        return response;
      }

      // Continue with the request and add rate limit headers
      const response = await updateSession(request);

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      if (result.resetTime) {
        response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      }

      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      return await updateSession(request);
    }
  }

  // For non-API routes, just update session
  return await updateSession(request);
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
