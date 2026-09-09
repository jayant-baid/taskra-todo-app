import crypto from "node:crypto";
import { getDatabase } from "./db";

export interface UserRecord {
  id: string;
  username: string;
  role: "user" | "admin";
  created_at: string;
}

export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function createSession(userId: string): {
  token: string;
  expiresAt: string;
} {
  const db = getDatabase();
  const token = crypto.randomUUID();
  const now = new Date();
  // 30-day session
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nowIso = now.toISOString();
  const expiresIso = expires.toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(token, userId, nowIso, expiresIso);

  return { token, expiresAt: expiresIso };
}

export function deleteSession(token: string): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM sessions WHERE token = ?");
  stmt.run(token);
}

export function getUserFromToken(token: string): UserRecord | null {
  if (!token) return null;
  const db = getDatabase();
  const nowIso = new Date().toISOString();

  const stmt = db.prepare(`
    SELECT u.id, u.username, u.role, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `);

  const row = stmt.get(token, nowIso) as
    | {
        id: string;
        username: string;
        role: "user" | "admin";
        created_at: string;
      }
    | undefined;
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    role: row.role,
    created_at: row.created_at,
  };
}

export function extractTokenFromRequest(request: Request): string | null {
  // 1. Check Authorization: Bearer <token>
  const authHeader =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header
  const cookieHeader =
    request.headers.get("cookie") || request.headers.get("Cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

export function getAuthUser(request: Request): UserRecord | null {
  const authHeader =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerUser = getUserFromToken(authHeader.substring(7).trim());
    if (bearerUser) return bearerUser;
  }

  const cookieHeader =
    request.headers.get("cookie") || request.headers.get("Cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
    if (match && match[1]) {
      return getUserFromToken(decodeURIComponent(match[1]));
    }
  }

  return null;
}
