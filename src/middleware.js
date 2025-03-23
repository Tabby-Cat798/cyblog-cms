import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 不需要登录的路径
const publicPaths = ['/login', '/api/auth'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 检查路径是否是公开的
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname.includes('/api/auth')
  );
  
  // 对于静态资源不做处理
  if (pathname.startsWith('/_next') || 
      pathname.includes('/images/') || 
      pathname.includes('/icons/') || 
      pathname.endsWith('.png') || 
      pathname.endsWith('.jpg') || 
      pathname.endsWith('.svg') || 
      pathname.endsWith('.ico')) {
    return NextResponse.next();
  }
  
  // 获取 token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // 是否已认证
  const isAuthenticated = !!token;
  
  // 用户访问公开路径但已登录，则重定向到首页
  if (isPublicPath && isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 用户访问受保护路径但未登录，则重定向到登录页
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 