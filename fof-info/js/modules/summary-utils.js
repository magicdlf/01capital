function sortByDateAsc(a, b) {
    return new Date(a.date) - new Date(b.date);
}

function sortByDateDesc(a, b) {
    return new Date(b.date) - new Date(a.date);
}

export function getLatestRecord(records, predicate = null) {
    const list = Array.isArray(records) ? records.slice() : [];
    const filtered = predicate ? list.filter(predicate) : list;
    if (!filtered.length) return null;
    return filtered.sort(sortByDateDesc)[0];
}

export function getLatestActiveRecord(records) {
    return getLatestRecord(records, (record) => (record.principal || 0) >= 1);
}

export function getEarliestActiveRecord(records) {
    const list = Array.isArray(records) ? records.filter((record) => (record.principal || 0) >= 1) : [];
    if (!list.length) return null;
    return list.sort(sortByDateAsc)[0];
}

export function computeHoldingDays(firstRecord, latestRecord) {
    if (!firstRecord || !latestRecord) return 0;
    const diff = new Date(latestRecord.date) - new Date(firstRecord.date);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateAnnualizedReturnFromDays(returnRate, days) {
    if (!days || days <= 0) return '0.00';
    return ((Math.pow(1 + returnRate / 100, 365 / days) - 1) * 100).toFixed(2);
}

// 计算"清仓后净值涨幅"：用用户记录里的 nav（基金单位净值，已扣交易团队 carry、未扣 FOF 层个人 mgmt/carry）
// 以清仓当日 nav 为基准，比较最新 nav 的涨跌。
// 返回数值（百分比，保留原精度）或 null（表示"无可展示的后续数据"）。
// null 的判定：
//   - 缺参数、nav 无效
//   - 最新记录日期不晚于清仓日（没有清仓后的后续记录）
//   - 清仓后 nav 与清仓日 nav 差异小于 1e-9（基金净值未真正更新，例如专户清仓后停更）
export function computePostRedemptionFundReturn(clearRecord, latestRecord) {
    if (!clearRecord || !latestRecord) return null;
    const cNav = Number(clearRecord.nav);
    const lNav = Number(latestRecord.nav);
    if (!Number.isFinite(cNav) || !Number.isFinite(lNav) || cNav === 0) return null;
    const clearTs = new Date(clearRecord.date).getTime();
    const latestTs = new Date(latestRecord.date).getTime();
    if (!Number.isFinite(clearTs) || !Number.isFinite(latestTs)) return null;
    if (latestTs <= clearTs) return null;
    if (Math.abs(lNav - cNav) < 1e-9) return null;
    return (lNav / cNav - 1) * 100;
}

// 渲染"清仓后净值涨幅"单元格：null 显示为 "-"，其余带正负号与颜色
export function formatPostRedemptionReturnCell(rate) {
    if (rate === null || rate === undefined || Number.isNaN(rate)) {
        return '<td class="text-muted">-</td>';
    }
    const cls = rate >= 0 ? 'text-positive' : 'text-negative';
    const sign = rate >= 0 ? '+' : '';
    return `<td class="${cls}">${sign}${rate.toFixed(2)}%</td>`;
}

export function computeReturnMetrics(records) {
    const latest = getLatestActiveRecord(records);
    const first = getEarliestActiveRecord(records);
    if (!latest || !first) {
        return {
            latest: null,
            holdingDays: 0,
            returnRate: '0.00',
            annualizedReturn: '0.00'
        };
    }

    const holdingDays = computeHoldingDays(first, latest);
    const returnRate = latest.total_return !== undefined ? (latest.total_return * 100).toFixed(2) : '0.00';
    const annualizedReturn = calculateAnnualizedReturnFromDays(parseFloat(returnRate), holdingDays);

    return { latest, holdingDays, returnRate, annualizedReturn };
}
