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

  function syncClientBlocks() {
    var selected = document.querySelector('input[name="is_client"]:checked');
    var val = selected ? selected.value : null;
    if (val === "yes") {
      blockClient.removeAttribute("hidden");
      blockProspect.setAttribute("hidden", "");
      document.getElementById("prev-product").setAttribute("required", "");
      clearProspectRadios();
    } else if (val === "no") {
      blockProspect.removeAttribute("hidden");
      blockClient.setAttribute("hidden", "");
      document.getElementById("prev-product").removeAttribute("required");
      clearExistingInvestmentRadios();
    } else {
      blockClient.setAttribute("hidden", "");
      blockProspect.setAttribute("hidden", "");
      document.getElementById("prev-product").removeAttribute("required");
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

  var form = document.getElementById("rsvp-form");
  var status = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) status.textContent = "";

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

      if (status) {
        status.textContent =
          "Thank you — your attendance request has been recorded. Our team will confirm shortly.";
      }
      form.reset();
      syncClientBlocks();
    });
  }

  syncClientBlocks();
})();
