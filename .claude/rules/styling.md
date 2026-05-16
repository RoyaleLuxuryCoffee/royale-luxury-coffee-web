---
description: CSS architecture — which stylesheet owns which page, design tokens, and fonts.
globs:
  - "*.css"
  - "*.html"
alwaysApply: false
---

## Styling

### Stylesheets
- `css/tokens.css` — design tokens + reset + utilities (loaded everywhere)
- `css/components.css` — reusable component styles
- `styles.css` — landing page (`index.html`) page-specific styles
- `style-compra.css` — checkout page (`Comprar.html`) page-specific styles

### Design tokens (`css/tokens.css :root`)
| Token | Value |
|---|---|
| `--ink` | `#0A0908` (body background) |
| `--coal` | `#13110F` |
| `--char` | `#1C1A17` |
| `--bone` | `#F5F1E8` (body text) |
| `--gold` | `#C9A961` |
| `--gold-soft` | `#E6D2A6` |
| `--gold-deep` | `#8B7355` |
| `--silver` | `#A8A49C` |

Semi-transparent aliases: `--hairline`, `--bone-15/40/55/65`, `--silver-dim`.

### Fonts
- `--serif`: Cormorant Garamond (headings / editorial)
- `--sans`: Inter (body / UI)

### Utilities
- `.label` / `.label-mute` — 10px uppercase spaced label
- `.data` / `.editorial` — serif normal / serif italic
- `.gold-grad` — gold gradient text (use on headings)
- `.hairline` — 1px gold divider
- `.container` — max-width 1400px, responsive padding
