/* ==========================================================================
   DOM Utilities Module
   Element creation, event delegation, and DOM manipulation helpers
   ========================================================================== */

/**
 * Create an element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} [attrs={}] - Attributes to set
 * @param {Array} [children=[]] - Child elements or text
 * @returns {HTMLElement} Created element
 */
function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });
  
  return element;
}

/**
 * Select a single element
 * @param {string} selector - CSS selector
 * @param {HTMLElement} [context=document] - Context element
 * @returns {HTMLElement|null}
 */
function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Select multiple elements
 * @param {string} selector - CSS selector
 * @param {HTMLElement} [context=document] - Context element
 * @returns {Array<HTMLElement>}
 */
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Set up event delegation
 * @param {HTMLElement} container - Container element
 * @param {string} selector - Target selector
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 */
function delegate(container, selector, eventType, handler) {
  container.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && container.contains(target)) {
      handler.call(target, e, target);
    }
  });
}

/**
 * Remove all children from an element
 * @param {HTMLElement} element - Element to clear
 */
function empty(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Insert HTML after a reference element
 * @param {HTMLElement} reference - Reference element
 * @param {string} html - HTML to insert
 */
function insertAfter(reference, html) {
  reference.insertAdjacentHTML('afterend', html);
}

/**
 * Insert HTML before a reference element
 * @param {HTMLElement} reference - Reference element
 * @param {string} html - HTML to insert
 */
function insertBefore(reference, html) {
  reference.insertAdjacentHTML('beforebegin', html);
}

/**
 * Replace an element with HTML
 * @param {HTMLElement} element - Element to replace
 * @param {string} html - HTML to insert
 */
function replaceWith(element, html) {
  element.insertAdjacentHTML('beforebegin', html);
  element.parentNode.removeChild(element);
}

/**
 * Check if element has a class
 * @param {HTMLElement} element - Element to check
 * @param {string} className - Class name
 * @returns {boolean}
 */
function hasClass(element, className) {
  return element.classList.contains(className);
}

/**
 * Add class to element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to add
 */
function addClass(element, className) {
  element.classList.add(className);
}

/**
 * Remove class from element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to remove
 */
function removeClass(element, className) {
  element.classList.remove(className);
}

/**
 * Toggle class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to toggle
 * @param {boolean} [force] - Force add or remove
 * @returns {boolean} New state
 */
function toggleClass(element, className, force) {
  return element.classList.toggle(className, force);
}

/**
 * Get/set data attribute
 * @param {HTMLElement} element - Target element
 * @param {string} key - Data key
 * @param {*} [value] - Value to set (omit to get)
 * @returns {string|undefined} Data value if getting
 */
function data(element, key, value) {
  if (value === undefined) {
    return element.dataset[key];
  }
  element.dataset[key] = value;
}

/**
 * Execute callback when DOM is ready
 * @param {Function} callback - Callback function
 */
function ready(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Parse HTML string to DOM elements
 * @param {string} html - HTML string
 * @returns {DocumentFragment}
 */
function parseHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

/**
 * Get closest ancestor matching selector
 * @param {HTMLElement} element - Starting element
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
function closest(element, selector) {
  return element.closest(selector);
}

/**
 * Check if element matches selector
 * @param {HTMLElement} element - Element to check
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
function matches(element, selector) {
  return element.matches(selector);
}

// DOM API exports
export const dom = {
  createElement,
  $,
  $$,
  delegate,
  empty,
  insertAfter,
  insertBefore,
  replaceWith,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  data,
  ready,
  throttle,
  debounce,
  parseHTML,
  closest,
  matches
};

export default dom;
