/**
 * South Africa Tax Data
 * Tax Year 2024/25 (1 March 2024 - 28 February 2025)
 * Source: South African Revenue Service (SARS)
 * https://www.sars.gov.za/
 */

export default {
    iso: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    tier: 1,
    fiscal_year_start: '03-01',
    last_updated: '2024-03-01',
    source_url: 'https://www.sars.gov.za/',
};

/**
 * South African tax calculation (2024/25)
 */
export function calculateZA(gross) {
    // Income tax brackets 2024/25
    const brackets = [
        { up_to: 237100, rate: 0.18 },
        { up_to: 370500, rate: 0.26 },
        { up_to: 512800, rate: 0.31 },
        { up_to: 673000, rate: 0.36 },
        { up_to: 857900, rate: 0.39 },
        { up_to: 1817000, rate: 0.41 },
        { up_to: Infinity, rate: 0.45 },
    ];

    let incomeTax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
        const taxableInBand = Math.min(gross, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            incomeTax += taxableInBand * bracket.rate;
        }
        if (gross <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Primary rebate: R17,235 (under 65)
    const primaryRebate = 17235;
    incomeTax = Math.max(0, incomeTax - primaryRebate);

    // Tax threshold (under 65): R95,750 — no tax below this
    if (gross < 95750) {
        incomeTax = 0;
    }

    // UIF (Unemployment Insurance Fund): 1% of remuneration, max R17,712/yr
    const uif = Math.min(gross * 0.01, 17712);

    const totalDeductions = incomeTax + uif;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of brackets) {
        if (gross <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(uif * 100) / 100,
        social_security_breakdown: [
            { name: 'UIF (Unemployment)', amount: Math.round(uif * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.01,
        confidence: 'high',
        assumptions: ['Single filer', 'Under 65 years', 'No dependents', 'Primary rebate applied'],
    };
}
