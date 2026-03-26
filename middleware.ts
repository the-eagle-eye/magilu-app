export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/((?!login|tienda|api/auth|api/admin|_next/static|_next/image|favicon.ico|uploads).*)'],
}
