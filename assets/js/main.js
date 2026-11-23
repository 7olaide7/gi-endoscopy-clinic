/* ==========================================================================
   G.I. Endoscopy Clinic — Ado-Ekiti
   Interaction layer: navigation, scrollspy, FAQ accordion and appointment
   requests. No dependencies, no data storage. The booking form builds a
   pre-filled WhatsApp message and offers an email fallback.
   ========================================================================== */

(function () {
  "use strict";

  var CLINIC_WHATSAPP = "2348086638538";
  var CLINIC_EMAIL = "giendoscopyclinicadoekiti@gmail.com";
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function localISODate(date) {
    var d = date || new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function formatDate(value) {
    if (!value) return "Not specified";
    var parts = value.split("-");
    if (parts.length !== 3) return value;
    var date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------------------------------
     Sticky header state
     ---------------------------------------------------------------------- */
  var header = $(".site-header");
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------------------- */
  var nav = $("#site-nav");
  var navToggle = $(".nav-toggle");

  if (nav && navToggle) {
    var mobileQuery = window.matchMedia("(max-width: 1024px)");
    nav.setAttribute("aria-hidden", mobileQuery.matches ? "true" : "false");
    var menuIsOpen = function () {
      return navToggle.getAttribute("aria-expanded") === "true";
    };

    var setMenu = function (open) {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (mobileQuery.matches) {
        nav.setAttribute("aria-hidden", open ? "false" : "true");
      } else {
        nav.removeAttribute("aria-hidden");
      }

      var label = navToggle.querySelector(".sr-only");
      if (label) {
        label.textContent = open ? "Close menu" : "Open menu";
      }
    };

    navToggle.addEventListener("click", function () {
      setMenu(!menuIsOpen());
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuIsOpen()) {
        setMenu(false);
        navToggle.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenu(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (
        menuIsOpen() &&
        !nav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setMenu(false);
      }
    });

    var syncNavigationMode = function (event) {
      if (event.matches) {
        setMenu(false);
      } else {
        setMenu(false);
        nav.removeAttribute("aria-hidden");
      }
    };
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncNavigationMode);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncNavigationMode);
    }
  }

  /* ----------------------------------------------------------------------
     Scrollspy for the main navigation
     ---------------------------------------------------------------------- */
  var navLinks = $$(".site-nav__link");
  var navSections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? $(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === id
            );
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    navSections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ----------------------------------------------------------------------
     FAQ accordion
     ---------------------------------------------------------------------- */
  var accordion = $("[data-accordion]");
  if (accordion) {
    var triggers = $$(".accordion__trigger", accordion);

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        triggers.forEach(function (other) {
          if (other === trigger) return;
          other.setAttribute("aria-expanded", "false");
          var otherPanel = document.getElementById(
            other.getAttribute("aria-controls")
          );
          if (otherPanel) otherPanel.hidden = true;
        });

        trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
        var panel = document.getElementById(
          trigger.getAttribute("aria-controls")
        );
        if (panel) panel.hidden = isOpen;
      });
    });
  }

  /* ----------------------------------------------------------------------
     Booking form
     ---------------------------------------------------------------------- */
  var form = $("#booking-form");
  var successPanel = $("#booking-success");
  var successTitle = $("#success-title");
  var successSummary = $("#success-summary");
  var whatsappAgain = $("#whatsapp-again");
  var emailFallback = $("#email-fallback");
  var successEmail = $("#success-email");
  var newRequest = $("#new-request");

  if (form) {
    var fields = {
      name: $("#full-name"),
      phone: $("#phone"),
      email: $("#email"),
      date: $("#preferred-date"),
      service: $("#service"),
      note: $("#note"),
    };

    var today = localISODate();
    if (fields.date) {
      fields.date.min = today;
    }

    var setFieldError = function (field, message) {
      if (!field) return;
      var wrapper = field.closest(".field");
      if (!wrapper) return;
      var error = wrapper.querySelector(".field__error");

      if (message) {
        wrapper.classList.add("has-error");
        field.setAttribute("aria-invalid", "true");
        if (error) error.textContent = message;
      } else {
        wrapper.classList.remove("has-error");
        field.removeAttribute("aria-invalid");
        if (error) error.textContent = "";
      }
    };

    var validateField = function (key) {
      var field = fields[key];
      if (!field) return true;

      var value = field.value.trim();
      var message = "";

      switch (key) {
        case "name":
          if (!value) {
            message = "Please enter your full name.";
          } else if (value.length < 2) {
            message = "Please enter at least two characters.";
          }
          break;

        case "phone":
          var digits = value.replace(/\D/g, "");
          if (!value) {
            message = "Please enter a phone number.";
          } else if (digits.length < 10 || digits.length > 15) {
            message = "Enter a valid number, for example 0803 123 4567.";
          }
          break;

        case "email":
          if (
            value &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
          ) {
            message = "Enter a valid email address, or leave this blank.";
          }
          break;

        case "date":
          if (!value) {
            message = "Please choose a preferred date.";
          } else if (value < today) {
            message = "Please choose today or a future date.";
          }
          break;

        case "service":
          if (!value) {
            message = "Please select the service you need.";
          }
          break;

        default:
          message = "";
      }

      setFieldError(field, message);
      return !message;
    };

    var collectData = function () {
      return {
        name: fields.name ? fields.name.value.trim() : "",
        phone: fields.phone ? fields.phone.value.trim() : "",
        email: fields.email ? fields.email.value.trim() : "",
        service: fields.service ? fields.service.value : "",
        date: fields.date ? fields.date.value : "",
        note: fields.note ? fields.note.value.trim() : "",
      };
    };

    var buildMessage = function (data) {
      var lines = [
        "Hello G.I. Endoscopy Clinic, I would like to request an appointment.",
        "",
        "Name: " + (data.name || "Not provided"),
        "Phone: " + (data.phone || "Not provided"),
        "Email: " + (data.email || "Not provided"),
        "Service: " + (data.service || "Not selected"),
        "Preferred date: " + formatDate(data.date),
        "Note: " + (data.note || "None"),
        "",
        "Please confirm availability. Thank you.",
      ];
      return lines.join("\n");
    };

    var buildWhatsAppUrl = function (data) {
      return (
        "https://wa.me/" +
        CLINIC_WHATSAPP +
        "?text=" +
        encodeURIComponent(buildMessage(data))
      );
    };

    var buildMailtoUrl = function (data) {
      var subject = "Appointment request" + (data.name ? " - " + data.name : "");
      return (
        "mailto:" +
        CLINIC_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(buildMessage(data))
      );
    };

    var renderSummary = function (data) {
      if (!successSummary) return;
      successSummary.replaceChildren();

      var rows = [
        ["Name", data.name],
        ["Phone", data.phone],
        ["Service", data.service],
        ["Preferred date", formatDate(data.date)],
      ];

      if (data.email) {
        rows.splice(2, 0, ["Email", data.email]);
      }

      rows.forEach(function (row) {
        var wrapper = document.createElement("div");
        var term = document.createElement("dt");
        var detail = document.createElement("dd");
        term.textContent = row[0];
        detail.textContent = row[1] || "Not provided";
        wrapper.appendChild(term);
        wrapper.appendChild(detail);
        successSummary.appendChild(wrapper);
      });
    };

    var showSuccess = function (data) {
      var whatsappUrl = buildWhatsAppUrl(data);
      var mailtoUrl = buildMailtoUrl(data);

      if (whatsappAgain) whatsappAgain.href = whatsappUrl;
      if (emailFallback) emailFallback.href = mailtoUrl;
      if (successEmail) successEmail.href = mailtoUrl;

      renderSummary(data);

      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }

      if (successTitle) {
        window.setTimeout(function () {
          successTitle.focus({ preventScroll: true });
        }, prefersReducedMotion ? 0 : 350);
      }

      // Open WhatsApp from the submit gesture. The success panel also offers
      // a link in case the browser blocks the new tab.
      var whatsappWindow = window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );
      if (!whatsappWindow) {
        // Popup blockers commonly prevent scripted new tabs. Continue to the
        // prefilled request in the current tab as a best-effort handoff.
        window.location.assign(whatsappUrl);
      }
    };

    // Live validation: only clear or update an existing error, so the form
    // does not nag while a field is being filled for the first time.
    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field) return;

      var eventName =
        field.tagName === "SELECT" || field.type === "date"
          ? "change"
          : "input";

      field.addEventListener(eventName, function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("has-error")) {
          validateField(key);
        }
      });

      field.addEventListener("blur", function () {
        if (field.value.trim()) validateField(key);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var order = ["name", "phone", "email", "date", "service"];
      var firstInvalid = null;

      order.forEach(function (key) {
        if (!validateField(key) && !firstInvalid) {
          firstInvalid = fields[key];
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
        return;
      }

      showSuccess(collectData());
    });

    if (emailFallback) {
      emailFallback.addEventListener("click", function (event) {
        var data = collectData();
        if (!data.name && !data.service && !data.date) return;
        event.preventDefault();
        var mailtoUrl = buildMailtoUrl(data);
        emailFallback.href = mailtoUrl;
        window.location.href = mailtoUrl;
      });
    }

    if (newRequest) {
      newRequest.addEventListener("click", function () {
        form.reset();
        Object.keys(fields).forEach(function (key) {
          setFieldError(fields[key], "");
        });
        if (fields.date) fields.date.min = localISODate();

        if (successPanel) successPanel.hidden = true;
        form.hidden = false;
        form.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        if (fields.name) {
          window.setTimeout(function () {
            fields.name.focus({ preventScroll: true });
          }, prefersReducedMotion ? 0 : 350);
        }
      });
    }
  }

  /* ----------------------------------------------------------------------
     Service links preselect the booking form
     ---------------------------------------------------------------------- */
  var serviceSelect = $("#service");
  if (serviceSelect) {
    $$("[data-service]").forEach(function (link) {
      link.addEventListener("click", function () {
        var service = link.getAttribute("data-service");
        if (!service) return;
        serviceSelect.value = service;
        serviceSelect.dispatchEvent(new Event("change", { bubbles: true }));

        window.setTimeout(function () {
          var nameField = $("#full-name");
          if (nameField) nameField.focus({ preventScroll: true });
        }, prefersReducedMotion ? 50 : 500);
      });
    });
  }
})();
