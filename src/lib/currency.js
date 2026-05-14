/**
 * Currency conversion utilities
 */

let rates = null;
let ratesDate = null;

/**
 * Load exchange rates from static JSON
 */
export async function loadRates() {
    if (rates) return rates;

    try {
        const response = await fetch('./data/rates.json');
        const data = await response.json();
        rates = data.rates;
        ratesDate = data.date;
        return rates;
    } catch (error) {
        console.error('Failed to load exchange rates:', error);
        // Return fallback rates
        rates = { EUR: 1, USD: 1.09, GBP: 0.86 };
        ratesDate = 'fallback';
        return rates;
    }
}

/**
 * Get the date of the loaded rates
 */
export function getRatesDate() {
    return ratesDate;
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {number} Converted amount
 */
export function convert(amount, from, to) {
    if (!rates) {
        console.warn('Rates not loaded, returning original amount');
        return amount;
    }

    if (from === to) return amount;

    // Convert to EUR first (base currency), then to target
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    const inEur = amount / fromRate;
    return inEur * toRate;
}

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, currency, options = {}) {
    const defaults = {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };

    try {
        return new Intl.NumberFormat('en-US', { ...defaults, ...options }).format(amount);
    } catch (error) {
        // Fallback for unsupported currencies
        return `${currency} ${Math.round(amount).toLocaleString()}`;
    }
}

/**
 * Format percentage for display
 * @param {number} rate - Rate as decimal (0.25 = 25%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercent(rate, decimals = 1) {
    return `${(rate * 100).toFixed(decimals)}%`;
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency) {
    const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CHF: 'CHF',
        AUD: 'A$',
        CAD: 'C$',
        NZD: 'NZ$',
        SGD: 'S$',
        HKD: 'HK$',
        SEK: 'kr',
        NOK: 'kr',
        DKK: 'kr',
        INR: '₹',
        BRL: 'R$',
        MXN: 'MX$',
        ZAR: 'R',
        AED: 'د.إ',
        SAR: '﷼',
    };

    return symbols[currency] || currency;
}
