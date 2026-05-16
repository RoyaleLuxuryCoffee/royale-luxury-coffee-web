---
description: Environment variables loaded by server.js via dotenv — secrets and runtime config.
globs:
  - "server.js"
  - ".env"
alwaysApply: false
---

## Environment variables (`server.js` via `dotenv`)

| Variable | Purpose |
|---|---|
| `BOLD_API_KEY` | Bold payment gateway API key (header: `x-api-key`) |
| `REDIRECT_URL` | URL Bold redirects to after payment (default: `https://royaleluxurycoffee.com/thanks.html`) |
| `PORT` | Server port (default: 3001) |

The `.env` file is **not gitignored** — never commit secrets.
