import {
    DATA_BASE_URL,
    EMAILJS_CONFIG,
    PRODUCT_DATA
} from './modules/config.js';
import { initProductListRouting } from './modules/product-router.js';
import {
    renderInvestorSummarySection,
    renderInvestmentDetailsTable
} from './modules/investor-summary-view.js';

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

// 产品与业绩配置（模块化拆分）
const productData = PRODUCT_DATA;

// 存储当前用户的hash文件名
let currentUserHashFile = null;

// 存储从hash文件加载的用户数据
let currentUserData = null;

const productList = document.getElementById('product-list');
const perfContent = document.getElementById('product-performance-content');
if (productList && perfContent) {
    initProductListRouting({
        productList,
        onBalanced: showBalancedProductSection,
        onStableUsd: showStableUsdProductSection,
        onStableCoinBtc: showStableCoinBtcProductSection,
        onAggressive: showAggressiveProductSection,
        defaultRange: 'all'
    });
}

// 平衡型FOF业绩图表逻辑
let balancedChart = null;
let balancedData = [];
let balancedDataLoaded = false;
let balancedBenchmarkData = [];
let balancedBenchmarkDataLoaded = false;
const BALANCED_CHART_STYLE = {
    navLabel: '单位净值',
    benchmarkLabel: 'Benchmark',
    navColor: '#0f172a',
    benchmarkColor: '#94a3b8',
    chartBg: '#ffffff',
    areaAbove: 'rgba(59,130,246,0.10)',
    gridColor: 'rgba(148,163,184,0.12)',
    tickColor: '#475569',
    legendDisplay: true,
    navBorderWidth: 2.4,
    benchmarkBorderWidth: 1.8,
    pointRadius: 1,
    benchmarkDash: [4, 4]
};

const BENCHMARK_LABELS = {
    mixed: 'Benchmark: 90% T-bill Return+ 10% BTC Price',
    tbill: 'Benchmark: T-bill Return',
    btcPrice: 'Benchmark: BTC Price'
};

/** 产品区图表：与 CSS 768px 断点一致，用于缩小横轴字号、略减刻度密度 */
function isProductMobileViewport() {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
}

function getUnifiedXAxisTicks(color, maxTicksLimit = 12) {
    const mobile = isProductMobileViewport();
    return {
        color,
        autoSkip: true,
        maxTicksLimit: mobile ? Math.min(maxTicksLimit, 5) : maxTicksLimit,
        maxRotation: 0,
        minRotation: 0,
        padding: mobile ? 3 : 8,
        ...(mobile ? { font: { size: 8 } } : {})
    };
}

/** 产品区纵轴（净值、百分比等）：手机端缩小字号，与横轴一致 */
function getUnifiedYAxisTicks(color, extra = {}) {
    const mobile = isProductMobileViewport();
    return {
        color,
        ...extra,
        ...(mobile ? { font: { size: 8 } } : {})
    };
}

/** 产品区图例文字：整体比 Chart 默认小一号；手机端再略小 */
function getUnifiedLegendLabels(color) {
    const mobile = isProductMobileViewport();
    return {
        color,
        font: {
            size: mobile ? 10 : 11
        }
    };
}

function getUnifiedChartPadding() {
    return {
        left: 4,
        right: 8,
        top: 4,
        bottom: 14
    };
}

function applyBalancedChartContainerStyle(containerId) {
    const chartContainer = document.getElementById(containerId);
    if (chartContainer) {
        chartContainer.style.background = BALANCED_CHART_STYLE.chartBg;
        chartContainer.style.borderRadius = '10px';
        chartContainer.style.padding = '12px 12px 6px 8px';
    }
}

