# iOS应用配置指南

## 📱 项目概述

Learn Assistant iOS版是一个原生SwiftUI应用，提供完整的学习助手功能：

- ✅ **苹果账号登录** - 使用Sign in with Apple快速登录
- ✅ **知识点管理** - 创建、编辑、删除知识点
- ✅ **AI智能对话** - 基于你的知识库进行智能问答
- ✅ **智能复习** - 间隔重复学习法自动安排复习
- ✅ **向量搜索** - 自动向量化和语义搜索
- ✅ **原生体验** - 完全遵循苹果设计规范

## 🚀 快速开始

### 前置要求

1. **Mac电脑** - 运行macOS Sonoma或更高版本
2. **Xcode 15+** - 从App Store下载
3. **Apple Developer账号** - 免费或付费账号都可以
4. **Node.js环境** - 运行Next.js后端
5. **Supabase账号** - 数据库和认证服务

### 五分钟配置（开发模式）

#### 1️⃣ 启动Next.js服务器

```bash
cd /path/to/learn-assistant
npm install
npm run dev
```

服务器会运行在 `http://localhost:3001`

#### 2️⃣ 配置Supabase Apple认证

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 找到 **Apple** 并点击启用
5. 暂时保持默认设置（后面会配置）

#### 3️⃣ 配置Apple Developer

**创建App ID:**

