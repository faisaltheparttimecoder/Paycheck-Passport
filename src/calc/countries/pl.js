/**
 * Poland Tax Data
 * Tax Year 2024
 * Source: Krajowa Administracja Skarbowa
 * https://www.podatki.gov.pl/
 */

export default {
    iso: 'PL',
    name: 'Poland',
    currency: 'PLN',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.podatki.gov.pl/',
};

/**
 * Polish PIT tax calculation (2024)
 * Polish Deal (Polski Ład) rules
 */
export function calculatePL(gross) {
    // Tax-free amount: PLN 30,000
    const taxFreeAmount = 30000;

    // PIT brackets 2024
    // 12% up to PLN 120,000, 32% above
    const taxableIncome = Math.max(0, gross - taxFreeAmount);

    let incomeTax = 0;
    if (taxableIncome <= 120000) {
        incomeTax = taxableIncome * 0.12;
    } else {
        incomeTax = 120000 * 0.12 + (taxableIncome - 120000) * 0.32;
    }

    // Social security employee contributions (ZUS)
    // Pension (emerytalne): 9.76%
    // Disability (rentowe): 1.5%
    // Sickness (chorobowe): 2.45%
    // Total: 13.71% up to annual limit PLN 234,720 (2024)
    const zusCap = 234720;
    const pensionRate = 0.0976;
    const disabilityRate = 0.015;
    const sicknessRate = 0.0245;

    const pensionBase = Math.min(gross, zusCap);
    const pension = pensionBase * pensionRate;
    const disability = pensionBase * disabilityRate;
    const sickness = gross * sicknessRate; // No cap on sickness

    const zusTotal = pension + disability + sickness;

    // Health insurance: 9% of income after ZUS (only 7.75% was deductible, now 0% deductible)
    const healthBase = gross - zusTotal;
    const healthInsurance = healthBase * 0.09;

    const totalDeductions = incomeTax + zusTotal + healthInsurance;
    const net = gross - totalDeductions;

    const marginalRate = taxableIncome > 120000 ? 0.32 : 0.12;

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round((zusTotal + healthInsurance) * 100) / 100,
        social_security_breakdown: [
            { name: 'Pension (Emerytalne)', amount: Math.round(pension * 100) / 100 },
            { name: 'Disability (Rentowe)', amount: Math.round(disability * 100) / 100 },
            { name: 'Sickness (Chorobowe)', amount: Math.round(sickness * 100) / 100 },
            { name: 'Health Insurance', amount: Math.round(healthInsurance * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.1371 + 0.09,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Employment contract (umowa o pracę)',
            'Tax-free amount (PLN 30,000) applied',
        ],
    };
}
