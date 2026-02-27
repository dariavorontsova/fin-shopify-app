# Embedded Chat Visual Specs

## Suggestion Buttons (pill chips)

| Property | Value |
|---|---|
| Background | `#ffffff` (white) |
| Border | `1px solid rgba(0, 0, 0, 0.1)` |
| Border radius | `18px` (pill shape) |
| Height | `32px` |
| Padding | `6px 16px` |
| Font | Inter, 14px, weight 400 |
| Text color | `#1a1a1a` |
| Gap between buttons | `8px` |
| Layout | flex column (stacked vertically) |
| Shadow on container | `drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.04))` |
| **Hover** | background `rgba(0, 0, 0, 0.02)`, border `rgba(0, 0, 0, 0.15)` |
| **Active** | background `rgba(0, 0, 0, 0.05)`, `scale(0.98)` |

## Input Field

| Property | Value |
|---|---|
| Background | `#ffffff` |
| Border | none (uses inset box-shadow instead) |
| Box-shadow (default) | `inset 0 0 0 1px #E9EAE6` |
| Border radius | `24px` |
| Height | `40px` |
| Max width | `600px` |
| Padding | `8px 4px 8px 16px` |
| Font | Inter, 14px, weight 400 |
| Placeholder color | `#81817e` |
| Text color (typing) | `#1a1a1a` |
| **Hover** | `inset 0 0 0 1px #C6C9C0, 0 0 0 5px rgba(0, 0, 0, 0.05)` |
| **Focus** | `inset 0 0 0 2px #000000` |

## Send Button (inside input)

| Property | Value |
|---|---|
| Size | `32px x 32px` |
| Border radius | `100px` (circle) |
| Background (inactive) | `#f8f8f7` |
| Background (active/has text) | `#1a1a1a` |
| Icon size | `16px` |
| Icon color (inactive) | `#8e8e8c` |
| Icon color (active) | `#ffffff` |
| Transition | `140ms cubic-bezier(0.4, 0, 0.2, 1)` |

## Header ("Ask AI assistant")

| Property | Value |
|---|---|
| Font | Inter, 15px, weight 600 |
| Text color | `#1a1a1a` |
| Padding | `12px 24px` |
| Border bottom | `1px solid #e5e5e5` |

## Key Colors

| Token | Value |
|---|---|
| Text dark | `#1a1a1a` |
| Text muted / placeholder | `#81817e` |
| Border default | `#E9EAE6` |
| Border hover | `#C6C9C0` |
| Border focus | `#000000` |
| Inactive surface | `#f8f8f7` |

## Transitions

- Buttons and input: `0.2s ease`
- Send button: `140ms cubic-bezier(0.4, 0, 0.2, 1)`
