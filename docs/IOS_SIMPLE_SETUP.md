# iOS应用简易配置指南（邮箱密码登录版）

## 🎯 概述

这是Learn Assistant的简化版iOS配置指南，使用**邮箱密码登录**替代Sign in with Apple，无需复杂的Apple Developer配置。

## ⚡ 5分钟快速开始

### 第一步：启动Next.js服务器 (1分钟)

```bash
cd /path/to/learn-assistant
npm install
npm run dev
```

✅ 服务器运行在 `http://localhost:3001`

---

### 第二步：配置API地址 (30秒)

打开 `ios/learn-assistant/learn-assistant/Services/APIService.swift`

找到第15行左右的 `baseURL`：

```swift
// 模拟器测试（推荐先用这个）
private let baseURL = "http://localhost:3001/api/ios"

// 真机测试（需要改成你的Mac IP地址）
// private let baseURL = "http://192.168.1.100:3001/api/ios"
```

**如何找到Mac的IP地址？**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

### 第三步：在Xcode中打开项目 (30秒)

```bash
open ios/learn-assistant/learn-assistant.xcodeproj
```

或者：
1. 打开Xcode
2. 选择 "Open a project or file"
3. 找到 `ios/learn-assistant/learn-assistant.xcodeproj`

---

### 第四步：配置Bundle ID（可选）

在Xcode中：
1. 选择项目 → Target → General
2. Bundle Identifier: 保持默认 `com.learnassistant.app` 或改成你喜欢的
3. Team: 选择你的Apple账号（个人免费账号即可）

**💡 提示**: 如果不发布到App Store，Team可以选择"Personal Team"（免费）

---

### 第五步：运行！(10秒)

1. 在Xcode顶部选择模拟器（推荐iPhone 15 Pro）
2. 按 **⌘R** 或点击 ▶️ 运行按钮

🎉 完成！应用启动后会看到登录界面

---

## 📱 首次使用

### 注册账号

1. 点击 **"Don't have an account? Sign Up"**
2. 输入邮箱地址（任意格式，如 `test@test.com`）
3. 输入密码（至少6位）
4. 点击 **"Sign Up"** 注册
5. 自动登录并进入主界面

### 登录账号

1. 输入已注册的邮箱和密码
2. 点击 **"Sign In"** 登录

---

## 🔧 真机测试

### 方法1：使用Mac的局域网IP（推荐）

1. **查找Mac的IP地址**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   输出类似：`inet 192.168.1.100`

2. **修改API地址**:
   ```swift
   // APIService.swift
   private let baseURL = "http://192.168.1.100:3001/api/ios"
   ```

3. **确保Mac和iPhone在同一WiFi网络**

4. **在Xcode中选择你的iPhone设备**

5. **点击运行**

### 方法2：使用ngrok（推荐用于远程测试）

如果你想在任何网络环境下测试：

1. **安装ngrok**:
   ```bash
   brew install ngrok
   ```

2. **启动ngrok**:
   ```bash
   ngrok http 3001
   ```

