/**
 * Finland Tax Data
 * Tax Year 2024
 * Source: Verohallinto (Finnish Tax Administration)
 * https://www.vero.fi/
 */

export default {
    iso: 'FI',
    name: 'Finland',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.vero.fi/',
};

/**
 * Finnish tax calculation (2024)
 * State progressive tax + municipal flat tax + social contributions
 */
export function calculateFI(gross) {
    // Earned income deduction (ansiotulovähennys) — simplified
    const earnedIncomeDeduction = Math.min(gross * 0.51, 7230);
    const taxableForState = Math.max(0, gross - earnedIncomeDeduction);

    // State income tax brackets 2024
    const stateBrackets = [
        { up_to: 20500, rate: 0 },
        { up_to: 30500, rate: 0.1264 },
        { up_to: 50400, rate: 0.1764 },
        { up_to: 88200, rate: 0.2414 },
        { up_to: 150000, rate: 0.3164 },
        { up_to: Infinity, rate: 0.44 },
    ];

    let stateTax = 0;
    let previousLimit = 0;
    for (const bracket of stateBrackets) {
        const taxableInBand = Math.min(taxableForState, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            stateTax += taxableInBand * bracket.rate;
        }
        if (taxableForState <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Municipal tax: average ~20.37% (varies by municipality)
    // Applied after basic deduction (perusvähennys) for municipal tax
    const basicDeduction = Math.max(0, Math.min(3870, 3870 - (gross - 2500) * 0.18));
    const taxableForMunicipal = Math.max(0, gross - basicDeduction);
    const municipalTaxRate = 0.2037;
    const municipalTax = taxableForMunicipal * municipalTaxRate;

    // Church tax: ~1.4% average (optional but common)
    const churchTax = taxableForMunicipal * 0.014;

    // Social security employee contributions 2024
    // Pension (TyEL): 7.15% (under 53) or 8.65% (53-62)
    // Unemployment: 1.50%
    // Health insurance (day allowance): 1.01%
    const pension = gross * 0.0715;
    const unemployment = gross * 0.015;
    const healthInsurance = gross * 0.0101;
    const socialSecurityTotal = pension + unemployment + healthInsurance;

    const totalDeductions = stateTax + municipalTax + churchTax + socialSecurityTotal;
    const net = gross - totalDeductions;

    let marginalRate = municipalTaxRate + 0.014;
    for (const bracket of stateBrackets) {
        if (taxableForState <= bracket.up_to) {
            marginalRate += bracket.rate;
            break;
        }
    }

    return {
        gross,
        income_tax: Math.round((stateTax + municipalTax + churchTax) * 100) / 100,
        social_security_total: Math.round(socialSecurityTotal * 100) / 100,
        social_security_breakdown: [
            { name: 'TyEL Pension', amount: Math.round(pension * 100) / 100 },
            { name: 'Unemployment Insurance', amount: Math.round(unemployment * 100) / 100 },
            { name: 'Health Insurance', amount: Math.round(healthInsurance * 100) / 100 },
        ],
        regional_tax: Math.round(municipalTax * 100) / 100,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: Math.round(marginalRate * 10000) / 10000,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Under 53 (lower pension rate)',
            'Average municipal tax (~20.37%)',
            'Church tax included (~1.4%)',
        ],
    };
}
