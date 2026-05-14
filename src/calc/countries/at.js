/**
 * Austria Tax Data
 * Tax Year 2024
 * Source: Bundesministerium für Finanzen
 * https://www.bmf.gv.at/
 */

export default {
    iso: 'AT',
    name: 'Austria',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.bmf.gv.at/',
};

/**
 * Austrian income tax calculation (2024)
 */
export function calculateAT(gross) {
    // Income tax brackets 2024
    const brackets = [
        { up_to: 12816, rate: 0 },
        { up_to: 20818, rate: 0.2 },
        { up_to: 34513, rate: 0.3 },
        { up_to: 66612, rate: 0.4 },
        { up_to: 99266, rate: 0.48 },
        { up_to: 1000000, rate: 0.5 },
        { up_to: Infinity, rate: 0.55 },
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

    // Employee tax credit (Verkehrsabsetzbetrag): €463
    // Employee deduction (Werbungskostenpauschale): included in brackets
    incomeTax = Math.max(0, incomeTax - 463);

    // Social security employee contributions
    // Pension: 10.25%
    // Health: 3.87%
    // Unemployment: 3% (for income above €1,951/month)
    // Total: ~18.12% up to cap €6,060/month (€72,720/yr)
    const ssCap = 72720;
    const ssRate = 0.1812;
    const socialSecurity = Math.min(gross, ssCap) * ssRate;

    const totalDeductions = incomeTax + socialSecurity;
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
            { name: 'Social Insurance (Employee)', amount: Math.round(socialSecurity * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + (gross <= ssCap ? ssRate : 0),
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Employee tax credit applied',
            'No commuter allowance',
        ],
    };
}
