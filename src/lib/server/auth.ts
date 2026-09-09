import crypto from "node:crypto";
import { query } from "./db";

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

export async function createSession(
  userId: string,
): Promise<{ token: string; expiresAt: string }> {
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await query(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [token, userId, now.toISOString(), expiresAt],
  );
  return { token, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  await query("DELETE FROM sessions WHERE token = ?", [token]);
}

export async function getUserFromToken(
  token: string,
): Promise<UserRecord | null> {
  if (!token) return null;
  const rows = await query<UserRecord>(
    `SELECT u.id, u.username, u.role, u.created_at
     FROM sessions s JOIN users u ON s.user_id = u.id
     WHERE s.token = ? AND s.expires_at > ?`,
    [token, new Date().toISOString()],
  );
  return rows[0] || null;
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.substring(7).trim();
  const cookieHeader = request.headers.get("cookie");
  const match = cookieHeader?.match(/(?:^|;\s*)session_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function getAuthUser(
  request: Request,
): Promise<UserRecord | null> {
  const token = extractTokenFromRequest(request);
  return token ? getUserFromToken(token) : null;
}
