import crypto from 'node:crypto';

/**
 * 生成随机 API Key（32 字节，base64url 编码，约 43 字符，URL 安全）
 */
function generateApiKey(): string {
  return crypto.randomBytes(32).toString('base64url');
}

const apiKey = generateApiKey();
console.log('OLLAMA_API_KEY=' + apiKey);
