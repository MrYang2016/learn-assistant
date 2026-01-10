import { NextRequest, NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase-fetch';

/**
 * Refresh token - iOS API
 * 刷新访问令牌
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const response = await supabaseFetch.refreshSession(refreshToken);

    return NextResponse.json({
      user: response.user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: response.expires_at,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh token' },
      { status: 401 }
    );
  }
}
