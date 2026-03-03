import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their allowed roles
const protectedRoutes: Record<string, string[]> = {
  "/student": ["student"],
  "/provider": ["provider"],
  "/admin": ["admin"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/chat",
  "/services",
  "/browse",
  "/business", // Public business listing pages
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    // Exception: Don't allow authenticated dashboard routes in public
    if (!pathname.startsWith("/student/") && 
        !pathname.startsWith("/provider/") && 
        !pathname.startsWith("/admin/")) {
      return NextResponse.next();
    }
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get("auth-token")?.value;
  const userRole = request.cookies.get("user-role")?.value;

  // If no auth token and trying to access protected route
  const isProtectedRoute = Object.keys(protectedRoutes).some(
    route => pathname.startsWith(route)
  );

  if (isProtectedRoute && !authToken) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (authToken && userRole) {
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          const dashboardUrl = getDashboardUrl(userRole);
          return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "provider":
      return "/provider/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
