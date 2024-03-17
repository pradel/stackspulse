import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env";

export const config = {
  // Protect the entire /api/chainhooks/* with a bearer token
  matcher: "/api/chainhooks/:function*",
};

export function middleware(request: NextRequest) {
  const authorization = request.headers.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || token !== env.CHAINHOOKS_API_TOKEN) {
    return Response.json(
      { success: false, message: "authentication failed" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}
