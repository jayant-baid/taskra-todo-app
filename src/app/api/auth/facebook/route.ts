import { NextResponse } from "next/server";
import {
  isFacebookOAuthConfigured,
  getFacebookAuthUrl,
  getAppOrigin,
} from "@/lib/server/oauth";

export async function GET(request: Request) {
  const origin = getAppOrigin(request);

  if (!isFacebookOAuthConfigured()) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(
        'Facebook OAuth credentials are not configured. Please add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to your .env.local file and restart your dev server.'
      )}`
    );
  }

  const authUrl = getFacebookAuthUrl(origin);
  return NextResponse.redirect(authUrl);
}
