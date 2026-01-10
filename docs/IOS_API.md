# iOS REST API Documentation

## 概述

Learn Assistant iOS应用使用RESTful API与Next.js后端通信。所有API端点都在 `/api/ios` 路径下。

## 基础信息

- **Base URL**: `http://localhost:3001/api/ios` (开发) / `https://your-domain.com/api/ios` (生产)
- **认证方式**: Bearer Token (除了登录接口)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

### Header格式

除了 `/auth/apple` 接口，所有API请求都需要在Header中携带access token:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token过期处理

- Access token有效期: 1小时
- Refresh token有效期: 30天
- 客户端会在token过期前5分钟自动刷新

## API端点

### 1. 认证相关

#### 1.1 Apple登录

**Endpoint**: `POST /api/ios/auth/apple`

**描述**: 使用Apple Identity Token登录

**请求Body**:
```json
{
  "identityToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": "000123.abc456def789.1234"
}
```

**响应**: `200 OK`
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@privaterelay.appleid.com",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-string",
  "expiresAt": 1704153600
}
```

**错误响应**:
- `400 Bad Request`: Identity token缺失
- `401 Unauthorized`: Token无效
- `500 Internal Server Error`: 服务器错误

**Swift示例**:
```swift
let response = try await APIService.shared.signInWithApple(
    identityToken: tokenString,
    user: userIdentifier
)
```

---

#### 1.2 刷新Token

**Endpoint**: `POST /api/ios/auth/refresh`

**描述**: 使用refresh token获取新的access token

**请求Body**:
```json
{
  "refreshToken": "refresh-token-string"
}
```

**响应**: `200 OK`
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@privaterelay.appleid.com"
  },
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "expiresAt": 1704157200
}
```

**错误响应**:
- `400 Bad Request`: Refresh token缺失
- `401 Unauthorized`: Refresh token无效或过期

**Swift示例**:
```swift
let response = try await APIService.shared.refreshToken(
    refreshToken: storedRefreshToken
)
```

---

### 2. 知识点管理

#### 2.1 获取知识点列表

**Endpoint**: `GET /api/ios/knowledge`

**描述**: 获取用户的知识点列表，支持分页

**Query参数**:
- `limit` (可选): 每页数量，默认20
- `offset` (可选): 偏移量，默认0
- `is_in_review_plan` (可选): 筛选是否在复习计划中 (true/false)

**请求示例**:
```http
GET /api/ios/knowledge?limit=20&offset=0
Authorization: Bearer <access_token>
```

**响应**: `200 OK`
```json
{
  "points": [
    {
      "id": "uuid-1",
      "userId": "user-uuid",
      "question": "What is SwiftUI?",
      "answer": "SwiftUI is a modern UI framework...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "isInReviewPlan": true
    },
    {
      "id": "uuid-2",
      "userId": "user-uuid",
      "question": "Explain MVVM pattern",
      "answer": "MVVM stands for Model-View-ViewModel...",
      "createdAt": "2024-01-02T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z",
      "isInReviewPlan": true
    }
  ]
}
```

**Swift示例**:
```swift
let points = try await APIService.shared.getKnowledgePoints(
    accessToken: token,
    limit: 20,
    offset: 0
)
```

---

#### 2.2 创建知识点

**Endpoint**: `POST /api/ios/knowledge`

**描述**: 创建新的知识点，自动生成向量嵌入和复习计划

**请求Body**:
```json
{
  "question": "What is Combine framework?",
  "answer": "Combine is Apple's framework for reactive programming...",
  "isInReviewPlan": true
}
```

**响应**: `200 OK`
```json
{
  "point": {
    "id": "new-uuid",
    "userId": "user-uuid",
    "question": "What is Combine framework?",
    "answer": "Combine is Apple's framework for reactive programming...",
    "createdAt": "2024-01-03T00:00:00Z",
    "updatedAt": "2024-01-03T00:00:00Z",
    "isInReviewPlan": true
  }
}
```

