import { NextRequest, NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase-fetch';
import { createDefaultKnowledgePoints } from '@/lib/knowledge-service';

/**
 * Sign up with email/password - iOS API
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    let response = await supabaseFetch.signUp(email, password);

    // Normalize response
    let user = response.user || response;
    let access_token = response.access_token;
    let refresh_token = response.refresh_token;
    let expires_at = response.expires_at;

    // If no access token, try to sign in
    if (user && user.id && !access_token) {
      try {
        response = await supabaseFetch.signIn(email, password);
        user = response.user;
        access_token = response.access_token;
        refresh_token = response.refresh_token;
        expires_at = response.expires_at;
      } catch (loginError) {
        console.error('Auto sign in error:', loginError);
        return NextResponse.json(
          { error: 'Registration successful. Please check your email to confirm your account.' },
          { status: 200 }
        );
      }
    }

    if (user && user.id && access_token) {
      // Create default knowledge points
      try {
        await createDefaultKnowledgePoints(access_token);
      } catch (error) {
        console.error('Failed to create default knowledge points:', error);
        // Don't fail the signup if this fails
      }

      return NextResponse.json({
        user,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at,
      });
    }

    throw new Error('Registration failed');
  } catch (error: any) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: error.message || 'Sign up failed' },
      { status: 400 }
    );
  }
}
