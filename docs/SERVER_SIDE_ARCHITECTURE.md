# 服务端架构说明

## 概述

为了保护 API 密钥的安全，所有向量化和 AI 相关的操作都在服务端进行。客户端永远不会接触到敏感的 API 密钥。

## 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                           客户端 (Browser)                        │
│  - 用户界面                                                       │
│  - 不包含任何 API 密钥                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      Next.js 服务端 (API Routes)                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ /api/vectorize                                           │   │
│  │ - 接收问题和答案                                         │   │
│  │ - 调用 OpenAI API 生成向量                               │   │
│  │ - 返回向量给客户端                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ /api/search                                              │   │
│  │ - 接收搜索查询                                           │   │
│  │ - 调用 OpenAI API 生成查询向量                           │   │
│  │ - 在 Supabase 中搜索相似向量                             │   │
│  │ - 返回搜索结果                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ /api/chat                                                │   │
│  │ - 接收聊天消息                                           │   │
│  │ - 调用 OpenAI API 生成查询向量                           │   │
│  │ - 在 Supabase 中搜索相关知识点                           │   │
│  │ - 调用 DeepSeek API 生成回答                             │   │
│  │ - 流式返回回答                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  环境变量 (.env.local):                                          │
│  - EMBEDDING_API_KEY (OpenAI)                                    │
│  - DEEPSEEK_API_KEY                                              │
│  - SUPABASE_SERVICE_ROLE_KEY                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API Calls
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────┐                  ┌──────────────┐
│  OpenAI API   │                  │ DeepSeek API │
│  (Embeddings) │                  │    (Chat)    │
└───────────────┘                  └──────────────┘
        │
        │ Store Vectors
        ▼
┌───────────────┐
│   Supabase    │
│  (pgvector)   │
└───────────────┘
```

## API 端点详解

### 1. `/api/vectorize` - 向量化知识点

**用途**: 为新创建或更新的知识点生成向量嵌入

**请求**:
```typescript
POST /api/vectorize
{
  "question": "什么是主动回忆？",
  "answer": "主动回忆是一种学习技巧...",
  "userId": "user-id",
  "accessToken": "user-access-token"
}
```

**响应**:
```typescript
{
  "embedding": [0.123, -0.456, ...], // 1536维向量
  "success": true
}
```

**安全措施**:
- ✅ 验证用户身份
- ✅ API 密钥仅在服务端使用
- ✅ 向量生成在服务端完成

### 2. `/api/search` - 向量搜索

**用途**: 搜索与查询相似的知识点

**请求**:
```typescript
POST /api/search
{
  "query": "如何使用主动回忆？",
  "userId": "user-id",
  "accessToken": "user-access-token",
  "matchThreshold": 0.7,
  "matchCount": 5
}
```

**响应**:
```typescript
{
  "results": [
    {
      "id": "...",
      "question": "什么是主动回忆？",
      "answer": "...",
      "similarity": 0.85
    }
  ],
  "success": true
}
```

**安全措施**:
- ✅ 验证用户身份
- ✅ 只返回用户自己的知识点
- ✅ 查询向量生成在服务端

### 3. `/api/chat` - AI 聊天

**用途**: 基于知识库的 AI 对话

**请求**:
```typescript
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "解释一下主动回忆" }
  ],
  "userId": "user-id",
  "accessToken": "user-access-token"
}
```

**响应**: Server-Sent Events (SSE) 流式响应
```
data: {"type":"sources","sources":[...]}
data: {"type":"content","content":"主动回忆"}
data: {"type":"content","content":"是一种"}
...
data: [DONE]
```

**安全措施**:
- ✅ 验证用户身份
- ✅ 向量搜索在服务端完成
- ✅ LLM 调用在服务端完成
- ✅ 只访问用户自己的知识点

## 数据流

### 创建知识点流程

```
1. 用户在浏览器中输入问题和答案
   ↓
2. 客户端调用 /api/vectorize
   ↓
