(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var toggle = document.querySelector(".nav-toggle");
  var panel = document.getElementById("nav-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      if (open) {
        panel.setAttribute("hidden", "");
      } else {
        panel.removeAttribute("hidden");
      }
    });
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        panel.setAttribute("hidden", "");
      });
    });
  }

  var clientRadios = document.querySelectorAll('input[name="is_client"]');
  var blockClient = document.getElementById("block-client");
  var blockProspect = document.getElementById("block-prospect");

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

  function setContainerInputsDisabled(container, disabled) {
    if (!container) return;
    container.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.disabled = !!disabled;
    });
  }

  function syncClientBlocks() {
    var selected = document.querySelector('input[name="is_client"]:checked');
    var val = selected ? selected.value : null;
    if (val === "yes") {
      blockClient.removeAttribute("hidden");
      blockProspect.setAttribute("hidden", "");
      setContainerInputsDisabled(blockClient, false);
      setContainerInputsDisabled(blockProspect, true);
      clearProspectRadios();
    } else if (val === "no") {
      blockProspect.removeAttribute("hidden");
      blockClient.setAttribute("hidden", "");
      setContainerInputsDisabled(blockProspect, false);
      setContainerInputsDisabled(blockClient, true);
      clearExistingInvestmentRadios();
    } else {
      blockClient.setAttribute("hidden", "");
      blockProspect.setAttribute("hidden", "");
      setContainerInputsDisabled(blockClient, true);
      setContainerInputsDisabled(blockProspect, true);
    }
  }

  function clearProspectRadios() {
    ["opportunity", "budget", "timeline"].forEach(function (name) {
      document.querySelectorAll('input[name="' + name + '"]').forEach(function (r) {
        r.checked = false;
      });
    });
    var otherText = document.getElementById("opp-other-text");
    if (otherText) otherText.value = "";
  }

  function clearExistingInvestmentRadios() {
    document.querySelectorAll('input[name="investment_existing"]').forEach(function (r) {
      r.checked = false;
    });
    var prev = document.getElementById("prev-product");
    if (prev) prev.value = "";
  }

  clientRadios.forEach(function (radio) {
    radio.addEventListener("change", syncClientBlocks);
  });

  var oppOtherRadio = document.getElementById("opp-other-radio");
  var oppOtherText = document.getElementById("opp-other-text");
  if (oppOtherRadio && oppOtherText) {
    oppOtherText.addEventListener("focus", function () {
      oppOtherRadio.checked = true;
    });
  }

  var attendanceRadios = document.querySelectorAll('input[name="attendance_mode"]');
  var attendanceVirtualHint = document.getElementById("attendance-virtual-hint");
  function syncAttendanceHint() {
    var sel = document.querySelector('input[name="attendance_mode"]:checked');
    if (attendanceVirtualHint) {
      if (sel && sel.value === "virtual") {
        attendanceVirtualHint.removeAttribute("hidden");
      } else {
        attendanceVirtualHint.setAttribute("hidden", "");
      }
    }
  }
  attendanceRadios.forEach(function (r) {
    r.addEventListener("change", syncAttendanceHint);
  });

  var form = document.getElementById("rsvp-form");
  var status = document.getElementById("form-status");
  var successPanel = document.getElementById("rsvp-success");
  var successLead = document.getElementById("rsvp-success-lead");
  var successTitle = document.getElementById("rsvp-success-title");
  var successAnother = document.getElementById("rsvp-success-another");

  var leadPhysical =
    "Thank you. Your in-person seat request is recorded — our team will follow up to confirm your attendance and share venue details.";
  var leadVirtual =
    "Thank you for choosing virtual attendance. We will send you a link by email or WhatsApp to complete your online registration and access the session.";

  if (successAnother && form && successPanel) {
    successAnother.addEventListener("click", function () {
      successPanel.setAttribute("hidden", "");
      form.removeAttribute("hidden");
      form.reset();
      syncClientBlocks();
      syncAttendanceHint();
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

      var mode = document.querySelector('input[name="attendance_mode"]:checked');
      if (!mode) {
        if (status) status.textContent = "Please choose your mode of attendance — physical or virtual.";
        return;
      }

      var isClient = document.querySelector('input[name="is_client"]:checked');
      if (!isClient) {
        if (status) status.textContent = "Please indicate whether you are an existing client.";
        return;
      }

      if (isClient.value === "yes") {
        var inv = document.querySelector('input[name="investment_existing"]:checked');
        if (!inv) {
          if (status) status.textContent = "Please select your approximate investment value.";
          return;
        }
      }

      if (isClient.value === "no") {
        var opp = document.querySelector('input[name="opportunity"]:checked');
        if (!opp) {
          if (status) status.textContent = "Please select an opportunity you are interested in.";
          return;
        }
        if (opp.value === "other" && !oppOtherText.value.trim()) {
          if (status) status.textContent = "Please specify your other area of interest.";
          return;
        }
        var bud = document.querySelector('input[name="budget"]:checked');
        if (!bud) {
          if (status) status.textContent = "Please select your estimated budget.";
          return;
        }
        var time = document.querySelector('input[name="timeline"]:checked');
        if (!time) {
          if (status) status.textContent = "Please select how soon you are looking to invest.";
          return;
        }
      }

      syncClientBlocks();

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var fd = new FormData(form);
      fd.append("_subject", "Gtext Homes — 18th Anniversary RSVP");

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
          syncClientBlocks();
          syncAttendanceHint();
          if (successLead) {
            successLead.textContent = mode.value === "virtual" ? leadVirtual : leadPhysical;
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
            status.textContent = err.message || "Could not send your RSVP. Please try again.";
            status.setAttribute("data-error", "");
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  syncClientBlocks();
  syncAttendanceHint();
})();
