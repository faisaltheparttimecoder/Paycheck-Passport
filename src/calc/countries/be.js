/**
 * Belgium Tax Data
 * Tax Year 2024
 * Source: SPF Finances
 * https://finance.belgium.be/
 */

export default {
    iso: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://finance.belgium.be/',
};

/**
 * Belgian tax calculation (2024)
 * Income year 2024, assessment year 2025
 */
export function calculateBE(gross) {
    // Tax-free amount (basisbedrag): €10,160 (indexed for 2024)
    const taxFreeAmount = 10160;

    // Federal tax brackets 2024
    const brackets = [
        { up_to: 15820, rate: 0.25 },
        { up_to: 27920, rate: 0.4 },
        { up_to: 48320, rate: 0.45 },
        { up_to: Infinity, rate: 0.5 },
    ];

    const taxableIncome = Math.max(0, gross - taxFreeAmount);

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

    // Municipal tax (average ~7% surcharge on federal tax)
    const municipalTax = incomeTax * 0.07;

    // Social security employee contribution: 13.07%
    const socialSecurity = gross * 0.1307;

    // Special social security contribution (progressive)
    let specialSS = 0;
    if (gross > 18592.02 && gross <= 21070.96) {
        specialSS = (gross - 18592.02) * 0.09;
    } else if (gross > 21070.96 && gross <= 60161.85) {
        specialSS = 223.1 + (gross - 21070.96) * 0.013;
    } else if (gross > 60161.85) {
        specialSS = 731.28;
    }

    const totalSS = socialSecurity + specialSS;
    const totalDeductions = incomeTax + municipalTax + totalSS;
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
        income_tax: Math.round((incomeTax + municipalTax) * 100) / 100,
        social_security_total: Math.round(totalSS * 100) / 100,
        social_security_breakdown: [
            { name: 'Social Security (13.07%)', amount: Math.round(socialSecurity * 100) / 100 },
            { name: 'Special SS Contribution', amount: Math.round(specialSS * 100) / 100 },
        ],
        regional_tax: Math.round(municipalTax * 100) / 100,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.1307,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Average municipal surcharge (~7%)',
            'Tax-free amount applied',
        ],
    };
}
