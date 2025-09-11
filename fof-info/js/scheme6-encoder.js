/**
 * 方案6：6位编码系统
 * 简化版可逆编码系统，24小时有效时限
 * 用于密码重置链接的安全访问控制
 */

class Scheme6Encoder {
    constructor() {
        // 固定盐值 - 可以自定义
        this.FIXED_SALT = "Reset2024!@#";
        // 有效时限（24小时）
        this.VALID_HOURS = 24;
        // 从password.csv加载的用户列表
        this.USERS = [];
        // 标记是否已加载完成
        this.isLoaded = false;
        this.loadUsers();
    }

    // 从password.csv加载用户列表
    async loadUsers() {
        console.log('开始加载用户列表...');
        try {
            // 根据当前页面路径确定CSV文件路径
            const isFromTools = window.location.pathname.includes('/tools/');
            const csvPath = isFromTools ? '../data/password.csv' : 'data/password.csv';
            console.log('当前路径:', window.location.pathname);
            console.log('是否来自tools目录:', isFromTools);
            console.log('尝试加载:', csvPath);
            const response = await fetch(csvPath);
            console.log('响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            console.log('CSV内容长度:', csvText.length);
            
            const lines = csvText.split('\n');
            console.log('CSV行数:', lines.length);
            
            this.USERS = [];
            for (let i = 1; i < lines.length; i++) { // 跳过标题行
                const line = lines[i].trim();
                if (line) {
                    const parts = line.split(',');
                    if (parts.length >= 1) {
                        const username = parts[0].trim();
                        this.USERS.push(username);
                    }
                }
            }
            console.log('用户列表加载完成，共', this.USERS.length, '个用户');
            this.isLoaded = true;
        } catch (error) {
            console.error('加载用户列表失败:', error);
            console.log('使用默认用户列表作为后备');
            // 使用默认用户列表作为后备
            this.USERS = ['miao', 'chao', 'bon', 'octopus', 'sam', 'jennifer', 'alex', 'ying', 'tt'];
            console.log('使用默认用户列表，共', this.USERS.length, '个用户');
            this.isLoaded = true;
        }
    }

    // 简单哈希函数
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }

    // 生成6位编码
    generateCode(username, timestamp = null) {
        if (!timestamp) {
            timestamp = Math.floor(Date.now() / 1000);
        }
        
        // 截断时间戳到小时级别（去掉分钟和秒）
        const hourTimestamp = Math.floor(timestamp / 3600) * 3600;
        
        // 确保用户名小写
        const lowerUsername = username.toLowerCase();
        const combined = lowerUsername + this.FIXED_SALT + hourTimestamp;
        const hash = this.simpleHash(combined);
        const code = hash.toString(36).substring(0, 6).toUpperCase();
        
        return {
            code: code,
            timestamp: hourTimestamp,
            expiresAt: hourTimestamp + (this.VALID_HOURS * 3600),
            username: lowerUsername,
            generatedAt: new Date(hourTimestamp * 1000),
            expiresAtDate: new Date((hourTimestamp + this.VALID_HOURS * 3600) * 1000)
        };
    }

    // 解码验证
    decodeCode(inputCode) {
        const currentTime = Math.floor(Date.now() / 1000);
        const upperCode = inputCode.toUpperCase();
        
        console.log('解码函数 - 输入编码:', upperCode);
        console.log('解码函数 - 当前时间戳:', currentTime);
        console.log('解码函数 - 用户列表长度:', this.USERS.length);
        
        // 遍历所有用户
        for (const username of this.USERS) {
            // 检查最近24小时内的编码，按小时检查
            for (let hours = 0; hours <= this.VALID_HOURS; hours++) {
                const checkTime = currentTime - (hours * 3600);
                const expected = this.generateCode(username, checkTime);
                
                console.log(`  检查时间: ${checkTime} (${hours}小时前), 生成编码: ${expected.code}`);
                
                if (expected.code === upperCode) {
                    const isValid = checkTime + (this.VALID_HOURS * 3600) >= currentTime;
                    console.log('找到匹配! 是否有效:', isValid);
                    return {
                        success: true,
                        username: username,
                        isValid: isValid,
                        generatedAt: new Date(checkTime * 1000),
                        expiresAt: new Date(expected.expiresAt * 1000),
                        hoursRemaining: Math.max(0, Math.floor((expected.expiresAt - currentTime) / 3600)),
                        minutesRemaining: Math.max(0, Math.floor((expected.expiresAt - currentTime) / 60))
                    };
                }
            }
        }
        
        console.log('未找到匹配的编码');
        return {
            success: false,
            message: "编码无效或已过期"
        };
    }

    // 检查用户是否存在
    userExists(username) {
        return this.USERS.includes(username.toLowerCase());
    }

    // 生成重置链接
    generateResetLink(username) {
        console.log('generateResetLink 被调用，用户名:', username);
        console.log('编码器加载状态:', this.isLoaded);
        console.log('用户列表长度:', this.USERS.length);
        
        if (!this.isLoaded) {
            throw new Error('编码器尚未加载完成，请稍后重试');
        }
        
        console.log('检查用户是否存在:', username);
        console.log('userExists 结果:', this.userExists(username));
        
        if (!this.userExists(username)) {
            throw new Error(`用户 "${username}" 不存在`);
        }
        
        const codeResult = this.generateCode(username);
        // 使用固定的域名
        const baseUrl = 'https://01capital.info';
        return {
            link: `${baseUrl}/reset_pas?code=${codeResult.code}`,
            code: codeResult.code,
            expiresAt: codeResult.expiresAtDate,
            hoursRemaining: this.VALID_HOURS
        };
    }

    // 从URL参数中获取编码并解码
    getCodeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('code');
    }

    // 验证当前页面的编码
    validateCurrentPageCode() {
        console.log('validateCurrentPageCode 被调用');
        const code = this.getCodeFromUrl();
        console.log('从URL获取的编码:', code);
        
        if (!code) {
            console.log('未找到编码参数');
            return {
                success: false,
                message: "未找到编码参数"
            };
        }
        
        console.log('开始解码编码:', code);
        const result = this.decodeCode(code);
        console.log('解码结果:', result);
        return result;
    }

    // 获取系统信息
    getSystemInfo() {
        return {
            validHours: this.VALID_HOURS,
            totalUsers: this.USERS.length,
            users: this.USERS,
            salt: this.FIXED_SALT.substring(0, 8) + "...",
            currentTime: new Date().toLocaleString()
        };
    }

    // 格式化时间显示
    formatTimeRemaining(hours, minutes) {
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟`;
        } else {
            return "已过期";
        }
    }
}

// 创建全局实例
window.scheme6Encoder = new Scheme6Encoder();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scheme6Encoder;
}
