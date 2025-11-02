# MCP Service Documentation

## 概述

Learn Assistant 提供了一个基于 Model Context Protocol (MCP) 的 API 服务，允许通过 API key 认证来管理知识点和复习计划。

## 端点

- **URL**: `/api/mcp`
- **认证**: 使用 Bearer Token（API Key）

## 认证方式

所有请求都需要在 `Authorization` 头部包含 API Key：

```
Authorization: Bearer <your_api_key>
```

## API 方法

### 1. initialize

初始化 MCP 连接。

**请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}
```

**响应**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "learn-assistant",
      "version": "1.0.0"
    }
  }
}
```

### 2. tools/list

列出所有可用的工具。

**请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

**响应**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "list_reviews",
        "description": "查询今日需要复习的列表",
        "inputSchema": { ... }
      },
      ...
    ]
  }
}
```

### 3. tools/call

调用指定的工具。

**请求**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_reviews",
    "arguments": {}
  }
}
```

## 可用工具

### list_reviews

查询今日需要复习的列表。

**参数**: 无

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_reviews",
    "arguments": {}
  }
}
```

### list_knowledge_points

查询所有知识点列表。

**参数**: 无

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "list_knowledge_points",
    "arguments": {}
  }
}
```

### get_knowledge_point

根据ID获取单个知识点的详细信息。

**参数**:
- `id` (string, 必需): 知识点的ID

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "get_knowledge_point",
    "arguments": {
      "id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### create_knowledge_point

创建新的知识点。

**参数**:
- `question` (string, 必需): 问题/提示
- `answer` (string, 必需): 答案/详细说明

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "create_knowledge_point",
    "arguments": {
      "question": "什么是主动回忆？",
      "answer": "主动回忆是一种学习技巧..."
    }
  }
}
```

### update_knowledge_point

更新现有的知识点。

**参数**:
- `id` (string, 必需): 知识点的ID
- `question` (string, 可选): 问题/提示
- `answer` (string, 可选): 答案/详细说明

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "update_knowledge_point",
    "arguments": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "question": "更新后的问题",
      "answer": "更新后的答案"
    }
  }
}
```

### delete_knowledge_point

删除知识点。

**参数**:
- `id` (string, 必需): 知识点的ID

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "delete_knowledge_point",
    "arguments": {
      "id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### submit_recall

提交主动回忆（完成复习）。

**参数**:
- `schedule_id` (string, 必需): 复习计划的ID
- `recall_text` (string, 必需): 主动回忆的内容

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "submit_recall",
    "arguments": {
      "schedule_id": "123e4567-e89b-12d3-a456-426614174000",
      "recall_text": "我回忆的内容..."
    }
  }
}
```

### mark_as_reviewed

将知识点标记为已复习（更新最后一个未完成的复习计划）。

**参数**:
- `knowledge_point_id` (string, 必需): 知识点的ID
- `recall_text` (string, 可选): 主动回忆的内容

**示例**:
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "mark_as_reviewed",
    "arguments": {
      "knowledge_point_id": "123e4567-e89b-12d3-a456-426614174000",
      "recall_text": "我回忆的内容..."
    }
  }
}
```

## 错误处理

MCP 服务使用标准的 JSON-RPC 2.0 错误格式：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error"
  }
}
```

常见错误代码：
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32603`: Internal error
- `-32000`: Server error (包括认证错误)

## 使用示例 (cURL)

```bash
# 1. 初始化
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_api_key>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'

# 2. 列出工具
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_api_key>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'

# 3. 查询复习列表
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_api_key>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_reviews",
      "arguments": {}
    }
  }'

# 4. 创建知识点
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_api_key>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "create_knowledge_point",
      "arguments": {
        "question": "什么是主动回忆？",
        "answer": "主动回忆是一种学习技巧..."
      }
    }
  }'
```

## 环境变量

确保设置了以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥（可选，用于绕过 RLS）

## 注意事项

1. API Key 通过 Bearer Token 方式传递
2. 所有操作都会自动关联到 API Key 对应的用户
3. 使用服务角色密钥来绕过 RLS（Row Level Security）限制
4. API Key 验证时会更新 `last_used_at` 时间戳

