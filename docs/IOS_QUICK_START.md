# iOS版本快速开始 🚀

> **⚠️ 重要提示**：配置Apple Developer需要加入Apple Developer Program（免费账号即可）。
> 如果你还没有加入，在 https://developer.apple.com/account 页面会看到"立即注册"按钮，点击加入即可。

## ⚡ 5分钟极速配置

### 1️⃣ 启动后端 (1分钟)

```bash
cd /path/to/learn-assistant
npm run dev
```

✅ 服务器运行在 `http://localhost:3001`

---

### 2️⃣ 配置Apple Developer (2分钟)

> 💡 **首次配置？** 查看 [Apple Developer详细图文指引](./APPLE_DEVELOPER_GUIDE.md) 获取完整步骤说明

**创建App ID:**
1. 访问 https://developer.apple.com/account
2. 登录后，在页面顶部找到并点击 **"证书、标识符和描述文件"**（英文：Certificates, Identifiers & Profiles）
   - 💡 如果看不到这个选项，说明还没加入开发者计划，先点击"立即注册"加入（免费账号即可）
3. 在左侧菜单选择 **"标识符"** (Identifiers)
4. 点击左上角的 **"+"** 按钮
5. 选择 **"App IDs"** → 点击"继续"
6. 选择 **"App"** → 点击"继续"
7. 填写信息:
   - Description (描述): `Learn Assistant`
   - Bundle ID: 选择"Explicit" → 填写 `com.yourname.learnassistant`
   - 在Capabilities列表中勾选 **"Sign in with Apple"**
8. 点击"继续" → "注册"

**创建Services ID:**
1. 同样在"标识符"页面，点击左上角 **"+"**
2. 这次选择 **"Services IDs"** → 点击"继续"
3. 填写信息:
   - Description (描述): `Learn Assistant Service`
   - Identifier: `com.yourname.learnassistant.service`
4. 勾选 **"Sign in with Apple"** → 点击右侧的"配置"按钮
5. 在弹出的窗口中:
   - Primary App ID: 选择刚才创建的App ID
   - Domains and Subdomains: 填写 `yourproject.supabase.co` (替换为你的Supabase项目URL)
   - Return URLs: 填写 `https://yourproject.supabase.co/auth/v1/callback`
6. 点击"存储" → "继续" → "注册"

---

### 3️⃣ 配置Supabase (30秒)

1. 登录 https://app.supabase.com
2. Authentication → Providers → Apple
3. 填入 Services ID: `com.yourname.learnassistant.service`
4. 保存

---

### 4️⃣ 配置Xcode (1分钟)

1. 打开 `ios/learn-assistant/learn-assistant.xcodeproj`
2. 选择项目 → Target → General:
   - Bundle Identifier: 改为你的 `com.yourname.learnassistant`
   - Team: 选择你的Apple Developer Team
3. Signing & Capabilities:
   - 添加 "Sign in with Apple" Capability

---

### 5️⃣ 修改API地址 (30秒)

编辑 `ios/learn-assistant/learn-assistant/Services/APIService.swift`:

```swift
// 第15行左右，找到 baseURL
private let baseURL = "http://localhost:3001/api/ios"  // 模拟器
// private let baseURL = "http://192.168.1.100:3001/api/ios"  // 真机（改为你的Mac IP）
```

---

### 6️⃣ 运行！(10秒)

在Xcode中按 **⌘R**

🎉 完成！应该看到登录界面了

---

## 📋 检查清单

使用前确认:

- [ ] Next.js服务器在运行 (`npm run dev`)
- [ ] 能访问 http://localhost:3001
- [ ] Supabase项目已创建
- [ ] Apple Developer账号已配置
- [ ] Xcode中的Bundle ID已修改
- [ ] Team已选择
- [ ] Sign in with Apple Capability已添加

---

## 🆘 遇到问题？

### 登录失败
→ 检查Bundle ID是否匹配

### 无法连接服务器  
→ 确认Next.js在运行
→ 真机测试用Mac IP而非localhost

### Token过期
→ 正常，会自动刷新

### 其他问题
→ 查看完整文档: `docs/IOS_SETUP_CN.md`

---

## 📱 功能测试清单

测试所有功能是否正常:

### 1. 登录
- [ ] 点击 "Sign in with Apple"
- [ ] 选择账号或Face ID
- [ ] 成功进入主界面

### 2. 知识点管理
- [ ] 点击 "+" 创建知识点
- [ ] 填写问题和答案
- [ ] 保存成功
- [ ] 在列表中看到新知识点
- [ ] 点击编辑
- [ ] 左滑删除

### 3. AI聊天
- [ ] 输入问题
- [ ] 收到AI回答
- [ ] 查看引用来源（如果有）
- [ ] 发送多条消息

### 4. 复习系统
- [ ] 查看今日复习（如果有）
- [ ] 写下回忆
- [ ] 查看答案
- [ ] 标记为已完成

### 5. 设置
- [ ] 查看账号信息
- [ ] 退出登录
- [ ] 重新登录

全部通过 → ✅ 应用正常工作！

---

## 📚 下一步

- 📖 阅读完整文档了解更多功能
- 🎨 自定义UI和主题
- 🚀 部署到TestFlight
- 📱 发布到App Store

---

## 🔗 相关文档

- [完整配置指南（中文）](./IOS_SETUP_CN.md)
- [API接口文档](./IOS_API.md)
- [项目README](../ios/README.md)

---

<div align="center">

**准备好了吗？开始使用你的iOS学习助手吧！** 🎓📱

</div>
