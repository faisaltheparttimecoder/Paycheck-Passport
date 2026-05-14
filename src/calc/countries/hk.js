/**
 * Hong Kong Tax Data
 * Tax Year 2024/25 (1 April 2024 - 31 March 2025)
 * Source: Inland Revenue Department
 * https://www.ird.gov.hk/
 */

export default {
    iso: 'HK',
    name: 'Hong Kong',
    currency: 'HKD',
    tier: 1,
    fiscal_year_start: '04-01',
    last_updated: '2024-04-01',
    source_url: 'https://www.ird.gov.hk/',
};

/**
 * Hong Kong salaries tax calculation (2024/25)
 * Lower of progressive rates or standard rate (15%)
 */
export function calculateHK(gross) {
    // Basic allowance: HK$132,000
    const basicAllowance = 132000;
    const taxableIncome = Math.max(0, gross - basicAllowance);

    // Progressive tax rates 2024/25
    const brackets = [
        { up_to: 50000, rate: 0.02 },
        { up_to: 100000, rate: 0.06 },
        { up_to: 150000, rate: 0.1 },
        { up_to: 200000, rate: 0.14 },
        { up_to: Infinity, rate: 0.17 },
    ];

    let progressiveTax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
        const taxableInBand = Math.min(taxableIncome, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            progressiveTax += taxableInBand * bracket.rate;
        }
        if (taxableIncome <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Standard rate: 15% on net chargeable income (without allowances)
    const standardRateTax = gross * 0.15;

    // Tax payable is the lower of progressive or standard
    const incomeTax = Math.min(progressiveTax, standardRateTax);

    // MPF (Mandatory Provident Fund): 5% up to HK$1,500/month (HK$18,000/yr)
    const mpf = Math.min(gross, 360000) * 0.05;
    const mpfCapped = Math.min(mpf, 18000);

    const totalDeductions = incomeTax + mpfCapped;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    if (progressiveTax < standardRateTax) {
        for (const bracket of brackets) {
            if (taxableIncome <= bracket.up_to) {
                marginalRate = bracket.rate;
                break;
            }
        }
    } else {
        marginalRate = 0.15;
    }

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(mpfCapped * 100) / 100,
        social_security_breakdown: [
            { name: 'MPF (Employee)', amount: Math.round(mpfCapped * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Lower of progressive or standard rate',
            'Basic allowance (HK$132,000) applied',
        ],
    };
}
