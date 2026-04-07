import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. PERMITIR ACESSO AO LOGIN SEMPRE
    if (pathname === '/login') {
        return NextResponse.next();
    }

    // 2. REDIRECIONAR RAIZ PARA LOGIN (Se não estiver logado)
    if (pathname === '/') {
        if (!token) return NextResponse.redirect(new URL('/login', request.url));
        return NextResponse.next();
    }

    // 3. SE NÃO TEM TOKEN E TENTA ENTRAR NA HOME, MANDA PRO LOGIN
    if (!token && pathname.startsWith('/home')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/home/:path*', '/admin/:path*'],
};