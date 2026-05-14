/**
 * Paycheck Passport - Main Entry Point
 * Wires up form, calculations, and results display
 */

import { loadRates, convert, getRatesDate } from './lib/currency.js';
import { initForm, getFormState } from './ui/form.js';
import { renderResults, clearResults } from './ui/results.js';
import { renderComparison, hideComparison } from './ui/compare.js';
import { calculators } from './calc/countries/index.js';
import { calculateRough } from './calc/rough.js';

let countriesData = null;

/**
 * Initialize the application
 */
async function init() {
    try {
        // Load data in parallel
        const [countries, _rates] = await Promise.all([loadCountries(), loadRates()]);

        countriesData = countries;

        // Update rates timestamp in footer
        const ratesDate = getRatesDate();
        if (ratesDate && ratesDate !== 'fallback') {
            document.getElementById('rates-updated').textContent = `FX rates: ${ratesDate}`;
        }

        // Initialize form with country data
        initForm(countries, handleFormChange);

        // Setup theme toggle
        setupThemeToggle();
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('Failed to load application data. Please refresh the page.');
    }
}

/**
 * Load countries data from JSON
 */
async function loadCountries() {
    const response = await fetch('./data/countries.json');
    const data = await response.json();
    return data.countries;
}

/**
 * Handle form changes - recalculate and display results
 */
function handleFormChange(state) {
    if (!state.salary || state.salary <= 0) {
        clearResults();
        hideComparison();
        return;
    }

    // Get all countries to calculate (from + to)
    const countriesToCalculate = [state.from, ...state.to].filter(Boolean);

    if (countriesToCalculate.length === 0) {
        clearResults();
        hideComparison();
        return;
    }

    // Calculate for each country
    const results = countriesToCalculate
        .map((iso) => {
            const country = countriesData.find((c) => c.iso === iso);
            if (!country) return null;

            // Convert salary to country's currency
            const salaryInLocalCurrency = convert(state.salary, state.currency, country.currency);

            // Get region if applicable
            let region = null;
            if (iso === 'US') region = state.region_us || 'NY';
            if (iso === 'CA') region = state.region_ca || 'ON';
            if (iso === 'CH') region = state.region_ch || 'ZH';

            // Calculate
            let calculation;
            if (country.tier === 1 && calculators[iso]) {
                // Use custom calculator for Tier-1 countries
                calculation = calculators[iso](salaryInLocalCurrency, region);
            } else if (country.tier === 2) {
                // Use rough estimate for Tier-2 countries
                calculation = calculateRough(salaryInLocalCurrency, country.estimated_rate || 0.3);
            } else {
                // Fallback rough estimate
                calculation = calculateRough(salaryInLocalCurrency, 0.3);
            }

            // Convert net back to display currency
            const convertedNet = convert(calculation.net, country.currency, state.currency);

            return {
                country,
                calculation,
                convertedNet,
            };
        })
        .filter(Boolean);

    // Render results
    renderResults(results, state.currency);
    renderComparison(results, state.currency);
}

/**
 * Setup dark mode toggle
 */
function setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    const icon = toggle.querySelector('.theme-icon');

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        updateThemeIcon(icon, savedTheme);
    } else if (systemDark) {
        updateThemeIcon(icon, 'dark');
    }

    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(icon, newTheme);
    });
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(icon, theme) {
    icon.textContent = theme === 'dark' ? '☀' : '◐';
}

/**
 * Show error message to user
 */
function showError(message) {
    const main = document.querySelector('.main');
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.cssText =
        'background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin: 1rem 0;';
    error.textContent = message;
    main.prepend(error);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
