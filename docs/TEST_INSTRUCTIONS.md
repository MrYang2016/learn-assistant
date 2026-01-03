# 重启服务器并测试

请执行以下步骤：

1. **重启开发服务器**（让环境变量生效）：
   ```bash
   npm run dev
   ```

2. **等待服务器启动后，测试 API key 验证**：
   在浏览器访问：http://localhost:3001/api/test-api-key
   
   应该会看到：
   - `"usingServiceRole": true` （而不是 false）
   - `"count": 1` 或更大的数字（找到 API key 了）
   - 在 `results` 数组中应该有你的 API key 数据

3. **然后在 Cursor 中重新连接 MCP 服务器**

如果 `usingServiceRole` 还是 `false`，可能需要：
- 检查 `.env` 文件格式是否正确（没有引号，没有多余空格）
- 确认文件是 `.env` 而不是 `.env.example`
- Next.js 有时需要完全重启才能加载新的环境变量