/** 统一为 YYYY-MM-DD，与 benchmark.csv 的 timestamp、各 CSV 日期字段对齐（避免 2025-4-24 与 2025-04-24 无法匹配） */
function normalizeDateKey(input) {
    if (input == null || input === '') return '';
    const raw = String(input).trim();
    const datePart = raw.split(/[\sT]/)[0];
    const normalized = datePart.replace(/\//g, '-');
    const parts = normalized.split('-').filter(Boolean);
    if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(day)) {
            return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calculateReturnRate(data) {
    if (data.length < 2) return null;
    const firstValue = data[0].nav;
    const lastValue = data[data.length - 1].nav;
    const returnRate = ((lastValue - firstValue) / firstValue * 100).toFixed(2);
    return returnRate;
}

function calculateActiveDays(data) {
    let activeDays = 0;
    const GAP_THRESHOLD = 7;
    for (let i = 1; i < data.length; i++) {
        const diff = (new Date(data[i].date) - new Date(data[i-1].date)) / 86400000;
        if (diff <= GAP_THRESHOLD) {
            activeDays += diff;
        }
    }
    return activeDays;
}

function calculateAnnualizedReturn(data) {
    if (data.length < 2) return null;
    const firstValue = data[0].nav;
    const lastValue = data[data.length - 1].nav;
    const days = calculateActiveDays(data);
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

function loadBalancedBenchmarkData(callback) {
    if (balancedBenchmarkDataLoaded) {
        if (callback) callback();
        return;
    }
    Papa.parse(DATA_BASE_URL + '/benchmark.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            balancedBenchmarkData = results.data
                .filter(row => row.timestamp && row.benchmark === '90tbill_10btc')
                .map(row => ({
                    date: normalizeDateKey(row.timestamp),
                    // 给“平衡系列”使用：目前是 90tbill_10btc 的 daily return
                    dailyReturn: parseFloat(row.return_1d),
                    // 给“稳健系列”使用：纯国债 T-Bill 的 daily return
                    tbillDailyReturn: parseFloat(row.tbill_return),
                    // 给“进取系列”使用：纯BTC的价格（用于缩放为 NAV）
                    btcPrice: parseFloat(row.btc_price)
                }))
                .filter(row =>
                    !Number.isNaN(row.dailyReturn) &&
                    !Number.isNaN(row.tbillDailyReturn) &&
                    !Number.isNaN(row.btcPrice)
                )
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            balancedBenchmarkDataLoaded = true;
            if (callback) callback();
        },
        error: function(error) {
            console.error('加载benchmark.csv失败:', error);
            balancedBenchmarkData = [];
            balancedBenchmarkDataLoaded = true;
            if (callback) callback();
        }
    });
}

function buildBalancedBenchmarkSeries(dataSlice) {
    if (!dataSlice.length || !balancedBenchmarkData.length) return [];

    const dateSet = new Set(dataSlice.map(d => d.date));
    const filteredBenchmark = balancedBenchmarkData.filter(d => dateSet.has(d.date));
    if (!filteredBenchmark.length) return [];

    const baseNav = dataSlice[0].nav;
    let benchmarkNav = baseNav;

    return filteredBenchmark.map((item, idx) => {
        if (idx > 0) {
            benchmarkNav = benchmarkNav * (1 + item.dailyReturn);
        }
        return {
            date: item.date,
            nav: benchmarkNav
        };
    });
}

function buildTbillBenchmarkSeries(dataSlice) {
    if (!dataSlice.length || !balancedBenchmarkData.length) return [];

    const dateSet = new Set(dataSlice.map(d => d.date));
    const filteredBenchmark = balancedBenchmarkData.filter(d => dateSet.has(d.date));
    if (!filteredBenchmark.length) return [];

    const baseNav = dataSlice[0].nav;
    let benchmarkNav = baseNav;

    return filteredBenchmark.map((item, idx) => {
        if (idx > 0) {
            benchmarkNav = benchmarkNav * (1 + item.tbillDailyReturn);
        }
        return {
            date: item.date,
            nav: benchmarkNav
        };
    });
}

function buildBtcPriceBenchmarkSeries(dataSlice) {
    if (!dataSlice.length || !balancedBenchmarkData.length) return [];

    const dateSet = new Set(dataSlice.map(d => d.date));
    const filteredBenchmark = balancedBenchmarkData.filter(d => dateSet.has(d.date));
    if (!filteredBenchmark.length) return [];

    const baseNav = dataSlice[0].nav;
    const baseBtcPrice = filteredBenchmark[0].btcPrice;
    if (!baseBtcPrice) return [];

    return filteredBenchmark.map(item => ({
        date: item.date,
        nav: baseNav * (item.btcPrice / baseBtcPrice)
    }));
}

function buildBtcMultipliedSeries(dataSlice) {
    if (!dataSlice.length || !balancedBenchmarkData.length) {
        return dataSlice.map(item => item.nav);
    }

    const btcPriceMap = new Map(
        balancedBenchmarkData
            .filter(item => item.date && Number.isFinite(item.btcPrice))
            .map(item => [item.date, item.btcPrice])
    );

    return dataSlice.map(item => {
        const btcPrice = btcPriceMap.get(item.date);
        return Number.isFinite(btcPrice) ? item.nav * btcPrice : item.nav;
    });
}

function normalizeSeries(values) {
    if (!Array.isArray(values) || !values.length) return values || [];
    const firstValid = values.find(v => Number.isFinite(v) && v !== 0);
    if (!Number.isFinite(firstValid) || firstValid === 0) return values;
    return values.map(v => (Number.isFinite(v) ? v / firstValid : v));
}

function renderBalancedChart(rangeDays = 30) {
    if (!balancedData.length) return;
    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = balancedData;
    } else {
        dataSlice = balancedData.slice(-rangeDays);
    }
    const benchmarkSeries = buildBalancedBenchmarkSeries(dataSlice);
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);
    const benchmarkValueMap = new Map(benchmarkSeries.map(d => [d.date, d.nav]));
    const benchmarkValues = labels.map(date => benchmarkValueMap.has(date) ? benchmarkValueMap.get(date) : null);
    const chartContainer = document.getElementById('balanced-chart-container');
    if (chartContainer) {
        chartContainer.style.background = BALANCED_CHART_STYLE.chartBg;
        chartContainer.style.borderRadius = '10px';
        chartContainer.style.padding = '12px 12px 6px 8px';
    }
    const ctx = document.getElementById('balancedChart').getContext('2d');
    if (balancedChart) balancedChart.destroy();
    balancedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: BALANCED_CHART_STYLE.navLabel,
                    data: values,
                    borderColor: BALANCED_CHART_STYLE.navColor,
                    backgroundColor: 'transparent',
                    pointRadius: BALANCED_CHART_STYLE.pointRadius,
                    tension: 0.2,
                    fill: {
                        target: 1,
                        above: BALANCED_CHART_STYLE.areaAbove,
                        below: 'rgba(26,37,48,0)'
                    },
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.navBorderWidth
                },
                {
                    label: BENCHMARK_LABELS.mixed,
                    data: benchmarkValues,
                    borderColor: BALANCED_CHART_STYLE.benchmarkColor,
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    borderDash: BALANCED_CHART_STYLE.benchmarkDash,
                    tension: 0.2,
                    fill: false,
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.benchmarkBorderWidth
                }
            ]
        },
        options: {
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: BALANCED_CHART_STYLE.legendDisplay,
                    labels: getUnifiedLegendLabels(BALANCED_CHART_STYLE.tickColor)
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // 仅显示产品 NAV，不显示 benchmark 数值（和稳健系列一致）
                            if (context.datasetIndex !== 0) return null;
                            return '单位净值: ' + context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedXAxisTicks(BALANCED_CHART_STYLE.tickColor, 11),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedYAxisTicks(BALANCED_CHART_STYLE.tickColor, {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }),
                    grid: { color: BALANCED_CHART_STYLE.gridColor },
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

    const facts = productData['balanced'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';
    facts[4].value = sharpe ? sharpe : '';
    facts[6].value = returnRate ? returnRate + '%' : '';
    facts[7].value = annualized ? annualized + '%' : '';

    updateMetricsBar(facts);
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
                date: normalizeDateKey(row['Date']),
                nav: parseFloat(row['NAV per unit'])
            }));
            balancedDataLoaded = true;
            loadBalancedBenchmarkData(function() {
                renderBalancedChart(rangeDays);
                const monthlyData = calculateMonthlyPnL(balancedData);
                renderMonthlyPnLChart('balancedMonthlyPnLChart', monthlyData);
                if (callback) callback();
            });
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
        chartControls.querySelectorAll('button[data-range]').forEach(btn => {
            btn.addEventListener('click', function() {
                const days = this.getAttribute('data-range');
                // 移除所有按钮的active类
                chartControls.querySelectorAll('button[data-range]').forEach(b => b.classList.remove('active'));
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
            <div class="product-detail">
                <h3 class="product-title">${productData['balanced'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
                <p class="product-subtitle">平衡型策略</p>
                <p class="product-desc">${productData['balanced'].desc}</p>
                <div class="chart-controls" id="balanced-chart-controls">
                    <button class="btn btn-sm chart-range-btn" data-range="7">7天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="30">30天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="180">180天</button>
                    <button class="btn btn-sm chart-range-btn active" data-range="all">累计</button>
                </div>
                <div class="chart-container mb-4" id="balanced-chart-container">
                    <h6 class="chart-section-title">累计净值走势</h6>
                    <canvas id="balancedChart" height="320"></canvas>
                </div>
                <div class="metrics-bar d-flex justify-content-around text-center mt-3 mb-4" id="balanced-metrics-bar"></div>
                <div class="chart-container" id="balanced-monthly-pnl-container">
                    <h6 class="chart-section-title">月度盈亏 <span class="text-muted" style="font-size:0.8rem;">（成立以来）</span></h6>
                    <canvas id="balancedMonthlyPnLChart" height="200"></canvas>
                </div>
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
let stableCoinBtcNavChart = null;
let stableCoinBtcComboChart = null;
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
            loadBalancedBenchmarkData(function() {
                renderStableCoinBtcChart(rangeDays);
                const monthlyData = calculateMonthlyPnL(stableCoinBtcData);
                renderMonthlyPnLChart('stableCoinBtcMonthlyPnLChart', monthlyData);
                if (callback) callback();
            });
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
    const originalNavValues = dataSlice.map(d => d.nav);

    // 单位净值×BTC 对比图：始终用成立以来全量数据，不随上方时间范围切换
    const comboSlice = stableCoinBtcData;
    const comboLabels = comboSlice.map(d => d.date);
    const multipliedNavValues = normalizeSeries(buildBtcMultipliedSeries(comboSlice));
    const btcBenchmarkSeries = buildBtcPriceBenchmarkSeries(comboSlice);
    const btcBenchmarkValueMap = new Map(btcBenchmarkSeries.map(d => [d.date, d.nav]));
    const btcBenchmarkValues = normalizeSeries(
        comboLabels.map(date => btcBenchmarkValueMap.has(date) ? btcBenchmarkValueMap.get(date) : null)
    );

    applyBalancedChartContainerStyle('stable-coin-btc-nav-chart-container');
    applyBalancedChartContainerStyle('stable-coin-btc-combo-chart-container');

    const navCtx = document.getElementById('stableCoinBtcNavChart').getContext('2d');
    if (stableCoinBtcNavChart) stableCoinBtcNavChart.destroy();
    stableCoinBtcNavChart = new Chart(navCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '单位净值',
                    data: originalNavValues,
                    borderColor: BALANCED_CHART_STYLE.navColor,
                    backgroundColor: 'transparent',
                    pointRadius: BALANCED_CHART_STYLE.pointRadius,
                    tension: 0.2,
                    fill: {
                        target: 1,
                        above: BALANCED_CHART_STYLE.areaAbove,
                        below: 'rgba(26,37,48,0)'
                    },
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.navBorderWidth
                }
            ]
        },
        options: {
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: BALANCED_CHART_STYLE.legendDisplay,
                    labels: getUnifiedLegendLabels(BALANCED_CHART_STYLE.tickColor)
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
                    ticks: getUnifiedXAxisTicks(BALANCED_CHART_STYLE.tickColor, 11),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedYAxisTicks(BALANCED_CHART_STYLE.tickColor, {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { borderWidth: 2 } }
        }
    });

    const comboCtx = document.getElementById('stableCoinBtcComboChart').getContext('2d');
    if (stableCoinBtcComboChart) stableCoinBtcComboChart.destroy();
    stableCoinBtcComboChart = new Chart(comboCtx, {
        type: 'line',
        data: {
            labels: comboLabels,
            datasets: [
                {
                    label: '单位净值 × BTC',
                    data: multipliedNavValues,
                    borderColor: BALANCED_CHART_STYLE.navColor,
                    backgroundColor: 'transparent',
                    pointRadius: BALANCED_CHART_STYLE.pointRadius,
                    tension: 0.2,
                    fill: false,
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.navBorderWidth
                },
                {
                    label: BENCHMARK_LABELS.btcPrice,
                    data: btcBenchmarkValues,
                    borderColor: '#f59e0b',
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    borderDash: [6, 3],
                    tension: 0.2,
                    fill: false,
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.benchmarkBorderWidth
                }
            ]
        },
        options: {
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: BALANCED_CHART_STYLE.legendDisplay,
                    labels: getUnifiedLegendLabels(BALANCED_CHART_STYLE.tickColor)
                }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedXAxisTicks(BALANCED_CHART_STYLE.tickColor, 11),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedYAxisTicks(BALANCED_CHART_STYLE.tickColor, {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
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
    facts[4].value = sharpe ? sharpe : '';
    facts[6].value = returnRate ? returnRate + '%' : '';
    facts[7].value = annualized ? annualized + '%' : '';

    updateMetricsBar(facts);
}

function showStableCoinBtcProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable-coin-btc']) {
        perfContent.innerHTML = `
            <div class="product-detail">
                <h3 class="product-title">${productData['stable-coin-btc'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
                <p class="product-subtitle">稳健套利策略-币本位</p>
                <p class="product-desc">${productData['stable-coin-btc'].desc}</p>
                <div class="chart-controls" id="stable-coin-btc-chart-controls">
                    <button class="btn btn-sm chart-range-btn" data-range="7">7天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="30">30天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="180">180天</button>
                    <button class="btn btn-sm chart-range-btn active" data-range="all">累计</button>
                </div>
                <div class="chart-container mb-4" id="stable-coin-btc-nav-chart-container">
                    <h6 class="chart-section-title">累计净值走势</h6>
                    <canvas id="stableCoinBtcNavChart" height="320"></canvas>
                </div>
                <div class="metrics-bar d-flex justify-content-around text-center mt-3 mb-4" id="stable-coin-btc-metrics-bar"></div>
                <div class="chart-container mb-4" id="stable-coin-btc-combo-chart-container">
                    <h6 class="chart-section-title">单位净值 × BTC vs Benchmark BTC Price（归一化）<span class="text-muted" style="font-size:0.8rem;">（成立以来）</span></h6>
                    <canvas id="stableCoinBtcComboChart" height="320"></canvas>
                </div>
                <div class="chart-container" id="stable-coin-btc-monthly-pnl-container">
                    <h6 class="chart-section-title">月度盈亏 <span class="text-muted" style="font-size:0.8rem;">（成立以来）</span></h6>
                    <canvas id="stableCoinBtcMonthlyPnLChart" height="200"></canvas>
                </div>
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
    const navContainer = document.getElementById('stable-coin-btc-nav-chart-container');
    const comboContainer = document.getElementById('stable-coin-btc-combo-chart-container');
    if (navContainer) navContainer.style.display = 'block';
    if (comboContainer) comboContainer.style.display = 'block';
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

// 添加稳健系列-U本位业绩图表逻辑（合并 1.0 + 2.0）
let stableUsdChart = null;
let stableUsdData = [];
let stableUsdDataLoaded = false;

function loadStableUsdCSVAndDraw(rangeDays = 30, callback) {
    const t = new Date().getTime();
    let data1 = [], data2 = [], loaded = 0;
    const total = 2;

    function tryMerge() {
        loaded++;
        if (loaded < total) return;

        if (data1.length && data2.length) {
            const lastNav1 = data1[data1.length - 1].nav;
            const firstNav2 = data2[0].nav;
            const adjustedData2 = data2.map(row => ({
                date: row.date,
                nav: lastNav1 * (row.nav / firstNav2)
            }));

            const lastDate1 = data1[data1.length - 1].date;
            const firstDate2 = adjustedData2[0].date;
            stableUsdData = [
                ...data1,
                { date: lastDate1, nav: null, _gapStart: true },
                { date: firstDate2, nav: null, _gapEnd: true },
                ...adjustedData2
            ];
        } else if (data1.length) {
            stableUsdData = data1;
        } else {
            stableUsdData = data2;
        }

        stableUsdDataLoaded = true;
        loadBalancedBenchmarkData(function() {
            renderStableUsdChart(rangeDays);
            const realData = stableUsdData.filter(d => d.nav !== null);
            const monthlyData = calculateMonthlyPnL(realData);
            renderMonthlyPnLChart('stableUsdMonthlyPnLChart', monthlyData);
            if (callback) callback();
        });
    }

    Papa.parse(DATA_BASE_URL + '/arbitrage.csv?t=' + t, {
        download: true, header: true,
        complete: function(results) {
            data1 = results.data
                .filter(row => row.Date && row['NAV per unit'])
                .map(row => ({ date: row.Date, nav: parseFloat(row['NAV per unit']) }));
            tryMerge();
        },
        error: function() { tryMerge(); }
    });

    Papa.parse(DATA_BASE_URL + '/arbitrage2.csv?t=' + t, {
        download: true, header: true,
        complete: function(results) {
            data2 = results.data
                .filter(row => row && row.Date && row['NAV per unit'] && !isNaN(parseFloat(row['NAV per unit'])))
                .map(row => ({ date: formatDateToYMD(row.Date), nav: parseFloat(row['NAV per unit']) }));
            tryMerge();
        },
        error: function() { tryMerge(); }
    });
}

const stableUsdGapAnnotationPlugin = {
    id: 'stableUsdGapAnnotation',
    afterDraw(chart) {
        const meta = chart._stableUsdGapMeta;
        if (!meta) return;
        const { gapStartIdx, gapEndIdx } = meta;
        if (gapStartIdx < 0 || gapEndIdx < 0) return;

        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const ctx = chart.ctx;
        const x1 = xScale.getPixelForValue(gapStartIdx);
        const x2 = xScale.getPixelForValue(gapEndIdx);
        const top = yScale.top;
        const bottom = yScale.bottom;

        ctx.save();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.fillRect(x1, top, x2 - x1, bottom - top);

        // 文字固定放在图表右下角，并限制在可视区域内避免被截断
        const right = xScale.right - 8;
        const yLine2 = bottom - 10;
        const yLine1 = yLine2 - 22;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('策略升级优化期', right, yLine1);
        ctx.fillText('(2025.12 - 2026.01)', right, yLine2);
        ctx.restore();
    }
};

function renderStableUsdChart(rangeDays = 30) {
    if (!stableUsdData.length) return;
    const latestRealPoint = [...stableUsdData].reverse().find(d => d.nav !== null);
    if (!latestRealPoint) return;

    let dataSlice;
    if (rangeDays === 'all') {
        dataSlice = stableUsdData;
    } else {
        const days = Number(rangeDays);
        if (!Number.isFinite(days) || days <= 0) return;

        const endDate = new Date(latestRealPoint.date);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - days);

        dataSlice = stableUsdData.filter(d => {
            const cur = new Date(d.date);
            return cur >= startDate && cur <= endDate;
        });
    }
    const labels = dataSlice.map(d => d.date);
    const values = dataSlice.map(d => d.nav);

    const realDataSlice = dataSlice.filter(d => d.nav !== null);
    const benchmarkSeries = buildTbillBenchmarkSeries(realDataSlice);
    const benchmarkValueMap = new Map(benchmarkSeries.map(d => [d.date, d.nav]));
    const benchmarkValues = labels.map(date => benchmarkValueMap.has(date) ? benchmarkValueMap.get(date) : null);

    let gapStartIdx = -1, gapEndIdx = -1;
    dataSlice.forEach((d, i) => {
        if (d._gapStart) gapStartIdx = i;
        if (d._gapEnd) gapEndIdx = i;
    });

    applyBalancedChartContainerStyle('stable-usd-chart-container');

    const ctx = document.getElementById('stableUsdChart').getContext('2d');
    if (stableUsdChart) stableUsdChart.destroy();
    stableUsdChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: BALANCED_CHART_STYLE.navLabel,
                    data: values,
                    borderColor: BALANCED_CHART_STYLE.navColor,
                    backgroundColor: 'transparent',
                    pointRadius: BALANCED_CHART_STYLE.pointRadius,
                    tension: 0.2,
                    fill: {
                        target: 1,
                        above: BALANCED_CHART_STYLE.areaAbove,
                        below: 'rgba(26,37,48,0)'
                    },
                    spanGaps: false,
                    borderWidth: BALANCED_CHART_STYLE.navBorderWidth
                },
                {
                    label: BENCHMARK_LABELS.tbill,
                    data: benchmarkValues,
                    borderColor: BALANCED_CHART_STYLE.benchmarkColor,
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    borderDash: BALANCED_CHART_STYLE.benchmarkDash,
                    tension: 0.2,
                    fill: false,
                    spanGaps: false,
                    borderWidth: BALANCED_CHART_STYLE.benchmarkBorderWidth
                }
            ]
        },
        options: {
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: BALANCED_CHART_STYLE.legendDisplay,
                    labels: getUnifiedLegendLabels(BALANCED_CHART_STYLE.tickColor)
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex !== 0) return null;
                            if (context.parsed.y === null) return null;
                            return '单位净值: ' + context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedXAxisTicks(BALANCED_CHART_STYLE.tickColor, 11),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedYAxisTicks(BALANCED_CHART_STYLE.tickColor, {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { borderWidth: 2 } }
        },
        plugins: [stableUsdGapAnnotationPlugin]
    });
    stableUsdChart._stableUsdGapMeta = { gapStartIdx, gapEndIdx };

    const metricsData = dataSlice.filter(d => d.nav !== null);
    const returnRate = calculateReturnRate(metricsData);
    const annualized = calculateAnnualizedReturn(metricsData);
    const sharpe = calculateAnnualizedSharpe(metricsData);
    const maxDrawdown = calculateMaxDrawdown(metricsData);

    const facts = productData['stable-usd'].facts;
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';
    facts[4].value = sharpe ? sharpe : '';
    facts[6].value = returnRate ? returnRate + '%' : '';
    facts[7].value = annualized ? annualized + '%' : '';

    updateMetricsBar(facts);
}

function showStableUsdProductSection(rangeDays = 30) {
    // 1. 生成内容
    if (perfContent && productData['stable-usd']) {
        perfContent.innerHTML = `
            <div class="product-detail">
                <h3 class="product-title">${productData['stable-usd'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
                <p class="product-subtitle">稳健套利策略-U本位</p>
                <p class="product-desc">${productData['stable-usd'].desc}</p>
                <div class="chart-controls" id="stable-usd-chart-controls">
                    <button class="btn btn-sm chart-range-btn" data-range="7">7天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="30">30天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="180">180天</button>
                    <button class="btn btn-sm chart-range-btn active" data-range="all">累计</button>
                </div>
                <div class="chart-container mb-4" id="stable-usd-chart-container">
                    <h6 class="chart-section-title">累计净值走势</h6>
                    <canvas id="stableUsdChart" height="320"></canvas>
                </div>
                <div class="metrics-bar d-flex justify-content-around text-center mt-3 mb-4" id="stable-usd-metrics-bar"></div>
                <div class="chart-container" id="stable-usd-monthly-pnl-container">
                    <h6 class="chart-section-title">月度盈亏 <span class="text-muted" style="font-size:0.8rem;">（成立以来）</span></h6>
                    <canvas id="stableUsdMonthlyPnLChart" height="200"></canvas>
                </div>
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


// 页面初始自动选中平衡型FOF并显示图表
window.addEventListener('DOMContentLoaded', function() {
    if (productList) {
        productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const balancedBtn = productList.querySelector('button[data-product="balanced"]');
        if (balancedBtn) balancedBtn.classList.add('active');
    }
    showBalancedProductSection('all'); // 默认显示成立以来
});

let monthlyPnLCharts = {};

function calculateMonthlyPnL(data) {
    if (!data || data.length < 2) return [];
    const grouped = {};
    data.forEach(item => {
        const d = new Date(item.date);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    });
    const result = [];
    Object.keys(grouped).sort().forEach(month => {
        const items = grouped[month].sort((a, b) => new Date(a.date) - new Date(b.date));
        if (items.length < 2) return;
        const first = items[0].nav;
        const last = items[items.length - 1].nav;
        const pnl = ((last - first) / first * 100);
        result.push({ month, pnl: parseFloat(pnl.toFixed(2)) });
    });
    return result;
}

function renderMonthlyPnLChart(canvasId, monthlyData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !monthlyData.length) return;
    if (monthlyPnLCharts[canvasId]) monthlyPnLCharts[canvasId].destroy();
    const labels = monthlyData.map(d => d.month);
    const values = monthlyData.map(d => d.pnl);
    const colors = values.map(v => v >= 0 ? '#22c55e' : '#ef4444');
    monthlyPnLCharts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderRadius: 3,
                maxBarThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => (ctx.parsed.y >= 0 ? '+' : '') + ctx.parsed.y.toFixed(2) + '%'
                    }
                },
                datalabels: undefined
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: getUnifiedXAxisTicks('#6c757d', 12)
                },
                y: {
                    grid: { color: 'rgba(148,163,184,0.12)' },
                    ticks: getUnifiedYAxisTicks('#6c757d', {
                        callback: v => v.toFixed(1) + '%'
                    })
                }
            }
        }
    });
}

