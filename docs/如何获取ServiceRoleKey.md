# 如何获取 Supabase Service Role Key

## 步骤

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 登录你的账号

2. **选择你的项目**
   - 如果你的项目是 `learn-assistant` 或相关的项目
   - 注意：你的 Supabase URL 是 `https://yrvukgezsmzwqvftbvdu.supabase.co`，所以项目名可能不同

3. **导航到 Settings → API**
   - 在左侧边栏找到 **Settings**（设置）
   - 点击 **API** 子菜单
   - 或者直接访问：`https://supabase.com/dashboard/project/yrvukgezsmzwqvftbvdu/settings/api`

4. **找到 Service Role Key**
   - 在 "API Keys" 部分，你会看到：
     - **anon** `public` - 这是公开的匿名密钥（你已经在用了）
     - **service_role** `secret` - 这就是你需要的！
   - Service Role Key 会被隐藏，显示为 `**** **** ****`
   - 点击 **Reveal** 或 **Show** 按钮来显示完整的密钥

5. **复制密钥**
   - 点击 **Copy** 按钮复制完整的 Service Role Key
   - **注意**：这个密钥有完整权限，不要泄露！

## 配置到项目中

创建或编辑 `.env.local` 文件（在项目根目录）：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://yrvukgezsmzwqvftbvdu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你现有的anon key
SUPABASE_SERVICE_ROLE_KEY=你刚才复制的service_role key
```

然后重启服务器。

## 如果找不到 API 设置页面

如果左侧边栏没有看到 Settings → API，可以尝试：
1. 检查是否在正确的项目（URL 应该是包含 `yrvukgezsmzwqvftbvdu` 的项目）
2. 或者直接访问：`https://supabase.com/dashboard/project/yrvukgezsmzwqvftbvdu/settings/api`

