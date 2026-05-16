---
description: Core project context for Royale Luxury Coffee — always loaded.
alwaysApply: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start      # run backend (production)
npm run dev    # run backend with auto-reload
```

No build step, no test suite. Open `index.html` directly in a browser or via Live Server for frontend work.

## Architecture

Two-layer static e-commerce site for a premium Colombian coffee brand.

- **Frontend** — Pure HTML/CSS/JS, no framework. `index.html` = landing page; `Comprar.html` = product + checkout page.
- **Backend** — Minimal Express server (`server.js`) that computes shipping and proxies to the Bold payment gateway.

### Comprar.html is a mini-SPA

The page has two states managed by inline JS at the bottom of the file:

- `#product-view` — product selection (format, grind, cadence, quantity)
- `#checkout-module` — shipping form + order summary + Bold payment button

`showCheckout()` / `showProduct()` toggle between them with a fade. `pagarConBold()` POSTs to `/order` and redirects the browser to Bold's hosted checkout.

### CSS load order (matters)

```
css/tokens.css       ← design tokens + reset + utilities (all pages)
css/components.css   ← shared component styles
styles.css           ← index.html only
style-compra.css     ← Comprar.html only
```

### JS files

- `js/shipping.js` — exposes `window.Shipping.calculate(dept, productValue)` for the live price preview. Mirrors the shipping logic in `server.js`; **both must stay in sync.**
- `js/components.js` — activates `data-component` elements on DOMContentLoaded (format-picker, cadence-picker, grind-dial). Components communicate via custom DOM events.

### API URL auto-detection

`Comprar.html` switches endpoints based on hostname:

```js
var API_URL = (hostname === 'localhost' || hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : 'https://royaleluxurycoffee.com';
```

In production, a reverse proxy must route `POST /order` → `localhost:3001`.

### Runtime data dependency

`municipios.json` is fetched at runtime by the checkout form to populate the department → city selects. The file must be served alongside the HTML (it is not bundled).
