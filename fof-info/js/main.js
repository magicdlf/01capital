// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('navbar-scrolled');
    } else {
        nav.classList.remove('navbar-scrolled');
    }
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
    stable: {
        title: '稳健收益投资组合',
        desc: '仅配置低风险套利与稳定现金流策略，追求8%-10%的稳定APY，严格控制回撤在1%以内。',
        facts: [
            { label: '成立时间', value: '2025/2/19' },
            { label: '策略成分', value: '套利' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '1.5X' },
            { label: 'Sharpe比率', value: '' },
            { label: '杠杆限额', value: '5X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        img: 'images/performance-stable.png',
        alt: '稳健型FOF业绩'
    },
    balanced: {
        title: '平衡增益投资组合',
        desc: '以套利稳基础（90%），动态多因子模型提收益（10%），力求年化18%+的APY。',
        facts: [
            { label: '成立时间', value: '2024/8/1' },
            { label: '策略成分', value: '套利 + 多因子 （90% + 10%）' },
            { label: '最大回撤', value: '2.44%' },
            { label: '实际杠杆', value: '套利：1X  ；多因子：0.8X' },
            { label: 'Sharpe比率', value: '3.55' },
            { label: '杠杆限额', value: '套利：5X ； 多因子：4X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        img: 'images/performance-balanced.png',
        alt: '平衡型FOF业绩'
    },
    aggressive: {
        title: '灵活增长投资组合',
        desc: '聚焦趋势机会与波动捕捉，配置更高比例的风险策略，目标30%+的APY，容忍适度波动。',
        facts: [
            { label: '成立时间', value: '' },
            { label: '策略成分', value: '' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '' },
            { label: 'Sharpe比率', value: '' },
            { label: '杠杆限额', value: '' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        img: 'images/performance-aggressive.png',
        alt: '进取型FOF业绩'
    }
};

const productList = document.getElementById('product-list');
const perfContent = document.getElementById('product-performance-content');
if (productList && perfContent) {
    productList.addEventListener('click', function(e) {
        if (e.target.matches('button[data-product]')) {
            // 切换active
            productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            // 获取数据
            const key = e.target.getAttribute('data-product');
            const data = productData[key];
            // 更新内容
            perfContent.innerHTML = `
                <h3>${data.title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
                <p>${data.desc}</p>
                ${renderFactsTable(data.facts)}
                <div class="performance-chart mb-3">
                    <img src="${data.img}" alt="${data.alt}" class="img-fluid">
                </div>
            `;
        }
    });
}

// 平衡型FOF业绩图表逻辑
let balancedChart = null;
let balancedData = [];
let balancedDataLoaded = false;

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
    if (days <= 0) return null;
    const periodReturn = (lastValue - firstValue) / firstValue;
    const annualized = (Math.pow(1 + periodReturn, 365 / days) - 1) * 100;
    return annualized.toFixed(2);
}

function calculateMaxDrawdown(data) {
    if (!data || data.length < 2) return null;
    let maxNav = data[0].nav;
    let maxDrawdown = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i].nav > maxNav) maxNav = data[i].nav;
        const drawdown = (data[i].nav - maxNav) / maxNav;
        if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    }
    return (maxDrawdown * 100).toFixed(2);
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

function renderBalancedChart(rangeDays = 30) {
    if (!balancedData.length) return;
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = balancedData;
    } else {
        dataSlice = balancedData.slice(-rangeDays);
    }
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const ctx = document.getElementById('balancedChart').getContext('2d');
    if (balancedChart) balancedChart.destroy();
    balancedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '单位净值',
                data: values,
                borderColor: '#1a2530',
                backgroundColor: 'rgba(26,37,48,0.08)',
                pointRadius: 2,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '单位净值: ' + context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: { display: true, title: { display: false } },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { borderWidth: 2 } }
        }
    });

    // 计算收益率指标
    const returnRate = calculateReturnRate(dataSlice);
    const annualized = calculateAnnualizedReturn(dataSlice);
    const sharpe = calculateAnnualizedSharpe(dataSlice);
    const maxDrawdown = calculateMaxDrawdown(dataSlice);

    // 更新表格中的值
    const facts = productData['balanced'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';  // 最大回撤
    facts[4].value = sharpe ? sharpe : '';  // Sharpe比率
    facts[6].value = returnRate ? returnRate + '%' : '';  // 区间收益率
    facts[7].value = annualized ? annualized + '%' : '';  // 预计年化收益率

    // 重新渲染表格
    const perfContent = document.getElementById('product-performance-content');
    if (perfContent) {
        const title = productData['balanced'].title;
        const desc = productData['balanced'].desc;
        const factsHtml = renderFactsTable(facts);
        
        perfContent.innerHTML = `
            <h3>${title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${desc}</p>
            ${factsHtml}
            <div id="balanced-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="balanced-chart-container">
                <canvas id="balancedChart" height="320"></canvas>
            </div>
        `;

        // 重新绑定事件监听器
        bindBalancedChartControls();
        
        // 重新初始化图表
        const newCtx = document.getElementById('balancedChart').getContext('2d');
        balancedChart = new Chart(newCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '单位净值',
                    data: values,
                    borderColor: '#1a2530',
                    backgroundColor: 'rgba(26,37,48,0.08)',
                    pointRadius: 2,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '单位净值: ' + context.parsed.y.toFixed(4);
                            }
                        }
                    }
                },
                scales: {
                    x: { display: true, title: { display: false } },
                    y: {
                        display: true,
                        title: { display: false },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(4);
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                elements: { line: { borderWidth: 2 } }
            }
        });
    }
}

