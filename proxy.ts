import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Tinystep Admin"',
    },
  })
}

function parseBasicAuth(value: string | null) {
  if (!value?.startsWith('Basic ')) return null

  try {
    const decoded = atob(value.slice('Basic '.length))
    const separatorIndex = decoded.indexOf(':')

    if (separatorIndex === -1) return null

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const expectedUsername = process.env.ADMIN_USERNAME
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    return unauthorized()
  }

  const credentials = parseBasicAuth(request.headers.get('authorization'))

  if (credentials?.username !== expectedUsername || credentials.password !== expectedPassword) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
