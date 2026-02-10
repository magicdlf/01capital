// 数据源配置
const DATA_BASE_URL = 'https://data.01capital.info/arbcus';

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
    'stable-usd-2': {
        title: 'Stable-Harbor-USDT 2.0',
        desc: '以U本位计价，专注于低风险套利策略，追求稳定收益，严格控制回撤。',
        facts: [
            { label: '成立时间', value: '2026/1/29' },
            { label: '策略成分', value: '套利' },
            { label: '最大回撤', value: '' },
            { label: '实际杠杆', value: '1.5X' },
            { label: 'Sharpe比率', value: '' },
            { label: '杠杆限额', value: '5X' },
            { label: '区间收益率', value: '' },
            { label: '预计年化收益率', value: '' }
        ],
        alt: '稳健系列-U本位2.0业绩'
    },
    'stable-coin-btc': {
        title: 'Stable-Harbor-BTC',
        desc: '以BTC本位计价，专注于低风险套利策略，追求稳定收益，严格控制回撤。',
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
        alt: '稳健系列-BTC本位业绩'
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
            { label: '成立时间', value: '2026/1/15' },
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
            
            // 处理稳健系列-U本位的特殊情况
            if (key === 'stable-usd') {
                // 切换子选项的显示状态
                const subOptions = document.querySelector('.stable-usd-sub-options');
                if (subOptions) {
                    subOptions.style.display = subOptions.style.display === 'none' ? 'block' : 'none';
                }
                // 移除所有按钮的active类
                productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                // 为稳健系列-U本位按钮添加active类
                e.target.classList.add('active');
                return; // 不改变右侧内容
            }
            
            // 处理稳健系列-币本位的特殊情况
            if (key === 'stable-coin') {
                // 切换子选项的显示状态
                const subOptions = document.querySelector('.stable-coin-sub-options');
                if (subOptions) {
                    subOptions.style.display = subOptions.style.display === 'none' ? 'block' : 'none';
                }
                // 移除所有按钮的active类
                productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                // 为稳健系列-币本位按钮添加active类
                e.target.classList.add('active');
                return; // 不改变右侧内容
            }
            
            // 处理其他产品选项
            if (key === 'balanced') {
                setTimeout(() => {
                    showBalancedProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'stable-usd-1') {
                setTimeout(() => {
                    showStableUsdProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'stable-usd-2') {
                setTimeout(() => {
                    showStableUsd2ProductSection('all'); // 默认显示成立以来
                }, 100);
            } else if (key === 'stable-coin-btc') {
                setTimeout(() => {
                    showStableCoinBtcProductSection('all'); // 默认显示成立以来
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

function loadBalancedCSVAndDraw(rangeDays = 30, callback) {
    Papa.parse(DATA_BASE_URL + '/balanced.csv?t=' + new Date().getTime(), {
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
        },
        error: function(error) {
            console.error('加载CSV文件失败:', error);
            if (error.message && error.message.includes('CORS')) {
                console.error('CORS错误：请确保服务器已正确配置CORS，或尝试清除浏览器缓存后刷新页面');
            }
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

// 稳健系列-BTC本位业绩图表逻辑
let stableCoinBtcChart = null;
let stableCoinBtcData = [];
let stableCoinBtcDataLoaded = false;

function loadStableCoinBtcCSVAndDraw(rangeDays = 30, callback) {
    Papa.parse(DATA_BASE_URL + '/arbitrage_coin.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            stableCoinBtcData = results.data
                .filter(row => row.Date && row['NAV per unit'])
                .map(row => ({
                    date: row.Date,
                    nav: parseFloat(row['NAV per unit'])
                }));
            stableCoinBtcDataLoaded = true;
            renderStableCoinBtcChart(rangeDays);
            if (callback) callback();
        }
    });
}

function renderStableCoinBtcChart(rangeDays = 30) {
    if (!stableCoinBtcData.length) return;
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = stableCoinBtcData;
    } else {
        dataSlice = stableCoinBtcData.slice(-rangeDays);
    }

    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const ctx = document.getElementById('stableCoinBtcChart').getContext('2d');
    if (stableCoinBtcChart) stableCoinBtcChart.destroy();
    stableCoinBtcChart = new Chart(ctx, {
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
    const facts = productData['stable-coin-btc'].facts;
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

function showStableCoinBtcProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable-coin-btc']) {
        perfContent.innerHTML = `
            <h3>${productData['stable-coin-btc'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['stable-coin-btc'].desc}</p>
            ${renderFactsTable(productData['stable-coin-btc'].facts)}
            <div id="stable-coin-btc-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="stable-coin-btc-chart-container">
                <canvas id="stableCoinBtcChart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showStableCoinBtcChartUI();
    // 3. 渲染图表
    loadStableCoinBtcCSVAndDraw(rangeDays, bindStableCoinBtcChartControls);
    // 4. 设置对应按钮的高亮状态
    const chartControls = document.getElementById('stable-coin-btc-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = chartControls.querySelector(`button[data-range="${rangeDays}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

function showStableCoinBtcChartUI() {
    const container = document.getElementById('stable-coin-btc-chart-container');
    if (container) container.style.display = 'block';
}

function bindStableCoinBtcChartControls() {
    const controls = document.getElementById('stable-coin-btc-chart-controls');
    if (controls) {
        controls.addEventListener('click', function(e) {
            if (e.target.matches('button[data-range]')) {
                const range = e.target.getAttribute('data-range');
                renderStableCoinBtcChart(range);
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

// 添加稳健系列-U本位2.0业绩图表逻辑
let stableUsd2Chart = null;
let stableUsd2Data = [];
let stableUsd2DataLoaded = false;

function loadStableUsdCSVAndDraw(rangeDays = 30, callback) {
    Papa.parse(DATA_BASE_URL + '/arbitrage.csv?t=' + new Date().getTime(), {
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
            <h3>${productData['stable-usd'].title} <span style="font-size:1.1rem;color:#666;">（已暂停）</span></h3>
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

// 稳健系列-U本位2.0业绩图表逻辑
function loadStableUsd2CSVAndDraw(rangeDays = 30, callback) {
    Papa.parse(DATA_BASE_URL + '/arbitrage2.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            if (results.errors && results.errors.length > 0) {
                console.error('CSV解析错误:', results.errors);
            }
            console.log('CSV解析结果:', results);
            stableUsd2Data = results.data
                .filter(row => row && row.Date && row['NAV per unit'] && !isNaN(parseFloat(row['NAV per unit'])))
                .map(row => ({
                    date: row.Date,
                    nav: parseFloat(row['NAV per unit'])
                }));
            console.log('Stable USD 2.0 数据加载完成，数据点数量:', stableUsd2Data.length);
            if (stableUsd2Data.length > 0) {
                console.log('前5条数据:', stableUsd2Data.slice(0, 5));
            }
            stableUsd2DataLoaded = true;
            renderStableUsd2Chart(rangeDays);
            if (callback) callback();
        },
        error: function(error) {
            console.error('加载arbitrage2.csv失败:', error);
        }
    });
}

function renderStableUsd2Chart(rangeDays = 30) {
    if (!stableUsd2Data || !stableUsd2Data.length) {
        console.warn('Stable USD 2.0 数据为空，无法渲染图表');
        return;
    }
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = stableUsd2Data;
    } else {
        dataSlice = stableUsd2Data.slice(-rangeDays);
    }
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const chartElement = document.getElementById('stableUsd2Chart');
    if (!chartElement) {
        console.error('找不到stableUsd2Chart元素');
        return;
    }
    const ctx = chartElement.getContext('2d');
    if (stableUsd2Chart) stableUsd2Chart.destroy();
    stableUsd2Chart = new Chart(ctx, {
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
    const facts = productData['stable-usd-2'].facts;
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

function showStableUsd2ProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable-usd-2']) {
        perfContent.innerHTML = `
            <h3>${productData['stable-usd-2'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
            <p>${productData['stable-usd-2'].desc}</p>
            ${renderFactsTable(productData['stable-usd-2'].facts)}
            <div id="stable-usd-2-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="180">近6个月</button>
                <button class="btn btn-outline-dark btn-sm" data-range="all">成立以来</button>
            </div>
            <div class="performance-chart mb-3" id="stable-usd-2-chart-container">
                <canvas id="stableUsd2Chart" height="320"></canvas>
            </div>
        `;
    }
    // 2. 显示图表UI
    showStableUsd2ChartUI();
    // 3. 等待DOM更新后渲染图表
    setTimeout(() => {
        loadStableUsd2CSVAndDraw(rangeDays, bindStableUsd2ChartControls);
    }, 100);
    // 4. 设置对应按钮的高亮状态
    const chartControls = document.getElementById('stable-usd-2-chart-controls');
    if (chartControls) {
        chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = chartControls.querySelector(`button[data-range="${rangeDays}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

function showStableUsd2ChartUI() {
    const container = document.getElementById('stable-usd-2-chart-container');
    if (container) container.style.display = 'block';
}

function bindStableUsd2ChartControls() {
    const controls = document.getElementById('stable-usd-2-chart-controls');
    if (controls) {
        controls.addEventListener('click', function(e) {
            if (e.target.matches('button[data-range]')) {
                const range = e.target.getAttribute('data-range');
                renderStableUsd2Chart(range);
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
            left += `<tr><td class="fw-bold facts-label">${facts[i].label}</td><td>${facts[i].value}</td></tr>`;
        } else {
            right += `<tr><td class="fw-bold facts-label">${facts[i].label}</td><td>${facts[i].value}</td></tr>`;
        }
    }
    return `
    <div class="container mb-3">
      <div class="row">
        <div class="col-12 col-md-6">
          <table class="table table-borderless mb-0">
            <tbody>${left}</tbody>
          </table>
        </div>
        <div class="col-12 col-md-6">
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
        const userDataUrl = DATA_BASE_URL + '/' + hashFilename + '?t=' + new Date().getTime();
        let response = null;
        try {
            // 明确指定 CORS 模式，确保跨域请求正常工作
            response = await fetch(userDataUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit', // 不需要发送 cookies
                headers: {
                    'Accept': 'application/json'
                }
            });
        } catch (fetchError) {
            // 在某些环境（例如 file:// 直接打开页面）下，请求不存在的文件可能会触发 fetch reject
            // 这里将其视为"登录失败"，而不是"系统异常"，避免密码输错时出现误导文案
            console.warn('Fetch user data failed:', fetchError);
            if (fetchError.message && fetchError.message.includes('CORS')) {
                errorElement.textContent = '跨域请求失败，请检查服务器CORS配置';
                errorElement.classList.remove('d-none');
            }
        }
        
        if (response && response.ok) {
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
            console.log('Login failed - user data not found or not accessible', response ? response.status : 'fetch_error');
            errorElement.textContent = '用户名或密码错误';
            errorElement.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Login error:', error);
        // 这里是“真正的异常”：加密能力不可用、运行环境不支持等
        // 给出更明确的提示，避免用户以为是密码问题
        let message = '登录过程中发生错误，请稍后重试';
        if (typeof crypto === 'undefined' || !crypto.subtle) {
            message = '当前环境不支持安全登录，请使用现代浏览器，并通过 http://localhost:8000 方式访问（不要直接打开 file:// 页面）';
        }
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
}

function calculateAnnualizedReturnFromDays(returnRate, days) {
    if (!days || days <= 0) return 0;
    // 年化收益率 = (1 + 收益率)^(365/持仓天数) - 1
    return ((Math.pow(1 + returnRate/100, 365/days) - 1) * 100).toFixed(2);
}

function getLatestBalancedInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const balancedData = currentUserData.investments.balanced || [];
    if (!balancedData.length) return null;
    
    // 筛选本金>1的记录（已赎回的用户不显示后续数据），按日期排序并获取最新记录
    const filteredData = balancedData.filter(record => (record.principal || 0) > 1);
    if (!filteredData.length) return null;
    
    return filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

function getLatestArbitrageInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const arbitrageData = currentUserData.investments.arbitrage || [];
    if (!arbitrageData.length) return null;
    
    console.log('Getting arbitrage data from user hash file');
    
    // 筛选本金>1的记录（已赎回的用户不显示后续数据），按日期排序并获取最新记录
    const filteredData = arbitrageData.filter(record => (record.principal || 0) > 1);
    if (!filteredData.length) return null;
    
    const latestRecord = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('Latest arbitrage record:', latestRecord);
    return latestRecord;
}

function getLatestArbitrage2InvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const arbitrage2Data = currentUserData.investments.arbitrage2 || [];
    if (!arbitrage2Data.length) return null;
    
    console.log('Getting arbitrage2 data from user hash file');
    
    // 筛选本金>1的记录（已赎回的用户不显示后续数据），按日期排序并获取最新记录
    const filteredData = arbitrage2Data.filter(record => (record.principal || 0) > 1);
    if (!filteredData.length) return null;
    
    const latestRecord = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('Latest arbitrage2 record:', latestRecord);
    return latestRecord;
}

function getLatestArbitrageCoinInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    const arbitrageCoinData = currentUserData.investments.arbitrage_coin || [];
    if (!arbitrageCoinData.length) return null;
    
    console.log('Getting arbitrage coin data from user hash file');
    
    // 筛选本金>1的记录（已赎回的用户不显示后续数据），按日期排序并获取最新记录
    const filteredData = arbitrageCoinData.filter(record => (record.principal || 0) > 1);
    if (!filteredData.length) return null;
    
    const latestRecord = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('Latest arbitrage coin record:', latestRecord);
    return latestRecord;
}

function getLatestGrowthInvestorData(investor) {
    if (!currentUserData || !currentUserData.investments) return null;
    
    // 注意：用户JSON里用 investments.growth 存储 Deep-Growth（进取系列）的数据
    const growthData = currentUserData.investments.growth || [];
    if (!growthData.length) return null;
    
    // 筛选本金>1的记录（已赎回的用户不显示后续数据），按日期排序并获取最新记录
    const filteredData = growthData.filter(record => (record.principal || 0) > 1);
    if (!filteredData.length) return null;
    
    return filteredData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

async function showInvestmentSummary() {
    console.log('Showing investment summary...');
    
    // 每次显示持仓时都重新加载数据，确保数据是最新的
    if (currentUserHashFile) {
        try {
            const userDataUrl = DATA_BASE_URL + '/' + currentUserHashFile + '?t=' + new Date().getTime();
            const response = await fetch(userDataUrl, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response && response.ok) {
                currentUserData = await response.json();
                console.log('User data refreshed from server:', currentUserData);
            } else {
                console.warn('Failed to refresh user data, using cached data');
            }
        } catch (error) {
            console.warn('Error refreshing user data, using cached data:', error);
        }
    }
    
    // 检查用户数据是否可用
    if (!currentUserData || !currentUserData.investments) {
        console.error('No user data available');
        return;
    }
    
    console.log('Using user data from hash file:', currentUserData);
    
    // 获取当前投资者的最新数据
    const balancedLatestData = getLatestBalancedInvestorData(currentUser);
    const arbitrageLatestData = getLatestArbitrageInvestorData(currentUser);
    const arbitrage2LatestData = getLatestArbitrage2InvestorData(currentUser);
    const arbitrageCoinLatestData = getLatestArbitrageCoinInvestorData(currentUser);
    const growthLatestData = getLatestGrowthInvestorData(currentUser);
    
    // 分别获取BTC和ETH的最新数据（筛选本金>1的记录，用于收益曲线和统计）
    let arbitrageCoinBtcLatestData = null;
    let arbitrageCoinEthLatestData = null;
    if (currentUserData && currentUserData.investments) {
        const arbitrageCoinData = currentUserData.investments.arbitrage_coin || [];
        // 筛选本金>1的记录（已赎回的用户不显示后续数据）
        const btcData = arbitrageCoinData.filter(item => item.coin === 'BTC' && (item.principal || 0) > 1);
        if (btcData.length > 0) {
            arbitrageCoinBtcLatestData = btcData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        // Stable-Harbor-ETH 只使用 investments.arbitrage_eth
        if (Array.isArray(currentUserData.investments.arbitrage_eth) && currentUserData.investments.arbitrage_eth.length > 0) {
            // 筛选本金>1的记录（已赎回的用户不显示后续数据）
            const ethAll = currentUserData.investments.arbitrage_eth.filter(record => (record.principal || 0) > 1);
            if (ethAll.length > 0) {
                arbitrageCoinEthLatestData = ethAll.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            }
        }
    }
    
    // 获取所有记录的最新数据（不筛选本金，用于判断是否已赎回）
    let balancedAllLatestData = null;
    let arbitrageAllLatestData = null;
    let arbitrage2AllLatestData = null;
    let arbitrageCoinBtcAllLatestData = null;
    let arbitrageEthAllLatestData = null;
    let growthAllLatestData = null;
    
    if (currentUserData && currentUserData.investments) {
        const balancedAll = currentUserData.investments.balanced || [];
        if (balancedAll.length > 0) {
            balancedAllLatestData = balancedAll.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const arbitrageAll = currentUserData.investments.arbitrage || [];
        if (arbitrageAll.length > 0) {
            arbitrageAllLatestData = arbitrageAll.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const arbitrage2All = currentUserData.investments.arbitrage2 || [];
        if (arbitrage2All.length > 0) {
            arbitrage2AllLatestData = arbitrage2All.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const arbitrageCoinData = currentUserData.investments.arbitrage_coin || [];
        const btcAllData = arbitrageCoinData.filter(item => item.coin === 'BTC');
        if (btcAllData.length > 0) {
            arbitrageCoinBtcAllLatestData = btcAllData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        if (Array.isArray(currentUserData.investments.arbitrage_eth) && currentUserData.investments.arbitrage_eth.length > 0) {
            arbitrageEthAllLatestData = currentUserData.investments.arbitrage_eth.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const growthAll = currentUserData.investments.growth || [];
        if (growthAll.length > 0) {
            growthAllLatestData = growthAll.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
    }
    
    // 判断是否已赎回（最新记录本金<1）
    const isBalancedRedeemed = balancedAllLatestData && (balancedAllLatestData.principal || 0) < 1;
    const isArbitrageRedeemed = arbitrageAllLatestData && (arbitrageAllLatestData.principal || 0) < 1;
    const isArbitrage2Redeemed = arbitrage2AllLatestData && (arbitrage2AllLatestData.principal || 0) < 1;
    const isArbitrageCoinBtcRedeemed = arbitrageCoinBtcAllLatestData && (arbitrageCoinBtcAllLatestData.principal || 0) < 1;
    const isArbitrageEthRedeemed = arbitrageEthAllLatestData && (arbitrageEthAllLatestData.principal || 0) < 1;
    const isGrowthRedeemed = growthAllLatestData && (growthAllLatestData.principal || 0) < 1;
    
    console.log('Current user:', currentUser);
    console.log('Latest balanced data for', currentUser, ':', balancedLatestData);
    console.log('Latest arbitrage data for', currentUser, ':', arbitrageLatestData);
    console.log('Latest arbitrage2 data for', currentUser, ':', arbitrage2LatestData);
    console.log('Latest arbitrage coin BTC data for', currentUser, ':', arbitrageCoinBtcLatestData);
    console.log('Latest arbitrage coin ETH data for', currentUser, ':', arbitrageCoinEthLatestData);
    console.log('Latest growth data for', currentUser, ':', growthLatestData);
    
    // 计算持仓天数和收益率
    let balancedHoldingDays = 0;
    let balancedReturnRate = 0;
    let balancedAnnualizedReturn = 0;
    let arbitrageHoldingDays = 0;
    let arbitrageReturnRate = 0;
    let arbitrageAnnualizedReturn = 0;
    let arbitrage2HoldingDays = 0;
    let arbitrage2ReturnRate = 0;
    let arbitrage2AnnualizedReturn = 0;
    let arbitrageCoinBtcHoldingDays = 0;
    let arbitrageCoinBtcReturnRate = 0;
    let arbitrageCoinBtcAnnualizedReturn = 0;
    let arbitrageCoinEthHoldingDays = 0;
    let arbitrageCoinEthReturnRate = 0;
    let arbitrageCoinEthAnnualizedReturn = 0;
    let growthHoldingDays = 0;
    let growthReturnRate = 0;
    let growthAnnualizedReturn = 0;
    
    if (balancedLatestData) {
        console.log('Processing balanced data for', currentUser);
        // 获取当前投资者的所有Alpha-Bridge记录，筛选本金>1的记录（已赎回的用户不显示后续数据）
        const balancedRecords = (currentUserData.investments.balanced || [])
            .filter(record => (record.principal || 0) > 1);
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
        // 获取当前投资者的所有Stable-Harbor-USDT记录，筛选本金>1的记录（已赎回的用户不显示后续数据）
        const arbitrageRecords = (currentUserData.investments.arbitrage || [])
            .filter(record => (record.principal || 0) > 1);
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

    if (arbitrage2LatestData) {
        console.log('Processing arbitrage2 data for', currentUser);
        // 获取当前投资者的所有Stable-Harbor-USDT 2.0记录（仅使用 investments.arbitrage2），筛选本金>1的记录（已赎回的用户不显示后续数据）
        let arbitrage2Records = Array.isArray(currentUserData.investments.arbitrage2)
            ? currentUserData.investments.arbitrage2.filter(record => (record.principal || 0) > 1)
            : [];
        // 取最早一条
        const arbitrage2FirstRecord = arbitrage2Records.length
            ? arbitrage2Records.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (arbitrage2FirstRecord && arbitrage2LatestData) {
            arbitrage2HoldingDays = Math.ceil(
                (new Date(arbitrage2LatestData.date) - new Date(arbitrage2FirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        arbitrage2ReturnRate = arbitrage2LatestData.total_return !== undefined ? (arbitrage2LatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        arbitrage2AnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrage2ReturnRate), arbitrage2HoldingDays);
    }

    if (arbitrageCoinBtcLatestData) {
        console.log('Processing arbitrage coin BTC data for', currentUser);
        // 获取当前投资者的所有Stable-Harbor-BTC记录，筛选本金>1的记录（已赎回的用户不显示后续数据）
        const arbitrageCoinBtcRecords = (currentUserData.investments.arbitrage_coin || [])
            .filter(item => item.coin === 'BTC' && (item.principal || 0) > 1);
        // 取最早一条
        const arbitrageCoinBtcFirstRecord = arbitrageCoinBtcRecords.length
            ? arbitrageCoinBtcRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (arbitrageCoinBtcFirstRecord && arbitrageCoinBtcLatestData) {
            arbitrageCoinBtcHoldingDays = Math.ceil(
                (new Date(arbitrageCoinBtcLatestData.date) - new Date(arbitrageCoinBtcFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        arbitrageCoinBtcReturnRate = arbitrageCoinBtcLatestData.total_return !== undefined ? (arbitrageCoinBtcLatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        arbitrageCoinBtcAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageCoinBtcReturnRate), arbitrageCoinBtcHoldingDays);
    }

    if (arbitrageCoinEthLatestData) {
        console.log('Processing arbitrage coin ETH data for', currentUser);
        // 获取当前投资者的所有Stable-Harbor-ETH记录（仅使用 investments.arbitrage_eth），筛选本金>1的记录（已赎回的用户不显示后续数据）
        let arbitrageCoinEthRecords = Array.isArray(currentUserData.investments.arbitrage_eth)
            ? currentUserData.investments.arbitrage_eth.filter(record => (record.principal || 0) > 1)
            : [];
        // 取最早一条
        const arbitrageCoinEthFirstRecord = arbitrageCoinEthRecords.length
            ? arbitrageCoinEthRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (arbitrageCoinEthFirstRecord && arbitrageCoinEthLatestData) {
            arbitrageCoinEthHoldingDays = Math.ceil(
                (new Date(arbitrageCoinEthLatestData.date) - new Date(arbitrageCoinEthFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        arbitrageCoinEthReturnRate = arbitrageCoinEthLatestData.total_return !== undefined ? (arbitrageCoinEthLatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        arbitrageCoinEthAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageCoinEthReturnRate), arbitrageCoinEthHoldingDays);
    }

    if (growthLatestData) {
        console.log('Processing growth data for', currentUser);
        // 筛选本金>1的记录（已赎回的用户不显示后续数据）
        const growthRecords = (currentUserData.investments.growth || [])
            .filter(record => (record.principal || 0) > 1);
        const growthFirstRecord = growthRecords.length
            ? growthRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        if (growthFirstRecord && growthLatestData) {
            growthHoldingDays = Math.ceil(
                (new Date(growthLatestData.date) - new Date(growthFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        growthReturnRate = growthLatestData.total_return !== undefined ? (growthLatestData.total_return * 100).toFixed(2) : '0.00';
        growthAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(growthReturnRate), growthHoldingDays);
    }
    
    // 计算已清仓产品的清仓前数据
    let balancedClosedData = null;
    let balancedClosedHoldingDays = 0;
    let balancedClosedReturnRate = '0.00';
    let balancedClosedAnnualizedReturn = '0.00';
    let arbitrageClosedData = null;
    let arbitrageClosedHoldingDays = 0;
    let arbitrageClosedReturnRate = '0.00';
    let arbitrageClosedAnnualizedReturn = '0.00';
    let arbitrage2ClosedData = null;
    let arbitrage2ClosedHoldingDays = 0;
    let arbitrage2ClosedReturnRate = '0.00';
    let arbitrage2ClosedAnnualizedReturn = '0.00';
    let arbitrageCoinBtcClosedData = null;
    let arbitrageCoinBtcClosedHoldingDays = 0;
    let arbitrageCoinBtcClosedReturnRate = '0.00';
    let arbitrageCoinBtcClosedAnnualizedReturn = '0.00';
    let arbitrageEthClosedData = null;
    let arbitrageCoinEthClosedHoldingDays = 0;
    let arbitrageCoinEthClosedReturnRate = '0.00';
    let arbitrageCoinEthClosedAnnualizedReturn = '0.00';
    let growthClosedData = null;
    let growthClosedHoldingDays = 0;
    let growthClosedReturnRate = '0.00';
    let growthClosedAnnualizedReturn = '0.00';
    
    // 计算已清仓的Alpha-Bridge数据
    if (isBalancedRedeemed && currentUserData && currentUserData.investments) {
        const balancedAllRecords = (currentUserData.investments.balanced || [])
            .filter(record => (record.principal || 0) >= 1)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        if (balancedAllRecords.length > 0) {
            balancedClosedData = balancedAllRecords[0];
            const balancedFirstRecord = balancedAllRecords[balancedAllRecords.length - 1];
            if (balancedFirstRecord && balancedClosedData) {
                balancedClosedHoldingDays = Math.ceil(
                    (new Date(balancedClosedData.date) - new Date(balancedFirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            balancedClosedReturnRate = balancedClosedData.total_return !== undefined ? (balancedClosedData.total_return * 100).toFixed(2) : '0.00';
            balancedClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(balancedClosedReturnRate), balancedClosedHoldingDays);
        }
    }
    
    // 计算已清仓的Stable-Harbor-USDT数据
    if (isArbitrageRedeemed && currentUserData && currentUserData.investments) {
        const arbitrageAllRecords = (currentUserData.investments.arbitrage || [])
            .filter(record => (record.principal || 0) >= 1)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        if (arbitrageAllRecords.length > 0) {
            arbitrageClosedData = arbitrageAllRecords[0];
            const arbitrageFirstRecord = arbitrageAllRecords[arbitrageAllRecords.length - 1];
            if (arbitrageFirstRecord && arbitrageClosedData) {
                arbitrageClosedHoldingDays = Math.ceil(
                    (new Date(arbitrageClosedData.date) - new Date(arbitrageFirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            arbitrageClosedReturnRate = arbitrageClosedData.total_return !== undefined ? (arbitrageClosedData.total_return * 100).toFixed(2) : '0.00';
            arbitrageClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageClosedReturnRate), arbitrageClosedHoldingDays);
        }
    }
    
    // 计算已清仓的Stable-Harbor-USDT 2.0数据
    if (isArbitrage2Redeemed && currentUserData && currentUserData.investments) {
        const arbitrage2AllRecords = Array.isArray(currentUserData.investments.arbitrage2)
            ? currentUserData.investments.arbitrage2.filter(record => (record.principal || 0) >= 1)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];
        if (arbitrage2AllRecords.length > 0) {
            arbitrage2ClosedData = arbitrage2AllRecords[0];
            const arbitrage2FirstRecord = arbitrage2AllRecords[arbitrage2AllRecords.length - 1];
            if (arbitrage2FirstRecord && arbitrage2ClosedData) {
                arbitrage2ClosedHoldingDays = Math.ceil(
                    (new Date(arbitrage2ClosedData.date) - new Date(arbitrage2FirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            arbitrage2ClosedReturnRate = arbitrage2ClosedData.total_return !== undefined ? (arbitrage2ClosedData.total_return * 100).toFixed(2) : '0.00';
            arbitrage2ClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrage2ClosedReturnRate), arbitrage2ClosedHoldingDays);
        }
    }
    
    // 计算已清仓的Stable-Harbor-BTC数据
    if (isArbitrageCoinBtcRedeemed && currentUserData && currentUserData.investments) {
        const arbitrageCoinBtcAllRecords = (currentUserData.investments.arbitrage_coin || [])
            .filter(item => item.coin === 'BTC' && (item.principal || 0) >= 1)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        if (arbitrageCoinBtcAllRecords.length > 0) {
            arbitrageCoinBtcClosedData = arbitrageCoinBtcAllRecords[0];
            const arbitrageCoinBtcFirstRecord = arbitrageCoinBtcAllRecords[arbitrageCoinBtcAllRecords.length - 1];
            if (arbitrageCoinBtcFirstRecord && arbitrageCoinBtcClosedData) {
                arbitrageCoinBtcClosedHoldingDays = Math.ceil(
                    (new Date(arbitrageCoinBtcClosedData.date) - new Date(arbitrageCoinBtcFirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            arbitrageCoinBtcClosedReturnRate = arbitrageCoinBtcClosedData.total_return !== undefined ? (arbitrageCoinBtcClosedData.total_return * 100).toFixed(2) : '0.00';
            arbitrageCoinBtcClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageCoinBtcClosedReturnRate), arbitrageCoinBtcClosedHoldingDays);
        }
    }
    
    // 计算已清仓的Stable-Harbor-ETH数据
    if (isArbitrageEthRedeemed && currentUserData && currentUserData.investments) {
        const arbitrageEthAllRecords = Array.isArray(currentUserData.investments.arbitrage_eth)
            ? currentUserData.investments.arbitrage_eth.filter(record => (record.principal || 0) >= 1)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];
        if (arbitrageEthAllRecords.length > 0) {
            arbitrageEthClosedData = arbitrageEthAllRecords[0];
            const arbitrageCoinEthFirstRecord = arbitrageEthAllRecords[arbitrageEthAllRecords.length - 1];
            if (arbitrageCoinEthFirstRecord && arbitrageEthClosedData) {
                arbitrageCoinEthClosedHoldingDays = Math.ceil(
                    (new Date(arbitrageEthClosedData.date) - new Date(arbitrageCoinEthFirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            arbitrageCoinEthClosedReturnRate = arbitrageEthClosedData.total_return !== undefined ? (arbitrageEthClosedData.total_return * 100).toFixed(2) : '0.00';
            arbitrageCoinEthClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageCoinEthClosedReturnRate), arbitrageCoinEthClosedHoldingDays);
        }
    }
    
    // 计算已清仓的Deep-Growth数据
    if (isGrowthRedeemed && currentUserData && currentUserData.investments) {
        const growthAllRecords = (currentUserData.investments.growth || [])
            .filter(record => (record.principal || 0) >= 1)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        if (growthAllRecords.length > 0) {
            growthClosedData = growthAllRecords[0];
            const growthFirstRecord = growthAllRecords[growthAllRecords.length - 1];
            if (growthFirstRecord && growthClosedData) {
                growthClosedHoldingDays = Math.ceil(
                    (new Date(growthClosedData.date) - new Date(growthFirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            growthClosedReturnRate = growthClosedData.total_return !== undefined ? (growthClosedData.total_return * 100).toFixed(2) : '0.00';
            growthClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(growthClosedReturnRate), growthClosedHoldingDays);
        }
    }

    // 按币种分组计算总资产和收益
    const assetsByCoin = {};
    
    // 处理 Alpha-Bridge 数据（即使本金为 0 也统计资产和收益，但不计入当前持仓数量）
    if (balancedLatestData) {
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
        // 只有本金大于 0 时才算作当前持仓
        if (balancedLatestData.principal > 0) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-USDT 数据（同样逻辑）
    if (arbitrageLatestData) {
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
        if (arbitrageLatestData.principal > 0) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-USDT 2.0 数据（同样逻辑）
    if (arbitrage2LatestData) {
        console.log('Adding arbitrage2 data to assetsByCoin');
        const coin = arbitrage2LatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrage2LatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrage2LatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrage2LatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrage2LatestData.net_pnl;
        if (arbitrage2LatestData.principal > 0) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-BTC 数据（同样逻辑）
    if (arbitrageCoinBtcLatestData) {
        console.log('Adding arbitrage coin BTC data to assetsByCoin');
        const coin = arbitrageCoinBtcLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageCoinBtcLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageCoinBtcLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageCoinBtcLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageCoinBtcLatestData.net_pnl;
        if (arbitrageCoinBtcLatestData.principal > 0) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-ETH 数据（同样逻辑）
    if (arbitrageCoinEthLatestData) {
        console.log('Adding arbitrage coin ETH data to assetsByCoin');
        const coin = arbitrageCoinEthLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageCoinEthLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageCoinEthLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageCoinEthLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageCoinEthLatestData.net_pnl;
        if (arbitrageCoinEthLatestData.principal > 0) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Deep-Growth（用户JSON里是 investments.growth）（同样逻辑）
    if (growthLatestData) {
        console.log('Adding growth data to assetsByCoin');
        const coin = growthLatestData.coin || 'USDT';
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += growthLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += growthLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += growthLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += growthLatestData.net_pnl;
        if (growthLatestData.principal > 0) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    console.log('Final assetsByCoin:', assetsByCoin);

    // 生成投资组合概览HTML
    let overviewHtml = '';
    if (Object.keys(assetsByCoin).length > 0) {
        // 计算总持仓数量
        const totalHoldingCount = Object.values(assetsByCoin).reduce((sum, data) => sum + data.holdingCount, 0);
        // 币种展示顺序：总资产 ≥ 1 的在前，总资产 < 1 的在后
        const sortedAssetsEntries = Object.entries(assetsByCoin).sort(([, a], [, b]) => {
            const aSmall = a.totalNetNav < 1;
            const bSmall = b.totalNetNav < 1;
            if (aSmall === bSmall) return 0;
            return aSmall ? 1 : -1; // 总资产 < 1 的放后面
        });
        
        overviewHtml = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">投资组合概览</h5>
                    <div class="table-responsive">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td class="fw-bold">总资产</td>
                                    <td>${sortedAssetsEntries.map(([coin, data]) => 
                                        `${coin} ${data.totalNetNav.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`
                                    ).join('&emsp;｜&emsp;')}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">累计收益</td>
                                    <td class="text-success">${sortedAssetsEntries.map(([coin, data]) => {
                                        const total = data.realizedPnl + data.unrealizedPnl;
                                        return `+${coin} ${total.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`;
                                    }).join('&emsp;｜&emsp;')}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold" style="white-space:nowrap;">已实现收益</td>
                                    <td>${sortedAssetsEntries.map(([coin, data]) => 
                                        `${coin} ${data.realizedPnl.toLocaleString('zh-CN', {minimumFractionDigits: coin === 'BTC' ? 4 : 2, maximumFractionDigits: coin === 'BTC' ? 4 : 2})}`
                                    ).join('&emsp;｜&emsp;')}
                                    <!-- 分红日期提示，仅特定投资人显示且只显示一次 -->
                                    ${(() => {
                                        const user = currentUser && currentUser.toLowerCase();
                                        if (["octopus", "sam", "jennifer", "alex"].includes(user)) {
                                            return '<span style="font-size:0.95em;color:#888;margin-left:8px;">（上次分红日期：2025-01-06）</span>';
                                        } else if (["bon", "ying", "tt"].includes(user)) {
                                            return '<span style="font-size:0.95em;color:#888;margin-left:8px;">（上次分红日期：2025-07-04）</span>';
                                        } else if (user === "hp") {
                                            return '<span style="font-size:0.95em;color:#888;margin-left:8px;">（上次分红日期：2025-12-18）</span>';
                                        } else if (user === "turbo") {
                                            return '<span style="font-size:0.95em;color:#888;margin-left:8px;">（上次分红日期：2025-12-12）</span>';
                                        }
                                        return '';
                                    })()}</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold" style="white-space:nowrap;">未实现收益</td>
                                    <td>${sortedAssetsEntries.map(([coin, data]) => 
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
                <div class="col-12 text-end investment-actions">
                    <button type="button" class="btn btn-primary me-2 mb-2 mb-md-0" id="currencyConversionBtn">
                        <i class="bi bi-arrow-left-right"></i> 币种转换投资
                    </button>
                    <button type="button" class="btn btn-primary" id="redemptionBtn">
                        <i class="bi bi-cash-coin"></i> 赎回
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-md-6">
                    ${overviewHtml}
                </div>
                <div class="col-12 col-md-6">
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
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                                <h3 class="card-title h5 mb-2 mb-md-0">投资组合明细</h3>
                                <div class="d-flex">
                                    <span id="currentHoldingBtn" class="holding-tab-btn" style="cursor: pointer; text-decoration: underline; color: #000; margin-right: 20px; font-weight: bold;">当前持仓</span>
                                    <span id="closedPositionBtn" class="holding-tab-btn" style="cursor: pointer; text-decoration: none; color: #6c757d; margin-right: 20px; font-weight: bold;">已清仓</span>
                                </div>
                            </div>
                            
                            <!-- 当前持仓表格 -->
                            <div id="currentHoldingTable" class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table">
                                    <thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 10;">
                                        <tr>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">产品名称</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">币种</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">本金</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">当前价值</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">收益率</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">持仓天数</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">年化收益率</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">数据日期</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>${productData['balanced'].title}</td>
                                            <td>${balancedAllLatestData ? balancedAllLatestData.coin : 'USDT'}</td>
                                            <td>${balancedLatestData ? balancedLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${balancedLatestData ? balancedLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (balancedLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${balancedLatestData && balancedReturnRate ? balancedReturnRate + '%' : '0.00%'}</td>
                                            <td>${balancedLatestData ? balancedHoldingDays : '0'}</td>
                                            <td>${balancedLatestData && balancedAnnualizedReturn ? balancedAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${balancedLatestData && balancedAllLatestData ? formatDateToYMD(balancedAllLatestData.date) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['stable-usd'].title}</td>
                                            <td>${arbitrageAllLatestData ? arbitrageAllLatestData.coin : 'USDT'}</td>
                                            <td>${arbitrageLatestData ? arbitrageLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrageLatestData ? arbitrageLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageLatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrageLatestData && arbitrageReturnRate ? arbitrageReturnRate + '%' : '0.00%'}</td>
                                            <td>${arbitrageLatestData ? arbitrageHoldingDays : '0'}</td>
                                            <td>${arbitrageLatestData && arbitrageAnnualizedReturn ? arbitrageAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${arbitrageLatestData && arbitrageAllLatestData ? formatDateToYMD(arbitrageAllLatestData.date) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['stable-usd-2'].title}</td>
                                            <td>${arbitrage2AllLatestData ? arbitrage2AllLatestData.coin : 'USDT'}</td>
                                            <td>${arbitrage2LatestData ? arbitrage2LatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrage2LatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrage2LatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrage2LatestData ? arbitrage2LatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrage2LatestData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrage2LatestData.coin === 'BTC') ? 4 : 2}) : '0.00'}</td>
                                            <td>${arbitrage2LatestData && arbitrage2ReturnRate ? arbitrage2ReturnRate + '%' : '0.00%'}</td>
                                            <td>${arbitrage2LatestData ? arbitrage2HoldingDays : '0'}</td>
                                            <td>${arbitrage2LatestData && arbitrage2AnnualizedReturn ? arbitrage2AnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${arbitrage2LatestData && arbitrage2AllLatestData ? formatDateToYMD(arbitrage2AllLatestData.date) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['stable-coin-btc'].title}</td>
                                            <td>${arbitrageCoinBtcAllLatestData ? arbitrageCoinBtcAllLatestData.coin : 'BTC'}</td>
                                            <td>${arbitrageCoinBtcLatestData ? arbitrageCoinBtcLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '0.00'}</td>
                                            <td>${arbitrageCoinBtcLatestData ? arbitrageCoinBtcLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '0.00'}</td>
                                            <td>${arbitrageCoinBtcLatestData && arbitrageCoinBtcReturnRate ? arbitrageCoinBtcReturnRate + '%' : '0.00%'}</td>
                                            <td>${arbitrageCoinBtcLatestData ? arbitrageCoinBtcHoldingDays : '0'}</td>
                                            <td>${arbitrageCoinBtcLatestData && arbitrageCoinBtcAnnualizedReturn ? arbitrageCoinBtcAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${arbitrageCoinBtcLatestData && arbitrageCoinBtcAllLatestData ? formatDateToYMD(arbitrageCoinBtcAllLatestData.date) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>Stable-Harbor-ETH</td>
                                            <td>${arbitrageEthAllLatestData ? arbitrageEthAllLatestData.coin : 'ETH'}</td>
                                            <td>${arbitrageCoinEthLatestData ? arbitrageCoinEthLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '0.00'}</td>
                                            <td>${arbitrageCoinEthLatestData ? arbitrageCoinEthLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '0.00'}</td>
                                            <td>${arbitrageCoinEthLatestData && arbitrageCoinEthReturnRate ? arbitrageCoinEthReturnRate + '%' : '0.00%'}</td>
                                            <td>${arbitrageCoinEthLatestData ? arbitrageCoinEthHoldingDays : '0'}</td>
                                            <td>${arbitrageCoinEthLatestData && arbitrageCoinEthAnnualizedReturn ? arbitrageCoinEthAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${arbitrageCoinEthLatestData && arbitrageEthAllLatestData ? formatDateToYMD(arbitrageEthAllLatestData.date) : '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>${productData['aggressive'].title}</td>
                                            <td>${growthAllLatestData ? (growthAllLatestData.coin || 'USDT') : 'USDT'}</td>
                                            <td>${growthLatestData ? growthLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: ((growthLatestData.coin || 'USDT') === 'BTC' || (growthLatestData.coin || 'USDT') === 'ETH') ? 4 : 2, maximumFractionDigits: ((growthLatestData.coin || 'USDT') === 'BTC' || (growthLatestData.coin || 'USDT') === 'ETH') ? 4 : 2}) : '0.00'}</td>
                                            <td>${growthLatestData ? growthLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: ((growthLatestData.coin || 'USDT') === 'BTC' || (growthLatestData.coin || 'USDT') === 'ETH') ? 4 : 2, maximumFractionDigits: ((growthLatestData.coin || 'USDT') === 'BTC' || (growthLatestData.coin || 'USDT') === 'ETH') ? 4 : 2}) : '0.00'}</td>
                                            <td>${growthLatestData && growthReturnRate ? growthReturnRate + '%' : '0.00%'}</td>
                                            <td>${growthLatestData ? growthHoldingDays : '0'}</td>
                                            <td>${growthLatestData && growthAnnualizedReturn ? growthAnnualizedReturn + '%' : '0.00%'}</td>
                                            <td>${growthLatestData && growthAllLatestData ? formatDateToYMD(growthAllLatestData.date) : '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- 已清仓表格占位 -->
                            <div id="closedPositionTable" class="table-responsive" style="max-height: 500px; overflow-y: auto; display: none;">
                                <table class="table">
                                    <thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 10;">
                                        <tr>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">产品名称</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">币种</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">本金</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">清仓价值</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">收益率</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">持仓天数</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">年化收益率</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">清仓日期</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${isBalancedRedeemed && balancedClosedData ? `
                                        <tr>
                                            <td>${productData['balanced'].title}</td>
                                            <td>${balancedClosedData.coin || 'USDT'}</td>
                                            <td>${balancedClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (balancedClosedData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (balancedClosedData.coin === 'BTC') ? 4 : 2})}</td>
                                            <td>${balancedClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (balancedClosedData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (balancedClosedData.coin === 'BTC') ? 4 : 2})}</td>
                                            <td>${balancedClosedReturnRate}%</td>
                                            <td>${balancedClosedHoldingDays}</td>
                                            <td>${balancedClosedAnnualizedReturn}%</td>
                                            <td>${formatDateToYMD(balancedClosedData.date)}</td>
                                        </tr>
                                        ` : ''}
                                        ${isArbitrageRedeemed && arbitrageClosedData ? `
                                        <tr>
                                            <td>${productData['stable-usd'].title}</td>
                                            <td>${arbitrageClosedData.coin || 'USDT'}</td>
                                            <td>${arbitrageClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageClosedData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageClosedData.coin === 'BTC') ? 4 : 2})}</td>
                                            <td>${arbitrageClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrageClosedData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrageClosedData.coin === 'BTC') ? 4 : 2})}</td>
                                            <td>${arbitrageClosedReturnRate}%</td>
                                            <td>${arbitrageClosedHoldingDays}</td>
                                            <td>${arbitrageClosedAnnualizedReturn}%</td>
                                            <td>${formatDateToYMD(arbitrageClosedData.date)}</td>
                                        </tr>
                                        ` : ''}
                                        ${isArbitrage2Redeemed && arbitrage2ClosedData ? `
                                        <tr>
                                            <td>${productData['stable-usd-2'].title}</td>
                                            <td>${arbitrage2ClosedData.coin || 'USDT'}</td>
                                            <td>${arbitrage2ClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrage2ClosedData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrage2ClosedData.coin === 'BTC') ? 4 : 2})}</td>
                                            <td>${arbitrage2ClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: (arbitrage2ClosedData.coin === 'BTC') ? 4 : 2, maximumFractionDigits: (arbitrage2ClosedData.coin === 'BTC') ? 4 : 2})}</td>
                                            <td>${arbitrage2ClosedReturnRate}%</td>
                                            <td>${arbitrage2ClosedHoldingDays}</td>
                                            <td>${arbitrage2ClosedAnnualizedReturn}%</td>
                                            <td>${formatDateToYMD(arbitrage2ClosedData.date)}</td>
                                        </tr>
                                        ` : ''}
                                        ${isArbitrageCoinBtcRedeemed && arbitrageCoinBtcClosedData ? `
                                        <tr>
                                            <td>${productData['stable-coin-btc'].title}</td>
                                            <td>${arbitrageCoinBtcClosedData.coin || 'BTC'}</td>
                                            <td>${arbitrageCoinBtcClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
                                            <td>${arbitrageCoinBtcClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
                                            <td>${arbitrageCoinBtcClosedReturnRate}%</td>
                                            <td>${arbitrageCoinBtcClosedHoldingDays}</td>
                                            <td>${arbitrageCoinBtcClosedAnnualizedReturn}%</td>
                                            <td>${formatDateToYMD(arbitrageCoinBtcClosedData.date)}</td>
                                        </tr>
                                        ` : ''}
                                        ${isArbitrageEthRedeemed && arbitrageEthClosedData ? `
                                        <tr>
                                            <td>Stable-Harbor-ETH</td>
                                            <td>${arbitrageEthClosedData.coin || 'ETH'}</td>
                                            <td>${arbitrageEthClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
                                            <td>${arbitrageEthClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
                                            <td>${arbitrageCoinEthClosedReturnRate}%</td>
                                            <td>${arbitrageCoinEthClosedHoldingDays}</td>
                                            <td>${arbitrageCoinEthClosedAnnualizedReturn}%</td>
                                            <td>${formatDateToYMD(arbitrageEthClosedData.date)}</td>
                                        </tr>
                                        ` : ''}
                                        ${isGrowthRedeemed && growthClosedData ? `
                                        <tr>
                                            <td>${productData['aggressive'].title}</td>
                                            <td>${growthClosedData.coin || 'USDT'}</td>
                                            <td>${growthClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: ((growthClosedData.coin || 'USDT') === 'BTC' || (growthClosedData.coin || 'USDT') === 'ETH') ? 4 : 2, maximumFractionDigits: ((growthClosedData.coin || 'USDT') === 'BTC' || (growthClosedData.coin || 'USDT') === 'ETH') ? 4 : 2})}</td>
                                            <td>${growthClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: ((growthClosedData.coin || 'USDT') === 'BTC' || (growthClosedData.coin || 'USDT') === 'ETH') ? 4 : 2, maximumFractionDigits: ((growthClosedData.coin || 'USDT') === 'BTC' || (growthClosedData.coin || 'USDT') === 'ETH') ? 4 : 2})}</td>
                                            <td>${growthClosedReturnRate}%</td>
                                            <td>${growthClosedHoldingDays}</td>
                                            <td>${growthClosedAnnualizedReturn}%</td>
                                            <td>${formatDateToYMD(growthClosedData.date)}</td>
                                        </tr>
                                        ` : ''}
                                        ${!((isBalancedRedeemed && balancedClosedData) || (isArbitrageRedeemed && arbitrageClosedData) || (isArbitrage2Redeemed && arbitrage2ClosedData) || (isArbitrageCoinBtcRedeemed && arbitrageCoinBtcClosedData) || (isArbitrageEthRedeemed && arbitrageEthClosedData) || (isGrowthRedeemed && growthClosedData)) ? `
                                        <tr>
                                            <td colspan="8" class="text-center">暂无已清仓记录</td>
                                        </tr>
                                        ` : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title h5">投资明细记录</h3>
                            <p class="text-muted small mb-3">注：单位净值仅展示4位小数</p>
                            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table" id="investmentDetailTable">
                                    <thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 10;">
                                        <tr>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">投资者</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">交易日期</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">产品名称</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">操作类型</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">币种</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">交易金额</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">份额变化</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">累计份额</th>
                                            <th class="table-header-nowrap" style="background-color: #f8f9fa; position: sticky; top: 0;">单位净值</th>
                                        </tr>
                                    </thead>
                                    <tbody id="investmentDetailTableBody">
                                        <!-- 数据将通过JavaScript动态生成 -->
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

        // 绑定投资组合明细按钮切换事件
        const currentHoldingBtn = document.getElementById('currentHoldingBtn');
        const closedPositionBtn = document.getElementById('closedPositionBtn');
        const currentHoldingTable = document.getElementById('currentHoldingTable');
        const closedPositionTable = document.getElementById('closedPositionTable');
        
        if (currentHoldingBtn && closedPositionBtn && currentHoldingTable && closedPositionTable) {
            // 当前持仓按钮点击事件
            currentHoldingBtn.addEventListener('click', function() {
                currentHoldingBtn.style.textDecoration = 'underline';
                currentHoldingBtn.style.color = '#000';
                closedPositionBtn.style.textDecoration = 'none';
                closedPositionBtn.style.color = '#6c757d';
                currentHoldingTable.style.display = 'block';
                closedPositionTable.style.display = 'none';
            });
            
            // 已清仓按钮点击事件
            closedPositionBtn.addEventListener('click', function() {
                closedPositionBtn.style.textDecoration = 'underline';
                closedPositionBtn.style.color = '#000';
                currentHoldingBtn.style.textDecoration = 'none';
                currentHoldingBtn.style.color = '#6c757d';
                closedPositionTable.style.display = 'block';
                currentHoldingTable.style.display = 'none';
            });
        }

        // 初始化资产配置图表
        const ctx = document.getElementById('assetAllocationChart');
        if (ctx) {
            console.log('Initializing return curves chart');
            
            // 工具函数：只保留每月最后一天的数据点，并转换为年月格式
            function filterToMonthEnd(data) {
                const grouped = {};
                
                // 按月份分组，每个月份保留最新的数据点
                data.forEach(item => {
                    const date = new Date(item.x);
                    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const isLastDayOfMonth = date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    
                    // 如果该月还没有数据，或者当前数据是月末，或者当前数据比已有数据更新，则保留
                    if (!grouped[ym] || isLastDayOfMonth || date > new Date(grouped[ym].originalDate)) {
                        grouped[ym] = {
                            x: ym,  // 直接使用年月格式
                            y: item.y,
                            isMonthEnd: isLastDayOfMonth, // 添加月末标识
                            originalDate: item.x // 保存原始日期用于比较
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

        // 加载并显示投资明细记录
        loadAndDisplayInvestmentDetails();

            // 从当前用户数据获取收益率数据
            // 筛选本金>1的记录（已赎回的用户不显示后续数据）
            const balancedReturns = filterToMonthEnd(
                (currentUserData?.investments?.balanced || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrageReturns = filterToMonthEnd(
                (currentUserData?.investments?.arbitrage || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrage2Returns = filterToMonthEnd(
                (currentUserData?.investments?.arbitrage2 || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrageCoinBtcReturns = filterToMonthEnd(
                (currentUserData?.investments?.arbitrage_coin || [])
                    .filter(record => record.coin === 'BTC' && (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );
            
            // ETH 组合：只使用 investments.arbitrage_eth
            const arbitrageCoinEthReturns = filterToMonthEnd(
                (currentUserData?.investments?.arbitrage_eth || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const growthReturns = filterToMonthEnd(
                (currentUserData?.investments?.growth || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            console.log('Balanced returns data:', balancedReturns);
            console.log('Arbitrage returns data:', arbitrageReturns);
            console.log('Arbitrage2 returns data:', arbitrage2Returns);
            console.log('Arbitrage coin BTC returns data:', arbitrageCoinBtcReturns);
            console.log('Arbitrage coin ETH returns data:', arbitrageCoinEthReturns);
            console.log('Growth returns data:', growthReturns);

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
                            // 如果已清仓，则全部用实线
                            if (isBalancedRedeemed) {
                                return [];
                            }
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
                            // 如果已清仓，则全部用实线
                            if (isArbitrageRedeemed) {
                                return [];
                            }
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === arbitrageReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }
            if (arbitrage2Returns.length > 0) {
                // 检查最后一个点是否为月末
                const lastPointIsMonthEnd = arbitrage2Returns[arbitrage2Returns.length - 1].isMonthEnd;
                datasets.push({
                    label: productData['stable-usd-2'].title,
                    data: arbitrage2Returns,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52,152,219,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果已清仓，则全部用实线
                            if (isArbitrage2Redeemed) {
                                return [];
                            }
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === arbitrage2Returns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }
            if (arbitrageCoinBtcReturns.length > 0) {
                // 检查最后一个点是否为月末
                const lastPointIsMonthEnd = arbitrageCoinBtcReturns[arbitrageCoinBtcReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: productData['stable-coin-btc'].title,
                    data: arbitrageCoinBtcReturns,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231,76,60,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果已清仓，则全部用实线
                            if (isArbitrageCoinBtcRedeemed) {
                                return [];
                            }
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === arbitrageCoinBtcReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }
            if (arbitrageCoinEthReturns.length > 0) {
                // 检查最后一个点是否为月末
                const lastPointIsMonthEnd = arbitrageCoinEthReturns[arbitrageCoinEthReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: 'Stable-Harbor-ETH',
                    data: arbitrageCoinEthReturns,
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142,68,173,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果已清仓，则全部用实线
                            if (isArbitrageEthRedeemed) {
                                return [];
                            }
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === arbitrageCoinEthReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }
            if (growthReturns.length > 0) {
                const lastPointIsMonthEnd = growthReturns[growthReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: productData['aggressive'].title, // Deep-Growth
                    data: growthReturns,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46,204,113,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            // 如果已清仓，则全部用实线
                            if (isGrowthRedeemed) {
                                return [];
                            }
                            // 如果是最后一个点且不是月末，则最后一段用虚线
                            if (ctx.p1DataIndex === growthReturns.length - 1 && !lastPointIsMonthEnd) {
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
                            position: 'top',
                            align: 'center',
                            labels: {
                                boxWidth: 12,
                                padding: 8,
                                font: {
                                    size: 11
                                },
                                usePointStyle: true
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
    Papa.parse(DATA_BASE_URL + '/growth.csv?t=' + new Date().getTime(), {
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
            <h3>${productData['aggressive'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
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
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    } else if (product === 'stable-usd-2') {
        if (investments.arbitrage2 && investments.arbitrage2.length > 0) {
            const latestArbitrage2 = investments.arbitrage2.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage2 && latestArbitrage2.coin === currency) {
                maxAmount = latestArbitrage2.net_nav || 0;
            }
        }
    } else if (product === 'stable-coin-btc') {
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin
                .filter(item => item.coin === 'BTC')
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                maxAmount = latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (product === 'stable-coin-eth') {
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin
                .filter(item => item.coin === 'ETH')
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                maxAmount = latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (product === 'aggressive') {
        // Deep-Growth：用户JSON里用 investments.growth 存储
        if (investments.growth && investments.growth.length > 0) {
            const latestGrowth = investments.growth.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestGrowth && (latestGrowth.coin || 'USDT') === currency) {
                maxAmount = latestGrowth.net_nav || 0;
            }
        }
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
    } else if (product === 'stable-coin-btc') {
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin
                .filter(item => item.coin === 'BTC')
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                maxAmount = latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (product === 'stable-coin-eth') {
        if (investments.arbitrage_coin && investments.arbitrage_coin.length > 0) {
            const latestArbitrageCoin = investments.arbitrage_coin
                .filter(item => item.coin === 'ETH')
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrageCoin && latestArbitrageCoin.coin === currency) {
                maxAmount = latestArbitrageCoin.net_nav || 0;
            }
        }
    } else if (product === 'aggressive') {
        // Deep-Growth：用户JSON里用 investments.growth 存储
        if (investments.growth && investments.growth.length > 0) {
            const latestGrowth = investments.growth.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestGrowth && (latestGrowth.coin || 'USDT') === currency) {
                maxAmount = latestGrowth.net_nav || 0;
            }
        }
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
    } else if (product === 'stable-usd-2') {
        if (investments.arbitrage2 && investments.arbitrage2.length > 0) {
            const latestArbitrage2 = investments.arbitrage2.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage2 && latestArbitrage2.coin === currency) {
                maxAmount = latestArbitrage2.net_nav || 0;
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
            // Deep-Growth：用户JSON里用 investments.growth 存储
            if (investments.growth && investments.growth.length > 0) {
                const latestGrowth = investments.growth.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                if (latestGrowth && (latestGrowth.coin || 'USDT') === currency) {
                    maxAmount = latestGrowth.net_nav || 0;
                }
            }
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
        'stable-usd-2': 'Stable-Harbor-USDT 2.0',
        'stable-coin-btc': 'Stable-Harbor-BTC',
        'stable-coin-eth': 'Stable-Harbor-ETH',
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
    // Deep-Growth（用户JSON里是 investments.growth）
    if (investments.growth && investments.growth.length > 0) {
        const latestGrowth = investments.growth.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestGrowth && (latestGrowth.coin || 'USDT') === 'USDT') {
            usdtAmount += latestGrowth.net_nav || 0;
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
        <div class="row mb-3 conversion-row" id="${rowId}">
            <div class="col-12 col-md-3 mb-2 mb-md-0">
                <label class="form-label">出售币种 <span class="text-danger">*</span></label>
                <select class="form-select" id="sellCurrency-${rowCount + 1}">
                    <option value="">请选择</option>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>
            <div class="col-12 col-md-3 mb-2 mb-md-0">
                <label class="form-label">出售数量 <span class="text-danger">*</span></label>
                <div class="input-group">
                    <input type="number" class="form-control" id="sellAmount-${rowCount + 1}" placeholder="0.00" step="0.0001" min="0">
                    <button type="button" class="btn btn-outline-secondary" onclick="setMaxSellAmount('${rowCount + 1}')">全部</button>
                </div>
            </div>
            <div class="col-12 col-md-3 mb-2 mb-md-0">
                <label class="form-label">买入币种 <span class="text-danger">*</span></label>
                <select class="form-select" id="buyCurrency-${rowCount + 1}">
                    <option value="">请选择</option>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
            </div>
            <div class="col-12 col-md-2 mb-2 mb-md-0">
                <label class="form-label">限价</label>
                <input type="number" class="form-control" id="priceLimit-${rowCount + 1}" placeholder="0.00" step="0.0001" min="0">
            </div>
            <div class="col-12 col-md-1 d-flex align-items-end justify-content-center justify-content-md-start">
                ${rowCount > 0 ? `<button type="button" class="btn btn-outline-danger btn-sm remove-conversion-btn" onclick="removeConversionRow('${rowId}')">
                    <span>−</span>
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
        // Deep-Growth（用户JSON里是 investments.growth）
        if (investments.growth && investments.growth.length > 0) {
            const latestGrowth = investments.growth.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestGrowth && (latestGrowth.coin || 'USDT') === 'USDT') {
                amount += latestGrowth.net_nav || 0;
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

// 投资明细记录相关函数
// fund名称映射
const fundNameMapping = {
    'zerone': 'Alpha-Bridge',
    'HPU': 'Stable-Harbor-USDT',
    'arbitrage2': 'Stable-Harbor-USDT 2.0',
    'binggan': 'Stable-Harbor-BTC',
    'HPE': 'Stable-Harbor-ETH',
    // 兼容：用户 JSON 里可能用 growth 表示 Deep-Growth
    'growth': 'Deep-Growth',
    // 兼容：有些地方用 aggressive 作为 Deep-Growth 的 key
    'aggressive': 'Deep-Growth'
};

// 加载并显示投资明细记录
function loadAndDisplayInvestmentDetails() {
    if (!currentUser || !currentUserData) {
        return;
    }

    // 直接从用户JSON数据中读取投资明细记录
    displayInvestmentDetails();
}

// 显示投资明细数据
function displayInvestmentDetails() {
    // 从用户JSON数据中获取投资明细记录
    if (!currentUserData || !currentUserData.investment_details) {
        const tbody = document.getElementById('investmentDetailTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">暂无投资明细记录</td></tr>';
        }
        return;
    }
    
    const userRecords = currentUserData.investment_details || [];

    // 先按产品名称排序，再按日期排序（从老到新）
    userRecords.sort((a, b) => {
        // 将日期格式从 "2024/6/11" 转换为 "2024/06/11" 以便正确解析
        const normalizeDate = (dateStr) => {
            if (!dateStr) return new Date(0);
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const year = parts[0];
                const month = parts[1].padStart(2, '0');
                const day = parts[2].padStart(2, '0');
                return new Date(`${year}-${month}-${day}`);
            }
            return new Date(dateStr);
        };
        
        // 获取产品名称（根据映射关系）
        // 兼容老数据：可能是 fund，也可能是 product
        const fundKeyA = a.fund || a.product || '';
        const fundKeyB = b.fund || b.product || '';
        const fundNameA = fundNameMapping[fundKeyA] || fundKeyA;
        const fundNameB = fundNameMapping[fundKeyB] || fundKeyB;
        
        // 先按产品名称排序
        const productCompare = fundNameA.localeCompare(fundNameB, 'zh-CN');
        if (productCompare !== 0) {
            return productCompare;
        }
        
        // 如果产品名称相同，再按日期排序（从老到新）
        const dateA = normalizeDate(a.date);
        const dateB = normalizeDate(b.date);
        return dateA - dateB;
    });

    // 获取表格tbody元素
    const tbody = document.getElementById('investmentDetailTableBody');
    if (!tbody) {
        console.error('找不到投资明细表格tbody元素');
        return;
    }

    // 清空现有内容
    tbody.innerHTML = '';

    if (userRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">暂无投资明细记录</td></tr>';
    } else {
        // 生成表格行
        userRecords.forEach(record => {
            const row = document.createElement('tr');
            
            // 产品名称：优先 fund，其次 product；并做映射（growth -> Deep-Growth）
            const rawFund = record.fund || record.product || '-';
            const fundName = fundNameMapping[rawFund] || rawFund;
            
            // 格式化日期为 yyyy-mm-dd 格式（只显示年月日，不显示时间）
            let formattedDate = '-';
            if (record.date) {
                // 先去除时间部分（如果有T或空格，取前面的部分）
                let dateOnly = record.date;
                if (dateOnly.includes('T')) {
                    dateOnly = dateOnly.split('T')[0];
                } else if (dateOnly.includes(' ')) {
                    dateOnly = dateOnly.split(' ')[0];
                }
                
                // 处理 "年/月/日" 格式
                const parts = dateOnly.split('/');
                if (parts.length === 3) {
                    const year = parts[0];
                    const month = parts[1].padStart(2, '0');
                    const day = parts[2].padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}`;
                } else {
                    // 处理 "年-月-日" 格式（包括ISO格式 2024-11-13）
                    const dashParts = dateOnly.split('-');
                    if (dashParts.length >= 3) {
                        const year = dashParts[0];
                        const month = dashParts[1].padStart(2, '0');
                        const day = dashParts[2].padStart(2, '0');
                        formattedDate = `${year}-${month}-${day}`;
                    } else {
                        formattedDate = dateOnly;
                    }
                }
            }
            
            // 格式化金额和单位（从JSON中读取，已经是数字类型）
            const amount = record.amount || 0;
            const unit = record.unit || 0;
            const unitTotal = record.unit_total || 0;
            const coin = record.coin || '-';
            
            // 根据币种决定小数位数：BTC显示4位小数，其他币种显示2位小数
            const decimals = coin === 'BTC' ? 4 : 2;
            
            // 格式化当日净值（4位小数）（从JSON中读取，已经是数字类型）
            const navPerUnit = record.nav_per_unit;
            const formattedNav = navPerUnit && navPerUnit !== 0 && !isNaN(navPerUnit) 
                ? navPerUnit.toFixed(4) 
                : '-';
            
            row.innerHTML = `
                <td>${record.investor || '-'}</td>
                <td>${formattedDate}</td>
                <td>${fundName}</td>
                <td>${record.action || '-'}</td>
                <td>${coin}</td>
                <td>${amount.toLocaleString('zh-CN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</td>
                <td>${unit.toLocaleString('zh-CN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</td>
                <td>${unitTotal.toLocaleString('zh-CN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</td>
                <td>${formattedNav}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // 表格大小会根据记录条数自动适配，无需手动设置
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