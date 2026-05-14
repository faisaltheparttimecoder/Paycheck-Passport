/**
 * Norway Tax Data
 * Tax Year 2024
 * Source: Skatteetaten
 * https://www.skatteetaten.no/
 */

export default {
    iso: 'NO',
    name: 'Norway',
    currency: 'NOK',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.skatteetaten.no/',
};

/**
 * Norwegian tax calculation (2024)
 * Income tax + bracket tax (trinnskatt) + social security
 */
export function calculateNO(gross) {
    // Personal allowance (personfradrag): NOK 88,250 (class 1)
    const personalAllowance = 88250;

    // Standard deduction for employment income: minimum NOK 4,000
    // 46% of employment income, max NOK 104,450
    const minstefradrag = Math.min(Math.max(gross * 0.46, 4000), 104450);

    const taxableIncome = Math.max(0, gross - personalAllowance - minstefradrag);

    // Common tax rate on ordinary income: 22%
    const ordinaryTax = taxableIncome * 0.22;

    // Bracket tax (trinnskatt) 2024 — applied on gross personal income
    const trinnskattBrackets = [
        { up_to: 208050, rate: 0 },
        { up_to: 292850, rate: 0.017 },
        { up_to: 670000, rate: 0.04 },
        { up_to: 937900, rate: 0.136 },
        { up_to: 1350000, rate: 0.166 },
        { up_to: Infinity, rate: 0.176 },
    ];

    let trinnskatt = 0;
    let previousLimit = 0;
    for (const bracket of trinnskattBrackets) {
        const taxableInBand = Math.min(gross, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            trinnskatt += taxableInBand * bracket.rate;
        }
        if (gross <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Social security contribution (trygdeavgift): 7.8% on gross
    const socialSecurity = gross * 0.078;

    const totalDeductions = ordinaryTax + trinnskatt + socialSecurity;
    const net = gross - totalDeductions;

    let trinnskattMarginal = 0;
    for (const bracket of trinnskattBrackets) {
        if (gross <= bracket.up_to) {
            trinnskattMarginal = bracket.rate;
            break;
        }
    }

    return {
        gross,
        income_tax: Math.round((ordinaryTax + trinnskatt) * 100) / 100,
        social_security_total: Math.round(socialSecurity * 100) / 100,
        social_security_breakdown: [
            {
                name: 'Trygdeavgift (Social Security)',
                amount: Math.round(socialSecurity * 100) / 100,
            },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: 0.22 + trinnskattMarginal + 0.078,
        confidence: 'high',
        assumptions: [
            'Single filer (class 1)',
            'No dependents',
            'Standard minimum deduction applied',
            'Tax resident',
        ],
    };
}
