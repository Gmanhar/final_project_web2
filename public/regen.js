// public/regen.js
(function () {
  function onClick(e) {
    // supports buttons with data-resetpage attribute to reset page->1
    const resetPage = this.dataset.resetpage !== undefined;
    const sp = new URLSearchParams(window.location.search);
    sp.set('r', String(Date.now()));
    if (resetPage) sp.set('page', '1');
    // preserve other query params (genre, q, etc.)
    const newQs = sp.toString();
    // navigate (full reload)
    window.location.search = newQs;
  }

  function attach() {
    // support multiple buttons (by id or class)
    const els = document.querySelectorAll('.regen-button');
    els.forEach((btn) => {
      // remove previous handlers if any, then add
      btn.removeEventListener('click', onClick);
      btn.addEventListener('click', onClick);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
