/**
 * Rough estimate fallback for Tier-2 countries
 * Uses a single flat rate based on KPMG top marginal rate data
 */

/**
 * Calculate rough take-home estimate
 * @param {number} gross - Gross annual salary
 * @param {number} estimatedRate - Estimated effective tax rate (0-1)
 * @returns {Object} Calculation result
 */
export function calculateRough(gross, estimatedRate = 0.3) {
    const totalDeductions = gross * estimatedRate;
    const net = gross - totalDeductions;

    return {
        gross,
        income_tax: Math.round(totalDeductions * 100) / 100,
        social_security_total: 0,
        social_security_breakdown: [],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: estimatedRate,
        marginal_rate: estimatedRate,
        confidence: 'rough',
        assumptions: [
            'Single filer',
            'No dependents',
            'Estimate based on average effective rate',
            'Social security contributions not included',
        ],
    };
}

/**
 * Default estimated rates by region
 * Based on KPMG worldwide tax summaries
 * These are rough averages, not precise calculations
 */
export const DEFAULT_RATES = {
    // High-tax regions
    HIGH: 0.4,
    // Medium-tax regions
    MEDIUM: 0.3,
    // Low-tax regions
    LOW: 0.2,
    // Very low / no income tax
    MINIMAL: 0.1,
};
