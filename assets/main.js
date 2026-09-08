(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var gsap = window.gsap;
  if (!hasGSAP) document.documentElement.classList.add("no-gsap");

  /* ---------- Year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Sticky header ---------- */
  var header = document.getElementById("siteHeader");
  var setStuck = function () { header.classList.toggle("is-stuck", window.scrollY > 8); };
  setStuck();
  window.addEventListener("scroll", setStuck, { passive: true });

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  var closeNav = function () {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
  };
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduceMotion) {
    lenis = new window.Lenis({ duration: 1.05, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
  }
  var scrollToEl = function (el, offset) {
    if (!el) return;
    var off = offset || -80;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.1 });
    else {
      var top = el.getBoundingClientRect().top + window.pageYOffset + off;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  /* smooth-scroll on same-page anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      scrollToEl(target, -80);
    });
  });

  /* ---------- Reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(window.ScrollTrigger);
    reveals.forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: .7, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ============ Interactive exploded car ============ */
  var car = document.getElementById("car");
  if (car) {
    var panels = Array.prototype.slice.call(car.querySelectorAll(".panel"));
    var tagWrap = document.getElementById("tags");
    var tags = Array.prototype.slice.call(tagWrap.querySelectorAll(".tag"));
    var btn = document.getElementById("explodeBtn");
    var hint = document.getElementById("heroHint");
    var exploded = false;
    var FACTOR = 1;          // full explode multiplier
    var HOVER = 0.5;         // hover peek multiplier

    var vec = function (p) { return { x: parseFloat(p.dataset.dx) || 0, y: parseFloat(p.dataset.dy) || 0 }; };
    var tagFor = function (part) { return tags.filter(function (t) { return t.dataset.for === part; })[0]; };
    var cardFor = function (p) { return document.getElementById(p.dataset.target); };

    var move = function (p, mult, dur) {
      var v = vec(p);
      if (hasGSAP) gsap.to(p, { x: v.x * mult, y: v.y * mult, duration: dur == null ? .5 : dur, ease: "power3.out", overwrite: "auto" });
      else p.style.transform = "translate(" + (v.x * mult) + "px," + (v.y * mult) + "px)";
    };

    /* hover peek (only when not fully exploded) */
    panels.forEach(function (p) {
      var part = p.dataset.part;
      var enter = function () {
        if (exploded) return;
        car.classList.add("dimmed");
        p.classList.add("is-hot");
        move(p, HOVER);
        var tg = tagFor(part); if (tg) tg.classList.add("show");
      };
      var leave = function () {
        if (exploded) return;
        car.classList.remove("dimmed");
        p.classList.remove("is-hot");
        move(p, 0);
        var tg = tagFor(part); if (tg) tg.classList.remove("show");
      };
      p.addEventListener("mouseenter", enter);
      p.addEventListener("mouseleave", leave);
      p.addEventListener("focus", enter);
      p.addEventListener("blur", leave);

      var go = function () {
        var card = cardFor(p);
        scrollToEl(card, -90);
        flash(card);
      };
      p.addEventListener("click", go);
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });

    tags.forEach(function (t) {
      t.addEventListener("click", function () {
        var card = document.getElementById(t.dataset.target);
        scrollToEl(card, -90);
        flash(card);
      });
    });

    var flash = function (card) {
      if (!card) return;
      card.classList.add("is-flash");
      setTimeout(function () { card.classList.remove("is-flash"); }, 1400);
    };

    /* full explode toggle */
    var setExploded = function (state) {
      exploded = state;
      btn.setAttribute("aria-pressed", String(state));
      btn.querySelector(".eb-label").textContent = state ? "Réassembler" : "Vue éclatée";
      car.classList.toggle("is-exploded", state);
      car.classList.remove("dimmed");
      if (hint) hint.style.opacity = state ? "0" : "";

      if (hasGSAP) {
        var tl = gsap.timeline({ defaults: { ease: state ? "power3.out" : "power3.inOut" } });
        panels.forEach(function (p, i) {
          var v = vec(p);
          tl.to(p, { x: state ? v.x * FACTOR : 0, y: state ? v.y * FACTOR : 0, duration: state ? .7 : .5 }, i * 0.05);
        });
      } else {
        panels.forEach(function (p) { move(p, state ? FACTOR : 0, 0); });
      }
      panels.forEach(function (p) { p.classList.toggle("is-hot", state); });
      tagWrap.classList.toggle("show", state);
    };
    btn.addEventListener("click", function () { setExploded(!exploded); });

    /* intro: draw the sweep + gentle idle float */
    if (hasGSAP && !reduceMotion) {
      var sweep = car.querySelector(".car-sweep");
      if (sweep) gsap.to(sweep, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: .3 });

      gsap.to(car, { y: "+=10", duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true });

      if (window.ScrollTrigger) {
        gsap.to(".hero-stage", {
          yPercent: 14, ease: "none",
          scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
        });
        /* auto-assemble hint: subtle parallax on chassis */
        gsap.to(car.querySelector(".chassis"), {
          xPercent: -3, ease: "none",
          scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
        });
      }
    }
  }

  /* ---------- Portfolio filter ---------- */
  var filters = document.querySelectorAll(".filter");
  var shots = document.querySelectorAll("#gallery .shot");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      filters.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      var f = b.dataset.filter;
      shots.forEach(function (s) {
        var show = f === "all" || (s.dataset.cat || "").indexOf(f) !== -1;
        s.classList.toggle("is-hidden", !show);
      });
      if (hasGSAP && window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* ---------- Contact form (no backend: pre-filled e-mail) ---------- */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.className = "form-note";
      note.textContent = "";
      var d = new FormData(form);
      var name = (d.get("name") || "").toString().trim();
      var email = (d.get("email") || "").toString().trim();
      var message = (d.get("message") || "").toString().trim();
      if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.classList.add("err");
        note.textContent = "Merci de renseigner votre nom, un e-mail valide et votre demande.";
        return;
      }
      var body =
        "Nom : " + name + "\n" +
        "E-mail : " + email + "\n" +
        "Telephone : " + ((d.get("phone") || "").toString().trim() || "-") + "\n" +
        "Vehicule : " + ((d.get("vehicle") || "").toString().trim() || "-") + "\n\n" +
        message;
      window.location.href = "mailto:contact@eclatautocentre.fr?subject=" +
        encodeURIComponent("Demande de devis - " + name) + "&body=" + encodeURIComponent(body);
      note.classList.add("ok");
      note.textContent = "Votre logiciel de messagerie va s'ouvrir avec la demande pre-remplie.";
      form.reset();
    });
  }
})();
