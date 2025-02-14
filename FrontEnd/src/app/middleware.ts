import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token");

  if (!token) {
    return NextResponse.redirect(new URL("/?unauthorized=true", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to the dashboard page
export const config = {
  matcher: "/dashboard", // 👈 Only protect this route
};
