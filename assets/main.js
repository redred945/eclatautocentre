(function () {
  "use strict";
  var docEl = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var anim = !reduce;
  if (anim) docEl.classList.add("anim");

  /* year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* header + mobile nav */
  var hd = document.getElementById("hd");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var closeNav = function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", function () { burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  var onScroll = function () { hd.classList.toggle("stuck", window.scrollY > 8); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* reveals — progressive enhancement + safety net */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var revealAll = function () { reveals.forEach(function (el) { el.classList.add("in"); }); };
  if (anim && reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
    setTimeout(revealAll, 2600);
  } else { revealAll(); }

  /* optional polish: hero image parallax (degrades gracefully) */
  if (hasGSAP && anim) {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    var heroImg = document.getElementById("heroImg");
    if (heroImg) gsap.fromTo(heroImg, { yPercent: -5, scale: 1.05 }, {
      yPercent: 5, scale: 1, ease: "none",
      scrollTrigger: { trigger: ".hero-shot", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* réalisations : make the horizontal strip feel natural with a mouse */
  var gs = document.getElementById("gscroll");
  if (gs) {
    gs.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = gs.scrollWidth - gs.clientWidth;
      if (max <= 0) return;
      var atStart = gs.scrollLeft <= 0, atEnd = gs.scrollLeft >= max - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return; // let page scroll at edges
      e.preventDefault();
      gs.scrollLeft += e.deltaY;
    }, { passive: false });

    var down = false, sx = 0, sl = 0, moved = false;
    gs.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = gs.scrollLeft; gs.setPointerCapture(e.pointerId);
    });
    gs.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      gs.scrollLeft = sl - dx;
    });
    var up = function () { down = false; };
    gs.addEventListener("pointerup", up);
    gs.addEventListener("pointercancel", up);
    gs._dragMoved = function () { return moved; };
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
    it.addEventListener("click", function () { if (gs && gs._dragMoved && gs._dragMoved()) return; open(i); });
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
