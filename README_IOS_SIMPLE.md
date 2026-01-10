# Learn Assistant iOS - 简化版（邮箱密码登录）

## 🎯 快速开始

这是Learn Assistant iOS应用的**简化版本**，使用邮箱密码登录，无需复杂的Apple Developer配置。

### ⚡ 3步快速启动

#### 1️⃣ 启动服务器
```bash
npm run dev
```

#### 2️⃣ 打开Xcode项目
```bash
open ios/learn-assistant/learn-assistant.xcodeproj
```

#### 3️⃣ 运行
在Xcode中按 **⌘R**

🎉 完成！

---

## 📱 功能特性

✅ **所有核心功能都可用**：
- 邮箱密码注册/登录
- 知识点管理
- AI智能对话
- 间隔复习系统
- 向量搜索

❌ **不需要**：
- Apple Developer付费账号
- Sign in with Apple配置
- Services ID配置
- 复杂的OAuth设置

---

## 🆚 版本对比

### 邮箱密码版（当前）

**优点**:
- ⚡ 5分钟即可运行
- 💰 完全免费
- 🎯 适合开发测试
- 🔧 配置简单

**适用场景**:
- 开发阶段
- 功能测试
- 个人使用
- 快速原型

### Sign in with Apple版

**优点**:
- 🔐 更高安全性
- ⚡ 一键登录
- 🍎 Apple推荐
- 📱 更好的用户体验

**适用场景**:
- 正式发布
- App Store上架
- 商业应用

**需要**:
- Apple Developer账号（$99/年）
- 30分钟+ 配置时间

---

## 📖 详细文档

### 配置指南
👉 [简易配置指南](./docs/IOS_SIMPLE_SETUP.md) - **强烈推荐阅读**

### 完整文档
- [API接口文档](./docs/IOS_API.md)
- [Sign in with Apple配置](./docs/IOS_SETUP_CN.md)（未来升级用）

---

## 🔄 未来升级到Apple登录

当你准备发布应用时，可以升级到Sign in with Apple：

### 升级步骤

1. **购买Apple Developer账号** ($99/年)
   - 访问 https://developer.apple.com/programs/

2. **按照完整配置指南设置**
   - 参考 [IOS_SETUP_CN.md](./docs/IOS_SETUP_CN.md)
   - 配置App ID和Services ID

3. **替换登录代码**
   - 我们保留了完整的Apple登录代码
   - 只需切换即可

4. **测试发布**
   - TestFlight测试
   - 提交App Store审核

### 代码修改（升级时）

只需要修改2个文件：

**1. `learn_assistantApp.swift`**
```swift
// 改回Apple登录
SignInView() → SignInWithAppleView()
```

**2. `AuthService.swift`**
```swift
// 启用Apple登录方法
// handleSignInWithApple() 已经准备好了
```

---

## 🐛 常见问题

### Q: 为什么使用邮箱密码而不是Sign in with Apple？

**A**: Sign in with Apple需要：
- 付费的Apple Developer账号（$99/年）
- 复杂的配置流程（30分钟+）
- Services ID、OAuth配置等

对于开发测试阶段，邮箱密码登录更简单快捷。

### Q: 邮箱密码版本安全吗？

**A**: 是的，安全性包括：
- ✅ HTTPS传输（生产环境）
- ✅ JWT Token认证
- ✅ 密码加密存储
- ✅ Token自动刷新
- ✅ Supabase安全认证

### Q: 可以在App Store发布吗？

**A**: 可以，但建议：
- 开发测试：使用邮箱密码 ✅
- 正式发布：升级到Sign in with Apple ⭐

Apple推荐使用Sign in with Apple，审核时会有加分。

### Q: 数据可以迁移吗？

**A**: 可以！
- 数据存储在Supabase中
- 切换登录方式不影响数据
- 同一个Supabase账号可以同时支持两种登录

---

## 📱 真机测试

### 方法1：使用局域网IP

1. 查找Mac IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. 修改 `APIService.swift`:
   ```swift
   private let baseURL = "http://192.168.1.100:3001/api/ios"
   ```

3. 确保Mac和iPhone在同一WiFi

### 方法2：使用ngrok

1. 安装ngrok:
   ```bash
   brew install ngrok
   ```

2. 启动:
   ```bash
   ngrok http 3001
   ```

3. 使用ngrok提供的URL

---

## 🎨 技术实现

### 认证流程

```
用户输入邮箱密码
    ↓
POST /api/ios/auth/signin
    ↓
Supabase验证
    ↓
返回JWT Token
    ↓
保存到UserDefaults
    ↓
进入主界面
```

### API端点

```
POST /api/ios/auth/signup   - 注册
POST /api/ios/auth/signin   - 登录
POST /api/ios/auth/refresh  - 刷新Token
```

### 安全措施

- ✅ 密码最小长度6位
- ✅ Token有效期1小时
- ✅ 自动刷新机制
- ✅ 安全存储（可升级到Keychain）

---

## 📊 性能对比

| 指标 | 邮箱密码版 | Apple登录版 |
|------|-----------|-------------|
| 配置时间 | 5分钟 | 30分钟+ |
| 登录速度 | ~1秒 | ~1秒 |
| 用户体验 | 需输入 | 一键登录 |
| 开发成本 | 免费 | $99/年 |
| 维护成本 | 低 | 中 |

---

## 🚀 生产部署

### 部署Next.js到Vercel

1. 推送代码到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 更新iOS应用配置

```swift
// 使用生产环境URL
private let baseURL = "https://your-domain.com/api/ios"
```

### TestFlight测试

1. Archive项目
2. 上传到App Store Connect
3. 添加测试用户
4. 开始测试

---

## 💡 最佳实践

### 1. 开发阶段
- ✅ 使用模拟器 + localhost
- ✅ 快速迭代功能
- ✅ 邮箱密码登录

### 2. 测试阶段
- ✅ 真机测试（局域网IP）
- ✅ 完整功能测试
- ✅ 性能优化

### 3. 发布阶段
- ✅ 部署到生产环境
- ✅ 升级到Apple登录
- ✅ TestFlight测试
- ✅ 提交审核

---

## 📚 学习资源

- [SwiftUI教程](https://developer.apple.com/tutorials/swiftui)
- [Supabase文档](https://supabase.com/docs)
- [Next.js文档](https://nextjs.org/docs)

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

<div align="center">

**🎉 开始使用你的iOS学习助手吧！**

如果觉得有用，请给个⭐！

[详细配置指南](./docs/IOS_SIMPLE_SETUP.md) | [API文档](./docs/IOS_API.md) | [升级指南](./docs/IOS_SETUP_CN.md)

</div>
