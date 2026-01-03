import OpenAI from 'openai';

// Initialize OpenAI client for embeddings
// This should only be used on the server side (API routes)
const openai = new OpenAI({
  baseURL: process.env.EMBEDDING_BASE_URL,
  apiKey: process.env.EMBEDDING_API_KEY,
});

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const EMBEDDING_DIM = parseInt(process.env.EMBEDDING_DIM || '2560', 10);
const STORAGE_DIM = 1536; // Supabase 限制，只存储前 1536 维

/**
 * Generate embedding vector for given text
 * @param text - Text to embed
 * @returns Vector embedding as number array
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Combine question and answer for better semantic representation
    const textToEmbed = text.trim();

    if (!textToEmbed) {
      throw new Error('Text cannot be empty');
    }

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: textToEmbed,
      dimensions: EMBEDDING_DIM,
    });

    const embedding = response.data[0].embedding;

    if (!embedding || embedding.length < STORAGE_DIM) {
      throw new Error(`Invalid embedding dimension. Expected at least ${STORAGE_DIM}, got ${embedding?.length || 0}`);
    }

    // 只返回前 1536 维（Supabase pgvector 索引限制）
    return embedding.slice(0, STORAGE_DIM);
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embedding for a knowledge point (combines question and answer)
 * @param question - Knowledge point question
 * @param answer - Knowledge point answer
 * @returns Vector embedding as number array
 */
export async function generateKnowledgePointEmbedding(
  question: string,
  answer: string
): Promise<number[]> {
  // Combine question and answer with proper formatting
  // This gives more context for semantic search
  const combinedText = `Question: ${question}\n\nAnswer: ${answer}`;
  return generateEmbedding(combinedText);
}

/**
 * Generate embedding for a user query
 * @param query - User's search query or chat message
 * @returns Vector embedding as number array
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

export const embeddingConfig = {
  model: EMBEDDING_MODEL,
  dimension: EMBEDDING_DIM,
};
