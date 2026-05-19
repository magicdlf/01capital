import {
    PRODUCT_DATA,
    FUND_NAME_MAPPING
} from './config.js';
import {
    computeReturnMetrics,
    calculateAnnualizedReturnFromDays,
    computePostRedemptionFundReturn,
    formatPostRedemptionReturnCell
} from './summary-utils.js';

const productData = PRODUCT_DATA;

function formatDateToYMD(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function generateOverviewCards(coin, data) {
    const isCrypto = (coin === 'BTC' || coin === 'ETH');
    const dec = isCrypto ? 4 : 2;
    const totalPnl = data.realizedPnl + data.unrealizedPnl;
    const fmt = (v) => v.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec});
    const sign = (v) => v >= 0 ? '+' : '';
    const cls = (v) => v >= 0 ? 'text-positive' : 'text-negative';
    return `
        <div class="col-6 col-lg-3"><div class="overview-card"><div class="overview-value">${fmt(data.totalNetNav)}</div><div class="overview-label">总资产 <span class="overview-coin">${coin}</span></div></div></div>
        <div class="col-6 col-lg-3"><div class="overview-card"><div class="overview-value ${cls(totalPnl)}">${sign(totalPnl)}${fmt(totalPnl)}</div><div class="overview-label">累计收益</div></div></div>
        <div class="col-6 col-lg-3"><div class="overview-card"><div class="overview-value">${sign(data.realizedPnl)}${fmt(data.realizedPnl)}</div><div class="overview-label">已实现收益</div></div></div>
        <div class="col-6 col-lg-3"><div class="overview-card"><div class="overview-value">${sign(data.unrealizedPnl)}${fmt(data.unrealizedPnl)}</div><div class="overview-label">未实现收益</div></div></div>`;
}

