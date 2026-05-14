/**
 * UAE Tax Data
 * Tax Year 2024
 * Source: Ministry of Finance UAE
 */

export default {
  iso: "AE",
  name: "UAE",
  currency: "AED",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2024-01-01",
  source_url: "https://www.mof.gov.ae/en/resourcesAndBudget/Pages/tax.aspx",
  
  income_tax: {
    type: "flat",
    rate: 0
  },
  
  social_security: [],
  
  regional: null,
  allowances: { personal: 0 },
  notes: "No personal income tax. Social security for UAE/GCC nationals only."
};

/**
 * UAE tax calculation
 * UAE has no personal income tax
 */
export function calculateAE(gross) {
  // No income tax in UAE
  const incomeTax = 0;
  
  // No mandatory social security for expats
  // UAE nationals pay 5% to pension, but this is rare for expat workers
  const socialSecurity = 0;
  
  const net = gross;
  
  return {
    gross,
    income_tax: 0,
    social_security_total: 0,
    social_security_breakdown: [],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: 0,
    marginal_rate: 0,
    confidence: "high",
    assumptions: [
      "No personal income tax",
      "Expat worker (no SS contributions)",
      "No corporate tax on employment income"
    ]
  };
}
