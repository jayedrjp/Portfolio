/* ===========================
   ARJ Portfolio - script.js
   =========================== */

// ===== LOADER =====

(function () {
  const loader = document.getElementById("loader");
  if (!loader) return;

  function getNavigationType() {
    const entries =
      performance.getEntriesByType &&
      performance.getEntriesByType("navigation");
    if (entries && entries.length) return entries[0].type;
    if (performance.navigation) {
      const legacyMap = { 0: "navigate", 1: "reload", 2: "back_forward" };
      return legacyMap[performance.navigation.type] || "navigate";
    }
    return "navigate";
  }

  function shouldShowLoader() {
    const navType = getNavigationType();

    if (navType === "reload") {
      sessionStorage.setItem("arj-visited", "1");
      return true;
    }

    if (navType === "back_forward") return false;

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

  if (!shouldShowLoader()) {
    loader.style.display = "none";
    revealHero();
    return;
  }

  // Animation timeline breakdown from assets/portfolio-loader.svg (dur = 6s):
  // 1. 0s to 0.208s (keyTime 0.034722): Idle initial delay
  // 2. 0.208s to 2.500s (keyTime 0.416667): "HELLO" stroke drawing animation (reaches "99 1")
  // 3. 2.500s to 3.108s (keyTime 0.518056): Path 'd' finishes settling into final shape
  // 4. 3.108s to 4.158s (keyTime 0.693056): Complete "HELLO" text is fully rendered and static
  // 5. 4.158s to 5.750s: Stroke undraws (erasing)
  // Target duration to complete the full "HELLO" text/logo animation: ~3108ms
  let svgAnimDuration = 3108; // ms

  const loaderImg = loader.querySelector(".loader-svg, img");
  const loaderSvg = loader.querySelector("svg");

  // Attempt to parse dynamic duration if SVG is inspectable
  if (loaderSvg) {
    try {
      const dAnim = loaderSvg.querySelector('animate[attributeName="d"]');
      const durAttr = dAnim ? dAnim.getAttribute("dur") : null;
      const keyTimesAttr = dAnim ? dAnim.getAttribute("keyTimes") : null;
      if (durAttr && keyTimesAttr) {
        const durSec = parseFloat(durAttr);
        const times = keyTimesAttr.split(";").map((t) => parseFloat(t.trim()));
        if (durSec > 0 && times.length >= 3 && !isNaN(times[2])) {
          svgAnimDuration = Math.round(times[2] * durSec * 1000);
        }
      }
    } catch (_) {}
  } else if (loaderImg && loaderImg.src && window.fetch) {
    fetch(loaderImg.src)
      .then((res) => (res.ok ? res.text() : ""))
      .then((svgText) => {
        if (!svgText) return;
        const durMatch = svgText.match(/dur="(\d+(?:\.\d+)?)(s|ms)"/);
        const dMatch = svgText.match(/attributeName="d"[^>]*keyTimes="([^"]+)"/);
        if (durMatch && dMatch) {
          const totalMs = parseFloat(durMatch[1]) * (durMatch[2] === "s" ? 1000 : 1);
          const times = dMatch[1].split(";").map((t) => parseFloat(t.trim()));
          if (times.length >= 3 && !isNaN(times[2])) {
            svgAnimDuration = Math.round(times[2] * totalMs);
          }
        }
      })
      .catch(() => {});
  }

  // Determine when the SVG animation started
  let animStartTime = 0;
  function getAnimStartTime() {
    if (window.performance && performance.getEntriesByName && loaderImg && loaderImg.src) {
      const entries = performance.getEntriesByName(loaderImg.src);
      if (entries.length && entries[0].responseEnd > 0) {
        return entries[0].responseEnd;
      }
    }
    return 0;
  }

  if (loaderImg && !loaderImg.complete) {
    loaderImg.addEventListener("load", () => {
      animStartTime = performance.now();
    });
  } else {
    animStartTime = getAnimStartTime();
  }

  let pageLoaded = document.readyState === "complete";
  if (!pageLoaded) {
    window.addEventListener("load", () => {
      pageLoaded = true;
    });
  }

  let dismissed = false;
  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;

    // Pause SVG if inline to keep "HELLO" visibly frozen during fade-out
    if (loaderSvg && typeof loaderSvg.pauseAnimations === "function") {
      loaderSvg.pauseAnimations();
    }

    // Start smooth fade-out
    loader.classList.add("hide");
    revealHero();

    const onTransitionEnd = () => {
      loader.style.display = "none";
      loader.removeEventListener("transitionend", onTransitionEnd);
    };

    loader.addEventListener("transitionend", onTransitionEnd);
    // Fallback in case transitionend does not fire or is interrupted
    setTimeout(onTransitionEnd, 700);
  }

  function checkSync() {
    if (dismissed) return;

    let animElapsed = 0;
    if (loaderSvg && typeof loaderSvg.getCurrentTime === "function") {
      animElapsed = loaderSvg.getCurrentTime() * 1000;
    } else {
      const now = performance.now();
      animElapsed = now - animStartTime;
    }

    // Must wait for both:
    // 1. Page main content to be loaded
    // 2. The entire "HELLO" animation to complete
    if (pageLoaded && animElapsed >= svgAnimDuration) {
      dismissLoader();
    } else {
      requestAnimationFrame(checkSync);
    }
  }

  requestAnimationFrame(checkSync);
})();

