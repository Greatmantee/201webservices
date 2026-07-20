/* ==========================================================================
   201 Web Services — behaviour
   Vanilla JS, no dependencies. Each concern is an isolated init function so
   a failure in one never takes down the rest of the page.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Business WhatsApp, international format (0705… → 234705…).
  var WHATSAPP = "https://wa.me/2347050528704";

  /* ---------------------------------------------------------------- Header */
  /* Adds a solid background + hairline once the page is scrolled. */

  function initHeader() {
    var header = document.getElementById("header");
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 24);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ---------------------------------------------------------------- Drawer */

  function initDrawer() {
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("drawer");
    if (!burger || !drawer) return;

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    burger.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("is-open"));
    });

    // Close after navigating, or on Escape.
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  /* --------------------------------------------------------- Scroll reveal */
  /* Progressive enhancement: elements are visible by default if JS or
     IntersectionObserver is unavailable (see the CSS fallback below). */

  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

    items.forEach(function (el, i) {
      // Stagger siblings slightly so groups cascade rather than pop at once.
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------ Active nav state */

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (link) {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) map[target.id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(map).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* ------------------------------------------------------------------- FAQ */
  /* One panel open at a time; height animates via grid-template-rows. */

  function initFaq() {
    var root = document.querySelector("[data-faq]");
    if (!root) return;

    var items = Array.prototype.slice.call(root.querySelectorAll(".faq__item"));

    items.forEach(function (item, index) {
      var button = item.querySelector(".faq__q");
      var panel = item.querySelector(".faq__a");
      var panelId = "faq-panel-" + index;

      panel.id = panelId;
      button.setAttribute("aria-controls", panelId);

      button.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");

        items.forEach(function (other) {
          other.classList.remove("is-open");
          other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
        });

        if (willOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });

    // Open the first question by default.
    if (items[0]) items[0].querySelector(".faq__q").click();
  }

  /* --------------------------------------------------------- Reviews */
  /* One review visible at a time, dot pagination, per-card "Read more",
     and review dates rendered relative to today from their datetime. */

  function initReviews() {
    var slider = document.querySelector(".reviews-slider");
    if (!slider) return;

    var cards = Array.prototype.slice.call(slider.querySelectorAll(".reviews-track .review"));
    var dots  = Array.prototype.slice.call(slider.querySelectorAll(".reviews-dot"));

    function show(index) {
      cards.forEach(function (card, i) {
        card.classList.toggle("is-active", i === index);

        // A card that leaves the view returns to its collapsed state, so it
        // never reappears mid-expansion with a stale "Read less" label.
        if (i !== index && card.classList.contains("review--open")) {
          card.classList.remove("review--open");
          var button = card.querySelector(".review__more");
          if (button) {
            button.setAttribute("aria-expanded", "false");
            button.textContent = "Read more";
          }
        }
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        if (i === index) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); });
    });

    // Arrows wrap around, so neither ever sits in a dead state.
    function step(delta) {
      var current = cards.findIndex(function (c) {
        return c.classList.contains("is-active");
      });
      show((current + delta + cards.length) % cards.length);
    }

    var prev = slider.querySelector("[data-review-prev]");
    var next = slider.querySelector("[data-review-next]");

    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });

    cards.forEach(function (card) {
      var button = card.querySelector(".review__more");
      if (!button) return;

      button.addEventListener("click", function () {
        var open = card.classList.toggle("review--open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
        button.textContent = open ? "Read less" : "Read more";
      });
    });

    // "July 2026" in the markup becomes "4 days ago" once JS is confirmed,
    // and keeps ageing correctly instead of being hardcoded.
    var dates = Array.prototype.slice.call(slider.querySelectorAll(".review__date[datetime]"));

    dates.forEach(function (el) {
      var then = new Date(el.getAttribute("datetime") + "T00:00:00");
      if (isNaN(then)) return;

      var days = Math.floor((Date.now() - then.getTime()) / 86400000);
      var n, unit;

      if (days < 0) return;
      else if (days === 0) { el.textContent = "Today"; return; }
      else if (days < 7)   { n = days;                  unit = "day"; }
      else if (days < 31)  { n = Math.floor(days / 7);  unit = "week"; }
      else if (days < 365) { n = Math.floor(days / 30); unit = "month"; }
      else                 { n = Math.floor(days / 365); unit = "year"; }

      el.textContent = n + " " + unit + (n === 1 ? "" : "s") + " ago";
    });
  }

  /* ------------------------------------------------------ Legal contents */
  /* Highlights the section being read. IntersectionObserver only — no scroll
     handler — and the accordion state is left to <details> and CSS. */

  function initToc() {
    var toc = document.querySelector("[data-toc]");
    if (!toc || !("IntersectionObserver" in window)) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute("href")); })
      .filter(Boolean);

    if (!sections.length) return;

    function mark(id) {
      links.forEach(function (link) {
        link.classList.toggle("is-current", link.getAttribute("href") === "#" + id);
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) mark(entry.target.id);
      });
    }, {
      // A band just under the header, so a section becomes current as it
      // reaches the top of the reading area rather than the bottom.
      rootMargin: "-88px 0px -70% 0px",
      threshold: 0
    });

    sections.forEach(function (section) { observer.observe(section); });
    mark(sections[0].id);

    // The accordion is only wanted on narrow screens; above that the summary
    // is hidden by CSS and the panel stays open.
    var narrow = window.matchMedia("(max-width: 860px)");

    function sync() { toc.open = !narrow.matches; }

    sync();
    narrow.addEventListener("change", sync);

    // Tapping a link on mobile closes the accordion behind it.
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        if (narrow.matches) toc.open = false;
      });
    });
  }

  /* --------------------------------------------------- Project preview */
  /* A real scroll container drives the preview, so wheel, trackpad, touch and
     keyboard all work natively. The auto-scroll simply nudges scrollTop; the
     moment the user takes over we get out of the way. */

  function initPreview() {
    var dlg = document.getElementById("preview");
    if (!dlg) return;

    var viewport = dlg.querySelector("[data-viewport]");
    var shot     = dlg.querySelector("[data-shot]");
    var hint     = dlg.querySelector("[data-hint]");
    var similar  = dlg.querySelector("[data-similar]");

    var DOWN = 34000;   // full journey top -> bottom
    var HOLD = 2000;    // rest at the bottom
    var RETURN = 7000;  // eased trip back to the top

    var raf = null, last = 0, phase = "down", holdUntil = 0,
        retStart = 0, retFrom = 0, paused = false, opener = null,
        hoverArmed = false, pos = 0;

    function maxScroll() {
      return viewport.scrollHeight - viewport.clientHeight;
    }

    /* Ease the first and last tenth so the journey starts and stops gently. */
    function ramp(p) {
      return Math.max(0.12, Math.min(1, p / 0.1, (1 - p) / 0.1));
    }

    function tick(ts) {
      if (!last) last = ts;
      var dt = Math.min(64, ts - last);   // clamp so a stalled tab can't jump
      last = ts;

      var max = maxScroll();

      /* While the reader is in control, mirror their position so we can pick
         up from exactly where they left off. */
      if (paused || max <= 4) {
        pos = viewport.scrollTop;
        raf = window.requestAnimationFrame(tick);
        return;
      }

      if (phase === "down") {
        var p = pos / max;
        if (p >= 0.999) {
          phase = "hold";
          holdUntil = ts + HOLD;
        } else {
          pos = Math.min(max, pos + (max / DOWN) * ramp(p) * 1.35 * dt);
          viewport.scrollTop = pos;
        }
      } else if (phase === "hold") {
        if (ts >= holdUntil) {
          phase = "return";
          retStart = ts;
          retFrom = pos;
        }
      } else {
        var t = Math.min(1, (ts - retStart) / RETURN);
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        pos = retFrom * (1 - e);
        viewport.scrollTop = pos;
        if (t >= 1) phase = "down";
      }

      raf = window.requestAnimationFrame(tick);
    }

    function start() {
      if (reduceMotion || raf) return;
      last = 0;
      phase = "down";
      raf = window.requestAnimationFrame(tick);
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    /* Any manual input hands control to the reader and resets the phase, so
       leaving the pointer continues from wherever they stopped. */
    function takeOver() {
      phase = "down";
      last = 0;
      pos = viewport.scrollTop;
    }

    viewport.addEventListener("wheel", takeOver, { passive: true });
    viewport.addEventListener("touchstart", function () {
      paused = true;
      takeOver();
    }, { passive: true });
    viewport.addEventListener("touchend", function () { paused = false; });

    /* Clicking a card usually leaves the cursor sitting over the preview that
       just opened. Pausing on that phantom hover would make the auto-scroll
       look broken, so hover only counts once the pointer genuinely moves. */
    viewport.addEventListener("mousemove", function () {
      hoverArmed = true;
      paused = true;
    });
    viewport.addEventListener("mouseenter", function () {
      if (hoverArmed) paused = true;
    });
    viewport.addEventListener("mouseleave", function () { paused = false; });
    viewport.addEventListener("focus", function () { paused = true; });
    viewport.addEventListener("blur", function () { paused = false; });

    function open(card) {
      opener = card;

      dlg.querySelector("[data-domain]").textContent = card.dataset.domain || "";
      dlg.querySelector("[data-name]").textContent = card.dataset.name || "";
      dlg.querySelector("[data-industry]").textContent = card.dataset.industry || "";
      dlg.querySelector("[data-tech]").textContent = card.dataset.tech || "";

      // Prefills WhatsApp with the project the visitor is actually looking at.
      if (similar) similar.href = WHATSAPP + "?text=" + encodeURIComponent(
        "Hello 201 Web Services \u2014 I've just seen the " +
        (card.dataset.name || "work") +
        " project on your site and I'd like something like it for my business. " +
        "Could we talk about what that would involve?"
      );

      // Full screenshot is fetched only now — the grid never pays for it.
      shot.alt = (card.dataset.name || "Project") + " — full homepage";
      shot.src = card.dataset.full;

      viewport.scrollTop = 0;
      paused = false;
      hoverArmed = false;

      dlg.showModal();
      document.body.classList.add("is-locked");

      var begin = function () {
        viewport.scrollTop = 0;
        pos = 0;
        start();
        if (!reduceMotion && hint) {
          hint.classList.add("is-shown");
          window.setTimeout(function () { hint.classList.remove("is-shown"); }, 3600);
        }
      };

      if (shot.complete && shot.naturalHeight) begin();
      else shot.addEventListener("load", begin, { once: true });
    }

    function close() {
      stop();
      dlg.close();
    }

    document.addEventListener("click", function (e) {
      var card = e.target.closest("[data-preview]");
      if (card) {
        e.preventDefault();
        open(card);
        return;
      }
      if (e.target.closest("[data-close]")) close();
    });

    // Clicking the backdrop closes.
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) close();
    });

    // Covers Escape as well as our own close().
    dlg.addEventListener("close", function () {
      stop();
      shot.removeAttribute("src");
      document.body.classList.remove("is-locked");
      if (opener) opener.focus();
    });
  }

  /* ---------------------------------------------------------- Quote dialog */

  function initQuote() {
    var dialog = document.getElementById("quote");
    var form = document.getElementById("quote-form");
    if (!dialog || !form) return;

    var lastFocused = null;
    var supportsModal = typeof dialog.showModal === "function";

    function open(service) {
      lastFocused = document.activeElement;
      dialog.dataset.state = "";

      // If the CTA named a service, preselect that chip.
      if (service) {
        dialog.querySelectorAll('[data-chipgroup="build"] .chip').forEach(function (chip) {
          chip.setAttribute(
            "aria-pressed",
            String(chip.textContent.trim().toLowerCase() === service.toLowerCase())
          );
        });
      }

      syncBrief();

      if (supportsModal) {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }

      document.body.classList.add("is-locked");

      var first = dialog.querySelector("input");
      if (first) first.focus({ preventScroll: true });
    }

    function close() {
      if (supportsModal) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
      document.body.classList.remove("is-locked");
      if (lastFocused) lastFocused.focus();
    }

    // Any element with [data-quote] opens the dialog.
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-quote]");
      if (trigger) {
        e.preventDefault();
        open(trigger.dataset.service);
        return;
      }
      if (e.target.closest("[data-close]")) close();
    });

    // Click on the backdrop (outside the dialog box) closes it.
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) close();
    });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("is-locked");
    });

    /* --- Live project summary ------------------------------------------
       Every answer is mirrored into the summary card, so the visitor can see
       the brief taking shape instead of guessing what they've told us. */

    var groups = Array.prototype.slice.call(dialog.querySelectorAll("[data-chipgroup]"));
    var statusEl = dialog.querySelector("[data-brief-status]");
    var liveEl = dialog.querySelector("[data-brief-live]");
    var timeline = dialog.querySelector('[data-chipgroup="timeline"]');

    function chosen(group) {
      var radio = group.querySelector("input[type=radio]:checked");
      if (radio) return radio.value;
      var active = group.querySelector('.chip[aria-pressed="true"]');
      return active ? active.textContent.trim() : "";
    }

    function setBrief(el, value, placeholder) {
      if (!el) return;
      el.textContent = value || placeholder;
      el.classList.toggle("brief__pending", !value);
    }

    function syncBrief() {
      groups.forEach(function (group) {
        setBrief(
          dialog.querySelector('[data-brief="' + group.dataset.chipgroup + '"]'),
          chosen(group),
          "Not chosen yet"
        );
      });

      var name  = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var ready = name && email && form.elements.email.checkValidity() && chosen(timeline);

      if (!statusEl) return;
      statusEl.textContent = ready ? "Ready to submit" : "Awaiting details";
      statusEl.classList.toggle("brief__ready", !!ready);
      statusEl.classList.toggle("brief__pending", !ready);
    }

    // Chip groups behave like single-select radio groups.
    groups.forEach(function (group) {
      group.addEventListener("click", function (e) {
        var chip = e.target.closest(".chip");
        if (!chip) return;

        group.querySelectorAll(".chip").forEach(function (c) {
          c.setAttribute("aria-pressed", String(c === chip));
        });

        clearGroupError(group);
        syncBrief();
      });
    });

    // Native radio groups (the investment tiers) report through change.
    form.addEventListener("change", syncBrief);
    form.addEventListener("input", syncBrief);

    /* --- Gentle validation for the required chip group ------------------
       Chips are buttons, so the platform can't mark them required for us. */

    function clearGroupError(group) {
      var wrap = group.closest("[data-required-group]");
      if (!wrap) return;
      wrap.classList.remove("is-missing");
      var msg = wrap.querySelector("[data-group-error]");
      if (msg) msg.hidden = true;
    }

    function flagGroup(group) {
      var wrap = group.closest("[data-required-group]");
      if (!wrap) return;
      wrap.classList.add("is-missing");
      var msg = wrap.querySelector("[data-group-error]");
      if (msg) msg.hidden = false;
      if (liveEl) liveEl.textContent = "One answer left: your project timeline.";
      group.querySelector(".chip").focus();
    }

    syncBrief();

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (timeline && !chosen(timeline)) {
        flagGroup(timeline);
        return;
      }

      if (liveEl) liveEl.textContent = "";

      // --- Wire this up to your endpoint ---------------------------------
      // Collect the answers, then POST to Formspree / Netlify Forms / an API.
      var selected = {};
      groups.forEach(function (group) {
        selected[group.dataset.chipgroup] = chosen(group);
      });

      var payload = Object.assign(
        Object.fromEntries(new FormData(form).entries()),
        selected
      );
      console.info("Quote request:", payload);
      // -------------------------------------------------------------------

      dialog.dataset.state = "sent";
      form.reset();
      if (timeline) {
        timeline.querySelectorAll(".chip").forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        clearGroupError(timeline);
      }
      syncBrief();
    });
  }

  /* ------------------------------------------------------------- Footer yr */

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ Boot */

  function boot() {
    [initHeader, initDrawer, initReveal, initScrollSpy, initFaq, initReviews,
     initToc, initPreview, initQuote, initYear].forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        console.error(fn.name + " failed:", err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
