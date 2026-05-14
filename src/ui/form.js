/**
 * Form UI Component
 * Handles salary input and country selection
 */

import { parseUrl, updateUrl } from '../lib/url-state.js';

let countriesData = null;
let onChangeCallback = null;

/**
 * Initialize the form with country data
 * @param {Array} countries - Countries data array
 * @param {Function} onChange - Callback when form values change
 */
export function initForm(countries, onChange) {
    countriesData = countries;
    onChangeCallback = onChange;

    populateCountrySelects();
    setupEventListeners();
    hydrateFromUrl();
}

/**
 * Populate all country select dropdowns
 */
function populateCountrySelects() {
    const selects = [
        document.getElementById('from-country'),
        document.getElementById('to-country-1'),
        document.getElementById('to-country-2'),
        document.getElementById('to-country-3'),
        document.getElementById('to-country-4'),
    ];

    // Sort countries: Tier 1 first, then alphabetically
    const sortedCountries = [...countriesData].sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.name.localeCompare(b.name);
    });

    selects.forEach((select, index) => {
        if (!select) return;

        // Clear existing options
        select.innerHTML = '';

        // Add placeholder for "to" selects (except first)
        if (index > 1) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = '+ Add country';
            select.appendChild(placeholder);
        }

        // Add tier separator and countries
        let currentTier = null;

        sortedCountries.forEach((country) => {
            // Add tier separator
            if (country.tier !== currentTier) {
                currentTier = country.tier;
                const optgroup = document.createElement('optgroup');
                optgroup.label = currentTier === 1 ? 'Detailed estimates' : 'Rough estimates';
                select.appendChild(optgroup);
            }

            const option = document.createElement('option');
            option.value = country.iso;
            option.textContent = `${country.flag} ${country.name}`;
            option.dataset.tier = country.tier;
            select.lastElementChild.appendChild(option);
        });
    });

    // Set defaults
    document.getElementById('from-country').value = 'GB';
    document.getElementById('to-country-1').value = 'US';
}

/**
 * Setup event listeners for form inputs
 */
function setupEventListeners() {
    const form = document.getElementById('salary-form');

    // Listen to all form changes
    form.addEventListener('input', handleFormChange);
    form.addEventListener('change', handleFormChange);

    // Special handling for country changes to show/hide region selectors
    const countrySelects = form.querySelectorAll('select[id*="country"]');
    countrySelects.forEach((select) => {
        select.addEventListener('change', updateRegionSelectors);
    });
}

/**
 * Handle form value changes
 */
function handleFormChange() {
    const state = getFormState();
    updateUrl(state);

    if (onChangeCallback) {
        onChangeCallback(state);
    }
}

/**
 * Get current form state
 * @returns {Object} Form state
 */
export function getFormState() {
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const currency = document.getElementById('currency').value;
    const from = document.getElementById('from-country').value;

    const to = [
        document.getElementById('to-country-1').value,
        document.getElementById('to-country-2').value,
        document.getElementById('to-country-3').value,
        document.getElementById('to-country-4').value,
    ].filter(Boolean);

    // Get region selections
    const regionSelectors = document.getElementById('region-selectors');
    const regionUs = regionSelectors.querySelector('[data-country="US"]')?.value || null;
    const regionCa = regionSelectors.querySelector('[data-country="CA"]')?.value || null;
    const regionCh = regionSelectors.querySelector('[data-country="CH"]')?.value || null;

    return {
        salary,
        currency,
        from,
        to,
        region_us: regionUs,
        region_ca: regionCa,
        region_ch: regionCh,
    };
}

/**
 * Hydrate form from URL params
 */
function hydrateFromUrl() {
    const state = parseUrl();

    if (state.salary) {
        document.getElementById('salary').value = state.salary;
    }

    if (state.currency) {
        document.getElementById('currency').value = state.currency;
    }

    if (state.from) {
        document.getElementById('from-country').value = state.from;
    }

    if (state.to && state.to.length > 0) {
        state.to.forEach((iso, index) => {
            const select = document.getElementById(`to-country-${index + 1}`);
            if (select) select.value = iso;
        });
    }

    // Update region selectors based on selected countries
    updateRegionSelectors();

    // Set region values from URL
    setTimeout(() => {
        const regionSelectors = document.getElementById('region-selectors');
        if (state.region_us) {
            const usSelect = regionSelectors.querySelector('[data-country="US"]');
            if (usSelect) usSelect.value = state.region_us;
        }
        if (state.region_ca) {
            const caSelect = regionSelectors.querySelector('[data-country="CA"]');
            if (caSelect) caSelect.value = state.region_ca;
        }
        if (state.region_ch) {
            const chSelect = regionSelectors.querySelector('[data-country="CH"]');
            if (chSelect) chSelect.value = state.region_ch;
        }

        // Trigger initial calculation if we have URL params
        if (state.salary) {
            handleFormChange();
        }
    }, 0);
}

/**
 * Update region selectors based on selected countries
 */
function updateRegionSelectors() {
    const regionContainer = document.getElementById('region-selectors');
    regionContainer.innerHTML = '';

    // Get all selected countries
    const selectedCountries = new Set(
        [
            document.getElementById('from-country').value,
            document.getElementById('to-country-1').value,
            document.getElementById('to-country-2').value,
            document.getElementById('to-country-3').value,
            document.getElementById('to-country-4').value,
        ].filter(Boolean),
    );

    // Check which countries have regions
    let hasRegions = false;

    selectedCountries.forEach((iso) => {
        const country = countriesData.find((c) => c.iso === iso);
        if (country?.has_regions && country.regions) {
            hasRegions = true;

            const group = document.createElement('div');
            group.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = `${country.flag} ${country.name} Region`;

            const select = document.createElement('select');
            select.dataset.country = iso;
            select.addEventListener('change', handleFormChange);

            country.regions.forEach((region) => {
                const option = document.createElement('option');
                option.value = region.code;
                option.textContent = region.name;
                if (region.code === country.default_region) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            group.appendChild(label);
            group.appendChild(select);
            regionContainer.appendChild(group);
        }
    });

    // Show/hide region container
    regionContainer.classList.toggle('hidden', !hasRegions);
}
