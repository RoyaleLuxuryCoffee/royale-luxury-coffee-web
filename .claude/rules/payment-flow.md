---
description: Bold payment gateway integration — checkout flow from form submit to redirect.
globs:
  - "server.js"
  - "Comprar.html"
alwaysApply: false
---

## Payment flow

1. User fills shipping form in `Comprar.html` and clicks buy.
2. `pagarConBold()` (inline JS in `Comprar.html`) POSTs to `http://localhost:3001/order` with `{ productId, quantity, customer }`.
3. `server.js` looks up the product price from its in-memory catalog, calls the Bold API (`https://integrations.api.bold.co/online/link/v1`) to create a payment link, and returns `{ success, paymentUrl }`.
4. The browser redirects the user to Bold's hosted checkout.
