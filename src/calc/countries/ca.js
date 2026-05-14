/**
 * Canada Tax Data
 * Tax Year 2024
 * Source: Canada Revenue Agency
 */

export default {
  iso: "CA",
  name: "Canada",
  currency: "CAD",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2024-01-01",
  source_url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
  
  income_tax: {
    type: "progressive",
    brackets: [
      { up_to: 55867, rate: 0.15 },
      { up_to: 111733, rate: 0.205 },
      { up_to: 173205, rate: 0.26 },
      { up_to: 246752, rate: 0.29 },
      { up_to: null, rate: 0.33 }
    ]
  },
  
  social_security: [
    { name: "CPP", rate: 0.0595, cap: 68500, floor: 3500 },
    { name: "EI", rate: 0.0166, cap: 63200 }
  ],
  
  regional: {
    "ON": {
      name: "Ontario",
      type: "progressive",
      brackets: [
        { up_to: 51446, rate: 0.0505 },
        { up_to: 102894, rate: 0.0915 },
        { up_to: 150000, rate: 0.1116 },
        { up_to: 220000, rate: 0.1216 },
        { up_to: null, rate: 0.1316 }
      ]
    },
    "BC": {
      name: "British Columbia",
      type: "progressive",
      brackets: [
        { up_to: 47937, rate: 0.0506 },
        { up_to: 95875, rate: 0.077 },
        { up_to: 110076, rate: 0.105 },
        { up_to: 133664, rate: 0.1229 },
        { up_to: 181232, rate: 0.147 },
        { up_to: 252752, rate: 0.168 },
        { up_to: null, rate: 0.205 }
      ]
    },
    "AB": {
      name: "Alberta",
      type: "progressive",
      brackets: [
        { up_to: 148269, rate: 0.10 },
        { up_to: 177922, rate: 0.12 },
        { up_to: 237230, rate: 0.13 },
        { up_to: 355845, rate: 0.14 },
        { up_to: null, rate: 0.15 }
      ]
    },
    "QC": {
      name: "Quebec",
      type: "progressive",
      brackets: [
        { up_to: 51780, rate: 0.14 },
        { up_to: 103545, rate: 0.19 },
        { up_to: 126000, rate: 0.24 },
        { up_to: null, rate: 0.2575 }
      ]
    }
  },
  
  allowances: { personal: 15705 },
  notes: "Federal + provincial tax. Basic personal amount varies by province."
};

/**
 * Canadian tax calculation
 */
export function calculateCA(gross, province = "ON") {
  const basicPersonalAmount = 15705; // Federal BPA 2024
  const taxableIncome = Math.max(0, gross - basicPersonalAmount);
  
  // Federal tax brackets 2024
  const federalBrackets = [
    { up_to: 55867, rate: 0.15 },
    { up_to: 111733, rate: 0.205 },
    { up_to: 173205, rate: 0.26 },
    { up_to: 246752, rate: 0.29 },
    { up_to: Infinity, rate: 0.33 }
  ];
  
  // Calculate federal tax
  let federalTax = 0;
  let previousLimit = 0;
  
  for (const bracket of federalBrackets) {
    const taxableInBand = Math.min(taxableIncome, bracket.up_to) - previousLimit;
    if (taxableInBand > 0) {
      federalTax += taxableInBand * bracket.rate;
    }
    if (taxableIncome <= bracket.up_to) break;
    previousLimit = bracket.up_to;
  }
  
  // Provincial tax
  const provincialBrackets = {
    "ON": [
      { up_to: 51446, rate: 0.0505 },
      { up_to: 102894, rate: 0.0915 },
      { up_to: 150000, rate: 0.1116 },
      { up_to: 220000, rate: 0.1216 },
      { up_to: Infinity, rate: 0.1316 }
    ],
    "BC": [
      { up_to: 47937, rate: 0.0506 },
      { up_to: 95875, rate: 0.077 },
      { up_to: 110076, rate: 0.105 },
      { up_to: 133664, rate: 0.1229 },
      { up_to: 181232, rate: 0.147 },
      { up_to: 252752, rate: 0.168 },
      { up_to: Infinity, rate: 0.205 }
    ],
    "AB": [
      { up_to: 148269, rate: 0.10 },
      { up_to: 177922, rate: 0.12 },
      { up_to: 237230, rate: 0.13 },
      { up_to: 355845, rate: 0.14 },
      { up_to: Infinity, rate: 0.15 }
    ],
    "QC": [
      { up_to: 51780, rate: 0.14 },
      { up_to: 103545, rate: 0.19 },
      { up_to: 126000, rate: 0.24 },
      { up_to: Infinity, rate: 0.2575 }
    ]
  };
  
  const provBrackets = provincialBrackets[province] || provincialBrackets["ON"];
  let provincialTax = 0;
  previousLimit = 0;
  
  for (const bracket of provBrackets) {
    const taxableInBand = Math.min(taxableIncome, bracket.up_to) - previousLimit;
    if (taxableInBand > 0) {
      provincialTax += taxableInBand * bracket.rate;
    }
    if (taxableIncome <= bracket.up_to) break;
    previousLimit = bracket.up_to;
  }
  
  // CPP (Canada Pension Plan) - 5.95% on earnings between $3,500 and $68,500
  let cpp = 0;
  if (gross > 3500) {
    const cppEarnings = Math.min(gross, 68500) - 3500;
    cpp = cppEarnings * 0.0595;
  }
  
  // EI (Employment Insurance) - 1.66% up to $63,200
  const ei = Math.min(gross, 63200) * 0.0166;
  
  // Quebec has different rates (QPP instead of CPP, different EI)
  // Simplified here
  
  const totalIncomeTax = federalTax + provincialTax;
  const socialSecurityTotal = cpp + ei;
  const totalDeductions = totalIncomeTax + socialSecurityTotal;
  const net = gross - totalDeductions;
  
  // Marginal rates
  let federalMarginal = 0;
  for (const bracket of federalBrackets) {
    if (taxableIncome <= bracket.up_to) {
      federalMarginal = bracket.rate;
      break;
    }
  }
  
  let provincialMarginal = 0;
  for (const bracket of provBrackets) {
    if (taxableIncome <= bracket.up_to) {
      provincialMarginal = bracket.rate;
      break;
    }
  }
  
  const provinceNames = { ON: "Ontario", BC: "British Columbia", AB: "Alberta", QC: "Quebec" };
  
  return {
    gross,
    income_tax: Math.round(totalIncomeTax * 100) / 100,
    social_security_total: Math.round(socialSecurityTotal * 100) / 100,
    social_security_breakdown: [
      { name: "CPP", amount: Math.round(cpp * 100) / 100 },
      { name: "EI", amount: Math.round(ei * 100) / 100 }
    ],
    regional_tax: Math.round(provincialTax * 100) / 100,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round((totalDeductions / gross) * 10000) / 10000,
    marginal_rate: federalMarginal + provincialMarginal,
    confidence: "high",
    assumptions: [
      "Single filer",
      "No dependents",
      `Province: ${provinceNames[province] || province}`,
      "Federal basic personal amount applied"
    ]
  };
}
