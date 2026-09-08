import { NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  findOrCreateOAuthUser,
  getAppOrigin,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const origin = getAppOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    const errorMsg = error || "Authorization code was not returned by Google";
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(errorMsg)}`,
    );
  }

  try {
    const profile = await exchangeGoogleCode(code, origin);
    const { token, expiresAt } = findOrCreateOAuthUser(profile);

    const redirectResponse = NextResponse.redirect(
      `${origin}/?auth_success=google&token=${encodeURIComponent(token)}`,
    );

    redirectResponse.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });

    return redirectResponse;
  } catch (err: unknown) {
    console.error("Google OAuth callback error:", err);
    const message =
      err instanceof Error ? err.message : "Google authentication failed";
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(message)}`,
    );
  }
}
