# CORS 配置说明

## 问题
网站 `https://01capital.info` 需要从 `https://data.01capital.info/arbcus/` 获取数据，但遇到了 CORS 跨域错误。

## 解决方案

### 方案1：Nginx 配置（推荐）

如果 `data.01capital.info` 使用 Nginx，在配置文件中添加：

```nginx
server {
    listen 443 ssl;
    server_name data.01capital.info;
    
    # SSL 配置...
    
    location /arbcus/ {
        # 允许来自 01capital.info 的跨域请求
        add_header 'Access-Control-Allow-Origin' 'https://01capital.info' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
        add_header 'Access-Control-Max-Age' '3600' always;
        
        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            return 204;
        }
        
        # 文件服务配置
        alias /path/to/arbcus/;
        autoindex off;
    }
}
```

### 方案2：Apache 配置

如果使用 Apache，在 `.htaccess` 或配置文件中添加：

```apache
<Directory "/path/to/arbcus">
    Header set Access-Control-Allow-Origin "https://01capital.info"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</Directory>
```

### 方案3：Node.js/Express 服务器

如果使用 Node.js，添加中间件：

```javascript
app.use('/arbcus', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://01capital.info');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
```

### 方案4：Python Flask/FastAPI

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/arbcus/*": {"origins": "https://01capital.info"}})
```

## 测试

配置后，可以通过以下命令测试：

```bash
curl -H "Origin: https://01capital.info" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://data.01capital.info/arbcus/test.json \
     -v
```

应该看到响应头中包含 `Access-Control-Allow-Origin: https://01capital.info`

## 注意事项

1. **安全性**：只允许特定域名，不要使用 `*`（允许所有域名）
2. **缓存**：浏览器会缓存 CORS 预检请求，设置 `Access-Control-Max-Age` 可以控制缓存时间
3. **HTTPS**：确保两个域名都使用 HTTPS，否则浏览器可能阻止混合内容


