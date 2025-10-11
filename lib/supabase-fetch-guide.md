# Supabase Fetch API 工具类使用指南

这个工具类是为了解决 Supabase 客户端在 Next.js 环境中的兼容性问题而创建的。它使用 fetch API 直接调用 Supabase REST API，避免了客户端库的卡住问题。

## 基本用法

```typescript
import { supabaseFetch } from '@/lib/supabase-fetch';

// 查询数据
const points = await supabaseFetch.select<KnowledgePoint>(
  'knowledge_points',
  {
    columns: '*',
    filters: { user_id: userId },
    order: { column: 'created_at', ascending: false }
  },
  accessToken
);

// 插入数据
const newPoint = await supabaseFetch.insert<KnowledgePoint>(
  'knowledge_points',
  { question: '问题', answer: '答案', user_id: userId },
  { columns: '*' },
  accessToken
);

// 更新数据
await supabaseFetch.update(
  'knowledge_points',
  { question: '新问题', answer: '新答案' },
  { id: pointId },
  { columns: '*' },
  accessToken
);

// 删除数据
await supabaseFetch.delete('knowledge_points', { id: pointId }, accessToken);
```

## API 参考

### select(table, options, accessToken?)

查询数据

**参数：**
- `table`: 表名
- `options.columns`: 要选择的列，默认为 '*'
- `options.filters`: 过滤条件对象
- `options.order`: 排序配置 `{ column: string, ascending?: boolean }`
- `options.limit`: 限制返回行数
- `options.offset`: 偏移量
- `accessToken`: 可选的访问令牌

### insert(table, data, options, accessToken?)

插入数据

**参数：**
- `table`: 表名
- `data`: 要插入的数据（对象或数组）
- `options.columns`: 返回的列
- `options.upsert`: 是否使用 upsert
- `accessToken`: 可选的访问令牌

### update(table, data, filters, options, accessToken?)

更新数据

**参数：**
- `table`: 表名
- `data`: 要更新的数据
- `filters`: 过滤条件对象
- `options.columns`: 返回的列
- `accessToken`: 可选的访问令牌

### delete(table, filters, accessToken?)

删除数据

**参数：**
- `table`: 表名
- `filters`: 过滤条件对象
- `accessToken`: 可选的访问令牌

### rpc(functionName, params, accessToken?)

执行 RPC 函数

**参数：**
- `functionName`: RPC 函数名
- `params`: 函数参数
- `accessToken`: 可选的访问令牌

## 过滤条件语法

```typescript
// 等于
{ user_id: '123' } // user_id=eq.123

// 小于等于
{ review_date: 'lte.2025-10-11' } // review_date=lte.2025-10-11

// 不等于
{ completed: 'neq.true' } // completed=neq.true

// 在范围内
{ status: 'in.(active,pending)' } // status=in.(active,pending)
```

## 注意事项

1. **认证令牌**: 所有需要认证的操作都应该传递 `accessToken` 参数
2. **错误处理**: 工具类会自动抛出 HTTP 错误，请使用 try-catch 处理
3. **类型安全**: 使用 TypeScript 泛型来确保类型安全
4. **环境变量**: 确保设置了 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 与 Supabase 客户端的对比

| 功能 | Supabase 客户端 | Supabase Fetch |
|------|----------------|----------------|
| 查询 | `supabase.from('table').select()` | `supabaseFetch.select()` |
| 插入 | `supabase.from('table').insert()` | `supabaseFetch.insert()` |
| 更新 | `supabase.from('table').update()` | `supabaseFetch.update()` |
| 删除 | `supabase.from('table').delete()` | `supabaseFetch.delete()` |
| 兼容性 | ❌ Next.js 中可能卡住 | ✅ 稳定可靠 |
| 类型安全 | ✅ | ✅ |
| 错误处理 | ✅ | ✅ |
