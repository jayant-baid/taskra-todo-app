import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { query } from "@/lib/server/db";
import { generateSalt, hashPassword, createSession } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || "").trim().toLowerCase();
    const password = body.password || "";

    if (!username || username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be at least 3 characters long.",
        },
        { status: 400 },
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 4 characters long.",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existing = await query("SELECT id FROM users WHERE username = ?", [
      username,
    ]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Username is already taken." },
        { status: 409 },
      );
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const createdAt = new Date().toISOString();

    await query(
      `
      INSERT INTO users (id, username, password_hash, salt, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      [userId, username, passwordHash, salt, createdAt],
    );

    // Create session
    const { token, expiresAt } = await createSession(userId);

    const response = NextResponse.json({
      success: true,
      user: { id: userId, username, createdAt },
      token,
    });

    // Set secure httpOnly cookie
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });

    return response;
  } catch (err: unknown) {
    console.error("Registration error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
