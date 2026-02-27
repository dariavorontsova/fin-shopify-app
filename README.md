# Ask Fin — Shopify App

A Shopify theme app extension that embeds Intercom's Fin AI shopping assistant directly on product pages, giving customers contextual help right where they're making buying decisions.

## How it works

1. Customer sees suggested questions (e.g. "What size should I get?") on a product page
2. They click a suggestion or type their own question
3. The Intercom messenger opens with the question pre-filled + product context attached
4. Fin AI handles the conversation

## How we built it

This is all standard Shopify infrastructure — nothing hacked together. ~500 lines of custom code total (Liquid + JS + CSS), no backend needed.

**What you need (all free):**

1. **[Shopify Partner account](https://partners.shopify.com/)** — free, anyone can create one. This is where you manage apps.
2. **[Dev store](https://shopify.dev/docs/apps/build/dev-dashboard/development-stores)** — free test store from the Partner Dashboard. Ours is `darias-playground.myshopify.com`. Comes with test products, no real transactions.
3. **[Shopify CLI](https://shopify.dev/docs/api/shopify-cli)** — `npm install -g @shopify/cli`. Handles scaffolding, dev server, hot reload, deployment, and tunnelling.
4. **Intercom on the dev store** — the official [Intercom Shopify app](https://apps.shopify.com/intercom) provides the Messenger widget and loads `window.Intercom` globally. Our app is a separate app that coexists with it.

**The build:**

- `shopify app init` → `shopify app generate extension` → write the Liquid/JS/CSS → `shopify app dev` to test
- The merchant adds the block via the theme editor — [standard app block workflow](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions)
- The app just calls `Intercom('showNewMessage', text)` to open the messenger with a pre-filled question + product context via custom attributes
- No database, no auth, no complex state — Shopify CLI and the Intercom JS SDK do the heavy lifting

```bash
npm install
npm run dev
```

## What's solid

- **Theme app extension approach.** Correct Shopify-blessed pattern. Drag-and-drop install, auto-removes on uninstall.
- **Client-side Intercom integration.** `showNewMessage` works for anonymous visitors, handles identity automatically, no backend needed.
- **Product context passing.** Liquid → JSON → Intercom custom attributes. Fin gets full product context.
- **UI.** Clean, responsive, accessible. Merchants configure heading and placeholder in the theme editor.

## What's missing to launch

### 1. Distribution — how to get this on other stores

| Method | Who can install? | Review needed? | Effort |
|---|---|---|---|
| **Dev store** (current) | Only your dev store | None | Already done |
| **[Custom app](https://shopify.dev/docs/apps/build/custom-apps)** | One specific store | None | Minimal |
| **[Unlisted app](https://shopify.dev/docs/apps/launch/distribution)** | Anyone with a direct link | Full Shopify review | See below |
| **[Listed app](https://shopify.dev/docs/apps/launch/shopify-app-store)** | Anyone via App Store | Full review + listing content | Same + screenshots, screencast |

For a handful of stores, **custom app per store** is the fastest — no review. For broader distribution, the app needs to pass [Shopify's review](https://shopify.dev/docs/apps/launch/app-store-review/review-process) (GDPR webhooks, admin page, security headers, perf). Budget **3-4 weeks**.

### 2. Smart question generation (currently hardcoded)

Suggested questions are hardcoded and snowboard-specific. Needs an LLM call — pass product data, get contextual questions back. Simplest approach: backend endpoint with caching by product handle.

### 3. Auto-sending messages

Currently the customer has to hit send after the messenger opens. We tried auto-sending via the [Intercom REST API](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/createconversation) but hit [visitor identity issues](https://community.intercom.com/api-webhooks-23/creating-a-conversation-from-a-visitor-returning-an-error-lead-not-found-2870) — the public API needs a contact ID that doesn't exist for anonymous visitors yet. This is solvable with Intercom engineering involvement (e.g. internal APIs, or a `sendMessage`-style JS method). Another option worth exploring: **bundling this as part of the official Intercom Shopify app** rather than a standalone app, which would give direct access to the Messenger internals and simplify distribution (no separate Shopify review needed).

### 4. Other gaps

- `web/index.js` has a dead REST API attempt — remove or repurpose for LLM questions
- No fallback if Intercom isn't installed
- No analytics
