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
 * Search knowledge points using vector similarity (client-side wrapper)
 * This calls the server-side API to ensure embedding generation happens on the server
 * @param query - User's search query
 * @param userId - User ID to filter results
 * @param accessToken - Access token for authenticated requests
 * @param matchThreshold - Minimum similarity threshold (0-1, default: 0.7)
 * @param matchCount - Maximum number of results to return (default: 5)
 * @returns Array of matching knowledge points with similarity scores
 */
export async function searchKnowledgePoints(
  query: string,
  userId: string,
  accessToken: string | undefined,
  matchThreshold: number = 0.7,
  matchCount: number = 5
): Promise<SearchResult[]> {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        userId,
        accessToken,
        matchThreshold,
        matchCount,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search knowledge points');
    }

    const data = await response.json();
    return data.success ? data.results : [];
  } catch (error: any) {
    console.error('Error searching knowledge points:', error);
    throw new Error(`Failed to search knowledge points: ${error.message}`);
  }
}

/**
 * Get relevant context for a chat query
 * This is optimized for RAG (Retrieval Augmented Generation)
 * @param query - User's chat message
 * @param userId - User ID to filter results
 * @param accessToken - Access token for authenticated requests
 * @param maxResults - Maximum number of results (default: 3)
 * @returns Formatted context string for LLM
 */
export async function getRelevantContext(
  query: string,
  userId: string,
  accessToken: string | undefined,
  maxResults: number = 3
): Promise<{ context: string; sources: SearchResult[] }> {
  try {
    // Search with lower threshold for chat (0.6 instead of 0.7)
    // to get more potentially relevant results
    const results = await searchKnowledgePoints(
      query,
      userId,
      accessToken,
      0.6,
      maxResults
    );

    if (results.length === 0) {
      return {
        context: '',
        sources: [],
      };
    }

    // Format results as context for the LLM
    const context = results
      .map((result, index) => {
        return `[知识点 ${index + 1}] (相似度: ${(result.similarity * 100).toFixed(1)}%)
问题: ${result.question}
答案: ${result.answer}`;
      })
      .join('\n\n---\n\n');

    return {
      context,
      sources: results,
    };
  } catch (error: any) {
    console.error('Error getting relevant context:', error);
    // Return empty context on error instead of throwing
    // This allows the chat to continue even if search fails
    return {
      context: '',
      sources: [],
    };
  }
}
