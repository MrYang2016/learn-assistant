# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于Next.js的间隔重复学习应用，使用TypeScript开发，支持中英文国际化。应用核心功能包括主动回忆、间隔重复算法、知识管理和复习计划。

## 常用开发命令

```bash
# 开发服务器（端口3001）
npm run dev

# 构建项目
npm run build

# 生产环境启动
npm run start

# 代码检查
npm run lint

# PM2生产环境管理
npm run pm2:start        # 启动生产环境（自动拉取最新代码并构建）
npm run pm2:start:dev    # 启动开发环境
npm run pm2:stop         # 停止应用
npm run pm2:restart      # 重启应用
npm run pm2:reload       # 零停机重载
npm run pm2:logs         # 查看日志
npm run pm2:monit        # 监控面板
```

## 架构核心

### 技术栈
- **Next.js 15.5.4** - App Router架构
- **React 19.1.0** - UI框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Radix UI** - UI组件库
- **Supabase** - 后端数据库服务
- **next-intl** - 国际化支持

### 核心目录结构
- `/app/[locale]` - 国际化路由页面
- `/components` - React组件（包含UI组件和业务组件）
- `/lib` - 核心业务逻辑
  - `knowledge-service.ts` - 知识管理服务（核心算法）
  - `supabase.ts` & `supabase-fetch.ts` - 数据库访问层
- `/contexts` - React上下文（认证状态管理）
- `/messages` - 国际化翻译文件
- `/supabase` - Supabase类型定义和配置

### 核心算法逻辑

**间隔重复算法**（`lib/knowledge-service.ts:4`）
- 复习间隔：1天、7天、16天、35天
- 每次创建知识点时自动生成4个复习计划
- 复习状态跟踪：未完成/已完成，包含主动回忆内容

**主动回忆功能**
- 用户在查看答案前需要写下自己回忆的内容
- 系统记录回忆内容与标准答案的对比

### 国际化处理

**中间件自动语言检测**（`app/middleware.ts`）
- 支持中文(zh)和英文(en)
- 默认语言：英文
- 自动根据浏览器语言偏好重定向

**翻译文件位置**
- `/messages/en.json` - 英文翻译
- `/messages/zh.json` - 中文翻译

### 数据库架构

**主要数据表**（Supabase）
- `knowledge_points` - 知识点（问题、答案、用户关联）
- `review_schedules` - 复习计划（复习日期、完成状态、回忆内容）
- `users` - 用户信息（通过Supabase Auth管理）

### 认证流程

**认证上下文**（`/contexts/AuthContext.tsx`）
- 使用Supabase认证
- 访问令牌管理
- 用户状态同步

### 生产部署

**PM2配置**（`ecosystem.config.js`）
- 内存限制：1GB
- 自动重启：启用
- 日志目录：`./logs/`
- 支持多环境：production/development/staging

## 开发注意事项

1. **网络代理设置**：如果遇到网络问题，设置VPN代理
   ```bash
   export http_proxy=http://127.0.0.1:1087
   export https_proxy=http://127.0.0.1:1087
   ```

2. **测试框架**：当前项目未配置测试框架，新增业务功能时应考虑添加单元测试

3. **环境变量**：确保配置正确的Supabase连接信息
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **端口配置**：开发环境使用3001端口，生产环境使用3000端口

5. **国际化**：新增页面或组件时需要考虑多语言支持，使用`useTranslations` hook获取翻译