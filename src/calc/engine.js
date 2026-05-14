/**
 * Tax Calculation Engine
 * Generic progressive-bracket evaluator with social security and regional add-ons
 */

/**
 * Calculate tax using progressive brackets
 * @param {number} income - Taxable income
 * @param {Array} brackets - Array of { up_to, rate } objects
 * @returns {number} Total tax amount
 */
export function calculateProgressiveTax(income, brackets) {
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const limit = bracket.up_to ?? Infinity;
    const taxableInBracket = Math.min(income, limit) - previousLimit;

    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }

    if (income <= limit) break;
    previousLimit = limit;
  }

  return tax;
}

/**
 * Calculate social security contributions
 * @param {number} gross - Gross income
 * @param {Array} contributions - Array of { name, rate, cap } objects
 * @returns {{ total: number, breakdown: Array }}
 */
export function calculateSocialSecurity(gross, contributions) {
  if (!contributions || contributions.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const breakdown = contributions.map(contrib => {
    const taxableAmount = contrib.cap ? Math.min(gross, contrib.cap) : gross;
    const amount = taxableAmount * contrib.rate;
    return {
      name: contrib.name,
      amount: Math.round(amount * 100) / 100
    };
  });

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return { total, breakdown };
}

/**
 * Main calculation function
 * @param {Object} params
 * @param {number} params.gross - Gross annual salary in local currency
 * @param {Object} params.countryData - Country tax data object
 * @param {string} [params.region] - Optional region code (for US states, etc.)
 * @returns {Object} Calculation result
 */
export function calculate({ gross, countryData, region }) {
  // Handle Tier-2 (rough estimate) countries
  if (countryData.tier === 2) {
    return calculateRough(gross, countryData);
  }

  // Tier-1 detailed calculation
  const allowances = countryData.allowances || {};
  const personalAllowance = allowances.personal || 0;
  const taxableIncome = Math.max(0, gross - personalAllowance);

  // Income tax
  let incomeTax = 0;
  if (countryData.income_tax) {
    if (countryData.income_tax.type === 'progressive') {
      incomeTax = calculateProgressiveTax(taxableIncome, countryData.income_tax.brackets);
    } else if (countryData.income_tax.type === 'flat') {
      incomeTax = taxableIncome * countryData.income_tax.rate;
    }
  }

  // Social security
  const socialSecurity = calculateSocialSecurity(gross, countryData.social_security);

  // Regional tax (e.g., US state tax)
  let regionalTax = 0;
  if (countryData.regional && region) {
    const regionData = countryData.regional[region];
    if (regionData) {
      if (regionData.type === 'progressive') {
        regionalTax = calculateProgressiveTax(taxableIncome, regionData.brackets);
      } else if (regionData.type === 'flat') {
        regionalTax = taxableIncome * regionData.rate;
      }
    }
  }

  // Calculate totals
  const totalDeductions = incomeTax + socialSecurity.total + regionalTax;
  const net = gross - totalDeductions;
  const effectiveRate = gross > 0 ? totalDeductions / gross : 0;

  // Calculate marginal rate (rate on next dollar)
  const marginalRate = calculateMarginalRate(taxableIncome, countryData, region);

  return {
    gross,
    income_tax: Math.round(incomeTax * 100) / 100,
    social_security_total: Math.round(socialSecurity.total * 100) / 100,
    social_security_breakdown: socialSecurity.breakdown,
    regional_tax: Math.round(regionalTax * 100) / 100,
    net: Math.round(net * 100) / 100,
    effective_rate: Math.round(effectiveRate * 10000) / 10000,
    marginal_rate: marginalRate,
    confidence: 'high',
    assumptions: buildAssumptions(countryData, region)
  };
}

/**
 * Rough estimate calculation for Tier-2 countries
 */
function calculateRough(gross, countryData) {
  const estimatedRate = countryData.estimated_rate || 0.30;
  const totalDeductions = gross * estimatedRate;
  const net = gross - totalDeductions;

  return {
    gross,
    income_tax: Math.round(totalDeductions * 100) / 100,
    social_security_total: 0,
    social_security_breakdown: [],
    regional_tax: 0,
    net: Math.round(net * 100) / 100,
    effective_rate: estimatedRate,
    marginal_rate: estimatedRate,
    confidence: 'rough',
    assumptions: ['Single filer', 'No dependents', 'Estimate based on top marginal rate']
  };
}

/**
 * Calculate marginal tax rate
 */
function calculateMarginalRate(taxableIncome, countryData, region) {
  let marginal = 0;

  // Income tax marginal
  if (countryData.income_tax?.brackets) {
    for (const bracket of countryData.income_tax.brackets) {
      const limit = bracket.up_to ?? Infinity;
      if (taxableIncome <= limit) {
        marginal = bracket.rate;
        break;
      }
    }
  }

  // Add regional marginal if applicable
  if (countryData.regional && region) {
    const regionData = countryData.regional[region];
    if (regionData?.brackets) {
      for (const bracket of regionData.brackets) {
        const limit = bracket.up_to ?? Infinity;
        if (taxableIncome <= limit) {
          marginal += bracket.rate;
          break;
        }
      }
    } else if (regionData?.rate) {
      marginal += regionData.rate;
    }
  }

  return Math.round(marginal * 10000) / 10000;
}

/**
 * Build assumptions list for display
 */
function buildAssumptions(countryData, region) {
  const assumptions = ['Single filer', 'No dependents'];

  if (countryData.notes) {
    assumptions.push(countryData.notes);
  }

  if (region && countryData.regional?.[region]?.name) {
    assumptions.push(`Region: ${countryData.regional[region].name}`);
  }

  return assumptions;
}
