/**
 * United States Tax Data
 * Tax Year 2024
 * Source: IRS
 */

export default {
  iso: "US",
  name: "United States",
  currency: "USD",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2024-01-01",
  source_url: "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
  
  income_tax: {
    type: "progressive",
    brackets: [
      { up_to: 11600, rate: 0.10 },
      { up_to: 47150, rate: 0.12 },
      { up_to: 100525, rate: 0.22 },
      { up_to: 191950, rate: 0.24 },
      { up_to: 243725, rate: 0.32 },
      { up_to: 609350, rate: 0.35 },
      { up_to: null, rate: 0.37 }
    ]
  },
  
  social_security: [
    { name: "Social Security (OASDI)", rate: 0.062, cap: 168600 },
    { name: "Medicare", rate: 0.0145, cap: null },
    // Additional Medicare tax of 0.9% on wages over $200k handled separately
  ],
  
  allowances: {
    standard_deduction: 14600  // Single filer 2024
  },
  
  regional: {
    // No state income tax
    "NONE": { name: "No State Tax", type: "flat", rate: 0 },
    
    // California
    "CA": {
      name: "California",
      type: "progressive",
      brackets: [
        { up_to: 10412, rate: 0.01 },
        { up_to: 24684, rate: 0.02 },
        { up_to: 38959, rate: 0.04 },
        { up_to: 54081, rate: 0.06 },
        { up_to: 68350, rate: 0.08 },
        { up_to: 349137, rate: 0.093 },
        { up_to: 418961, rate: 0.103 },
        { up_to: 698271, rate: 0.113 },
        { up_to: null, rate: 0.123 }
      ]
    },
    
    // New York
    "NY": {
      name: "New York",
      type: "progressive",
      brackets: [
        { up_to: 8500, rate: 0.04 },
        { up_to: 11700, rate: 0.045 },
        { up_to: 13900, rate: 0.0525 },
        { up_to: 80650, rate: 0.0585 },
        { up_to: 215400, rate: 0.0625 },
        { up_to: 1077550, rate: 0.0685 },
        { up_to: 5000000, rate: 0.0965 },
        { up_to: 25000000, rate: 0.103 },
        { up_to: null, rate: 0.109 }
      ]
    },
    
    // Texas - no state income tax
    "TX": { name: "Texas", type: "flat", rate: 0 },
    
    // Florida - no state income tax
    "FL": { name: "Florida", type: "flat", rate: 0 },
    
    // Washington - no state income tax
    "WA": { name: "Washington", type: "flat", rate: 0 },
    
    // Nevada - no state income tax
    "NV": { name: "Nevada", type: "flat", rate: 0 },
    
    // Illinois - flat tax
    "IL": { name: "Illinois", type: "flat", rate: 0.0495 },
    
    // Pennsylvania - flat tax
    "PA": { name: "Pennsylvania", type: "flat", rate: 0.0307 },
    
    // Massachusetts - flat tax
    "MA": { name: "Massachusetts", type: "flat", rate: 0.05 },
    
    // New Jersey
    "NJ": {
      name: "New Jersey",
      type: "progressive",
      brackets: [
        { up_to: 20000, rate: 0.014 },
        { up_to: 35000, rate: 0.0175 },
        { up_to: 40000, rate: 0.035 },
        { up_to: 75000, rate: 0.05525 },
        { up_to: 500000, rate: 0.0637 },
        { up_to: 1000000, rate: 0.0897 },
        { up_to: null, rate: 0.1075 }
      ]
    },
    
    // Colorado - flat tax
    "CO": { name: "Colorado", type: "flat", rate: 0.044 },
    
    // Georgia
    "GA": {
      name: "Georgia",
      type: "progressive",
      brackets: [
        { up_to: 750, rate: 0.01 },
        { up_to: 2250, rate: 0.02 },
        { up_to: 3750, rate: 0.03 },
        { up_to: 5250, rate: 0.04 },
        { up_to: 7000, rate: 0.05 },
        { up_to: null, rate: 0.055 }
      ]
    },
    
    // North Carolina - flat tax
    "NC": { name: "North Carolina", type: "flat", rate: 0.0525 },
    
    // Virginia
    "VA": {
      name: "Virginia",
      type: "progressive",
      brackets: [
        { up_to: 3000, rate: 0.02 },
        { up_to: 5000, rate: 0.03 },
        { up_to: 17000, rate: 0.05 },
        { up_to: null, rate: 0.0575 }
      ]
    },
    
    // Arizona - flat tax
    "AZ": { name: "Arizona", type: "flat", rate: 0.025 },
    
    // Ohio
    "OH": {
      name: "Ohio",
      type: "progressive",
      brackets: [
        { up_to: 26050, rate: 0 },
        { up_to: 100000, rate: 0.02765 },
        { up_to: null, rate: 0.035 }
      ]
    },
    
    // Michigan - flat tax
    "MI": { name: "Michigan", type: "flat", rate: 0.0425 },
    
    // Tennessee - no state income tax on wages
    "TN": { name: "Tennessee", type: "flat", rate: 0 },
    
    // Maryland
    "MD": {
      name: "Maryland",
      type: "progressive",
      brackets: [
        { up_to: 1000, rate: 0.02 },
        { up_to: 2000, rate: 0.03 },
        { up_to: 3000, rate: 0.04 },
        { up_to: 100000, rate: 0.0475 },
        { up_to: 125000, rate: 0.05 },
        { up_to: 150000, rate: 0.0525 },
        { up_to: 250000, rate: 0.055 },
        { up_to: null, rate: 0.0575 }
      ]
    }
  },
  
  notes: "Federal tax only. State tax varies. Single filer with standard deduction."
};

