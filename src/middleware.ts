import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // بیزینس‌ها نباید به مسیر customer دسترسی داشته باشند
    if (path.startsWith('/customer') && token?.role === 'BUSINESS_OWNER') {
      return NextResponse.redirect(new URL('/business/dashboard', req.url))
    }

    // مشتری‌ها نباید به مسیر business دسترسی داشته باشند
    if (path.startsWith('/business') && token?.role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/customer', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith('/business') || path.startsWith('/customer')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/business/:path*', '/customer/:path*'],
}
