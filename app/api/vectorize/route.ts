import { NextRequest, NextResponse } from 'next/server';
import { generateKnowledgePointEmbedding } from '@/lib/embedding-service';
import { supabaseFetch } from '@/lib/supabase-fetch';

/**
 * Server-side API for generating embeddings
 * This ensures API keys are never exposed to the client
 */
export async function POST(request: NextRequest) {
  try {
    const { question, answer, userId, accessToken } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user authentication
    try {
      const user = await supabaseFetch.getUser(accessToken);
      if (!user || user.id !== userId) {
        return NextResponse.json(
          { error: 'Invalid authentication' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Authentication verification failed:', error);
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 401 }
      );
    }

    // Generate embedding on server side
    try {
      const embedding = await generateKnowledgePointEmbedding(question, answer);
      
      return NextResponse.json({
        embedding,
        success: true,
      });
    } catch (error: any) {
      console.error('Error generating embedding:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate embedding',
          message: error.message,
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Vectorize API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
