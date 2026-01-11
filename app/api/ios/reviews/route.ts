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
 * Returns one review at a time with total count
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
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get total count - use same query but only select id
    const allReviews = await supabaseFetch.select<{ id: string }>(
      'review_schedules',
      {
        columns: 'id,knowledge_points!inner(user_id)',
        filters: {
          review_date: `lte.${today}`,
          completed: false,
          'knowledge_points.user_id': user.id,
        },
      },
      accessToken
    );
    const total = allReviews.length;

    // Get one review at the specified offset
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
        limit: 1,
        offset: offset,
      },
      accessToken
    );

    return NextResponse.json({ 
      reviews: reviews,
      total: total
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
