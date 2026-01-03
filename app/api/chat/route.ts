import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseFetch } from '@/lib/supabase-fetch';
import { generateQueryEmbedding } from '@/lib/embedding-service';

interface SearchResult {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  similarity: number;
  created_at: string;
  updated_at: string;
}

// Initialize OpenAI client with DeepSeek configuration
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, accessToken } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
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

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Get relevant context from user's knowledge points (server-side)
    let context = '';
    let sources: SearchResult[] = [];

    try {
      // Generate embedding for the query on server side
      const queryEmbedding = await generateQueryEmbedding(lastMessage.content);

      // Search with lower threshold for chat (0.6 instead of 0.7)
      const results = await supabaseFetch.rpc<SearchResult[]>(
        'search_knowledge_points',
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.6,
          match_count: 3,
          filter_user_id: userId,
        },
        accessToken
      );

      sources = results;

      if (results.length > 0) {
        // Format results as context for the LLM
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
      // Continue without context if search fails
    }

    // Prepare system message with context
    const systemMessage = context
      ? `你是一个智能学习助手。请基于用户的知识库回答问题。

以下是与用户问题最相关的知识点：

${context}

请根据上述知识点回答用户的问题。如果知识点中没有直接相关的信息，你可以使用你的知识来补充，但请说明哪些部分来自知识库，哪些部分是你的推断。保持回答简洁、准确、有帮助。`
      : `你是一个智能学习助手。用户的知识库中暂时没有与当前问题直接相关的内容。请基于你的知识回答问题，并建议用户可以添加哪些知识点到他们的学习库中。`;

    // Prepare messages for the LLM
    const llmMessages = [
      {
        role: 'system' as const,
        content: systemMessage,
      },
      ...messages,
    ];

    // Create streaming response
    const stream = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: llmMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send sources first
          if (sources.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'sources',
                  sources: sources.map((s) => ({
                    question: s.question,
                    answer: s.answer,
                    similarity: s.similarity,
                  })),
                })}\n\n`
              )
            );
          }

          // Stream the chat response
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'content',
                    content,
                  })}\n\n`
                )
              );
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
