/* ==========================================================================
   Main Application Entry Point
   Initializes all modules and bootstraps the application
   ========================================================================== */

import storage from "./utils/storage.js";
import a11y from "./utils/a11y.js";
import { initThemeToggle } from "./components/theme-toggle.js";
import { initLazyLoading } from "./utils/lazy-load.js";
import { initErrorTracking } from "./utils/error-tracking.js";
import {
  initAnalytics,
  trackPageView,
  trackThemeChange,
} from "./utils/analytics.js";

/**
 * Initialize the application
 */
function init() {
  console.log("🌈 Pink Floyd - The Dark Side of the Moon Experience");
  console.log("Initializing application...");

  // Initialize error tracking (T087)
  initErrorTracking();

  // Initialize privacy-focused analytics (T088)
  initAnalytics();

  // Initialize theme based on stored preference
  storage.initializeTheme();

  // Set up theme toggle component (T079)
  const themeToggle = initThemeToggle();

  // Listen for theme changes and track them
  window.addEventListener("themechange", (e) => {
    trackThemeChange(e.detail.theme);
  });

  // Initialize lazy loading (T092)
  initLazyLoading();

  // Initialize accessibility features
  a11y.initAccessibility();

  // Set up navigation
  setupNavigation();

  // Register service worker for offline support (T084)
  registerServiceWorker();

  // Load initial data
  loadInitialData();

  console.log("✓ Application initialized");
}

/**
 * Set up theme toggle button
 */
function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const newTheme = storage.toggleTheme();

    // Announce theme change to screen readers
    a11y.announce(`Switched to ${newTheme} mode`);
  });
}

/**
 * Register service worker for offline support (T083, T084)
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            console.log("[SW] New version installing...");

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                console.log("[SW] New version available, refresh to update");
              }
            });
          });
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[SW] Message:", event.data);
      });
    });
  } else {
    console.log("[SW] Service workers not supported");
  }
}

/**
 * Set up navigation interactions
 */
function setupNavigation() {
  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();

        // Calculate scroll position with header offset
        const headerHeight =
          document.querySelector(".site-header").offsetHeight;
        const targetPosition =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          40;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update URL without jumping
        history.pushState(null, "", targetId);

        // Set focus for accessibility
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  // Highlight current section on scroll
  const sections = document.querySelectorAll(".content-section");
  const navLinks = document.querySelectorAll(".nav-link");

  const observerOptions = {
    root: null,
    rootMargin: "-50% 0px -50% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/**
 * Load initial data for all sections
 */
async function loadInitialData() {
  try {
    // Dynamically import data service
    const { dataApi } = await import("./services/dataService.js");

    // Preload manifest
    const manifest = await dataApi.getManifest();
    console.log(`Loaded: ${manifest.album.title}`);
    console.log(
      `Tracks: ${manifest.stats.totalTracks}, Themes: ${manifest.stats.totalThemes}`,
    );

    // Load album overview
    const albumContainer = document.getElementById("album-content");
    if (albumContainer) {
      const { renderAlbumOverview } =
        await import("./components/album-overview.js");
      await renderAlbumOverview(albumContainer);
      hideSkeleton("album");
    }

    // Load track explorer
    const tracksContainer = document.getElementById("tracks-content");
    if (tracksContainer) {
      const { renderTrackExplorer } =
        await import("./components/track-explorer.js");
      await renderTrackExplorer(tracksContainer);
      hideSkeleton("tracks");
    }

    // Load art gallery
    const galleryContainer = document.getElementById("gallery-content");
    if (galleryContainer) {
      const { renderArtGallery } = await import("./components/art-gallery.js");
      await renderArtGallery(galleryContainer);
      hideSkeleton("gallery");
    }

    // Load themes explorer
    const themesContainer = document.getElementById("themes-content");
    if (themesContainer) {
      const { renderThemesExplorer } =
        await import("./components/themes-explorer.js");
      await renderThemesExplorer(themesContainer);
      hideSkeleton("themes");
    }

    // Load recording deep dive
    const recordingContainer = document.getElementById("recording-content");
    if (recordingContainer) {
      const { renderRecordingDeepDive } =
        await import("./components/recording-deep-dive.js");
      await renderRecordingDeepDive(recordingContainer);
      hideSkeleton("recording");
    }

    // Load interactive experience
    const interactiveContainer = document.getElementById("interactive-content");
    if (interactiveContainer) {
      const { renderInteractiveExperience } =
        await import("./components/interactive-experience.js");
      await renderInteractiveExperience(interactiveContainer);
      hideSkeleton("interactive");
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
    showErrorMessage("Unable to load content. Please try refreshing the page.");
  }
}

/**
 * Hide specific skeleton loader
 */
function hideSkeleton(name) {
  const skeleton = document.querySelector(`[data-skeleton="${name}"]`);
  if (skeleton) {
    skeleton.style.display = "none";
  }
}

/**
 * Hide skeleton loading placeholders
 */
function hideSkeletonLoaders() {
  const skeletons = document.querySelectorAll(".skeleton-container");
  skeletons.forEach((skeleton) => {
    skeleton.style.display = "none";
  });
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
  const main = document.querySelector(".main-content");
  if (!main) return;

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message neo-flat";
  errorDiv.setAttribute("role", "alert");
  errorDiv.innerHTML = `
    <p><strong>Error:</strong> ${message}</p>
    <button onclick="location.reload()" class="neo-button">Retry</button>
  `;

  main.prepend(errorDiv);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
