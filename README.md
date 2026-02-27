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

### 1. Shopify App Store review (~3-4 weeks)

To publish on the Shopify App Store the app needs to pass review. Key gaps:

- **GDPR webhooks** — mandatory even if we don't store customer data. Need endpoints for Customer Data Request, Customer Redact, and Shop Redact.
- **Embedded admin page** — even a minimal one. Reviewers expect a functioning app UI in the Shopify admin after install.
- **Demo screencast** — required for submission. Must show setup flow and core features.
- **Lighthouse performance** — theme extension must not degrade store performance by more than 10 points.
- **Security headers** — anti-clickjacking headers for the embedded admin (most common rejection reason).

Timeline is officially 5-10 business days but realistically **3-4 weeks** with 1-2 rounds of feedback. Current backlog (early 2026) is reportedly longer.

An alternative: ship as an **unlisted app** (same review requirements but no App Store listing review, distributed via direct link). Same effort but avoids the listing content prep.

### 2. Smart question generation (currently hardcoded)

Right now the suggested questions are 10 hardcoded strings, some snowboard-specific ("Does this come with bindings?", "What terrain is this best for?"). This obviously won't work for a clothing store or electronics shop.

**What's needed:** pass the product URL or product data (title, type, description) to an LLM and get back 3-4 contextual questions. Two approaches:

- **On page load** — JS calls a backend endpoint that hits an LLM. Simple but adds latency and cost per page view. Could cache by product handle.
- **At sync time** — generate questions when products are synced/updated and store them. No page-load latency but needs a data store and sync mechanism.

Either way this means **adding a backend** (which we currently don't need) and an LLM API dependency. The on-page-load approach with caching is probably the simplest starting point.

### 3. Auto-sending messages (the Intercom REST API problem)

Currently the customer clicks a question → Intercom messenger opens with text pre-filled → customer has to hit send. We tried to auto-send via Intercom's REST API but it didn't work. Here's why:

**The core issue: anonymous visitors don't exist server-side.** Intercom's data model has three tiers: visitors → leads → users. Visitors are **client-side-only entities** — their identity lives in browser cookies managed by the Messenger widget. They don't become "contacts" (leads) until they actually engage with the Messenger.

The REST API's Create Conversation endpoint (`POST /conversations`) requires a `from.id` referencing a contact that already exists in Intercom. But for a first-time visitor, there is no contact record yet. We tried:

- Looking up visitors via `GET /visitors?user_id=` → inconsistent, often returns nothing
- Using the visitor ID from `Intercom('getVisitorId')` on the client → passing to backend → "Lead Not Found" errors
- The documented auto-conversion (visitor → lead on conversation creation) simply doesn't work reliably

This is a known Intercom limitation with open community threads and no resolution. The Messenger JS SDK works because it **owns the visitor identity** and handles the visitor-to-lead conversion atomically when a message is sent. The REST API can't replicate this.

**What would fix it:** Intercom would need to expose a client-side JS method like `Intercom('sendMessage', text)` that sends without requiring the user to click. This doesn't exist today. The current `showNewMessage` is the best available option.

### 4. Other production gaps

- **Dead backend code** — `web/index.js` has the REST API attempt that doesn't work. Should be removed or repurposed for the LLM question generation.
- **No graceful fallback** — if Intercom isn't installed on the store, the block shows questions that do nothing on click. Should show a warning or hide itself.
- **No analytics** — no tracking of question clicks, form submissions, or conversion to conversations.

## Getting started

```bash
npm install
npm run dev
```

Requires [Shopify CLI 3.0+](https://shopify.dev/docs/api/shopify-cli) and an Intercom access token in `.env`.
