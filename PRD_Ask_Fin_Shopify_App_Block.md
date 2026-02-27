# PRD: "Ask Fin" Shopify App Block Prototype

## Context

We are the ecommerce team at Intercom, building Fin Ecommerce Agent — an AI shopping assistant that extends Intercom's existing customer service AI (Fin) into ecommerce. Fin already works as a support agent on Shopify stores via Intercom's Shopify integration. It's installed as an **app embed block** (the floating messenger bubble) through the Shopify theme editor.

The problem we're solving: **shoppers don't know the AI agent exists or what it can do.** The messenger launcher is associated with support, not shopping. Shopping behaviours (browsing PDPs, searching, checking out) happen on other surfaces entirely. We need to bring the agent to where shopping decisions are already happening.

This prototype is a proof-of-concept to demonstrate one solution direction: embedding an "Ask Fin" component directly on product detail pages as a **Shopify app block** that merchants can add via the theme editor with no code.

## What we're building

A Shopify theme app extension containing an **app block** that:

1. **Renders an "Ask Fin" section on the product detail page.** This should include:
   - A heading (e.g. "Ask Fin about this product" or similar)
   - 3-4 suggested questions that are contextual to the product (e.g. "What's the sizing like?", "How does this compare to [related product]?", "What's the return policy?")
   - A free-text input field where the user can type their own question
   - Clean, minimal styling that could plausibly sit on any Shopify store

2. **On interaction, opens the Intercom messenger with context pre-loaded.** When a user clicks a suggested question or submits a free-text question:
   - Call `Intercom('showNewMessage', '<the question text>')` to open the messenger with the question pre-populated
   - The Intercom messenger is already present on the page (loaded via the existing app embed), so we're just triggering it

3. **Reads product context from Shopify's Liquid template variables.** The block should use Liquid to pull:
   - `{{ product.title }}` — product name
   - `{{ product.type }}` — product type/category
   - `{{ product.vendor }}` — brand/vendor
   - Any other available product data that could make suggested questions more specific

4. **Is add-able by merchants through the Shopify theme editor** — drag and drop onto the product page template, no code required. This is the standard behaviour of Shopify app blocks.

## What we're NOT building

- This is not a production feature. It's a working prototype on a dev store for demo/screen-recording purposes.
- We don't need a backend/server. The app block is purely client-side (Liquid + CSS + JS).
- We don't need to handle the AI response. The Intercom messenger handles everything once opened.
- We don't need authentication, user tracking, or analytics.
- We don't need to integrate with Intercom's actual ecommerce product catalog sync.

## Why this matters

This prototype demonstrates:
- **For the team:** that deeper integration into shopping journeys is technically feasible and doesn't require rebuilding the messenger. The infrastructure exists on both sides (Intercom JS API + Shopify app blocks).
- **For merchants:** a zero-code setup experience. Install app → go to theme editor → drag block onto product page → done.
- **For the strategy:** a tangible alternative to the current approach of relying solely on the messenger launcher and proactive messaging.

## Research you should do before building

### Intercom Messenger JavaScript API
The JS API is how we'll trigger the messenger from the app block. Key methods:

- `Intercom('show')` — opens the messenger
- `Intercom('showNewMessage', 'pre-populated text')` — opens messenger with a message pre-filled
- `Intercom('showSpace', 'messages')` — opens directly to messages
- Custom launcher configuration — allows hiding the default launcher and using custom elements

**Read the full docs:**
- https://developers.intercom.com/installing-intercom/web/methods
- https://www.npmjs.com/package/@intercom/messenger-js-sdk

**Key question to investigate:** When `Intercom('showNewMessage', text)` is called, does it open the messenger with the message ready to send, or does it auto-send? We want ready-to-send (user clicks send). Verify this behaviour.

**Key question:** Is there a way to pass metadata or context (like current product URL or product ID) along with the message, so Fin could potentially use it? Explore `Intercom('update', { custom_attributes })` or event tracking.

### Shopify Theme App Extensions
This is the framework we're using to create the app block.

**Read these docs in order:**
1. Overview: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
2. Configuration & schema: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration
3. Build tutorial: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/build
4. App blocks specifically: https://shopify.dev/docs/storefronts/themes/architecture/blocks/app-blocks
5. UX guidelines: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/ux

