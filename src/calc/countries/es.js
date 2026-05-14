/**
 * Spain Tax Data
 * Tax Year 2024
 * Source: Agencia Tributaria
 * https://sede.agenciatributaria.gob.es/
 */

export default {
    iso: 'ES',
    name: 'Spain',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://sede.agenciatributaria.gob.es/',
};

/**
 * Spanish IRPF tax calculation (2024)
 * State portion + general autonomous community portion
 */
export function calculateES(gross) {
    // IRPF brackets 2024 (state + general AC combined)
    const brackets = [
        { up_to: 12450, rate: 0.19 },
        { up_to: 20200, rate: 0.24 },
        { up_to: 35200, rate: 0.3 },
        { up_to: 60000, rate: 0.37 },
        { up_to: 300000, rate: 0.45 },
        { up_to: Infinity, rate: 0.47 },
    ];

    // Personal minimum (mínimo personal): €5,550
    const personalMinimum = 5550;
    const taxableIncome = Math.max(0, gross - personalMinimum);

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

    // Social security employee contributions
    // General contingencies: 4.70%
    // Unemployment: 1.55%
    // Training: 0.10%
    // Total: ~6.35% up to max base €4,720.50/month (€56,646/yr)
    const ssCap = 56646;
    const ssRate = 0.0635;
    const socialSecurity = Math.min(gross, ssCap) * ssRate;

    const totalDeductions = incomeTax + socialSecurity;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of brackets) {
        if (taxableIncome <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(socialSecurity * 100) / 100,
        social_security_breakdown: [
            { name: 'Social Security (Employee)', amount: Math.round(socialSecurity * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + (gross <= ssCap ? ssRate : 0),
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'General autonomous community rates',
            'Personal minimum applied',
        ],
    };
}
