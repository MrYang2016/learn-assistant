# PM2 使用说明

本项目已配置支持使用PM2进行进程管理。

## 安装依赖

首先安装项目依赖（包括PM2）：

```bash
npm install
```

## 构建项目

在启动PM2之前，需要先构建项目：

```bash
npm run build
```

## PM2 命令

### 启动应用

```bash
# 生产环境启动
npm run pm2:start

# 开发环境启动
npm run pm2:start:dev

# 预发布环境启动
npm run pm2:start:staging
```

### 管理应用

```bash
# 停止应用
npm run pm2:stop

# 重启应用
npm run pm2:restart

# 重载应用（零停机时间）
npm run pm2:reload

# 删除应用
npm run pm2:delete
```

### 监控和日志

```bash
# 查看日志
npm run pm2:logs

# 打开监控面板
npm run pm2:monit

# 查看应用状态
pm2 status
```

## 配置文件

PM2配置位于 `ecosystem.config.js` 文件中，包含以下配置：

- **应用名称**: learn-assistant
- **端口**: 3000
- **环境变量**: 支持 production、development、staging
- **日志**: 存储在 `./logs/` 目录
- **内存限制**: 1GB
- **自动重启**: 启用

## 日志文件

PM2日志文件存储在 `logs/` 目录中：

- `combined.log`: 合并日志
- `out.log`: 标准输出日志
- `error.log`: 错误日志

## 环境变量

可以通过环境变量配置应用：

- `NODE_ENV`: 运行环境 (production/development/staging)
- `PORT`: 应用端口 (默认: 3000)

## 注意事项

1. 确保在启动PM2之前已经构建了项目 (`npm run build`)
2. 生产环境建议使用 `npm run pm2:start`
3. 开发环境可以使用 `npm run pm2:start:dev`
4. 使用 `pm2:reload` 进行零停机时间更新
5. 定期检查日志文件以监控应用状态