**自动触发**:
1. 生成向量嵌入 (OpenAI text-embedding-3-small)
2. 创建5次复习计划:
   - 第1次: 1天后
   - 第2次: 3天后
   - 第3次: 7天后
   - 第4次: 14天后
   - 第5次: 30天后

**错误响应**:
- `400 Bad Request`: question或answer缺失
- `401 Unauthorized`: 未认证
- `500 Internal Server Error`: 向量化失败

**Swift示例**:
```swift
let point = try await APIService.shared.createKnowledgePoint(
    accessToken: token,
    question: "What is Combine framework?",
    answer: "Combine is Apple's framework...",
    isInReviewPlan: true
)
```

---

#### 2.3 更新知识点

**Endpoint**: `PUT /api/ios/knowledge/:id`

**描述**: 更新已有的知识点，会重新生成向量

**请求Body**:
```json
{
  "question": "Updated question",
  "answer": "Updated answer",
  "isInReviewPlan": false
}
```

**响应**: `200 OK`
```json
{
  "point": {
    "id": "uuid",
    "userId": "user-uuid",
    "question": "Updated question",
    "answer": "Updated answer",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-03T12:00:00Z",
    "isInReviewPlan": false
  }
}
```

**注意**: 
- 更新后会重新生成向量嵌入
- 不会影响已创建的复习计划

**Swift示例**:
```swift
let updatedPoint = try await APIService.shared.updateKnowledgePoint(
    accessToken: token,
    id: pointId,
    question: "Updated question",
    answer: "Updated answer"
)
```

---

#### 2.4 删除知识点

**Endpoint**: `DELETE /api/ios/knowledge/:id`

**描述**: 删除知识点及其相关的复习记录

**响应**: `200 OK`
```json
{
  "success": true
}
```

**自动触发**:
- 删除所有相关的复习计划

**Swift示例**:
```swift
try await APIService.shared.deleteKnowledgePoint(
    accessToken: token,
    id: pointId
)
```

---

### 3. 复习系统

#### 3.1 获取今日复习

**Endpoint**: `GET /api/ios/reviews`

**描述**: 获取今天及之前未完成的复习

**响应**: `200 OK`
```json
{
  "reviews": [
    {
      "id": "review-uuid-1",
      "knowledgePointId": "point-uuid",
      "reviewNumber": 1,
      "reviewDate": "2024-01-03",
      "completed": false,
      "completedAt": null,
      "recallText": null,
      "knowledgePoints": {
        "question": "What is SwiftUI?",
        "answer": "SwiftUI is a modern UI framework..."
      }
    }
  ]
}
```

**排序**: 按reviewDate升序排列（最早的在前）

**Swift示例**:
```swift
let reviews = try await APIService.shared.getTodayReviews(
    accessToken: token
)
```

---

#### 3.2 完成复习

**Endpoint**: `POST /api/ios/reviews/:id/complete`

**描述**: 标记复习为已完成

**请求Body**:
```json
{
  "recallText": "SwiftUI is Apple's declarative UI framework..."
}
```

**响应**: `200 OK`
```json
{
  "success": true
}
```

**更新内容**:
- `completed`: true
- `completedAt`: 当前时间戳
- `recallText`: 用户的回忆内容

**Swift示例**:
```swift
try await APIService.shared.completeReview(
    accessToken: token,
    id: reviewId,
    recallText: userRecall
)
```

---

### 4. AI聊天

#### 4.1 发送消息

**Endpoint**: `POST /api/ios/chat`

**描述**: 与AI助手对话，基于知识库的RAG问答

**请求Body**:
```json
{
  "message": "Explain the difference between SwiftUI and UIKit",
  "history": [
    {
      "role": "user",
      "content": "Previous question"
    },
    {
      "role": "assistant",
      "content": "Previous answer"
    }
  ]
}
```

