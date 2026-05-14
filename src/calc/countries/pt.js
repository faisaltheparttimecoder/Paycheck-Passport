/**
 * Portugal Tax Data
 * Tax Year 2024
 * Source: Portal das Finanças
 * https://www.portaldasfinancas.gov.pt/
 */

export default {
    iso: 'PT',
    name: 'Portugal',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.portaldasfinancas.gov.pt/',
};

/**
 * Portuguese IRS tax calculation (2024)
 */
export function calculatePT(gross) {
    // IRS brackets 2024 (9 brackets)
    const brackets = [
        { up_to: 7703, rate: 0.1325 },
        { up_to: 11623, rate: 0.18 },
        { up_to: 16472, rate: 0.23 },
        { up_to: 21321, rate: 0.26 },
        { up_to: 27146, rate: 0.3275 },
        { up_to: 39791, rate: 0.37 },
        { up_to: 51997, rate: 0.435 },
        { up_to: 81199, rate: 0.45 },
        { up_to: Infinity, rate: 0.48 },
    ];

    // Specific deduction for employment income: €4,104
    const specificDeduction = 4104;
    const taxableIncome = Math.max(0, gross - specificDeduction);

    let incomeTax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
        const taxableInBand = Math.min(taxableIncome, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            incomeTax += taxableInBand * bracket.rate;
        }
        if (taxableIncome <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Social security employee contribution: 11%
    const socialSecurity = gross * 0.11;

    const totalDeductions = incomeTax + socialSecurity;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(socialSecurity * 100) / 100,
        social_security_breakdown: [
            { name: 'Social Security (Employee)', amount: Math.round(socialSecurity * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.11,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Mainland Portugal rates',
            'Specific deduction for employment applied',
        ],
    };
}
