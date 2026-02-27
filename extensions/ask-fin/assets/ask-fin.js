/**
 * Ask Fin - Intercom Integration
 *
 * Handles suggested question clicks and free-text input,
 * opens the Intercom messenger with the message pre-filled.
 */
(function () {
  'use strict';

  function isIntercomAvailable() {
    return typeof window.Intercom === 'function';
  }

  function updateIntercomProductContext(ctx) {
    if (!isIntercomAvailable() || !ctx) return;
    try {
      window.Intercom('update', {
        ask_fin_product_name: ctx.title || '',
        ask_fin_product_type: ctx.type || '',
        ask_fin_product_vendor: ctx.vendor || '',
        ask_fin_product_url: ctx.url || '',
        ask_fin_product_id: String(ctx.id || ''),
        ask_fin_product_price: ctx.price || ''
      });
    } catch (e) { /* ignore */ }
  }

  function getProductContext() {
    var el = document.querySelector('[data-ask-fin-product-context]');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function askFin(questionText) {
    if (!questionText || !questionText.trim()) return;
    if (!isIntercomAvailable()) {
      console.warn('[Ask Fin] Intercom is not available on this page.');
      return;
    }
    window.Intercom('showNewMessage', questionText.trim());
  }

  function showRandomQuestions(block, count) {
    var buttons = Array.prototype.slice.call(
      block.querySelectorAll('[data-ask-fin-question]')
    );
    // Fisher-Yates shuffle
    for (var i = buttons.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = buttons[i]; buttons[i] = buttons[j]; buttons[j] = tmp;
    }
    for (var k = 0; k < Math.min(count, buttons.length); k++) {
      buttons[k].style.display = '';
    }
  }

  function initBlock(block) {
    if (block.dataset.askFinInitialized) return;
    block.dataset.askFinInitialized = 'true';

    showRandomQuestions(block, 3);

    block.querySelectorAll('[data-ask-fin-question]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        askFin(btn.getAttribute('data-ask-fin-question'));
      });
    });

    var form = block.querySelector('[data-ask-fin-form]');
    var input = block.querySelector('[data-ask-fin-input]');
    var submitBtn = block.querySelector('[data-ask-fin-submit]');

    if (form && input) {
      // Toggle send button active state based on input content
      if (submitBtn) {
        input.addEventListener('input', function () {
          submitBtn.classList.toggle('ask-fin__submit--active', input.value.trim().length > 0);
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = input.value;
        if (!value || !value.trim()) return;
        var ctx = getProductContext();
        var prefix = ctx && ctx.title ? '[Re: ' + ctx.title + '] ' : '';
        askFin(prefix + value.trim());
        input.value = '';
        if (submitBtn) submitBtn.classList.remove('ask-fin__submit--active');
      });
    }
  }

  function init() {
    document.querySelectorAll('[data-ask-fin-block]').forEach(initBlock);
    var ctx = getProductContext();
    if (ctx) {
      if (isIntercomAvailable()) {
        updateIntercomProductContext(ctx);
      } else {
        var attempts = 0;
        var interval = setInterval(function () {
          if (isIntercomAvailable()) { updateIntercomProductContext(ctx); clearInterval(interval); }
          else if (++attempts >= 20) clearInterval(interval);
        }, 500);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