**Key things to understand:**
- The difference between **app blocks** (inline, positioned by merchant within a section) and **app embed blocks** (floating/overlay, like the current Intercom messenger bubble)
- How app blocks access Liquid product data — app blocks have access to the product object when placed on a product page template
- The schema format for defining merchant-configurable settings in the theme editor
- How assets (CSS, JS) are bundled and served via Shopify's CDN

### Shopify App Scaffolding
You need a Shopify app to host the theme extension, even though the extension itself is just Liquid/CSS/JS.

**Setup path:**
1. You'll need Shopify CLI 3.0+ (`npm install -g @shopify/cli`)
2. Create the app: `shopify app init`
3. Generate theme extension: `shopify app generate extension` → select "Theme app extension"
4. Dev server with hot reload: `shopify app dev` (preview in Chrome only)

**Dev store:** Shopify provides free development stores through the Partner Dashboard (https://shopify.dev/docs/apps/build/dev-dashboard/development-stores). Create one with generated test data. It should use an Online Store 2.0 theme (Dawn or Horizon) that supports app blocks.

## Development environment

- **Shopify Partner account:** Free to create at partners.shopify.com. Needed to create apps and dev stores.
- **Dev store:** Create via the Dev Dashboard. Use "generated test data" option so you have products to test with.
- **Theme:** Use Dawn (Shopify's reference OS 2.0 theme) or Horizon. Both support app blocks on the product page.
- **Intercom on the dev store:** The official Intercom Shopify app is already installed on our test store. It provides an **app embed block** (the floating messenger bubble) which loads the Intercom JS API globally on every page. This means `window.Intercom` is already available — our app block just calls it. We don't need to install anything else for the messenger side. Our prototype is a **separate standalone app** that coexists with the official Intercom app on the same store. The official app handles the messenger; our app provides the inline "Ask Fin" block on the PDP.

## Light technical recommendations

These are suggestions, not prescriptions. Use your judgement.

### File structure
The theme app extension will likely look something like:
```
extensions/
  ask-fin/
    blocks/
      ask-fin-pdp.liquid    ← the main app block
    assets/
      ask-fin.css            ← styles
      ask-fin.js             ← JS for handling clicks, calling Intercom API
    snippets/                ← optional reusable Liquid partials
    locales/                 ← optional i18n
    shopify.extension.toml   ← extension config
```

### The Liquid block
- Use `{{ product.title }}`, `{{ product.type }}`, `{{ product.tags }}` etc. to make the experience contextual
- Consider generating suggested questions dynamically based on product type. E.g. if the product has variants, suggest "What's the difference between the variants?". If it's apparel, suggest sizing questions.
- The schema should expose some merchant-configurable settings: heading text, maybe toggle for which suggested questions to show

### Styling
- Keep it minimal and neutral. It should look like it belongs on any Shopify theme.
- Use CSS custom properties where possible so merchants could theoretically override styles.
- Look at how existing Shopify app blocks (like Judge.me reviews) style themselves for reference — they tend to be self-contained with sensible defaults.

### JavaScript
- Check that `window.Intercom` exists before calling it. If the messenger isn't installed, show a graceful fallback or console warning.
- On suggested question click: call `Intercom('showNewMessage', questionText)`
- On free-text submit: call `Intercom('showNewMessage', inputValue)`
- Consider prefixing the message with product context, e.g. `"[Re: Product Name] What's the sizing like?"` so Fin has context about which product the user is asking about

### What "done" looks like
A screen recording showing:
1. The existing Intercom Shopify app already installed and enabled (the app embed toggle in the theme editor — the messenger is already on the store)
2. The Shopify theme editor, with the new "Ask Fin" app block being added to a product page template via drag-and-drop — completely separate from the messenger, no code
3. The product page on the storefront, with the Ask Fin section visible below or alongside the product info
4. A user clicking a suggested question, and the Intercom messenger opening with that question pre-populated
5. A user typing a custom question and submitting, with the same result

The key narrative: the merchant already has Intercom installed. Adding AI shopping assistance to their product pages is one drag-and-drop action in the theme editor. Zero code. That's the deliverable.
