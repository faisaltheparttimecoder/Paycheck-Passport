/**
 * Germany Tax Data
 * Tax Year 2024
 * Source: Bundesfinanzministerium
 */

export default {
    iso: 'DE',
    name: 'Germany',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.bundesfinanzministerium.de/Web/EN/Issues/Taxation/taxation.html',

    income_tax: {
        type: 'progressive',
        // German tax uses a formula, these are approximations
        brackets: [
            { up_to: 11604, rate: 0 },
            { up_to: 17005, rate: 0.14 },
            { up_to: 66760, rate: 0.24 }, // Average in zone 2
            { up_to: 277825, rate: 0.42 },
            { up_to: null, rate: 0.45 },
        ],
    },

    social_security: [
        { name: 'Pension Insurance', rate: 0.093, cap: 90600 },
        { name: 'Health Insurance', rate: 0.073, cap: 62100 }, // Employee share ~7.3% + avg supplementary
        { name: 'Unemployment Insurance', rate: 0.013, cap: 90600 },
        { name: 'Long-term Care Insurance', rate: 0.023, cap: 62100 }, // Higher rate for childless
    ],

    regional: null,

    allowances: {
        personal: 11604,
    },

    notes: 'Single filer (Steuerklasse I). Church tax and solidarity surcharge excluded.',
};

/**
 * German income tax uses a polynomial formula, not simple brackets
 * This implements the actual 2024 formula
 */
export function calculateDE(gross) {
    const grundfreibetrag = 11604; // Tax-free allowance

    // Calculate taxable income
    const taxableIncome = Math.max(0, gross - grundfreibetrag);

    // German tax formula for 2024
    let incomeTax = 0;

    if (gross <= 11604) {
        // Zone 1: No tax
        incomeTax = 0;
    } else if (gross <= 17005) {
        // Zone 2: Progressive formula
        const y = (gross - 11604) / 10000;
        incomeTax = (922.98 * y + 1400) * y;
    } else if (gross <= 66760) {
        // Zone 3: Progressive formula
        const z = (gross - 17005) / 10000;
        incomeTax = (181.19 * z + 2397) * z + 1025.38;
    } else if (gross <= 277825) {
        // Zone 4: 42% marginal rate
        incomeTax = 0.42 * gross - 10602.13;
    } else {
        // Zone 5: 45% marginal rate (Reichensteuer)
        incomeTax = 0.45 * gross - 18936.88;
    }

    incomeTax = Math.max(0, Math.round(incomeTax));

    // Social security contributions (employee share)
    // Pension: 9.3% up to €90,600
    const pension = Math.min(gross, 90600) * 0.093;

    // Health: ~7.3% (base) + ~0.8% (avg supplementary) up to €62,100
    const health = Math.min(gross, 62100) * 0.081;

    // Unemployment: 1.3% up to €90,600
    const unemployment = Math.min(gross, 90600) * 0.013;

    // Long-term care: 2.3% (childless rate) up to €62,100
    const care = Math.min(gross, 62100) * 0.023;

    const socialSecurityTotal = pension + health + unemployment + care;

    const totalDeductions = incomeTax + socialSecurityTotal;
    const net = gross - totalDeductions;

    // Calculate marginal rate
    let marginalRate = 0;
    if (gross <= 11604) marginalRate = 0;
    else if (gross <= 17005)
        marginalRate = 0.14 + ((gross - 11604) / (17005 - 11604)) * (0.24 - 0.14);
    else if (gross <= 66760)
        marginalRate = 0.24 + ((gross - 17005) / (66760 - 17005)) * (0.42 - 0.24);
    else if (gross <= 277825) marginalRate = 0.42;
    else marginalRate = 0.45;

    // Add social security marginal (roughly 20% up to caps)
    if (gross <= 62100)
        marginalRate += 0.202; // All contributions apply
    else if (gross <= 90600) marginalRate += 0.106; // Only pension + unemployment
    // Above caps, no additional SS marginal

    return {
        gross,
        income_tax: Math.round(incomeTax * 100) / 100,
        social_security_total: Math.round(socialSecurityTotal * 100) / 100,
        social_security_breakdown: [
            { name: 'Pension Insurance', amount: Math.round(pension * 100) / 100 },
            { name: 'Health Insurance', amount: Math.round(health * 100) / 100 },
            { name: 'Unemployment Insurance', amount: Math.round(unemployment * 100) / 100 },
            { name: 'Long-term Care', amount: Math.round(care * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: Math.round(marginalRate * 10000) / 10000,
        confidence: 'high',
        assumptions: [
            'Single filer (Steuerklasse I)',
            'No dependents',
            'No church tax',
            'Childless (higher care insurance rate)',
        ],
    };
}
