(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* header stuck */
  var hd = document.getElementById("hd");
  var onScroll = function () { hd.classList.toggle("stuck", window.scrollY > 8); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile nav */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var closeNav = function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", function () {
    burger.setAttribute("aria-expanded", String(nav.classList.toggle("open")));
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* reveals — progressive enhancement: content is visible by default; we only
     hide+animate once JS is running, with a hard fallback so nothing can get stuck */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var revealAll = function () { reveals.forEach(function (el) { el.classList.add("in"); }); };
  if (!reduce && reveals.length) {
    document.documentElement.classList.add("anim");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
    /* safety net: reveal everything after 2.5s no matter what */
    setTimeout(revealAll, 2500);
  } else {
    revealAll();
  }

  /* parallax / scrub — nice-to-have, degrades gracefully */
  if (hasGSAP && !reduce) {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    var heroImg = document.getElementById("heroImg");
    if (heroImg) {
      gsap.fromTo(heroImg, { yPercent: -7 }, {
        yPercent: 9, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    document.querySelectorAll(".feature-media img").forEach(function (img) {
      gsap.fromTo(img, { scale: 1.14 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: img.closest(".feature"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* lightbox */
  var tiles = Array.prototype.slice.call(document.querySelectorAll("#grid .tile"));
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var idx = 0;
  var open = function (i) {
    idx = (i + tiles.length) % tiles.length;
    var t = tiles[idx], im = t.querySelector("img");
    lbImg.src = im.src; lbImg.alt = im.alt;
    lbCap.textContent = t.querySelector("figcaption").textContent;
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  var close = function () {
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  tiles.forEach(function (t, i) {
    t.setAttribute("tabindex", "0");
    t.addEventListener("click", function () { open(i); });
    t.addEventListener("keydown", function (e) { if (e.key === "Enter") open(i); });
  });
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { open(idx - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { open(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  window.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") open(idx - 1);
    else if (e.key === "ArrowRight") open(idx + 1);
  });

  /* contact form (no backend: pre-filled e-mail) */
  var form = document.getElementById("cform");
  var note = document.getElementById("fnote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.className = "fnote"; note.textContent = "";
      var d = new FormData(form);
      var name = (d.get("name") || "").toString().trim();
      var email = (d.get("email") || "").toString().trim();
      var msg = (d.get("message") || "").toString().trim();
      if (!name || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.classList.add("err");
        note.textContent = "Merci de renseigner votre nom, un e-mail valide et votre demande.";
        return;
      }
      var body = "Nom : " + name + "\n" +
        "E-mail : " + email + "\n" +
        "Telephone : " + ((d.get("phone") || "").toString().trim() || "-") + "\n" +
        "Vehicule : " + ((d.get("vehicle") || "").toString().trim() || "-") + "\n\n" + msg;
      window.location.href = "mailto:contact@eclatautocentre.fr?subject=" +
        encodeURIComponent("Demande de devis - " + name) + "&body=" + encodeURIComponent(body);
      note.classList.add("ok");
      note.textContent = "Votre messagerie va s'ouvrir avec la demande pre-remplie.";
      form.reset();
    });
  }
})();
