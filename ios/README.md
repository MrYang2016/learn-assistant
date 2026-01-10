# Learn Assistant iOS

<div align="center">

<img src="https://img.shields.io/badge/iOS-17.0+-blue.svg" />
<img src="https://img.shields.io/badge/Swift-5.9-orange.svg" />
<img src="https://img.shields.io/badge/SwiftUI-✓-green.svg" />
<img src="https://img.shields.io/badge/License-MIT-yellow.svg" />

**一个基于AI和间隔重复的智能学习助手iOS应用**

[功能特性](#功能特性) • [快速开始](#快速开始) • [截图](#截图) • [文档](#文档) • [贡献](#贡献)

</div>

---

## 📱 功能特性

### 🔐 苹果账号登录
- 使用Sign in with Apple快速安全登录
- 自动Token刷新机制
- 无需记忆密码

### 📚 知识点管理
- 创建、编辑、删除知识点
- 自动向量化（OpenAI Embeddings）
- 语义搜索支持
- 分页加载，下拉刷新

### 💬 AI智能对话
- 基于RAG的智能问答
- 引用知识库内容
- 显示相似度评分
- 保持对话上下文

### 🗓️ 智能复习系统
- 间隔重复学习法（Spaced Repetition）
- 自动安排5次复习：1天、3天、7天、14天、30天
- 记录主动回忆内容
- 进度追踪

### 🎨 现代化UI
- 完全原生SwiftUI
- 遵循Apple设计规范
- 支持深色模式
- 流畅动画效果

---

## 🚀 快速开始

### 前置要求

- macOS Sonoma+ 
- Xcode 15+
- Apple Developer账号
- Node.js 18+

### 5分钟快速配置

#### 1️⃣ 启动后端服务

```bash
cd ..  # 返回项目根目录
npm install
npm run dev  # 运行在 http://localhost:3001
```

#### 2️⃣ 配置Apple Developer

1. 访问 [Apple Developer](https://developer.apple.com/account)
2. 创建App ID: `com.yourname.learnassistant`
3. 启用 "Sign in with Apple"
4. 创建Services ID并配置Redirect URL

详细步骤: [完整配置指南](../docs/IOS_SETUP_CN.md)

#### 3️⃣ 配置Xcode

1. 打开 `learn-assistant.xcodeproj`
2. 修改Bundle Identifier为你的App ID
3. 选择你的Team
4. 添加 "Sign in with Apple" Capability

#### 4️⃣ 修改API地址

编辑 `Services/APIService.swift`:

```swift
// 模拟器使用
private let baseURL = "http://localhost:3001/api/ios"

// 真机使用你的Mac IP
private let baseURL = "http://192.168.1.100:3001/api/ios"
```

#### 5️⃣ 运行应用

按 **⌘R** 或点击 Run 按钮

---

## 📸 截图

<table>
  <tr>
    <td><b>登录界面</b><br/>Sign in with Apple</td>
    <td><b>知识点列表</b><br/>管理你的知识库</td>
    <td><b>AI聊天</b><br/>智能问答</td>
  </tr>
  <tr>
    <td><b>创建知识点</b><br/>添加新的学习内容</td>
    <td><b>复习卡片</b><br/>间隔重复学习</td>
    <td><b>设置</b><br/>账号管理</td>
  </tr>
</table>

---

## 🏗️ 技术架构

### 架构模式

```
┌─────────────────────────────────────┐
│          SwiftUI Views              │  UI层
├─────────────────────────────────────┤
│        View Models (MVVM)           │  业务逻辑层
├─────────────────────────────────────┤
│    Services (API + Auth)            │  服务层
├─────────────────────────────────────┤
│        REST API (Next.js)           │  后端API
├─────────────────────────────────────┤
│   Supabase (PostgreSQL + pgvector)  │  数据库
└─────────────────────────────────────┘
```

### 技术栈

- **UI**: SwiftUI
- **架构**: MVVM
- **网络**: URLSession + async/await
- **认证**: Sign in with Apple + JWT
- **后端**: Next.js 15
- **数据库**: Supabase (PostgreSQL)
- **向量搜索**: pgvector
- **AI**: OpenAI Embeddings + DeepSeek Chat

### 核心功能

| 功能 | 技术方案 |
|------|---------|
| 认证 | Sign in with Apple → Supabase Auth |
| 向量化 | OpenAI text-embedding-3-small (1536维) |
| 搜索 | pgvector 余弦相似度搜索 |
| 聊天 | RAG (检索增强生成) + DeepSeek |
| 复习 | Ebbinghaus遗忘曲线算法 |

---

## 📖 文档

### 完整文档

- 📘 [iOS配置指南（中文）](../docs/IOS_SETUP_CN.md)
- 📗 [iOS Setup Guide (English)](../docs/IOS_SETUP.md)
- 📙 [REST API文档](../docs/IOS_API.md)
- 📕 [项目架构说明](../docs/SERVER_SIDE_ARCHITECTURE.md)

### 代码导读

```
learn-assistant/
├── learn_assistantApp.swift      # 应用入口
│
├── Models/
│   └── Models.swift              # 数据模型定义
│
├── Services/
│   ├── APIService.swift          # REST API调用
│   └── AuthService.swift         # 认证状态管理
│
├── ViewModels/
│   ├── KnowledgeViewModel.swift  # 知识点业务逻辑
│   ├── ChatViewModel.swift       # 聊天业务逻辑
│   └── ReviewViewModel.swift     # 复习业务逻辑
│
└── Views/
    ├── SignInWithAppleView.swift      # 登录页
    ├── MainTabView.swift              # 主标签
    ├── KnowledgeListView.swift        # 知识点列表
    ├── AddKnowledgePointView.swift    # 添加知识点
    ├── EditKnowledgePointView.swift   # 编辑知识点
    ├── ChatView.swift                 # 聊天界面
    ├── ReviewView.swift               # 复习界面
    └── SettingsView.swift             # 设置界面
```

---

## 🐛 常见问题

### Q: 登录失败，提示"Invalid client"

**A**: 检查以下配置:
- Bundle ID是否和Apple Developer中的App ID一致
- Supabase中的Apple Provider配置是否正确
- Services ID和Redirect URL是否配置正确

### Q: 真机无法连接服务器

**A**: 真机不能使用localhost，需要:
1. 查找Mac的IP地址: `ifconfig | grep "inet "`
2. 修改APIService中的baseURL为Mac的IP
3. 确保iPhone和Mac在同一WiFi

### Q: 向量搜索没有结果

**A**: 检查:
- 知识点是否已创建成功
- 后端环境变量是否配置（EMBEDDING_API_KEY）
- Supabase中是否有embedding数据

更多问题: [常见问题解答](../docs/IOS_SETUP_CN.md#常见问题)

---

## 🎯 路线图

### v1.0 (当前版本)
- ✅ Sign in with Apple
- ✅ 知识点CRUD
- ✅ AI聊天
- ✅ 复习系统
- ✅ 向量搜索

### v1.1 (计划中)
- [ ] 离线支持
- [ ] 推送通知
- [ ] Widget小组件
- [ ] 数据导入/导出

### v2.0 (未来)
- [ ] iPad优化
- [ ] macOS版本
- [ ] 协作学习
- [ ] 学习统计

---

## 🤝 贡献

欢迎贡献代码！

### 开发流程

1. Fork本项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

### 代码规范

- 遵循Swift API Design Guidelines
- 使用SwiftLint检查代码
- 编写清晰的注释
- 保持MVVM架构

---

## 📜 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

---

## 🙏 致谢

- [SwiftUI](https://developer.apple.com/xcode/swiftui/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [DeepSeek](https://www.deepseek.com/)

---

## 📞 联系

- GitHub Issues: [提交问题](https://github.com/yourusername/learn-assistant/issues)
- Email: your-email@example.com

---

<div align="center">

**⭐️ 如果这个项目对你有帮助，请给个Star！⭐️**

Made with ❤️ using SwiftUI

</div>
