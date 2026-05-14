/**
 * Italy Tax Data
 * Tax Year 2024
 * Source: Agenzia delle Entrate
 * https://www.agenziaentrate.gov.it/
 */

export default {
    iso: 'IT',
    name: 'Italy',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.agenziaentrate.gov.it/',
};

/**
 * Italian IRPEF tax calculation (2024)
 * 2024 reform reduced brackets from 4 to 3
 */
export function calculateIT(gross) {
    // IRPEF brackets 2024 (3 brackets since 2024 reform)
    const brackets = [
        { up_to: 28000, rate: 0.23 },
        { up_to: 50000, rate: 0.35 },
        { up_to: Infinity, rate: 0.43 },
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

    // Tax deduction for employees (detrazione per lavoro dipendente)
    // Simplified: up to €1,955 for income up to €15,000, phasing out to €28,000
    let employeeDeduction = 0;
    if (gross <= 15000) {
        employeeDeduction = 1955;
    } else if (gross <= 28000) {
        employeeDeduction = 1910 + 1190 * ((28000 - gross) / 13000);
    } else if (gross <= 50000) {
        employeeDeduction = 1910 * ((50000 - gross) / 22000);
    }

    incomeTax = Math.max(0, incomeTax - employeeDeduction);

    // Regional/municipal surtax (~2.5% average combined)
    const regionalSurtax = gross * 0.025;

    // Social security employee contributions (INPS)
    // IVS contribution: 9.19% up to €55,008, 10.19% above (up to €119,650)
    let socialSecurity = 0;
    if (gross <= 55008) {
        socialSecurity = gross * 0.0919;
    } else {
        socialSecurity = 55008 * 0.0919 + (Math.min(gross, 119650) - 55008) * 0.1019;
    }

    const totalDeductions = incomeTax + socialSecurity + regionalSurtax;
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
        social_security_total: Math.round(socialSecurity * 100) / 100,
        social_security_breakdown: [
            { name: 'INPS (Employee)', amount: Math.round(socialSecurity * 100) / 100 },
        ],
        regional_tax: Math.round(regionalSurtax * 100) / 100,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.025,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Employee deduction applied',
            'Average regional/municipal surtax (~2.5%)',
        ],
    };
}
