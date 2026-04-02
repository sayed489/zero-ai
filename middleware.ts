import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl
  // Chat is free to access without auth (local Nano model)
  const protectedRoutes = ["/settings", "/api/agent", "/api/memory"]
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized. Please log in first." },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/api/agent/:path*",
    "/api/memory/:path*",
  ],
}

