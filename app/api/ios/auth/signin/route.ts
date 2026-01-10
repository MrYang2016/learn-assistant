import { NextRequest, NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase-fetch';

/**
 * Sign in with email/password - iOS API
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await supabaseFetch.signIn(email, password);

    return NextResponse.json({
      user: response.user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: response.expires_at,
    });
  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: error.message || 'Sign in failed' },
      { status: 401 }
    );
  }
}