**响应**: `200 OK`
```json
{
  "response": "SwiftUI and UIKit are both UI frameworks from Apple...",
  "sources": [
    {
      "id": "point-uuid-1",
      "question": "What is SwiftUI?",
      "answer": "SwiftUI is a modern UI framework...",
      "similarity": 0.89
    },
    {
      "id": "point-uuid-2",
      "question": "What is UIKit?",
      "answer": "UIKit is Apple's traditional UI framework...",
      "similarity": 0.85
    }
  ]
}
```

**工作流程**:
1. 生成问题的向量嵌入
2. 在知识库中进行向量搜索（阈值0.6，返回前3个）
3. 将相关知识点作为上下文
4. 调用DeepSeek生成回答
5. 返回回答和引用来源

**similarity值**:
- 0.0 - 1.0: 相似度分数
- 越接近1.0表示越相关
- 0.6以上认为相关

**Swift示例**:
```swift
let response = try await APIService.shared.sendChatMessage(
    accessToken: token,
    message: "Explain the difference...",
    history: chatHistory
)
```

---

## 错误处理

### 通用错误格式

```json
{
  "error": "Error message here"
}
```

### 常见HTTP状态码

| 状态码 | 说明 | 处理方式 |
|--------|------|---------|
| 200 | 成功 | 正常处理响应 |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未认证或Token过期 | 刷新Token或重新登录 |
| 403 | 权限不足 | 检查用户权限 |
| 404 | 资源不存在 | 显示友好提示 |
| 500 | 服务器错误 | 显示错误并重试 |

### Swift错误处理示例

```swift
do {
    let points = try await APIService.shared.getKnowledgePoints(
        accessToken: token
    )
    // 处理成功响应
} catch APIServiceError.httpError(401) {
    // Token过期，尝试刷新
    await authService.refreshTokenIfNeeded()
} catch APIServiceError.serverError(let message) {
    // 显示错误消息
    self.error = message
} catch {
    // 其他错误
    self.error = error.localizedDescription
}
```

---

## 性能优化

### 1. 分页加载

```swift
// 首次加载
let firstBatch = try await getKnowledgePoints(limit: 20, offset: 0)

// 加载更多
let nextBatch = try await getKnowledgePoints(limit: 20, offset: 20)
```

### 2. 请求缓存

建议在客户端实现缓存:
```swift
// 使用URLCache
let config = URLSessionConfiguration.default
config.requestCachePolicy = .returnCacheDataElseLoad
config.urlCache = URLCache(
    memoryCapacity: 10 * 1024 * 1024,  // 10MB
    diskCapacity: 50 * 1024 * 1024      // 50MB
)
```

### 3. 并发请求

使用async let并发加载:
```swift
async let points = getKnowledgePoints()
async let reviews = getTodayReviews()

let (loadedPoints, loadedReviews) = try await (points, reviews)
```

---

## 安全建议

### 1. Token安全

- ✅ 使用HTTPS传输
- ✅ 不在日志中打印完整token
- ✅ 使用Keychain存储token（生产环境）
- ✅ 及时刷新token

### 2. 请求验证

- ✅ 所有写操作需要认证
- ✅ 服务端验证用户权限
- ✅ 输入参数验证

### 3. 速率限制

建议实现客户端速率限制:
```swift
// 防止重复请求
private var isLoading = false

func loadData() async {
    guard !isLoading else { return }
    isLoading = true
    defer { isLoading = false }
    
    // 执行请求
}
```

---

## 测试

### 使用curl测试

```bash
# 测试获取知识点
curl -X GET "http://localhost:3001/api/ios/knowledge?limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 测试创建知识点
curl -X POST "http://localhost:3001/api/ios/knowledge" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test question",
    "answer": "Test answer",
    "isInReviewPlan": true
  }'
```

### Postman集合

可以导入以下环境变量:
```json
{
  "base_url": "http://localhost:3001/api/ios",
  "access_token": "your-token-here"
}
```

---

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 初始版本
- ✅ 实现所有核心API
- ✅ Sign in with Apple集成
- ✅ 向量搜索支持
- ✅ RAG聊天功能

---

## 联系支持

如有问题，请提交GitHub Issue。
