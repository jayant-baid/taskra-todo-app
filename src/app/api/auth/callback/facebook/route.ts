import { NextResponse } from "next/server";
import {
  exchangeFacebookCode,
  findOrCreateOAuthUser,
  getAppOrigin,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const origin = getAppOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error =
    url.searchParams.get("error_description") || url.searchParams.get("error");

  if (error || !code) {
    const errorMsg = error || "Authorization code was not returned by Facebook";
    return NextResponse.redirect(
      `${origin}/auth/callback?provider=facebook&error=${encodeURIComponent(errorMsg)}`,
    );
  }

  try {
    const profile = await exchangeFacebookCode(code, origin);
    const { token, expiresAt } = findOrCreateOAuthUser(profile);

    const redirectResponse = NextResponse.redirect(
      `${origin}/auth/callback?provider=facebook&token=${encodeURIComponent(token)}`,
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
    console.error("Facebook OAuth callback error:", err);
    const message =
      err instanceof Error ? err.message : "Facebook authentication failed";
    return NextResponse.redirect(
      `${origin}/auth/callback?provider=facebook&error=${encodeURIComponent(message)}`,
    );
  }
}
