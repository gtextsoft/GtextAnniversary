(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var toggle = document.querySelector(".nav-toggle");
  var shell = document.getElementById("nav-shell");
  var panel = document.getElementById("nav-panel");
  var navDesktopBreakpoint = window.matchMedia("(min-width: 900px)");

  function setMenuOpen(open) {
    if (!toggle || !shell) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      shell.removeAttribute("hidden");
      document.body.classList.add("nav-menu-open");
      var first = panel && panel.querySelector("a");
      if (first && typeof first.focus === "function") {
        window.requestAnimationFrame(function () {
          first.focus({ preventScroll: true });
        });
      }
    } else {
      shell.setAttribute("hidden", "");
      document.body.classList.remove("nav-menu-open");
    }
  }

  function closeMenuIfMobile() {
    if (navDesktopBreakpoint.matches) {
      setMenuOpen(false);
    }
  }

  if (toggle && shell) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    var backdrop = shell.querySelector(".nav-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setMenuOpen(false);
      });
    }

    var closeBtn = panel && panel.querySelector(".nav-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setMenuOpen(false);
        if (toggle && typeof toggle.focus === "function") {
          toggle.focus({ preventScroll: true });
        }
      });
    }

    if (panel) {
      panel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          setMenuOpen(false);
        });
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        toggle.focus({ preventScroll: true });
      }
    });

    if (typeof navDesktopBreakpoint.addEventListener === "function") {
      navDesktopBreakpoint.addEventListener("change", closeMenuIfMobile);
    } else if (typeof navDesktopBreakpoint.addListener === "function") {
      navDesktopBreakpoint.addListener(closeMenuIfMobile);
    }

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) {
        setMenuOpen(false);
      }
    });
  }

  /** Weekly ₦1.5M steps: countdown targets start time, then +7 days until end. Adjust if increments move on a different schedule. */
  var CAMPAIGN_PRICE = {
    start: new Date("2026-05-02T09:00:00+01:00").getTime(),
    end: new Date("2026-06-05T23:59:59+01:00").getTime(),
    weekMs: 7 * 24 * 60 * 60 * 1000,
  };

  function nextPriceIncrementMs(nowMs) {
    var now = nowMs;
    if (now < CAMPAIGN_PRICE.start) return CAMPAIGN_PRICE.start;
    if (now > CAMPAIGN_PRICE.end) return null;
    var elapsed = now - CAMPAIGN_PRICE.start;
    var k = Math.floor(elapsed / CAMPAIGN_PRICE.weekMs) + 1;
    var next = CAMPAIGN_PRICE.start + k * CAMPAIGN_PRICE.weekMs;
    if (next > CAMPAIGN_PRICE.end) return null;
    return next;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatCountdownParts(targetMs) {
    var now = Date.now();
    var diff = targetMs - now;
    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    var sec = Math.floor(diff / 1000);
    var days = Math.floor(sec / 86400);
    sec -= days * 86400;
    var hours = Math.floor(sec / 3600);
    sec -= hours * 3600;
    var minutes = Math.floor(sec / 60);
    var seconds = sec - minutes * 60;
    return { expired: false, days: days, hours: hours, minutes: minutes, seconds: seconds };
  }

  function renderCountdownInto(el, targetMs, emptyLabel) {
    if (!el) return;
    if (targetMs == null) {
      el.textContent = emptyLabel || "Campaign window closed";
      return;
    }
    var p = formatCountdownParts(targetMs);
    if (p.expired) {
      el.textContent = "Now";
      return;
    }
    el.innerHTML =
      '<span class="cd"><strong>' +
      p.days +
      '</strong><small>d</small></span><span class="cd"><strong>' +
      pad2(p.hours) +
      '</strong><small>h</small></span><span class="cd"><strong>' +
      pad2(p.minutes) +
      '</strong><small>m</small></span><span class="cd"><strong>' +
      pad2(p.seconds) +
      '</strong><small>s</small></span>';
  }

  function updateUrgencyLine() {
    var line = document.getElementById("urgency-next-line");
    if (!line) return;
    var next = nextPriceIncrementMs(Date.now());
    if (next == null) {
      if (Date.now() > CAMPAIGN_PRICE.end) {
        line.textContent = "Campaign pricing window ended — speak to an advisor for current inventory.";
      } else {
        line.textContent = "Final pricing phase — confirm your rate before close of campaign.";
      }
      return;
    }
    var d = new Date(next);
    var opts = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" };
    try {
      line.textContent = "Next +₦1.5M boundary: " + d.toLocaleString("en-NG", opts);
    } catch (e) {
      line.textContent = "Next +₦1.5M boundary approaches — lock your price now.";
    }
  }

  function tickCountdowns() {
    var finaleEl = document.getElementById("countdown-finale");
    var targetFinale = finaleEl ? finaleEl.getAttribute("data-countdown-target") : null;
    var finaleMs = targetFinale ? Date.parse(targetFinale) : NaN;
    if (finaleEl && !isNaN(finaleMs)) {
      renderCountdownInto(finaleEl, finaleMs, "Event started");
    }

    var nextPrice = nextPriceIncrementMs(Date.now());
    document.querySelectorAll("[data-price-campaign]").forEach(function (node) {
      renderCountdownInto(node, nextPrice, "—");
    });

    updateUrgencyLine();
  }

  tickCountdowns();
  setInterval(tickCountdowns, 1000);

  var FORMSPREE_ENDPOINT = "https://formspree.io/f/xgoroyak";

  function formspreeErrorMessage(data) {
    if (!data) return "Submit failed.";
    if (typeof data.error === "string" && data.error) return data.error;
    if (data.errors && typeof data.errors === "object") {
      var parts = [];
      Object.keys(data.errors).forEach(function (k) {
        var v = data.errors[k];
        if (typeof v === "string") parts.push(v);
        else if (v && v.message) parts.push(v.message);
      });
      if (parts.length) return parts.join(" ");
    }
    return "Something went wrong. Please try again or contact us directly.";
  }

  var form = document.getElementById("rsvp-form");
  var status = document.getElementById("form-status");
  var successPanel = document.getElementById("rsvp-success");
  var successLead = document.getElementById("rsvp-success-lead");
  var successTitle = document.getElementById("rsvp-success-title");
  var successAnother = document.getElementById("rsvp-success-another");

  var leadOk =
    "Thank you — your registration is submitted. Expect a call or WhatsApp message from our team with the right next step for your interest.";

  if (successAnother && form && successPanel) {
    successAnother.addEventListener("click", function () {
      successPanel.setAttribute("hidden", "");
      form.removeAttribute("hidden");
      form.reset();
      if (status) {
        status.textContent = "";
        status.removeAttribute("data-error");
      }
      var first = document.getElementById("full-name");
      if (first) first.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) {
        status.textContent = "";
        status.removeAttribute("data-error");
      }

      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        return;
      }

      var nameEl = document.getElementById("full-name");
      var phoneEl = document.getElementById("phone");
      var emailEl = document.getElementById("email");
      if (!nameEl || !nameEl.value.trim()) {
        if (status) status.textContent = "Please enter your full name.";
        return;
      }
      if (!phoneEl || !phoneEl.value.trim()) {
        if (status) status.textContent = "Please enter your phone number.";
        return;
      }
      if (!emailEl || !emailEl.value.trim()) {
        if (status) status.textContent = "Please enter your email.";
        return;
      }
      var userType = document.querySelector('input[name="user_type"]:checked');
      if (!userType) {
        if (status) status.textContent = "Please select whether you are a realtor, investor, or buyer.";
        return;
      }
      var focus = document.querySelector('input[name="interest_focus"]:checked');
      if (!focus) {
        if (status) status.textContent = "Please select your primary interest (event, property, or partnership).";
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var fd = new FormData(form);
      fd.append("_subject", "Gtext 18th Anniversary — Registration Hub");

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: response.ok, status: response.status, data: data };
            });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error(formspreeErrorMessage(result.data));
          }
          if (status) {
            status.textContent = "";
            status.removeAttribute("data-error");
          }
          form.reset();
          if (successLead) {
            successLead.textContent = leadOk;
          }
          form.setAttribute("hidden", "");
          if (successPanel) successPanel.removeAttribute("hidden");
          if (successTitle && typeof successTitle.focus === "function") {
            successTitle.focus({ preventScroll: true });
          }
          if (successPanel) {
            var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            successPanel.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "nearest",
            });
          }
        })
        .catch(function (err) {
          if (status) {
            status.textContent = err.message || "Could not send. Please try again.";
            status.setAttribute("data-error", "");
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
