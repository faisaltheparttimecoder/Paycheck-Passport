/**
 * India Tax Data
 * Tax Year 2024-25 (1 April 2024 - 31 March 2025)
 * Source: Income Tax Department
 * https://www.incometax.gov.in/
 */

export default {
    iso: 'IN',
    name: 'India',
    currency: 'INR',
    tier: 1,
    fiscal_year_start: '04-01',
    last_updated: '2024-04-01',
    source_url: 'https://www.incometax.gov.in/',
};

/**
 * Indian tax calculation (2024-25)
 * New Tax Regime (default from FY 2024-25)
 */
export function calculateIN(gross) {
    // Standard deduction: ₹75,000 (new regime, Budget 2024)
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, gross - standardDeduction);

    // New Tax Regime brackets 2024-25 (Budget 2024 updated)
    const brackets = [
        { up_to: 300000, rate: 0 },
        { up_to: 700000, rate: 0.05 },
        { up_to: 1000000, rate: 0.1 },
        { up_to: 1200000, rate: 0.15 },
        { up_to: 1500000, rate: 0.2 },
        { up_to: Infinity, rate: 0.3 },
    ];

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

    // Rebate u/s 87A: Full rebate if taxable income ≤ ₹7,00,000 (new regime)
    if (taxableIncome <= 700000) {
        incomeTax = 0;
    }

    // Surcharge on income tax
    let surcharge = 0;
    if (gross > 50000000) {
        surcharge = incomeTax * 0.37; // Capped at 25% effective for new regime
    } else if (gross > 20000000) {
        surcharge = incomeTax * 0.25;
    } else if (gross > 10000000) {
        surcharge = incomeTax * 0.15;
    } else if (gross > 5000000) {
        surcharge = incomeTax * 0.1;
    }

    // Health and Education Cess: 4%
    const cess = (incomeTax + surcharge) * 0.04;
    const totalIncomeTax = incomeTax + surcharge + cess;

    // EPF (Employee Provident Fund): 12% of basic
    // Assuming basic = 50% of gross (common structure)
    const basicSalary = gross * 0.5;
    const epf = Math.min(basicSalary, 180000) * 0.12; // Statutory limit on EPF

    // Professional tax: varies by state, max ₹2,500/year
    const professionalTax = 2500;

    const totalDeductions = totalIncomeTax + epf + professionalTax;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }
    // Add cess to marginal
    marginalRate = marginalRate * 1.04;

    return {
        gross,
        income_tax: Math.round(totalIncomeTax * 100) / 100,
        social_security_total: Math.round((epf + professionalTax) * 100) / 100,
        social_security_breakdown: [
            { name: 'EPF (Employee)', amount: Math.round(epf * 100) / 100 },
            { name: 'Professional Tax', amount: professionalTax },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: Math.round(marginalRate * 10000) / 10000,
        confidence: 'high',
        assumptions: [
            'New Tax Regime (default FY 2024-25)',
            'Single filer',
            'Standard deduction (₹75,000)',
            'EPF on statutory limit',
            'Rebate u/s 87A applied if eligible',
        ],
    };
}
