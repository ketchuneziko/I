// «Ғаламтор» — сайт логикасы
(function () {
  "use strict";

  /* ---------- Жыл ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Хедер фоны ---------- */
  var header = document.getElementById("header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Мобильді мәзір ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Мәзірді ашу");
    document.body.classList.remove("nav-open");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Мәзірді жабу" : "Мәзірді ашу");
      document.body.classList.toggle("nav-open", isOpen);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeNav();
    });
  }

  /* ---------- Секциялардың пайда болуы ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = Math.min(i * 70, 280);
          setTimeout(function () {
            el.classList.add("in");
          }, delay);
          io.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Жылдамдық есептегіші ---------- */
  var speedNum = document.getElementById("speedNum");
  var speedBar = document.querySelector(".speed-bar span");

  function runSpeed() {
    if (!speedNum) return;
    var target = 940;
    var start = null;
    var dur = 1700;

    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      speedNum.textContent = Math.round(target * eased).toLocaleString("kk-KZ");
      if (p < 1) requestAnimationFrame(tick);
      else speedNum.textContent = target.toLocaleString("kk-KZ");
    }
    requestAnimationFrame(tick);
    if (speedBar) speedBar.style.width = "88%";
  }

  if ("IntersectionObserver" in window && speedNum) {
    var swo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runSpeed();
            swo.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    swo.observe(speedNum);
  } else {
    runSpeed();
  }

  /* ---------- Тарифті таңдау → формаға өту ---------- */
  var planSelect = document.getElementById("plan");
  document.querySelectorAll("[data-plan]").forEach(function (link) {
    link.addEventListener("click", function () {
      var plan = link.getAttribute("data-plan");
      if (!planSelect) return;
      Array.prototype.forEach.call(planSelect.options, function (opt) {
        if (opt.value === plan || opt.textContent === plan) planSelect.selectedIndex = opt.index;
      });
    });
  });

  /* ---------- Форма валидациясы ---------- */
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");

  function setError(field, message) {
    var box = document.querySelector('[data-error-for="' + field.id + '"]');
    if (!box) return;
    if (message) {
      box.textContent = message;
      box.classList.add("show");
      field.classList.add("invalid");
      field.setAttribute("aria-invalid", "true");
    } else {
      box.textContent = "";
      box.classList.remove("show");
      field.classList.remove("invalid");
      field.removeAttribute("aria-invalid");
    }
  }

  function validateName() {
    var name = document.getElementById("name");
    if (!name) return true;
    var v = name.value.trim();
    if (v.length < 2) {
      setError(name, "Атыңызды кемінде 2 әріппен жазыңыз.");
      return false;
    }
    setError(name, "");
    return true;
  }

  function validatePhone() {
    var phone = document.getElementById("phone");
    if (!phone) return true;
    var digits = phone.value.replace(/\D/g, "");
    if (digits.length < 10) {
      setError(phone, "Телефон нөмірі толық емес. Мысалы: +7 701 123 45 67.");
      return false;
    }
    setError(phone, "");
    return true;
  }

  function formatPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    var out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += " " + digits.slice(7, 9);
    if (digits.length >= 9) out += " " + digits.slice(9, 11);
    return out;
  }

  if (form) {
    var phoneInput = document.getElementById("phone");
    var nameInput = document.getElementById("name");

    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        var pos = phoneInput.value.length;
        phoneInput.value = formatPhone(phoneInput.value);
        if (phoneInput.value.length < pos) phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
        if (document.querySelector('[data-error-for="phone"]').classList.contains("show")) validatePhone();
      });
    }

    if (nameInput) {
      nameInput.addEventListener("input", function () {
        if (document.querySelector('[data-error-for="name"]').classList.contains("show")) validateName();
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var okName = validateName();
      var okPhone = validatePhone();

      if (!okName) { nameInput.focus(); return; }
      if (!okPhone) { phoneInput.focus(); return; }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Жіберілуде...";

      // Демо: серверге жіберуді осы жерде қосуға болады
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = original;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        form.reset();
        setTimeout(function () { if (success) success.hidden = true; }, 7000);
      }, 900);
    });
  }
})();
