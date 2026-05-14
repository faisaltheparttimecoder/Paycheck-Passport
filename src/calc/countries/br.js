/**
 * Brazil Tax Data
 * Tax Year 2024
 * Source: Receita Federal
 * https://www.gov.br/receitafederal/
 */

export default {
    iso: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.gov.br/receitafederal/',
};

/**
 * Brazilian IRPF tax calculation (2024)
 */
export function calculateBR(gross) {
    // INSS (social security) employee contribution 2024
    // Progressive rates with ceiling
    const inssBrackets = [
        { up_to: 1412.0 * 12, rate: 0.075 },
        { up_to: 2666.68 * 12, rate: 0.09 },
        { up_to: 4000.03 * 12, rate: 0.12 },
        { up_to: 7786.02 * 12, rate: 0.14 },
    ];

    let inss = 0;
    let prevLimit = 0;
    for (const bracket of inssBrackets) {
        const annualLimit = bracket.up_to;
        const taxableInBand = Math.min(gross, annualLimit) - prevLimit;
        if (taxableInBand > 0) {
            inss += taxableInBand * bracket.rate;
        }
        if (gross <= annualLimit) break;
        prevLimit = annualLimit;
    }

    // Taxable income = gross - INSS - simplified deduction
    const taxableIncome = Math.max(0, gross - inss);

    // IRPF brackets 2024 (monthly converted to annual)
    const irpfBrackets = [
        { up_to: 2259.2 * 12, rate: 0 },
        { up_to: 2826.65 * 12, rate: 0.075 },
        { up_to: 3751.05 * 12, rate: 0.15 },
        { up_to: 4664.68 * 12, rate: 0.225 },
        { up_to: Infinity, rate: 0.275 },
    ];

    let incomeTax = 0;
    prevLimit = 0;
    for (const bracket of irpfBrackets) {
        const taxableInBand = Math.min(taxableIncome, bracket.up_to) - prevLimit;
        if (taxableInBand > 0) {
            incomeTax += taxableInBand * bracket.rate;
        }
        if (taxableIncome <= bracket.up_to) break;
        prevLimit = bracket.up_to;
    }

    const totalDeductions = incomeTax + inss;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of irpfBrackets) {
        if (taxableIncome <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(inss * 100) / 100,
        social_security_breakdown: [
            { name: 'INSS (Employee)', amount: Math.round(inss * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate,
        confidence: 'high',
        assumptions: [
            'Single filer (CLT employee)',
            'No dependents',
            'INSS deducted before IRPF',
            'No additional deductions',
        ],
    };
}