const METRICS_LABELS = ['最大回撤', 'Sharpe比率', '区间收益率', '预计年化收益率'];

function renderMetricsBar(facts) {
    const metrics = facts.filter(f => METRICS_LABELS.includes(f.label));
    return metrics.map(m =>
        `<div class="metric-item"><div class="metric-value">${m.value || '--'}</div><div class="metric-label">${m.label}</div></div>`
    ).join('');
}

function updateMetricsBar(facts) {
    const bar = document.querySelector('#product-performance-content .metrics-bar');
    if (bar) bar.innerHTML = renderMetricsBar(facts);
}

// 登录模块和个人投资摘要
let currentUser = null;

/**
 * 生成 SHA-256 hash 的辅助函数
 * 优先使用 crypto.subtle，如果不可用则使用 crypto-js 作为降级方案
 */
async function generateSHA256Hash(input) {
    // 优先尝试使用 crypto.subtle（在安全上下文中可用）
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray;
        } catch (error) {
            console.warn('crypto.subtle failed, falling back to crypto-js:', error);
        }
    }
    
    // 降级方案：使用 crypto-js（适用于非安全上下文，如局域网 IP 访问）
    if (typeof CryptoJS !== 'undefined' && CryptoJS.SHA256) {
        try {
            const hash = CryptoJS.SHA256(input);
            const hashHex = hash.toString(CryptoJS.enc.Hex);
            // 将 hex 字符串转换为字节数组
            const hashArray = [];
            for (let i = 0; i < hashHex.length; i += 2) {
                hashArray.push(parseInt(hashHex.substring(i, i + 2), 16));
            }
            return hashArray;
        } catch (error) {
            console.error('crypto-js fallback failed:', error);
            throw new Error('无法生成密码哈希，请确保已加载 crypto-js 库');
        }
    }
    
    // 如果两种方法都不可用
    throw new Error('当前环境不支持安全登录功能，请使用现代浏览器（Chrome、Firefox、Safari、Edge 等）');
}

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
        // 生成用户凭证的hash（使用降级方案支持非安全上下文）
        const combined = username.toLowerCase() + ':' + password;
        const hashArray = await generateSHA256Hash(combined);
        
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
        // 这里是"真正的异常"：加密能力不可用、运行环境不支持等
        // 给出更明确的提示，避免用户以为是密码问题
        let message = '登录过程中发生错误，请稍后重试';
        
        // 检查错误类型
        if (error.message && error.message.includes('无法生成密码哈希')) {
            message = error.message;
        } else if (error.message && error.message.includes('不支持安全登录')) {
            message = error.message;
        } else if (error.name === 'TypeError' && error.message && error.message.includes('crypto')) {
            // 其他与 crypto 相关的错误
            message = '加密功能初始化失败，请刷新页面重试。如果问题持续，请使用现代浏览器访问';
        } else {
            // 其他未知错误，显示更详细的信息用于调试
            message = `登录失败: ${error.message || '未知错误'}。请检查网络连接或稍后重试`;
        }
        
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
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
    const investmentSummary = document.getElementById('investment-summary');
    if (!investmentSummary) {
        console.error('investment-summary element not found');
        return;
    }
    renderInvestorSummarySection(investmentSummary, currentUserData, currentUser, {
        showActionButtons: true,
        onRedemptionClick: () => showRedemptionModal(),
        onCurrencyConversionClick: () => showCurrencyConversionModal(),
    });
}

