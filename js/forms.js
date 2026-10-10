/* ==========================================================
   Crystal Cliff Schools - forms.js
   Load AFTER config.js and main.js.
   Handles: admission enquiry (4 steps), school visit, contact.
   Messages are sent to the school's WhatsApp (config.js).
   Fallbacks: email, then copy-to-clipboard.
   ========================================================== */
(() => {
  "use strict";

  const S = window.SCHOOL;
  const H = window.SchoolHelpers;
  if (!S || !H) {
    console.error("config.js must be loaded before forms.js");
    return;
  }

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };
  const val = (form, name) => (form.elements[name] ? form.elements[name].value.trim() : "");

  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const phoneOk = (v) => /^\+?\d{7,15}$/.test(v.replace(/[\s\-().]/g, ""));
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const prettyDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  };

  /* ---------- Validation ---------- */
  function validateField(input) {
    const field = input.closest(".field");
    const value = input.value.trim();
    let ok = true;

    if (input.required && !value) {
      ok = false;
    } else if (value) {
      if (input.type === "tel") ok = phoneOk(value);
      else if (input.type === "email") ok = emailOk(value);
      else if (input.type === "number") {
        const n = Number(value);
        const min = input.min !== "" ? Number(input.min) : -Infinity;
        const max = input.max !== "" ? Number(input.max) : Infinity;
        ok = Number.isFinite(n) && n >= min && n <= max;
      } else if (input.type === "date") {
        ok = value >= todayStr();
      }
    }
    if (field) field.classList.toggle("has-error", !ok);
    return ok;
  }

  function validateContainer(container) {
    let first = null;
    $$("input, select, textarea", container).forEach((input) => {
      if (!validateField(input) && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }

  function clearErrorsOnInput(form) {
    const clear = (e) => {
      const field = e.target.closest(".field");
      if (field) field.classList.remove("has-error");
    };
    form.addEventListener("input", clear);
    form.addEventListener("change", clear);
  }

  /* ---------- Delivery (WhatsApp, email, copy) ---------- */
  function buildDelivery(message, subject) {
    const wa = H.whatsappLink(message);
    if (wa) return { type: "whatsapp", href: wa, label: "Open WhatsApp", icon: "message-circle" };

    if (H.hasValue(S.contact.email)) {
      const href = `mailto:${S.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      return { type: "email", href, label: "Open Email", icon: "mail" };
    }
    return { type: "copy", href: "", label: "", icon: "" };
  }

  function launch(d, message) {
    if (d.type === "whatsapp") {
      window.open(d.href, "_blank", "noopener");
    } else if (d.type === "email") {
      window.location.href = d.href;
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message).catch(() => {});
    }
  }

  function successText(d, what) {
    if (d.type === "whatsapp") {
      return `Thank you! Your ${what} is ready. WhatsApp should open so you can send it to the school. If it does not open, tap the button below.`;
    }
    if (d.type === "email") {
      return `Thank you! Your ${what} is ready. Your email app should open so you can send it to the school. If it does not open, tap the button below.`;
    }
    return `Thank you! The school's contact details are not set up on this site yet, so your ${what} was copied. Please send it to the school directly.`;
  }

  function showSuccess({ formEl, successEl, textEl, hideEls = [], text, delivery }) {
    formEl.style.display = "none";
    hideEls.forEach((el) => { if (el) el.style.display = "none"; });
    successEl.classList.add("is-active");
    textEl.textContent = text;

    $$(".js-send-link", successEl).forEach((n) => n.remove());
    if (delivery.href) {
      const a = document.createElement("a");
      a.className = "btn btn-primary js-send-link";
      a.href = delivery.href;
      if (delivery.type === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
      a.style.marginTop = "14px";
      a.innerHTML = `<i data-lucide="${delivery.icon}"></i> ${delivery.label}`;
      textEl.insertAdjacentElement("afterend", a);
    }
    refreshIcons();

    const card = successEl.closest(".form-card") || successEl;
    const y = card.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  /* ==========================================================
     1. ADMISSION ENQUIRY (4 steps)
     ========================================================== */
  function initAdmission() {
    const form = $("#admissionForm");
    if (!form) return;

    const steps = $$(".form-step", form);
    const bars = $$("#admissionProgress span");
    const progress = $("#admissionProgress");
    const last = steps.length - 1;
    let cur = 0;

    /* Fill class dropdown from config.js */
    const select = $("#childLevel");
    if (select) {
      S.admissions.levels.forEach((level) => {
        const o = document.createElement("option");
        o.value = level;
        o.textContent = level;
        select.appendChild(o);
      });
    }

    const scrollToCard = () => {
      const card = form.closest(".form-card");
      const y = card.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    const addRow = (list, label, value) => {
      if (!value) return;
      const li = document.createElement("li");
      const l = document.createElement("span");
      const v = document.createElement("strong");
      l.textContent = label;
      v.textContent = value;
      li.append(l, v);
      list.appendChild(li);
    };

    const buildReview = () => {
      const list = $("#reviewList");
      list.innerHTML = "";
      addRow(list, "Parent or guardian", val(form, "parentName"));
      addRow(list, "Phone", val(form, "parentPhone"));
      addRow(list, "Email", val(form, "parentEmail"));
      addRow(list, "Child", val(form, "childName"));
      addRow(list, "Age", val(form, "childAge"));
      addRow(list, "Class", val(form, "childLevel"));
      addRow(list, "Previous school", val(form, "previousSchool"));
      addRow(list, "Message", val(form, "enquiryMessage"));
    };

    const goTo = (n, scroll = true) => {
      cur = n;
      steps.forEach((s, i) => s.classList.toggle("is-active", i === n));
      bars.forEach((b, i) => b.classList.toggle("is-done", i <= n));
      if (n === last) buildReview();
      if (scroll) scrollToCard();
    };

    const next = () => {
      if (!validateContainer(steps[cur])) return;
      if (cur < last) goTo(cur + 1);
    };

    form.addEventListener("click", (e) => {
      if (e.target.closest("[data-next]")) { e.preventDefault(); next(); }
      else if (e.target.closest("[data-prev]")) { e.preventDefault(); if (cur > 0) goTo(cur - 1); }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      /* Pressing Enter on an early step moves forward instead of sending */
      if (cur < last) { next(); return; }

      /* Re-check the steps that have required fields */
      for (let i = 0; i <= 1; i++) {
        if (!validateContainer(steps[i])) { goTo(i, false); validateContainer(steps[i]); return; }
      }

      const lines = [
        `Hello ${S.name},`,
        "I would like to make an admission enquiry.",
        "",
        `Parent/Guardian: ${val(form, "parentName")}`,
        `Phone: ${val(form, "parentPhone")}`
      ];
      if (val(form, "parentEmail")) lines.push(`Email: ${val(form, "parentEmail")}`);
      lines.push(
        "",
        `Child's name: ${val(form, "childName")}`,
        `Age: ${val(form, "childAge")}`,
        `Class: ${val(form, "childLevel")}`
      );
      if (val(form, "previousSchool")) lines.push(`Previous school: ${val(form, "previousSchool")}`);
      if (val(form, "enquiryMessage")) lines.push("", `Message: ${val(form, "enquiryMessage")}`);

      const message = lines.join("\n");
      const delivery = buildDelivery(message, "Admission enquiry");
      launch(delivery, message);

      showSuccess({
        formEl: form,
        successEl: $("#admissionSuccess"),
        textEl: $("#admissionSuccessText"),
        hideEls: [progress],
        text: successText(delivery, "enquiry"),
        delivery
      });
    });

    clearErrorsOnInput(form);
    goTo(0, false);
  }

  /* ==========================================================
     2. SIMPLE FORMS (school visit, contact)
     ========================================================== */
  function initSimple({ formId, successId, textId, what, subject, build }) {
    const form = $(`#${formId}`);
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateContainer(form)) return;

      const message = build(form);
      const delivery = buildDelivery(message, subject);
      launch(delivery, message);

      showSuccess({
        formEl: form,
        successEl: $(`#${successId}`),
        textEl: $(`#${textId}`),
        text: successText(delivery, what),
        delivery
      });
    });

    clearErrorsOnInput(form);
  }

  function initVisit() {
    const dateInput = $("#visitDate");
    if (dateInput) dateInput.min = todayStr();

    initSimple({
      formId: "visitForm",
      successId: "visitSuccess",
      textId: "visitSuccessText",
      what: "visit request",
      subject: "School visit request",
      build: (f) => [
        `Hello ${S.name},`,
        "I would like to book a school visit.",
        "",
        `Name: ${val(f, "visitName")}`,
        `Phone: ${val(f, "visitPhone")}`,
        `Preferred date: ${prettyDate(val(f, "visitDate"))}`,
        `Preferred time: ${val(f, "visitTime")}`
      ].join("\n")
    });
  }

  function initContact() {
    initSimple({
      formId: "contactForm",
      successId: "contactSuccess",
      textId: "contactSuccessText",
      what: "message",
      subject: "Message from the website",
      build: (f) => {
        const lines = [
          `Hello ${S.name},`,
          "",
          `Name: ${val(f, "contactName")}`,
          `Phone: ${val(f, "contactPhone")}`
        ];
        if (val(f, "contactEmail")) lines.push(`Email: ${val(f, "contactEmail")}`);
        lines.push("", `Message: ${val(f, "contactMessage")}`);
        return lines.join("\n");
      }
    });
  }

  /* ---------- Start ---------- */
  const start = () => { initAdmission(); initVisit(); initContact(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();