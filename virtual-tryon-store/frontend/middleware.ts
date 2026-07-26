import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // InsForge handles auth via httpOnly cookies, no middleware needed
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