function updateUIAfterLogin() {
    const username = currentUser || '';

    const navLoginBtn = document.getElementById('navLoginBtn');
    if (navLoginBtn) {
        const navLoginItem = navLoginBtn.closest('.nav-item');
        if (navLoginItem) {
            navLoginItem.style.display = 'none';
        } else {
            navLoginBtn.style.display = 'none';
        }
        const userMenuContainer = document.createElement('li');
        userMenuContainer.id = 'navUserMenu';
        userMenuContainer.className = 'nav-item nav-user-menu';
        userMenuContainer.innerHTML = `<span class="nav-welcome-text">欢迎回来，${username}</span><a class="nav-link nav-logout-link" href="javascript:void(0)" id="logoutButton">退出</a>`;
        const navParent = navLoginItem ? navLoginItem.parentNode : navLoginBtn.parentNode;
        const referenceNode = navLoginItem ? navLoginItem.nextSibling : navLoginBtn.nextSibling;
        navParent.insertBefore(userMenuContainer, referenceNode);
        document.getElementById('logoutButton').addEventListener('click', handleLogout);
    }

    const investmentSummaryLink = document.getElementById('investmentSummaryLink');
    if (investmentSummaryLink) {
        investmentSummaryLink.style.display = '';
    }
}

function handleLogout() {
    currentUser = null;

    const navLoginBtn = document.getElementById('navLoginBtn');
    if (navLoginBtn) {
        const navLoginItem = navLoginBtn.closest('.nav-item');
        if (navLoginItem) {
            navLoginItem.style.display = '';
        } else {
            navLoginBtn.style.display = '';
        }
    }

    const investmentSummaryLink = document.getElementById('investmentSummaryLink');
    if (investmentSummaryLink) {
        investmentSummaryLink.style.display = 'none';
    }

    const navUserMenu = document.getElementById('navUserMenu');
    if (navUserMenu) {
        navUserMenu.remove();
    }

    const investmentSummary = document.getElementById('investment-summary');
    if (investmentSummary) {
        investmentSummary.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const navLoginBtn = document.getElementById('navLoginBtn');
    if (navLoginBtn) {
        navLoginBtn.addEventListener('click', function() {
            showLoginModal();
        });
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

    // 进取系列统一：Benchmark 1（BTC 价格，纯BTC）
    const benchmarkSeries = buildBtcPriceBenchmarkSeries(dataSlice);
    const benchmarkValueMap = new Map(benchmarkSeries.map(d => [d.date, d.nav]));
    const benchmarkValues = labels.map(date => benchmarkValueMap.has(date) ? benchmarkValueMap.get(date) : null);

    applyBalancedChartContainerStyle('aggressive-chart-container');

    const ctx = document.getElementById('aggressiveChart').getContext('2d');
    if (aggressiveChart) aggressiveChart.destroy();
    aggressiveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: BALANCED_CHART_STYLE.navLabel,
                    data: values,
                    borderColor: BALANCED_CHART_STYLE.navColor,
                    backgroundColor: 'transparent',
                    pointRadius: BALANCED_CHART_STYLE.pointRadius,
                    tension: 0.2,
                    fill: {
                        target: 1,
                        above: BALANCED_CHART_STYLE.areaAbove,
                        below: 'rgba(26,37,48,0)'
                    },
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.navBorderWidth
                },
                {
                    label: BENCHMARK_LABELS.btcPrice,
                    data: benchmarkValues,
                    borderColor: BALANCED_CHART_STYLE.benchmarkColor,
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    borderDash: BALANCED_CHART_STYLE.benchmarkDash,
                    tension: 0.2,
                    fill: false,
                    spanGaps: true,
                    borderWidth: BALANCED_CHART_STYLE.benchmarkBorderWidth
                }
            ]
        },
        options: {
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: BALANCED_CHART_STYLE.legendDisplay,
                    labels: getUnifiedLegendLabels(BALANCED_CHART_STYLE.tickColor)
                },
                tooltip: {
                    filter: function(item) {
                        return item.datasetIndex === 0;
                    },
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
                    ticks: getUnifiedXAxisTicks(BALANCED_CHART_STYLE.tickColor, 11),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedYAxisTicks(BALANCED_CHART_STYLE.tickColor, {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
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
    facts[2].value = maxDrawdown ? maxDrawdown + '%' : '';
    facts[4].value = sharpe ? sharpe : '';
    facts[6].value = returnRate ? returnRate + '%' : '';
    facts[7].value = annualized ? annualized + '%' : '';

    updateMetricsBar(facts);
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
                    date: normalizeDateKey(row.Date),
                    nav: parseFloat(row['NAV per unit'])
                }));
            aggressiveDataLoaded = true;
            loadBalancedBenchmarkData(function() {
                renderAggressiveChart(rangeDays);
                if (callback) callback();
            });
        }
    });
}

