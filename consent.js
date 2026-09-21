(function () {
  "use strict";

  const measurementId = "G-EDNH4Q0WNF";
  const storageKey = "cashWebStudioAnalyticsConsent";
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  const readConsent = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const saveConsent = (choice) => {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // The choice will apply for this page view if storage is unavailable.
    }
  };

  const loadAnalytics = () => {
    if (analyticsLoaded || document.querySelector('script[data-google-analytics="true"]')) {
      return;
    }

    analyticsLoaded = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.dataset.googleAnalytics = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  };

  const clearAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    cookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.cashwebstudio.com; SameSite=Lax`;
    });
  };

  const setAnalyticsConsent = (choice) => {
    saveConsent(choice);

    if (choice === "accepted") {
      loadAnalytics();
      return;
    }

    window.gtag("consent", "update", { analytics_storage: "denied" });
    clearAnalyticsCookies();
  };

  const renderConsentControls = () => {
    const banner = document.createElement("section");
    banner.className = "cookie-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.hidden = true;
    banner.innerHTML = `
      <div class="cookie-consent__copy">
        <strong>Choose your cookie preference</strong>
        <p>We use optional analytics cookies to understand how visitors use this site. You can change your choice anytime through Cookie settings.</p>
      </div>
      <div class="cookie-consent__actions">
        <button class="cookie-consent__button cookie-consent__button--reject" type="button" data-cookie-reject>Reject</button>
        <button class="cookie-consent__button cookie-consent__button--accept" type="button" data-cookie-accept>Accept</button>
      </div>
    `;

    const settingsButton = document.createElement("button");
    settingsButton.className = "cookie-settings-button";
    settingsButton.type = "button";
    settingsButton.textContent = "Cookie settings";
    settingsButton.hidden = true;

    const siteFooter = document.querySelector(".site-footer");
    const settingsContainer = siteFooter || document.createElement("footer");
    const usesFallbackFooter = !siteFooter;

    if (usesFallbackFooter) {
      settingsContainer.className = "cookie-settings-footer";
      settingsContainer.hidden = true;
      document.body.appendChild(settingsContainer);
    }

    settingsContainer.appendChild(settingsButton);

    const setSettingsVisibility = (isVisible) => {
      settingsButton.hidden = !isVisible;

      if (usesFallbackFooter) {
        settingsContainer.hidden = !isVisible;
      }
    };

    const showBanner = () => {
      banner.hidden = false;
      setSettingsVisibility(false);
    };

    const hideBanner = () => {
      banner.hidden = true;
      setSettingsVisibility(true);
    };

    banner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
      setAnalyticsConsent("accepted");
      hideBanner();
    });

    banner.querySelector("[data-cookie-reject]").addEventListener("click", () => {
      setAnalyticsConsent("rejected");
      hideBanner();
    });

    settingsButton.addEventListener("click", showBanner);
    document.body.appendChild(banner);

    if (readConsent()) {
      setSettingsVisibility(true);
    } else {
      showBanner();
    }
  };

  if (readConsent() === "accepted") {
    loadAnalytics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderConsentControls);
  } else {
    renderConsentControls();
  }
})();
