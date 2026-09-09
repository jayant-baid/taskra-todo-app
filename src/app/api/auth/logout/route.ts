import { NextResponse } from "next/server";
import { extractTokenFromRequest, deleteSession } from "@/lib/server/auth";

export async function POST(request: Request) {
  try {
    const token = extractTokenFromRequest(request);
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");
    return response;
  } catch (err: unknown) {
    console.error("Logout error:", err);
    return NextResponse.json({ success: true });
  }
}
