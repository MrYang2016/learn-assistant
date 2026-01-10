import { NextRequest, NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase-fetch';

interface ReviewSchedule {
  id: string;
  knowledge_point_id: string;
  review_number: number;
  review_date: string;
  completed: boolean;
  completed_at: string | null;
  recall_text: string | null;
  knowledge_points: {
    question: string;
    answer: string;
  };
}

/**
 * Get today's reviews - iOS API
 */
export async function GET(request: NextRequest) {
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

    const today = new Date().toISOString().split('T')[0];

    // Get today's reviews with knowledge points
    const reviews = await supabaseFetch.select<ReviewSchedule>(
      'review_schedules',
      {
        columns: '*,knowledge_points!inner(question,answer,user_id)',
        filters: {
          review_date: `lte.${today}`,
          completed: false,
          'knowledge_points.user_id': user.id,
        },
        order: { column: 'review_date', ascending: true },
      },
      accessToken
    );

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
