import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const ollama = new OpenAI({
  apiKey: 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1',
});

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

function getApiKey(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return request.headers.get('X-API-Key');
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey(request);
    const expectedKey = process.env.OLLAMA_API_KEY;

    if (!expectedKey) {
      console.error('OLLAMA_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 支持两种格式：OpenAI 风格 { messages } 或简单风格 { message, history? }
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      messages = body.messages;
    } else if (body.message != null) {
      const systemContent =
        typeof body.system === 'string'
          ? body.system
          : '你是一个有帮助的助手。请简洁、准确地回答用户问题。';
      messages = [
        { role: 'system', content: systemContent },
        ...(Array.isArray(body.history) ? body.history : []),
        { role: 'user', content: String(body.message) },
      ];
    } else {
      return NextResponse.json(
        { error: 'Request body must include "messages" or "message"' },
        { status: 400 }
      );
    }

    const stream = await ollama.chat.completions.create({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
      max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 2000,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Ollama streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Ollama chat API error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
