/* ==========================================================================
   Error Tracking Utility
   Sentry integration with PII-free configuration
   ========================================================================== */

/**
 * Error Tracking Configuration
 * Privacy-focused error monitoring
 */
const SENTRY_DSN =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_SENTRY_DSN
    ? import.meta.env.VITE_SENTRY_DSN
    : null;

let sentryInitialized = false;

/**
 * Initialize Sentry error tracking
 * Only initializes if SENTRY_DSN is configured
 */
export function initErrorTracking() {
  if (sentryInitialized) {
    return;
  }

  if (!SENTRY_DSN) {
    console.log(
      "[ErrorTracking] Sentry not configured, skipping initialization",
    );
    return;
  }

  // Skip Sentry initialization - package not installed
  // To enable Sentry, install @sentry/browser and uncomment below:
  console.log("[ErrorTracking] Sentry skipped (package not installed)");
  return;

  /*
  // Dynamic import to avoid loading Sentry if not needed
  import("@sentry/browser")
    .then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,

        // Environment
        environment: import.meta.env?.MODE || "production",

        // Privacy settings - NO PII collected
        beforeSend(event) {
          // Remove any potentially identifying information
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
          }
          if (event.user) {
            // Only include anonymous session ID
            event.user = {
              id: getAnonymousSessionId(),
            };
          }
          return event;
        },

        // Don't send IP addresses
        sendDefaultPii: false,

        // Sample rate - adjust based on traffic
        sampleRate: 1.0,

        // Performance monitoring
        tracesSampleRate: 0.1, // 10% of transactions

        // Ignore common non-critical errors
        ignoreErrors: [
          // Network errors
          "Network Error",
          "Failed to fetch",
          "AbortError",
          // Browser extensions
          /chrome-extension/,
          /webkit-masked-url/,
          // Third-party scripts
          /gtag/,
          /analytics/,
          // ResizeObserver loop limit exceeded (common and harmless)
          "ResizeObserver loop limit exceeded",
        ],

        // Deny URLs from extensions and third parties
        denyUrls: [
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          /^moz-extension:\/\//i,
        ],
      });

      sentryInitialized = true;
      console.log("[ErrorTracking] Sentry initialized");

      // Set up global error handler
      setupGlobalErrorHandler(Sentry);
    })
    .catch((error) => {
      console.error("[ErrorTracking] Failed to initialize Sentry:", error);
    });
  */
}

/**
 * Set up global error handler
 * @param {Object} Sentry - Sentry SDK
 */
function setupGlobalErrorHandler(Sentry) {
  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    Sentry.captureException(event.reason);
  });

  // Log initialization
  console.log("[ErrorTracking] Global error handler configured");
}

/**
 * Get or create anonymous session ID
 * @returns {string}
 */
function getAnonymousSessionId() {
  const key = "dsotm-session-id";
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Generate random ID
 * @returns {string}
 */
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Manually capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  // Sentry not installed - log to console only
  console.error("[ErrorTracking] Exception captured:", error, context);
}

/**
 * Capture a message
 * @param {string} message - Message to capture
 * @param {string} level - Log level
 */
export function captureMessage(message, level = "info") {
  // Sentry not installed - log to console only
  console.log(`[ErrorTracking] ${level}:`, message);
}

/**
 * Sanitize context to remove PII
 * @param {Object} context - Context object
 * @returns {Object}
 */
function sanitizeContext(context) {
  if (typeof context !== "object" || context === null) {
    return context;
  }

  const sanitized = {};
  const sensitiveKeys = [
    "email",
    "name",
    "phone",
    "address",
    "password",
    "token",
    "cookie",
  ];

  Object.keys(context).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof context[key] === "object") {
      sanitized[key] = sanitizeContext(context[key]);
    } else {
      sanitized[key] = context[key];
    }
  });

  return sanitized;
}

/**
 * Set user context (anonymous only)
 * @param {Object} user - User context
 */
export function setUser(user) {
  // Sentry not installed - noop
  console.log("[ErrorTracking] User context ignored (Sentry not installed)");
}

export default {
  initErrorTracking,
  captureException,
  captureMessage,
  setUser,
};
