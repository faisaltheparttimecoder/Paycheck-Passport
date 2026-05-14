<div align="center">

# 🌍 Paycheck Passport

### _Compare · Calculate · Explore_

[![Live Demo](https://img.shields.io/badge/�_Live_Demo-Visit_Site-4f46e5?style=for-the-badge)](https://faisaltheparttimecoder.github.io/Paycheck-Passport/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made_with-❤️-red?style=for-the-badge)](https://github.com/faisaltheparttimecoder)

---

\_"Roughly, how much would I take home if I moved to _\_\_?"_

A static, client-side salary-to-take-home comparison tool covering ~30 countries accurately and ~40 more roughly. No backend, no accounts, no tracking.

</div>

---

## Features

- **30 Tier-1 countries** with detailed tax brackets, social security, and regional variations
- **40+ Tier-2 countries** with rough estimates based on top marginal rates
- **Live currency conversion** with daily-updated exchange rates
- **Shareable URLs** — every comparison can be linked
- **Mobile-first design** — works great on any device
- **Dark mode** — follows system preference with manual toggle
- **Privacy-focused** — no tracking, no cookies, no data collection

## Quick Start

This is a static site with no build step required. Just serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve

# Using PHP
php -S localhost:8000
```

Then open http://localhost:8000

## Project Structure

```
/
├── index.html              # Single page app
├── src/
│   ├── main.js             # Entry point, event wiring
│   ├── calc/
│   │   ├── engine.js       # Generic bracket evaluator
│   │   ├── countries/      # Tier-1 country modules
│   │   └── rough.js        # Tier-2 fallback
│   ├── ui/
│   │   ├── form.js         # Input handling
│   │   ├── results.js      # Result cards
│   │   └── compare.js      # Comparison bar chart
│   └── lib/
│       ├── currency.js     # FX conversion
│       └── url-state.js    # URL param handling
├── data/
│   ├── countries.json      # Country metadata
│   └── rates.json          # Exchange rates (auto-updated)
├── styles/
│   └── main.css            # Mobile-first styles
└── .github/workflows/
    ├── update-rates.yml    # Daily FX refresh
    └── deploy.yml          # GitHub Pages deploy
```

## Tier-1 Countries (Detailed)

UK, Ireland, Germany, France, Netherlands, Belgium, Spain, Italy, Portugal, Sweden, Norway, Denmark, Finland, Switzerland, Austria, Poland, Czechia, US (with state selection), Canada (with province selection), Australia, New Zealand, Singapore, Hong Kong, Japan, UAE, Saudi Arabia, India, Brazil, Mexico, South Africa.

## Disclaimer

**This is not tax advice.** All calculations are estimates for a single filer with no dependents. Actual take-home depends on your specific circumstances. Always consult a qualified tax professional.

## Data Sources

- **Tier-1 data**: Official tax authority websites (HMRC, IRS, Bundesfinanzministerium, etc.)
- **Tier-2 data**: KPMG top marginal rate tables
- **Exchange rates**: [Frankfurter API](https://www.frankfurter.app/) (ECB data)

## Contributing

When adding or updating country data:

1. Use primary sources only (official tax authority)
2. Follow the existing schema exactly
3. Update `last_updated` and `source_url` in the same commit
4. Add tests for any new calculation logic

## License

MIT
