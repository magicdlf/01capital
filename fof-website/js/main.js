// 邀请码验证和权限控制系统
const INVITE_CODES = ['01CAPITAL', 'FOF', 'INVESTOR']; // 有效的邀请码列表
let isAuthorized = false;

// 检查权限状态
function checkAuthorization() {
    // 刷新页面后重置登录状态，需要重新输入邀请码
    localStorage.removeItem('inviteCode');
    isAuthorized = false;
    updatePermissionStatus();
    return false;
}

// 验证邀请码
function validateInviteCode(code) {
    if (INVITE_CODES.includes(code)) {
        // 不保存邀请码到localStorage，每次刷新都需要重新输入
        isAuthorized = true;
        updatePermissionStatus();
        return true;
    }
    return false;
}

// 更新权限状态显示
function updatePermissionStatus() {
    // 权限状态更新逻辑保留，但不显示状态提示
    // 邀请码验证成功后直接重新渲染产品信息
}

// 渲染受限的产品信息（预览模式）
function renderLimitedProductInfo(productKey) {
    const data = productData[productKey];
    if (!data) return '';
    
    return `
        <h3>${data.title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
        <p>${data.desc}</p>
        <div class="invite-code-section">
            <div class="invite-code-alert">
                <div class="invite-code-content">
                    <div class="invite-code-text">
                        <i class="bi bi-lock"></i>
                        <span>请输入邀请码查看完整产品信息，包括净值图表、收益率等详细数据。</span>
                    </div>
                    <div class="invite-code-form">
                        <input type="text" class="invite-code-input" id="inviteCodeInput" placeholder="邀请码">
                        <button class="invite-code-btn" id="submitInviteCode">验证</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 绑定邀请码验证事件
function bindInviteCodeEvents() {
    // 使用事件委托，因为邀请码输入框是动态生成的
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'submitInviteCode') {
            const input = document.getElementById('inviteCodeInput');
            if (input) {
                const code = input.value.trim();
                if (!code) {
                    alert('请输入邀请码');
                    return;
                }
                
                if (validateInviteCode(code)) {
                    alert('邀请码验证成功！');
                    input.value = '';
                    // 重新渲染产品信息
                    showBalancedProductSection();
                } else {
                    alert('邀请码无效，请重新输入');
                }
            }
        }
    });
    
    // 绑定回车键验证
    document.addEventListener('keypress', function(e) {
        if (e.target && e.target.id === 'inviteCodeInput' && e.key === 'Enter') {
            const submitBtn = document.getElementById('submitInviteCode');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    });
}

// 初始化权限系统
function initPermissionSystem() {
    checkAuthorization();
    bindInviteCodeEvents();
}

// 平滑滚动和导航高亮
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // 更新导航栏活跃状态
            updateActiveNavLink(targetId);
        }
    });
});

// 更新导航栏活跃链接
function updateActiveNavLink(targetId) {
    // 移除所有活跃状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 添加当前活跃状态
    const activeLink = document.querySelector(`a[href="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 滚动时更新导航栏活跃状态
function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// 导航栏滚动效果和导航高亮
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('navbar-scrolled');
    } else {
        nav.classList.remove('navbar-scrolled');
    }
    
    // 更新导航栏活跃状态
    updateNavOnScroll();
});

// 添加淡入动画
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// 为所有section添加观察
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// 表单提交处理
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // 这里可以添加表单提交逻辑
        alert('感谢您的留言，我们会尽快回复！');
        this.reset();
    });
}

// 产品与业绩切换
const productData = {
    'balanced': {
        title: 'Alpha-Bridge',
        desc: '以多元化策略构建稳健组合，以降低单一策略波动的影响。坚持严谨的风险管理框架，设立清晰的止损与风控机制，确保在复杂多变的市场环境中保持资产的稳定性。注重长期价值创造，在追求稳健收益的基础上，积极把握市场机会，为投资人实现风险与回报的平衡，并推动资产的可持续增长。',
        alt: '平衡型FOF业绩'
    }
};

const perfContent = document.getElementById('product-performance-content');

if (perfContent) {
    // 根据权限状态显示不同的内容
    if (!isAuthorized) {
        // 未授权状态：显示受限信息
        perfContent.innerHTML = renderLimitedProductInfo('balanced');
    } else {
        // 已授权状态：显示完整信息
        if (productData['balanced']) {
            setTimeout(() => {
                showBalancedProductSection();
            }, 100);
        }
    }
}

// 平衡型FOF业绩图表逻辑
let balancedChart = null;
let balancedData = [];
let balancedDataLoaded = false;

