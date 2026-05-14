/**
 * Denmark Tax Data
 * Tax Year 2024
 * Source: Skattestyrelsen (SKAT)
 * https://skat.dk/
 */

export default {
    iso: 'DK',
    name: 'Denmark',
    currency: 'DKK',
    tier: 1,
    fiscal_year_start: '01-01',
    last_updated: '2024-01-01',
    source_url: 'https://skat.dk/',
};

/**
 * Danish tax calculation (2024)
 * AM-bidrag + state tax + municipal tax + top tax
 */
export function calculateDK(gross) {
    // Labour market contribution (AM-bidrag): 8% on gross
    const amBidrag = gross * 0.08;
    const incomeAfterAM = gross - amBidrag;

    // Personal allowance (personfradrag): DKK 48,000 (2024)
    const personalAllowance = 48000;

    // Employment deduction (beskæftigelsesfradrag): 10.65% up to DKK 44,800
    const employmentDeduction = Math.min(incomeAfterAM * 0.1065, 44800);

    const taxableIncome = Math.max(0, incomeAfterAM - personalAllowance - employmentDeduction);

    // State bottom tax (bundskat): 12.09%
    const bottomTax = taxableIncome * 0.1209;

    // Top tax (topskat): 15% on personal income above DKK 588,900
    // (calculated on income after AM-bidrag)
    let topTax = 0;
    if (incomeAfterAM > 588900) {
        topTax = (incomeAfterAM - 588900) * 0.15;
    }

    // Municipal tax: average ~24.97%
    const municipalTaxRate = 0.2497;
    const municipalTax = taxableIncome * municipalTaxRate;

    // Church tax (kirkeskat): ~0.7% average — optional but common
    const churchTax = taxableIncome * 0.007;

    // Tax ceiling: combined tax rate cannot exceed ~52.07% (2024)
    const totalIncomeTax = bottomTax + topTax + municipalTax + churchTax;
    const totalDeductions = amBidrag + totalIncomeTax;
    const net = gross - totalDeductions;

    let marginalRate = 0.08 + 0.1209 + municipalTaxRate + 0.007;
    if (incomeAfterAM > 588900) {
        marginalRate += 0.15;
        marginalRate = Math.min(marginalRate, 0.5207 + 0.08); // Tax ceiling
    }

    return {
        gross,
        income_tax: Math.round(totalIncomeTax * 100) / 100,
        social_security_total: Math.round(amBidrag * 100) / 100,
        social_security_breakdown: [
            { name: 'AM-bidrag (Labour Market)', amount: Math.round(amBidrag * 100) / 100 },
        ],
        regional_tax: Math.round(municipalTax * 100) / 100,
        net: Math.round(net * 100) / 100,
        effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
        marginal_rate: Math.round(marginalRate * 10000) / 10000,
        confidence: 'high',
        assumptions: [
            'Single filer',
            'No dependents',
            'Average municipal tax (~24.97%)',
            'Church tax included (~0.7%)',
            'Employment deduction applied',
        ],
    };
}
