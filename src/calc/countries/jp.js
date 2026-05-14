/**
 * Japan Tax Data
 * Tax Year 2024
 * Source: National Tax Agency (NTA)
 * https://www.nta.go.jp/
 */

export default {
    iso: 'JP',
    name: 'Japan',
    currency: 'JPY',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.nta.go.jp/',
};

/**
 * Japanese tax calculation (2024)
 * National income tax + resident tax + social insurance
 */
export function calculateJP(gross) {
    // Employment income deduction (給与所得控除)
    let employmentDeduction = 0;
    if (gross <= 1625000) {
        employmentDeduction = 550000;
    } else if (gross <= 1800000) {
        employmentDeduction = gross * 0.4 - 100000;
    } else if (gross <= 3600000) {
        employmentDeduction = gross * 0.3 + 80000;
    } else if (gross <= 6600000) {
        employmentDeduction = gross * 0.2 + 440000;
    } else if (gross <= 8500000) {
        employmentDeduction = gross * 0.1 + 1100000;
    } else {
        employmentDeduction = 1950000;
    }

    // Basic deduction (基礎控除): ¥480,000
    const basicDeduction = 480000;

    const taxableIncome = Math.max(0, gross - employmentDeduction - basicDeduction);

    // National income tax brackets 2024
    const brackets = [
        { up_to: 1950000, rate: 0.05 },
        { up_to: 3300000, rate: 0.1 },
        { up_to: 6950000, rate: 0.2 },
        { up_to: 9000000, rate: 0.23 },
        { up_to: 18000000, rate: 0.33 },
        { up_to: 40000000, rate: 0.4 },
        { up_to: Infinity, rate: 0.45 },
    ];

    let nationalTax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
        const taxableInBand = Math.min(taxableIncome, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            nationalTax += taxableInBand * bracket.rate;
        }
        if (taxableIncome <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Reconstruction surtax: 2.1% on national tax
    const reconstructionTax = nationalTax * 0.021;
    nationalTax += reconstructionTax;

    // Resident tax (住民税): ~10% flat on taxable income
    const residentTax = taxableIncome * 0.1;

    // Social insurance (employee share)
    // Health insurance: ~5% (varies by prefecture)
    // Pension (厚生年金): 9.15%
    // Employment insurance: 0.6%
    // Total: ~14.75% up to standard monthly remuneration cap
    const healthInsurance = gross * 0.05;
    const pension = Math.min(gross, 8760000) * 0.0915; // Cap at ¥650,000/month
    const employmentInsurance = gross * 0.006;

    const socialInsuranceTotal = healthInsurance + pension + employmentInsurance;
    const totalDeductions = nationalTax + residentTax + socialInsuranceTotal;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }
    marginalRate = marginalRate * 1.021 + 0.1; // Add reconstruction surtax + resident tax

    return {
        gross,
        income_tax: Math.round((nationalTax + residentTax) * 100) / 100,
        social_security_total: Math.round(socialInsuranceTotal * 100) / 100,
        social_security_breakdown: [
            { name: 'Health Insurance', amount: Math.round(healthInsurance * 100) / 100 },
            { name: 'Pension (厚生年金)', amount: Math.round(pension * 100) / 100 },
            { name: 'Employment Insurance', amount: Math.round(employmentInsurance * 100) / 100 },
        ],
        regional_tax: Math.round(residentTax * 100) / 100,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: Math.round(marginalRate * 10000) / 10000,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Employment income deduction applied',
            'Resident tax at ~10%',
            'Average health insurance rate (~5%)',
        ],
    };
}
