import crypto from "node:crypto";
import { getDatabase } from "./db";
import { createSession, UserRecord } from "./auth";

export interface OAuthProfile {
  provider: "google" | "facebook";
  providerId: string;
  email?: string;
  name: string;
  avatarUrl?: string;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

export function isFacebookOAuthConfigured(): boolean {
  return Boolean(
    (process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID) &&
    (process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET),
  );
}

export function getAppOrigin(request?: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (request) {
    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "http";
    if (host) {
      return `${proto}://${host}`;
    }
  }
  return "http://localhost:3000";
}

export function getGoogleAuthUrl(
  origin: string,
  state: string = "google_oauth",
): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = `${origin}/api/auth/callback/google`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getFacebookAuthUrl(
  origin: string,
  state: string = "facebook_oauth",
): string {
  const clientId =
    process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID || "";
  const redirectUri = `${origin}/api/auth/callback/facebook`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email,public_profile",
    state,
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  origin: string,
): Promise<OAuthProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = `${origin}/api/auth/callback/google`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const userRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!userRes.ok) {
    throw new Error("Failed to retrieve Google user profile");
  }

  const userData = await userRes.json();
  return {
    provider: "google",
    providerId: userData.sub,
    email: userData.email,
    name: userData.name || userData.email?.split("@")[0] || "Google User",
    avatarUrl: userData.picture,
  };
}

export async function exchangeFacebookCode(
  code: string,
  origin: string,
): Promise<OAuthProfile> {
  const clientId =
    process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID || "";
  const clientSecret =
    process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET || "";
  const redirectUri = `${origin}/api/auth/callback/facebook`;

  const tokenUrl = new URL(
    "https://graph.facebook.com/v19.0/oauth/access_token",
  );
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Facebook token exchange failed: ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const profileUrl = new URL("https://graph.facebook.com/v19.0/me");
  profileUrl.searchParams.set("fields", "id,name,email,picture.type(large)");
  profileUrl.searchParams.set("access_token", accessToken);

  const profileRes = await fetch(profileUrl.toString());
  if (!profileRes.ok) {
    throw new Error("Failed to retrieve Facebook user profile");
  }

  const profileData = await profileRes.json();
  return {
    provider: "facebook",
    providerId: profileData.id,
    email: profileData.email,
    name: profileData.name || "Facebook User",
    avatarUrl: profileData.picture?.data?.url,
  };
}

export function findOrCreateOAuthUser(profile: OAuthProfile): {
  user: UserRecord;
  token: string;
  expiresAt: string;
} {
  const db = getDatabase();

  // 1. Try to find user by provider and providerId
  let user: UserRecord | undefined;
  const findByProviderStmt = db.prepare(`
    SELECT id, username, role, created_at
    FROM users
    WHERE provider = ? AND provider_id = ?
  `);
  const existingProviderUser = findByProviderStmt.get(
    profile.provider,
    profile.providerId,
  ) as
    | {
        id: string;
        username: string;
        role: "user" | "admin";
        created_at: string;
      }
    | undefined;

  if (existingProviderUser) {
    user = existingProviderUser;
  } else if (profile.email) {
    const normalizedEmail = profile.email.trim().toLowerCase();
    // 2. Try to find user by email to link accounts
    const findByEmailStmt = db.prepare(`
      SELECT id, username, role, created_at
      FROM users
      WHERE LOWER(email) = ?
    `);
    const existingEmailUser = findByEmailStmt.get(normalizedEmail) as
      | {
          id: string;
          username: string;
          role: "user" | "admin";
          created_at: string;
        }
      | undefined;

    if (existingEmailUser) {
      // Link provider to this existing user
      const linkStmt = db.prepare(`
        UPDATE users
        SET provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url)
        WHERE id = ?
      `);
      linkStmt.run(
        profile.provider,
        profile.providerId,
        profile.avatarUrl || null,
        existingEmailUser.id,
      );
      user = existingEmailUser;
    }
  }

  // 3. Create a new user if not found
  if (!user) {
    const userId = `usr_${crypto.randomUUID()}`;
    const emailUsername = profile.email?.split("@", 1)[0];
    const cleanBaseName =
      (emailUsername || profile.name || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .substring(0, 30) || "user";
    let username = cleanBaseName;
    let usernameSuffix = 2;
    const usernameExistsStmt = db.prepare(
      "SELECT 1 FROM users WHERE username = ? COLLATE NOCASE LIMIT 1",
    );
    while (usernameExistsStmt.get(username)) {
      username = `${cleanBaseName}_${usernameSuffix}`;
      usernameSuffix += 1;
    }
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, salt, provider, provider_id, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const randomOAuthSecret = `oauth_${crypto.randomBytes(32).toString("hex")}`;
    const randomOAuthSalt = `oauth_${crypto.randomBytes(16).toString("hex")}`;
    insertStmt.run(
      userId,
      username,
      profile.email?.trim().toLowerCase() || null,
      randomOAuthSecret,
      randomOAuthSalt,
      profile.provider,
      profile.providerId,
      profile.avatarUrl || null,
      createdAt,
    );

    user = {
      id: userId,
      username,
      role: "user",
      created_at: createdAt,
    };
  }

  // 4. Create 30-day session
  const { token, expiresAt } = createSession(user.id);
  return { user, token, expiresAt };
}
