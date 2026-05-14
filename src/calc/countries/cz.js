/**
 * Czechia Tax Data
 * Tax Year 2024
 * Source: Finanční správa
 * https://www.financnisprava.cz/
 */

export default {
    iso: 'CZ',
    name: 'Czechia',
    currency: 'CZK',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.financnisprava.cz/',
};

/**
 * Czech tax calculation (2024)
 * 2024 consolidation package changes
 */
export function calculateCZ(gross) {
    // Super-gross concept abolished since 2021
    // 2024: 15% up to 36x average monthly wage, 23% above
    // Average monthly wage 2024: CZK 43,967 → threshold = 36 * 43,967 = CZK 1,582,812
    const highRateThreshold = 1582812;

    let incomeTax = 0;
    if (gross <= highRateThreshold) {
        incomeTax = gross * 0.15;
    } else {
        incomeTax = highRateThreshold * 0.15 + (gross - highRateThreshold) * 0.23;
    }

    // Basic taxpayer credit (sleva na poplatníka): CZK 30,840
    const taxpayerCredit = 30840;
    incomeTax = Math.max(0, incomeTax - taxpayerCredit);

    // Social security employee contributions 2024
    // Pension insurance: 6.5%
    // Health insurance: 4.5%
    // Sickness insurance: 0% (paid by employer)
    // Total employee: 11%
    const pensionInsurance = gross * 0.065;
    const healthInsurance = gross * 0.045;
    const socialSecurityTotal = pensionInsurance + healthInsurance;

    const totalDeductions = incomeTax + socialSecurityTotal;
    const net = gross - totalDeductions;

    const marginalRate = gross > highRateThreshold ? 0.23 : 0.15;

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(socialSecurityTotal * 100) / 100,
        social_security_breakdown: [
            { name: 'Pension Insurance', amount: Math.round(pensionInsurance * 100) / 100 },
            { name: 'Health Insurance', amount: Math.round(healthInsurance * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.11,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Basic taxpayer credit applied',
            'Employee contributions only',
        ],
    };
}
