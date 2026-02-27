# Ask Fin — Shopify App

A Shopify theme app extension that embeds Intercom's Fin AI shopping assistant directly on product pages, giving customers contextual help right where they're making buying decisions.

## How it works

1. Customer sees suggested questions (e.g. "What size should I get?") on a product page
2. They click a suggestion or type their own question
3. The Intercom messenger opens with the question pre-filled + product context attached
4. Fin AI handles the conversation

## Tech stack — intentionally simple

- **Frontend:** Shopify Theme App Extension (Liquid + vanilla JS + CSS) — no React, no build step
- **Backend:** A lightweight Express.js server for Intercom API calls
- **Integrations:** Intercom REST API + JS Messenger SDK, Shopify Liquid product data

## Key files

| File | What it does |
|------|-------------|
| `extensions/ask-fin/blocks/ask-fin-pdp.liquid` | The UI block (suggested questions, input, product context) |
| `extensions/ask-fin/assets/ask-fin.js` | ~116 lines — opens Intercom with the question + product context |
| `extensions/ask-fin/assets/ask-fin.css` | ~179 lines — clean, responsive styling |
| `web/index.js` | Express server with one endpoint for conversation creation |

## Why it's low effort

- No database, no auth system, no complex state management
- Shopify CLI handles all the deployment, tunneling, and bundling
- The app doesn't rebuild the chat UI — it just opens the existing Intercom messenger with the right context
- Zero-code install for merchants (drag-and-drop in Shopify theme editor)
- The whole app is essentially ~500 lines of custom code

**The clever bit isn't complexity — it's placement.** Instead of building a custom chat widget, we put contextual question prompts where customers are already shopping and hand off to Intercom's existing messenger. Minimal code, maximum impact.

## Getting started

```bash
npm install
npm run dev
```

Requires [Shopify CLI 3.0+](https://shopify.dev/docs/api/shopify-cli) and an Intercom access token in `.env`.
