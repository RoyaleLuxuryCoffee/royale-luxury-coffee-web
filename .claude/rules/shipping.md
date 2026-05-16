---
description: Shipping rate logic — Interrapidísimo zones, pricing formula, and sync requirement.
globs:
  - "server.js"
  - "js/shipping.js"
alwaysApply: false
---

## Shipping logic

The shipping calculation is **intentionally duplicated**: `js/shipping.js` (browser preview) and `server.js` (authoritative, used for Bold total). Both must be kept in sync — if you change rates or zones in one, change the other.

### Zones (shipping origin: Bogotá)
| Zone | Departments |
|---|---|
| `LOCAL` | BOGOTADC |
| `REGIONAL` | CUNDINAMARCA, BOYACA, TOLIMA, META, CALDAS, RISARALDA, QUINDIO, ANTIOQUIA, VALLE, SANTANDER, HUILA |
| `NACIONAL` | Atlantic coast + other major departments |
| `DIFICIL_ACCESO` | Amazon basin + islands — orders are **blocked** (manual coordination) |

### Pricing formula
```
total = base + IVA(19%) + sobreflete(2% of max(productValue, 45_000)) + margin
```

### Rates (Interrapidísimo 2025-2026)
| Zone | Base | Margin |
|---|---|---|
| LOCAL | 8 800 | 3 000 |
| REGIONAL | 11 000 | 4 000 |
| NACIONAL | 18 000 | 6 000 |
| DIFICIL_ACCESO | 29 000 | 0 |
