# Ask Fin — Shopify App

A Shopify theme app extension that embeds Intercom's Fin AI shopping assistant directly on product pages, giving customers contextual help right where they're making buying decisions.

## How it works

1. Customer sees suggested questions (e.g. "What size should I get?") on a product page
2. They click a suggestion or type their own question
3. The Intercom messenger opens with the question pre-filled + product context attached
4. Fin AI handles the conversation

## Tech stack — intentionally simple

- **Frontend:** Shopify Theme App Extension (Liquid + vanilla JS + CSS) — no React, no build step
- **Integration:** Intercom JavaScript Messenger SDK (`window.Intercom`) + Shopify Liquid product data
- **No backend needed:** The app works entirely client-side by opening the existing Intercom messenger with pre-filled messages

## Key files

| File | What it does |
|------|-------------|
| `extensions/ask-fin/blocks/ask-fin-pdp.liquid` | The UI block (suggested questions, input, product context) |
| `extensions/ask-fin/assets/ask-fin.js` | ~116 lines — opens Intercom with the question + product context |
| `extensions/ask-fin/assets/ask-fin.css` | ~179 lines — clean, responsive styling |

## Why it's low effort

- No database, no auth system, no complex state management
- Shopify CLI handles all the deployment, tunneling, and bundling
- The app doesn't rebuild the chat UI — it just opens the existing Intercom messenger with the right context
- Zero-code install for merchants (drag-and-drop in Shopify theme editor)
- The whole app is essentially ~500 lines of custom code

**The clever bit isn't complexity — it's placement.** Instead of building a custom chat widget, we put contextual question prompts where customers are already shopping and hand off to Intercom's existing messenger. Minimal code, maximum impact.

## What's solid

- **Theme app extension approach.** This is the correct Shopify-blessed pattern. Drag-and-drop install, no theme code editing, auto-removes on uninstall. Nothing to rework here.
- **Client-side Intercom integration.** `Intercom('showNewMessage', text)` is the right call. It works for anonymous visitors, handles identity automatically, and doesn't need a backend. This is production-ready.
- **Product context passing.** Liquid extracts product data → JSON → JS passes it to Intercom via custom attributes. Fin gets full context about which product the customer is asking about. This works.
- **UI and merchant experience.** Clean, responsive, accessible. Merchants configure heading and placeholder text in the theme editor. No code required.

## What's missing to launch

### 1. Distribution — how to get this on other stores

| Method | Who can install? | Review needed? | Effort |
|---|---|---|---|
| **Dev store** (current) | Only your dev store | None | Already done |
| **[Custom app](https://shopify.dev/docs/apps/build/custom-apps)** | One specific store | None | Minimal — create via that store's admin |
| **[Unlisted app](https://shopify.dev/docs/apps/launch/distribution)** | Anyone with a direct link | Full Shopify review | See below |
| **[Listed app](https://shopify.dev/docs/apps/launch/shopify-app-store)** | Anyone via App Store | Full review + listing content | Same as unlisted + screenshots, screencast |

For a handful of stores, **custom app per store** is the fastest — no review. For broader distribution (unlisted or listed), the app needs to pass [Shopify's review](https://shopify.dev/docs/apps/launch/app-store-review/review-process): GDPR webhooks, embedded admin page, security headers, Lighthouse performance under 10pt degradation. Budget **3-4 weeks** for review with 1-2 rounds of feedback.

### 2. Smart question generation (currently hardcoded)

The suggested questions are 10 hardcoded strings, some snowboard-specific ("Does this come with bindings?"). Won't work for other stores. Needs an LLM call — pass product data, get contextual questions back. Simplest approach: backend endpoint with caching by product handle. This means adding a backend + LLM API dependency.

### 3. Auto-sending messages (Intercom API limitation)

Currently: customer clicks a question → messenger opens with text pre-filled → customer hits send. We tried to auto-send via the [Intercom REST API](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations/createconversation) but it doesn't work for anonymous visitors.

**Why:** Intercom's [visitor → lead → user model](https://www.intercom.com/help/en/articles/310-how-do-visitors-leads-and-users-work-in-intercom) means anonymous visitors are client-side-only (cookie-based). The REST API's `POST /conversations` needs a pre-existing contact ID, but visitors don't have one until they engage with the Messenger. We hit "Lead Not Found" errors consistently — this is a [known limitation](https://community.intercom.com/api-webhooks-23/creating-a-conversation-from-a-visitor-returning-an-error-lead-not-found-2870). The JS SDK works because it owns the visitor identity and handles conversion atomically. There's no `Intercom('sendMessage')` method today — `showNewMessage` (pre-fill, user clicks send) is the best option.

### 4. Other production gaps

- **Dead backend code** — `web/index.js` has the failed REST API attempt. Remove or repurpose for LLM question generation.
- **No fallback** — if Intercom isn't installed, the block does nothing on click.
- **No analytics** — no tracking of clicks or conversions.

## How we built it — dev environment setup

This is all standard Shopify infrastructure. Nothing hacked together — it's the official way to build Shopify apps.

**What you need (all free):**

1. **[Shopify Partner account](https://partners.shopify.com/)** — free, anyone can create one. This is where you manage apps.
2. **[Dev store](https://shopify.dev/docs/apps/build/dev-dashboard/development-stores)** — free test store created from the Partner Dashboard. Ours is `darias-playground.myshopify.com`. Comes with test products, no real transactions.
3. **[Shopify CLI](https://shopify.dev/docs/api/shopify-cli)** — `npm install -g @shopify/cli`. Handles app scaffolding, dev server, hot reload, deployment, and tunnelling to your dev store.
4. **Intercom on the dev store** — the official [Intercom Shopify app](https://apps.shopify.com/intercom) installed on the dev store. This provides the Messenger widget (the floating bubble) and loads `window.Intercom` globally. Our app is a separate app that coexists with it.

**How it all fits together:**

- `shopify app init` scaffolded the project structure
- `shopify app generate extension` created the theme app extension (the `extensions/ask-fin/` folder)
- `shopify app dev` runs a dev server that tunnels the extension to the dev store with hot reload
- `shopify app deploy` pushes the extension to Shopify's CDN
- The merchant adds the block to their product page via the theme editor — [standard app block workflow](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions)

**Who can replicate this:** anyone with a Shopify Partner account (free) and Node.js installed. The Shopify CLI does the heavy lifting.

```bash
npm install
npm run dev
```
