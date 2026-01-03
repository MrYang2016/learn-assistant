# 环境变量配置

## 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 向量嵌入配置（火山引擎 Doubao）
EMBEDDING_API_KEY=your_doubao_api_key
EMBEDDING_BASE_URL=https://ark.cn-beijing.volces.com/api/v3/
EMBEDDING_MODEL=doubao-embedding-text-240515
EMBEDDING_DIM=2560

# DeepSeek 聊天配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

## 配置说明

### Supabase 配置

获取这些值：
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings > API
4. 复制需要的值

### 向量嵌入配置（火山引擎 Doubao）

你当前使用的是火山引擎的 Doubao 模型：

- **EMBEDDING_API_KEY**: 火山引擎 API Key
- **EMBEDDING_BASE_URL**: `https://ark.cn-beijing.volces.com/api/v3/`
- **EMBEDDING_MODEL**: `doubao-embedding-text-240515`
- **EMBEDDING_DIM**: `2560` （Doubao 嵌入模型的维度）

获取 API Key：
1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 创建 API Key
3. 复制到 `EMBEDDING_API_KEY`

### DeepSeek 配置

获取 DeepSeek API Key：
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册并创建 API Key
3. 复制到 `DEEPSEEK_API_KEY`

## 重要提示

⚠️ **安全注意事项**：

1. **永远不要提交 `.env.local` 到 Git**
   - 该文件已在 `.gitignore` 中
   - 包含敏感的 API 密钥

2. **服务端 vs 客户端**：
   - `NEXT_PUBLIC_*` 前缀的变量会暴露到客户端
   - 其他变量仅在服务端可用
   - 所有 API 密钥都应该是服务端专用

3. **API 密钥保护**：
   - 所有向量化操作在服务端进行
   - 客户端永远不会接触到 API 密钥

## 验证配置

启动开发服务器验证配置：

```bash
npm run dev
```

如果配置正确，你应该能够：
1. 登录应用
2. 创建知识点（会自动向量化）
3. 使用聊天功能

## 常见错误

### 错误：API key not found

**原因**：环境变量未正确设置

**解决**：
1. 确认 `.env.local` 文件在项目根目录
2. 确认文件名正确（不是 `.env` 或 `.env.local.example`）
3. 重启开发服务器

### 错误：404 The model does not exist

**原因**：模型名称错误或没有权限

**解决**：
1. 确认 `EMBEDDING_MODEL` 名称正确
2. 确认 API Key 有权限访问该模型
3. 检查 `EMBEDDING_BASE_URL` 是否正确

### 错误：Invalid dimension

**原因**：向量维度不匹配

**解决**：
1. 确认 `EMBEDDING_DIM=2560`
2. 确认数据库迁移已执行（见 `EXECUTE_MIGRATION.md`）
3. 重启开发服务器

## 生产环境配置

### Vercel 部署

在 Vercel 项目设置中添加环境变量：
1. 进入 Vercel 项目
2. Settings > Environment Variables
3. 添加所有环境变量（不包括 `.env.local` 文件本身）

### 自托管部署

1. 在服务器上创建 `.env.local` 文件
2. 使用 `pm2` 等进程管理器启动应用
3. 确保环境变量正确加载

## 模型选择

### 向量嵌入模型

当前支持：
- **火山引擎 Doubao** (推荐，你当前使用的)
  - 模型：`doubao-embedding-text-240515`
  - 维度：2560
  - Base URL：`https://ark.cn-beijing.volces.com/api/v3/`

- **OpenAI**
  - 模型：`text-embedding-3-small` (1536维)
  - 模型：`text-embedding-3-large` (3072维)
  - Base URL：`https://api.openai.com/v1`

**切换模型时**：
1. 修改 `EMBEDDING_MODEL`, `EMBEDDING_BASE_URL`, `EMBEDDING_DIM`
2. 执行数据库迁移修改向量维度
3. 清空现有向量，重新生成

### LLM 模型

当前支持：
- **DeepSeek** (推荐)
  - 模型：`deepseek-chat`
  - Base URL：`https://api.deepseek.com`

## 成本估算

### 火山引擎 Doubao

- 向量嵌入价格请参考官方定价
- 估算：每个知识点约 100-200 tokens

### DeepSeek

- 输入：~$0.27 / 1M tokens
- 输出：~$1.1 / 1M tokens
- 估算：每次对话约 $0.00035

## 支持

如有问题，请查看：
- `VECTOR_SEARCH_SETUP.md` - 详细设置指南
- `SERVER_SIDE_ARCHITECTURE.md` - 架构说明
- `EXECUTE_MIGRATION.md` - 数据库迁移指南
