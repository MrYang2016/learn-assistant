# 执行数据库迁移 - 修改向量维度为 2560

## 快速执行（复制以下 SQL 到 Supabase SQL Editor）

```sql
-- ============================================
-- 修改向量维度从 1536 到 2560
-- ============================================

-- 1. 删除现有索引
DROP INDEX IF EXISTS idx_knowledge_points_embedding;

-- 2. 删除旧的搜索函数
DROP FUNCTION IF EXISTS search_knowledge_points(vector(1536), float, int, uuid);

-- 3. 修改 embedding 列类型为 2560 维
ALTER TABLE knowledge_points 
ALTER COLUMN embedding TYPE vector(2560);

-- 4. 重新创建索引（使用 HNSW，支持高维向量）
CREATE INDEX idx_knowledge_points_embedding 
ON knowledge_points 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. 重新创建搜索函数（2560 维）
CREATE OR REPLACE FUNCTION search_knowledge_points(
  query_embedding vector(2560),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  question text,
  answer text,
  similarity float,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kp.id,
    kp.user_id,
    kp.question,
    kp.answer,
    1 - (kp.embedding <=> query_embedding) as similarity,
    kp.created_at,
    kp.updated_at
  FROM knowledge_points kp
  WHERE 
    kp.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR kp.user_id = filter_user_id)
    AND 1 - (kp.embedding <=> query_embedding) > match_threshold
  ORDER BY kp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. 授权
GRANT EXECUTE ON FUNCTION search_knowledge_points TO authenticated;

-- 7. 更新注释
COMMENT ON COLUMN knowledge_points.embedding IS 'Vector embedding for semantic search (2560 dimensions)';
```

## 执行步骤

### 1. 登录 Supabase Dashboard

访问：https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### 2. 复制上面的 SQL 到 SQL Editor

将上面 SQL 代码块中的所有内容复制到 Supabase 的 SQL Editor 中。

### 3. 执行 SQL

点击 "Run" 按钮执行。

### 4. 验证执行结果

执行后应该看到类似的输出：
```
Success. No rows returned.
```

### 5. 验证修改

运行以下 SQL 验证列类型：

```sql
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'knowledge_points' 
AND column_name = 'embedding';
```

应该看到 `udt_name` 为 `vector`，维度为 2560。

### 6. 更新环境变量

确保 `.env.local` 中的配置正确：

```bash
EMBEDDING_DIM=2560
```

### 7. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 注意事项

⚠️ **重要**：
1. 如果你的 `knowledge_points` 表中已经有数据且包含 1536 维的向量，那些向量将变为无效
2. 建议在执行迁移前备份数据
3. 执行迁移后，需要重新生成所有知识点的向量（使用 2560 维）

## 清理旧数据（可选）

如果已有的知识点包含 1536 维的向量，你可以选择清空它们：

```sql
-- 清空所有现有的向量（它们是 1536 维的，现在需要 2560 维）
UPDATE knowledge_points 
SET embedding = NULL 
WHERE embedding IS NOT NULL;
```

然后在应用中重新编辑这些知识点，系统会自动生成新的 2560 维向量。

## 故障排查

### 错误：cannot drop function search_knowledge_points

如果遇到此错误，使用带 CASCADE 的删除：

```sql
DROP FUNCTION IF EXISTS search_knowledge_points CASCADE;
```

### 错误：index depends on column

如果遇到此错误，先删除索引：

```sql
DROP INDEX IF EXISTS idx_knowledge_points_embedding CASCADE;
```

然后重新执行完整的迁移脚本。

## 完成

迁移完成后，你可以正常使用应用，新创建的知识点将使用 2560 维的向量。
