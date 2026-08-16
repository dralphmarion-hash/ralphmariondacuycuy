/* ==========================================================================
   Ralph Marion Dacuycuy - portfolio behaviour
   Vanilla JS, no dependencies. Everything here is progressive enhancement:
   the page is fully readable and the contact form still posts without it.
   ========================================================================== */
(function () {
  'use strict';

  var CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/dralphmarion@gmail.com';

  /* ---------------------------------------------------------------- header */
  var header = document.getElementById('site-header');
  var progress = document.getElementById('scroll-progress');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 24);

    if (progress) {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var ratio = scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0;
      progress.style.setProperty('--progress', ratio.toFixed(4));
    }
    ticking = false;
  }

  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------- reveal on view */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Stagger siblings slightly so groups arrive as a wave, not a wall.
        var siblings = entry.target.parentElement
          ? Array.prototype.filter.call(entry.target.parentElement.children, function (el) {
              return el.classList.contains('reveal');
            })
          : [];
        var index = siblings.indexOf(entry.target);
        var delay = index > 0 ? Math.min(index, 5) * 70 : 0;
        entry.target.style.setProperty('--reveal-delay', delay + 'ms');
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) { revealObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------ scroll spy */
  var navLinks = document.querySelectorAll('.nav-link');
  var spyTargets = [];

  Array.prototype.forEach.call(navLinks, function (link) {
    var id = link.getAttribute('href');
    if (!id || id.charAt(0) !== '#') return;
    var section = document.querySelector(id);
    if (section) spyTargets.push({ link: link, section: section });
  });

  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = spyTargets.filter(function (t) { return t.section === entry.target; })[0];
        if (!match) return;
        if (entry.isIntersecting) {
          spyTargets.forEach(function (t) { t.link.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    spyTargets.forEach(function (t) { spyObserver.observe(t.section); });
  }

  /* ----------------------------------------------------------- mobile menu */
  var toggle = document.getElementById('nav-toggle');
  var panel = document.getElementById('nav-mobile');

  if (toggle && panel) {
    var FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

    var openMenu = function () {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.sr-only').textContent = 'Close menu';
      document.body.classList.add('nav-open');
      var first = panel.querySelector(FOCUSABLE);
      if (first) first.focus();
    };

    var closeMenu = function (returnFocus) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.sr-only').textContent = 'Open menu';
      document.body.classList.remove('nav-open');
      if (returnFocus) toggle.focus();
    };

    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };

    toggle.addEventListener('click', function () {
      if (isOpen()) closeMenu(true); else openMenu();
    });

    // Close when a destination is chosen, so the anchor jump is visible.
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }

      if (e.key !== 'Tab') return;

      // Keep focus inside the overlay while it is open.
      var items = [toggle].concat(Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE)));
      if (!items.length) return;
      var firstItem = items[0];
      var lastItem = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    });

    // A resize into the desktop layout hides the toggle; don't strand the overlay.
    window.addEventListener('resize', function () {
      if (isOpen() && window.innerWidth >= 900) closeMenu(false);
    });
  }

  /* --------------------------------------------------------- contact form */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('cf-submit');

  var RULES = [
    { id: 'cf-name',    err: 'cf-name-err',    msg: 'Please tell me your name.' },
    { id: 'cf-email',   err: 'cf-email-err',   msg: 'Please add your email address.' },
    { id: 'cf-message', err: 'cf-message-err', msg: 'Please write a short message.' }
  ];

  // Deliberately permissive: reject only what is obviously not an address.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(field, errNode, message) {
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      errNode.textContent = message;
    } else {
      field.removeAttribute('aria-invalid');
      errNode.textContent = '';
    }
  }

  function validateField(rule) {
    var field = document.getElementById(rule.id);
    var errNode = document.getElementById(rule.err);
    if (!field || !errNode) return true;

    var value = field.value.trim();

    if (!value) {
      setError(field, errNode, rule.msg);
      return false;
    }
    if (field.type === 'email' && !EMAIL_RE.test(value)) {
      setError(field, errNode, 'That email address does not look right.');
      return false;
    }
    setError(field, errNode, '');
    return true;
  }

  RULES.forEach(function (rule) {
    var field = document.getElementById(rule.id);
    if (!field) return;
    // Only re-validate on blur once, then live-correct as they fix it.
    field.addEventListener('blur', function () { validateField(rule); });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(rule);
    });
  });

  function showStatus(kind, text) {
    if (!status) return;
    status.classList.remove('is-ok', 'is-err');
    status.classList.add(kind === 'ok' ? 'is-ok' : 'is-err');
    status.textContent = text;
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.setAttribute('data-busy', busy ? 'true' : 'false');
    submitBtn.disabled = busy;
    var label = submitBtn.querySelector('.btn-label');
    if (label) label.textContent = busy ? 'Sending...' : 'Send message';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = true;
    var firstBad = null;
    RULES.forEach(function (rule) {
      if (!validateField(rule)) {
        valid = false;
        if (!firstBad) firstBad = document.getElementById(rule.id);
      }
    });

    if (!valid) {
      showStatus('err', 'Please fix the highlighted fields and try again.');
      if (firstBad) firstBad.focus();
      return;
    }

    // Honeypot: bots fill hidden fields. Fail quietly rather than tipping them off.
    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) {
      showStatus('ok', 'Thanks - your message has been sent.');
      form.reset();
      return;
    }

    if (!window.fetch) {
      // No fetch: let the browser do a normal POST to FormSubmit.
      form.submit();
      return;
    }

    setBusy(true);
    if (status) { status.classList.remove('is-ok', 'is-err'); status.textContent = ''; }

    var payload = {
      name: document.getElementById('cf-name').value.trim(),
      email: document.getElementById('cf-email').value.trim(),
      company: document.getElementById('cf-company').value.trim() || 'Not given',
      message: document.getElementById('cf-message').value.trim(),
      _subject: 'Portfolio enquiry for Ralph Marion Dacuycuy',
      _template: 'table',
      _captcha: 'false'
    };

    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        var success = result.ok && String(result.data.success) === 'true';

        if (success) {
          showStatus('ok', 'Thank you - your message is on its way. I reply to every genuine enquiry, usually within a couple of days.');
          form.reset();
          RULES.forEach(function (rule) {
            var f = document.getElementById(rule.id);
            var n = document.getElementById(rule.err);
            if (f && n) setError(f, n, '');
          });
        } else {
          var raw = (result.data && result.data.message) || '';
          // Before the owner clicks FormSubmit's activation link the API returns a
          // setup notice. Don't show a visitor that plumbing -- just the fallback.
          var msg = /activat/i.test(raw)
            ? 'The contact form is not switched on yet.'
            : (raw || 'Something went wrong sending that.');
          showStatus('err', msg + ' Please email dralphmarion@gmail.com directly and it will reach me.');
        }
      })
      .catch(function () {
        showStatus('err', 'That message could not be sent - you may be offline. Please email dralphmarion@gmail.com directly.');
      })
      .then(function () {
        setBusy(false);
      });
  });
})();
