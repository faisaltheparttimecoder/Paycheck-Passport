# Paycheck Passport

> "Roughly, how much would I take home if I moved to \_\_\_?"

A static, client-side salary-to-take-home comparison tool covering ~30 countries accurately and ~170 more roughly. Hosted on GitHub Pages. No backend, no accounts, no tracking.

---

## Project intent

This is a **comparison and curiosity tool**, not a tax advisor. Every calculation is an estimate for a single filer with no dependents and no special allowances unless the user opts in. The product wins on:

1. **Honest scope.** Top 30 countries done well; the rest labelled "rough estimate."
2. **Clean modern UI.** Single-page, fast, mobile-first, no framework bloat.
3. **Shareable.** URL state so a comparison can be linked.
4. **Trust signals.** Every result shows last-updated date and links to the official tax authority.

If a feature would compromise honesty (e.g. "we cover all 200 countries accurately"), reject it.

---

## Tech stack

Keep it boring. GitHub Pages is a static host; do not introduce anything that requires a build server.

- **HTML + vanilla JS + CSS.** No React, no Vue, no Svelte unless there's a concrete reason. If a framework is added later, it must compile to fully static output (Astro or plain Vite + a static adapter).
- **No bundler required for v1.** ES modules in the browser are fine. Add Vite only if module count makes it painful.
- **Styling:** plain CSS with custom properties for theming. Tailwind is acceptable if added via the standalone CLI (no Node runtime needed at view time). Pick one and stick to it.
- **Charts/maps (optional):** prefer lightweight, dependency-free options. For a world map, an inline SVG with country paths beats any charting library. For bar charts, hand-rolled SVG or `<progress>`-like divs.
- **Data:** static JSON files in `/data/`. No database, no API at runtime except for currency rates (and even that can be a daily-refreshed static file).
- **Currency conversion:** ship a `rates.json` updated daily by a GitHub Action against `frankfurter.app` or `exchangerate.host`. Falling back to a stale rate is fine; failing closed is not — always show _something_ with a timestamp.

---

## Repository layout

```
/
├── index.html              # the single page
├── src/
│   ├── main.js             # entry, URL state, event wiring
│   ├── calc/
│   │   ├── engine.js       # generic progressive-bracket evaluator + social-security/regional add-ons
│   │   ├── countries/      # one file per Tier-1 country (gb.js, de.js, us.js, ...)
│   │   └── rough.js        # flat-rate fallback for Tier-2 countries
│   ├── ui/
│   │   ├── form.js
│   │   ├── results.js
│   │   ├── compare.js
│   │   └── map.js
│   └── lib/
│       ├── currency.js
│       └── url-state.js
├── data/
│   ├── countries.json      # metadata: name, ISO code, currency, tier, official-link, last-updated
│   ├── rates.json          # FX rates, refreshed daily
│   └── col.json            # optional cost-of-living index
├── styles/
│   └── main.css
├── .github/workflows/
│   ├── update-rates.yml    # daily FX refresh
│   └── deploy.yml          # Pages deploy on push to main
└── README.md
```

---

## The data model

Every country, Tier-1 or Tier-2, conforms to the same shape so the UI doesn't branch on tier. Tier-1 entries fill in the detailed fields; Tier-2 entries leave them null and the engine falls back to `rough.js`.

```js
{
  iso: "DE",
  name: "Germany",
  currency: "EUR",
  tier: 1,
  fiscal_year_start: "01-01",
  last_updated: "2026-01-15",
  source_url: "https://www.bundesfinanzministerium.de/...",
  // Tier-1 only:
  income_tax: {
    type: "progressive",
    brackets: [
      { up_to: 11604, rate: 0 },
      { up_to: 17005, rate: 0.14 },   // simplified — actual DE formula is a polynomial
      { up_to: 66760, rate: 0.42 },
      { up_to: 277825, rate: 0.42 },
      { up_to: null, rate: 0.45 }
    ]
  },
  social_security: [
    { name: "Pension", rate: 0.093, cap: 90600 },
    { name: "Health",  rate: 0.073, cap: 62100 },
    { name: "Unemployment", rate: 0.013, cap: 90600 },
    { name: "Long-term care", rate: 0.018, cap: 62100 }
  ],
  regional: null,
  allowances: { personal: 11604 },
  notes: "Single filer (Steuerklasse I). Church tax and solidarity surcharge excluded."
}
```

The engine takes `{ gross, country, currency }` and returns:

```js
{
  gross,
  income_tax,
  social_security_total,
  social_security_breakdown: [...],
  regional_tax,
  net,
  effective_rate,
  marginal_rate,
  confidence: "high" | "rough",
  assumptions: ["Single filer", "No dependents", ...]
}
```

---

## Tier-1 countries (target list)

