import { NextRequest, NextResponse } from 'next/server';
import { generateQueryEmbedding } from '@/lib/embedding-service';
import { supabaseFetch } from '@/lib/supabase-fetch';

export interface SearchResult {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  similarity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Server-side API for vector search
 * This ensures embedding generation happens on the server
 */
export async function POST(request: NextRequest) {
  try {
    const { query, userId, accessToken, matchThreshold = 0.7, matchCount = 5 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
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

    // Generate embedding for the query on server side
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateQueryEmbedding(query);
    } catch (error: any) {
      console.error('Error generating query embedding:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate query embedding',
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Call the Supabase function to search
    try {
      const results = await supabaseFetch.rpc<SearchResult[]>(
        'search_knowledge_points',
        {
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold,
          match_count: matchCount,
          filter_user_id: userId,
        },
        accessToken
      );

      return NextResponse.json({
        results,
        success: true,
      });
    } catch (error: any) {
      console.error('Error searching knowledge points:', error);
      return NextResponse.json(
        { 
          error: 'Failed to search knowledge points',
          message: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
