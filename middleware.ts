import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('thailand-map-auth')
  const isAuthenticated = authCookie?.value === 'authenticated'
  
  // If trying to access /map without being authenticated, redirect to login
  if (request.nextUrl.pathname.startsWith('/map') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and trying to access login, redirect to map
  if (request.nextUrl.pathname.startsWith('/login') && isAuthenticated) {
    return NextResponse.redirect(new URL('/map', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}