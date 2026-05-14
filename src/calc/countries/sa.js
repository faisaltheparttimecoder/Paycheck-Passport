/**
 * Saudi Arabia Tax Data
 * Tax Year 2024
 * Source: Zakat, Tax and Customs Authority (ZATCA)
 * https://zatca.gov.sa/
 */

export default {
    iso: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://zatca.gov.sa/',
};

/**
 * Saudi Arabia tax calculation (2024)
 * No personal income tax. GOSI contributions for Saudi nationals.
 */
export function calculateSA(gross) {
    // No personal income tax in Saudi Arabia
    const incomeTax = 0;

    // GOSI (General Organization for Social Insurance)
    // Saudi nationals: 9.75% employee (pension 9%, SANED 0.75%)
    // Non-Saudi: 2% employee (occupational hazards paid by employer only)
    // Using Saudi national rates as default
    const gosiRate = 0.0975;
    const gosiCap = 45000 * 12; // Monthly cap SAR 45,000
    const gosi = Math.min(gross, gosiCap) * gosiRate;

    const totalDeductions = incomeTax + gosi;
    const net = gross - totalDeductions;

    return {
        gross,
        income_tax: 0,
        social_security_total: Math.round(gosi * 100) / 100,
        social_security_breakdown: [
            { name: 'GOSI (Employee)', amount: Math.round(gosi * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: gross <= gosiCap ? gosiRate : 0,
        confidence: 'high',
        assumptions: [
            'No personal income tax',
            'Saudi national (GOSI contributions apply)',
            'Non-Saudis pay 2% only',
        ],
    };
}
