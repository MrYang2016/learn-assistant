import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { recallText, correctAnswer, question } = await request.json();

    if (!recallText || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: recallText and correctAnswer' },
        { status: 400 }
      );
    }

    // 获取环境变量
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL;
    const model = process.env.DEEPSEEK_MODEL;

    if (!apiKey || !baseUrl || !model) {
      return NextResponse.json(
        { error: 'Missing required environment variables: DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, or DEEPSEEK_MODEL' },
        { status: 500 }
      );
    }

    // 初始化OpenAI客户端
    const openai = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    // 构建提示词
    const systemPrompt = `你是一个专业的学习助手，擅长对比分析学生的主动回忆内容和正确答案。你的任务是：
1. 仔细对比用户的主动回忆内容和正确答案
2. 明确指出用户回忆中正确的地方
3. 明确指出用户回忆中错误或遗漏的地方
4. 用友好的语气给出建设性的反馈
5. 格式清晰，便于阅读`;

    const userPrompt = `问题：${question || '知识点回顾'}

用户的主动回忆内容：
${recallText}

正确答案：
${correctAnswer}

请对比分析用户的主动回忆内容，指出：
1. ✅ 正确的地方
2. ❌ 错误或遗漏的地方
3. 💡 改进建议（可选）

请用清晰、友好的语气进行对比分析。`;

    // 调用LLM
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content || '分析失败，请重试。';

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Analyze recall error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze recall' },
      { status: 500 }
    );
  }
}

