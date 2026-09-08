import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server/auth';

export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at,
      },
    });
  } catch (err: unknown) {
    console.error('Auth check error:', err);
    return NextResponse.json({ success: true, user: null });
  }
}
