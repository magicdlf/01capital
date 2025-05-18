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
        title: '稳健型FOF',
        desc: '适合追求稳健收益的投资者，通过多元化的资产配置，降低投资风险。主要投资于固定收益类资产，辅以少量权益类资产。',
        img: 'images/performance-stable.png',
        alt: '稳健型FOF业绩',
        perf: [
            '近一年收益率：8.2%',
            '近三年年化收益率：7.5%',
            '成立以来年化收益率：7.1%'
        ]
    },
    balanced: {
        title: '平衡型FOF',
        desc: `
        <strong>投资策略</strong><br>
        本产品采用"套利安全垫+多因子收益引擎"的复合策略矩阵，以低波动套利策略作为稳健基石，叠加动态多因子模型增强收益。通过资金配比模型实时调整策略敞口，在严格控制组合波动的同时，精准捕捉跨资产定价效率提升与市场风格切换带来的双重机遇。<br><br>
        <strong>基金亮点</strong><br>
        1. 收益结构清晰<br>
        套利+多因子双策略组合，套利收益贡献：55%（夏普比率：10.69），多因子收益贡献：45%（预计年化收益率：130%+），两类策略天然低相关性特征实现风险分散，穿越周期创造持续复合收益。<br>
        2. 透明管理，年度高标准审计<br>
        严格执行年度集中审计，年度平仓全仓操作，底层交易团队配合度高，平仓后所有资产划转现货。年度平仓综合损耗控制在0.5%以内，对账误差率<0.01%。审计结束可实现3个工作日资金打回。<br><br>
        <strong>基金目标</strong><br>
        本基金锚定年化20%-30%的复合收益目标，同时通过多策略协同机制将最大回撤严格约束在8%以内。`,
        img: 'images/performance-balanced.png',
        alt: '平衡型FOF业绩',
        perf: [
            '近一年收益率：12.3%',
            '近三年年化收益率：10.8%',
            '成立以来年化收益率：9.6%'
        ]
    },
    aggressive: {
        title: '进取型FOF',
        desc: '适合风险承受能力较强的投资者，追求更高的投资回报。主要配置权益类资产，辅以少量固定收益类资产。',
        img: 'images/performance-aggressive.png',
        alt: '进取型FOF业绩',
        perf: [
            '近一年收益率：18.5%',
            '近三年年化收益率：15.2%',
            '成立以来年化收益率：13.7%'
        ]
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
                <h3>${data.title}</h3>
                <p>${data.desc}</p>
                <div class="performance-chart mb-3">
                    <img src="${data.img}" alt="${data.alt}" class="img-fluid">
                </div>
                <ul class="list-unstyled">
                    ${data.perf.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;
        }
    });
}

// 平衡型FOF业绩图表逻辑
let balancedChart = null;
let balancedData = [];
let balancedDataLoaded = false;

function renderBalancedChart(rangeDays = 30) {
    if (!balancedData.length) return;
    const dataSlice = balancedData.slice(-rangeDays);
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
            <h3>${productData['balanced'].title}</h3>
            <p>${productData['balanced'].desc}</p>
            <div id="balanced-chart-controls" style="margin-bottom:16px;">
                <button class="btn btn-outline-dark btn-sm me-2" data-range="7">近7天</button>
                <button class="btn btn-outline-dark btn-sm me-2" data-range="30">近30天</button>
                <button class="btn btn-outline-dark btn-sm" data-range="365">近1年</button>
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

// 修改产品切换事件
if (productList && perfContent) {
    productList.addEventListener('click', function(e) {
        if (e.target.matches('button[data-product]')) {
            const key = e.target.getAttribute('data-product');
            if (key === 'balanced') {
                setTimeout(() => {
                    showBalancedProductSection(30); // 默认30天
                }, 100);
            } else {
                hideBalancedChartUI();
            }
        }
    });
}
// 页面初始自动选中平衡型FOF并显示图表
window.addEventListener('DOMContentLoaded', function() {
    if (productList) {
        productList.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        const balancedBtn = productList.querySelector('button[data-product="balanced"]');
        if (balancedBtn) balancedBtn.classList.add('active');
    }
    showBalancedProductSection(7); // 默认7天
}); 