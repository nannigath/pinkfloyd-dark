/* ==========================================================================
   Analytics Utility
   Privacy-focused analytics with Plausible or Fathom
   Zero PII collection, GDPR/CCPA compliant
   ========================================================================== */

/**
 * Analytics Configuration
 */
const config = {
  // Plausible configuration
  plausibleDomain:
    typeof import.meta !== "undefined" && import.meta.env?.VITE_PLAUSIBLE_DOMAIN
      ? import.meta.env.VITE_PLAUSIBLE_DOMAIN
      : null,

  // Fathom configuration
  fathomSiteId:
    typeof import.meta !== "undefined" && import.meta.env?.VITE_FATHOM_SITE_ID
      ? import.meta.env.VITE_FATHOM_SITE_ID
      : null,

  // Feature flags
  enabled:
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_ENABLE_ANALYTICS !== "false",
  debug:
    typeof import.meta !== "undefined" &&
    import.meta.env?.MODE === "development",
};

let initialized = false;
let analyticsProvider = null;

/**
 * Initialize analytics
 * Auto-detects Plausible or Fathom based on configuration
 */
export function initAnalytics() {
  if (initialized || !config.enabled) {
    return;
  }

  if (config.plausibleDomain) {
    initPlausible();
  } else if (config.fathomSiteId) {
    initFathom();
  } else {
    console.log("[Analytics] No analytics provider configured");
    return;
  }

  initialized = true;

  // Track initial page view
  trackPageView();

  // Set up navigation tracking for SPA
  setupNavigationTracking();
}

/**
 * Initialize Plausible Analytics
 * Privacy-focused, GDPR-compliant, no cookie banner needed
 */
function initPlausible() {
  analyticsProvider = "plausible";

  // Check if script already exists
  if (document.querySelector('script[data-analytics="plausible"]')) {
    return;
  }

  // Create and inject Plausible script
  const script = document.createElement("script");
  script.setAttribute("data-analytics", "plausible");
  script.defer = true;
  script.setAttribute("data-domain", config.plausibleDomain);
  script.src = "https://plausible.io/js/script.js";

  // Handle script loading errors gracefully
  script.onerror = () => {
    console.warn(
      "[Analytics] Plausible script failed to load - analytics disabled",
    );
    initialized = false;
  };

  document.head.appendChild(script);

  if (config.debug) {
    console.log(
      "[Analytics] Plausible initialized for domain:",
      config.plausibleDomain,
    );
  }
}

/**
 * Initialize Fathom Analytics
 * Privacy-focused alternative to Plausible
 */
function initFathom() {
  analyticsProvider = "fathom";

  // Check if script already exists
  if (document.querySelector('script[data-analytics="fathom"]')) {
    return;
  }

  // Create and inject Fathom script
  const script = document.createElement("script");
  script.setAttribute("data-analytics", "fathom");
  script.defer = true;
  script.setAttribute("data-site", config.fathomSiteId);
  script.src = "https://cdn.usefathom.com/script.js";

  script.onerror = () => {
    console.warn(
      "[Analytics] Fathom script failed to load - analytics disabled",
    );
    initialized = false;
  };

  document.head.appendChild(script);

  if (config.debug) {
    console.log(
      "[Analytics] Fathom initialized for site:",
      config.fathomSiteId,
    );
  }
}

/**
 * Track page view
 * @param {string} path - Optional path override
 */
export function trackPageView(path = null) {
  if (!initialized || !config.enabled) {
    if (config.debug) {
      console.log(
        "[Analytics] Page view (debug):",
        path || window.location.pathname,
      );
    }
    return;
  }

  const pagePath = path || window.location.pathname;

  if (analyticsProvider === "plausible") {
    if (window.plausible) {
      window.plausible("pageview", { u: window.location.origin + pagePath });
    }
  } else if (analyticsProvider === "fathom") {
    if (window.fathom) {
      window.fathom.trackPageview({
        url: pagePath,
        referrer: document.referrer,
      });
    }
  }

  if (config.debug) {
    console.log("[Analytics] Tracked page view:", pagePath);
  }
}

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} props - Event properties (no PII!)
 */
export function trackEvent(eventName, props = {}) {
  if (!initialized || !config.enabled) {
    if (config.debug) {
      console.log("[Analytics] Event (debug):", eventName, props);
    }
    return;
  }

  // Sanitize properties to ensure no PII
  const safeProps = sanitizeProperties(props);

  if (analyticsProvider === "plausible") {
    if (window.plausible) {
      window.plausible(eventName, { props: safeProps });
    }
  } else if (analyticsProvider === "fathom") {
    if (window.fathom) {
      window.fathom.trackGoal(eventName, 0);
    }
  }

  if (config.debug) {
    console.log("[Analytics] Tracked event:", eventName, safeProps);
  }
}

/**
 * Track audio playback events
 * @param {string} trackName - Track name
 * @param {string} action - Action type (play, pause, complete)
 */
export function trackAudioEvent(trackName, action) {
  trackEvent("Audio Interaction", {
    track: trackName,
    action: action,
  });
}

/**
 * Track gallery interactions
 * @param {string} imageName - Image name
 * @param {string} action - Action type (view, zoom, navigate)
 */
export function trackGalleryEvent(imageName, action) {
  trackEvent("Gallery Interaction", {
    image: imageName,
    action: action,
  });
}

/**
 * Track theme changes
 * @param {string} theme - Theme name
 */
export function trackThemeChange(theme) {
  trackEvent("Theme Change", {
    theme: theme,
  });
}

/**
 * Track quiz completion
 * @param {string} result - Quiz result/track match
 */
export function trackQuizComplete(result) {
  trackEvent("Quiz Complete", {
    result: result,
  });
}

/**
 * Set up navigation tracking for SPA
 */
function setupNavigationTracking() {
  // Track navigation clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.href && link.href.startsWith(window.location.origin)) {
      const path = new URL(link.href).pathname;
      if (path !== window.location.pathname) {
        // Will be tracked on next page load
      }
    }
  });

  // Track hash changes (section navigation)
  window.addEventListener("hashchange", () => {
    trackPageView(window.location.pathname + window.location.hash);
  });
}

/**
 * Sanitize event properties to remove PII
 * @param {Object} props - Properties object
 * @returns {Object}
 */
function sanitizeProperties(props) {
  if (typeof props !== "object" || props === null) {
    return {};
  }

  const sanitized = {};
  const sensitivePatterns = [
    /email/i,
    /name/i,
    /phone/i,
    /address/i,
    /password/i,
    /token/i,
    /cookie/i,
    /session/i,
    /ip/i,
    /id/i,
  ];

  Object.keys(props).forEach((key) => {
    const isSensitive = sensitivePatterns.some((pattern) => pattern.test(key));

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof props[key] === "object") {
      sanitized[key] = sanitizeProperties(props[key]);
    } else {
      sanitized[key] = props[key];
    }
  });

  return sanitized;
}

/**
 * Check if analytics is initialized
 * @returns {boolean}
 */
export function isAnalyticsInitialized() {
  return initialized;
}

/**
 * Get current analytics provider
 * @returns {string|null}
 */
export function getAnalyticsProvider() {
  return analyticsProvider;
}

/**
 * Disable analytics (for user preference)
 */
export function disableAnalytics() {
  initialized = false;
  config.enabled = false;
  console.log("[Analytics] Analytics disabled");
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackAudioEvent,
  trackGalleryEvent,
  trackThemeChange,
  trackQuizComplete,
  isAnalyticsInitialized,
  getAnalyticsProvider,
  disableAnalytics,
};
