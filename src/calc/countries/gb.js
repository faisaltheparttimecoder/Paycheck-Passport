/**
 * United Kingdom Tax Data
 * Tax Year 2024/25 (6 April 2024 - 5 April 2025)
 * Source: HMRC
 */

export default {
  iso: "GB",
  name: "United Kingdom",
  currency: "GBP",
  tier: 1,
  fiscal_year_start: "04-06",
  last_updated: "2024-04-06",
  source_url: "https://www.gov.uk/income-tax-rates",
  
  income_tax: {
    type: "progressive",
    brackets: [
      { up_to: 12570, rate: 0 },        // Personal Allowance
      { up_to: 50270, rate: 0.20 },     // Basic rate
      { up_to: 125140, rate: 0.40 },    // Higher rate
      { up_to: null, rate: 0.45 }       // Additional rate
    ]
  },
  
  social_security: [
    { 
      name: "National Insurance (Class 1)", 
      rate: 0.08,  // 8% from 6 Jan 2024 (was 12%)
      floor: 12570,  // Primary threshold
      cap: 50270     // Upper earnings limit
    }
  ],
  
  regional: null,
  
  allowances: {
    personal: 12570,
    // Note: Personal allowance reduces by £1 for every £2 over £100,000
    // This is handled in the engine for GB specifically
  },
  
  notes: "England/Wales/NI rates. Scotland has different bands. Personal allowance tapers above £100k."
};

/**
 * Custom calculation for UK-specific rules
 * Handles personal allowance taper
 */
export function calculateUK(gross) {
  // Personal allowance taper: reduces by £1 for every £2 over £100,000
  let personalAllowance = 12570;
  if (gross > 100000) {
    const reduction = Math.floor((gross - 100000) / 2);
    personalAllowance = Math.max(0, personalAllowance - reduction);
  }
  
  const taxableIncome = Math.max(0, gross - personalAllowance);
  
  // Income tax calculation
  let incomeTax = 0;
  const brackets = [
    { up_to: 37700, rate: 0.20 },   // Basic rate (on taxable income)
    { up_to: 87440, rate: 0.40 },   // Higher rate (125140 - 37700)
    { up_to: null, rate: 0.45 }     // Additional rate
  ];
  
  let remaining = taxableIncome;
  let previousLimit = 0;
  
  for (const bracket of brackets) {
    const limit = bracket.up_to ?? Infinity;
    const bandWidth = limit - previousLimit;
    const taxableInBand = Math.min(remaining, bandWidth);
    
    if (taxableInBand > 0) {
      incomeTax += taxableInBand * bracket.rate;
      remaining -= taxableInBand;
    }
    
    if (remaining <= 0) break;
    previousLimit = limit;
  }
  
  // National Insurance
  // 8% on earnings between £12,570 and £50,270
  // 2% on earnings above £50,270
  let nationalInsurance = 0;
  if (gross > 12570) {
    const niEarnings = Math.min(gross, 50270) - 12570;
    nationalInsurance += niEarnings * 0.08;
    
    if (gross > 50270) {
      nationalInsurance += (gross - 50270) * 0.02;
    }
  }
  
  const totalDeductions = incomeTax + nationalInsurance;
  const net = gross - totalDeductions;
  
  // Calculate marginal rate
  let marginalRate = 0;
  if (taxableIncome <= 37700) marginalRate = 0.20;
  else if (taxableIncome <= 87440) marginalRate = 0.40;
  else marginalRate = 0.45;
  
  // Add NI marginal
  if (gross > 12570 && gross <= 50270) marginalRate += 0.08;
  else if (gross > 50270) marginalRate += 0.02;
  
  // 60% effective marginal rate in the £100k-£125,140 band due to PA taper
  if (gross > 100000 && gross <= 125140) {
    marginalRate = 0.60;
  }
  
  return {
    gross,
    income_tax: Math.round(incomeTax * 100) / 100,
    social_security_total: Math.round(nationalInsurance * 100) / 100,
    social_security_breakdown: [
      { name: "National Insurance", amount: Math.round(nationalInsurance * 100) / 100 }
    ],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: marginalRate,
    confidence: "high",
    assumptions: [
      "Single filer",
      "No dependents", 
      "England/Wales/NI rates",
      `Personal allowance: £${personalAllowance.toLocaleString()}`
    ]
  };
}
