// EmailJS配置
const EMAILJS_CONFIG = {
    serviceId: 'service_alzfhf8',
    redemptionTemplateId: 'template_x0m1g0s',
    conversionTemplateId: 'template_kem12pn',
    userId: 'NudKPCV0CbLl3NrZT'
};

// 初始化EmailJS
(function() {
    emailjs.init(EMAILJS_CONFIG.userId);
})();

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
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

// 产品与业绩切换
const productData = {
    stable: {
        title: '稳健系列',
        desc: '包含U本位和币本位两个子系列，专注于低风险套利策略，追求稳定收益。',
        facts: [
            { label: '成立时间', value: '' },
            { label: '策略成分', value: '套利' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '1.5X' },
            { label: 'Sharpe比率', value: '' },
            { label: '杠杆限额', value: '5X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        alt: '稳健系列'
    },
    'stable-usd': {
        title: 'Stable-Harbor-USDT',
        desc: '以U本位计价，专注于低风险套利策略，追求稳定收益，严格控制回撤。',
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
        alt: '稳健系列-U本位业绩'
    },
    'stable-coin': {
        title: 'Stable-Harbor-BTC',
        desc: '以币本位计价，专注于低风险套利策略，追求稳定收益，严格控制回撤。',
        facts: [
            { label: '成立时间', value: '2024/8/16' },
            { label: '策略成分', value: '套利' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '1.5X' },
            { label: 'Sharpe比率', value: '' },
            { label: '杠杆限额', value: '5X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        alt: '稳健系列-币本位业绩'
    },
    balanced: {
        title: 'Alpha-Bridge',
        desc: '精选多元策略组合 (套利90% + 风险策略10%），平衡风险收益，力求在稳健风控下实现资产长期稳定增值。',
        facts: [
            { label: '成立时间', value: '2024/8/1' },
            { label: '策略成分', value: '套利 + 多因子 （90% + 10%）' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '套利：1X  ；多因子：0.8X' },
            { label: 'Sharpe比率', value: '3.55' },
            { label: '杠杆限额', value: '套利：5X ； 多因子：4X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        alt: '平衡型FOF业绩'
    },
    aggressive: {
        title: 'Deep-Growth',
        desc: '聚焦趋势机会与波动捕捉，配置更高比例的风险策略，目标30%+的APY，容忍适度波动。',
        facts: [
            { label: '实盘测试时间', value: '2025/4/24' },
            { label: '策略成分', value: '多因子' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '1X' },
            { label: 'Sharpe比率', value: '' },
            { label: '杠杆限额', value: '4X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '30%+' }
        ],
        alt: '进取型FOF业绩'
    }
};

// 存储当前用户的hash文件名
let currentUserHashFile = null;

// 存储从hash文件加载的用户数据
let currentUserData = null;

const productList = document.getElementById('product-list');
const perfContent = document.getElementById('product-performance-content');
if (productList && perfContent) {
    productList.addEventListener('click', function(e) {
        if (e.target.matches('button[data-product]')) {
            const key = e.target.getAttribute('data-product');
            
            // 处理稳健系列的特殊情况
            if (key === 'stable') {
                // 切换子选项的显示状态
                const subOptions = document.querySelector('.stable-sub-options');
                if (subOptions) {
                    subOptions.style.display = subOptions.style.display === 'none' ? 'block' : 'none';
                }
                // 移除所有按钮的active类
                productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                // 为稳健系列按钮添加active类
                e.target.classList.add('active');
                return; // 不改变右侧内容
            }
            
            // 处理其他产品选项
            if (key === 'balanced') {
                setTimeout(() => {
                    showBalancedProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'stable-usd') {
                setTimeout(() => {
                    showStableUsdProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'stable-coin') {
                setTimeout(() => {
                    showStableCoinProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'aggressive') {
                setTimeout(() => {
                    showAggressiveProductSection('all'); // 默认显示成立以来
                }, 100);
            }
            
            // 移除所有按钮的active类
            productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            // 为当前点击的按钮添加active类
            e.target.classList.add('active');
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
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
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

    // 更新表格内容
    const factsHtml = renderFactsTable(facts);
    const factsContainer = document.querySelector('#product-performance-content .container');
    if (factsContainer) {
        factsContainer.outerHTML = factsHtml;
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
    Papa.parse('data/balanced.csv?t=' + new Date().getTime(), {
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
            btn.addEventListener('click', function() {
                const days = this.getAttribute('data-range');
                // 移除所有按钮的active类
                chartControls.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                // 为当前点击的按钮添加active类
                this.classList.add('active');
                // 渲染图表
                renderBalancedChart(days);
            });
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
                <button class="btn btn-outline-dark btn-sm active" data-range="all">成立以来</button>
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
    // 4. 设置对应按钮的高亮状态
    const chartControls = document.getElementById('balanced-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = chartControls.querySelector(`button[data-range="${rangeDays}"]`);
        if (activeBtn) activeBtn.classList.add('active');
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
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
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

    // 更新表格内容
    const factsHtml = renderFactsTable(facts);
    const factsContainer = document.querySelector('#product-performance-content .container');
    if (factsContainer) {
        factsContainer.outerHTML = factsHtml;
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
    Papa.parse('data/arbitrage.csv?t=' + new Date().getTime(), {
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
            btn.addEventListener('click', function() {
                const days = this.getAttribute('data-range');
                // 移除所有按钮的active类
                chartControls.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                // 为当前点击的按钮添加active类
                this.classList.add('active');
                // 渲染图表
                renderStableChart(days);
            });
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
    // 4. 设置对应按钮的高亮状态
    const chartControls = document.getElementById('stable-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = chartControls.querySelector(`button[data-range="${rangeDays}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

// 稳健系列-币本位业绩图表逻辑
let stableCoinChart = null;
let stableCoinData = [];
let stableCoinDataLoaded = false;

function loadStableCoinCSVAndDraw(rangeDays = 30, callback) {
    Papa.parse('data/arbitrage_coin.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            stableCoinData = results.data
                .filter(row => row.Date && row['NAV per unit'])
                .map(row => ({
                    date: row.Date,
                    nav: parseFloat(row['NAV per unit'])
                }));
            stableCoinDataLoaded = true;
            renderStableCoinChart(rangeDays);
            if (callback) callback();
        }
    });
}

function renderStableCoinChart(rangeDays = 30) {
    if (!stableCoinData.length) return;
    let dataSlice;
    
    // 计算实际需要的数据点数量
    let pointsToShow;
    if (rangeDays === 'all') {
        dataSlice = stableCoinData;
    } else {
        // 由于是周频数据，每周一个点，所以需要的数据点数量是 rangeDays/7 向上取整
        pointsToShow = Math.ceil(rangeDays / 7);
        dataSlice = stableCoinData.slice(-pointsToShow);
    }

    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const ctx = document.getElementById('stableCoinChart').getContext('2d');
    if (stableCoinChart) stableCoinChart.destroy();
    stableCoinChart = new Chart(ctx, {
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
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '单位净值: ' + context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true, 
                    title: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
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
    const facts = productData['stable-coin'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';  // 最大回撤
    facts[4].value = sharpe ? sharpe : '';  // Sharpe比率
    facts[6].value = returnRate ? returnRate + '%' : '';  // 区间收益率
    facts[7].value = annualized ? annualized + '%' : '';  // 预计年化收益率

    // 更新表格内容
    const factsHtml = renderFactsTable(facts);
    const factsContainer = document.querySelector('#product-performance-content .container');
    if (factsContainer) {
        factsContainer.outerHTML = factsHtml;
    }
}

function showStableCoinProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable-coin']) {
        perfContent.innerHTML = `
            <h3>${productData['stable-coin'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['stable-coin'].desc}</p>
            ${renderFactsTable(productData['stable-coin'].facts)}
            <div id="stable-coin-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="stable-coin-chart-container">
                <canvas id="stableCoinChart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showStableCoinChartUI();
    // 3. 渲染图表
    loadStableCoinCSVAndDraw(rangeDays, bindStableCoinChartControls);
    // 4. 设置对应按钮的高亮状态
    const chartControls = document.getElementById('stable-coin-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = chartControls.querySelector(`button[data-range="${rangeDays}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

function showStableCoinChartUI() {
    const container = document.getElementById('stable-coin-chart-container');
    if (container) container.style.display = 'block';
}

function hideStableCoinChartUI() {
    const container = document.getElementById('stable-coin-chart-container');
    if (container) container.style.display = 'none';
}

function bindStableCoinChartControls() {
    const controls = document.getElementById('stable-coin-chart-controls');
    if (controls) {
        controls.addEventListener('click', function(e) {
            if (e.target.matches('button[data-range]')) {
                const range = e.target.getAttribute('data-range');
                renderStableCoinChart(range);
                controls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }
}

// 添加稳健系列-U本位业绩图表逻辑
let stableUsdChart = null;
let stableUsdData = [];
let stableUsdDataLoaded = false;

function loadStableUsdCSVAndDraw(rangeDays = 30, callback) {
    Papa.parse('data/arbitrage.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            stableUsdData = results.data
                .filter(row => row.Date && row['NAV per unit'])
                .map(row => ({
                    date: row.Date,
                    nav: parseFloat(row['NAV per unit'])
                }));
            stableUsdDataLoaded = true;
            renderStableUsdChart(rangeDays);
            if (callback) callback();
        }
    });
}

function renderStableUsdChart(rangeDays = 30) {
    if (!stableUsdData.length) return;
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = stableUsdData;
    } else {
        dataSlice = stableUsdData.slice(-rangeDays);
    }
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const ctx = document.getElementById('stableUsdChart').getContext('2d');
    if (stableUsdChart) stableUsdChart.destroy();
    stableUsdChart = new Chart(ctx, {
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
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
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
    const facts = productData['stable-usd'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';  // 最大回撤
    facts[4].value = sharpe ? sharpe : '';  // Sharpe比率
    facts[6].value = returnRate ? returnRate + '%' : '';  // 区间收益率
    facts[7].value = annualized ? annualized + '%' : '';  // 预计年化收益率

    // 更新表格内容
    const factsHtml = renderFactsTable(facts);
    const factsContainer = document.querySelector('#product-performance-content .container');
    if (factsContainer) {
        factsContainer.outerHTML = factsHtml;
    }
}

function showStableUsdProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable-usd']) {
        perfContent.innerHTML = `
            <h3>${productData['stable-usd'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['stable-usd'].desc}</p>
            ${renderFactsTable(productData['stable-usd'].facts)}
            <div id="stable-usd-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="stable-usd-chart-container">
                <canvas id="stableUsdChart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showStableUsdChartUI();
    // 3. 渲染图表
    loadStableUsdCSVAndDraw(rangeDays, bindStableUsdChartControls);
    // 4. 设置对应按钮的高亮状态
    const chartControls = document.getElementById('stable-usd-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = chartControls.querySelector(`button[data-range="${rangeDays}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

function showStableUsdChartUI() {
    const container = document.getElementById('stable-usd-chart-container');
    if (container) container.style.display = 'block';
}

function hideStableUsdChartUI() {
    const container = document.getElementById('stable-usd-chart-container');
    if (container) container.style.display = 'none';
}

function bindStableUsdChartControls() {
    const controls = document.getElementById('stable-usd-chart-controls');
    if (controls) {
        controls.addEventListener('click', function(e) {
            if (e.target.matches('button[data-range]')) {
                const range = e.target.getAttribute('data-range');
                renderStableUsdChart(range);
                controls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    }
}

// 页面初始自动选中平衡型FOF并显示图表
window.addEventListener('DOMContentLoaded', function() {
    if (productList) {
        productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const balancedBtn = productList.querySelector('button[data-product="balanced"]');
        if (balancedBtn) balancedBtn.classList.add('active');
    }
    showBalancedProductSection('all'); // 默认显示成立以来
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

    // 添加回车键提交功能
    document.getElementById('loginForm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('Enter key pressed');
            handleLogin();
        }
    });
}

async function handleLogin() {
    console.log('Handling login...');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    console.log('Username:', username);
    
    if (!username || !password) {
        errorElement.textContent = '请输入用户名和密码';
        errorElement.classList.remove('d-none');
        return;
    }
    
    try {
        // 生成用户凭证的hash
        const combined = username.toLowerCase() + ':' + password;
        const encoder = new TextEncoder();
        const data = encoder.encode(combined);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        
        // 使用前16字节生成Base64文件名（与生成工具保持一致）
        const shortHashArray = hashArray.slice(0, 16);
        const base64 = btoa(String.fromCharCode.apply(null, shortHashArray))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        
        const hashFilename = base64 + '.json';
        console.log('Trying to fetch user data from:', hashFilename);
        
        // 尝试获取对应的用户数据文件
        const response = await fetch('data/users/' + hashFilename + '?t=' + new Date().getTime());
        
        if (response.ok) {
            // 读取用户数据
            currentUserData = await response.json();
            currentUserHashFile = hashFilename;
            
            // 登录成功
            console.log('Login successful for user:', username);
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
            
            // 显示导航栏中的个人投资摘要链接
            const investmentSummaryLink = document.getElementById('investmentSummaryLink');
            if (investmentSummaryLink) {
                investmentSummaryLink.style.display = 'block';
            }
            
            // 平滑滚动到投资摘要部分
            setTimeout(() => {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = document.getElementById('investment-summary').offsetTop - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        } else {
            // 登录失败
            console.log('Login failed - hash file not found');
            errorElement.textContent = '用户名或密码错误';
            errorElement.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = '登录过程中发生错误，请稍后重试';
        errorElement.classList.remove('d-none');
    }
}

function calculateAnnualizedReturnFromDays(returnRate, days) {
    if (!days || days <= 0) return 0;
    // 年化收益率 = (1 + 收益率)^(365/持仓天数) - 1
    return ((Math.pow(1 + returnRate/100, 365/days) - 1) * 100).toFixed(2);
}

// 移除缓存标志，始终重新加载CSV数据
let balancedInvestorData = [];

function loadBalancedInvestorData() {
    // 始终重新加载CSV数据
    return new Promise((resolve, reject) => {
        Papa.parse('data/balanced_investor.csv?t=' + new Date().getTime(), {
            download: true,
            header: true,
            complete: function(results) {
                balancedInvestorData = results.data
                    .filter(row => row.Date && row.investor && row['NAV per unit'])
                    .map(row => ({
                        date: row.Date,
                        investor: row.investor,
                        nav: parseFloat(row['NAV per unit']),
                        principal: parseFloat(row.principal || 0),
                        net_nav: parseFloat(row.net_nav || 0),
                        net_pnl: parseFloat(row.net_pnl || 0),
                        realized_pnl: parseFloat(row.realized_pnl || 0),
                        total_return: parseFloat(row.total_return || 0),
                        coin: (row.product === 'Stable-Harbor-BTC' && (!row.coin || row.coin === '')) ? 'BTC' : (row.coin || 'USDT')
                    }));
                resolve(balancedInvestorData);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

function getLatestBalancedInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const balancedData = currentUserData.investments.balanced || [];
    if (!balancedData.length) return null;
    
    // 按日期排序并获取最新记录
    return balancedData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

let arbitrageInvestorData = [];

function loadArbitrageInvestorData() {
    // 始终重新加载CSV数据
    return new Promise((resolve, reject) => {
        Papa.parse('data/arbitrage_investor.csv?t=' + new Date().getTime(), {
            download: true,
            header: true,
            complete: function(results) {
                arbitrageInvestorData = results.data
                    .filter(row => row.Date && row.investor && row['NAV per unit'])
                    .map(row => ({
                        date: row.Date,
                        investor: row.investor,
                        nav: parseFloat(row['NAV per unit']),
                        principal: parseFloat(row.principal || 0),
                        net_nav: parseFloat(row.net_nav || 0),
                        net_pnl: parseFloat(row.net_pnl || 0),
                        realized_pnl: parseFloat(row.realized_pnl || 0),
                        total_return: parseFloat(row.total_return || 0),
                        coin: row.coin || 'USDT'
                    }));
                resolve(arbitrageInvestorData);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

function getLatestArbitrageInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const arbitrageData = currentUserData.investments.arbitrage || [];
    if (!arbitrageData.length) return null;
    
    console.log('Getting arbitrage data from user hash file');
    
    // 按日期排序并获取最新记录
    const latestRecord = arbitrageData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('Latest arbitrage record:', latestRecord);
    return latestRecord;
}

let arbitrageCoinInvestorData = [];

function loadArbitrageCoinInvestorData() {
    // 始终重新加载CSV数据
    return new Promise((resolve, reject) => {
        Papa.parse('data/arbitrage_coin_investor.csv?t=' + new Date().getTime(), {
            download: true,
            header: true,
            complete: function(results) {
                arbitrageCoinInvestorData = results.data
                    .filter(row => row.Date && row.investor && row['NAV per unit'])
                    .map(row => ({
                        date: row.Date,
                        investor: row.investor,
                        nav: parseFloat(row['NAV per unit']),
                        principal: parseFloat(row.principal || 0),
                        net_nav: parseFloat(row.net_nav || 0),
                        net_pnl: parseFloat(row.net_pnl || 0),
                        realized_pnl: parseFloat(row.realized_pnl || 0),
                        total_return: parseFloat(row.total_return || 0),
                        coin: (row.product === 'Stable-Harbor-BTC' && (!row.coin || row.coin === '')) ? 'BTC' : (row.coin || 'BTC')
                    }));
                resolve(arbitrageCoinInvestorData);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

function getLatestArbitrageCoinInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const arbitrageCoinData = currentUserData.investments.arbitrage_coin || [];
    if (!arbitrageCoinData.length) return null;
    
    console.log('Getting arbitrage coin data from user hash file');
    
    // 按日期排序并获取最新记录
    const latestRecord = arbitrageCoinData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('Latest arbitrage coin record:', latestRecord);
    return latestRecord;
}

function showInvestmentSummary() {
    console.log('Showing investment summary...');
    
    // 不再需要加载CSV文件，直接使用已加载的用户数据
    if (!currentUserData || !currentUserData.investments) {
        console.error('No user data available');
        return;
    }
    
    console.log('Using user data from hash file:', currentUserData);
    
    // 获取当前投资者的最新数据
    const balancedLatestData = getLatestBalancedInvestorData(currentUser);
    const arbitrageLatestData = getLatestArbitrageInvestorData(currentUser);
    const arbitrageCoinLatestData = getLatestArbitrageCoinInvestorData(currentUser);
    console.log('Current user:', currentUser);
    console.log('Latest balanced data for', currentUser, ':', balancedLatestData);
    console.log('Latest arbitrage data for', currentUser, ':', arbitrageLatestData);
    console.log('Latest arbitrage coin data for', currentUser, ':', arbitrageCoinLatestData);
    
    // 计算持仓天数和收益率
    let balancedHoldingDays = 0;
    let balancedReturnRate = 0;
    let balancedAnnualizedReturn = 0;
    let arbitrageHoldingDays = 0;
    let arbitrageReturnRate = 0;
    let arbitrageAnnualizedReturn = 0;
    let arbitrageCoinHoldingDays = 0;
    let arbitrageCoinReturnRate = 0;
    let arbitrageCoinAnnualizedReturn = 0;
    
    if (balancedLatestData) {
        console.log('Processing balanced data for', currentUser);
        // 获取当前投资者的所有Alpha-Bridge记录
        const balancedRecords = currentUserData.investments.balanced || [];
        // 取最新一条
        const balancedLatestData = balancedRecords.length
            ? balancedRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;
        // 取最早一条
        const balancedFirstRecord = balancedRecords.length
            ? balancedRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (balancedFirstRecord && balancedLatestData) {
            balancedHoldingDays = Math.ceil(
                (new Date(balancedLatestData.date) - new Date(balancedFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        balancedReturnRate = balancedLatestData.total_return !== undefined ? (balancedLatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        balancedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(balancedReturnRate), balancedHoldingDays);
    }

    if (arbitrageLatestData) {
        console.log('Processing arbitrage data for', currentUser);
        // 获取当前投资者的所有Stable-Harbor-USDT记录
        const arbitrageRecords = currentUserData.investments.arbitrage || [];
        // 取最新一条
        const arbitrageLatestData = arbitrageRecords.length
            ? arbitrageRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;
        // 取最早一条
        const arbitrageFirstRecord = arbitrageRecords.length
            ? arbitrageRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (arbitrageFirstRecord && arbitrageLatestData) {
            arbitrageHoldingDays = Math.ceil(
                (new Date(arbitrageLatestData.date) - new Date(arbitrageFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        arbitrageReturnRate = arbitrageLatestData.total_return !== undefined ? (arbitrageLatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        arbitrageAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageReturnRate), arbitrageHoldingDays);
    }

    if (arbitrageCoinLatestData) {
        console.log('Processing arbitrage coin data for', currentUser);
        // 获取当前投资者的所有Stable-Harbor-BTC记录
        const arbitrageCoinRecords = currentUserData.investments.arbitrage_coin || [];
        // 取最新一条
        const arbitrageCoinLatestData = arbitrageCoinRecords.length
            ? arbitrageCoinRecords.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;
        // 取最早一条
        const arbitrageCoinFirstRecord = arbitrageCoinRecords.length
            ? arbitrageCoinRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (arbitrageCoinFirstRecord && arbitrageCoinLatestData) {
            arbitrageCoinHoldingDays = Math.ceil(
                (new Date(arbitrageCoinLatestData.date) - new Date(arbitrageCoinFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        arbitrageCoinReturnRate = arbitrageCoinLatestData.total_return !== undefined ? (arbitrageCoinLatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        arbitrageCoinAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageCoinReturnRate), arbitrageCoinHoldingDays);
    }

    // 按币种分组计算总资产和收益
    const assetsByCoin = {};
    
    // 处理 Alpha-Bridge 数据
    if (balancedLatestData && balancedLatestData.principal > 0) {
        console.log('Adding balanced data to assetsByCoin');
        const coin = balancedLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += balancedLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += balancedLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += balancedLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += balancedLatestData.net_pnl;
        assetsByCoin[coin].holdingCount++;
    }

    // 处理 Stable-Harbor-USDT 数据
    if (arbitrageLatestData && arbitrageLatestData.principal > 0) {
        console.log('Adding arbitrage data to assetsByCoin');
        const coin = arbitrageLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageLatestData.net_pnl;
        assetsByCoin[coin].holdingCount++;
    }

    // 处理 Stable-Harbor-BTC 数据
    if (arbitrageCoinLatestData && arbitrageCoinLatestData.principal > 0) {
        console.log('Adding arbitrage coin data to assetsByCoin');
        const coin = arbitrageCoinLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageCoinLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageCoinLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageCoinLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageCoinLatestData.net_pnl;
        assetsByCoin[coin].holdingCount++;
    }

    console.log('Final assetsByCoin:', assetsByCoin);

    // 生成投资组合概览HTML
    let overviewHtml = '';
    if (Object.keys(assetsByCoin).length > 0) {
        // 计算总持仓数量
        const totalHoldingCount = Object.values(assetsByCoin).reduce((sum, data) => sum + data.holdingCount, 0);
        
        overviewHtml = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">投资组合概览</h5>
                    <div class="table-responsive">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td class="fw-bold">总资产</td>
                                    <td>${Object.entries(assetsByCoin).map(([coin, data]) => 
                                        `${coin} ${data.totalNetNav.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`
                                    ).join('&emsp;｜&emsp;')}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">累计收益</td>
                                    <td class="text-success">${Object.entries(assetsByCoin).map(([coin, data]) => {
                                        const total = data.realizedPnl + data.unrealizedPnl;
                                        return `+${coin} ${total.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`;
                                    }).join('&emsp;｜&emsp;')}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold" style="white-space:nowrap;">已实现收益</td>
                                    <td>${Object.entries(assetsByCoin).map(([coin, data]) => 
                                        `${coin} ${data.realizedPnl.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`
                                    ).join('&emsp;｜&emsp;')}
                                    <!-- 分红日期提示，仅特定投资人显示且只显示一次 -->
                                    ${(() => {
                                        const user = currentUser && currentUser.toLowerCase();
                                        if (["octopus", "sam", "jennifer", "alex"].includes(user)) {
                                            return '<span style="font-size:0.95em;color:#888;margin-left:8px;">（上次分红日期：2025-01-06）</span>';
                                        } else if (["bon", "ying", "tt"].includes(user)) {
                                            return '<span style="font-size:0.95em;color:#888;margin-left:8px;">（上次分红日期：2025-07-04）</span>';
                                        }
                                        return '';
                                    })()}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold" style="white-space:nowrap;">未实现收益</td>
                                    <td>${Object.entries(assetsByCoin).map(([coin, data]) => 
                                        `${coin} ${data.unrealizedPnl.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`
                                    ).join('&emsp;｜&emsp;')}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">当前持仓</td>
                                    <td>${totalHoldingCount}个组合</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } else {
        // 如果没有持仓，显示空状态
        overviewHtml = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">投资组合概览</h5>
                    <div class="table-responsive">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td class="fw-bold">总资产</td>
                                    <td>0.00</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">累计收益</td>
                                    <td>0.00 (0.00%)</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">已实现收益</td>
                                    <td>0.00</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">未实现收益</td>
                                    <td>0.00</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">当前持仓</td>
                                    <td>0个组合</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    const summaryHtml = `
        <div class="container">
            <h2 class="text-center mb-5">个人投资摘要</h2>
            <div class="row mb-4">
                <div class="col-12 text-end">
                    <button type="button" class="btn btn-primary me-2" id="currencyConversionBtn">
                        <i class="bi bi-arrow-left-right"></i> 币种转换投资
                    </button>
                    <button type="button" class="btn btn-primary" id="redemptionBtn">
                        <i class="bi bi-cash-coin"></i> 赎回
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    ${overviewHtml}
                </div>
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">收益曲线</h5>
                            <canvas id="assetAllocationChart" height="120"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title h5">投资组合明细</h3>
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>产品名称</th>
                                            <th>币种</th>
                                            <th>本金</th>
                                            <th>当前价值</th>
                                            <th>收益率</th>
                                            <th>持仓天数</th>
                                            <th>年化收益率</th>
                                            <th>数据日期</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${productData['balanced'].title}</td>
                                            <td>${balancedLatestData ? balancedLatestData.coin : 'USDT'}</td>
                                            <td>${balancedLatestData ? balancedLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${balancedLatestData ? balancedLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${balancedReturnRate ? balancedReturnRate + '%' : '0.00%'}</td>
                                            <td>${balancedHoldingDays}</td>
                                            <td>${balancedAnnualizedReturn ? balancedAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${balancedLatestData ? formatDateToYMD(balancedLatestData.date) : (arbitrageLatestData ? formatDateToYMD(arbitrageLatestData.date) : '-')}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['stable-usd'].title}</td>
                                            <td>${arbitrageLatestData ? arbitrageLatestData.coin : 'USDT'}</td>
                                            <td>${arbitrageLatestData ? arbitrageLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrageLatestData ? arbitrageLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrageReturnRate ? arbitrageReturnRate + '%' : '0.00%'}</td>
                                            <td>${arbitrageHoldingDays}</td>
                                            <td>${arbitrageAnnualizedReturn ? arbitrageAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${arbitrageLatestData ? formatDateToYMD(arbitrageLatestData.date) : (balancedLatestData ? formatDateToYMD(balancedLatestData.date) : '-')}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['stable-coin'].title}</td>
                                            <td>${arbitrageCoinLatestData ? arbitrageCoinLatestData.coin : 'BTC'}</td>
                                            <td>${arbitrageCoinLatestData ? arbitrageCoinLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageCoinLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageCoinLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrageCoinLatestData ? arbitrageCoinLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageCoinLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageCoinLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrageCoinReturnRate ? arbitrageCoinReturnRate + '%' : '0.00%'}</td>
                                            <td>${arbitrageCoinHoldingDays}</td>
                                            <td>${arbitrageCoinAnnualizedReturn ? arbitrageCoinAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${arbitrageCoinLatestData ? formatDateToYMD(arbitrageCoinLatestData.date) : (arbitrageLatestData ? formatDateToYMD(arbitrageLatestData.date) : (balancedLatestData ? formatDateToYMD(balancedLatestData.date) : '-'))}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['aggressive'].title}</td>
                                            <td>USDT</td>
                                            <td>0.00</td>
                                            <td>0.00</td>
                                            <td>0.00%</td>
                                            <td>0</td>
                                            <td>0.00%</td>
                                            <td>${balancedLatestData ? formatDateToYMD(balancedLatestData.date) : (arbitrageLatestData ? formatDateToYMD(arbitrageLatestData.date) : '-')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 更新个人投资摘要部分的内容
    const investmentSummary = document.getElementById('investment-summary');
    if (investmentSummary) {
        investmentSummary.innerHTML = summaryHtml;

        // 让资产配置卡片高度与投资组合概览一致
        setTimeout(() => {
            const leftCard = investmentSummary.querySelector('.col-md-6 .card.mb-4');
            const rightCard = investmentSummary.querySelectorAll('.col-md-6 .card.mb-4')[1];
            if (leftCard && rightCard) {
                rightCard.style.height = leftCard.offsetHeight + 'px';
            }
        }, 100);

        // 初始化资产配置图表
        const ctx = document.getElementById('assetAllocationChart');
        if (ctx) {
            console.log('Initializing return curves chart');
            
            // 工具函数：只保留每月最后一天的数据点，并转换为年月格式
            function filterToMonthEnd(data) {
                const grouped = {};
                data.forEach(item => {
                    const date = new Date(item.x);
                    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    // 如果是月末，或者是该月的最后一条记录，则保留
                    const isLastDayOfMonth = date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    if (!grouped[ym] || isLastDayOfMonth) {
                        grouped[ym] = {
                            x: ym,  // 直接使用年月格式
                            y: item.y,
                            isMonthEnd: isLastDayOfMonth // 添加月末标识
                        };
                    }
                });
                return Object.values(grouped).sort((a, b) => a.x.localeCompare(b.x));
            }

        // 绑定赎回按钮事件
        const redemptionBtn = document.getElementById('redemptionBtn');
        if (redemptionBtn) {
            redemptionBtn.addEventListener('click', showRedemptionModal);
        }

        // 绑定币种转换投资按钮事件
        const currencyConversionBtn = document.getElementById('currencyConversionBtn');
        if (currencyConversionBtn) {
            currencyConversionBtn.addEventListener('click', showCurrencyConversionModal);
        }

            // 从当前用户数据获取收益率数据
            const balancedReturns = filterToMonthEnd(
                (currentUserData?.investments?.balanced || [])
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrageReturns = filterToMonthEnd(
                (currentUserData?.investments?.arbitrage || [])
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrageCoinReturns = filterToMonthEnd(
                (currentUserData?.investments?.arbitrage_coin || [])
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            console.log('Balanced returns data:', balancedReturns);
            console.log('Arbitrage returns data:', arbitrageReturns);
            console.log('Arbitrage coin returns data:', arbitrageCoinReturns);

            // 准备图表数据
            const datasets = [];
            if (balancedReturns.length > 0) {
                // 检查最后一个点是否为月末
                const lastPointIsMonthEnd = balancedReturns[balancedReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: productData['balanced'].title,
                    data: balancedReturns,
                    borderColor: '#1a2530',
                    backgroundColor: 'rgba(26,37,48,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === balancedReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }
            if (arbitrageReturns.length > 0) {
                // 检查最后一个点是否为月末
                const lastPointIsMonthEnd = arbitrageReturns[arbitrageReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: productData['stable-usd'].title,
                    data: arbitrageReturns,
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74,144,226,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === arbitrageReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }
            if (arbitrageCoinReturns.length > 0) {
                // 检查最后一个点是否为月末
                const lastPointIsMonthEnd = arbitrageCoinReturns[arbitrageCoinReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: productData['stable-coin'].title,
                    data: arbitrageCoinReturns,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231,76,60,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === arbitrageCoinReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }

            console.log('Chart datasets:', datasets);

            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: true,
                            position: 'right',
                            align: 'center',
                            labels: {
                                boxWidth: 12,
                                padding: 15
                            },
                            onClick: function(e, legendItem, legend) {
                                const chart = legend.chart;
                                const index = legendItem.datasetIndex;
                                const meta = chart.getDatasetMeta(index);
                                // 判断当前是否所有都显示
                                const allVisible = chart.data.datasets.every((ds, i) => chart.isDatasetVisible(i));
                                if (!meta.hidden && allVisible) {
                                    // 隐藏其他所有
                                    chart.data.datasets.forEach((ds, i) => {
                                        if (i !== index) {
                                            chart.hide(i);
                                        }
                                    });
                                } else {
                                    // 全部显示
                                    chart.data.datasets.forEach((ds, i) => {
                                        chart.show(i);
                                    });
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            title: { display: false },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(2) + '%';
                                }
                            },
                            title: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
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

        // 添加个人投资摘要链接
        const investmentSummaryLink = document.createElement('li');
        investmentSummaryLink.className = 'nav-item';
        investmentSummaryLink.innerHTML = `
            <a class="nav-link" href="#investment-summary" id="investmentSummaryLink" style="display: none;">个人投资摘要</a>
        `;
        navbar.appendChild(investmentSummaryLink);
        
        // 绑定退出登录事件
        document.getElementById('logoutButton').addEventListener('click', handleLogout);

        // 绑定个人投资摘要链接点击事件
        document.getElementById('investmentSummaryLink').addEventListener('click', function(e) {
            e.preventDefault();
            const summarySection = document.getElementById('investment-summary');
            if (summarySection) {
                // 计算导航栏高度
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                // 获取目标位置
                const targetPosition = summarySection.offsetTop - navbarHeight;
                // 平滑滚动到目标位置
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

function handleLogout() {
    currentUser = null;
    
    // 隐藏导航栏中的个人投资摘要链接
    const investmentSummaryLink = document.getElementById('investmentSummaryLink');
    if (investmentSummaryLink) {
        investmentSummaryLink.style.display = 'none';
    }
    
    // 清空个人投资摘要内容
    const investmentSummary = document.getElementById('investment-summary');
    if (investmentSummary) {
        investmentSummary.innerHTML = '';
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

// 进取型FOF业绩图表逻辑
let aggressiveChart = null;
let aggressiveData = [];
let aggressiveDataLoaded = false;

function renderAggressiveChart(rangeDays = 30) {
    if (!aggressiveData.length) return;
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = aggressiveData;
    } else {
        const days = parseInt(rangeDays);
        dataSlice = aggressiveData.slice(-days);
    }
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const ctx = document.getElementById('aggressiveChart').getContext('2d');
    if (aggressiveChart) aggressiveChart.destroy();
    aggressiveChart = new Chart(ctx, {
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
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
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
    const facts = productData['aggressive'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';  // 最大回撤
    facts[4].value = sharpe ? sharpe : '';  // Sharpe比率
    facts[6].value = returnRate ? returnRate + '%' : '';  // 区间收益率
    facts[7].value = annualized ? annualized + '%' : '';  // 预计年化收益率

    // 更新表格内容
    const factsHtml = renderFactsTable(facts);
    const factsContainer = document.querySelector('#product-performance-content .container');
    if (factsContainer) {
        factsContainer.outerHTML = factsHtml;
    }
}

function showAggressiveChartUI() {
    document.getElementById('aggressive-chart-controls').style.display = '';
    document.getElementById('aggressive-chart-container').style.display = '';
    document.getElementById('aggressiveChart').height = 320;
}

function hideAggressiveChartUI() {
    const controls = document.getElementById('aggressive-chart-controls');
    const container = document.getElementById('aggressive-chart-container');
    if (controls) controls.style.display = 'none';
    if (container) container.style.display = 'none';
}

function bindAggressiveChartControls() {
    const chartControls = document.getElementById('aggressive-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function() {
                const range = this.getAttribute('data-range');
                // 移除所有按钮的active类
                chartControls.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                // 为当前点击的按钮添加active类
                this.classList.add('active');
                // 渲染图表
                renderAggressiveChart(range);
            });
        });
    }
}

function loadAggressiveCSVAndDraw(rangeDays = 30, callback) {
    Papa.parse('data/growth.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            aggressiveData = results.data
                .filter(row => row.Date && row['NAV per unit'])
                .map(row => ({
                    date: row.Date,
                    nav: parseFloat(row['NAV per unit'])
                }));
            aggressiveDataLoaded = true;
            renderAggressiveChart(rangeDays);
            if (callback) callback();
        }
    });
}

function showAggressiveProductSection(rangeDays = 30) {
    if (perfContent && productData['aggressive']) {
        perfContent.innerHTML = `
            <h3>${productData['aggressive'].title} <span style="font-size:1.1rem;color:#666;">（待上线）</span></h3>
            <p>${productData['aggressive'].desc}</p>
            ${renderFactsTable(productData['aggressive'].facts)}
            <div id="aggressive-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm active" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="aggressive-chart-container">
                <canvas id="aggressiveChart" height="320"></canvas>
            </div>
        `;
        
        showAggressiveChartUI();
        loadAggressiveCSVAndDraw(rangeDays, () => {
            bindAggressiveChartControls();
        });
    }
}

// 日期格式化函数
function formatDateToYMD(dateStr) {
    if (!dateStr) return '-';
    // 支持2025/6/11或2025-06-11等格式
    const d = new Date(dateStr.replace(/\//g, '-'));
    if (isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// 赎回功能相关函数
function showRedemptionModal() {
    // 重置表单
    document.getElementById('redemptionForm').reset();
    
    // 清空最大可赎回金额显示
    document.getElementById('maxRedemptionText').textContent = '';
    
    // 显示弹窗
    const modal = new bootstrap.Modal(document.getElementById('redemptionModal'));
    modal.show();
}

function updateMaxRedemptionAmount() {
    const product = document.getElementById('productSelect').value;
    const currency = document.getElementById('redemptionCurrency').value;
    const maxRedemptionText = document.getElementById('maxRedemptionText');
    
    if (!product || !currency || !currentUserData || !currentUserData.investments) {
        maxRedemptionText.textContent = '';
        return;
    }
    
    let maxAmount = 0;
    const investments = currentUserData.investments;
    
    // 根据产品和币种获取当前价值
    if (product === 'balanced') {
        if (investments.balanced && investments.balanced.length > 0) {
            const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestBalanced && latestBalanced.coin === currency) {
                maxAmount = latestBalanced.net_nav || 0;
            }
        }
    } else if (product === 'stable-usd') {
        if (investments.arbitrage && investments.arbitrage.length > 0) {
            const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage && latestArbitrage.coin === currency) {
                maxAmount = latestArbitrage.net_nav || 0;
            }
        }
    } else if (product === 'stable-coin') {
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                maxAmount = latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (product === 'aggressive') {
        // 进取系列暂时没有数据，设为0
        maxAmount = 0;
    }
    
    // 显示最大可赎回金额
    if (maxAmount > 0) {
        const formattedAmount = maxAmount.toLocaleString('zh-CN', {
            minimumFractionDigits: currency === 'BTC' ? 4 : 2,
            maximumFractionDigits: currency === 'BTC' ? 4 : 2
        });
        maxRedemptionText.textContent = `（最大可赎回金额为：${formattedAmount} ${currency}）`;
    } else {
        maxRedemptionText.textContent = `（当前产品无${currency}持仓）`;
    }
}

function setMaxRedemptionAmount() {
    const product = document.getElementById('productSelect').value;
    const currency = document.getElementById('redemptionCurrency').value;
    
    if (!product || !currency || !currentUserData || !currentUserData.investments) {
        return;
    }
    
    let maxAmount = 0;
    const investments = currentUserData.investments;
    
    // 根据产品和币种获取当前价值
    if (product === 'balanced') {
        if (investments.balanced && investments.balanced.length > 0) {
            const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestBalanced && latestBalanced.coin === currency) {
                maxAmount = latestBalanced.net_nav || 0;
            }
        }
    } else if (product === 'stable-usd') {
        if (investments.arbitrage && investments.arbitrage.length > 0) {
            const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage && latestArbitrage.coin === currency) {
                maxAmount = latestArbitrage.net_nav || 0;
            }
        }
    } else if (product === 'stable-coin') {
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                maxAmount = latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (product === 'aggressive') {
        // 进取系列暂时没有数据，设为0
        maxAmount = 0;
    }
    
    // 设置赎回金额为最大值
    if (maxAmount > 0) {
        // 根据币种设置不同的小数位数
        const formattedAmount = maxAmount.toFixed(currency === 'BTC' ? 4 : 2);
        document.getElementById('redemptionAmount').value = formattedAmount;
    }
}

function handleRedemptionSubmit() {
    const form = document.getElementById('redemptionForm');
    const formData = new FormData(form);
    
    // 获取表单数据
    const product = document.getElementById('productSelect').value;
    const currency = document.getElementById('redemptionCurrency').value;
    const amount = parseFloat(document.getElementById('redemptionAmount').value) || 0;
    
    // 验证表单
    if (!product || !currency || amount <= 0) {
        alert('请填写所有必填字段，且赎回金额必须大于0');
        return;
    }
    
    // 验证赎回金额是否超过当前持仓
    let maxAmount = 0;
    if (currentUserData && currentUserData.investments) {
        const investments = currentUserData.investments;
        
        // 根据产品和币种获取当前价值
        if (product === 'balanced') {
            if (investments.balanced && investments.balanced.length > 0) {
                const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                if (latestBalanced && latestBalanced.coin === currency) {
                    maxAmount = latestBalanced.net_nav || 0;
                }
            }
        } else if (product === 'stable-usd') {
            if (investments.arbitrage && investments.arbitrage.length > 0) {
                const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                if (latestArbitrage && latestArbitrage.coin === currency) {
                    maxAmount = latestArbitrage.net_nav || 0;
                }
            }
        } else if (product === 'stable-coin') {
            if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
                const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                    maxAmount = latestArbitrageCoin.net_nav || 0;
                }
            }
        } else if (product === 'aggressive') {
            // 进取系列暂时没有数据，设为0
            maxAmount = 0;
        }
    }
    
    // 检查赎回金额是否超过最大可赎回金额
    if (amount > maxAmount) {
        const formattedMaxAmount = maxAmount.toLocaleString('zh-CN', {
            minimumFractionDigits: currency === 'BTC' ? 4 : 2,
            maximumFractionDigits: currency === 'BTC' ? 4 : 2
        });
        alert(`超出最大可赎回金额，无法提交。\n当前持仓：${formattedMaxAmount} ${currency}\n赎回金额：${amount.toLocaleString('zh-CN', {
            minimumFractionDigits: currency === 'BTC' ? 4 : 2,
            maximumFractionDigits: currency === 'BTC' ? 4 : 2
        })} ${currency}`);
        return;
    }
    
    // 获取产品名称
    const productNames = {
        'balanced': 'Alpha-Bridge',
        'stable-usd': 'Stable-Harbor-USDT',
        'stable-coin': 'Stable-Harbor-BTC',
        'aggressive': 'Deep-Growth'
    };
    
    // 发送邮件通知
    const templateParams = {
        user_id: currentUser || '未知用户',
        product_name: productNames[product] || product,
        currency: currency,
        amount: amount.toLocaleString('zh-CN', {
            minimumFractionDigits: currency === 'BTC' ? 4 : 2,
            maximumFractionDigits: currency === 'BTC' ? 4 : 2
        }),
        timestamp: new Date().toLocaleString('zh-CN')
    };
    
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.redemptionTemplateId, templateParams)
        .then(function(response) {
            console.log('赎回申请邮件发送成功:', response);
            alert('赎回申请已提交，我们会尽快处理您的请求。');
            
            // 关闭弹窗
            const modal = bootstrap.Modal.getInstance(document.getElementById('redemptionModal'));
            modal.hide();
        }, function(error) {
            console.error('赎回申请邮件发送失败:', error);
            alert('赎回申请已提交，但邮件通知发送失败。我们会尽快处理您的请求。');
            
            // 关闭弹窗
            const modal = bootstrap.Modal.getInstance(document.getElementById('redemptionModal'));
            modal.hide();
        });
}

// 币种转换投资相关函数
function showCurrencyConversionModal() {
    // 重置表单
    document.getElementById('currencyConversionForm').reset();
    
    // 更新当前持有金额
    updateCurrentAmounts();
    
    // 初始化转换行
    initializeConversionRows();
    
    // 显示弹窗
    const modal = new bootstrap.Modal(document.getElementById('currencyConversionModal'));
    modal.show();
}

function updateCurrentAmounts() {
    if (!currentUserData || !currentUserData.investments) {
        return;
    }
    
    const investments = currentUserData.investments;
    let usdtAmount = 0;
    let btcAmount = 0;
    let ethAmount = 0;
    
    // 计算USDT总持仓
    if (investments.balanced && investments.balanced.length > 0) {
        const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestBalanced && latestBalanced.coin === 'USDT') {
            usdtAmount += latestBalanced.net_nav || 0;
        }
    }
    if (investments.arbitrage && investments.arbitrage.length > 0) {
        const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestArbitrage && latestArbitrage.coin === 'USDT') {
            usdtAmount += latestArbitrage.net_nav || 0;
        }
    }
    
    // 计算BTC总持仓
    if (investments.balanced && investments.balanced.length > 0) {
        const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestBalanced && latestBalanced.coin === 'BTC') {
            btcAmount += latestBalanced.net_nav || 0;
        }
    }
    if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
        const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestArbitrageCoin && latestArbitrageCoin.coin === 'BTC') {
            btcAmount += latestArbitrageCoin.net_nav || 0;
        }
    }
    
    // 计算ETH总持仓
    if (investments.balanced && investments.balanced.length > 0) {
        const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestBalanced && latestBalanced.coin === 'ETH') {
            ethAmount += latestBalanced.net_nav || 0;
        }
    }
    if (investments.arbitrage && investments.arbitrage.length > 0) {
        const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestArbitrage && latestArbitrage.coin === 'ETH') {
            ethAmount += latestArbitrage.net_nav || 0;
        }
    }
    if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
        const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestArbitrageCoin && latestArbitrageCoin.coin === 'ETH') {
            ethAmount += latestArbitrageCoin.net_nav || 0;
        }
    }
    
    // 更新表格中的金额显示
    document.getElementById('usdtAmount').textContent = usdtAmount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    document.getElementById('btcAmount').textContent = btcAmount.toLocaleString('zh-CN', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
    document.getElementById('ethAmount').textContent = ethAmount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function initializeConversionRows() {
    const conversionRows = document.getElementById('conversionRows');
    conversionRows.innerHTML = '';
    
    // 添加第一行转换记录
    addConversionRow();
    
    // 启用添加按钮
    document.getElementById('addConversionRow').disabled = false;
}

function addConversionRow() {
    const conversionRows = document.getElementById('conversionRows');
    const rowCount = conversionRows.children.length;
    
    if (rowCount >= 2) {
        alert('最多只能添加两行转换记录');
        return;
    }
    
    const rowId = `conversion-row-${rowCount + 1}`;
    const rowHtml = `
        <div class="row mb-3" id="${rowId}">
            <div class="col-md-3">
                <label class="form-label">出售币种 <span class="text-danger">*</span></label>
                <select class="form-select" id="sellCurrency-${rowCount + 1}" style="height: 38px;">
                    <option value="">请选择</option>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">出售数量 <span class="text-danger">*</span></label>
                <div class="input-group">
                    <input type="number" class="form-control" id="sellAmount-${rowCount + 1}" placeholder="0.00" step="0.0001" min="0" style="height: 38px;">
                    <button type="button" class="btn btn-outline-secondary" onclick="setMaxSellAmount('${rowCount + 1}')" style="height: 38px;">全部</button>
                </div>
            </div>
            <div class="col-md-3">
                <label class="form-label">买入币种 <span class="text-danger">*</span></label>
                <select class="form-select" id="buyCurrency-${rowCount + 1}" style="height: 38px;">
                    <option value="">请选择</option>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">限价</label>
                <input type="number" class="form-control" id="priceLimit-${rowCount + 1}" placeholder="0.00" step="0.0001" min="0" style="height: 38px;">
            </div>
            <div class="col-md-1 d-flex align-items-center">
                ${rowCount > 0 ? `<button type="button" class="btn btn-outline-danger btn-sm" onclick="removeConversionRow('${rowId}')" style="height: 30px; width: 30px; padding: 0; border-radius: 50%; margin-top: 24px;">
                    <span style="font-size: 16px; font-weight: bold;">−</span>
                </button>` : ''}
            </div>
        </div>
    `;
    
    conversionRows.insertAdjacentHTML('beforeend', rowHtml);
    
    // 更新添加按钮状态
    if (rowCount + 1 >= 2) {
        document.getElementById('addConversionRow').disabled = true;
    }
}

function removeConversionRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        
        // 重新启用添加按钮
        document.getElementById('addConversionRow').disabled = false;
    }
}

function setMaxSellAmount(rowIndex) {
    const sellCurrencySelect = document.getElementById(`sellCurrency-${rowIndex}`);
    const sellAmountInput = document.getElementById(`sellAmount-${rowIndex}`);
    
    if (!sellCurrencySelect.value) {
        alert('请先选择出售币种');
        return;
    }
    
    const currency = sellCurrencySelect.value;
    const currentAmount = getCurrentCurrencyAmount(currency);
    
    if (currentAmount <= 0) {
        alert(`${currency}当前持仓为0，无法出售`);
        return;
    }
    
    // 格式化金额并填入输入框
    const formattedAmount = currentAmount.toFixed(currency === 'BTC' ? 4 : 2);
    sellAmountInput.value = formattedAmount;
}



function handleCurrencyConversionSubmit() {
    const conversionRows = document.getElementById('conversionRows');
    const rows = conversionRows.children;
    
    if (rows.length === 0) {
        alert('请至少添加一行转换记录');
        return;
    }
    
    const conversions = [];
    let hasValidConversion = false;
    
    // 收集所有转换记录
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowIndex = i + 1;
        
        const sellCurrency = document.getElementById(`sellCurrency-${rowIndex}`).value;
        const sellAmount = parseFloat(document.getElementById(`sellAmount-${rowIndex}`).value) || 0;
        const buyCurrency = document.getElementById(`buyCurrency-${rowIndex}`).value;
        const priceLimit = parseFloat(document.getElementById(`priceLimit-${rowIndex}`).value) || 0;
        
        // 检查是否有有效数据
        if (sellCurrency && sellAmount > 0 && buyCurrency) {
            hasValidConversion = true;
            conversions.push({
                sellCurrency: sellCurrency,
                sellAmount: sellAmount,
                buyCurrency: buyCurrency,
                priceLimit: priceLimit
            });
        }
    }
    
    if (!hasValidConversion) {
        alert('请至少填写一行完整的转换记录（出售币种、出售数量、买入币种）');
        return;
    }
    
    // 验证出售币种不能与买入币种相同
    for (const conversion of conversions) {
        if (conversion.sellCurrency === conversion.buyCurrency) {
            alert('出售币种不能与买入币种相同');
            return;
        }
    }
    
    // 验证出售数量不超过当前持仓（同一币种需要加总验证）
    const sellCurrencyTotals = {};
    
    // 计算每个币种的总出售数量
    for (const conversion of conversions) {
        if (!sellCurrencyTotals[conversion.sellCurrency]) {
            sellCurrencyTotals[conversion.sellCurrency] = 0;
        }
        sellCurrencyTotals[conversion.sellCurrency] += conversion.sellAmount;
    }
    
    // 验证每个币种的总出售数量是否超过当前持仓
    for (const [currency, totalSellAmount] of Object.entries(sellCurrencyTotals)) {
        const currentAmount = getCurrentCurrencyAmount(currency);
        if (totalSellAmount > currentAmount) {
            alert(`${currency}总出售数量超过当前持仓。\n当前持仓：${currentAmount.toLocaleString('zh-CN', {
                minimumFractionDigits: currency === 'BTC' ? 4 : 2,
                maximumFractionDigits: currency === 'BTC' ? 4 : 2
            })} ${currency}\n总出售数量：${totalSellAmount.toLocaleString('zh-CN', {
                minimumFractionDigits: currency === 'BTC' ? 4 : 2,
                maximumFractionDigits: currency === 'BTC' ? 4 : 2
            })} ${currency}`);
            return;
        }
    }
    
    // 格式化转换详情
    const conversionDetails = conversions.map((conv, index) => {
        return `${index + 1}. 出售 ${conv.sellAmount.toLocaleString('zh-CN', {
            minimumFractionDigits: conv.sellCurrency === 'BTC' ? 4 : 2,
            maximumFractionDigits: conv.sellCurrency === 'BTC' ? 4 : 2
        })} ${conv.sellCurrency}，买入 ${conv.buyCurrency}${conv.priceLimit > 0 ? `，价格限额：${conv.priceLimit}` : ''}`;
    }).join('\n');
    
    // 发送邮件通知
    const templateParams = {
        user_id: currentUser || '未知用户',
        conversion_details: conversionDetails,
        timestamp: new Date().toLocaleString('zh-CN')
    };
    
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.conversionTemplateId, templateParams)
        .then(function(response) {
            console.log('币种转换申请邮件发送成功:', response);
            alert('币种转换投资申请已提交，我们会尽快处理您的请求。');
            
            // 关闭弹窗
            const modal = bootstrap.Modal.getInstance(document.getElementById('currencyConversionModal'));
            modal.hide();
        }, function(error) {
            console.error('币种转换申请邮件发送失败:', error);
            alert('币种转换投资申请已提交，但邮件通知发送失败。我们会尽快处理您的请求。');
            
            // 关闭弹窗
            const modal = bootstrap.Modal.getInstance(document.getElementById('currencyConversionModal'));
            modal.hide();
        });
}

function getCurrentCurrencyAmount(currency) {
    if (!currentUserData || !currentUserData.investments) {
        return 0;
    }
    
    const investments = currentUserData.investments;
    let amount = 0;
    
    if (currency === 'USDT') {
        if (investments.balanced && investments.balanced.length > 0) {
            const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestBalanced && latestBalanced.coin === 'USDT') {
                amount += latestBalanced.net_nav || 0;
            }
        }
        if (investments.arbitrage && investments.arbitrage.length > 0) {
            const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage && latestArbitrage.coin === 'USDT') {
                amount += latestArbitrage.net_nav || 0;
            }
        }
    } else if (currency === 'BTC') {
        if (investments.balanced && investments.balanced.length > 0) {
            const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestBalanced && latestBalanced.coin === 'BTC') {
                amount += latestBalanced.net_nav || 0;
            }
        }
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === 'BTC') {
                amount += latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (currency === 'ETH') {
        // 计算ETH总持仓
        if (investments.balanced && investments.balanced.length > 0) {
            const latestBalanced = investments.balanced.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestBalanced && latestBalanced.coin === 'ETH') {
                amount += latestBalanced.net_nav || 0;
            }
        }
        if (investments.arbitrage && investments.arbitrage.length > 0) {
            const latestArbitrage = investments.arbitrage.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage && latestArbitrage.coin === 'ETH') {
                amount += latestArbitrage.net_nav || 0;
            }
        }
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === 'ETH') {
                amount += latestArbitrageCoin.net_nav || 0;
            }
        }
    }
    
    return amount;
}

// 在页面加载完成后绑定赎回相关事件
document.addEventListener('DOMContentLoaded', function() {
    // 绑定提交按钮事件
    const submitBtn = document.getElementById('submitRedemption');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleRedemptionSubmit);
    }

    // 绑定赎回相关事件
    const productSelect = document.getElementById('productSelect');
    const redemptionCurrency = document.getElementById('redemptionCurrency');
    const maxRedemptionBtn = document.getElementById('maxRedemptionBtn');
    
    if (productSelect) {
        productSelect.addEventListener('change', updateMaxRedemptionAmount);
    }
    if (redemptionCurrency) {
        redemptionCurrency.addEventListener('change', updateMaxRedemptionAmount);
    }
    if (maxRedemptionBtn) {
        maxRedemptionBtn.addEventListener('click', setMaxRedemptionAmount);
    }

    // 绑定币种转换投资相关事件
    const submitConversionBtn = document.getElementById('submitConversion');
    if (submitConversionBtn) {
        submitConversionBtn.addEventListener('click', handleCurrencyConversionSubmit);
    }

    // 绑定币种转换投资表单事件
    const addConversionRowBtn = document.getElementById('addConversionRow');
    
    if (addConversionRowBtn) {
        addConversionRowBtn.addEventListener('click', addConversionRow);
    }
});

// 密码修改功能已移除 - 现在使用邀请链接方式