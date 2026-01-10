# Learn Assistant - iOS版本

## 🎉 项目完成！

恭喜！你的Learn Assistant已成功转换为iOS原生应用！

## 📱 已实现的功能

### ✅ 核心功能
- [x] **Sign in with Apple登录** - 安全便捷的苹果账号认证
- [x] **知识点管理** - 完整的CRUD操作
- [x] **AI智能聊天** - 基于RAG的智能问答
- [x] **复习系统** - 间隔重复学习法
- [x] **向量搜索** - 自动向量化和语义搜索

### ✅ 技术特性
- [x] **REST API** - 完整的后端API接口
- [x] **MVVM架构** - 清晰的代码组织
- [x] **SwiftUI** - 现代化原生UI
- [x] **Token管理** - 自动刷新机制
- [x] **错误处理** - 完善的错误提示

## 📂 项目结构

```
learn-assistant/
├── app/api/ios/              # iOS专用REST API
│   ├── auth/
│   │   ├── apple/           # Apple登录
│   │   └── refresh/         # Token刷新
│   ├── knowledge/           # 知识点API
│   ├── reviews/             # 复习API
│   └── chat/                # 聊天API
│
├── ios/learn-assistant/     # iOS原生应用
│   └── learn-assistant/
│       ├── Models/          # 数据模型
│       ├── Services/        # 服务层
│       ├── ViewModels/      # 视图模型
│       └── Views/           # SwiftUI视图
│
└── docs/                    # 文档
    ├── IOS_SETUP_CN.md      # 中文配置指南
    ├── IOS_SETUP.md         # 英文配置指南
    └── IOS_API.md           # API文档
```

## 🚀 快速开始

### 第一步：启动Next.js服务器

```bash
# 在项目根目录
npm run dev
```

服务器运行在 `http://localhost:3001`

### 第二步：配置iOS应用

详细配置步骤请参考:
- 📘 [中文配置指南](./docs/IOS_SETUP_CN.md) 👈 **推荐阅读**
- 📗 [English Setup Guide](./docs/IOS_SETUP.md)

核心配置步骤:
1. 配置Apple Developer账号
2. 创建App ID和Services ID
3. 配置Supabase Apple Provider
4. 修改Xcode项目设置
5. 更新API URL

### 第三步：运行应用

```bash
# 打开Xcode项目
open ios/learn-assistant/learn-assistant.xcodeproj

# 在Xcode中按 ⌘R 运行
```

## 📖 完整文档

### 配置指南
- 📘 [iOS应用配置指南（中文）](./docs/IOS_SETUP_CN.md) - **强烈推荐先看这个！**
- 📗 [iOS Setup Guide (English)](./docs/IOS_SETUP.md)

### API文档
- 📙 [REST API接口文档](./docs/IOS_API.md)
- 包含所有API端点说明
- 请求/响应示例
- 错误处理指南

### 架构文档
- 📕 [服务端架构说明](./docs/SERVER_SIDE_ARCHITECTURE.md)
- 📄 [功能实现总结](./docs/IMPLEMENTATION_SUMMARY.md)

## 🎯 与Web版的区别

| 功能 | Web版 | iOS版 |
|------|-------|-------|
| 登录方式 | 邮箱/密码 | Sign in with Apple ✨ |
| UI框架 | React + Next.js | SwiftUI ✨ |
| 数据获取 | SSR + CSR | REST API |
| 聊天响应 | Server-Sent Events | 完整响应 |
| 离线支持 | ❌ | 🔜 计划中 |
| 推送通知 | ❌ | 🔜 计划中 |

## 🛠️ 技术栈

### iOS应用
- **语言**: Swift 5.9
- **UI**: SwiftUI
- **架构**: MVVM
- **最低版本**: iOS 17.0
- **网络**: URLSession + async/await
- **认证**: Sign in with Apple

### 后端API (新增)
- **框架**: Next.js 15 API Routes
- **认证**: Supabase Auth + JWT
- **数据格式**: JSON
- **通信**: RESTful API

### 共享服务
- **数据库**: Supabase (PostgreSQL)
- **向量搜索**: pgvector
- **嵌入**: OpenAI Embeddings
- **聊天**: DeepSeek AI