3. **复制ngrok提供的URL**:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3001
   ```

4. **修改API地址**:
   ```swift
   private let baseURL = "https://abc123.ngrok.io/api/ios"
   ```

---

## ✅ 功能测试清单

完整测试所有功能：

### 1. 认证功能
- [ ] 注册新账号
- [ ] 登录已有账号
- [ ] 登录后自动保持登录状态
- [ ] 退出登录功能

### 2. 知识点管理
- [ ] 创建知识点
- [ ] 查看知识点列表
- [ ] 编辑知识点
- [ ] 删除知识点
- [ ] 下拉刷新列表

### 3. AI聊天
- [ ] 发送问题
- [ ] 接收AI回答
- [ ] 查看引用来源
- [ ] 多轮对话

### 4. 复习系统
- [ ] 查看今日复习
- [ ] 完成复习任务
- [ ] 记录回忆内容

---

## 🐛 常见问题

### Q1: 无法连接到服务器

**症状**: 显示网络错误或超时

**解决方案**:
1. 确认Next.js服务器正在运行
2. 检查API URL配置是否正确
3. 模拟器用 `localhost`
4. 真机用Mac的局域网IP
5. 确保Mac防火墙允许连接

**测试连接**:
```bash
# 在iPhone的Safari中访问
http://你的MacIP:3001
# 应该看到网页响应
```

### Q2: 登录失败

**症状**: 提示"Invalid email or password"

**可能原因**:
1. 邮箱或密码输入错误
2. 账号尚未注册
3. 网络连接问题

**解决方案**:
- 先尝试注册新账号
- 确保密码至少6位
- 检查网络连接

### Q3: Token过期

**症状**: 一段时间后需要重新登录

**说明**: 这是正常的，Token会在1小时后过期

**自动处理**: 应用会自动刷新Token，通常不需要手动操作

### Q4: 真机上显示白屏

**可能原因**:
1. API URL配置错误（用了localhost）
2. Mac和iPhone不在同一WiFi
3. Mac防火墙阻止了连接

**解决方案**:
1. 改用Mac的局域网IP
2. 检查WiFi连接
3. 临时关闭Mac防火墙测试

### Q5: Xcode编译错误

**常见错误**:
- "No signing certificate found": 在Team中选择你的Apple账号
- "Bundle ID conflict": 修改Bundle Identifier

---

## 📊 与Sign in with Apple版本的对比

| 特性 | 邮箱密码版 | Sign in with Apple版 |
|------|------------|---------------------|
| 配置复杂度 | ⭐ 非常简单 | ⭐⭐⭐⭐⭐ 复杂 |
| 开发者账号 | 免费账号 | 付费账号($99/年) |
| 配置时间 | 5分钟 | 30分钟+ |
| 用户体验 | 需要记住密码 | 一键登录 |
| 安全性 | 标准安全 | 更高安全性 |
| 发布要求 | 无特殊要求 | App Store推荐 |

**建议**: 
- 开发测试阶段：使用邮箱密码版 ✅
- 正式发布前：升级到Sign in with Apple版

---

## 🚀 下一步

### 开发阶段
1. ✅ 使用邮箱密码版快速开发测试
2. 📝 完善应用功能
3. 🐛 修复bug
4. 🎨 优化UI

### 准备发布时
1. 升级到Sign in with Apple
2. 购买Apple Developer账号
3. 按照完整配置指南设置
4. 提交App Store审核

---

## 📚 相关文档

- [完整iOS配置指南](./IOS_SETUP_CN.md) - 包含Sign in with Apple
- [API接口文档](./IOS_API.md) - 所有API说明
- [项目README](../README_IOS.md) - 项目概述

---

## 💡 开发建议

### 1. 使用模拟器开发

**优点**:
- 速度快
- 调试方便
- 不需要配置网络

**步骤**:
1. API URL用 `localhost:3001`
2. 选择iPhone 15 Pro模拟器
3. 按⌘R运行

### 2. 测试数据

**创建测试账号**:
```
Email: test@test.com
Password: 123456
```

**添加测试知识点**:
- 注册后会自动创建几个示例知识点
- 可以用来测试AI聊天和复习功能

### 3. 调试技巧

**查看网络请求**:
```swift
// 在APIService.swift中添加日志
print("📤 Request: \(url)")
print("📥 Response: \(String(data: data, encoding: .utf8))")
```

**查看控制台**:
- Xcode → View → Debug Area → Show Debug Area
- 或按 ⌘⇧Y

### 4. 性能优化

**首次加载**:
- 应用启动会加载知识点列表
- 如果知识点较多，会分页加载

**缓存策略**:
- Token会保存在UserDefaults
- 下次启动自动登录

---

## 🎯 快速命令参考

```bash
# 启动开发服务器
npm run dev

# 查看Mac IP地址
ifconfig | grep "inet " | grep -v 127.0.0.1

# 启动ngrok（可选）
ngrok http 3001

# 在Xcode中清理构建
⌘⇧K (Shift + Command + K)

# 重新构建
⌘B (Command + B)

# 运行应用
⌘R (Command + R)
```

---

## 🆘 获取帮助

- 📖 查看文档
- 🐛 GitHub Issues
- 💬 项目讨论区

---

<div align="center">

**🎉 现在可以在iPhone上愉快地使用Learn Assistant了！**

Made with ❤️ using SwiftUI

</div>
