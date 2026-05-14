/**
 * Ireland Tax Data
 * Tax Year 2024
 * Source: Revenue.ie
 */

export default {
  iso: "IE",
  name: "Ireland",
  currency: "EUR",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2024-01-01",
  source_url: "https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx"
};

/**
 * Irish tax calculation
 */
export function calculateIE(gross) {
  // Income tax: 20% up to €42,000, 40% above
  const standardRateCutoff = 42000;
  let incomeTax = 0;
  
  if (gross <= standardRateCutoff) {
    incomeTax = gross * 0.20;
  } else {
    incomeTax = standardRateCutoff * 0.20 + (gross - standardRateCutoff) * 0.40;
  }
  
  // Tax credits reduce tax payable
  const personalCredit = 1875;  // Single person credit 2024
  const employeeCredit = 1875;  // PAYE credit 2024
  const totalCredits = personalCredit + employeeCredit;
  
  incomeTax = Math.max(0, incomeTax - totalCredits);
  
  // USC (Universal Social Charge)
  let usc = 0;
  if (gross > 13000) {
    // USC bands 2024
    if (gross <= 12012) {
      usc = gross * 0.005;
    } else if (gross <= 25760) {
      usc = 12012 * 0.005 + (gross - 12012) * 0.02;
    } else if (gross <= 70044) {
      usc = 12012 * 0.005 + (25760 - 12012) * 0.02 + (gross - 25760) * 0.04;
    } else {
      usc = 12012 * 0.005 + (25760 - 12012) * 0.02 + (70044 - 25760) * 0.04 + (gross - 70044) * 0.08;
    }
  }
  
  // PRSI (Pay Related Social Insurance) - Class A
  // 4% on all earnings (simplified)
  const prsi = gross * 0.04;
  
  const socialSecurityTotal = usc + prsi;
  const totalDeductions = incomeTax + socialSecurityTotal;
  const net = gross - totalDeductions;
  
  // Marginal rate
  let marginalRate = gross > standardRateCutoff ? 0.40 : 0.20;
  // Add USC marginal
  if (gross > 70044) marginalRate += 0.08;
  else if (gross > 25760) marginalRate += 0.04;
  else if (gross > 12012) marginalRate += 0.02;
  // Add PRSI
  marginalRate += 0.04;
  
  return {
    gross,
    income_tax: Math.round(incomeTax * 100) / 100,
    social_security_total: Math.round(socialSecurityTotal * 100) / 100,
    social_security_breakdown: [
      { name: "USC", amount: Math.round(usc * 100) / 100 },
      { name: "PRSI", amount: Math.round(prsi * 100) / 100 }
    ],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: marginalRate,
    confidence: "high",
    assumptions: [
      "Single filer",
      "No dependents",
      "PAYE employee",
      "Tax credits applied"
    ]
  };
}