// 完整业绩图表（测试期 + 实盘期）
let aggressiveFullChart = null;

function loadAndRenderFullPerformanceChart() {
    Papa.parse(DATA_BASE_URL + '/testfund.csv?t=' + new Date().getTime(), {
        download: true,
        header: true,
        complete: function(results) {
            const testData = results.data
                .filter(row => row.date && row.navperunit && row.model === 'deep-growth')
                .map(row => ({
                    date: normalizeDateKey(row.date),
                    nav: parseFloat(row.navperunit)
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (!testData.length) return;

            const lastTestNav = testData[testData.length - 1].nav;

            const liveData = aggressiveData.map(d => ({
                date: d.date,
                nav: d.nav
            }));

            let scaledLiveData = [];
            if (liveData.length > 0) {
                const firstLiveNav = liveData[0].nav;
                scaledLiveData = liveData.map(d => ({
                    date: d.date,
                    nav: lastTestNav * (d.nav / firstLiveNav)
                }));
            }

            renderFullPerformanceChart(testData, scaledLiveData);

            const testEndDate = testData[testData.length - 1].date;
            const combinedData = [...testData, ...scaledLiveData];
            renderAggressiveMonthlyPnLWithTestPeriod(combinedData, testEndDate);
        }
    });
}

function renderFullPerformanceChart(testData, liveData) {
    const container = document.getElementById('aggressive-full-chart-container');
    if (!container) return;
    applyBalancedChartContainerStyle('aggressive-full-chart-container');

    const testLabels = testData.map(d => d.date);
    const testValues = testData.map(d => d.nav);
    const liveLabels = liveData.map(d => d.date);
    const liveValues = liveData.map(d => d.nav);

    const allLabels = [...testLabels, ...liveLabels];
    const testLen = testLabels.length;

    const combinedNavValues = allLabels.map((_, i) =>
        i < testLen ? testValues[i] : liveValues[i - testLen]
    );

    const combinedDataForBtc = allLabels.map((date, i) => ({
        date,
        nav: combinedNavValues[i]
    }));

    const benchmarkSeries = buildBtcPriceBenchmarkSeries(combinedDataForBtc);
    const benchmarkValueMap = new Map(benchmarkSeries.map(d => [d.date, d.nav]));
    const benchmarkValues = allLabels.map(date =>
        benchmarkValueMap.has(date) ? benchmarkValueMap.get(date) : null
    );
    const hasBenchmark = benchmarkValues.some(v => v != null && Number.isFinite(v));

    const transitionIndex = testLen - 1;

    const ctx = document.getElementById('aggressiveFullChart').getContext('2d');
    if (aggressiveFullChart) aggressiveFullChart.destroy();

    const navDataset = {
        label: '累计净值',
        data: combinedNavValues,
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        pointRadius: 0,
        tension: 0.2,
        fill: hasBenchmark
            ? {
                target: 1,
                above: BALANCED_CHART_STYLE.areaAbove,
                below: 'rgba(26,37,48,0)'
            }
            : false,
        spanGaps: false,
        borderWidth: 2,
        segment: {
            borderColor: ctx => (ctx.p1DataIndex < testLen ? '#94a3b8' : '#0f172a'),
            borderWidth: ctx => (ctx.p1DataIndex < testLen ? 2 : 2.5)
        }
    };

    const benchmarkDataset = {
        label: BENCHMARK_LABELS.btcPrice,
        data: benchmarkValues,
        borderColor: BALANCED_CHART_STYLE.benchmarkColor,
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderDash: BALANCED_CHART_STYLE.benchmarkDash,
        tension: 0.2,
        fill: false,
        spanGaps: true,
        borderWidth: BALANCED_CHART_STYLE.benchmarkBorderWidth
    };

    aggressiveFullChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: hasBenchmark ? [navDataset, benchmarkDataset] : [navDataset]
        },
        options: {
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    filter: function(item) {
                        return item.datasetIndex === 0;
                    },
                    callbacks: {
                        title: function(items) {
                            return items[0].label;
                        },
                        label: function(context) {
                            const prefix = context.dataIndex < testLen ? '测试期' : '实盘期';
                            return prefix + '净值: ' + context.parsed.y.toFixed(4);
                        }
                    }
                },
                annotation: {
                    annotations: {
                        transitionLine: {
                            type: 'line',
                            xMin: transitionIndex,
                            xMax: transitionIndex,
                            borderColor: 'rgba(239,68,68,0.45)',
                            borderWidth: 1.5,
                            borderDash: [6, 4],
                            label: {
                                display: true,
                                content: '实盘开始',
                                position: 'start',
                                backgroundColor: 'rgba(239,68,68,0.85)',
                                color: '#fff',
                                font: { size: 11 },
                                padding: 4
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedXAxisTicks(BALANCED_CHART_STYLE.tickColor, 10),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                },
                y: {
                    display: true,
                    title: { display: false },
                    ticks: getUnifiedYAxisTicks(BALANCED_CHART_STYLE.tickColor, {
                        callback: function(value) {
                            return value.toFixed(4);
                        }
                    }),
                    grid: { color: BALANCED_CHART_STYLE.gridColor }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            elements: { line: { borderWidth: 2 } }
        }
    });
}

function calculateMonthlyPnLSplitByPeriod(testData, liveData) {
    const result = [];

    function groupByMonth(data) {
        const grouped = {};
        data.forEach(item => {
            const d = new Date(item.date);
            const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        });
        return grouped;
    }

    const testGrouped = groupByMonth(testData);
    const liveGrouped = groupByMonth(liveData);

    const allMonths = new Set([...Object.keys(testGrouped), ...Object.keys(liveGrouped)]);
    const sortedMonths = [...allMonths].sort();

    for (const month of sortedMonths) {
        const hasTest = testGrouped[month] && testGrouped[month].length >= 2;
        const hasLive = liveGrouped[month] && liveGrouped[month].length >= 2;

        if (hasTest) {
            const items = testGrouped[month].sort((a, b) => new Date(a.date) - new Date(b.date));
            const pnl = ((items[items.length - 1].nav - items[0].nav) / items[0].nav * 100);
            const shortMonth = month.substring(2);
            result.push({ month, label: shortMonth + ' 测', pnl: parseFloat(pnl.toFixed(2)), isTest: true });
        }
        if (hasLive) {
            const items = liveGrouped[month].sort((a, b) => new Date(a.date) - new Date(b.date));
            const pnl = ((items[items.length - 1].nav - items[0].nav) / items[0].nav * 100);
            const shortMonth = month.substring(2);
            result.push({ month, label: shortMonth + ' 盘', pnl: parseFloat(pnl.toFixed(2)), isTest: false });
        }
        if (!hasTest && !hasLive) {
            const testItems = testGrouped[month] || [];
            const liveItems = liveGrouped[month] || [];
            const shortMonth = month.substring(2);
            if (testItems.length === 1) {
                result.push({ month, label: shortMonth + ' 测', pnl: 0, isTest: true });
            }
            if (liveItems.length === 1) {
                result.push({ month, label: shortMonth + ' 盘', pnl: 0, isTest: false });
            }
        }
    }
    return result;
}

function renderAggressiveMonthlyPnLWithTestPeriod(combinedData, testEndDate) {
    const canvasId = 'aggressiveMonthlyPnLChart';
    const canvas = document.getElementById(canvasId);
    if (!canvas || !combinedData || combinedData.length < 2) return;

    const testEndD = new Date(testEndDate);
    const testPart = combinedData.filter(d => new Date(d.date) <= testEndD);
    const livePart = combinedData.filter(d => new Date(d.date) > testEndD);

    const monthlyData = calculateMonthlyPnLSplitByPeriod(testPart, livePart);
    if (!monthlyData.length) return;

    if (monthlyPnLCharts[canvasId]) monthlyPnLCharts[canvasId].destroy();

    const labels = monthlyData.map(d => d.label);
    const values = monthlyData.map(d => d.pnl);
    const isTest = monthlyData.map(d => d.isTest);

    const colors = values.map((v, i) => {
        if (isTest[i]) {
            return v >= 0 ? 'rgba(34,197,94,0.40)' : 'rgba(239,68,68,0.40)';
        }
        return v >= 0 ? '#22c55e' : '#ef4444';
    });

    const borderColors = values.map((v, i) => {
        if (isTest[i]) {
            return v >= 0 ? 'rgba(34,197,94,0.60)' : 'rgba(239,68,68,0.60)';
        }
        return v >= 0 ? '#22c55e' : '#ef4444';
    });

    monthlyPnLCharts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: values.map((_, i) => isTest[i] ? 1.5 : 0),
                borderRadius: 3,
                maxBarThickness: 36
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: getUnifiedChartPadding()
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            const idx = items[0].dataIndex;
                            const d = monthlyData[idx];
                            const period = d.isTest ? '测试期' : '实盘期';
                            return d.month + '（' + period + '）';
                        },
                        label: ctx => (ctx.parsed.y >= 0 ? '+' : '') + ctx.parsed.y.toFixed(2) + '%'
                    }
                },
                datalabels: undefined
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: getUnifiedXAxisTicks('#6c757d', 12)
                },
                y: {
                    grid: { color: 'rgba(148,163,184,0.12)' },
                    ticks: getUnifiedYAxisTicks('#6c757d', {
                        callback: v => v.toFixed(1) + '%'
                    })
                }
            }
        }
    });
}