Pick the 30 your users are most likely to compare. Suggested starting set:

UK, Ireland, Germany, France, Netherlands, Belgium, Spain, Italy, Portugal, Sweden, Norway, Denmark, Finland, Switzerland, Austria, Poland, Czechia, US (federal + a "no state tax" option), Canada (federal + Ontario default), Australia, New Zealand, Singapore, Hong Kong, Japan, UAE, Saudi Arabia, India, Brazil, Mexico, South Africa.

Treat US states, Canadian provinces, Swiss cantons, and Spanish autonomous communities as **optional second selectors** on the same country, not as separate countries. Default to a representative region (NY, ON, Zurich, Madrid) and let the user change it.

---

## UI principles

- **One screen, no scrolling required for the core answer.** Salary input → result card → comparison strip below.
- **Mobile-first.** Test at 360px width. If something doesn't fit there, redesign before adding it.
- **No modal dialogs for primary actions.** Use inline disclosure (`<details>`) for assumptions and breakdowns.
- **Numbers are the design.** Big, confident, monospace for the headline take-home figure. Small grey for caveats. Never bury the headline under disclaimers.
- **Confidence badge** on every result: "Detailed" (Tier 1) or "Rough estimate" (Tier 2). Different colour, not hidden.
- **No dark patterns.** No email capture, no "sign up to see full results," no analytics that aren't strictly anonymous.
- **Dark mode** by `prefers-color-scheme`, with a manual toggle. Default to following the system.

### Visual direction

Aim for "Linear meets a passport stamp." Generous whitespace, one or two accents, no gradients-for-the-sake-of-gradients. A subtle world-map background or country-flag pill is fine; a glassmorphism splash screen is not.

---

## URL state

Every comparison must be shareable. Use query params, not hash, so they're indexable and crawlable:

```
/?salary=50000&from=GB&to=DE,FR,SG&region_us=CA
```

On load, hydrate the form from the URL. On every input change, debounce 300ms and update `history.replaceState` so the back button isn't polluted.

---

## What this project will NOT do

Be explicit so feature creep doesn't sneak in:

- ❌ Tax advice. The footer says so. The disclaimer says so. Every result card says so.
- ❌ Married/joint filing, dependents, pension contributions in v1. Add later if and only if the data quality holds up.
- ❌ Historical tax years. Current fiscal year only.
- ❌ Business or self-employed taxation.
- ❌ Capital gains, dividend tax, wealth tax.
- ❌ Login, accounts, saved comparisons in a server. (LocalStorage favourites are fine.)
- ❌ Advertising or tracking. Plausible-style privacy-friendly analytics only if any.

---

## Definition of done for v1

- [ ] 30 Tier-1 countries with brackets + social security + one regional layer where applicable, sourced and dated.
- [ ] ~150 Tier-2 countries with a single flat estimate and clear "rough" badge.
- [ ] Salary input in any major currency with live conversion.
- [ ] Side-by-side comparison of up to 4 countries.
- [ ] Shareable URL.
- [ ] Mobile-clean at 360px.
- [ ] Lighthouse 95+ across the board.
- [ ] Every country card links to its official tax authority.
- [ ] Last-updated stamp visible on every result.
- [ ] Daily GitHub Action refreshing `rates.json`.

---

## Stretch goals (after v1 ships and gets feedback)

- Cost-of-living adjustment (Numbeo or static index)
- "Sort by take-home %"
- Visa/residency one-line hint per country with an outbound link
- Light "what if" overlays: pension contribution slider, dependents toggle (Tier-1 only)
- Embeddable widget (`<iframe>` with predefined comparison)

---

## Working with this codebase

**For Claude / any AI assistant:**

- Read this file before suggesting architecture changes.
- Never add a runtime dependency without justifying why a static alternative fails.
- When adding a country, copy the schema exactly — no per-country shape drift.
- When changing tax data, update `last_updated` and `source_url` in the same commit.
- If asked to "cover 200 countries accurately," push back. That's not the project.
- Disclaimers are non-negotiable. Don't quietly remove them to clean up the UI.

**Tone for any user-facing copy:** plain, slightly dry, no hype. "Your estimated take-home in Germany is €X" — not "Discover your amazing take-home pay!"

---

## Sources

Curate Tier-1 data from primary sources only:

- Each country's official tax authority (HMRC, Bundesfinanzministerium, IRS, ATO, etc.)
- OECD Tax Database for cross-checking OECD members
- PwC Worldwide Tax Summaries as a structured secondary reference
- KPMG individual income tax tables for sanity-checking marginal rates

Tier-2 data: KPMG top-marginal-rate table is fine as a single-number source. Label it as such.

Never scrape and republish proprietary data. The numbers themselves (tax rates) aren't copyrightable; the surrounding commentary is. Store rates, not prose.
