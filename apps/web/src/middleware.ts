import { type NextRequest, NextResponse } from "next/server";
import { env } from "./env";

export const config = {
  matcher: [
    // Protect the entire /api/cron/* with a bearer token
    "/api/cron/:function*",
  ],
};

export function middleware(request: NextRequest) {
  const endpoint = request.url.split("/");
  endpoint.splice(0, 3);

  // Should never happen
  if (endpoint[0] !== "api") {
    return Response.json(
      { success: false, message: "internal server error" },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (endpoint[1] === "cron") {
    if (scheme !== "Bearer" || token !== env.CRON_API_TOKEN) {
      return Response.json(
        { success: false, message: "authentication failed" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}
