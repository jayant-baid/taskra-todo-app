import { NextResponse } from "next/server";
import {
  isGoogleOAuthConfigured,
  getGoogleAuthUrl,
  getAppOrigin,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const origin = getAppOrigin(request);

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(
        'Google OAuth credentials are not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file and restart your dev server.'
      )}`
    );
  }

  const authUrl = getGoogleAuthUrl(origin);
  return NextResponse.redirect(authUrl);
}
