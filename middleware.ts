import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
    '/companies',
    '/leads',
    '/contacts',
    '/deals',
    '/activities',
    '/tasks',
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Allow public routes
    if (pathname === '/login' || pathname === '/register') {
        return NextResponse.next();
    }

    // Check if the route is protected
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/';

    if (isProtected && !token) {
        // Redirect to login if no token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
