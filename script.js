const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];
const currentPage = window.location.pathname.split("/").pop() || "index.html";

const getNavTarget = (link) => {
  const url = new URL(link.getAttribute("href"), window.location.href);

  if (url.hash) {
    return url.hash.slice(1);
  }

  return url.pathname.split("/").pop().replace(".html", "");
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

      const url = new URL(link.getAttribute("href"), window.location.href);
      const isSamePageHash = url.hash && url.pathname === window.location.pathname;

      if (isSamePageHash) {
        setActiveNavLink(url.hash.slice(1));
      }
    }
  });
}

const setActiveNavLink = (targetId) => {
  if (!siteNav) {
    return;
  }

  navLinks.forEach((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const linkTarget = getNavTarget(link);
    const isMatch = linkTarget === targetId;

    if (isMatch) {
      const currentType = currentPage === "portfolio.html" && targetId === "portfolio" && !url.hash
        ? "page"
        : "location";
      link.setAttribute("aria-current", currentType);
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const trackHomepageSections = () => {
  const sectionIds = ["services", "portfolio", "about", "faq", "consultation", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const updateActiveSection = () => {
    const siteHeader = document.querySelector(".site-header");
    const headerHeight = siteHeader ? siteHeader.offsetHeight : 86;
    const activationLine = headerHeight + 12;
    const activeSection = sections.reduce((current, section) => {
      const top = section.getBoundingClientRect().top - activationLine;

      if (top <= 0) {
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
  if (window.location.hash) {
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
};

if (currentPage === "portfolio.html") {
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
