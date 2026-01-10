# iOS App Setup Guide

## 概述

这是Learn Assistant的iOS版本，使用SwiftUI构建，支持Sign in with Apple登录。

## 功能特性

- ✅ Sign in with Apple 登录
- ✅ 知识点管理（创建、编辑、删除）
- ✅ AI智能聊天（基于RAG）
- ✅ 间隔重复复习系统
- ✅ 自动向量化和语义搜索
- ✅ 现代化iOS原生UI设计

## 前置要求

### 1. Apple Developer账号

你需要一个Apple Developer账号来使用Sign in with Apple功能。

### 2. Xcode

- Xcode 15.0 或更高版本
- iOS 17.0 或更高版本

## 配置步骤

### 第一步：配置Supabase

1. 在Supabase Dashboard中，启用Apple OAuth Provider:
   - 进入 Authentication → Providers
   - 找到 Apple 并启用
   - 配置 Bundle ID 和 Service ID

2. 获取你的OAuth配置:
   - Redirect URL: 会显示在Supabase Dashboard中
   - 记录下来，稍后需要在Apple Developer中配置

### 第二步：配置Apple Developer

1. 登录 [Apple Developer](https://developer.apple.com/)

2. 创建App ID:
   - 进入 Certificates, Identifiers & Profiles
   - 选择 Identifiers → App IDs
   - 点击 "+" 创建新的App ID
   - Bundle ID: `com.yourcompany.learnassistant` (可自定义)
   - 启用 "Sign in with Apple" capability

3. 创建Services ID:
   - 选择 Identifiers → Services IDs
   - 点击 "+" 创建新的Services ID
   - Identifier: `com.yourcompany.learnassistant.service`
   - 配置 "Sign in with Apple":
     - 添加 Supabase 的 Redirect URL
     - 配置 Domains and Subdomains

4. 创建Key:
   - 选择 Keys
   - 点击 "+" 创建新的Key
   - 启用 "Sign in with Apple"
   - 下载 .p8 key file
   - 记录 Key ID

### 第三步：更新Xcode项目配置

1. 打开 `ios/learn-assistant/learn-assistant.xcodeproj`

2. 配置Bundle Identifier:
   - 选择项目 → Target → General
   - 修改 Bundle Identifier 为你在Apple Developer创建的App ID

3. 配置Signing & Capabilities:
   - 选择你的Team
   - 添加 "Sign in with Apple" capability

4. 配置Info.plist (已自动处理):
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <false/>
       <key>NSExceptionDomains</key>
       <dict>
           <key>localhost</key>
           <dict>
               <key>NSExceptionAllowsInsecureHTTPLoads</key>
               <true/>
           </dict>
       </dict>
   </dict>
   ```

### 第四步：配置API URL

修改 `APIService.swift` 中的 `baseURL`:

```swift
// 开发环境（本地）
private let baseURL = "http://localhost:3001/api/ios"

// 生产环境
private let baseURL = "https://your-domain.com/api/ios"
```

**注意**: 
- 在真机上测试时，不能使用 `localhost`
- 使用你电脑的本地IP地址，例如: `http://192.168.1.100:3001/api/ios`
- 或者部署Next.js到生产环境并使用生产URL

### 第五步：运行项目

1. 确保Next.js服务器正在运行:
   ```bash
   cd /path/to/learn-assistant
   npm run dev
   ```

2. 在Xcode中:
   - 选择模拟器或真机
   - 点击 Run (⌘R)

## API端点说明

iOS应用使用以下REST API端点:

### 认证
- `POST /api/ios/auth/apple` - Apple登录
- `POST /api/ios/auth/refresh` - 刷新Token

### 知识点
- `GET /api/ios/knowledge` - 获取知识点列表
- `POST /api/ios/knowledge` - 创建知识点
- `PUT /api/ios/knowledge/:id` - 更新知识点
- `DELETE /api/ios/knowledge/:id` - 删除知识点

### 复习
- `GET /api/ios/reviews` - 获取今日复习
- `POST /api/ios/reviews/:id/complete` - 完成复习

### 聊天
- `POST /api/ios/chat` - AI聊天

所有API（除了auth/apple）都需要在Header中携带Token:
```
Authorization: Bearer <access_token>
```

## 项目结构

```
ios/learn-assistant/learn-assistant/
├── learn_assistantApp.swift      # 应用入口
├── Models/
│   └── Models.swift              # 数据模型
├── Services/
│   ├── APIService.swift          # API服务
│   └── AuthService.swift         # 认证服务
├── ViewModels/
│   ├── KnowledgeViewModel.swift  # 知识点VM
│   ├── ChatViewModel.swift       # 聊天VM
│   └── ReviewViewModel.swift     # 复习VM
└── Views/
    ├── SignInWithAppleView.swift # 登录界面
    ├── MainTabView.swift         # 主标签页
    ├── KnowledgeListView.swift   # 知识点列表
    ├── AddKnowledgePointView.swift # 添加知识点
    ├── EditKnowledgePointView.swift # 编辑知识点
    ├── ChatView.swift            # 聊天界面
    ├── ReviewView.swift          # 复习界面
    └── SettingsView.swift        # 设置界面
```

## 常见问题

### 1. Sign in with Apple 失败

**问题**: 提示 "Invalid client"

**解决**:
- 检查 Bundle ID 是否匹配
- 确认 Supabase 中的 Apple OAuth 配置正确
- 验证 Service ID 和 Redirect URL 设置

### 2. 无法连接到服务器

**问题**: Network error 或 Connection failed

**解决**:
- 检查 Next.js 服务器是否运行
- 验证 API URL 配置（不能用localhost在真机上）
- 检查防火墙设置
- 确保手机和电脑在同一网络

### 3. Token过期

**问题**: 频繁要求重新登录

**解决**:
- Token会自动刷新（5分钟前）
- 检查 Supabase 的 JWT 设置
- 验证刷新Token逻辑

### 4. 知识点加载失败

**问题**: 空列表或错误提示

**解决**:
- 检查用户认证状态
- 验证API权限配置
- 查看Supabase RLS策略

## 开发技巧

### 调试网络请求

在 `APIService.swift` 中添加日志:

```swift
// 在 fetch 方法前
print("📤 Request: \(request.url?.absoluteString ?? "")")
print("📤 Headers: \(request.allHTTPHeaderFields ?? [:])")

// 在收到响应后
print("📥 Response: \(httpResponse.statusCode)")
print("📥 Data: \(String(data: data, encoding: .utf8) ?? "")")
```

### 测试不同场景

```swift
// 测试空状态
viewModel.knowledgePoints = []

// 测试加载状态
viewModel.isLoading = true

// 测试错误状态
viewModel.error = "Network error"
```

### 使用预览

所有View都支持SwiftUI Preview:

```swift
#Preview {
    KnowledgeListView()
        .environmentObject(KnowledgeViewModel(authService: AuthService()))
}
```

## 部署到TestFlight

1. 在Xcode中:
   - Product → Archive
   - Distribute App
   - App Store Connect
   - Upload

2. 在App Store Connect:
   - 创建新版本
   - 提交审核

3. 配置TestFlight:
   - 添加测试用户
   - 开启外部测试

## 性能优化建议

1. **图片缓存**: 使用 Kingfisher 或 SDWebImage
2. **数据持久化**: 使用 CoreData 或 Realm 缓存数据
3. **后台刷新**: 实现 Background App Refresh
4. **网络优化**: 使用 Combine 管理异步请求
5. **内存管理**: 注意避免循环引用

## 后续增强

- [ ] 离线支持
- [ ] 推送通知（复习提醒）
- [ ] Widget支持
- [ ] iPad适配
- [ ] macOS Catalyst版本
- [ ] 深色模式优化
- [ ] 无障碍支持
- [ ] 多语言支持

## 支持

如有问题，请提交Issue到GitHub仓库。

## 许可证

MIT License
