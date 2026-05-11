import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = (req.auth?.user as any)?.role === "ADMIN"
  const path = req.nextUrl.pathname

  if (!isLoggedIn && path !== "/login" && path !== "/register") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (path.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}