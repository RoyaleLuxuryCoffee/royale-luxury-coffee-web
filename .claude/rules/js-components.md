---
description: Client-side component system — data-component attributes and custom events.
globs:
  - "js/components.js"
  - "*.html"
alwaysApply: false
---

## Component system (`js/components.js`)

Components are activated by `data-component="<name>"` on a container element. No framework — plain DOM.

### Available components
| `data-component` | Fires event | Event detail |
|---|---|---|
| `format-picker` | `format:change` | `{ id, price }` |
| `cadence-picker` | `cadence:change` | `{ id }` |
| `grind-dial` | `grind:change` | `{ id, label }` |

### Radio group pattern
All three use a shared `radioGroup()` helper. Interactive children must have `role="radio"` and `data-id`. Keyboard navigation (arrow keys, Home, End) is built in.

### GrindDial extras
- Set initial value via `data-value="<id>"` on the container.
- Requires child elements: `.r-dial__ticks`, `.r-dial__labels`, `.r-dial__status`, `.r-dial__caret`.
- Ticks are injected at runtime; do not hardcode them in HTML.
