const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll("a")) : [];

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const setActiveNavLink = (targetId) => {
  if (!siteNav) {
    return;
  }

  navLinks.forEach((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const linkTarget = url.hash ? url.hash.slice(1) : url.pathname.split("/").pop().replace(".html", "");
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
    const headerOffset = 130;
    const activeSection = sections.reduce((current, section) => {
      const top = section.getBoundingClientRect().top - headerOffset;

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
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
};

const currentPage = window.location.pathname.split("/").pop() || "index.html";

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
