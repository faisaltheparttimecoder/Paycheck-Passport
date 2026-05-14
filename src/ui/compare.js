/**
 * Comparison Strip UI Component
 * Visual bar chart comparing take-home across countries
 */

import { formatCurrency } from '../lib/currency.js';

/**
 * Render comparison bar chart
 * @param {Array} results - Array of calculation results with country data
 * @param {string} displayCurrency - Currency to display amounts in
 */
export function renderComparison(results, displayCurrency) {
    const container = document.getElementById('comparison-strip');

    if (!results || results.length < 2) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    // Find max value for scaling
    const maxNet = Math.max(...results.map((r) => r.convertedNet || r.calculation.net));

    container.innerHTML = `
    <h3 class="sr-only">Take-home comparison</h3>
    ${results
        .map((result, index) => {
            const net = result.convertedNet || result.calculation.net;
            const percentage = (net / maxNet) * 100;
            const isFrom = index === 0;

            return `
        <div class="comparison-bar">
          <span class="comparison-label">${result.country.flag} ${result.country.iso}</span>
          <div class="comparison-track">
            <div class="comparison-fill${isFrom ? ' from' : ''}" style="width: ${percentage}%"></div>
          </div>
          <span class="comparison-value">${formatCurrency(net, displayCurrency)}</span>
        </div>
      `;
        })
        .join('')}
  `;
}

/**
 * Hide comparison strip
 */
export function hideComparison() {
    const container = document.getElementById('comparison-strip');
    container.classList.add('hidden');
    container.innerHTML = '';
}
