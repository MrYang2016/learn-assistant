# Cursor MCP 配置指南

## 快速配置

1. **获取 API Key**：在 Learn Assistant 应用中创建 API Key

2. **配置 Cursor**：
   
   找到配置文件：
   - **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - **Windows**: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings/cline_mcp_settings.json`
   - **Linux**: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

3. **选择配置方式**：

### 方式一：SSE 传输（推荐，解决 "Loading tools" 问题）

使用 SSE (Server-Sent Events) 传输，这是 Cursor 原生支持的传输方式：

```json
{
  "mcpServers": {
    "learn-assistant": {
      "url": "https://your-domain.com/api/mcp/sse",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

**注意**：URL 指向 `/api/mcp/sse` 端点，这是 SSE 传输端点。

### 方式二：HTTP POST 传输（备用）

如果 SSE 不工作，可以使用传统的 HTTP POST 端点：

```json
{
  "mcpServers": {
    "learn-assistant": {
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      }
    }
  }
}
```

4. **重启 Cursor**

完成！现在可以在 Cursor 中使用 MCP 工具了。

## 示例

### SSE 方式示例（推荐）

```json
{
  "mcpServers": {
    "learn-assistant": {
      "url": "https://learn-assistant.aries-happy.com/api/mcp/sse",
      "headers": {
        "Authorization": "Bearer sk_xxxxxxxxxxxxx"
      }
    }
  }
}
```

### HTTP POST 方式示例（备用）

```json
{
  "mcpServers": {
    "learn-assistant": {
      "url": "https://learn-assistant.aries-happy.com/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_xxxxxxxxxxxxx"
      }
    }
  }
}
```

## 故障排除

### 如果一直显示 "Loading tools"

1. **使用 SSE 端点**：确保 URL 指向 `/api/mcp/sse` 而不是 `/api/mcp`
2. **检查 API Key**：确保 API Key 正确且未过期
3. **检查服务器状态**：确保 Next.js 服务器正在运行
4. **查看日志**：检查服务器控制台是否有错误信息
5. **重启 Cursor**：修改配置后需要完全重启 Cursor

### 常见错误

- **"Loading tools" 一直显示**：通常是因为使用了 HTTP POST 而不是 SSE。切换到 `/api/mcp/sse` 端点。
- **"Unauthorized"**：检查 API Key 是否正确
- **"Session not found"**：SSE 连接可能已断开，重启 Cursor

## 测试

在 Cursor 中尝试询问："查询今日需要复习的内容"
