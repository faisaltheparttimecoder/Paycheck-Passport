/**
 * Results UI Component
 * Renders calculation results as cards
 */

import { formatCurrency, formatPercent } from '../lib/currency.js';

/**
 * Render results to the DOM
 * @param {Array} results - Array of calculation results with country data
 * @param {string} displayCurrency - Currency to display amounts in
 */
export function renderResults(results, displayCurrency) {
    const container = document.getElementById('results');
    const grid = container.querySelector('.results-grid');

    if (!results || results.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    grid.innerHTML = '';

    results.forEach((result, index) => {
        const card = createResultCard(result, displayCurrency, index === 0);
        grid.appendChild(card);
    });
}

/**
 * Create a result card element
 * @param {Object} result - Calculation result with country data
 * @param {string} displayCurrency - Currency for display
 * @param {boolean} isFrom - Whether this is the "from" country
 * @returns {HTMLElement} Card element
 */
function createResultCard(result, displayCurrency, isFrom) {
    const card = document.createElement('article');
    card.className = `result-card${isFrom ? ' from-country' : ''}`;

    const { country, calculation, convertedNet } = result;
    const displayNet = convertedNet || calculation.net;
    const monthlyNet = displayNet / 12;

    card.innerHTML = `
    <header class="result-header">
      <div>
        <span class="country-flag">${country.flag}</span>
        <span class="country-name">${country.name}</span>
      </div>
      <span class="confidence-badge ${calculation.confidence === 'high' ? 'detailed' : 'rough'}">
        ${calculation.confidence === 'high' ? 'Detailed' : 'Rough estimate'}
      </span>
    </header>
    
    <div class="take-home">
      <div class="take-home-label">Estimated annual take-home</div>
      <div class="take-home-amount">${formatCurrency(displayNet, displayCurrency)}</div>
      <div class="take-home-monthly">${formatCurrency(monthlyNet, displayCurrency)}/month</div>
    </div>
    
    <div class="effective-rate">
      Effective rate: ${formatPercent(calculation.effective_rate)}
      ${calculation.marginal_rate ? ` · Marginal: ${formatPercent(calculation.marginal_rate)}` : ''}
    </div>
    
    <details class="breakdown">
      <summary class="breakdown-toggle">View breakdown</summary>
      <div class="breakdown-content">
        <div class="breakdown-row">
          <span class="breakdown-label">Gross salary</span>
          <span class="breakdown-value">${formatCurrency(calculation.gross, country.currency)}</span>
        </div>
        <div class="breakdown-row">
          <span class="breakdown-label">Income tax</span>
          <span class="breakdown-value negative">−${formatCurrency(calculation.income_tax, country.currency)}</span>
        </div>
        ${calculation.social_security_breakdown
            .map(
                (item) => `
          <div class="breakdown-row">
            <span class="breakdown-label">${item.name}</span>
            <span class="breakdown-value negative">−${formatCurrency(item.amount, country.currency)}</span>
          </div>
        `,
            )
            .join('')}
        ${
            calculation.regional_tax > 0
                ? `
          <div class="breakdown-row">
            <span class="breakdown-label">Regional/State tax</span>
            <span class="breakdown-value negative">−${formatCurrency(calculation.regional_tax, country.currency)}</span>
          </div>
        `
                : ''
        }
        <div class="breakdown-row total">
          <span class="breakdown-label">Net take-home</span>
          <span class="breakdown-value">${formatCurrency(calculation.net, country.currency)}</span>
        </div>
      </div>
    </details>
    
    <footer class="result-meta">
      <div class="assumptions">
        ${calculation.assumptions.slice(0, 3).join(' · ')}
      </div>
      <div>
        Updated: ${country.last_updated} · 
        <a href="${country.source_url}" target="_blank" rel="noopener">Official source</a>
      </div>
    </footer>
  `;

    return card;
}

/**
 * Clear results display
 */
export function clearResults() {
    const container = document.getElementById('results');
    container.classList.add('hidden');
    container.querySelector('.results-grid').innerHTML = '';
}
