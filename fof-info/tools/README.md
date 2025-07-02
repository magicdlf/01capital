# Hash认证系统说明

## 概述

我们已经将原来的CSV密码验证系统升级为基于Hash的认证系统。新系统的优势：

1. **密码不再明文存储** - 无法从服务器文件反推用户密码
2. **数据隔离** - 每个用户的数据存储在独立的文件中
3. **纯前端实现** - 无需后端服务器，适合静态网站部署
4. **CDN友好** - 关闭目录列表权限后，用户只能访问自己的数据

## 工作原理

1. 用户输入用户名和密码
2. 前端使用 `SHA-256` 算法生成 `username:password` 的hash值
3. 取hash的前16字节，转换为URL安全的Base64编码作为文件名
4. 尝试获取 `data/users/[hash].json` 文件
5. 如果文件存在且能获取，则登录成功；否则登录失败

## 文件结构

```
fof-info/
├── data/
│   ├── users/
│   │   ├── Qx11Ix4NyjGCUBa_FyWJAQ.json  # miao用户的数据
│   │   ├── FMh2dzurvXNxqADsILP9EA.json  # chao用户的数据
│   │   └── ...                           # 其他用户的hash文件
│   └── password.csv                      # 原密码文件（保留但不再使用）
├── tools/
│   ├── generate-hash.html                # Hash生成工具
│   ├── migrate_users.py                  # 数据迁移脚本
│   └── README.md                         # 本文档
└── test-login.html                       # 登录测试页面
```

## 使用工具

### 1. Hash生成工具 (generate-hash.html)

用于生成新用户的hash文件名：
- 输入用户名和密码
- 显示生成的SHA-256 hash
- 显示对应的文件名

### 2. 数据迁移脚本 (migrate_users.py)

已经执行过，用于将现有用户数据从CSV迁移到hash文件：
```bash
cd fof-info/tools
python3 migrate_users.py
```

### 3. 登录测试页面 (test-login.html)

用于测试新的认证系统是否正常工作。

## 安全建议

1. **关闭CDN目录列表** - 防止用户浏览所有hash文件
2. **使用HTTPS** - 确保密码传输安全
3. **定期更新密码** - 建议用户定期更改密码
4. **备份数据** - 定期备份users目录

## 添加新用户

1. 使用 `generate-hash.html` 生成hash文件名
2. 创建对应的JSON文件，格式如下：

```json
{
  "username": "新用户名",
  "created_at": "2024-01-01T00:00:00",
  "investments": {
    "balanced": [],
    "arbitrage": [],
    "arbitrage_coin": []
  }
}
```

3. 将用户的投资数据添加到相应的数组中

## 注意事项

- 用户名在生成hash时会转换为小写
- 密码区分大小写
- hash文件名使用URL安全的Base64编码（`+` 替换为 `-`，`/` 替换为 `_`）
- 每个用户的数据完全独立，提高了数据安全性和访问效率 