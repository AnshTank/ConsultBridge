import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/categories", 
    "/category/(.*)", 
    "/consultancies",
    "/consultancy/(.*)",
    "/about", 
    "/contact",
    "/sign-up",
    "/sign-in",
    "/api/(.*)",
    "/consultancy-admin",
    "/consultancy-setup"
  ],
  ignoredRoutes: [
    "/api/webhook", 
    "/_next", 
    "/favicon.ico",
    "/((?!api|trpc))(_next/static)(.*)",
    "/((?!api|trpc))(_next/image)(.*)"
  ],
  debug: true,
  afterAuth(auth, req, evt) {
    // For debugging
    console.log("Auth state:", auth.isPublicRoute, auth.userId);
    
    if (auth.userId) {
      const role = auth.user?.publicMetadata?.role;
      const url = req.nextUrl.pathname;
      
      // If user is signed in and on homepage, redirect based on role
      if (url === "/") {
        if (role === "consultancy") {
          return Response.redirect(new URL("/consultancy-dashboard", req.url));
        } else if (role === "user") {
          return Response.redirect(new URL("/dashboard", req.url));
        }
      }
      
      // Consultancy role redirects
      if (role === "consultancy") {
        if (url === "/dashboard") {
          return Response.redirect(new URL("/consultancy-dashboard", req.url));
        }
      }
      
      // User role redirects
      if (role === "user" && url === "/consultancy-dashboard") {
        return Response.redirect(new URL("/dashboard", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};