/**
 * Custom calculation for US-specific rules
 */
export function calculateUS(gross, stateCode = "NONE") {
  const standardDeduction = 14600;
  const taxableIncome = Math.max(0, gross - standardDeduction);
  
  // Federal income tax
  const federalBrackets = [
    { up_to: 11600, rate: 0.10 },
    { up_to: 47150, rate: 0.12 },
    { up_to: 100525, rate: 0.22 },
    { up_to: 191950, rate: 0.24 },
    { up_to: 243725, rate: 0.32 },
    { up_to: 609350, rate: 0.35 },
    { up_to: Infinity, rate: 0.37 }
  ];
  
  let federalTax = 0;
  let previousLimit = 0;
  
  for (const bracket of federalBrackets) {
    const limit = bracket.up_to;
    const taxableInBand = Math.min(taxableIncome, limit) - previousLimit;
    
    if (taxableInBand > 0) {
      federalTax += taxableInBand * bracket.rate;
    }
    
    if (taxableIncome <= limit) break;
    previousLimit = limit;
  }
  
  // Social Security (6.2% up to $168,600)
  const socialSecurity = Math.min(gross, 168600) * 0.062;
  
  // Medicare (1.45% on all wages, plus 0.9% on wages over $200k)
  let medicare = gross * 0.0145;
  if (gross > 200000) {
    medicare += (gross - 200000) * 0.009;
  }
  
  // State tax
  let stateTax = 0;
  const stateData = {
    "NONE": { type: "flat", rate: 0 },
    "CA": { type: "progressive", brackets: [
      { up_to: 10412, rate: 0.01 }, { up_to: 24684, rate: 0.02 },
      { up_to: 38959, rate: 0.04 }, { up_to: 54081, rate: 0.06 },
      { up_to: 68350, rate: 0.08 }, { up_to: 349137, rate: 0.093 },
      { up_to: 418961, rate: 0.103 }, { up_to: 698271, rate: 0.113 },
      { up_to: Infinity, rate: 0.123 }
    ]},
    "NY": { type: "progressive", brackets: [
      { up_to: 8500, rate: 0.04 }, { up_to: 11700, rate: 0.045 },
      { up_to: 13900, rate: 0.0525 }, { up_to: 80650, rate: 0.0585 },
      { up_to: 215400, rate: 0.0625 }, { up_to: 1077550, rate: 0.0685 },
      { up_to: 5000000, rate: 0.0965 }, { up_to: 25000000, rate: 0.103 },
      { up_to: Infinity, rate: 0.109 }
    ]},
    "TX": { type: "flat", rate: 0 },
    "FL": { type: "flat", rate: 0 },
    "WA": { type: "flat", rate: 0 },
    "IL": { type: "flat", rate: 0.0495 },
    "PA": { type: "flat", rate: 0.0307 },
    "MA": { type: "flat", rate: 0.05 }
  };
  
  const state = stateData[stateCode] || stateData["NONE"];
  
  if (state.type === "flat") {
    stateTax = taxableIncome * state.rate;
  } else if (state.type === "progressive") {
    let prev = 0;
    for (const bracket of state.brackets) {
      const taxable = Math.min(taxableIncome, bracket.up_to) - prev;
      if (taxable > 0) {
        stateTax += taxable * bracket.rate;
      }
      if (taxableIncome <= bracket.up_to) break;
      prev = bracket.up_to;
    }
  }
  
  const totalFICA = socialSecurity + medicare;
  const totalDeductions = federalTax + totalFICA + stateTax;
  const net = gross - totalDeductions;
  
  // Calculate marginal rate
  let federalMarginal = 0;
  for (const bracket of federalBrackets) {
    if (taxableIncome <= bracket.up_to) {
      federalMarginal = bracket.rate;
      break;
    }
  }
  
  let stateMarginal = 0;
  if (state.type === "flat") {
    stateMarginal = state.rate;
  } else if (state.brackets) {
    for (const bracket of state.brackets) {
      if (taxableIncome <= bracket.up_to) {
        stateMarginal = bracket.rate;
        break;
      }
    }
  }
  
  // FICA marginal
  let ficaMarginal = 0.0765; // 6.2% + 1.45%
  if (gross > 168600) ficaMarginal = 0.0145;
  if (gross > 200000) ficaMarginal = 0.0235;
  
  const stateName = state.name || (stateCode === "NONE" ? "No State Tax" : stateCode);
  
  return {
    gross,
    income_tax: Math.round(federalTax * 100) / 100,
    social_security_total: Math.round(totalFICA * 100) / 100,
    social_security_breakdown: [
      { name: "Social Security", amount: Math.round(socialSecurity * 100) / 100 },
      { name: "Medicare", amount: Math.round(medicare * 100) / 100 }
    ],
    regional_tax: Math.round(stateTax * 100) / 100,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: federalMarginal + stateMarginal + ficaMarginal,
    confidence: "high",
    assumptions: [
      "Single filer",
      "No dependents",
      "Standard deduction ($14,600)",
      `State: ${stateName}`
    ]
  };
}
