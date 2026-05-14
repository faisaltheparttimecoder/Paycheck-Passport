/**
 * Netherlands Tax Data
 * Tax Year 2024
 * Source: Belastingdienst
 */

export default {
  iso: "NL",
  name: "Netherlands",
  currency: "EUR",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2024-01-01",
  source_url: "https://www.belastingdienst.nl/wps/wcm/connect/nl/belastingaangifte/content/belastingtarieven-box-1"
};

/**
 * Dutch tax calculation
 */
export function calculateNL(gross) {
  // Box 1 tax rates 2024 (income from employment)
  // Two brackets since 2020
  const bracket1Limit = 75518;
  const rate1 = 0.3697;  // 36.97%
  const rate2 = 0.495;   // 49.5%
  
  let incomeTax = 0;
  if (gross <= bracket1Limit) {
    incomeTax = gross * rate1;
  } else {
    incomeTax = bracket1Limit * rate1 + (gross - bracket1Limit) * rate2;
  }
  
  // General tax credit (arbeidskorting + algemene heffingskorting)
  // These phase out at higher incomes - simplified here
  let taxCredits = 0;
  if (gross <= 24812) {
    taxCredits = 3362 + 5532;  // Full credits
  } else if (gross <= 75518) {
    // Phase out
    const reduction = (gross - 24812) * 0.0651;
    taxCredits = Math.max(0, 3362 + 5532 - reduction);
  } else {
    taxCredits = 0;  // Fully phased out
  }
  
  incomeTax = Math.max(0, incomeTax - taxCredits);
  
  // Social security (included in Box 1 rates for employees)
  // Employer pays most, employee portion is in the tax rate
  // ZVW (health insurance) contribution
  const zvw = Math.min(gross, 71628) * 0.0557;
  
  const totalDeductions = incomeTax + zvw;
  const net = gross - totalDeductions;
  
  // Marginal rate
  const marginalRate = gross > bracket1Limit ? rate2 : rate1;
  
  return {
    gross,
    income_tax: Math.round(incomeTax * 100) / 100,
    social_security_total: Math.round(zvw * 100) / 100,
    social_security_breakdown: [
      { name: "ZVW (Health)", amount: Math.round(zvw * 100) / 100 }
    ],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: marginalRate,
    confidence: "high",
    assumptions: [
      "Single filer",
      "No dependents",
      "Tax credits applied (phase out at higher income)",
      "No 30% ruling"
    ]
  };
}
