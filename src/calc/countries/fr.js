/**
 * France Tax Data
 * Tax Year 2024
 * Source: impots.gouv.fr
 */

export default {
    iso: 'FR',
    name: 'France',
    currency: 'EUR',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url:
        'https://www.impots.gouv.fr/particulier/questions/comment-est-calcule-limpot-sur-le-revenu',

    income_tax: {
        type: 'progressive',
        brackets: [
            { up_to: 11294, rate: 0 },
            { up_to: 28797, rate: 0.11 },
            { up_to: 82341, rate: 0.3 },
            { up_to: 177106, rate: 0.41 },
            { up_to: null, rate: 0.45 },
        ],
    },

    social_security: [
        { name: 'CSG', rate: 0.092, cap: null },
        { name: 'CRDS', rate: 0.005, cap: null },
    ],

    regional: null,
    allowances: { personal: 0 },
    notes: 'Single filer. Employee social contributions (~22%) typically deducted by employer before gross.',
};

/**
 * French tax calculation
 * Note: France has complex social charges. This is simplified.
 */
export function calculateFR(gross) {
    // Income tax brackets 2024
    const brackets = [
        { up_to: 11294, rate: 0 },
        { up_to: 28797, rate: 0.11 },
        { up_to: 82341, rate: 0.3 },
        { up_to: 177106, rate: 0.41 },
        { up_to: Infinity, rate: 0.45 },
    ];

    // Calculate income tax
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

    // Social contributions (CSG + CRDS on 98.25% of gross)
    const socialBase = gross * 0.9825;
    const csg = socialBase * 0.092; // 9.2% CSG (6.8% deductible)
    const crds = socialBase * 0.005; // 0.5% CRDS

    // Employee social security contributions (~22% average)
    // This includes pension, health, unemployment
    const employeeSS = gross * 0.22;

    const socialSecurityTotal = csg + crds + employeeSS;
    const totalDeductions = incomeTax + socialSecurityTotal;
    const net = gross - totalDeductions;

    // Marginal rate
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
        social_security_total: Math.round(socialSecurityTotal * 100) / 100,
        social_security_breakdown: [
            { name: 'CSG', amount: Math.round(csg * 100) / 100 },
            { name: 'CRDS', amount: Math.round(crds * 100) / 100 },
            { name: 'Employee SS', amount: Math.round(employeeSS * 100) / 100 },
        ],
        regional_tax: 0,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate + 0.22, // Include SS marginal
        confidence: 'high',
        assumptions: ['Single filer', 'No dependents', 'Standard employee contributions'],
    };
}
