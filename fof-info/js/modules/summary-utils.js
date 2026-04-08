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
    return getLatestRecord(records, (record) => (record.principal || 0) > 1);
}

export function getEarliestActiveRecord(records) {
    const list = Array.isArray(records) ? records.filter((record) => (record.principal || 0) > 1) : [];
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