## 🔄 数据流

```
iOS App (SwiftUI)
    ↓ REST API
Next.js API Routes (/api/ios/*)
    ↓ 认证验证
Supabase Auth
    ↓ 数据操作
PostgreSQL + pgvector
    ↓ AI功能
OpenAI (Embeddings) + DeepSeek (Chat)
```

## 📱 主要界面

### 1. 登录界面 (SignInWithAppleView)
- Sign in with Apple按钮
- 自动认证流程
- Token存储

### 2. 知识点列表 (KnowledgeListView)
- 分页加载
- 下拉刷新
- 左滑编辑/删除
- 搜索功能（计划中）

### 3. 添加/编辑知识点
- 问题输入
- 答案输入（支持多行）
- 是否加入复习计划
- 自动向量化

### 4. AI聊天 (ChatView)
- 消息列表
- 上下文保持
- 引用来源显示
- 相似度评分

### 5. 复习界面 (ReviewView)
- 进度显示
- 主动回忆输入
- 查看答案
- 完成标记

### 6. 设置 (SettingsView)
- 账号信息
- 应用版本
- 退出登录

## 🐛 故障排查

### 常见问题

1. **登录失败**
   - 检查Bundle ID配置
   - 验证Supabase设置
   - 查看Xcode控制台日志

2. **网络连接失败**
   - 确认API URL配置
   - 检查Next.js服务器运行
   - 真机测试使用Mac IP而非localhost

3. **数据加载失败**
   - 验证Token有效性
   - 检查Supabase RLS策略
   - 查看API响应日志

详细解决方案: [故障排查指南](./docs/IOS_SETUP_CN.md#常见问题)

## 🎨 设计规范

### Apple Human Interface Guidelines
- ✅ 原生控件
- ✅ 系统字体
- ✅ 标准间距
- ✅ 深色模式支持

### 颜色方案
- 主色: 系统蓝色 (Blue)
- 强调色: 系统绿色 (Success)
- 警告色: 系统红色 (Destructive)
- 自动适配深色/浅色模式

## 🚢 部署

### TestFlight测试
1. Archive项目
2. 上传到App Store Connect
3. 配置TestFlight测试
4. 邀请测试用户

### App Store发布
1. 准备截图和描述
2. 配置应用元数据
3. 提交审核
4. 发布上线

详细步骤: [部署指南](./docs/IOS_SETUP_CN.md#部署到testflight)

## 🔮 未来计划

### 短期 (v1.1)
- [ ] 离线数据缓存
- [ ] 推送通知（复习提醒）
- [ ] Widget小组件
- [ ] 搜索功能优化

### 中期 (v1.5)
- [ ] iPad适配
- [ ] 深色模式优化
- [ ] 数据导出功能
- [ ] 学习统计图表

### 长期 (v2.0)
- [ ] macOS版本（Catalyst）
- [ ] watchOS版本
- [ ] 协作学习功能
- [ ] AI语音对话

## 💡 开发技巧

### 调试网络请求
在 `APIService.swift` 中添加:
```swift
print("📤 Request: \(url)")
print("📥 Response: \(String(data: data, encoding: .utf8))")
```

### SwiftUI预览
所有View都支持实时预览:
```swift
#Preview {
    KnowledgeListView()
        .environmentObject(KnowledgeViewModel(authService: AuthService()))
}
```

### 测试不同状态
```swift
// 空状态
viewModel.knowledgePoints = []

// 加载状态
viewModel.isLoading = true

// 错误状态
viewModel.error = "Network error"
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 贡献指南
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目:
- SwiftUI
- Supabase
- OpenAI
- DeepSeek
- Next.js

---

## 📞 需要帮助？

- 📖 查看 [完整配置指南](./docs/IOS_SETUP_CN.md)
- 📙 阅读 [API文档](./docs/IOS_API.md)
- 🐛 提交 [GitHub Issue](https://github.com/yourusername/learn-assistant/issues)

---

<div align="center">

**🎉 享受你的iOS学习助手吧！**

Made with ❤️ using SwiftUI

如果觉得有用，请给个⭐️！

</div>
