/**
 * Sweden Tax Data
 * Tax Year 2024
 * Source: Skatteverket
 * https://www.skatteverket.se/
 */

export default {
    iso: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.skatteverket.se/',
};

/**
 * Swedish tax calculation (2024)
 * Municipal tax + state tax on higher incomes
 */
export function calculateSE(gross) {
    // Municipal tax: average ~32.41% (varies by municipality)
    const municipalTaxRate = 0.3241;

    // Basic allowance (grundavdrag) 2024 - simplified
    // Ranges from SEK 16,800 to SEK 40,500 depending on income
    let basicAllowance = 0;
    if (gross <= 46200) {
        basicAllowance = 16800;
    } else if (gross <= 138500) {
        basicAllowance = 16800 + ((gross - 46200) / (138500 - 46200)) * 23700;
    } else if (gross <= 346800) {
        basicAllowance = 40500;
    } else if (gross <= 589000) {
        basicAllowance = 40500 - ((gross - 346800) / (589000 - 346800)) * (40500 - 16800);
    } else {
        basicAllowance = 16800;
    }

    const taxableIncome = Math.max(0, gross - basicAllowance);

    // Municipal tax
    const municipalTax = taxableIncome * municipalTaxRate;

    // State income tax 2024: 20% on income above SEK 598,500
    let stateTax = 0;
    if (taxableIncome > 598500) {
        stateTax = (taxableIncome - 598500) * 0.2;
    }

    // Job tax deduction (jobbskatteavdrag) - simplified
    // Reduces tax significantly for employment income
    let jobTaxDeduction = 0;
    if (gross <= 46200) {
        jobTaxDeduction = gross * municipalTaxRate;
    } else if (gross <= 138500) {
        jobTaxDeduction = (gross - 46200) * 0.0534 + 46200 * municipalTaxRate;
    } else if (gross <= 346800) {
        jobTaxDeduction = 19928;
    } else {
        jobTaxDeduction = Math.max(0, 19928 - (gross - 346800) * 0.03);
    }

    const totalIncomeTax = Math.max(0, municipalTax + stateTax - jobTaxDeduction);

    // Social security (employee): General pension contribution 7% up to SEK 599,250
    const pensionCap = 599250;
    const pension = Math.min(gross, pensionCap) * 0.07;

    const totalDeductions = totalIncomeTax + pension;
    const net = gross - totalDeductions;

    let marginalRate = municipalTaxRate;
    if (taxableIncome > 598500) marginalRate += 0.2;

    return {
        gross,
        income_tax: Math.round(totalIncomeTax * 100) / 100,
        social_security_total: Math.round(pension * 100) / 100,
        social_security_breakdown: [
            { name: 'General Pension (Employee)', amount: Math.round(pension * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.07,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Average municipal tax rate (~32.41%)',
            'Job tax deduction applied',
        ],
    };
}
