const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];
const sectionIds = ["services", "portfolio", "about", "faq", "consultation", "contact", "inquiry"];
const sectionRoutes = ["services", "about", "faq", "consultation", "contact"];
const pathParts = window.location.pathname.split("/").filter(Boolean);
const currentPage = (pathParts[pathParts.length - 1] || "home").replace(".html", "");
let pendingSectionTarget = "";
let pendingSectionTimer = 0;

const heroSection = document.querySelector(".hero, .portfolio-hero, .subpage-hero");

if (heroSection) {
  heroSection.classList.add("is-reveal-ready");
  window.requestAnimationFrame(() => {
    heroSection.classList.add("is-visible");
  });
}

const getNavTarget = (link) => {
  const url = new URL(link.getAttribute("href"), window.location.href);
  const parts = url.pathname.split("/").filter(Boolean);

  if (url.hash) {
    return url.hash.slice(1);
  }

  return (parts[parts.length - 1] || "home").replace(".html", "");
};

const getHeaderOffset = () => {
  const siteHeader = document.querySelector(".site-header");
  const headerHeight = siteHeader ? siteHeader.offsetHeight : 86;

  return headerHeight;
};

const scrollToSection = (targetId, behavior = "smooth") => {
  const section = document.getElementById(targetId);

  if (!section) {
    return;
  }

  pendingSectionTarget = targetId;
  window.clearTimeout(pendingSectionTimer);
  pendingSectionTimer = window.setTimeout(() => {
    pendingSectionTarget = "";
  }, 900);

  const top = window.pageYOffset + section.getBoundingClientRect().top - getHeaderOffset();
  window.scrollTo({ top, behavior });
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;

    if (link) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a") : null;

  if (!link) {
    return;
  }

  const url = new URL(link.getAttribute("href"), window.location.href);
  const target = getNavTarget(link);
  const targetPage = url.pathname.split("/").filter(Boolean).pop() || "home";
  const isCrossPageInquiryLink = url.origin === window.location.origin
    && targetPage === "contact"
    && target === "inquiry"
    && currentPage !== "contact";

  if (isCrossPageInquiryLink) {
    event.preventDefault();
    window.sessionStorage.setItem("pendingScrollTarget", "inquiry");
    window.location.href = "/contact/";
    return;
  }

  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) {
    return;
  }

  const hashTarget = url.hash.slice(1);

  if (!document.getElementById(hashTarget)) {
    return;
  }

  event.preventDefault();
  setActiveNavLink(hashTarget);
  scrollToSection(hashTarget);
});

const setActiveNavLink = (targetId) => {
  if (!siteNav) {
    return;
  }

  const activeTarget = ["consultation", "inquiry"].includes(targetId) ? "contact" : targetId;

  navLinks.forEach((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const linkTarget = getNavTarget(link);
    const isMatch = linkTarget === activeTarget;

    if (isMatch) {
      const currentType = currentPage === "portfolio" && activeTarget === "portfolio" && !url.hash
        ? "page"
        : "location";
      link.setAttribute("aria-current", currentType);
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const trackHomepageSections = () => {
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const updateActiveSection = () => {
    const activationLine = getHeaderOffset();

    if (pendingSectionTarget) {
      setActiveNavLink(pendingSectionTarget);
      return;
    }

    const activeSection = sections.reduce((current, section) => {
      const rect = section.getBoundingClientRect();
      const currentDistance = current
        ? Math.abs(current.getBoundingClientRect().top - activationLine)
        : Infinity;
      const sectionDistance = Math.abs(rect.top - activationLine);

      if (rect.bottom >= activationLine && sectionDistance < currentDistance) {
        return section;
      }

      return current;
    }, null);

    if (activeSection) {
      setActiveNavLink(activeSection.id);
      return;
    }

    if (currentPage === "contact") {
      setActiveNavLink("contact");
      return;
    }

    navLinks.forEach((link) => link.removeAttribute("aria-current"));
  };

  updateActiveSection();
  const storedTarget = window.sessionStorage.getItem("pendingScrollTarget");

  if (storedTarget && sectionIds.includes(storedTarget)) {
    window.sessionStorage.removeItem("pendingScrollTarget");
    setActiveNavLink(storedTarget);
    window.setTimeout(() => {
      scrollToSection(storedTarget, "auto");
      updateActiveSection();
    }, 850);
  } else if (window.location.hash) {
    const hashTarget = window.location.hash.slice(1);

    if (sectionIds.includes(hashTarget)) {
      setActiveNavLink(hashTarget);
      if (hashTarget !== "inquiry") {
        window.setTimeout(() => scrollToSection(hashTarget), 120);
        window.setTimeout(() => scrollToSection(hashTarget), 700);
      }
      window.setTimeout(updateActiveSection, 900);
    }
  } else if (sectionRoutes.includes(currentPage)) {
    setActiveNavLink(currentPage);
    window.setTimeout(() => scrollToSection(currentPage), 100);
    window.setTimeout(updateActiveSection, 500);
  }

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  window.addEventListener("hashchange", () => {
    const hashTarget = window.location.hash.slice(1);

    if (sectionIds.includes(hashTarget)) {
      setActiveNavLink(hashTarget);
      window.setTimeout(updateActiveSection, 250);
    }
  });
  window.addEventListener("popstate", () => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const target = parts[parts.length - 1] || "";

    if (sectionRoutes.includes(target)) {
      setActiveNavLink(target);
      scrollToSection(target);
      return;
    }

    pendingSectionTarget = "";
    window.clearTimeout(pendingSectionTimer);

    if (currentPage === "contact") {
      setActiveNavLink("contact");
      return;
    }

    updateActiveSection();
  });
};

if (currentPage !== "home") {
  setActiveNavLink(currentPage);
}

if (currentPage === "contact") {
  trackHomepageSections();
}

const aboutSection = document.querySelector(".about-section");

if (aboutSection && "IntersectionObserver" in window) {
  aboutSection.classList.add("is-reveal-ready");

  const aboutObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      aboutSection.classList.add("is-visible");
      observer.unobserve(aboutSection);
    });
  }, {
    threshold: 0.05,
    rootMargin: "0px 0px 22% 0px"
  });

  aboutObserver.observe(aboutSection);
} else if (aboutSection) {
  aboutSection.classList.add("is-visible");
}

