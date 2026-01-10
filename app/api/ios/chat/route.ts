import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseFetch } from '@/lib/supabase-fetch';
import { generateQueryEmbedding } from '@/lib/embedding-service';

interface SearchResult {
  id: string;
  question: string;
  answer: string;
  similarity: number;
}

// Initialize OpenAI client with DeepSeek configuration
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

/**
 * Chat with AI - iOS API
 * Returns complete response (not streaming for iOS simplicity)
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

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get relevant context from user's knowledge points
    let context = '';
    let sources: SearchResult[] = [];

    try {
      const queryEmbedding = await generateQueryEmbedding(message);

      const results = await supabaseFetch.rpc<SearchResult[]>(
        'search_knowledge_points',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.6,
          match_count: 3,
          filter_user_id: user.id,
        },
        accessToken
      );

      sources = results;

      if (results.length > 0) {
        context = results
          .map((result, index) => {
            return `[知识点 ${index + 1}] (相似度: ${(result.similarity * 100).toFixed(1)}%)
问题: ${result.question}
答案: ${result.answer}`;
          })
          .join('\n\n---\n\n');
      }
    } catch (error) {
      console.error('Error getting relevant context:', error);
    }

    // Prepare system message
    const systemMessage = context
      ? `你是一个智能学习助手。请基于用户的知识库回答问题。

以下是与用户问题最相关的知识点：

${context}

请根据上述知识点回答用户的问题。如果知识点中没有直接相关的信息，你可以使用你的知识来补充，但请说明哪些部分来自知识库，哪些部分是你的推断。保持回答简洁、准确、有帮助。`
      : `你是一个智能学习助手。用户的知识库中暂时没有与当前问题直接相关的内容。请基于你的知识回答问题，并建议用户可以添加哪些知识点到他们的学习库中。`;

    // Prepare messages
    const messages = [
      {
        role: 'system' as const,
        content: systemMessage,
      },
      ...(history || []),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Get response from DeepSeek (non-streaming for iOS)
    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      response,
      sources,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
