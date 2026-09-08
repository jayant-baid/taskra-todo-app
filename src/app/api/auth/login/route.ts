import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { hashPassword, createSession } from '@/lib/server/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, username, password_hash, salt, created_at
      FROM users
      WHERE username = ?
    `);

    const user = stmt.get(username) as {
      id: string;
      username: string;
      password_hash: string;
      salt: string;
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Create session
    const { token, expiresAt } = createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, createdAt: user.created_at },
      token,
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt),
    });

    return response;
  } catch (err: unknown) {
    console.error('Login error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
