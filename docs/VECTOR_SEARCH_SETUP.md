# Vector Search & Chat Setup Guide

This guide explains how to set up the vector search and AI chat features in the Learning Assistant.

## Overview

The Learning Assistant now includes:
1. **Automatic Vectorization**: Every knowledge point is automatically vectorized when created/updated
2. **Semantic Search**: Find relevant knowledge points using natural language queries
3. **AI Chat**: Chat with an AI assistant that has access to your knowledge base

## Prerequisites

1. **OpenAI API Key** (or compatible service) for embeddings
2. **DeepSeek API Key** for the chat LLM
3. **Supabase** with pgvector extension enabled

## Step 1: Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Embedding Configuration (NEW)
EMBEDDING_API_KEY=your_openai_api_key
EMBEDDING_BASE_URL=https://api.openai.com/v1  # Optional
EMBEDDING_MODEL=text-embedding-3-small  # Default model
EMBEDDING_DIM=1536  # Dimension for text-embedding-3-small

# DeepSeek Configuration (NEW)
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com  # Optional
DEEPSEEK_MODEL=deepseek-chat  # Default model
```

### Getting the API Keys

#### OpenAI API Key (for Embeddings)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and use it as `EMBEDDING_API_KEY`

**Note**: You can also use compatible embedding services like:
- Azure OpenAI
- Any OpenAI-compatible API endpoint

#### DeepSeek API Key (for Chat)
1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and use it as `DEEPSEEK_API_KEY`

## Step 2: Run Database Migrations

Apply the pgvector migration to your Supabase database:

```bash
# If using local Supabase
supabase db push

