import OpenAI from "openai";

/**
 * 测试本地 Ollama 服务（OpenAI 兼容接口）
 * 服务地址: http://127.0.0.1:11434
 * 模型: qwen2.5:7b
 * 可用于免费用户请求转发的目标端点
 */

const OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1";
const OLLAMA_MODEL = "qwen2.5:7b";

const client = new OpenAI({
  apiKey: "ollama", // Ollama 不需要真实 key，SDK 要求必填则用占位
  baseURL: OLLAMA_BASE_URL,
});

async function testChatCompletion() {
  console.log("Testing Ollama at", OLLAMA_BASE_URL, "model:", OLLAMA_MODEL);
  try {
    const completion = await client.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: "你好，请用一句话介绍你自己。" }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    console.log("Response:", content);
    console.log("Test passed.");
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Test failed:", message);
    return false;
  }
}

async function testStreaming() {
  console.log("Testing streaming...");
  try {
    const stream = await client.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [{ role: "user", content: "说三个数字，用逗号分隔。" }],
      stream: true,
      max_tokens: 50,
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) full += delta;
    }
    console.log("Streamed response:", full);
    console.log("Streaming test passed.");
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Streaming test failed:", message);
    return false;
  }
}

async function main() {
  const ok1 = await testChatCompletion();
  const ok2 = await testStreaming();
  process.exit(ok1 && ok2 ? 0 : 1);
}

main();
