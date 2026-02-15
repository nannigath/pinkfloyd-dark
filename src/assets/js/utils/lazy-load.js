/* ==========================================================================
   Lazy Loading Utility
   Intersection Observer-based lazy loading for images and content
   ========================================================================== */

/**
 * Lazy Loading Configuration
 */
const config = {
  rootMargin: "50px 0px", // Start loading 50px before visible
  threshold: 0.01,
  enableFadeIn: true,
};

let observer = null;

/**
 * Initialize lazy loading
 * Automatically observes elements with data-lazy attribute
 */
export function initLazyLoading() {
  // Check for IntersectionObserver support
  if (!("IntersectionObserver" in window)) {
    console.warn(
      "[LazyLoad] IntersectionObserver not supported, loading all images immediately",
    );
    loadAllLazyElements();
    return;
  }

  // Create observer
  observer = new IntersectionObserver(handleIntersection, {
    rootMargin: config.rootMargin,
    threshold: config.threshold,
  });

  // Observe all lazy elements
  const lazyElements = document.querySelectorAll("[data-lazy]");
  lazyElements.forEach((el) => observer.observe(el));

  console.log(
    `[LazyLoad] Initialized, observing ${lazyElements.length} elements`,
  );
}

/**
 * Handle intersection changes
 * @param {IntersectionObserverEntry[]} entries
 */
function handleIntersection(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadElement(entry.target);
      observer.unobserve(entry.target);
    }
  });
}

/**
 * Load a lazy element
 * @param {Element} element
 */
function loadElement(element) {
  const type = element.dataset.lazy;

  switch (type) {
    case "image":
      loadImage(element);
      break;
    case "bg-image":
      loadBackgroundImage(element);
      break;
    case "content":
      loadContent(element);
      break;
    case "iframe":
      loadIframe(element);
      break;
    default:
      console.warn("[LazyLoad] Unknown lazy type:", type);
  }
}

/**
 * Load lazy image
 * @param {HTMLImageElement} img
 */
function loadImage(img) {
  const src = img.dataset.src;
  const srcset = img.dataset.srcset;
  const sizes = img.dataset.sizes;

  if (!src) {
    console.warn("[LazyLoad] Image missing data-src:", img);
    return;
  }

  // Create new image to preload
  const preloadImg = new Image();

  preloadImg.onload = () => {
    img.src = src;
    if (srcset) img.srcset = srcset;
    if (sizes) img.sizes = sizes;
    img.classList.add("lazy-loaded");
    img.removeAttribute("data-lazy");
    img.removeAttribute("data-src");
    img.removeAttribute("data-srcset");
    img.removeAttribute("data-sizes");

    if (config.enableFadeIn) {
      img.classList.add("fade-in");
    }
  };

  preloadImg.onerror = () => {
    console.error("[LazyLoad] Failed to load image:", src);
    img.classList.add("lazy-error");
    img.dispatchEvent(new CustomEvent("lazyError", { detail: { src } }));
  };

  preloadImg.src = src;
}

/**
 * Load lazy background image
 * @param {Element} element
 */
function loadBackgroundImage(element) {
  const src = element.dataset.src;

  if (!src) {
    console.warn("[LazyLoad] Background image missing data-src:", element);
    return;
  }

  const img = new Image();

  img.onload = () => {
    element.style.backgroundImage = `url(${src})`;
    element.classList.add("lazy-loaded");
    element.removeAttribute("data-lazy");
    element.removeAttribute("data-src");

    if (config.enableFadeIn) {
      element.classList.add("fade-in");
    }
  };

  img.onerror = () => {
    console.error("[LazyLoad] Failed to load background image:", src);
    element.classList.add("lazy-error");
  };

  img.src = src;
}

/**
 * Load lazy content
 * @param {Element} element
 */
async function loadContent(element) {
  const url = element.dataset.src;

  if (!url) {
    console.warn("[LazyLoad] Content missing data-src:", element);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();
    element.innerHTML = content;
    element.classList.add("lazy-loaded");
    element.removeAttribute("data-lazy");
    element.removeAttribute("data-src");

    // Execute any scripts in loaded content
    const scripts = element.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.textContent = script.textContent;
      script.parentNode.replaceChild(newScript, script);
    });

    if (config.enableFadeIn) {
      element.classList.add("fade-in");
    }
  } catch (error) {
    console.error("[LazyLoad] Failed to load content:", error);
    element.classList.add("lazy-error");
  }
}

/**
 * Load lazy iframe
 * @param {HTMLIFrameElement} iframe
 */
function loadIframe(iframe) {
  const src = iframe.dataset.src;

  if (!src) {
    console.warn("[LazyLoad] Iframe missing data-src:", iframe);
    return;
  }

  iframe.src = src;
  iframe.classList.add("lazy-loaded");
  iframe.removeAttribute("data-lazy");
  iframe.removeAttribute("data-src");

  if (config.enableFadeIn) {
    iframe.classList.add("fade-in");
  }
}

/**
 * Load all lazy elements immediately
 * Fallback for browsers without IntersectionObserver
 */
function loadAllLazyElements() {
  const lazyElements = document.querySelectorAll("[data-lazy]");
  lazyElements.forEach((el) => loadElement(el));
}

/**
 * Observe a new element for lazy loading
 * @param {Element} element
 */
export function observeElement(element) {
  if (!observer) {
    console.warn("[LazyLoad] Observer not initialized");
    return;
  }

  if (element.hasAttribute("data-lazy")) {
    observer.observe(element);
  }
}

/**
 * Stop observing an element
 * @param {Element} element
 */
export function unobserveElement(element) {
  if (!observer) return;
  observer.unobserve(element);
}

/**
 * Check if element is in viewport
 * @param {Element} element
 * @returns {boolean}
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Load all elements in viewport immediately
 * Useful for initial page load
 */
export function loadVisibleElements() {
  const lazyElements = document.querySelectorAll("[data-lazy]");
  lazyElements.forEach((el) => {
    if (isInViewport(el)) {
      loadElement(el);
      if (observer) {
        observer.unobserve(el);
      }
    }
  });
}

/**
 * Update configuration
 * @param {Object} newConfig
 */
export function updateConfig(newConfig) {
  Object.assign(config, newConfig);
}

export default {
  initLazyLoading,
  observeElement,
  unobserveElement,
  isInViewport,
  loadVisibleElements,
  updateConfig,
};
