import { NextRequest, NextResponse } from 'next/server';
import { supabaseFetch } from '@/lib/supabase-fetch';
import { generateQueryEmbedding } from '@/lib/embedding-service';

interface KnowledgePoint {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  embedding?: number[];
  is_in_review_plan: boolean;
}

/**
 * Get knowledge points - iOS API
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const isInReviewPlan = searchParams.get('is_in_review_plan');

    const filters: any = { user_id: user.id };
    if (isInReviewPlan !== null) {
      filters.is_in_review_plan = isInReviewPlan === 'true';
    }

    const points = await supabaseFetch.select<KnowledgePoint>(
      'knowledge_points',
      {
        filters,
        order: { column: 'created_at', ascending: false },
        limit,
        offset,
      },
      accessToken
    );

    return NextResponse.json({ points });
  } catch (error: any) {
    console.error('Get knowledge points error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create knowledge point - iOS API
 */
export async function POST(request: NextRequest) {
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

    const { question, answer, isInReviewPlan } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Generate embedding
    const text = `${question} ${answer}`;
    const embedding = await generateQueryEmbedding(text);

    // Create knowledge point
    const result = await supabaseFetch.insert<KnowledgePoint>(
      'knowledge_points',
      {
        user_id: user.id,
        question,
        answer,
        embedding,
        is_in_review_plan: isInReviewPlan ?? true,
      },
      { columns: '*' },
      accessToken
    );

    const newPoint = Array.isArray(result) ? result[0] : result;

    // Create review schedules if in review plan
    if (isInReviewPlan !== false) {
      const intervals = [1, 3, 7, 14, 30];
      const today = new Date();
      
      const schedules = intervals.map((interval, index) => {
        const reviewDate = new Date(today);
        reviewDate.setDate(reviewDate.getDate() + interval);
        
        return {
          knowledge_point_id: newPoint.id,
          review_number: index + 1,
          review_date: reviewDate.toISOString().split('T')[0],
          completed: false,
        };
      });

      await supabaseFetch.insert(
        'review_schedules',
        schedules,
        {},
        accessToken
      );
    }

    return NextResponse.json({ point: newPoint });
  } catch (error: any) {
    console.error('Create knowledge point error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