// 计算月收益率
function calculateMonthlyReturns(data) {
    if (data.length < 2) return [];
    
    const monthlyReturns = [];
    const monthlyData = {};
    
    // 获取当前日期
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    console.log('Current date:', currentDate);
    console.log('Current year:', currentYear);
    console.log('Current month:', currentMonth);
    
    // 按月份分组数据，只保留每月的最后一个净值
    data.forEach(row => {
        const date = new Date(row.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = null;
        }
        
        // 更新为该月的最新净值（如果当前净值日期更晚）
        if (!monthlyData[monthKey] || new Date(row.date) > new Date(monthlyData[monthKey].date)) {
            monthlyData[monthKey] = {
                date: row.date,
                nav: row.nav
            };
        }
    });
    
    // 计算每个月的收益率
    const months = Object.keys(monthlyData).sort();
    
    console.log('All months found:', months);
    console.log('Monthly data:', monthlyData);
    
    // 处理第一个月：月末净值 / 第一个数据点净值
    if (months.length > 0) {
        const firstMonth = months[0];
        
        // 检查第一个月是否为当月，如果是当月则跳过
        const firstMonthParts = firstMonth.split('-');
        const firstMonthYear = parseInt(firstMonthParts[0]);
        const firstMonthMonth = parseInt(firstMonthParts[1]);
        
        console.log('First month check:', {
            firstMonth,
            firstMonthYear,
            firstMonthMonth,
            currentYear,
            currentMonth,
            isCurrentMonth: firstMonthYear === currentYear && firstMonthMonth === currentMonth
        });
        
        // 如果第一个月不是当月，才计算收益率
        if (!(firstMonthYear === currentYear && firstMonthMonth === currentMonth)) {
            const firstMonthNav = monthlyData[firstMonth].nav;
            const firstDataPointNav = data[0].nav;
            
            // 计算第一个月的收益率
            const firstMonthReturn = ((firstMonthNav / firstDataPointNav - 1) * 100).toFixed(2);
            
            monthlyReturns.push({
                month: firstMonth,
                return: parseFloat(firstMonthReturn)
            });
        } else {
            console.log(`Skipping current incomplete first month ${firstMonth}`);
        }
    }
    
    // 处理后续月份：本月末净值 / 上月末净值
    for (let i = 1; i < months.length; i++) {
        const monthKey = months[i];
        const previousMonth = months[i - 1];
        
        // 检查是否为当月，如果是当月则跳过（因为当月数据不完整）
        const monthParts = monthKey.split('-');
        const monthYear = parseInt(monthParts[0]);
        const monthMonth = parseInt(monthParts[1]);
        
        console.log('Subsequent month check:', {
            monthKey,
            monthYear,
            monthMonth,
            currentYear,
            currentMonth,
            isCurrentMonth: monthYear === currentYear && monthMonth === currentMonth
        });
        
        // 如果是当月，直接跳过
        if (monthYear === currentYear && monthMonth === currentMonth) {
            console.log(`Skipping current incomplete month ${monthKey}`);
            continue;
        }
        
        const currentMonthNav = monthlyData[monthKey].nav;
        const previousMonthNav = monthlyData[previousMonth].nav;
        
        // 计算月收益率：(本月末净值 / 上月末净值 - 1) * 100%
        const monthlyReturn = ((currentMonthNav / previousMonthNav - 1) * 100).toFixed(2);
        
        monthlyReturns.push({
            month: monthKey,
            return: parseFloat(monthlyReturn)
        });
    }
    
    return monthlyReturns;
}

function calculateReturnRate(data) {
    if (data.length < 2) return null;
    const firstValue = data[0].nav;
    const lastValue = data[data.length - 1].nav;
    const returnRate = ((lastValue - firstValue) / firstValue * 100).toFixed(2);
    return returnRate;
}

function calculateAnnualizedReturn(data) {
    if (data.length < 2) return null;
    const firstValue = data[0].nav;
    const lastValue = data[data.length - 1].nav;
    const days = (new Date(data[data.length - 1].date) - new Date(data[0].date)) / (1000 * 60 * 60 * 24);
    const annualizedReturn = ((Math.pow(lastValue / firstValue, 365 / days) - 1) * 100).toFixed(2);
    return annualizedReturn;
}

function calculateMaxDrawdown(data) {
    if (data.length < 2) return null;
    let maxDrawdown = 0;
    let peak = data[0].nav;
    
    for (let i = 1; i < data.length; i++) {
        if (data[i].nav > peak) {
            peak = data[i].nav;
        } else {
            const drawdown = (peak - data[i].nav) / peak * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
    }
    return maxDrawdown.toFixed(2);
}

function calculateAnnualizedSharpe(data) {
    if (!data || data.length < 2) return null;
    let returns = [];
    for (let i = 1; i < data.length; i++) {
        const r = (data[i].nav / data[i-1].nav) - 1;
        returns.push(r);
    }
    if (returns.length < 2) return null;
    // 日均收益率
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    // 日波动率
    const std = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1));
    // 年化收益率和波动率
    const annualizedReturn = mean * 365;
    const annualizedStd = std * Math.sqrt(365);
    if (annualizedStd === 0) return null;
    const sharpe = annualizedReturn / annualizedStd;
    return sharpe.toFixed(2);
}

