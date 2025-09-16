/**
 * 单用户编码管理系统
 * 为每个用户创建独立的编码文件，实现完全隔离
 */

class CodeManager {
    constructor() {
        // 根据当前页面路径自动检测codes目录路径
        const currentPath = window.location.pathname;
        if (currentPath.includes('/tools/')) {
            this.codesDir = '../data/codes/';
        } else {
            this.codesDir = 'data/codes/';
        }
        this.codeLength = 8;
        this.validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // 缓存用户名到编码的映射
        this.usernameToCodeCache = null;
    }

    /**
     * 生成8位随机编码
     */
    generateCode() {
        let code = '';
        for (let i = 0; i < this.codeLength; i++) {
            code += this.validChars.charAt(Math.floor(Math.random() * this.validChars.length));
        }
        return code;
    }

    /**
     * 获取编码文件路径（文件名就是编码）
     */
    getCodeFilePath(code) {
        return `${this.codesDir}${code}.json`;
    }

    /**
     * 加载编码文件
     */
    async loadCodeFile(code) {
        try {
            const filePath = this.getCodeFilePath(code);
            const response = await fetch(`${filePath}?t=${new Date().getTime()}`);
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                // 文件不存在
                return null;
            } else {
                throw new Error(`加载编码文件失败: ${response.status}`);
            }
        } catch (error) {
            console.error('加载编码文件失败:', error);
            return null;
        }
    }

    /**
     * 保存编码文件
     */
    async saveCodeFile(codeData) {
        try {
            // 更新最后修改时间
            codeData.last_updated = new Date().toISOString();
            
            // 由于是静态网站，无法直接保存文件
            // 这里返回成功，但实际需要管理员手动保存
            console.log('保存编码文件:', codeData);
            console.log('请手动将以下内容保存到文件:', JSON.stringify(codeData, null, 2));
            
            // 显示保存提示
            if (window.showResult) {
                window.showResult(`请将以下内容保存到文件 ${codeData.codes[0].code}.json:\n\n${JSON.stringify(codeData, null, 2)}`, 'info');
            }
            
            return { success: true, data: codeData };
        } catch (error) {
            console.error('保存编码文件失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 为用户生成新的编码
     */
    async generateUserCode(username, expiresInHours = 24) {
        try {
            // 生成新编码
            const newCode = this.generateCode();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + expiresInHours);
            
            const codeData = {
                username: username.toLowerCase(),
                codes: [
                    {
                        code: newCode,
                        expires_at: expiresAt.toISOString(),
                        used: false,
                        created_at: new Date().toISOString()
                    }
                ],
                last_updated: new Date().toISOString()
            };
            
            // 保存编码文件
            const saveResult = await this.saveCodeFile(codeData);
            
            if (saveResult.success) {
                return {
                    success: true,
                    code: newCode,
                    expiresAt: expiresAt.toISOString(),
                    hoursRemaining: expiresInHours
                };
            } else {
                throw new Error(saveResult.error);
            }
        } catch (error) {
            console.error('生成用户编码失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 动态扫描所有编码文件，建立用户名到编码的映射
     */
    async scanUserCodes() {
        try {
            // 如果缓存存在且未过期（5分钟缓存），直接返回
            if (this.usernameToCodeCache && (Date.now() - this.usernameToCodeCache.timestamp) < 300000) {
                return this.usernameToCodeCache.mapping;
            }

            // 获取所有编码文件列表
            const response = await fetch(`${this.codesDir}?t=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error('无法获取编码文件列表');
            }

            const html = await response.text();
            // 解析HTML中的文件链接，提取.json文件名
            const fileMatches = html.match(/href="([A-Z0-9]+\.json)"/g);
            
            if (!fileMatches) {
                console.log('未找到任何编码文件');
                return {};
            }

            const mapping = {};
            const duplicateUsers = [];
            
            // 并行加载所有编码文件
            const loadPromises = fileMatches.map(async (match) => {
                const filename = match.match(/href="([A-Z0-9]+\.json)"/)[1];
                const code = filename.replace('.json', '');
                
                try {
                    const codeData = await this.loadCodeFile(code);
                    if (codeData && codeData.username) {
                        const username = codeData.username.toLowerCase();
                        
                        if (mapping[username]) {
                            // 发现重复用户
                            duplicateUsers.push({
                                username: username,
                                codes: [mapping[username], code]
                            });
                        }
                        
                        mapping[username] = code;
                    }
                } catch (error) {
                    console.warn(`加载编码文件 ${filename} 失败:`, error);
                }
            });

            await Promise.all(loadPromises);

            // 缓存结果
            this.usernameToCodeCache = {
                mapping: mapping,
                duplicateUsers: duplicateUsers,
                timestamp: Date.now()
            };

            return mapping;
        } catch (error) {
            console.error('扫描用户编码失败:', error);
            return {};
        }
    }

    /**
     * 根据用户名查找对应的编码
     */
    async findUserCode(username) {
        try {
            const mapping = await this.scanUserCodes();
            const usernameLower = username.toLowerCase();
            
            if (mapping[usernameLower]) {
                return {
                    success: true,
                    code: mapping[usernameLower],
                    duplicateUsers: this.usernameToCodeCache.duplicateUsers || []
                };
            } else {
                return {
                    success: false,
                    error: `未找到用户 "${username}" 的编码文件`
                };
            }
        } catch (error) {
            console.error('查找用户编码失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 验证编码并获取用户名
     */
    async validateCode(code) {
        try {
            // 直接加载编码文件（文件名就是编码）
            const codeData = await this.loadCodeFile(code);
            
            if (!codeData) {
                return {
                    success: true,
                    isValid: false,
                    error: '无效的编码'
                };
            }
            
            // 查找匹配的编码
            const foundCode = codeData.codes.find(c => c.code === code && !c.used);
            
            if (foundCode) {
                const expiresAt = new Date(foundCode.expires_at);
                const now = new Date();
                
                if (expiresAt > now) {
                    const hoursRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
                    return {
                        success: true,
                        isValid: true,
                        username: codeData.username,
                        expiresAt: foundCode.expires_at,
                        hoursRemaining: hoursRemaining
                    };
                } else {
                    return {
                        success: true,
                        isValid: false,
                        error: '编码已过期'
                    };
                }
            }
            
            // 如果没找到匹配的编码
            return {
                success: true,
                isValid: false,
                error: '无效的编码'
            };
        } catch (error) {
            console.error('验证编码失败:', error);
            return {
                success: false,
                isValid: false,
                error: '编码验证失败'
            };
        }
    }

    /**
     * 生成重置链接
     */
    generateResetLink(username, code) {
        const baseUrl = window.location.origin + window.location.pathname.replace('hash-manager.html', 'reset_pas.html');
        return {
            link: `${baseUrl}?code=${code}`,
            code: code
        };
    }

    /**
     * 获取编码的到期日
     */
    async getCodeExpiration(code) {
        try {
            const codeData = await this.loadCodeFile(code);
            
            if (!codeData) {
                return { success: false, error: '编码文件不存在' };
            }
            
            const foundCode = codeData.codes.find(c => c.code === code);
            
            if (foundCode) {
                const expiresAt = new Date(foundCode.expires_at);
                const now = new Date();
                const hoursRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
                
                return {
                    success: true,
                    expiresAt: foundCode.expires_at,
                    hoursRemaining: hoursRemaining,
                    isExpired: expiresAt <= now
                };
            }
            
            return { success: false, error: '编码不存在' };
        } catch (error) {
            console.error('获取编码到期日失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 清理过期编码（由于现在每个文件只有一个编码，这个方法简化了）
     */
    async cleanupExpiredCodes(code) {
        try {
            const codeData = await this.loadCodeFile(code);
            
            if (!codeData) {
                return { success: true, removedCount: 0 };
            }
            
            const now = new Date();
            const foundCode = codeData.codes.find(c => c.code === code);
            
            if (foundCode && new Date(foundCode.expires_at) <= now) {
                // 编码已过期，可以删除文件
                console.log(`编码 ${code} 已过期，可以删除文件`);
                return {
                    success: true,
                    removedCount: 1,
                    message: '编码已过期，可以删除文件'
                };
            }
            
            return { success: true, removedCount: 0 };
        } catch (error) {
            console.error('清理过期编码失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 创建全局实例
window.codeManager = new CodeManager();