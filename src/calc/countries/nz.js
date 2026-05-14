/**
 * New Zealand Tax Data
 * Tax Year 2024-25 (1 April 2024 - 31 March 2025)
 * Source: Inland Revenue (IRD)
 * https://www.ird.govt.nz/
 */

export default {
    iso: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    tier: 1,
    fiscal_year_start: '04-01',
    last_updated: '2024-04-01',
    source_url: 'https://www.ird.govt.nz/',
};

/**
 * New Zealand tax calculation (2024-25)
 * New thresholds from 31 July 2024
 */
export function calculateNZ(gross) {
    // Income tax brackets 2024-25 (from 31 July 2024)
    const brackets = [
        { up_to: 15600, rate: 0.105 },
        { up_to: 53500, rate: 0.175 },
        { up_to: 78100, rate: 0.3 },
        { up_to: 180000, rate: 0.33 },
        { up_to: Infinity, rate: 0.39 },
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

    // ACC earner's levy: 1.60% up to $142,283 (2024-25)
    const accCap = 142283;
    const acc = Math.min(gross, accCap) * 0.016;

    // KiwiSaver: 3% default employee contribution (opt-out possible)
    // Not a tax but reduces take-home; included with note
    const kiwiSaver = gross * 0.03;

    const totalDeductions = incomeTax + acc + kiwiSaver;
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
        social_security_total: Math.round((acc + kiwiSaver) * 100) / 100,
        social_security_breakdown: [
            { name: 'ACC Levy', amount: Math.round(acc * 100) / 100 },
            { name: 'KiwiSaver (3%)', amount: Math.round(kiwiSaver * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.016 + 0.03,
        confidence: 'high',
        assumptions: [
            'Tax resident',
            'No dependents',
            'KiwiSaver at 3% (default)',
            'ACC earner levy included',
        ],
    };
}
