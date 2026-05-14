/**
 * Switzerland Tax Data
 * Tax Year 2024
 * Source: Federal Tax Administration (ESTV/AFC)
 * https://www.estv.admin.ch/
 */

export default {
    iso: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://www.estv.admin.ch/',
};

/**
 * Swiss tax calculation (2024)
 * Federal + cantonal + municipal — cantonal/municipal varies hugely
 */
export function calculateCH(gross, canton = 'ZH') {
    // Federal direct tax brackets 2024 (single, no children)
    const federalBrackets = [
        { up_to: 17800, rate: 0 },
        { up_to: 31600, rate: 0.0077 },
        { up_to: 41400, rate: 0.0088 },
        { up_to: 55200, rate: 0.0264 },
        { up_to: 72500, rate: 0.0297 },
        { up_to: 78100, rate: 0.0594 },
        { up_to: 103600, rate: 0.066 },
        { up_to: 134600, rate: 0.088 },
        { up_to: 176000, rate: 0.11 },
        { up_to: 755200, rate: 0.132 },
        { up_to: Infinity, rate: 0.132 },
    ];

    let federalTax = 0;
    let previousLimit = 0;
    for (const bracket of federalBrackets) {
        const taxableInBand = Math.min(gross, bracket.up_to) - previousLimit;
        if (taxableInBand > 0) {
            federalTax += taxableInBand * bracket.rate;
        }
        if (gross <= bracket.up_to) break;
        previousLimit = bracket.up_to;
    }

    // Cantonal + municipal tax multiplier (approximate effective rates)
    // These are simplified approximations of combined cantonal+municipal burden
    const cantonalMultipliers = {
        ZH: 0.12, // Zurich: ~12% effective cantonal+municipal
        GE: 0.15, // Geneva: ~15% (higher)
        BS: 0.14, // Basel-Stadt: ~14%
        VD: 0.14, // Vaud: ~14%
        ZG: 0.06, // Zug: ~6% (low-tax canton)
    };

    const cantonalRate = cantonalMultipliers[canton] || 0.12;
    const cantonalTax = gross * cantonalRate;

    // Social security contributions (employee share)
    // AHV/IV/EO: 5.3%
    // ALV (unemployment): 1.1% up to CHF 148,200
    // Occupational pension (BVG): ~7% average (varies by plan)
    // NBU (accident insurance non-work): ~1.5%
    const ahv = gross * 0.053;
    const alv = Math.min(gross, 148200) * 0.011;
    const bvg = gross * 0.07; // Simplified average
    const nbu = gross * 0.015;

    const socialSecurityTotal = ahv + alv + bvg + nbu;
    const totalDeductions = federalTax + cantonalTax + socialSecurityTotal;
    const net = gross - totalDeductions;

    let marginalRate = 0;
    for (const bracket of federalBrackets) {
        if (gross <= bracket.up_to) {
            marginalRate = bracket.rate;
            break;
        }
    }
    marginalRate += cantonalRate;

    const cantonNames = {
        ZH: 'Zurich',
        GE: 'Geneva',
        BS: 'Basel-Stadt',
        VD: 'Vaud',
        ZG: 'Zug',
    };

    return {
        gross,
        income_tax: Math.round(federalTax * 100) / 100,
        social_security_total: Math.round(socialSecurityTotal * 100) / 100,
        social_security_breakdown: [
            { name: 'AHV/IV/EO', amount: Math.round(ahv * 100) / 100 },
            { name: 'ALV (Unemployment)', amount: Math.round(alv * 100) / 100 },
            { name: 'BVG (Pension)', amount: Math.round(bvg * 100) / 100 },
            { name: 'NBU (Accident)', amount: Math.round(nbu * 100) / 100 },
        ],
        regional_tax: Math.round(cantonalTax * 100) / 100,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: marginalRate,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            `Canton: ${cantonNames[canton] || canton}`,
            'Average BVG pension contribution (~7%)',
        ],
    };
}