// ===== THEME TOGGLE =====
const htmlEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");

function setTheme(dark) {
  htmlEl.style.colorScheme = dark ? "dark" : "light";

  if (dark) {
    htmlEl.classList.add("dark");
    htmlEl.classList.remove("light");
    if (sunIcon) sunIcon.classList.add("hidden");
    if (moonIcon) moonIcon.classList.remove("hidden");
  } else {
    htmlEl.classList.remove("dark");
    htmlEl.classList.add("light");
    if (moonIcon) moonIcon.classList.add("hidden");
    if (sunIcon) sunIcon.classList.remove("hidden");
  }

  localStorage.setItem("arj-theme", dark ? "dark" : "light");
}

const saved = localStorage.getItem("arj-theme");
setTheme(saved === "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = htmlEl.classList.contains("dark");
    setTheme(!isDark);
  });
}

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
function scrollToElement(target) {
  if (!target) return;
  const navbarHeight = 80;
  const targetPosition =
    target.getBoundingClientRect().top + window.scrollY - navbarHeight;
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: "smooth",
  });
}

// Handle all link clicks for in-page smooth scrolling across all pages
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href === "#") return;

  // Check if link points to an anchor on the current page
  let targetId = null;
  if (href.startsWith("#")) {
    targetId = href.slice(1);
  } else {
    try {
      const url = new URL(link.href, window.location.href);
      const currentPath = window.location.pathname.replace(/\/$/, "");
      const linkPath = url.pathname.replace(/\/$/, "");
      if (
        url.hash &&
        url.origin === window.location.origin &&
        (linkPath === currentPath ||
          linkPath.endsWith("/" + currentPath.split("/").pop()))
      ) {
        targetId = url.hash.slice(1);
      }
    } catch (_) {}
  }

  if (targetId) {
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();

      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains("open")) {
        mobileMenu.classList.remove("open");
        if (menuBtn) menuBtn.classList.remove("open");
      }

      scrollToElement(targetEl);

      if (history.pushState) {
        history.pushState(null, "", "#" + targetId);
      }
    }
  }
});

// Scroll indicator on hero
const scrollIndicator = document.querySelector(".scroll-indicator");
if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const nextSection =
      document.getElementById("about") ||
      document.querySelector("section:nth-of-type(2)");
    if (nextSection) {
      scrollToElement(nextSection);
    }
  });
}

// Handle smooth scroll on initial load if URL has an anchor hash
if (window.location.hash) {
  const initialHash = window.location.hash.slice(1);
  const initialTarget = document.getElementById(initialHash);
  if (initialTarget) {
    setTimeout(() => {
      scrollToElement(initialTarget);
    }, 400);
  }
}

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
