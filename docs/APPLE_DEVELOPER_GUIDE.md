# Apple Developer 配置详细指引

## 📍 找到正确的位置

### 第一步：访问并登录

1. 访问 https://developer.apple.com/account
2. 使用你的Apple ID登录

### 第二步：加入Apple Developer Program

**如果看到"加入 Apple Developer Program"提示：**

这说明你还没有加入开发者计划。不用担心，**免费账号完全够用**！

1. 点击页面上的 **"立即注册"** 按钮
2. 按照提示完成注册流程
3. 注册完成后，刷新页面

### 第三步：找到"证书、标识符和描述文件"

登录后，你会看到账户页面。找到入口的方法：

#### 方法1：顶部导航（推荐）

页面顶部会有一个导航栏，找到并点击：
- 中文界面：**"证书、标识符和描述文件"**
- 英文界面：**"Certificates, Identifiers & Profiles"**

#### 方法2：直接访问

直接访问这个链接：
```
https://developer.apple.com/account/resources/identifiers/list
```

这会直接打开"标识符"页面。

### 第四步：页面布局说明

进入后，你会看到：

**左侧菜单栏**（中文）：
- 概览
- 证书
- **标识符** ← 我们主要用这个
- 描述文件
- 设备
- 密钥

**左侧菜单栏**（英文）：
- Overview
- Certificates
- **Identifiers** ← 我们主要用这个
- Profiles
- Devices
- Keys

## 🎯 创建App ID详细步骤

### 1. 进入标识符页面

- 点击左侧菜单的 **"标识符"** (Identifiers)
- 页面会显示你已有的标识符列表（可能是空的）

### 2. 创建新的标识符

1. 点击页面左上角的 **蓝色 "+" 按钮**
2. 会出现"注册新的标识符"页面

### 3. 选择标识符类型

页面会显示几个选项：
- ⭕ **App IDs** ← 选择这个
- Bundle IDs
- App Group IDs
- ... 其他选项

选择 **"App IDs"**，然后点击右上角的 **"继续"** 按钮

### 4. 选择App ID类型

下一页会问你要创建什么类型：
- ⭕ **App** ← 选择这个（用于iOS/macOS应用）
- App Clip

选择 **"App"**，然后点击 **"继续"**

### 5. 填写App ID信息

现在是最重要的配置页面：

#### A. 描述 (Description)
- 中文界面：**"描述"**
- 英文界面：**"Description"**
- 填写：`Learn Assistant` 或任何你喜欢的名字

#### B. Bundle ID
这是最重要的部分！

**Bundle ID类型**：
- ⭕ 选择 **"Explicit"** （明确的）
- 不要选择 "Wildcard"（通配符）

**Bundle ID值**：
- 中文界面：**"Bundle ID"**
- 英文界面：**"Bundle ID"**
- 填写格式：`com.yourname.learnassistant`
- 例如：`com.zhangsan.learnassistant` 或 `com.mycompany.learnassistant`

⚠️ **重要**：
- 必须是小写字母
- 使用反向域名格式：`com.你的名字.应用名`
- 这个Bundle ID必须全球唯一
- 记住这个ID，后面Xcode中要用！

#### C. Capabilities（功能）

往下滚动，会看到一个很长的功能列表。找到并勾选：

✅ **Sign in with Apple**

可以用浏览器的查找功能（Ctrl/Command + F）搜索 "Sign in with Apple"

### 6. 完成注册

1. 检查所有信息是否正确
2. 点击右上角的 **"继续"** 按钮
3. 确认信息无误后，点击 **"注册"** 按钮
4. 完成！你会看到新创建的App ID出现在列表中

---

## 🔧 创建Services ID详细步骤

### 1. 回到标识符页面

如果你还在App ID的详情页，点击左上角的 **"<标识符"** 返回列表

### 2. 创建新标识符

再次点击左上角的 **蓝色 "+" 按钮**

### 3. 选择Services IDs

这次选择：
- App IDs
- ⭕ **Services IDs** ← 选择这个
- ... 其他选项

选择 **"Services IDs"**，点击 **"继续"**

### 4. 填写Services ID信息

#### A. 描述 (Description)
填写：`Learn Assistant Service`