function showBalancedChartUI() {
    document.getElementById('balanced-chart-controls').style.display = '';
    document.getElementById('balanced-chart-container').style.display = '';
    document.getElementById('balancedChart').height = 320;
}
function hideBalancedChartUI() {
    const controls = document.getElementById('balanced-chart-controls');
    const container = document.getElementById('balanced-chart-container');
    if (controls) controls.style.display = 'none';
    if (container) container.style.display = 'none';
}

function loadBalancedCSVAndDraw(rangeDays = 30, callback) {
    if (balancedDataLoaded) {
        renderBalancedChart(rangeDays);
        if (callback) callback();
        return;
    }
    Papa.parse('data/balanced.csv', {
        download: true,
        header: true,
        complete: function(results) {
            balancedData = results.data.filter(row => row['Date'] && row['NAV per unit']).map(row => ({
                date: row['Date'],
                nav: parseFloat(row['NAV per unit'])
            }));
            balancedDataLoaded = true;
            renderBalancedChart(rangeDays);
            if (callback) callback();
        }
    });
}

function bindBalancedChartControls() {
    const chartControls = document.getElementById('balanced-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => {
            btn.onclick = function() {
                const days = parseInt(this.getAttribute('data-range'));
                renderBalancedChart(days);
                chartControls.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            };
        });
    }
}

function showBalancedProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['balanced']) {
        perfContent.innerHTML = `
            <h3>${productData['balanced'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['balanced'].desc}</p>
            ${renderFactsTable(productData['balanced'].facts)}
            <div id="balanced-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="balanced-chart-container">
                <canvas id="balancedChart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showBalancedChartUI();
    // 3. 渲染图表
    loadBalancedCSVAndDraw(rangeDays, bindBalancedChartControls);
    // 4. 高亮当前按钮
    const chartControls = document.getElementById('balanced-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        chartControls.querySelector(`button[data-range="${rangeDays}"]`).classList.add('active');
    }
}

// 稳健型FOF业绩图表逻辑
let stableChart = null;
let stableData = [];
let stableDataLoaded = false;

function renderStableChart(rangeDays = 30) {
    if (!stableData.length) return;
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = stableData;
    } else {
        dataSlice = stableData.slice(-rangeDays);
    }
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const ctx = document.getElementById('stableChart').getContext('2d');
    if (stableChart) stableChart.destroy();
    stableChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '单位净值',
                data: values,
                borderColor: '#1a2530',
                backgroundColor: 'rgba(26,37,48,0.08)',
                pointRadius: 2,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '单位净值: ' + context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: { display: true, title: { display: false } },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { borderWidth: 2 } }
        }
    });

    // 计算收益率指标
    const returnRate = calculateReturnRate(dataSlice);
    const annualized = calculateAnnualizedReturn(dataSlice);
    const sharpe = calculateAnnualizedSharpe(dataSlice);
    const maxDrawdown = calculateMaxDrawdown(dataSlice);

    // 更新表格中的值
    const facts = productData['stable'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';  // 最大回撤
    facts[4].value = sharpe ? sharpe : '';  // Sharpe比率
    facts[6].value = returnRate ? returnRate + '%' : '';  // 区间收益率
    facts[7].value = annualized ? annualized + '%' : '';  // 预计年化收益率

    // 重新渲染表格
    const perfContent = document.getElementById('product-performance-content');
    if (perfContent) {
        const title = productData['stable'].title;
        const desc = productData['stable'].desc;
        const factsHtml = renderFactsTable(facts);
        
        perfContent.innerHTML = `
            <h3>${title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${desc}</p>
            ${factsHtml}
            <div id="stable-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="stable-chart-container">
                <canvas id="stableChart" height="320"></canvas>
            </div>
        `;

        // 重新绑定事件监听器
        bindStableChartControls();
        
        // 重新初始化图表
        const newCtx = document.getElementById('stableChart').getContext('2d');
        stableChart = new Chart(newCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '单位净值',
                    data: values,
                    borderColor: '#1a2530',
                    backgroundColor: 'rgba(26,37,48,0.08)',
                    pointRadius: 2,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '单位净值: ' + context.parsed.y.toFixed(4);
                            }
                        }
                    }
                },
                scales: {
                    x: { display: true, title: { display: false } },
                    y: {
                        display: true,
                        title: { display: false },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(4);
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                elements: { line: { borderWidth: 2 } }
            }
        });
    }
}

function showStableChartUI() {
    document.getElementById('stable-chart-controls').style.display = '';
    document.getElementById('stable-chart-container').style.display = '';
    document.getElementById('stableChart').height = 320;
}

function hideStableChartUI() {
    const controls = document.getElementById('stable-chart-controls');
    const container = document.getElementById('stable-chart-container');
    if (controls) controls.style.display = 'none';
    if (container) container.style.display = 'none';
}

function loadStableCSVAndDraw(rangeDays = 30, callback) {
    if (stableDataLoaded) {
        renderStableChart(rangeDays);
        if (callback) callback();
        return;
    }
    Papa.parse('data/arbitrage.csv', {
        download: true,
        header: true,
        complete: function(results) {
            stableData = results.data.filter(row => row['Date'] && row['NAV per unit']).map(row => ({
                date: row['Date'],
                nav: parseFloat(row['NAV per unit'])
            }));
            stableDataLoaded = true;
            renderStableChart(rangeDays);
            if (callback) callback();
        }
    });
}

function bindStableChartControls() {
    const chartControls = document.getElementById('stable-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => {
            btn.onclick = function() {
                const days = parseInt(this.getAttribute('data-range'));
                renderStableChart(days);
                chartControls.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            };
        });
    }
}

function showStableProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable']) {
        perfContent.innerHTML = `
            <h3>${productData['stable'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['stable'].desc}</p>
            ${renderFactsTable(productData['stable'].facts)}
            <div id="stable-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="stable-chart-container">
                <canvas id="stableChart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showStableChartUI();
    // 3. 渲染图表
    loadStableCSVAndDraw(rangeDays, bindStableChartControls);
    // 4. 高亮当前按钮
    const chartControls = document.getElementById('stable-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        chartControls.querySelector(`button[data-range="${rangeDays}"]`).classList.add('active');
    }
}

// 修改产品切换事件
if (productList && perfContent) {
    productList.addEventListener('click', function(e) {
        if (e.target.matches('button[data-product]')) {
            const key = e.target.getAttribute('data-product');
            if (key === 'balanced') {
                setTimeout(() => {
                    showBalancedProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'stable') {
                setTimeout(() => {
                    showStableProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'aggressive') {
                setTimeout(() => {
                    if (perfContent && productData['aggressive']) {
                        perfContent.innerHTML = `
                            <h3>${productData['aggressive'].title} <span style=\"font-size:1.1rem;color:#666;\">（即将上线）</span></h3>
                            <p>${productData['aggressive'].desc}</p>
                            ${renderFactsTable(productData['aggressive'].facts)}
                            <div class=\"performance-chart mb-3\">
                                <img src=\"${productData['aggressive'].img}\" alt=\"${productData['aggressive'].alt}\" class=\"img-fluid\">
                            </div>
                        `;
                    }
                    hideBalancedChartUI();
                    hideStableChartUI();
                }, 100);
            } else {
                hideBalancedChartUI();
                hideStableChartUI();
            }
        }
    });
}

// 页面初始自动选中稳健型FOF并显示图表
window.addEventListener('DOMContentLoaded', function() {
    if (productList) {
        productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const stableBtn = productList.querySelector('button[data-product="stable"]');
        if (stableBtn) stableBtn.classList.add('active');
    }
    showStableProductSection('all'); // 默认显示成立以来
});

function renderFactsTable(facts) {
    if (!facts || !facts.length) return '';
    let left = '', right = '';
    for (let i = 0; i < facts.length; i++) {
        if (i % 2 === 0) {
            left += `<tr><td class="fw-bold" style="width:40%">${facts[i].label}</td><td>${facts[i].value}</td></tr>`;
        } else {
            right += `<tr><td class="fw-bold" style="width:40%">${facts[i].label}</td><td>${facts[i].value}</td></tr>`;
        }
    }
    return `
    <div class="container mb-3">
      <div class="row">
        <div class="col-md-6">
          <table class="table table-borderless mb-0">
            <tbody>${left}</tbody>
          </table>
        </div>
        <div class="col-md-6">
          <table class="table table-borderless mb-0">
            <tbody>${right}</tbody>
          </table>
        </div>
      </div>
    </div>
    `;
}

// 登录模块和个人投资摘要
let currentUser = null;

function showLoginModal() {
    console.log('Showing login modal...');
    const modalHtml = `
        <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="loginModalLabel">登录</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="username" class="form-label">用户名</label>
                                <input type="text" class="form-control" id="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">密码</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <div class="alert alert-danger d-none" id="loginError"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" id="modalLoginButton">登录</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 移除已存在的模态框
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 添加模态框到body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 初始化Bootstrap模态框
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    
    // 显示模态框
    loginModal.show();
    
    // 绑定登录按钮事件
    document.getElementById('modalLoginButton').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Login button clicked');
        handleLogin();
    });
}

function handleLogin() {
    console.log('Handling login...');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    console.log('Username:', username);
    console.log('Password:', password);
    
    // 验证用户名和密码
    Papa.parse('data/password.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV parsing complete:', results);
            const user = results.data.find(row => row.name === username && row.password === password);
            if (user) {
                console.log('Login successful');
                currentUser = username;
                // 关闭登录模态框
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) {
                    loginModal.hide();
                }
                // 显示个人投资摘要
                showInvestmentSummary();
                // 更新UI状态
                updateUIAfterLogin();
            } else {
                console.log('Login failed');
                errorElement.textContent = '用户名或密码错误';
                errorElement.classList.remove('d-none');
            }
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
            errorElement.textContent = '登录过程中发生错误，请稍后重试';
            errorElement.classList.remove('d-none');
        }
    });
}

function showInvestmentSummary() {
    console.log('Showing investment summary...');
    const summaryHtml = `
        <section class="investment-summary py-5 bg-light">
            <div class="container">
                <h2 class="mb-4">个人投资摘要</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">投资组合概览</h5>
                                <div class="table-responsive">
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <td class="fw-bold">总资产</td>
                                                <td>¥1,000,000.00</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">累计收益</td>
                                                <td class="text-success">+¥50,000.00 (+5.00%)</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-bold">当前持仓</td>
                                                <td>3个组合</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">资产配置</h5>
                                <canvas id="assetAllocationChart" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">投资组合明细</h5>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>组合名称</th>
                                                <th>投资金额</th>
                                                <th>当前价值</th>
                                                <th>收益率</th>
                                                <th>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>稳健收益投资组合</td>
                                                <td>¥500,000.00</td>
                                                <td>¥510,000.00</td>
                                                <td class="text-success">+2.00%</td>
                                                <td><button class="btn btn-sm btn-outline-primary">查看详情</button></td>
                                            </tr>
                                            <tr>
                                                <td>平衡增益投资组合</td>
                                                <td>¥300,000.00</td>
                                                <td>¥315,000.00</td>
                                                <td class="text-success">+5.00%</td>
                                                <td><button class="btn btn-sm btn-outline-primary">查看详情</button></td>
                                            </tr>
                                            <tr>
                                                <td>灵活增长投资组合</td>
                                                <td>¥200,000.00</td>
                                                <td>¥210,000.00</td>
                                                <td class="text-success">+5.00%</td>
                                                <td><button class="btn btn-sm btn-outline-primary">查看详情</button></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    // 移除已存在的投资摘要
    const existingSummary = document.querySelector('.investment-summary');
    if (existingSummary) {
        existingSummary.remove();
    }
    
    // 查找产品介绍部分
    const productSection = document.querySelector('#product-performance');
    if (productSection) {
        console.log('Found product section, inserting summary after it');
        productSection.insertAdjacentHTML('afterend', summaryHtml);
        
        // 初始化资产配置图表
        const ctx = document.getElementById('assetAllocationChart');
        if (ctx) {
            console.log('Initializing asset allocation chart');
            new Chart(ctx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['稳健收益', '平衡增益', '灵活增长'],
                    datasets: [{
                        data: [50, 30, 20],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)',
                            'rgba(0, 123, 255, 0.8)',
                            'rgba(255, 193, 7, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } else {
            console.error('Could not find canvas element for chart');
        }
    } else {
        console.error('Could not find product section');
        // 如果找不到产品部分，添加到页面底部
        document.body.insertAdjacentHTML('beforeend', summaryHtml);
    }
}

function updateUIAfterLogin() {
    // 添加登录按钮到导航栏
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const loginButton = navbar.querySelector('#loginButton');
        if (loginButton) {
            loginButton.remove();
        }
        
        const userMenu = document.createElement('li');
        userMenu.className = 'nav-item dropdown';
        userMenu.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${currentUser}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="#" id="logoutButton">退出登录</a></li>
            </ul>
        `;
        navbar.appendChild(userMenu);
        
        // 绑定退出登录事件
        document.getElementById('logoutButton').addEventListener('click', handleLogout);
    }
}

function handleLogout() {
    currentUser = null;
    const investmentSummary = document.getElementById('investmentSummary');
    if (investmentSummary) {
        investmentSummary.remove();
    }
    
    // 恢复登录按钮
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const userMenu = navbar.querySelector('.dropdown');
        if (userMenu) {
            userMenu.remove();
        }
        
        const loginButton = document.createElement('li');
        loginButton.className = 'nav-item';
        loginButton.innerHTML = `
            <a class="nav-link" href="#" id="loginButton">登录</a>
        `;
        navbar.appendChild(loginButton);
        
        // 重新绑定登录按钮事件
        document.getElementById('loginButton').addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }
}

// 在页面加载完成后添加登录按钮
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        console.log('Navbar found');
        const loginButton = document.createElement('li');
        loginButton.className = 'nav-item';
        loginButton.innerHTML = `
            <a class="nav-link" href="#" id="loginButton">登录</a>
        `;
        navbar.appendChild(loginButton);
        
        // 绑定登录按钮事件
        document.getElementById('loginButton').addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Login button clicked in navbar');
            showLoginModal();
        });
    } else {
        console.log('Navbar not found');
    }
}); 