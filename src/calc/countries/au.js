/**
 * Australia Tax Data
 * Tax Year 2024-25 (1 July 2024 - 30 June 2025)
 * Source: ATO
 */

export default {
  iso: "AU",
  name: "Australia",
  currency: "AUD",
  tier: 1,
  fiscal_year_start: "07-01",
  last_updated: "2024-07-01",
  source_url: "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
  
  income_tax: {
    type: "progressive",
    brackets: [
      { up_to: 18200, rate: 0 },
      { up_to: 45000, rate: 0.16 },
      { up_to: 135000, rate: 0.30 },
      { up_to: 190000, rate: 0.37 },
      { up_to: null, rate: 0.45 }
    ]
  },
  
  social_security: [
    { name: "Medicare Levy", rate: 0.02, cap: null }
  ],
  
  regional: null,
  allowances: { personal: 18200 },
  notes: "Australian resident. Medicare levy included. Super contributions by employer not included."
};

/**
 * Australian tax calculation
 * 2024-25 tax rates (new rates from 1 July 2024)
 */
export function calculateAU(gross) {
  // 2024-25 tax brackets (new Stage 3 tax cuts)
  const brackets = [
    { up_to: 18200, rate: 0 },
    { up_to: 45000, rate: 0.16 },
    { up_to: 135000, rate: 0.30 },
    { up_to: 190000, rate: 0.37 },
    { up_to: Infinity, rate: 0.45 }
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
  
  // Medicare Levy (2% of taxable income)
  // Reduced for low income earners, but simplified here
  let medicareLevy = 0;
  if (gross > 24276) { // Medicare levy threshold 2024-25
    medicareLevy = gross * 0.02;
  }
  
  const totalDeductions = incomeTax + medicareLevy;
  const net = gross - totalDeductions;
  
  // Marginal rate
  let marginalRate = 0;
  for (const bracket of brackets) {
    if (gross <= bracket.up_to) {
      marginalRate = bracket.rate;
      break;
    }
  }
  
  // Add Medicare levy to marginal
  if (gross > 24276) {
    marginalRate += 0.02;
  }
  
  return {
    gross,
    income_tax: Math.round(incomeTax * 100) / 100,
    social_security_total: Math.round(medicareLevy * 100) / 100,
    social_security_breakdown: [
      { name: "Medicare Levy", amount: Math.round(medicareLevy * 100) / 100 }
    ],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: marginalRate,
    confidence: "high",
    assumptions: [
      "Australian resident",
      "No dependents",
      "No HELP/HECS debt",
      "Super paid by employer (not deducted)"
    ]
  };
}