#### B. Identifier
填写：`com.yourname.learnassistant.service`
- ⚠️ 注意：通常在App ID后面加 `.service`
- 例如：如果App ID是 `com.zhangsan.learnassistant`
- Services ID就是：`com.zhangsan.learnassistant.service`

### 5. 配置Sign in with Apple

1. 勾选 ✅ **"Sign in with Apple"**
2. 点击右侧的 **"配置"** (Configure) 按钮
3. 会弹出一个配置窗口

#### 配置窗口内容：

**Primary App ID**（主要的App ID）：
- 下拉选择你刚才创建的App ID
- 应该显示为 `Learn Assistant (com.yourname.learnassistant)`

**Domains and Subdomains**（域名和子域名）：
- 这里填写你的Supabase项目域名
- 格式：`yourproject.supabase.co`
- 例如：`abcdef123456.supabase.co`

**如何找到Supabase域名？**
1. 登录 https://app.supabase.com
2. 选择你的项目
3. 进入 Settings → API
4. 找到 "Project URL"，复制域名部分（不带 https://）

**Return URLs**（返回URL）：
- 填写完整的回调URL
- 格式：`https://yourproject.supabase.co/auth/v1/callback`
- 例如：`https://abcdef123456.supabase.co/auth/v1/callback`

### 6. 保存并注册

1. 点击配置窗口的 **"存储"** (Save) 按钮
2. 回到Services ID页面，点击 **"继续"**
3. 确认信息，点击 **"注册"**
4. 完成！

---

## ✅ 检查配置是否正确

### 验证App ID

1. 在标识符列表中找到你的App ID
2. 点击进入详情
3. 检查：
   - ✅ Bundle ID正确
   - ✅ "Sign in with Apple" 旁边显示"已配置"（Configured）

### 验证Services ID

1. 在标识符列表中找到你的Services ID
2. 点击进入详情
3. 检查：
   - ✅ Identifier正确
   - ✅ "Sign in with Apple" 旁边显示"已配置"
   - ✅ 点击"编辑"可以看到域名和返回URL

---

## 🎯 下一步

完成Apple Developer配置后：

1. ✅ 去Supabase配置Apple Provider
2. ✅ 在Xcode中修改Bundle Identifier
3. ✅ 添加Sign in with Apple Capability
4. ✅ 运行应用测试登录

详细步骤请查看：[iOS快速开始指南](./IOS_QUICK_START.md)

---

## 🆘 常见问题

### Q1: 找不到"证书、标识符和描述文件"选项

**原因**：还没有加入Apple Developer Program

**解决**：
1. 在 https://developer.apple.com/account 页面
2. 点击"立即注册"加入（免费）
3. 完成注册后刷新页面

### Q2: Bundle ID已被占用

**原因**：Bundle ID必须全球唯一，可能别人用了

**解决**：
- 改用其他Bundle ID
- 例如：添加你的名字或随机数字
- `com.yourname123.learnassistant`

### Q3: 配置Sign in with Apple时找不到App ID

**原因**：App ID没有创建成功

**解决**：
1. 返回标识符列表
2. 确认App ID已创建
3. 确认App ID中已启用"Sign in with Apple"

### Q4: Supabase域名填错了

**解决**：
1. 回到Services ID详情页
2. 点击"编辑"按钮
3. 重新配置Sign in with Apple
4. 更正域名和返回URL

### Q5: 是否需要付费的开发者账号？

**答案**：不需要！

- 免费账号可以完成所有配置
- 免费账号可以在真机上测试（最多3台设备）
- 只有发布到App Store才需要付费账号（$99/年）

---

## 💡 提示

1. **记录你的Bundle ID**
   - 写在纸上或记事本里
   - Xcode配置时需要用到

2. **Supabase信息**
   - 提前准备好Supabase项目URL
   - 可以先创建Services ID，回调URL可以稍后编辑

3. **检查拼写**
   - Bundle ID不能有拼写错误
   - 域名和URL要完全正确
   - 特别注意 https:// 和尾部的路径

4. **保存截图**
   - 配置过程中保存截图
   - 方便以后查看和排查问题

---

## 📚 相关文档

- [iOS快速开始](./IOS_QUICK_START.md)
- [iOS完整配置指南](./IOS_SETUP_CN.md)
- [Apple官方文档](https://developer.apple.com/documentation/sign_in_with_apple)

---

如果还有问题，请查看完整的配置指南或提交Issue！
