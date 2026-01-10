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
 * Update knowledge point - iOS API
 */
export async function PUT(
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

    const { question, answer, isInReviewPlan } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Generate new embedding
    const text = `${question} ${answer}`;
    const embedding = await generateQueryEmbedding(text);

    // Update knowledge point
    const updateData: any = {
      question,
      answer,
      embedding,
      updated_at: new Date().toISOString(),
    };

    if (isInReviewPlan !== undefined) {
      updateData.is_in_review_plan = isInReviewPlan;
    }

    const result = await supabaseFetch.update<KnowledgePoint>(
      'knowledge_points',
      updateData,
      { id: params.id, user_id: user.id },
      { columns: '*' },
      accessToken
    );

    const updatedPoint = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({ point: updatedPoint });
  } catch (error: any) {
    console.error('Update knowledge point error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete knowledge point - iOS API
 */
export async function DELETE(
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

    // Delete review schedules first
    await supabaseFetch.delete(
      'review_schedules',
      { knowledge_point_id: params.id },
      accessToken
    );

    // Delete knowledge point
    await supabaseFetch.delete(
      'knowledge_points',
      { id: params.id, user_id: user.id },
      accessToken
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete knowledge point error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
