export function initProductListRouting(options) {
    const {
        productList,
        onBalanced,
        onStableUsd,
        onStableCoinBtc,
        onAggressive,
        defaultRange = 'all'
    } = options;

    if (!productList) return;

    const handlerMap = {
        balanced: onBalanced,
        'stable-usd': onStableUsd,
        'stable-coin-btc': onStableCoinBtc,
        aggressive: onAggressive
    };

    productList.addEventListener('click', (e) => {
        if (!e.target.matches('button[data-product]')) return;
        const key = e.target.getAttribute('data-product');

        const sectionHandler = handlerMap[key];
        if (typeof sectionHandler === 'function') {
            setTimeout(() => sectionHandler(defaultRange), 100);
        }

        productList.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
        e.target.classList.add('active');
    });
}
