(function () {
  "use strict";

  // Year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Sticky header state
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
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
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeNav();
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Portfolio filter
  var filters = document.querySelectorAll(".filter");
  var shots = document.querySelectorAll("#gallery .shot");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      var f = btn.dataset.filter;
      shots.forEach(function (shot) {
        var show = f === "all" || (shot.dataset.cat || "").indexOf(f) !== -1;
        shot.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Contact form — no backend: compose a pre-filled e-mail.
  // To use a real handler, set form action to a Formspree/Basin endpoint and remove this block.
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      note.className = "form-note";
      note.textContent = "";

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.classList.add("err");
        note.textContent = "Merci de renseigner votre nom, un e-mail valide et votre demande.";
        return;
      }

      var body =
        "Nom : " + name + "\n" +
        "E-mail : " + email + "\n" +
        "Téléphone : " + ((data.get("phone") || "").toString().trim() || "—") + "\n" +
        "Véhicule : " + ((data.get("vehicle") || "").toString().trim() || "—") + "\n\n" +
        message;

      var href =
        "mailto:contact@eclatautocentre.fr" +
        "?subject=" + encodeURIComponent("Demande de devis — " + name) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;
      note.classList.add("ok");
      note.textContent = "Votre logiciel de messagerie va s'ouvrir avec la demande pré-remplie. Sinon, écrivez-nous directement à contact@eclatautocentre.fr.";
      form.reset();
    });
  }
})();