1. 访问 [Apple Developer](https://developer.apple.com/account)
2. 进入 **Certificates, Identifiers & Profiles**
3. 选择 **Identifiers** → **App IDs**
4. 点击 **"+"** 创建新的App ID
5. 填写信息:
   - Description: `Learn Assistant`
   - Bundle ID: `com.yourname.learnassistant` (记住这个)
   - 勾选 **Sign in with Apple**
6. 点击 **Continue** → **Register**

**创建Services ID:**

1. 在Identifiers页面，选择 **Services IDs**
2. 点击 **"+"** 创建新的Services ID
3. 填写信息:
   - Description: `Learn Assistant Service`
   - Identifier: `com.yourname.learnassistant.service`
4. 勾选 **Sign in with Apple**
5. 点击 **Configure**:
   - Primary App ID: 选择刚才创建的App ID
   - Domains and Subdomains: 填写你的Supabase项目URL (例如: `abcdef.supabase.co`)
   - Return URLs: 填写 `https://abcdef.supabase.co/auth/v1/callback`
6. 保存并注册

**返回Supabase配置:**

1. 回到Supabase Dashboard的Apple Provider设置
2. 填写刚才的Services ID: `com.yourname.learnassistant.service`
3. 保存设置

#### 4️⃣ 配置Xcode项目

1. 打开 `ios/learn-assistant/learn-assistant.xcodeproj`

2. 选择项目 → **TARGETS** → **learn-assistant**

3. **General** 标签:
   - Bundle Identifier: 改为你的 `com.yourname.learnassistant`
   - Team: 选择你的Apple Developer Team

4. **Signing & Capabilities** 标签:
   - 点击 **"+ Capability"**
   - 添加 **Sign in with Apple**

5. 修改API地址:
   - 打开 `Services/APIService.swift`
   - 找到 `private let baseURL`
   - 如果用模拟器测试，保持 `http://localhost:3001/api/ios`
   - 如果用真机测试，改为你的电脑IP: `http://192.168.1.100:3001/api/ios`

#### 5️⃣ 运行应用

1. 在Xcode中选择模拟器（iPhone 15 Pro推荐）
2. 点击 **Run** 按钮 (▶️) 或按 **⌘R**
3. 等待编译完成
4. 应用启动后，点击 **Sign in with Apple** 登录

## 🏗️ 项目架构

### 目录结构

```
ios/learn-assistant/learn-assistant/
├── learn_assistantApp.swift          # 应用入口
│
├── Models/                            # 数据模型
│   └── Models.swift                   # User, KnowledgePoint, Review等
│
├── Services/                          # 服务层
│   ├── APIService.swift               # REST API调用
│   └── AuthService.swift              # 认证管理
│
├── ViewModels/                        # 视图模型 (MVVM)
│   ├── KnowledgeViewModel.swift       # 知识点业务逻辑
│   ├── ChatViewModel.swift            # 聊天业务逻辑
│   └── ReviewViewModel.swift          # 复习业务逻辑
│
└── Views/                             # SwiftUI视图
    ├── SignInWithAppleView.swift      # 登录界面
    ├── MainTabView.swift              # 主标签页
    ├── KnowledgeListView.swift        # 知识点列表
    ├── AddKnowledgePointView.swift    # 添加知识点
    ├── EditKnowledgePointView.swift   # 编辑知识点
    ├── ChatView.swift                 # AI聊天界面
    ├── ReviewView.swift               # 复习界面
    └── SettingsView.swift             # 设置界面
```

### 架构模式

采用 **MVVM (Model-View-ViewModel)** 架构:

```
┌─────────────┐
│    View     │  SwiftUI视图，纯UI展示
└──────┬──────┘
       │ @Published
       │ 数据绑定
┌──────▼──────┐
│ ViewModel   │  业务逻辑，状态管理
└──────┬──────┘
       │
       │ async/await
┌──────▼──────┐
│   Service   │  网络请求，数据持久化
└──────┬──────┘
       │
       │ REST API
┌──────▼──────┐
│  Next.js    │  后端API服务
└─────────────┘
```

### 数据流

#### 1. 用户认证流程

```
用户点击"Sign in with Apple"
    ↓
iOS调用AuthenticationServices
    ↓
获取Apple Identity Token
    ↓
POST /api/ios/auth/apple
    ↓
Supabase验证Token
    ↓
返回access_token + refresh_token
    ↓
保存到UserDefaults
    ↓
进入主界面
```

#### 2. 创建知识点流程

```
用户填写问题和答案
    ↓
KnowledgeViewModel.createKnowledgePoint()
    ↓
POST /api/ios/knowledge
    ↓
后端生成向量 (OpenAI Embedding)
    ↓
保存到Supabase (PostgreSQL + pgvector)
    ↓
自动创建复习计划 (1, 3, 7, 14, 30天)
    ↓
返回新知识点
    ↓
更新UI列表
```

#### 3. AI聊天流程

```
用户输入问题
    ↓
ChatViewModel.sendMessage()
    ↓
POST /api/ios/chat
    ↓
后端生成问题向量
    ↓
向量搜索相关知识点 (pgvector)
    ↓
组装上下文 + 调用DeepSeek
    ↓
返回AI回答 + 引用来源
    ↓
显示在聊天界面
```

## 🔧 详细配置

### 网络配置

#### 本地开发（模拟器）

```swift
// APIService.swift
private let baseURL = "http://localhost:3001/api/ios"
```

这样可以直接连接到你Mac上运行的Next.js服务器。

#### 真机测试

真机不能访问`localhost`，需要使用你的Mac在局域网中的IP:

1. 查找你的Mac IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   
2. 假设你的IP是 `192.168.1.100`，修改:
   ```swift
   private let baseURL = "http://192.168.1.100:3001/api/ios"
   ```

3. 确保iPhone和Mac在同一WiFi网络

#### 生产环境

部署Next.js到服务器后:

```swift
private let baseURL = "https://your-domain.com/api/ios"
```

### 认证Token管理

#### Token存储

```swift
// 存储在UserDefaults (加密存储可以用Keychain)
UserDefaults.standard.set(data, forKey: "LearnAssistant.Auth")
```

#### Token自动刷新

```swift
// 在token过期前5分钟自动刷新
func shouldRefreshToken() -> Bool {
    guard let expiresAt = expiresAt else { return false }
    let currentTime = Int(Date().timeIntervalSince1970)
    return currentTime > (expiresAt - 300)
}
```

#### 请求认证

所有API请求自动携带token:

```swift
request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
```

### 错误处理

#### 网络错误

```swift
enum APIServiceError: LocalizedError {
    case invalidResponse      // 无效响应
    case httpError(Int)       // HTTP错误码
    case serverError(String)  // 服务器返回的错误
    case decodingError        // JSON解析错误
}
```

#### UI错误显示

```swift
@Published var error: String?

// 在View中
if let error = viewModel.error {
    Text(error)
        .foregroundColor(.red)
}
```

## 📱 功能详解

### 1. 知识点管理

#### 创建知识点

- 打开 **Knowledge** 标签
- 点击右上角 **"+"** 按钮
- 填写问题和答案
- 选择是否加入复习计划
- 点击 **Save**

**自动功能:**
- 自动生成向量嵌入
- 自动创建5次复习计划（1天、3天、7天、14天、30天后）

#### 编辑知识点

- 在列表中点击知识点
- 修改内容
- 点击 **Save**

**注意:** 修改后会重新生成向量

#### 删除知识点

- 左滑知识点
- 点击 **Delete**
- 确认删除

**注意:** 删除会同时删除相关的复习记录

### 2. AI智能对话

#### 开始聊天

- 打开 **Chat** 标签
- 输入你的问题
- 等待AI回答

#### 查看引用来源

- AI回答后，如果使用了知识库内容
- 会显示 **"View X source(s)"** 按钮
- 点击查看引用的知识点和相似度

#### 聊天特点

- 基于你的知识库回答（RAG技术）
- 显示知识点相似度百分比
- 保持对话历史（最近10条）
- 支持多行输入

### 3. 间隔复习

#### 查看今日复习

- 打开 **Review** 标签
- 自动显示今天需要复习的知识点

#### 复习流程

1. 阅读问题
2. 在 **"Your Recall"** 区域写下你的回忆
3. 点击 **"Show Answer"** 查看正确答案
4. 对比你的回答和正确答案
5. 点击 **"Mark as Reviewed"** 完成复习

#### 复习进度

- 顶部显示进度条
- 显示 "X of Y" 进度
- 完成所有复习后显示祝贺页面

### 4. 设置

- 查看账号信息
- 查看应用版本
- 退出登录

## 🐛 常见问题

### Q1: 登录时提示 "Invalid client"

**原因:** Apple OAuth配置不正确

**解决:**
1. 检查Bundle ID是否和Apple Developer中的App ID一致
2. 检查Supabase中的Services ID是否正确
3. 确认Redirect URL配置正确: `https://yourproject.supabase.co/auth/v1/callback`

### Q2: 真机无法连接服务器

**原因:** 使用了localhost地址

**解决:**
1. 查找你的Mac IP地址:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. 修改`APIService.swift`中的baseURL
3. 确保iPhone和Mac在同一WiFi
4. 检查Mac防火墙设置

### Q3: 知识点列表加载失败

**原因:** Token过期或权限问题

**解决:**
1. 退出登录重新登录
2. 检查Supabase RLS策略
3. 检查后端API日志

### Q4: AI聊天无响应

**原因:** API密钥或网络问题

**解决:**
1. 检查`.env.local`中的`DEEPSEEK_API_KEY`
2. 检查`EMBEDDING_API_KEY`
3. 查看Next.js控制台日志
4. 测试API连通性

### Q5: 向量搜索没有结果

**原因:** 知识点尚未向量化或阈值太高

**解决:**
1. 确认知识点已经创建成功
2. 检查Supabase中是否有embedding数据
3. 降低搜索阈值（默认0.6）

## 🎨 UI/UX特性

### 原生iOS设计

- ✅ 使用SwiftUI原生组件
- ✅ 遵循Apple Human Interface Guidelines
- ✅ 支持深色模式（自动）
- ✅ 动态字体大小
- ✅ 无障碍支持

### 交互体验

- **下拉刷新** - 知识点列表支持下拉刷新
- **无限滚动** - 自动加载更多知识点
- **左滑操作** - 编辑和删除知识点
- **键盘管理** - 自动管理键盘显示/隐藏
- **加载状态** - 清晰的加载指示器
- **错误提示** - 友好的错误消息

### 性能优化

- **分页加载** - 每次加载20条数据
- **懒加载** - 使用LazyVStack优化列表性能
- **异步处理** - 所有网络请求使用async/await
- **内存管理** - 正确使用weak self避免循环引用

## 🚢 部署到TestFlight

### 准备工作

1. **付费Developer账号** - TestFlight需要付费账号
2. **完整Bundle ID** - 在App Store Connect创建
3. **App图标** - 1024x1024px

### 步骤

1. **Archive构建**
   ```
   Xcode → Product → Archive
   ```

2. **上传到App Store Connect**
   ```
   Organizer → Distribute App → App Store Connect
   ```

3. **配置TestFlight**
   - 登录 [App Store Connect](https://appstoreconnect.apple.com)
   - 选择你的应用
   - 进入 **TestFlight** 标签
   - 添加测试用户

4. **开始测试**
   - 测试用户会收到邮件邀请
   - 安装TestFlight应用
   - 下载并测试你的应用

## 📚 API文档

完整的API文档请参考: `docs/IOS_API.md`

## 🔐 安全建议

1. **不要提交敏感信息**
   - `.env.local` 已在 `.gitignore` 中
   - 不要在代码中硬编码API密钥

2. **使用Keychain存储Token**
   - 当前使用UserDefaults
   - 生产环境建议使用Keychain

3. **HTTPS通信**
   - 生产环境必须使用HTTPS
   - 配置App Transport Security

4. **定期更新依赖**
   - 及时更新Xcode
   - 更新第三方库

## 📖 学习资源

- [SwiftUI官方教程](https://developer.apple.com/tutorials/swiftui)
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Sign in with Apple文档](https://developer.apple.com/documentation/sign_in_with_apple)
- [Supabase iOS文档](https://supabase.com/docs/guides/getting-started/quickstarts/ios)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
