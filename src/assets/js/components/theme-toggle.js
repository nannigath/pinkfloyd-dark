/* ==========================================================================
   Theme Toggle Component
   Light/Dark mode toggle with instant visual feedback and persistence
   ========================================================================== */

import { storage } from "../utils/storage.js";

/**
 * Theme Toggle Component
 * Manages theme switching with accessibility support
 */
class ThemeToggle {
  constructor() {
    this.button = null;
    this.currentTheme = "light";
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.init();
  }

  /**
   * Initialize the theme toggle
   */
  init() {
    // Find the toggle button
    this.button = document.getElementById("theme-toggle");
    if (!this.button) {
      console.warn("[ThemeToggle] Button not found");
      return;
    }

    // Load saved theme or use system preference
    this.loadTheme();

    // Bind click handler
    this.button.addEventListener("click", () => this.toggleTheme());

    // Listen for system preference changes
    this.mediaQuery.addEventListener("change", (e) =>
      this.handleSystemChange(e),
    );

    // Add keyboard support
    this.button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    console.log("[ThemeToggle] Initialized");
  }

  /**
   * Load and apply saved theme preference
   */
  loadTheme() {
    const savedTheme = storage.getPreference("themeMode", "system");

    if (savedTheme === "system") {
      // Use system preference
      const isDark = this.mediaQuery.matches;
      this.applyTheme(isDark ? "dark" : "light");
      this.currentTheme = "system";
    } else {
      // Use saved preference
      this.applyTheme(savedTheme);
      this.currentTheme = savedTheme;
    }

    this.updateButtonLabel();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];

    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   * @param {string} theme - 'light', 'dark', or 'system'
   */
  setTheme(theme) {
    if (!["light", "dark", "system"].includes(theme)) {
      console.error("[ThemeToggle] Invalid theme:", theme);
      return;
    }

    this.currentTheme = theme;

    // Save preference
    storage.setPreference("themeMode", theme);

    // Apply theme
    if (theme === "system") {
      const isDark = this.mediaQuery.matches;
      this.applyTheme(isDark ? "dark" : "light");
    } else {
      this.applyTheme(theme);
    }

    this.updateButtonLabel();

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { theme, currentTheme: this.getEffectiveTheme() },
      }),
    );

    console.log("[ThemeToggle] Theme set to:", theme);
  }

  /**
   * Apply theme to document
   * @param {string} effectiveTheme - 'light' or 'dark'
   */
  applyTheme(effectiveTheme) {
    document.documentElement.setAttribute("data-theme", effectiveTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content =
        effectiveTheme === "dark" ? "#2E3239" : "#E0E5EC";
    }

    console.log("[ThemeToggle] Applied theme:", effectiveTheme);
  }

  /**
   * Handle system preference changes
   * @param {MediaQueryListEvent} e
   */
  handleSystemChange(e) {
    if (this.currentTheme === "system") {
      const newTheme = e.matches ? "dark" : "light";
      this.applyTheme(newTheme);
      console.log("[ThemeToggle] System theme changed:", newTheme);
    }
  }

  /**
   * Get the effective theme (light or dark)
   * @returns {string}
   */
  getEffectiveTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  /**
   * Update button accessibility label
   */
  updateButtonLabel() {
    if (!this.button) return;

    const effectiveTheme = this.getEffectiveTheme();
    const nextTheme =
      this.currentTheme === "light"
        ? "dark"
        : this.currentTheme === "dark"
          ? "system"
          : "light";

    this.button.setAttribute(
      "aria-label",
      `Current theme: ${effectiveTheme}. Click to switch to ${nextTheme} mode.`,
    );
  }

  /**
   * Get current theme preference
   * @returns {string}
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.button) {
      this.button.removeEventListener("click", this.toggleTheme);
      this.button.removeEventListener("keydown", this.handleKeydown);
    }
    this.mediaQuery.removeEventListener("change", this.handleSystemChange);
  }
}

// Create singleton instance
let themeToggleInstance = null;

/**
 * Initialize theme toggle
 * @returns {ThemeToggle}
 */
export function initThemeToggle() {
  if (!themeToggleInstance) {
    themeToggleInstance = new ThemeToggle();
  }
  return themeToggleInstance;
}

/**
 * Get theme toggle instance
 * @returns {ThemeToggle|null}
 */
export function getThemeToggle() {
  return themeToggleInstance;
}

/**
 * Set theme programmatically
 * @param {string} theme
 */
export function setTheme(theme) {
  if (themeToggleInstance) {
    themeToggleInstance.setTheme(theme);
  } else {
    storage.setPreference("themeMode", theme);
    const effectiveTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }
}

/**
 * Get current theme
 * @returns {string}
 */
export function getTheme() {
  return themeToggleInstance
    ? themeToggleInstance.getTheme()
    : storage.getPreference("themeMode", "system");
}

/**
 * Get effective theme (light or dark)
 * @returns {string}
 */
export function getEffectiveTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

export default ThemeToggle;