3. 服务端使用 EMBEDDING_API_KEY 调用 OpenAI
   ↓
4. 服务端返回向量给客户端
   ↓
5. 客户端将知识点和向量保存到 Supabase
```

### 聊天流程

```
1. 用户在浏览器中输入问题
   ↓
2. 客户端调用 /api/chat
   ↓
3. 服务端使用 EMBEDDING_API_KEY 生成查询向量
   ↓
4. 服务端在 Supabase 中搜索相似知识点
   ↓
5. 服务端使用 DEEPSEEK_API_KEY 调用 DeepSeek
   ↓
6. 服务端流式返回回答给客户端
```

## 环境变量

所有敏感信息都存储在服务端的 `.env.local` 文件中：

```bash
# 向量嵌入 API (OpenAI 或兼容服务)
EMBEDDING_API_KEY=your_api_key
EMBEDDING_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIM=1536

# 聊天 LLM (DeepSeek)
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**重要**: 
- ❌ 永远不要将 `.env.local` 提交到 Git
- ❌ 永远不要在客户端代码中使用这些密钥
- ✅ 所有 API 调用都通过服务端 API 路由

## 安全最佳实践

### 1. API 密钥保护
- 所有 API 密钥存储在服务端环境变量中
- 客户端代码永远不会接触到 API 密钥
- 使用 Next.js API Routes 作为安全的中间层

### 2. 用户认证
- 所有 API 端点都验证用户身份
- 使用 Supabase 的 access token 进行认证
- 确保用户只能访问自己的数据

### 3. 输入验证
- 验证所有输入参数
- 防止 SQL 注入和 XSS 攻击
- 限制请求大小和频率

### 4. 错误处理
- 不在错误消息中暴露敏感信息
- 记录详细错误到服务端日志
- 向客户端返回通用错误消息

### 5. 速率限制
建议实现以下速率限制：
- `/api/vectorize`: 每分钟 10 次
- `/api/search`: 每分钟 30 次
- `/api/chat`: 每分钟 20 次

## 成本优化

### 1. 缓存策略
考虑实现以下缓存：
- 常见查询的向量嵌入
- 频繁访问的知识点
- LLM 响应缓存（相同问题）

### 2. 批量处理
- 批量生成向量嵌入
- 合并相似的 API 请求
- 使用连接池优化数据库查询

### 3. 监控和告警
- 监控 API 使用量
- 设置成本告警
- 跟踪异常请求模式

## 部署注意事项

### Vercel 部署
1. 在 Vercel 项目设置中添加环境变量
2. 确保所有 API 密钥都已配置
3. 验证 API Routes 正常工作

### 自托管部署
1. 配置 `.env.local` 文件
2. 使用 PM2 或类似工具管理进程
3. 配置 HTTPS 和防火墙规则
4. 设置日志和监控

## 故障排查

### 向量化失败
**症状**: 创建知识点时没有生成向量

**检查**:
1. 服务端日志中的错误消息
2. `EMBEDDING_API_KEY` 是否正确配置
3. OpenAI API 额度是否充足
4. 网络连接是否正常

### 搜索无结果
**症状**: 聊天时找不到相关知识点

**检查**:
1. 知识点是否有向量嵌入
2. 相似度阈值是否过高
3. 用户是否有足够的知识点

### 聊天无响应
**症状**: 发送消息后没有回复

**检查**:
1. `DEEPSEEK_API_KEY` 是否正确配置
2. 服务端日志中的错误消息
3. DeepSeek API 是否可访问
4. 网络连接是否正常

## 总结

通过将所有敏感操作移到服务端，我们实现了：

✅ **安全性**: API 密钥永远不会暴露给客户端
✅ **可控性**: 所有 API 调用都经过服务端验证
✅ **可维护性**: 集中管理 API 密钥和配置
✅ **可扩展性**: 易于添加速率限制、缓存等功能

这种架构确保了应用的安全性，同时保持了良好的用户体验。
