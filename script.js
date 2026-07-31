/* ===========================
   ARJ Portfolio - script.js
   =========================== */

// ===== LOADER =====

(function () {
  const loader = document.getElementById("loader");
  if (!loader) return;

  function getNavigationType() {
    // Modern API
    const entries =
      performance.getEntriesByType &&
      performance.getEntriesByType("navigation");
    if (entries && entries.length) return entries[0].type; // 'navigate' | 'reload' | 'back_forward' | 'prerender'
    // Legacy fallback
    if (performance.navigation) {
      const legacyMap = { 0: "navigate", 1: "reload", 2: "back_forward" };
      return legacyMap[performance.navigation.type] || "navigate";
    }
    return "navigate";
  }

  function shouldShowLoader() {
    const navType = getNavigationType();

    // Explicit browser refresh (F5 / Ctrl+R) always shows the loader
    if (navType === "reload") {
      sessionStorage.setItem("arj-visited", "1");
      return true;
    }

    // Back/forward navigation between already-visited pages: instant, no loader
    if (navType === "back_forward") return false;

    // Regular navigation: only show the loader if this is the very first
    // page loaded in this browser tab/session. Every internal link click
    // after that is a normal 'navigate' too, but the session flag will
    // already be set, so it's skipped.
    if (!sessionStorage.getItem("arj-visited")) {
      sessionStorage.setItem("arj-visited", "1");
      return true;
    }

    return false;
  }

  function revealHero() {
    document
      .querySelectorAll(".hero-left, .hero-right")
      .forEach((el) => el.classList.add("in"));
  }

  if (shouldShowLoader()) {
    // Fresh load: run the existing loader animation, unchanged
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("hide");
        setTimeout(() => {
          loader.style.display = "none";
        }, 700);
        revealHero();
      }, 1600);
    });
  } else {
    // Internal navigation: skip the loader entirely, instant page transition
    loader.style.display = "none";
    revealHero();
  }
})();

// ===== THEME TOGGLE =====
const htmlEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");

function setTheme(dark) {
  if (dark) {
    htmlEl.classList.add("dark");
    htmlEl.classList.remove("light");
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
  } else {
    htmlEl.classList.remove("dark");
    htmlEl.classList.add("light");
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
  }
  localStorage.setItem("arj-theme", dark ? "dark" : "light");
}

// Load saved theme
const saved = localStorage.getItem("arj-theme");
setTheme(saved !== "light");

themeToggle.addEventListener("click", () => {
  const isDark = htmlEl.classList.contains("dark");
  setTheme(!isDark);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById("navbar");
const navInner = navbar.querySelector(".nav-inner");

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 30) {
      navInner.classList.add("scrolled");
    } else {
      navInner.classList.remove("scrolled");
    }
    updateActiveNav();
  },
  { passive: true },
);

// ===== MOBILE MENU =====
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuBtn.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open);
});

// Close mobile menu on link click
mobileMenu.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn.classList.remove("open");
  });
});

// ===== ACTIVE NAV LINK =====
const sections = ["home", "about", "skills", "projects", "services", "contact"];
function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  let current = "home";
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });
  document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
    link.classList.toggle("active", link.dataset.section === current);
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  });
});

// ===== TYPING EFFECT =====
const roles = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Problem Solver",
];
let rIdx = 0,
  cIdx = 0,
  deleting = false;
const typingEl = document.getElementById("typingText");

function type() {
  if (!typingEl) return;
  const word = roles[rIdx];
  if (!deleting) {
    typingEl.textContent = word.slice(0, cIdx + 1);
    cIdx++;
    if (cIdx === word.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typingEl.textContent = word.slice(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
    }
  }
  setTimeout(type, deleting ? 50 : 80);
}
setTimeout(type, 1800);

// ===== EDUCATION MODAL =====
function openEdu() {
  const modal = document.getElementById("educationModal");
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeEdu() {
  const modal = document.getElementById("educationModal");
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

["educationBtn", "educationBtnMobile", "educationBtnFooter"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", openEdu);
});

document.getElementById("closeEdu").addEventListener("click", closeEdu);
document.querySelector(".edu-backdrop").addEventListener("click", closeEdu);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeEdu();
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
);

document
  .querySelectorAll(".reveal-up, .reveal-left, .reveal-right")
  .forEach((el) => {
    revealObserver.observe(el);
  });

// ===== SKILL BARS =====
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
          const w = bar.dataset.w;
          setTimeout(() => {
            bar.style.width = w + "%";
          }, 300);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 },
);

document
  .querySelectorAll(".skill-category")
  .forEach((el) => skillObserver.observe(el));

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.ceil(target / 30);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current >= target) clearInterval(timer);
        }, 50);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 },
);

document
  .querySelectorAll("[data-count]")
  .forEach((el) => counterObserver.observe(el));

// ===== CONTACT FORM =====
emailjs.init("_08qm8xNzP2MNgZVs");

const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const name = document.getElementById("fname");
    const email = document.getElementById("femail");
    const subject = document.getElementById("fsubject");
    const message = document.getElementById("fmessage");

    let valid = true;

    function validate(input, errId, test) {
      const err = document.getElementById(errId);
      if (!test) {
        err.classList.remove("hidden");
        err.classList.add("show");
        input.style.borderColor = "#f87171";
        valid = false;
      } else {
        err.classList.add("hidden");
        err.classList.remove("show");
        input.style.borderColor = "";
      }
    }

    validate(name, "fnameErr", name.value.trim().length > 0);
    validate(
      email,
      "femailErr",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
    );
    validate(subject, "fsubjectErr", subject.value.trim().length > 0);
    validate(message, "fmessageErr", message.value.trim().length > 0);

    if (valid) {
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      emailjs
        .send("service_sxbgwxd", "template_sx2bcub", {
          name: name.value,
          message: message.value,
          time: new Date().toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          email: email.value,
          subject: subject.value,
        })
        .then(() => {
          document.getElementById("formContent").classList.add("hidden");
          document.getElementById("formSuccess").classList.remove("hidden");
        })
        .catch((error) => {
          console.error("EmailJS error:", error);
          submitBtn.textContent = "Send Message";
          submitBtn.disabled = false;
          alert(
            "Failed to send. Please email me directly at jayedrjp@gmail.com",
          );
        });
    }
  });
}

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll(".magnetic-btn").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transition = "transform 0.15s ease-out";
  });
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
    btn.style.transform = "";
  });
});

// ===== 3D CARD TILT =====
document
  .querySelectorAll(".project-card, .service-card, .stat-card")
  .forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.4s ease";
      setTimeout(() => {
        card.style.transition = "";
      }, 400);
    });
  });

// ===== REDUCE MOTION =====
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll('[style*="animation"]').forEach((el) => {
    el.style.animation = "none";
  });
}

// ===== BACK TO TOP =====
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Init nav state
updateActiveNav();
