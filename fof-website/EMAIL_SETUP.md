# 邮件发送功能设置说明

## 概述
我已经为您的网站添加了邮件发送功能，当用户填写联系表单时，您将能够收到邮件通知。

## 需要您提供的信息

### 方案一：使用 EmailJS（推荐）
1. **注册 EmailJS 账户**
   - 访问 https://www.emailjs.com/
   - 注册免费账户

2. **获取配置信息**
   - Service ID（服务ID）
   - Template ID（模板ID）
   - Public Key（公钥）

3. **更新配置文件**
   - 打开 `js/email.js` 文件
   - 替换以下配置：
     ```javascript
     const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // 替换为您的服务ID
     const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // 替换为您的模板ID
     const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // 替换为您的公钥
     ```

### 方案二：使用 Formspree（备选）
1. **注册 Formspree 账户**
   - 访问 https://formspree.io/
   - 注册免费账户

2. **获取表单ID**
   - 创建新表单
   - 获取表单ID（类似：xrgkqjqw）

3. **更新配置文件**
   - 打开 `js/email.js` 文件
   - 替换以下配置：
     ```javascript
     const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
     ```
   - 将 `YOUR_FORM_ID` 替换为您的实际表单ID

## 邮件模板设置（EmailJS）

如果您选择 EmailJS，需要设置邮件模板：

### 模板变量
- `{{from_name}}` - 发送者姓名
- `{{from_email}}` - 发送者邮箱
- `{{message}}` - 消息内容
- `{{to_email}}` - 接收邮箱（01primelabs@gmail.com）
- `{{reply_to}}` - 回复邮箱
- `{{subject}}` - 邮件主题

### 建议的邮件模板
**主题：** `New inquiry from {{from_name}} - 01 Capital Website`

**内容：**
```
您收到了一条来自 01 Capital 网站的新咨询：

姓名：{{from_name}}
邮箱：{{from_email}}
回复邮箱：{{reply_to}}

消息内容：
{{message}}

---
此邮件由 01 Capital 网站自动发送
```

## 测试步骤

1. 配置完成后，打开网站
2. 点击 "Contact" 按钮
3. 填写联系表单
4. 点击 "Send Inquiry"
5. 检查您的邮箱是否收到邮件

## 注意事项

- EmailJS 免费版每月有 200 封邮件限制
- Formspree 免费版每月有 50 个提交限制
- 建议先使用 EmailJS 进行测试
- 如果遇到问题，可以联系我进行调试

## 当前状态

目前代码已经配置为：
- 优先使用 EmailJS（需要您提供配置信息）
- 如果 EmailJS 未配置，会尝试使用 Formspree
- 如果都失败，会提示用户直接联系邮箱

请按照上述步骤配置后，联系表单就可以正常发送邮件了！