function showAggressiveProductSection(rangeDays = 30) {
    if (perfContent && productData['aggressive']) {
        perfContent.innerHTML = `
            <div class="product-detail">
                <h3 class="product-title">${productData['aggressive'].title} <span style="font-size:1.1rem;color:#666;">（运行中）</span></h3>
                <p class="product-subtitle">进取增长策略</p>
                <p class="product-desc">${productData['aggressive'].desc}</p>
                <div class="chart-controls" id="aggressive-chart-controls">
                    <button class="btn btn-sm chart-range-btn" data-range="7">7天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="30">30天</button>
                    <button class="btn btn-sm chart-range-btn" data-range="180">180天</button>
                    <button class="btn btn-sm chart-range-btn active" data-range="all">累计</button>
                </div>
                <div class="chart-container mb-4" id="aggressive-chart-container">
                    <h6 class="chart-section-title">累计净值走势</h6>
                    <canvas id="aggressiveChart" height="320"></canvas>
                </div>
                <div class="metrics-bar d-flex justify-content-around text-center mt-3 mb-4" id="aggressive-metrics-bar"></div>
                <div class="chart-container mt-4" id="aggressive-full-chart-container">
                    <h6 class="chart-section-title">完整业绩走势 <span class="text-muted" style="font-size:0.8rem;">（含测试期）</span></h6>
                    <div class="d-flex align-items-center gap-3 mb-2 flex-wrap" style="font-size:0.82rem;">
                        <span><span style="display:inline-block;width:28px;height:3px;background:#94a3b8;vertical-align:middle;margin-right:4px;border-radius:2px;"></span>测试期</span>
                        <span><span style="display:inline-block;width:28px;height:3px;background:#0f172a;vertical-align:middle;margin-right:4px;border-radius:2px;"></span>实盘期</span>
                        <span><span style="display:inline-block;width:28px;height:0;vertical-align:middle;margin-right:4px;border-bottom:2px dashed #94a3b8;"></span>${BENCHMARK_LABELS.btcPrice}</span>
                    </div>
                    <canvas id="aggressiveFullChart" height="320"></canvas>
                </div>
                <div class="chart-container" id="aggressive-monthly-pnl-container" style="margin-top:40px;">
                    <h6 class="chart-section-title">月度盈亏 <span class="text-muted" style="font-size:0.8rem;">（含测试期）</span></h6>
                    <div class="d-flex align-items-center gap-3 mb-2" style="font-size:0.82rem;">
                        <span><span style="display:inline-block;width:12px;height:12px;background:#22c55e;vertical-align:middle;margin-right:4px;border-radius:2px;opacity:0.40;"></span>测(测试期)</span>
                        <span><span style="display:inline-block;width:12px;height:12px;background:#22c55e;vertical-align:middle;margin-right:4px;border-radius:2px;"></span>盘(实盘期)</span>
                    </div>
                    <canvas id="aggressiveMonthlyPnLChart" height="200"></canvas>
                </div>
            </div>
        `;
        
        showAggressiveChartUI();
        loadAggressiveCSVAndDraw(rangeDays, () => {
            bindAggressiveChartControls();
            loadAndRenderFullPerformanceChart();
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
        if (investments.arbitrage2 && investments.arbitrage2.length > 0) {
            const latestArbitrage2 = investments.arbitrage2.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage2 && latestArbitrage2.coin === currency) {
                maxAmount += latestArbitrage2.net_nav || 0;
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
        if (investments.arbitrage2 && investments.arbitrage2.length > 0) {
            const latestArbitrage2 = investments.arbitrage2.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            if (latestArbitrage2 && latestArbitrage2.coin === currency) {
                maxAmount += latestArbitrage2.net_nav || 0;
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
    
    // 快赎金额限制（仅适用于USDT）
    const fastRedemptionLimit = 1000000;
    
    // 先检查快赎金额限制（如果币种是USDT且金额超过快赎限额）
    // 如果金额超过快赎限额，优先显示快赎金额限制错误（除非明显超过最大可赎回金额）
    if (currency === 'USDT' && amount > fastRedemptionLimit) {
        // 使用更宽松的比较，处理浮点数精度问题
        // 如果金额明显超过最大可赎回金额（差值大于0.01），才显示最大可赎回金额错误
        if (amount > maxAmount && (amount - maxAmount) > 0.01) {
            // 明显超过最大可赎回金额
            const formattedMaxAmount = maxAmount.toLocaleString('zh-CN', {
                minimumFractionDigits: currency === 'BTC' ? 4 : 2,
                maximumFractionDigits: currency === 'BTC' ? 4 : 2
            });
            alert(`超出最大可赎回金额，无法提交。\n当前持仓：${formattedMaxAmount} ${currency}\n赎回金额：${amount.toLocaleString('zh-CN', {
                minimumFractionDigits: currency === 'BTC' ? 4 : 2,
                maximumFractionDigits: currency === 'BTC' ? 4 : 2
            })} ${currency}`);
            return;
        } else {
            // 超过快赎限额但未明显超过最大可赎回金额（包括等于或接近的情况）
            alert(`超过快赎金额，无法提交。\n单次快赎金额上限：${fastRedemptionLimit.toLocaleString('zh-CN')} ${currency}\n赎回金额：${amount.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })} ${currency}`);
            return;
        }
    }
    
    // 检查赎回金额是否超过最大可赎回金额（非USDT或USDT但未超过快赎限额的情况）
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
// 加载并显示投资明细记录
function loadAndDisplayInvestmentDetails() {
    if (!currentUser || !currentUserData) {
        return;
    }

    // 直接从用户JSON数据中读取投资明细记录
    displayInvestmentDetails();
}

// 显示投资明细数据（写入弹窗容器）
function displayInvestmentDetails() {
    const container = document.getElementById('investmentDetailTableContainer');
    renderInvestmentDetailsTable(container, currentUserData);
}

function loadFullDetailsToModal() {
    if (!currentUser || !currentUserData) return;
    displayInvestmentDetails();
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