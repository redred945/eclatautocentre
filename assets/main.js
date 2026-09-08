(function () {
  "use strict";
  var docEl = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var anim = !reduce;

  /* ---------- reveals: set up the safety nets FIRST, before anything can throw ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var revealAll = function () { for (var i = 0; i < reveals.length; i++) reveals[i].classList.add("in"); };
  var unlock = function () { docEl.classList.remove("anim"); revealAll(); };

  if (anim && reveals.length) {
    docEl.classList.add("anim");
    setTimeout(revealAll, 1600);                 // time-based net
    window.addEventListener("scroll", function once() {  // interaction net
      revealAll();
      window.removeEventListener("scroll", once);
    }, { passive: true, once: true });
  } else {
    revealAll();
  }
  /* if any later code throws, un-hide everything */
  window.addEventListener("error", unlock);
  setTimeout(function () { window.removeEventListener("error", unlock); }, 8000);

  try {
    var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

    /* year */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    /* header + mobile nav */
    var hd = document.getElementById("hd");
    var burger = document.getElementById("burger");
    var nav = document.getElementById("nav");
    var closeNav = function () { if (nav) nav.classList.remove("open"); if (burger) burger.setAttribute("aria-expanded", "false"); };
    if (burger && nav) {
      burger.addEventListener("click", function () { burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))); });
      nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
    }
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    if (hd) {
      var onScroll = function () { hd.classList.toggle("stuck", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* IntersectionObserver reveals (staggered) — the nice path */
    if (anim && reveals.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }

    /* optional polish: hero image parallax */
    if (hasGSAP && anim) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      var heroImg = document.getElementById("heroImg");
      if (heroImg) window.gsap.fromTo(heroImg, { yPercent: -5, scale: 1.05 }, {
        yPercent: 5, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".hero-shot", start: "top bottom", end: "bottom top", scrub: true }
      });
    }
  } catch (err) {
    unlock();
  }

  /* lightbox */
  var items = Array.prototype.slice.call(document.querySelectorAll("#gtrack .gitem"));
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var idx = 0;
  var open = function (i) {
    idx = (i + items.length) % items.length;
    var it = items[idx], im = it.querySelector("img");
    lbImg.src = im.src; lbImg.alt = im.alt;
    lbCap.textContent = it.querySelector("span").textContent;
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  var close = function () { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
  items.forEach(function (it, i) {
    it.setAttribute("tabindex", "0");
    it.addEventListener("click", function () { open(i); });
    it.addEventListener("keydown", function (e) { if (e.key === "Enter") open(i); });
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

  /* contact form (no backend) */
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
      var body = "Nom : " + name + "\n" + "E-mail : " + email + "\n" +
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
