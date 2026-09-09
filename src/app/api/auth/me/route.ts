import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err: unknown) {
    console.error("Auth check error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to check authentication status" },
      { status: 500 },
    );
  }
}
