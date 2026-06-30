const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];
const sectionIds = ["services", "portfolio", "about", "faq", "consultation", "contact"];
const sectionRoutes = ["services", "about", "faq", "consultation", "contact"];
const pathParts = window.location.pathname.split("/").filter(Boolean);
const currentPage = pathParts[pathParts.length - 1] || "home";
let pendingSectionTarget = "";
let pendingSectionTimer = 0;

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

const scrollToSection = (targetId) => {
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
  window.scrollTo({ top, behavior: "smooth" });
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
  const isCleanSectionRoute = url.origin === window.location.origin && sectionRoutes.includes(target);

  if (!isCleanSectionRoute || !document.getElementById(target)) {
    return;
  }

  event.preventDefault();
  history.pushState({ section: target }, "", `/${target}`);
  setActiveNavLink(target);
  scrollToSection(target);
});

const setActiveNavLink = (targetId) => {
  if (!siteNav) {
    return;
  }

  navLinks.forEach((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const linkTarget = getNavTarget(link);
    const isMatch = linkTarget === targetId;

    if (isMatch) {
      const currentType = currentPage === "portfolio" && targetId === "portfolio" && !url.hash
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

    navLinks.forEach((link) => link.removeAttribute("aria-current"));
  };

  updateActiveSection();
  if (sectionRoutes.includes(currentPage)) {
    setActiveNavLink(currentPage);
    window.setTimeout(() => scrollToSection(currentPage), 100);
    window.setTimeout(updateActiveSection, 500);
  } else if (window.location.hash) {
    const hashTarget = window.location.hash.slice(1);

    if (sectionIds.includes(hashTarget)) {
      setActiveNavLink(hashTarget);
      window.setTimeout(updateActiveSection, 250);
    }
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
    updateActiveSection();
  });
};

if (currentPage === "portfolio") {
  setActiveNavLink("portfolio");
} else {
  trackHomepageSections();
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
