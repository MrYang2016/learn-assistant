import { NextRequest, NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase-fetch';

/**
 * Complete a review - iOS API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // Verify user
    const user = await supabaseFetch.getUser(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authorization' },
        { status: 401 }
      );
    }

    const { recallText } = await request.json();

    // Update review schedule
    await supabaseFetch.update(
      'review_schedules',
      {
        completed: true,
        completed_at: new Date().toISOString(),
        recall_text: recallText || null,
      },
      { id: params.id },
      {},
      accessToken
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Complete review error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
