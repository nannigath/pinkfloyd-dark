/* ==========================================================================
   Accessibility Utilities Module
   Focus management, ARIA helpers, and a11y enhancements
   ========================================================================== */

/**
 * Set focus to an element safely
 * @param {HTMLElement} element - Element to focus
 * @param {boolean} [preventScroll=false] - Whether to prevent scrolling
 */
function setFocus(element, preventScroll = false) {
  if (!element) return;
  
  // Make element focusable if needed
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
  
  element.focus({ preventScroll });
}

/**
 * Trap focus within a modal or container
 * @param {HTMLElement} container - Container element
 * @returns {Function} Function to remove the trap
 */
function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} [priority='polite'] - Announcement priority
 */
function announce(message, priority = 'polite') {
  // Create or get existing announcer
  let announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }
  
  // Set aria-live priority
  announcer.setAttribute('aria-live', priority);
  
  // Clear and set new message
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Generate unique ID for ARIA relationships
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
function generateId(prefix = 'a11y') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set ARIA attributes for expandable/collapsible content
 * @param {HTMLElement} trigger - Trigger element (button)
 * @param {HTMLElement} content - Content element
 * @param {boolean} isExpanded - Current expanded state
 */
function setExpandableAttributes(trigger, content, isExpanded) {
  const contentId = content.id || generateId('content');
  content.id = contentId;
  
  trigger.setAttribute('aria-expanded', isExpanded.toString());
  trigger.setAttribute('aria-controls', contentId);
  content.setAttribute('aria-hidden', (!isExpanded).toString());
}

/**
 * Toggle expandable content with proper ARIA
 * @param {HTMLElement} trigger - Trigger element
 * @param {HTMLElement} content - Content element
 * @returns {boolean} New expanded state
 */
function toggleExpandable(trigger, content) {
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
  const newState = !isExpanded;
  
  trigger.setAttribute('aria-expanded', newState.toString());
  content.setAttribute('aria-hidden', (!newState).toString());
  
  if (newState) {
    content.hidden = false;
  } else {
    content.hidden = true;
  }
  
  return newState;
}

/**
 * Set up keyboard navigation for a list
 * @param {HTMLElement} list - List container
 * @param {string} itemSelector - Selector for list items
 */
function setupKeyboardNavigation(list, itemSelector = '[role="listitem"], li') {
  const items = Array.from(list.querySelectorAll(itemSelector));
  
  list.addEventListener('keydown', (e) => {
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
    }
    
    if (nextIndex !== currentIndex) {
      items[nextIndex].focus();
    }
  });
  
  // Make items focusable
  items.forEach(item => {
    if (!item.hasAttribute('tabindex')) {
      item.setAttribute('tabindex', '-1');
    }
  });
}

/**
 * Skip to main content link handler
 */
function setupSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      setFocus(mainContent);
    });
  }
}

/**
 * Check if element is visible (for focus management)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
function isVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

/**
 * Get first visible focusable element in container
 * @param {HTMLElement} container - Container to search
 * @returns {HTMLElement|null}
 */
function getFirstFocusable(container) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  for (const element of focusable) {
    if (isVisible(element)) {
      return element;
    }
  }
  
  return null;
}

/**
 * Create ARIA label for icon-only buttons
 * @param {HTMLElement} button - Button element
 * @param {string} label - Accessible label
 */
function setIconButtonLabel(button, label) {
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
}

/**
 * Set current page in navigation
 * @param {string} pageId - ID of current page/section
 */
function setCurrentPage(pageId) {
  // Remove current from all nav items
  document.querySelectorAll('[role="navigation"] a, nav a').forEach(link => {
    link.removeAttribute('aria-current');
    link.classList.remove('active');
  });
  
  // Set current on matching item
  const currentLink = document.querySelector(`[data-page="${pageId}"], a[href="#${pageId}"]`);
  if (currentLink) {
    currentLink.setAttribute('aria-current', 'page');
    currentLink.classList.add('active');
  }
}

/**
 * Initialize all accessibility enhancements
 */
function initAccessibility() {
  setupSkipLink();
  console.log('[A11y] Accessibility utilities initialized');
}

// Accessibility API exports
export const a11y = {
  setFocus,
  trapFocus,
  announce,
  generateId,
  setExpandableAttributes,
  toggleExpandable,
  setupKeyboardNavigation,
  setupSkipLink,
  isVisible,
  getFirstFocusable,
  setIconButtonLabel,
  setCurrentPage,
  initAccessibility
};

export default a11y;