function renderBalancedChart() {
    if (!balancedData.length) {
        console.log('No balanced data available');
        return;
    }
    
    console.log('Rendering chart with data:', balancedData.length, 'records');
    
    // 计算月收益率
    const monthlyReturns = calculateMonthlyReturns(balancedData);
    console.log('Monthly returns calculated:', monthlyReturns);
    
    if (monthlyReturns.length === 0) {
        console.log('No monthly returns calculated');
        return;
    }
    
    // 直接显示所有月收益率数据
    const labels = monthlyReturns.map(d => d.month);
    const values = monthlyReturns.map(d => d.return);
    
    const canvas = document.getElementById('balancedChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context');
        return;
    }
    
    if (balancedChart) balancedChart.destroy();
    
    console.log('Creating chart with labels:', labels, 'and values:', values);
    
    balancedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '月收益率 (%)',
                data: values,
                backgroundColor: values.map(v => v >= 0 ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)'),
                borderColor: values.map(v => v >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '月收益率: ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true, 
                    title: { 
                        display: true,
                        text: '月份'
                    } 
                },
                y: {
                    display: true,
                    title: { 
                        display: true,
                        text: '收益率 (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + '%';
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: { 
                bar: { 
                    borderWidth: 1 
                } 
            }
        }
    });

    console.log('Chart created successfully');

    // 计算收益率指标（保留计算逻辑，但不再更新表格）
    const returnRate = calculateReturnRate(balancedData);
    const annualized = calculateAnnualizedReturn(balancedData);
    const sharpe = calculateAnnualizedSharpe(balancedData);
    const maxDrawdown = calculateMaxDrawdown(balancedData);
    
    console.log('Calculated metrics:', { returnRate, annualized, sharpe, maxDrawdown });
}

function showBalancedChartUI() {
    const container = document.getElementById('balanced-chart-container');
    if (container) {
        container.style.display = 'block';
        const canvas = document.getElementById('balancedChart');
        if (canvas) {
            canvas.height = 320;
        }
    }
}

function hideBalancedChartUI() {
    const container = document.getElementById('balanced-chart-container');
    if (container) {
        container.style.display = 'none';
    }
}

function loadBalancedCSVAndDraw(callback) {
    console.log('Loading balanced CSV data...');
    
    if (balancedDataLoaded) {
        console.log('Data already loaded, rendering chart...');
        renderBalancedChart();
        if (callback) callback();
        return;
    }
    
    Papa.parse('data/balanced.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV parsing completed:', results);
            
            if (results.errors && results.errors.length > 0) {
                console.error('CSV parsing errors:', results.errors);
            }
            
            balancedData = results.data.filter(row => row['Date'] && row['NAV per unit']).map(row => ({
                date: row['Date'],
                nav: parseFloat(row['NAV per unit'])
            }));
            
            console.log('Filtered data:', balancedData.length, 'records');
            console.log('Sample data:', balancedData.slice(0, 5));
            
            balancedDataLoaded = true;
            renderBalancedChart();
            if (callback) callback();
        },
        error: function(error) {
            console.error('Error loading CSV:', error);
        }
    });
}

function bindBalancedChartControls() {
    // 不再需要绑定按钮事件，因为已经移除了筛选按钮
    // 保留函数以维持代码结构的一致性
}

function showBalancedProductSection() {
    // 1. 生成内容
    if (perfContent && productData['balanced']) {
        perfContent.innerHTML = `
            <h3>${productData['balanced'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['balanced'].desc}</p>
            <div class="performance-chart mb-3" id="balanced-chart-container">
                <canvas id="balancedChart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showBalancedChartUI();
    // 3. 渲染图表
    loadBalancedCSVAndDraw(bindBalancedChartControls);
}

// 页面初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    console.log('Papa Parse available:', typeof Papa !== 'undefined');
    
    // 初始化权限系统
    initPermissionSystem();
    
    // 根据权限状态显示不同的默认内容
    if (isAuthorized) {
        console.log('User is authorized, showing full product section');
        showBalancedProductSection();
    } else {
        console.log('User is not authorized, showing limited info');
        // 未授权状态显示受限信息
        perfContent.innerHTML = renderLimitedProductInfo('balanced');
    }
});

// 联系表单提交处理
function submitContactForm() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // 验证表单
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // 模拟表单提交（实际项目中这里应该发送到服务器）
    console.log('Contact form submitted:', { name, email, message });
    
    // 显示成功消息
    alert('Thank you for your inquiry! We will get back to you soon.');
    
    // 清空表单
    document.getElementById('contactForm').reset();
    
    // 关闭弹窗
    const modal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
    if (modal) {
        modal.hide();
    }
} 