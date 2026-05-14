/**
 * Mexico Tax Data
 * Tax Year 2024
 * Source: Servicio de Administración Tributaria (SAT)
 * https://www.sat.gob.mx/
 */

export default {
    iso: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.sat.gob.mx/',
};

/**
 * Mexican ISR tax calculation (2024)
 */
export function calculateMX(gross) {
    // ISR brackets 2024 (annual, Art. 152 LISR)
    const brackets = [
        { up_to: 8952.49, rate: 0.0192, fixed: 0 },
        { up_to: 75984.55, rate: 0.064, fixed: 171.88 },
        { up_to: 133536.07, rate: 0.1088, fixed: 4461.94 },
        { up_to: 155229.8, rate: 0.16, fixed: 10723.55 },
        { up_to: 185852.57, rate: 0.1792, fixed: 14194.54 },
        { up_to: 374837.88, rate: 0.2136, fixed: 19682.13 },
        { up_to: 590795.99, rate: 0.2352, fixed: 60049.4 },
        { up_to: 1127926.84, rate: 0.3, fixed: 110842.74 },
        { up_to: 1503902.46, rate: 0.32, fixed: 271981.99 },
        { up_to: 4511707.37, rate: 0.34, fixed: 392294.17 },
        { up_to: Infinity, rate: 0.35, fixed: 1414947.85 },
    ];

    // Find applicable bracket
    let incomeTax = 0;
    for (const bracket of brackets) {
        if (gross <= bracket.up_to) {
            const excess =
                gross -
                (brackets.indexOf(bracket) > 0 ? brackets[brackets.indexOf(bracket) - 1].up_to : 0);
            incomeTax = bracket.fixed + excess * bracket.rate;
            break;
        }
    }

    // Employment subsidy credit (subsidio al empleo) for low-income
    // Simplified: reduces tax for income below ~MXN 400,000
    let employmentSubsidy = 0;
    if (gross <= 87360) {
        employmentSubsidy = Math.min(incomeTax, 4884.24); // Approximate annual max
    }
    incomeTax = Math.max(0, incomeTax - employmentSubsidy);

    // Social security (IMSS) employee contributions
    // Retirement (Retiro): 1.125% (up to 25 UMA)
    // CESANTIA: 1.125% (up to 25 UMA)
    // Sickness/Maternity: 0.25% (up to 25 UMA)
    // Disability/Life: 0.625% (up to 25 UMA)
    // Total employee: ~3.125%
    // UMA 2024: $108.57/day → 25 UMA monthly = ~$81,428/month → annual ~$977,136
    const imssCap = 977136;
    const imssRate = 0.03125;
    const imss = Math.min(gross, imssCap) * imssRate;

    const totalDeductions = incomeTax + imss;
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
        social_security_total: Math.round(imss * 100) / 100,
        social_security_breakdown: [
            { name: 'IMSS (Employee)', amount: Math.round(imss * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + (gross <= imssCap ? imssRate : 0),
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Salaried employee',
            'Employment subsidy applied if eligible',
        ],
    };
}