# Or apply the migration file manually in Supabase Dashboard
# File: supabase/migrations/20250107000000_add_vector_search.sql
```

The migration will:
- Enable the pgvector extension
- Add an `embedding` column to `knowledge_points` table
- Create a vector similarity search function
- Create an index for fast vector searches

## Step 3: Verify Setup

### Test Vectorization

1. Start the development server:
```bash
npm run dev
```

2. Log in to the application
3. Create a new knowledge point
4. Check the console logs for: `✅ Generated embedding for knowledge point`

### Test Vector Search

The vector search is automatically used in the chat feature. To test:

1. Create a few knowledge points (at least 3-5 for better testing)
2. Click on the "Chat" tab
3. Ask a question related to your knowledge points
4. The AI should:
   - Search for relevant knowledge points
   - Display the sources used
   - Provide an answer based on your knowledge base

## How It Works

### Vectorization Process

When you create or update a knowledge point:

1. **Client Request**: The client sends question and answer to `/api/vectorize`
2. **Server-Side Embedding**: The server generates the embedding using the OpenAI API
   - This ensures API keys are never exposed to the client
   - Question and answer are combined into a single text
   - A 1536-dimensional vector is generated
3. **Return to Client**: The embedding is returned to the client
4. **Store Vector**: The client stores the knowledge point with the embedding
5. **Index**: Supabase automatically indexes the vector for fast searches

**Security Note**: All embedding generation happens on the server side. The `EMBEDDING_API_KEY` is never exposed to the client.

### Chat Process

When you ask a question in the chat:

1. **Server-Side Vectorization**: Your question is converted to a vector embedding on the server
   - The `/api/chat` endpoint handles this internally
   - API keys remain secure on the server
2. **Semantic Search**: Supabase searches for similar vectors (top 3 matches)
3. **Retrieve Context**: Relevant knowledge points are retrieved
4. **LLM Generation**: DeepSeek generates an answer using the context
5. **Display**: The answer is streamed back with source references

**Security Note**: All vector operations happen on the server. Neither `EMBEDDING_API_KEY` nor `DEEPSEEK_API_KEY` are exposed to the client.

## Configuration Options

### Embedding Dimension

If you want to use a different embedding model:

- `text-embedding-3-small`: 1536 dimensions (default, cost-effective)
- `text-embedding-3-large`: 3072 dimensions (more accurate, higher cost)
- `text-embedding-ada-002`: 1536 dimensions (legacy model)

**Important**: If you change the dimension, you need to:
1. Update `EMBEDDING_DIM` in `.env.local`
2. Update the migration file to match the new dimension
3. Re-run the migration

### Search Threshold

The default similarity threshold is 0.7 (70% similarity).

You can adjust this in `lib/vector-search-service.ts`:
- Lower threshold (e.g., 0.6): More results, may include less relevant items
- Higher threshold (e.g., 0.8): Fewer results, more precise matches

### Number of Results

By default, the chat searches for the top 3 relevant knowledge points.

You can adjust this in `app/api/chat/route.ts`:
```typescript
const { context, sources } = await getRelevantContext(
  lastMessage.content,
  userId,
  accessToken,
  5  // Change to get more results
);
```

## Troubleshooting

### "Failed to generate embedding"

**Cause**: Invalid or missing API key

**Solution**:
1. Verify `EMBEDDING_API_KEY` is correctly set
2. Check if the API key has sufficient credits
3. Verify the `EMBEDDING_BASE_URL` if using a custom endpoint

### "Search returned no results"

**Cause**: No knowledge points have embeddings yet, or similarity threshold too high

**Solution**:
1. Verify existing knowledge points have embeddings
2. Create new knowledge points (they will be vectorized automatically)
3. Lower the similarity threshold in `vector-search-service.ts`

### "Chat not responding"

**Cause**: DeepSeek API key issue or network problem

**Solution**:
1. Verify `DEEPSEEK_API_KEY` is correctly set
2. Check console logs for specific error messages
3. Verify network connectivity to DeepSeek API

### Migration Failed

**Cause**: pgvector extension not available

**Solution**:
1. Ensure you're using a compatible Supabase plan (pgvector is available on all plans)
2. For local development, make sure you're using the latest Supabase CLI
3. Run `supabase db reset` to reset and reapply all migrations

## Cost Estimation

### OpenAI Embeddings (text-embedding-3-small)

- **Price**: $0.02 per 1M tokens
- **Average Knowledge Point**: ~100-200 tokens
- **Estimated Cost**: ~$0.002-0.004 per 100 knowledge points

### DeepSeek Chat

- **Price**: ~$0.27 per 1M input tokens, ~$1.1 per 1M output tokens
- **Average Chat**: ~500 input tokens, ~200 output tokens
- **Estimated Cost**: ~$0.00035 per chat message

**Note**: Costs are estimates and may vary based on actual usage.

## Performance Optimization

### Vector Index

The migration creates an IVFFlat index for fast approximate nearest neighbor search:

```sql
CREATE INDEX idx_knowledge_points_embedding 
ON knowledge_points 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

For larger datasets (>10,000 knowledge points):
- Increase `lists` parameter (e.g., 500 or 1000)
- Consider using HNSW index for better performance

### Caching

Consider implementing caching for:
- Frequently asked questions
- Common knowledge point searches
- User session data

## Security Considerations

1. **API Keys**: 
   - Never commit API keys to version control
   - All API keys are stored in `.env.local` on the server
   - API keys are NEVER exposed to the client
2. **Server-Side Processing**: 
   - All embedding generation happens on the server (`/api/vectorize`, `/api/search`, `/api/chat`)
   - Clients never have direct access to OpenAI or DeepSeek APIs
3. **Rate Limiting**: Implement rate limiting for API endpoints to prevent abuse
4. **User Isolation**: The system ensures users can only search their own knowledge points
5. **Input Validation**: All inputs are validated before processing
6. **Authentication**: All API endpoints verify user authentication before processing requests

## Next Steps

1. **Bulk Vectorization**: If you have existing knowledge points without embeddings, create a script to vectorize them
2. **Advanced Search**: Add filters for date ranges, categories, or tags
3. **Analytics**: Track which knowledge points are most frequently referenced in chats
4. **Export/Import**: Add features to export and import knowledge bases with embeddings

## Support

If you encounter issues not covered in this guide, please:
1. Check the console logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure database migrations are applied successfully
4. Contact support with specific error messages and logs
