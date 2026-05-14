/**
 * URL State Management
 * Shareable URLs via query params
 */

let debounceTimer = null;

/**
 * Parse URL params into state object
 * @returns {Object} State from URL
 */
export function parseUrl() {
    const params = new URLSearchParams(window.location.search);

    return {
        salary: params.get('salary') ? parseFloat(params.get('salary')) : null,
        currency: params.get('currency') || null,
        from: params.get('from') || null,
        to: params.get('to') ? params.get('to').split(',').filter(Boolean) : [],
        region_us: params.get('region_us') || null,
        region_ca: params.get('region_ca') || null,
        region_ch: params.get('region_ch') || null,
    };
}

/**
 * Update URL with current state (debounced)
 * @param {Object} state - Current form state
 */
export function updateUrl(state) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        const params = new URLSearchParams();

        if (state.salary) params.set('salary', state.salary);
        if (state.currency) params.set('currency', state.currency);
        if (state.from) params.set('from', state.from);
        if (state.to && state.to.length > 0) {
            params.set('to', state.to.filter(Boolean).join(','));
        }
        if (state.region_us) params.set('region_us', state.region_us);
        if (state.region_ca) params.set('region_ca', state.region_ca);
        if (state.region_ch) params.set('region_ch', state.region_ch);

        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState({}, '', newUrl);
    }, 300);
}

/**
 * Get shareable URL for current state
 * @param {Object} state - Current form state
 * @returns {string} Full shareable URL
 */
export function getShareableUrl(state) {
    const params = new URLSearchParams();

    if (state.salary) params.set('salary', state.salary);
    if (state.currency) params.set('currency', state.currency);
    if (state.from) params.set('from', state.from);
    if (state.to && state.to.length > 0) {
        params.set('to', state.to.filter(Boolean).join(','));
    }
    if (state.region_us) params.set('region_us', state.region_us);
    if (state.region_ca) params.set('region_ca', state.region_ca);
    if (state.region_ch) params.set('region_ch', state.region_ch);

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
