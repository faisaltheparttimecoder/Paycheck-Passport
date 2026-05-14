/**
 * Singapore Tax Data
 * Year of Assessment 2024
 * Source: IRAS
 */

export default {
  iso: "SG",
  name: "Singapore",
  currency: "SGD",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2024-01-01",
  source_url: "https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates",
  
  income_tax: {
    type: "progressive",
    brackets: [
      { up_to: 20000, rate: 0 },
      { up_to: 30000, rate: 0.02 },
      { up_to: 40000, rate: 0.035 },
      { up_to: 80000, rate: 0.07 },
      { up_to: 120000, rate: 0.115 },
      { up_to: 160000, rate: 0.15 },
      { up_to: 200000, rate: 0.18 },
      { up_to: 240000, rate: 0.19 },
      { up_to: 280000, rate: 0.195 },
      { up_to: 320000, rate: 0.20 },
      { up_to: 500000, rate: 0.22 },
      { up_to: 1000000, rate: 0.23 },
      { up_to: null, rate: 0.24 }
    ]
  },
  
  social_security: [
    { name: "CPF (Employee)", rate: 0.20, cap: 102000 }  // Annual cap ~$6,800/month
  ],
  
  regional: null,
  allowances: { personal: 0 },
  notes: "Tax resident. CPF contributions are mandatory savings, not tax."
};

/**
 * Singapore tax calculation
 */
export function calculateSG(gross) {
  // Singapore uses a unique bracket system with fixed amounts + percentages
  // Simplified to progressive calculation
  
  const brackets = [
    { up_to: 20000, rate: 0 },
    { up_to: 30000, rate: 0.02 },
    { up_to: 40000, rate: 0.035 },
    { up_to: 80000, rate: 0.07 },
    { up_to: 120000, rate: 0.115 },
    { up_to: 160000, rate: 0.15 },
    { up_to: 200000, rate: 0.18 },
    { up_to: 240000, rate: 0.19 },
    { up_to: 280000, rate: 0.195 },
    { up_to: 320000, rate: 0.20 },
    { up_to: 500000, rate: 0.22 },
    { up_to: 1000000, rate: 0.23 },
    { up_to: Infinity, rate: 0.24 }
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
  
  // CPF (Central Provident Fund) - employee contribution
  // 20% up to monthly ceiling of $6,800 (annual $81,600 ordinary wage ceiling)
  // Additional ceiling for annual wage ceiling of $102,000
  const cpfCeiling = 102000;
  const cpf = Math.min(gross, cpfCeiling) * 0.20;
  
  // Note: CPF is mandatory savings, not a tax - but it reduces take-home
  const totalDeductions = incomeTax + cpf;
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
    social_security_total: Math.round(cpf * 100) / 100,
    social_security_breakdown: [
      { name: "CPF (Employee)", amount: Math.round(cpf * 100) / 100 }
    ],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: marginalRate + (gross <= cpfCeiling ? 0.20 : 0),
    confidence: "high",
    assumptions: [
      "Tax resident",
      "No dependents",
      "CPF included (mandatory savings)",
      "Age below 55"
    ]
  };
}
