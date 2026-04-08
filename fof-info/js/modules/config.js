export const DATA_BASE_URL = 'https://data.01capital.info/arbcus';

export const EMAILJS_CONFIG = {
    serviceId: 'service_alzfhf8',
    redemptionTemplateId: 'template_x0m1g0s',
    conversionTemplateId: 'template_kem12pn',
    userId: 'NudKPCV0CbLl3NrZT'
};

export const PRODUCT_DATA = {
    'stable-usd': {
        title: 'Stable-Harbor-USDT',
        desc: 'Stable-Harbor USDT 以 USDT 计价，采用低风险套利策略组合，在严格的风控框架下追求稳定收益。策略以交易所间价差捕捉为核心，不承担方向性敞口，力求每日正收益的持续积累。',
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
    'stable-coin-btc': {
        title: 'Stable-Harbor-BTC',
        desc: 'Stable-Harbor BTC 以 BTC 计价，通过低风险套利策略为您的 BTC 持仓创造额外收益。策略专注于市场中性套利，在 BTC 本位下追求持续稳定的净值增长。',
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
        desc: 'Alpha-Bridge 以套利策略为基础配置，叠加少量多因子趋势策略，在控制整体风险的前提下追求超越纯套利的回报。套利部分提供稳定收益底仓，多因子部分捕捉市场趋势中的超额机会。',
        facts: [
            { label: '成立时间', value: '2024/8/1' },
            { label: '策略成分', value: '套利 + 多因子' },
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
        desc: 'Deep-Growth 聚焦各类趋势策略，通过系统化模型捕捉中短期市场趋势与波动机会。策略追求较高的绝对回报，也会经历更明显的净值波动与阶段性回撤。',
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

export const PRODUCT_FUND_MAPPING = {
    balanced: 'Alpha-Bridge',
    arbitrage: 'Stable-Harbor-USDT',
    arbitrage_coin_btc: 'Stable-Harbor-BTC',
    arbitrage_eth: 'Stable-Harbor-ETH',
    growth: 'Deep-Growth'
};

export const FUND_NAME_MAPPING = {
    balanced: 'Alpha-Bridge',
    arbitrage: 'Stable-Harbor-USDT',
    arbitrage_coin: 'Stable-Harbor-BTC',
    arbitrage_eth: 'Stable-Harbor-ETH',
    growth: 'Deep-Growth',
    zerone: 'Alpha-Bridge',
    HPU: 'Stable-Harbor-USDT',
    binggan: 'Stable-Harbor-BTC',
    HPE: 'Stable-Harbor-ETH',
    aggressive: 'Deep-Growth'
};
