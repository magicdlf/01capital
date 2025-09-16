# EmailJS 配置详细指南

## 步骤 1: 注册 EmailJS 账户

1. 访问 https://www.emailjs.com/
2. 点击 "Sign Up" 注册账户
3. 验证邮箱地址

## 步骤 2: 添加邮件服务

1. 登录后，进入 Dashboard
2. 点击 "Email Services" → "Add New Service"
3. 选择您的邮件服务商（推荐 Gmail）：
   - **Gmail**: 选择 Gmail，点击 "Connect Account"
   - **Outlook**: 选择 Outlook，点击 "Connect Account"
   - **其他**: 选择 "Other"，手动配置 SMTP

4. 完成授权后，记录下 **Service ID**（例如：service_abc123）

## 步骤 3: 创建邮件模板

1. 点击 "Email Templates" → "Create New Template"
2. 填写模板信息：
   - **Template Name**: `01 Capital Contact Form`
   - **Template ID**: 系统会自动生成（例如：template_xyz789）

3. **邮件主题**:
   ```
   New inquiry from {{from_name}} - 01 Capital Website
   ```

4. **邮件内容**（复制以下内容）:
   ```
   You have received a new inquiry from the 01 Capital website:

   Name: {{from_name}}
   Email: {{from_email}}

   Message:
   {{message}}

   ---
   This email was automatically sent from the 01 Capital website contact form.
   ```

5. 点击 "Save" 保存模板

## 步骤 4: 获取 Public Key

1. 进入 "Account" → "General"
2. 找到 "Public Key" 并复制（例如：user_abcdef123456）

## 步骤 5: 更新网站配置

打开 `js/email.js` 文件，替换以下配置：

```javascript
// EmailJS 配置
const EMAILJS_SERVICE_ID = 'service_abc123'; // 替换为您的 Service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789'; // 替换为您的 Template ID
const EMAILJS_PUBLIC_KEY = 'user_abcdef123456'; // 替换为您的 Public Key
```

## 步骤 6: 测试配置

1. 保存文件后，打开您的网站
2. 点击 "Contact" 按钮
3. 填写测试信息：
   - Name: Test User
   - Email: your-email@example.com
   - Message: This is a test message
4. 点击 "Send Inquiry"
5. 检查您的邮箱是否收到邮件

## 模板变量说明

EmailJS 模板中使用的变量：

- `{{from_name}}` - 发送者姓名
- `{{from_email}}` - 发送者邮箱
- `{{message}}` - 消息内容
- `{{subject}}` - 邮件主题
- `{{current_date}}` - 当前日期（可选）

## 高级配置（可选）

### 添加当前日期
如果您想在邮件中显示接收时间，可以在模板中添加：
```
Received at: {{current_date}}
```

### 自定义邮件样式
您可以使用 HTML 格式的模板，参考 `emailjs-template.html` 文件中的样式。

## 故障排除

### 常见问题：

1. **邮件未收到**
   - 检查垃圾邮件文件夹
   - 确认 Service ID 和 Template ID 正确
   - 检查 Public Key 是否正确

2. **模板变量不显示**
   - 确保变量名使用双大括号：`{{variable_name}}`
   - 检查变量名拼写是否正确

3. **权限错误**
   - 确保邮件服务已正确连接
   - 重新授权邮件服务

### 调试步骤：

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页的错误信息
3. 检查 Network 标签页的请求状态

## 免费版限制

- 每月 200 封邮件
- 每天 50 封邮件
- 支持 Gmail、Outlook、Yahoo 等主流邮件服务

## 完成后的文件结构

```
fof-website/
├── js/
│   ├── main.js
│   └── email.js (已配置)
├── index.html (已更新)
├── emailjs-template.html (参考模板)
└── EMAILJS_SETUP_GUIDE.md (本指南)
```

配置完成后，您的联系表单就可以正常发送邮件了！