const revealElements = document.querySelectorAll([
  ".faq-topic-card",
  ".page-cta",
  ".studio-principles-intro",
  ".studio-principles-list article",
  ".best-fit-copy",
  ".best-fit-list article",
  ".about-work-layout .section-heading",
  ".work-step",
  ".contact-bridge-inner",
  ".consultation-copy",
  ".contact-info-card",
  ".contact-info-card .contact-method",
  ".calendar-card",
  ".contact-details",
  ".contact-section .contact-form",
  ".contact-form label",
  ".contact-form button",
  ".intro-band",
  ".featured-websites-section .section-heading",
  ".website-project-card",
  ".concept-work-heading",
  ".concept-card",
  ".home-services-opener",
  ".home-services-opener-points span",
  ".services-section .section-heading",
  "#home .service-card",
  ".portfolio-preview-section .section-heading",
  ".website-reel-card",
  ".portfolio-preview-actions",
  ".featured-project-card",
  ".home-approach-section .section-heading",
  ".home-approach-list article",
  ".services-intro-section .section-heading",
  ".services-intro-section .intro-list li",
  ".cms-grid",
  ".guidance-card",
  ".service-detail-card",
  ".home-final-cta",
  ".next-project-section"
].join(", "));

if (revealElements.length && "IntersectionObserver" in window) {
  revealElements.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    if (element.matches(".home-services-opener-points span")) {
      const pointIndex = Array.from(element.parentElement.children).indexOf(element);
      element.style.setProperty("--reveal-delay", `${120 + pointIndex * 150}ms`);
      return;
    }

    if (element.matches(".contact-info-card .contact-method, .contact-form label")) {
      const itemIndex = Array.from(element.parentElement.children).indexOf(element);
      element.style.setProperty("--reveal-delay", `${100 + itemIndex * 95}ms`);
      return;
    }

    element.style.setProperty("--reveal-delay", `${Math.min(index * 35, 120)}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px 12% 0px"
  });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

document.querySelectorAll(".website-reel-card").forEach((reel) => {
  const previousButton = reel.querySelector("[data-reel-prev]");
  const nextButton = reel.querySelector("[data-reel-next]");

  if (!previousButton || !nextButton) {
    return;
  }

  let activeIndex = 0;

  const showSlide = (direction) => {
    activeIndex = (activeIndex + direction + 2) % 2;
    reel.classList.add("is-manual");
    reel.classList.toggle("is-second", activeIndex === 1);
  };

  previousButton.addEventListener("click", () => showSlide(-1));
  nextButton.addEventListener("click", () => showSlide(1));
});

document.querySelectorAll("[data-current-year]").forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});