export function renderInvestorSummarySection(container, userData, username, options = {}) {
    const showActionButtons = options.showActionButtons !== false;
    // 各产品线：概览（总资产/收益）与持仓表均取「按日期最新的一条」，含本金为 0 的清仓记录（与数据文件一致）

    // 以下为各序列按日期的最新一条（亦用于判断是否已赎回）
    let balancedAllLatestData = null;
    let arbitrageAllLatestData = null;
    let arbitrage2AllLatestData = null;
    let arbitrageCoinBtcAllLatestData = null;
    let arbitrageEthAllLatestData = null;
    let growthAllLatestData = null;
    let paarbAllLatestData = null;
    
    if (userData && userData.investments) {
        const balancedAll = userData.investments.balanced || [];
        if (balancedAll.length > 0) {
            balancedAllLatestData = [...balancedAll].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const arbitrageAll = userData.investments.arbitrage || [];
        if (arbitrageAll.length > 0) {
            arbitrageAllLatestData = [...arbitrageAll].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const arbitrage2All = userData.investments.arbitrage2 || [];
        if (arbitrage2All.length > 0) {
            arbitrage2AllLatestData = [...arbitrage2All].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const arbitrageCoinData = userData.investments.arbitrage_coin || [];
        const btcAllData = arbitrageCoinData.filter(item => item.coin === 'BTC');
        if (btcAllData.length > 0) {
            arbitrageCoinBtcAllLatestData = [...btcAllData].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        if (Array.isArray(userData.investments.arbitrage_eth) && userData.investments.arbitrage_eth.length > 0) {
            arbitrageEthAllLatestData = [...userData.investments.arbitrage_eth].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
        
        const growthAll = userData.investments.growth || [];
        if (growthAll.length > 0) {
            growthAllLatestData = [...growthAll].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }

        const paarbAll = userData.investments.paarb || [];
        if (paarbAll.length > 0) {
            paarbAllLatestData = [...paarbAll].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        }
    }
    
    // 判断是否已赎回（最新记录本金<1）
    const isBalancedRedeemed = balancedAllLatestData && (balancedAllLatestData.principal || 0) < 1;
    const isArbitrageRedeemed = arbitrageAllLatestData && (arbitrageAllLatestData.principal || 0) < 1;
    const isArbitrage2Redeemed = arbitrage2AllLatestData && (arbitrage2AllLatestData.principal || 0) < 1;
    const isArbitrageCoinBtcRedeemed = arbitrageCoinBtcAllLatestData && (arbitrageCoinBtcAllLatestData.principal || 0) < 1;
    const isArbitrageEthRedeemed = arbitrageEthAllLatestData && (arbitrageEthAllLatestData.principal || 0) < 1;
    const isGrowthRedeemed = growthAllLatestData && (growthAllLatestData.principal || 0) < 1;
    const isPaarbRedeemed = paarbAllLatestData && (paarbAllLatestData.principal || 0) < 1;
    
    console.log('Current user:', username);
    console.log('Latest balanced data for', username, ':', balancedAllLatestData);
    console.log('Latest arbitrage data for', username, ':', arbitrageAllLatestData);
    console.log('Latest arbitrage2 data for', username, ':', arbitrage2AllLatestData);
    console.log('Latest arbitrage coin BTC data for', username, ':', arbitrageCoinBtcAllLatestData);
    console.log('Latest arbitrage coin ETH data for', username, ':', arbitrageEthAllLatestData);
    console.log('Latest growth data for', username, ':', growthAllLatestData);
    console.log('Latest paarb data for', username, ':', paarbAllLatestData);
    
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
    let paarbHoldingDays = 0;
    let paarbReturnRate = 0;
    let paarbAnnualizedReturn = 0;
    
    if (balancedAllLatestData && !isBalancedRedeemed) {
        console.log('Processing balanced data for', username);
        const metrics = computeReturnMetrics(userData.investments.balanced || []);
        balancedHoldingDays = metrics.holdingDays;
        balancedReturnRate = metrics.returnRate;
        balancedAnnualizedReturn = metrics.annualizedReturn;
    }

    if (arbitrageAllLatestData && !isArbitrageRedeemed) {
        console.log('Processing arbitrage data for', username);
        const metrics = computeReturnMetrics(userData.investments.arbitrage || []);
        arbitrageHoldingDays = metrics.holdingDays;
        arbitrageReturnRate = metrics.returnRate;
        arbitrageAnnualizedReturn = metrics.annualizedReturn;
    }

    if (arbitrage2AllLatestData && !isArbitrage2Redeemed) {
        console.log('Processing arbitrage2 data for', username);
        const metrics = computeReturnMetrics(Array.isArray(userData.investments.arbitrage2) ? userData.investments.arbitrage2 : []);
        arbitrage2HoldingDays = metrics.holdingDays;
        arbitrage2ReturnRate = metrics.returnRate;
        arbitrage2AnnualizedReturn = metrics.annualizedReturn;
    }

    if (arbitrageCoinBtcAllLatestData && !isArbitrageCoinBtcRedeemed) {
        console.log('Processing arbitrage coin BTC data for', username);
        const btcRecords = (userData.investments.arbitrage_coin || []).filter((item) => item.coin === 'BTC');
        const metrics = computeReturnMetrics(btcRecords);
        arbitrageCoinBtcHoldingDays = metrics.holdingDays;
        arbitrageCoinBtcReturnRate = metrics.returnRate;
        arbitrageCoinBtcAnnualizedReturn = metrics.annualizedReturn;
    }

    if (arbitrageEthAllLatestData && !isArbitrageEthRedeemed) {
        console.log('Processing arbitrage coin ETH data for', username);
        // 获取当前投资者的所有Stable-Harbor-ETH记录（仅使用 investments.arbitrage_eth），筛选本金>1的记录（已赎回的用户不显示后续数据）
        let arbitrageCoinEthRecords = Array.isArray(userData.investments.arbitrage_eth)
            ? userData.investments.arbitrage_eth.filter(record => (record.principal || 0) > 1)
            : [];
        // 取最早一条
        const arbitrageCoinEthFirstRecord = arbitrageCoinEthRecords.length
            ? arbitrageCoinEthRecords.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
            : null;
        // 持仓天数 = （最早和最新日期的天数差+1）
        if (arbitrageCoinEthFirstRecord && arbitrageEthAllLatestData) {
            arbitrageCoinEthHoldingDays = Math.ceil(
                (new Date(arbitrageEthAllLatestData.date) - new Date(arbitrageCoinEthFirstRecord.date)) / (1000 * 60 * 60 * 24)
            ) + 1;
        }
        // 使用 total_return 作为收益率，注意 total_return 是小数，需乘以100
        arbitrageCoinEthReturnRate = arbitrageEthAllLatestData.total_return !== undefined ? (arbitrageEthAllLatestData.total_return * 100).toFixed(2) : '0.00';
        // 计算年化收益率
        arbitrageCoinEthAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(arbitrageCoinEthReturnRate), arbitrageCoinEthHoldingDays);
    }

    if (growthAllLatestData && !isGrowthRedeemed) {
        console.log('Processing growth data for', username);
        const metrics = computeReturnMetrics(userData.investments.growth || []);
        growthHoldingDays = metrics.holdingDays;
        growthReturnRate = metrics.returnRate;
        growthAnnualizedReturn = metrics.annualizedReturn;
    }

    if (paarbAllLatestData && !isPaarbRedeemed) {
        console.log('Processing paarb data for', username);
        const metrics = computeReturnMetrics(userData.investments.paarb || []);
        paarbHoldingDays = metrics.holdingDays;
        paarbReturnRate = metrics.returnRate;
        paarbAnnualizedReturn = metrics.annualizedReturn;
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
    let paarbClosedData = null;
    let paarbClosedHoldingDays = 0;
    let paarbClosedReturnRate = '0.00';
    let paarbClosedAnnualizedReturn = '0.00';
    
    // 计算已清仓的Alpha-Bridge数据
    if (isBalancedRedeemed && userData && userData.investments) {
        const balancedAllRecords = (userData.investments.balanced || [])
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
    if (isArbitrageRedeemed && userData && userData.investments) {
        const arbitrageAllRecords = (userData.investments.arbitrage || [])
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
    if (isArbitrage2Redeemed && userData && userData.investments) {
        const arbitrage2AllRecords = Array.isArray(userData.investments.arbitrage2)
            ? userData.investments.arbitrage2.filter(record => (record.principal || 0) >= 1)
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
    if (isArbitrageCoinBtcRedeemed && userData && userData.investments) {
        const arbitrageCoinBtcAllRecords = (userData.investments.arbitrage_coin || [])
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
    if (isArbitrageEthRedeemed && userData && userData.investments) {
        const arbitrageEthAllRecords = Array.isArray(userData.investments.arbitrage_eth)
            ? userData.investments.arbitrage_eth.filter(record => (record.principal || 0) >= 1)
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
    if (isGrowthRedeemed && userData && userData.investments) {
        const growthAllRecords = (userData.investments.growth || [])
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

    // 计算已清仓的Arbitrage-USDT (paarb)数据
    if (isPaarbRedeemed && userData && userData.investments) {
        const paarbAllRecords = (userData.investments.paarb || [])
            .filter(record => (record.principal || 0) >= 1)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        if (paarbAllRecords.length > 0) {
            paarbClosedData = paarbAllRecords[0];
            const paarbFirstRecord = paarbAllRecords[paarbAllRecords.length - 1];
            if (paarbFirstRecord && paarbClosedData) {
                paarbClosedHoldingDays = Math.ceil(
                    (new Date(paarbClosedData.date) - new Date(paarbFirstRecord.date)) / (1000 * 60 * 60 * 24)
                ) + 1;
            }
            paarbClosedReturnRate = paarbClosedData.total_return !== undefined ? (paarbClosedData.total_return * 100).toFixed(2) : '0.00';
            paarbClosedAnnualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(paarbClosedReturnRate), paarbClosedHoldingDays);
        }
    }

    // 按币种分组计算总资产和收益
    const assetsByCoin = {};
    
    // 处理 Alpha-Bridge 数据（即使本金为 0 也统计资产和收益，但不计入当前持仓数量）
    if (balancedAllLatestData) {
        console.log('Adding balanced data to assetsByCoin');
        const coin = balancedAllLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += balancedAllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += balancedAllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += balancedAllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += balancedAllLatestData.net_pnl;
        // 只有本金大于 0 时才算作当前持仓
        if ((balancedAllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-USDT 数据（同样逻辑）
    if (arbitrageAllLatestData) {
        console.log('Adding arbitrage data to assetsByCoin');
        const coin = arbitrageAllLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageAllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageAllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageAllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageAllLatestData.net_pnl;
        if ((arbitrageAllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-USDT 2.0 数据（同样逻辑）
    if (arbitrage2AllLatestData) {
        console.log('Adding arbitrage2 data to assetsByCoin');
        const coin = arbitrage2AllLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrage2AllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrage2AllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrage2AllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrage2AllLatestData.net_pnl;
        if ((arbitrage2AllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-BTC 数据（同样逻辑）
    if (arbitrageCoinBtcAllLatestData) {
        console.log('Adding arbitrage coin BTC data to assetsByCoin');
        const coin = arbitrageCoinBtcAllLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageCoinBtcAllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageCoinBtcAllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageCoinBtcAllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageCoinBtcAllLatestData.net_pnl;
        if ((arbitrageCoinBtcAllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Stable-Harbor-ETH 数据（同样逻辑）
    if (arbitrageEthAllLatestData) {
        console.log('Adding arbitrage coin ETH data to assetsByCoin');
        const coin = arbitrageEthAllLatestData.coin;
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += arbitrageEthAllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += arbitrageEthAllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += arbitrageEthAllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += arbitrageEthAllLatestData.net_pnl;
        if ((arbitrageEthAllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Deep-Growth（用户JSON里是 investments.growth）（同样逻辑）
    if (growthAllLatestData) {
        console.log('Adding growth data to assetsByCoin');
        const coin = growthAllLatestData.coin || 'USDT';
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += growthAllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += growthAllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += growthAllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += growthAllLatestData.net_pnl;
        if ((growthAllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    // 处理 Arbitrage-USDT (paarb)（同样逻辑）
    if (paarbAllLatestData) {
        console.log('Adding paarb data to assetsByCoin');
        const coin = paarbAllLatestData.coin || 'USDT';
        if (!assetsByCoin[coin]) {
            assetsByCoin[coin] = {
                totalNetNav: 0,
                totalNetPnl: 0,
                realizedPnl: 0,
                unrealizedPnl: 0,
                holdingCount: 0
            };
        }
        assetsByCoin[coin].totalNetNav += paarbAllLatestData.net_nav;
        assetsByCoin[coin].totalNetPnl += paarbAllLatestData.net_pnl;
        assetsByCoin[coin].realizedPnl += paarbAllLatestData.realized_pnl;
        assetsByCoin[coin].unrealizedPnl += paarbAllLatestData.net_pnl;
        if ((paarbAllLatestData.principal || 0) >= 1) {
            assetsByCoin[coin].holdingCount++;
        }
    }

    console.log('Final assetsByCoin:', assetsByCoin);

    // ===== 新版投资者专区 =====

    // 币种列表（总资产大的在前）
    const coinList = Object.entries(assetsByCoin)
        .sort(([, a], [, b]) => {
            if (a.totalNetNav < 1 && b.totalNetNav >= 1) return 1;
            if (a.totalNetNav >= 1 && b.totalNetNav < 1) return -1;
            return 0;
        })
        .map(([coin]) => coin);
    const defaultCoin = coinList.length > 0 ? coinList[0] : 'USDT';

    const coinPillsHtml = coinList.length > 0
        ? coinList.map((coin, i) => `<button class="btn${i === 0 ? ' active' : ''}" data-coin="${coin}">${coin}</button>`).join('')
        : '<button class="btn active" data-coin="USDT">USDT</button>';

    const defaultCoinData = assetsByCoin[defaultCoin] || {totalNetNav: 0, realizedPnl: 0, unrealizedPnl: 0};
    const defaultOverviewHtml = generateOverviewCards(defaultCoin, defaultCoinData);

    // 构建当前持仓行（仅包含用户实际持有的产品）
    const currentHoldingsRows = [];

    if (balancedAllLatestData && !isBalancedRedeemed) {
        const coin = balancedAllLatestData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const rr = parseFloat(balancedReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>${productData['balanced'].title}</td><td>${coin}</td>
            <td>${balancedAllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${balancedAllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${balancedReturnRate}%</td>
            <td>${balancedHoldingDays}</td><td>${balancedAnnualizedReturn}%</td>
            <td>${balancedAllLatestData ? formatDateToYMD(balancedAllLatestData.date) : '-'}</td>
        </tr>`);
    }

    if (arbitrageAllLatestData && !isArbitrageRedeemed) {
        const coin = arbitrageAllLatestData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const rr = parseFloat(arbitrageReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>${productData['stable-usd'].title}</td><td>${coin}</td>
            <td>${arbitrageAllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${arbitrageAllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${arbitrageReturnRate}%</td>
            <td>${arbitrageHoldingDays}</td><td>${arbitrageAnnualizedReturn}%</td>
            <td>${arbitrageAllLatestData ? formatDateToYMD(arbitrageAllLatestData.date) : '-'}</td>
        </tr>`);
    }

    if (arbitrage2AllLatestData && !isArbitrage2Redeemed) {
        const coin = arbitrage2AllLatestData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const rr = parseFloat(arbitrage2ReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>${productData['stable-usd'].title}</td><td>${coin}</td>
            <td>${arbitrage2AllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${arbitrage2AllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${arbitrage2ReturnRate}%</td>
            <td>${arbitrage2HoldingDays}</td><td>${arbitrage2AnnualizedReturn}%</td>
            <td>${arbitrage2AllLatestData ? formatDateToYMD(arbitrage2AllLatestData.date) : '-'}</td>
        </tr>`);
    }

    if (arbitrageCoinBtcAllLatestData && !isArbitrageCoinBtcRedeemed) {
        const rr = parseFloat(arbitrageCoinBtcReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>${productData['stable-coin-btc'].title}</td><td>BTC</td>
            <td>${arbitrageCoinBtcAllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td>${arbitrageCoinBtcAllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${arbitrageCoinBtcReturnRate}%</td>
            <td>${arbitrageCoinBtcHoldingDays}</td><td>${arbitrageCoinBtcAnnualizedReturn}%</td>
            <td>${arbitrageCoinBtcAllLatestData ? formatDateToYMD(arbitrageCoinBtcAllLatestData.date) : '-'}</td>
        </tr>`);
    }

    if (arbitrageEthAllLatestData && !isArbitrageEthRedeemed) {
        const rr = parseFloat(arbitrageCoinEthReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>Stable-Harbor-ETH</td><td>ETH</td>
            <td>${arbitrageEthAllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td>${arbitrageEthAllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${arbitrageCoinEthReturnRate}%</td>
            <td>${arbitrageCoinEthHoldingDays}</td><td>${arbitrageCoinEthAnnualizedReturn}%</td>
            <td>${arbitrageEthAllLatestData ? formatDateToYMD(arbitrageEthAllLatestData.date) : '-'}</td>
        </tr>`);
    }

    if (growthAllLatestData && !isGrowthRedeemed) {
        const coin = growthAllLatestData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const rr = parseFloat(growthReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>${productData['aggressive'].title}</td><td>${coin}</td>
            <td>${growthAllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${growthAllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${growthReturnRate}%</td>
            <td>${growthHoldingDays}</td><td>${growthAnnualizedReturn}%</td>
            <td>${growthAllLatestData ? formatDateToYMD(growthAllLatestData.date) : '-'}</td>
        </tr>`);
    }

    if (paarbAllLatestData && !isPaarbRedeemed) {
        const coin = paarbAllLatestData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const rr = parseFloat(paarbReturnRate);
        currentHoldingsRows.push(`<tr>
            <td>Arbitrage-USDT</td><td>${coin}</td>
            <td>${paarbAllLatestData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${paarbAllLatestData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td class="${rr >= 0 ? 'text-positive' : 'text-negative'}">${paarbReturnRate}%</td>
            <td>${paarbHoldingDays}</td><td>${paarbAnnualizedReturn}%</td>
            <td>${paarbAllLatestData ? formatDateToYMD(paarbAllLatestData.date) : '-'}</td>
        </tr>`);
    }

    // 构建已清仓行（仅包含已清仓的产品）
    const closedPositionsRows = [];

    if (isBalancedRedeemed && balancedClosedData) {
        const coin = balancedClosedData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(balancedClosedData, balancedAllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>${productData['balanced'].title}</td><td>${coin}</td>
            <td>${balancedClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${balancedClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${balancedClosedReturnRate}%</td><td>${balancedClosedHoldingDays}</td>
            <td>${balancedClosedAnnualizedReturn}%</td><td>${formatDateToYMD(balancedClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    if (isArbitrageRedeemed && arbitrageClosedData) {
        const coin = arbitrageClosedData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(arbitrageClosedData, arbitrageAllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>${productData['stable-usd'].title}</td><td>${coin}</td>
            <td>${arbitrageClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${arbitrageClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${arbitrageClosedReturnRate}%</td><td>${arbitrageClosedHoldingDays}</td>
            <td>${arbitrageClosedAnnualizedReturn}%</td><td>${formatDateToYMD(arbitrageClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    if (isArbitrage2Redeemed && arbitrage2ClosedData) {
        const coin = arbitrage2ClosedData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(arbitrage2ClosedData, arbitrage2AllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>${productData['stable-usd'].title}</td><td>${coin}</td>
            <td>${arbitrage2ClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${arbitrage2ClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${arbitrage2ClosedReturnRate}%</td><td>${arbitrage2ClosedHoldingDays}</td>
            <td>${arbitrage2ClosedAnnualizedReturn}%</td><td>${formatDateToYMD(arbitrage2ClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    if (isArbitrageCoinBtcRedeemed && arbitrageCoinBtcClosedData) {
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(arbitrageCoinBtcClosedData, arbitrageCoinBtcAllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>${productData['stable-coin-btc'].title}</td><td>${arbitrageCoinBtcClosedData.coin || 'BTC'}</td>
            <td>${arbitrageCoinBtcClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td>${arbitrageCoinBtcClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td>${arbitrageCoinBtcClosedReturnRate}%</td><td>${arbitrageCoinBtcClosedHoldingDays}</td>
            <td>${arbitrageCoinBtcClosedAnnualizedReturn}%</td><td>${formatDateToYMD(arbitrageCoinBtcClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    if (isArbitrageEthRedeemed && arbitrageEthClosedData) {
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(arbitrageEthClosedData, arbitrageEthAllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>Stable-Harbor-ETH</td><td>${arbitrageEthClosedData.coin || 'ETH'}</td>
            <td>${arbitrageEthClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td>${arbitrageEthClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</td>
            <td>${arbitrageCoinEthClosedReturnRate}%</td><td>${arbitrageCoinEthClosedHoldingDays}</td>
            <td>${arbitrageCoinEthClosedAnnualizedReturn}%</td><td>${formatDateToYMD(arbitrageEthClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    if (isGrowthRedeemed && growthClosedData) {
        const coin = growthClosedData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(growthClosedData, growthAllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>${productData['aggressive'].title}</td><td>${coin}</td>
            <td>${growthClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${growthClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${growthClosedReturnRate}%</td><td>${growthClosedHoldingDays}</td>
            <td>${growthClosedAnnualizedReturn}%</td><td>${formatDateToYMD(growthClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    if (isPaarbRedeemed && paarbClosedData) {
        const coin = paarbClosedData.coin || 'USDT';
        const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
        const postReturnCell = formatPostRedemptionReturnCell(
            computePostRedemptionFundReturn(paarbClosedData, paarbAllLatestData)
        );
        closedPositionsRows.push(`<tr>
            <td>Arbitrage-USDT</td><td>${coin}</td>
            <td>${paarbClosedData.principal.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${paarbClosedData.net_nav.toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec})}</td>
            <td>${paarbClosedReturnRate}%</td><td>${paarbClosedHoldingDays}</td>
            <td>${paarbClosedAnnualizedReturn}%</td><td>${formatDateToYMD(paarbClosedData.date)}</td>
            ${postReturnCell}
        </tr>`);
    }

    // 构建精简投资明细（最新5条，4列）
    let simplifiedDetailsHtml = '';
    const fundNameMapping = FUND_NAME_MAPPING;
    if (userData && userData.investment_details) {
        const details = [...userData.investment_details]
            .sort((a, b) => {
                const da = new Date(a.date || 0);
                const db = new Date(b.date || 0);
                return db - da;
            })
            .slice(0, 5);
        simplifiedDetailsHtml = details.map(record => {
            const rawFund = record.fund || record.product || '-';
            const fundName = fundNameMapping[rawFund] || rawFund;
            let fd = '-';
            if (record.date) {
                let d = record.date;
                if (d.includes('T')) d = d.split('T')[0];
                else if (d.includes(' ')) d = d.split(' ')[0];
                const parts = d.split('/');
                if (parts.length === 3) fd = `${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`;
                else {
                    const dp = d.split('-');
                    if (dp.length >= 3) fd = `${dp[0]}-${dp[1].padStart(2,'0')}-${dp[2].padStart(2,'0')}`;
                    else fd = d;
                }
            }
            const coin = record.coin || '-';
            const dec = (coin === 'BTC' || coin === 'ETH') ? 4 : 2;
            const amount = (record.amount || 0).toLocaleString('zh-CN', {minimumFractionDigits: dec, maximumFractionDigits: dec});
            return `<tr><td>${fd}</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${fundName}">${fundName}</td><td>${record.action || record.type || '-'}</td><td>${coin} ${amount}</td></tr>`;
        }).join('');
    }
    if (!simplifiedDetailsHtml) {
        simplifiedDetailsHtml = '<tr><td colspan="4" class="text-center text-muted">暂无记录</td></tr>';
    }

    const summaryHtml = `
        <div class="container">
            <h2 class="section-title text-center mb-5">投资者专区</h2>

            <!-- 投资概览：币种切换 + 概览卡片 + 操作按钮 -->
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <div class="currency-pills btn-group" id="currencyPills">
                    ${coinPillsHtml}
                </div>
                ${showActionButtons ? `<div class="investment-actions">
                    <button type="button" class="btn btn-outline-gold btn-sm" id="currencyConversionBtn">币种转换投资</button>
                    <button type="button" class="btn btn-outline-gold btn-sm" id="redemptionBtn">赎回申请</button>
                </div>` : ''}
            </div>
            <div class="row g-3 mb-4" id="overviewCards">
                ${defaultOverviewHtml}
            </div>

            <!-- 投资组合：当前持仓 / 已清仓 -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <h3 class="card-title h5 mb-0">投资组合</h3>
                        <ul class="nav holding-tabs" id="holdingTabs">
                            <li class="nav-item"><a class="nav-link active" id="currentHoldingBtn" href="javascript:void(0)">当前持仓</a></li>
                            <li class="nav-item"><a class="nav-link" id="closedPositionBtn" href="javascript:void(0)">已清仓</a></li>
                        </ul>
                    </div>
                    <div id="currentHoldingTable" class="table-responsive" style="max-height:500px;">
                        <table class="table holdings-table">
                            <thead><tr>
                                <th>产品名称</th><th>币种</th><th>本金</th><th>当前价值</th>
                                <th>收益率</th><th>持仓天数</th><th>年化收益率</th><th>数据日期</th>
                            </tr></thead>
                            <tbody>${currentHoldingsRows.length > 0 ? currentHoldingsRows.join('') : '<tr><td colspan="8" class="text-center text-muted">暂无当前持仓</td></tr>'}</tbody>
                        </table>
                    </div>
                    <div id="closedPositionTable" class="table-responsive" style="max-height:500px; display:none;">
                        <table class="table holdings-table">
                            <thead><tr>
                                <th>产品名称</th><th>币种</th><th>本金</th><th>清仓价值</th>
                                <th>收益率</th><th>持仓天数</th><th>年化收益率</th><th>清仓日期</th>
                                <th>清仓后净值涨幅</th>
                            </tr></thead>
                            <tbody>${closedPositionsRows.length > 0 ? closedPositionsRows.join('') : '<tr><td colspan="9" class="text-center text-muted">暂无已清仓记录</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 底部左右分栏：收益曲线 + 精简投资明细 -->
            <div class="row g-4">
                <div class="col-12 col-lg-7">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">收益曲线</h5>
                            <div style="position:relative; height:280px;">
                                <canvas id="assetAllocationChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-5">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0">投资明细</h5>
                                <button type="button" class="btn btn-sm btn-outline-gold" id="viewAllDetailsBtn">查看全部</button>
                            </div>
                            <p class="text-muted small mb-2">最近交易记录</p>
                            <div class="table-responsive flex-grow-1">
                                <table class="table table-sm" id="simplifiedDetailTable">
                                    <thead><tr><th>日期</th><th>产品</th><th>操作</th><th>金额</th></tr></thead>
                                    <tbody id="simplifiedDetailBody">${simplifiedDetailsHtml}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 更新投资者专区内容
    if (container) {
        container.innerHTML = summaryHtml;

        // 币种切换逻辑（重新渲染概览卡片）
        const currencyPills = container.querySelector('#currencyPills');
        if (currencyPills) {
            currencyPills.addEventListener('click', function(e) {
                const btn = e.target.closest('button[data-coin]');
                if (!btn) return;
                currencyPills.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const coin = btn.dataset.coin;
                const coinData = assetsByCoin[coin];
                if (coinData) {
                    const oc = container.querySelector('#overviewCards');
                    if (oc) oc.innerHTML = generateOverviewCards(coin, coinData);
                }
            });
        }

        // 持仓/已清仓 Tab 切换
        const currentHoldingBtn = container.querySelector('#currentHoldingBtn');
        const closedPositionBtn = container.querySelector('#closedPositionBtn');
        const currentHoldingTable = container.querySelector('#currentHoldingTable');
        const closedPositionTable = container.querySelector('#closedPositionTable');

        if (currentHoldingBtn && closedPositionBtn && currentHoldingTable && closedPositionTable) {
            currentHoldingBtn.addEventListener('click', function(e) {
                e.preventDefault();
                currentHoldingBtn.classList.add('active');
                closedPositionBtn.classList.remove('active');
                currentHoldingTable.style.display = 'block';
                closedPositionTable.style.display = 'none';
            });
            closedPositionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closedPositionBtn.classList.add('active');
                currentHoldingBtn.classList.remove('active');
                closedPositionTable.style.display = 'block';
                currentHoldingTable.style.display = 'none';
            });
        }

        if (showActionButtons) {
            const redemptionBtn = container.querySelector('#redemptionBtn');
            if (redemptionBtn && typeof options.onRedemptionClick === 'function') {
                redemptionBtn.addEventListener('click', options.onRedemptionClick);
            }
            const currencyConversionBtn = container.querySelector('#currencyConversionBtn');
            if (currencyConversionBtn && typeof options.onCurrencyConversionClick === 'function') {
                currencyConversionBtn.addEventListener('click', options.onCurrencyConversionClick);
            }
        }

        // 查看全部按钮 - 加载完整投资明细到弹窗
        const viewAllDetailsBtn = container.querySelector('#viewAllDetailsBtn');
        if (viewAllDetailsBtn) {
            viewAllDetailsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const detailContainer = document.getElementById('investmentDetailTableContainer');
                renderInvestmentDetailsTable(detailContainer, userData);
                const modalEl = document.getElementById('investmentDetailModal');
                if (modalEl && window.bootstrap) {
                    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
                }
            });
        }

        // 初始化收益曲线图表
        const Chart = window.Chart;
        const ctx = container.querySelector('#assetAllocationChart');
        if (ctx && Chart) {
            if (container._investorReturnChart) {
                container._investorReturnChart.destroy();
                container._investorReturnChart = null;
            }

            console.log('Initializing return curves chart');

            function filterToMonthEnd(data) {
                const grouped = {};
                data.forEach(item => {
                    const date = new Date(item.x);
                    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const isLastDayOfMonth = date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    if (!grouped[ym] || isLastDayOfMonth || date > new Date(grouped[ym].originalDate)) {
                        grouped[ym] = {
                            x: ym,
                            y: item.y,
                            isMonthEnd: isLastDayOfMonth,
                            originalDate: item.x
                        };
                    }
                });
                return Object.values(grouped).sort((a, b) => a.x.localeCompare(b.x));
            }
            // 从当前用户数据获取收益率数据
            // 筛选本金>1的记录（已赎回的用户不显示后续数据）
            const balancedReturns = filterToMonthEnd(
                (userData?.investments?.balanced || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrageReturns = filterToMonthEnd(
                (userData?.investments?.arbitrage || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrage2Returns = filterToMonthEnd(
                (userData?.investments?.arbitrage2 || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const arbitrageCoinBtcReturns = filterToMonthEnd(
                (userData?.investments?.arbitrage_coin || [])
                    .filter(record => record.coin === 'BTC' && (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );
            
            // ETH 组合：只使用 investments.arbitrage_eth
            const arbitrageCoinEthReturns = filterToMonthEnd(
                (userData?.investments?.arbitrage_eth || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const growthReturns = filterToMonthEnd(
                (userData?.investments?.growth || [])
                    .filter(record => (record.principal || 0) > 1)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(record => ({
                        x: formatDateToYMD(record.date),
                        y: record.total_return * 100 // 转换为百分比
                    }))
            );

            const paarbReturns = filterToMonthEnd(
                (userData?.investments?.paarb || [])
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
            console.log('Paarb returns data:', paarbReturns);

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
                    label: productData['stable-usd'].title,
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
            if (paarbReturns.length > 0) {
                const lastPointIsMonthEnd = paarbReturns[paarbReturns.length - 1].isMonthEnd;
                datasets.push({
                    label: 'Arbitrage-USDT',
                    data: paarbReturns,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243,156,18,0.1)',
                    tension: 0.2,
                    fill: false,
                    segment: {
                        borderDash: ctx => {
                            if (isPaarbRedeemed) {
                                return [];
                            }
                            if (ctx.p1DataIndex === paarbReturns.length - 1 && !lastPointIsMonthEnd) {
                                return [5, 5];
                            }
                            return [];
                        }
                    }
                });
            }

            console.log('Chart datasets:', datasets);

            // 检测是否为手机版
            const isMobile = window.innerWidth <= 768;
            
            container._investorReturnChart = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: isMobile ? {
                            top: 10,
                            right: 10,
                            bottom: 40,
                            left: 10
                        } : {
                            top: 10,
                            right: 10,
                            bottom: 10,
                            left: 10
                        }
                    },
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: true,
                            position: isMobile ? 'bottom' : 'right',
                            align: isMobile ? 'center' : 'center',
                            labels: {
                                boxWidth: 12,
                                padding: isMobile ? 8 : 15,
                                font: {
                                    size: isMobile ? 10 : 12
                                }
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
                                maxRotation: isMobile ? 0 : 45,
                                minRotation: isMobile ? 0 : 45,
                                font: {
                                    size: isMobile ? 9 : 12
                                },
                                padding: isMobile ? 5 : 10
                            },
                            grid: {
                                display: true
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toFixed(2) + '%';
                                },
                                font: {
                                    size: isMobile ? 9 : 12
                                },
                                padding: isMobile ? 5 : 10
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


// 供主站与 hash 管理工具复用：全量投资明细表
export function renderInvestmentDetailsTable(container, userData) {
    const fundNameMapping = FUND_NAME_MAPPING;
    if (!container) return;
    if (!userData || !userData.investment_details) {
        container.innerHTML = '<p class="text-center text-muted py-4">暂无投资明细记录</p>';
        return;
    }
    const userRecords = [...(userData.investment_details || [])];
    const normalizeDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`);
        }
        return new Date(dateStr);
    };
    userRecords.sort((a, b) => {
        const fundKeyA = a.fund || a.product || '';
        const fundKeyB = b.fund || b.product || '';
        const fundNameA = fundNameMapping[fundKeyA] || fundKeyA;
        const fundNameB = fundNameMapping[fundKeyB] || fundKeyB;
        const productCompare = fundNameA.localeCompare(fundNameB, 'zh-CN');
        if (productCompare !== 0) return productCompare;
        return normalizeDate(a.date) - normalizeDate(b.date);
    });
    if (userRecords.length === 0) {
        container.innerHTML = '<p class="text-center text-muted py-4">暂无投资明细记录</p>';
        return;
    }
    let tableHtml = `
        <p class="text-muted small mb-2">注：单位净值仅展示4位小数</p>
        <table class="table" id="investmentDetailTable">
            <thead style="position: sticky; top: 0; background-color: #f8f9fa; z-index: 10;">
                <tr>
                    <th style="background-color: #f8f9fa;">投资者</th>
                    <th style="background-color: #f8f9fa;">交易日期</th>
                    <th style="background-color: #f8f9fa;">产品名称</th>
                    <th style="background-color: #f8f9fa;">操作类型</th>
                    <th style="background-color: #f8f9fa;">币种</th>
                    <th style="background-color: #f8f9fa;">交易金额</th>
                    <th style="background-color: #f8f9fa;">份额变化</th>
                    <th style="background-color: #f8f9fa;">累计份额</th>
                    <th style="background-color: #f8f9fa;">单位净值</th>
                </tr>
            </thead>
            <tbody>`;
    userRecords.forEach(record => {
        const rawFund = record.fund || record.product || '-';
        const fundName = fundNameMapping[rawFund] || rawFund;
        let formattedDate = '-';
        if (record.date) {
            let dateOnly = record.date;
            if (dateOnly.includes('T')) dateOnly = dateOnly.split('T')[0];
            else if (dateOnly.includes(' ')) dateOnly = dateOnly.split(' ')[0];
            const parts = dateOnly.split('/');
            if (parts.length === 3) {
                formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            } else {
                const dp = dateOnly.split('-');
                if (dp.length >= 3) formattedDate = `${dp[0]}-${dp[1].padStart(2, '0')}-${dp[2].padStart(2, '0')}`;
                else formattedDate = dateOnly;
            }
        }
        const amount = record.amount || 0;
        const unit = record.unit || 0;
        const unitTotal = record.unit_total || 0;
        const coin = record.coin || '-';
        const decimals = coin === 'BTC' ? 4 : 2;
        const navPerUnit = record.nav_per_unit;
        const formattedNav = navPerUnit && navPerUnit !== 0 && !isNaN(navPerUnit) ? navPerUnit.toFixed(4) : '-';
        tableHtml += `<tr>
            <td>${record.investor || '-'}</td>
            <td>${formattedDate}</td>
            <td>${fundName}</td>
            <td>${record.action || '-'}</td>
            <td>${coin}</td>
            <td>${amount.toLocaleString('zh-CN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</td>
            <td>${unit.toLocaleString('zh-CN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</td>
            <td>${unitTotal.toLocaleString('zh-CN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</td>
            <td>${formattedNav}</td>
        </tr>`;
    });
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
}
