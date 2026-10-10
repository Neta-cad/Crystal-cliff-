/* ==========================================================
   Crystal Cliff Schools - main.js
   Load AFTER config.js (and after the Lucide icons script).
   ========================================================== */
(() => {
  "use strict";

  const S = window.SCHOOL;
  const H = window.SchoolHelpers;
  if (!S || !H) {
    console.error("config.js must be loaded before main.js");
    return;
  }

  /* ---------- Small helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const ready = (fn) =>
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const reduceMotion = window.matchMedia("(prefers-color-scheme: no-preference)") && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const isTruthy = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? v : H.hasValue(v));
  const hide = (el) => { el.hidden = true; el.style.display = "none"; };
  const norm = (p) => (p || "").replace(/\.html$/, "").replace(/\/$/, "") || "index";
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const ssGet = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const ssSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };

  /* ---------- Brand colours and theme ---------- */
  function applyBrand() {
    const r = document.documentElement.style;
    r.setProperty("--primary", S.theme.primary);
    r.setProperty("--primary-dark", S.theme.primaryDark);
    r.setProperty("--navy", S.theme.navy);
    r.setProperty("--gold", S.theme.gold);
    r.setProperty("--light", S.theme.light);
  }

  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    lsSet("cc-theme", t);
    const btn = $(".theme-toggle");
    if (btn) {
      btn.innerHTML = `<i data-lucide="${t === "dark" ? "sun" : "moon"}"></i>`;
      icons();
    }
  }

  /* ---------- Inject shared parts ---------- */
  function injectPreloader() {
    if (ssGet("cc-preloaded")) return null;
    const el = document.createElement("div");
    el.className = "preloader";
    el.innerHTML = `
      <div class="preloader-inner">
        <img class="preloader-logo" src="${S.logo}" alt="${S.name} logo">
        <div class="preloader-text">${S.name}</div>
        <div class="preloader-bar"><span></span></div>
      </div>`;
    document.body.prepend(el);
    ssSet("cc-preloaded", "1");
    return el;
  }

  function injectProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.prepend(bar);
    return bar;
  }

  function injectAnnouncement() {
    if (!S.announcement.enabled || !H.hasValue(S.announcement.text)) return;
    const bar = document.createElement("div");
    bar.className = "announcement";
    bar.textContent = S.announcement.text;
    document.body.prepend(bar);
  }

  function headerHTML() {
    const current = norm(location.pathname.split("/").pop());
    const links = S.nav
      .map((n) => {
        const active = norm(n.href) === current ? " is-active" : "";
        return `<a href="${n.href}" class="${active.trim()}">${n.label}</a>`;
      })
      .join("");
    return `
      <div class="nav-overlay"></div>
      <header class="header" id="header">
        <div class="container nav">
          <a class="brand" href="index.html" aria-label="${S.name} home">
            <img src="${S.logo}" alt="${S.name} logo">
            <span>${S.name}<small>${S.motto}</small></span>
          </a>
          <nav class="nav-links" id="navLinks" aria-label="Main">${links}</nav>
          <div class="nav-actions">
            <button class="icon-btn theme-toggle" type="button" aria-label="Toggle dark mode"><i data-lucide="moon"></i></button>
            <a class="btn btn-primary" href="admissions.html">Enquire Now</a>
            <button class="icon-btn nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
              <i data-lucide="menu" class="icon-open"></i><i data-lucide="x" class="icon-close"></i>
            </button>
          </div>
        </div>
      </header>`;
  }

  function footerHTML() {
    const c = S.contact;
    const lines = [];
    if (H.hasValue(c.address)) lines.push(`<li><i data-lucide="map-pin" class="icon"></i> ${c.address}${H.hasValue(c.city) ? ", " + c.city : ""}</li>`);
    if (H.hasValue(c.phone)) lines.push(`<li><i data-lucide="phone" class="icon"></i> <a href="${H.telLink()}">${c.phone}</a></li>`);
    if (H.hasValue(c.email)) lines.push(`<li><i data-lucide="mail" class="icon"></i> <a href="${H.mailLink()}">${c.email}</a></li>`);
    lines.push(`<li><i data-lucide="clock" class="icon"></i> <span data-open-badge class="open-badge"></span></li>`);

    const socialMap = { facebook: "facebook", instagram: "instagram", x: "twitter", youtube: "youtube" };
    const social = Object.keys(socialMap)
      .filter((k) => H.hasValue(S.social[k]))
      .map((k) => `<a href="${S.social[k]}" target="_blank" rel="noopener" aria-label="${k}"><i data-lucide="${socialMap[k]}"></i></a>`)
      .join("");

    const quick = S.nav.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("");

    return `
      <footer class="footer">
        <div class="container">
          <div class="grid grid-3">
            <div>
              <a class="brand" href="index.html"><img src="${S.logo}" alt="${S.name} logo"><span>${S.name}<small>${S.motto}</small></span></a>
              <p>${S.tagline}</p>
              ${social ? `<div class="social mt-2">${social}</div>` : ""}
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>${quick}</ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>${lines.join("")}</ul>
            </div>
          </div>
          <div class="footer-bottom">&copy; <span id="year"></span> ${S.name}. All rights reserved. &middot; Est. ${S.founded}</div>
        </div>
      </footer>`;
  }

  function replaceSlot(id, html) {
    const slot = document.getElementById(id);
    if (!slot) return;
    slot.insertAdjacentHTML("beforebegin", html);
    slot.remove();
  }

  function injectFloating() {
    if (H.hasValue(S.contact.whatsapp)) {
      const a = document.createElement("a");
      a.className = "whatsapp-float";
      a.href = H.whatsappLink(`Hello ${S.name}, I would like to make an enquiry.`);
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", "Chat on WhatsApp");
      a.innerHTML = '<i data-lucide="message-circle" class="icon"></i>';
      document.body.appendChild(a);
    }
    const top = document.createElement("button");
    top.className = "to-top";
    top.type = "button";
    top.setAttribute("aria-label", "Back to top");
    top.innerHTML = '<i data-lucide="arrow-up"></i>';
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(top);

    const pt = document.createElement("div");
    pt.className = "page-transition";
    document.body.appendChild(pt);
    return { top, pt };
  }

  /* ---------- Data binding from config ---------- */
  function bindConfig() {
    $$("[data-bind]").forEach((el) => {
      const v = getPath(S, el.dataset.bind);
      if (isTruthy(v)) {
        el.textContent = v;
      } else {
        el.textContent = el.dataset.placeholder || "To be added";
        el.classList.add("is-placeholder");
      }
    });

    $$("[data-show-if]").forEach((el) => {
      if (!isTruthy(getPath(S, el.dataset.showIf))) hide(el);
    });

    $$("[data-link]").forEach((el) => {
      const type = el.dataset.link;
      let href = "";
      if (type === "tel") href = H.telLink();
      else if (type === "mail") href = H.mailLink();
      else if (type === "whatsapp") href = H.whatsappLink(el.dataset.waMessage || "");
      else if (type === "directions") href = H.directionsLink();
      else if (type === "maps") href = S.location.mapsLink;
      if (href) {
        el.setAttribute("href", href);
        if (["whatsapp", "directions", "maps"].includes(type)) {
          el.target = "_blank";
          el.rel = "noopener";
        }
      } else {
        hide(el);
      }
    });

    $$("[data-map]").forEach((el) => {
      if (H.hasValue(S.location.mapEmbedUrl)) {
        el.innerHTML = `<iframe src="${S.location.mapEmbedUrl}" title="${S.name} on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
      }
    });

    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Header behaviour ---------- */
  function initHeader() {
    const toggle = $(".nav-toggle");
    const links = $("#navLinks");
    const overlay = $(".nav-overlay");
    if (!toggle || !links) return;

    const setMenu = (open) => {
      links.classList.toggle("is-open", open);
      overlay.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
    overlay.addEventListener("click", () => setMenu(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", () => { if (window.innerWidth >= 960) setMenu(false); });

    const themeBtn = $(".theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setTheme(next);
      });
    }
  }

  /* ---------- Scroll effects ---------- */
  function initScroll(progressBar, floating) {
    const header = $("#header");
    const shapes = $(".hero-shapes");
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (header) header.classList.toggle("is-scrolled", y > 20);
      floating.top.classList.toggle("is-visible", y > 500);
      if (shapes && !reduceMotion && y < window.innerHeight) {
        shapes.style.transform = `translateY(${y * 0.18}px)`;
      }
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((i) => io.observe(i));
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    const els = $$("[data-counter]");
    if (!els.length) return;

    const run = (el) => {
      const raw = el.dataset.counter;
      const target = raw === "years" ? H.yearsSinceFounded() : Number(raw);
      if (!Number.isFinite(target)) return;
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Typing effect ---------- */
  function initTyping() {
    $$("[data-typing]").forEach((el) => {
      const words = (el.dataset.words || "").split("|").map((w) => w.trim()).filter(Boolean);
      if (!words.length) return;
      if (reduceMotion) { el.textContent = words[0]; return; }
      el.classList.add("typing");
      let w = 0, c = 0, deleting = false;
      const tick = () => {
        const word = words[w];
        el.textContent = word.slice(0, c);
        let delay = deleting ? 40 : 80;
        if (!deleting && c === word.length) { deleting = true; delay = 1600; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
        else { c += deleting ? -1 : 1; }
        setTimeout(tick, delay);
      };
      tick();
    });
  }

  /* ---------- Open Now badge ---------- */
  function nowInZone(tz) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      let h = parseInt(get("hour"), 10);
      if (h === 24) h = 0;
      return { day: map[get("weekday")], mins: h * 60 + parseInt(get("minute"), 10) };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function initOpenBadge() {
    const badges = $$("[data-open-badge]");
    if (!badges.length) return;
    const toMins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const fmt = (t) => {
      const [h, m] = t.split(":").map(Number);
      const ap = h >= 12 ? "PM" : "AM";
      return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
    };
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const render = () => {
      const { days, open, close, timezone } = S.hours;
      const now = nowInZone(timezone);
      const isOpen = days.includes(now.day) && now.mins >= toMins(open) && now.mins < toMins(close);
      let text;
      if (isOpen) {
        text = `Open Now \u00b7 closes ${fmt(close)}`;
      } else {
        let next = null;
        for (let i = 0; i < 8; i++) {
          const d = (now.day + i) % 7;
          if (days.includes(d) && (i > 0 || now.mins < toMins(open))) { next = { d, i }; break; }
        }
        text = next
          ? `Closed \u00b7 opens ${next.i === 0 ? "today" : next.i === 1 ? "tomorrow" : names[next.d]} ${fmt(open)}`
          : "Closed";
      }
      badges.forEach((b) => {
        b.classList.toggle("is-open", isOpen);
        b.classList.toggle("is-closed", !isOpen);
        b.textContent = text;
      });
    };
    render();
    setInterval(render, 60000);
  }

  /* ---------- Term countdown ---------- */
  function initCountdown() {
    const box = $("#countdown");
    const section = $("[data-countdown-section]");
    const hideAll = () => { if (section) hide(section); else if (box) hide(box); };
    if (!box) return;
    if (!H.hasValue(S.admissions.nextTermStart)) return hideAll();
    const target = new Date(S.admissions.nextTermStart + "T00:00:00");
    if (isNaN(target)) return hideAll();

    const render = () => {
      const diff = target - new Date();
      if (diff <= 0) { hideAll(); return false; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      box.innerHTML = [["Days", d], ["Hours", h], ["Minutes", m], ["Seconds", s]]
        .map(([l, v]) => `<div class="count-box"><strong>${String(v).padStart(2, "0")}</strong><span>${l}</span></div>`)
        .join("");
      return true;
    };
    if (render()) {
      const id = setInterval(() => { if (!render()) clearInterval(id); }, 1000);
    }
  }

  /* ---------- FAQ accordion + search ---------- */
  function initFAQ() {
    const items = $$(".faq-item");
    if (!items.length) return;
    items.forEach((item) => {
      const q = $(".faq-q", item);
      const a = $(".faq-a", item);
      if (!q || !a) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", String(open));
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      });
    });
    const search = $(".faq-search");
    if (search) {
      search.addEventListener("input", () => {
        const term = search.value.trim().toLowerCase();
        items.forEach((item) => item.classList.toggle("is-hidden", term && !item.textContent.toLowerCase().includes(term)));
      });
    }
  }

  /* ---------- Gallery filters + lightbox ---------- */
  function initGallery() {
    const grid = $(".gallery-grid");
    if (!grid) return;
    const items = $$(".gallery-item", grid);

    $$(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filter-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const f = btn.dataset.filter || "all";
        items.forEach((it) => it.classList.toggle("is-hidden", f !== "all" && it.dataset.category !== f));
      });
    });

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close"><i data-lucide="x"></i></button>
      <button class="lightbox-nav prev" type="button" aria-label="Previous"><i data-lucide="chevron-left"></i></button>
      <img alt="">
      <button class="lightbox-nav next" type="button" aria-label="Next"><i data-lucide="chevron-right"></i></button>
      <div class="lightbox-caption"></div>`;
    document.body.appendChild(lb);
    icons();

    const lbImg = $("img", lb);
    const lbCap = $(".lightbox-caption", lb);
    let list = [];
    let idx = 0;

    const show = () => {
      const img = $("img", list[idx]);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      const cap = $("figcaption", list[idx]);
      lbCap.textContent = cap ? cap.textContent : img.alt;
    };
    const open = (item) => {
      list = items.filter((it) => !it.classList.contains("is-hidden") && $("img", it));
      idx = list.indexOf(item);
      if (idx < 0) return;
      show();
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const close = () => { lb.classList.remove("is-open"); document.body.style.overflow = ""; };
    const move = (n) => { idx = (idx + n + list.length) % list.length; show(); };

    items.forEach((it) => it.addEventListener("click", () => { if ($("img", it)) open(it); }));
    $(".lightbox-close", lb).addEventListener("click", close);
    $(".prev", lb).addEventListener("click", () => move(-1));
    $(".next", lb).addEventListener("click", () => move(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    });
  }

  /* ---------- Testimonial slider ---------- */
  function initSliders() {
    $$(".slider").forEach((slider) => {
      const track = $(".slider-track", slider);
      const slides = $$(".slide", slider);
      if (!track || slides.length < 2) return;
      let i = 0, timer;

      const dots = document.createElement("div");
      dots.className = "slider-dots";
      slides.forEach((_, n) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${n + 1}`);
        b.addEventListener("click", () => { go(n); restart(); });
        dots.appendChild(b);
      });
      slider.appendChild(dots);

      function go(n) {
        i = (n + slides.length) % slides.length;
        track.style.transform = `translateX(-${i * 100}%)`;
        $$("button", dots).forEach((d, k) => d.classList.toggle("is-active", k === i));
      }
      function restart() {
        clearInterval(timer);
        if (!reduceMotion) timer = setInterval(() => go(i + 1), 5500);
      }

      let startX = 0;
      slider.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); restart(); }
      });
      slider.addEventListener("mouseenter", () => clearInterval(timer));
      slider.addEventListener("mouseleave", restart);

      go(0);
      restart();
    });
  }

  /* ---------- Smooth page transitions ---------- */
  function initTransitions(overlay) {
    document.body.classList.add("page-enter");
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      overlay.classList.add("is-active");
      setTimeout(() => { location.href = a.href; }, 380);
    });
    window.addEventListener("pageshow", (e) => { if (e.persisted) overlay.classList.remove("is-active"); });
  }

  /* ---------- Preloader hide ---------- */
  function hidePreloader(el) {
    if (!el) return;
    const started = performance.now();
    const finish = () => {
      const wait = Math.max(0, 900 - (performance.now() - started));
      setTimeout(() => {
        el.classList.add("is-hidden");
        setTimeout(() => el.remove(), 700);
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    setTimeout(() => el.classList.add("is-hidden"), 4000);
  }

  /* ---------- Start ---------- */
  ready(() => {
    applyBrand();
    const preloader = injectPreloader();
    const progress = injectProgress();
    injectAnnouncement();
    replaceSlot("site-header", headerHTML());
    replaceSlot("site-footer", footerHTML());
    const floating = injectFloating();

    setTheme(lsGet("cc-theme") === "dark" ? "dark" : "light");
    bindConfig();
    initHeader();
    initScroll(progress, floating);
    initReveal();
    initCounters();
    initTyping();
    initOpenBadge();
    initCountdown();
    initFAQ();
    initGallery();
    initSliders();
    initTransitions(floating.pt);
    icons();
    hidePreloader(preloader);
  });

  window.addEventListener("load", icons);
  window.Site = { refreshIcons: icons };
})();