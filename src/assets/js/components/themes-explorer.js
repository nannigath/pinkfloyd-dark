/* ==========================================================================
   Themes Explorer Component
   Display conceptual themes with analysis, track associations, and animations
   ========================================================================== */

import dataApi from "../services/dataService.js";
import { storage } from "../utils/storage.js";

/**
 * Render themes explorer section
 * @param {HTMLElement} container - Container element
 */
export async function renderThemesExplorer(container) {
  try {
    const [{ themes }, { tracks }] = await Promise.all([
      dataApi.getThemes(),
      dataApi.getTracks(),
    ]);

    const html = `
      <div class="themes-explorer">
        <div class="themes-intro neo-flat">
          <p>The Dark Side of the Moon explores profound themes that resonate deeply with the human experience. 
          Click on any theme to discover how it weaves through the album's music and lyrics.</p>
        </div>
        
        <div class="themes-grid" role="list" aria-label="Conceptual themes">
          ${themes
            .map(
              (theme, index) => `
            <article 
              class="theme-card neo-convex" 
              role="listitem"
              data-theme-slug="${theme.slug}"
              tabindex="0"
              style="--theme-color: ${theme.colorAccent}"
            >
              <div class="theme-card-front">
                <div class="theme-icon" aria-hidden="true">
                  ${getThemeIcon(theme.slug)}
                </div>
                <h3 class="theme-title">${theme.name}</h3>
                <div class="theme-color-bar" style="background-color: ${theme.colorAccent}"></div>
              </div>
              
              <div class="theme-card-back" hidden>
                <button class="theme-close-btn" aria-label="Close theme details"><i data-lucide="x"></i></button>
                <div class="theme-content">
                  <div class="theme-header-back">
                    <div class="theme-icon-back" style="color: ${theme.colorAccent}">${getThemeIcon(theme.slug)}</div>
                    <h3 class="theme-title" style="color: ${theme.colorAccent}">${theme.name}</h3>
                  </div>
                  <div class="theme-description">
                    ${theme.description}
                  </div>
                  
                  <div class="theme-tracks">
                    <h4>Related Tracks (${theme.associatedTracks.length})</h4>
                    <ul class="theme-track-list">
                      ${theme.associatedTracks
                        .slice(0, 2)
                        .map((trackTitle) => {
                          const track = tracks.find(
                            (t) => t.title === trackTitle,
                          );
                          return track
                            ? `
                          <li class="theme-track-item">
                            <a 
                              href="#tracks" 
                              class="theme-track-link"
                              data-track-id="${track.id}"
                            >
                              <span class="track-number">${String(track.trackNumber).padStart(2, "0")}</span>
                              <span class="track-title">${track.title}</span>
                              <span class="track-arrow"><i data-lucide="arrow-right"></i></span>
                            </a>
                          </li>
                        `
                            : "";
                        })
                        .join("")}
                      ${
                        theme.associatedTracks.length > 2
                          ? `
                        <li class="theme-track-more">+${theme.associatedTracks.length - 2} more</li>
                      `
                          : ""
                      }
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          `,
            )
            .join("")}
        </div>
        
        <!-- Theme Detail Modal (for reduced motion users) -->
        <div 
          id="theme-modal" 
          class="theme-modal" 
          role="dialog" 
          aria-modal="true"
          aria-label="Theme details"
          hidden
        >
          <div class="theme-modal-backdrop"></div>
          <div class="theme-modal-content neo-flat"></div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Initialize Lucide icons in the container
    if (window.initLucideIcons) window.initLucideIcons(container);

    // Set up theme card interactions
    setupThemeInteractions(container, tracks);
  } catch (error) {
    console.error("Failed to render themes explorer:", error);
    container.innerHTML = `
      <div class="error-message neo-flat">
        <p>Unable to load themes. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Set up theme card interactions
 */
function setupThemeInteractions(container, tracks) {
  const prefersReducedMotion = storage.prefersReducedMotion();

  container.querySelectorAll(".theme-card").forEach((card) => {
    const front = card.querySelector(".theme-card-front");
    const back = card.querySelector(".theme-card-back");
    const closeBtn = card.querySelector(".theme-close-btn");
    const trackLinks = card.querySelectorAll(".theme-track-link");

    // Click to flip/expand
    card.addEventListener("click", (e) => {
      // Prevent event from bubbling to parent elements
      e.stopPropagation();
      
      // Don't flip if clicking a track link or close button
      if (e.target.closest(".theme-track-link") || e.target.closest(".theme-close-btn")) {
        return;
      }

      if (prefersReducedMotion) {
        // Use modal instead of flip for reduced motion
        showThemeModal(card);
      } else {
        toggleCardFlip(card, front, back);
      }
    });

    // Keyboard navigation
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (prefersReducedMotion) {
          showThemeModal(card);
        } else {
          toggleCardFlip(card, front, back);
        }
      }

      if (e.key === "Escape" && card.classList.contains("flipped")) {
        toggleCardFlip(card, front, back);
      }
    });

    // Close button
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCardFlip(card, front, back);
    });

    // Track links
    trackLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const trackId = parseInt(link.dataset.trackId);
        navigateToTrack(trackId, tracks);
      });
    });
  });
}

/**
 * Toggle card flip animation
 */
function toggleCardFlip(card, front, back) {
  const isFlipped = card.classList.contains("flipped");

  if (isFlipped) {
    // Flip back
    card.classList.remove("flipped");
    front.hidden = false;
    back.hidden = true;
    card.setAttribute("aria-expanded", "false");
  } else {
    // Flip forward
    card.classList.add("flipped");
    front.hidden = true;
    back.hidden = false;
    card.setAttribute("aria-expanded", "true");

    // Focus on close button for accessibility
    const closeBtn = back.querySelector(".theme-close-btn");
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }
  }
}

/**
 * Show theme details in modal (for reduced motion)
 */
function showThemeModal(card) {
  const modal = document.getElementById("theme-modal");
  const modalContent = modal.querySelector(".theme-modal-content");
  const back = card.querySelector(".theme-card-back");

  // Clone the back content
  modalContent.innerHTML = back.innerHTML;

  // Set up close functionality
  const closeBtn = modalContent.querySelector(".theme-close-btn");
  closeBtn.addEventListener("click", () => {
    closeThemeModal(modal);
  });

  // Show modal
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  // Set up backdrop click
  modal.querySelector(".theme-modal-backdrop").addEventListener("click", () => {
    closeThemeModal(modal);
  });

  // Set up escape key
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeThemeModal(modal);
    }
  });

  // Focus management
  closeBtn.focus();
}

/**
 * Close theme modal
 */
function closeThemeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
}

/**
 * Navigate to track in track explorer
 */
function navigateToTrack(trackId, tracks) {
  // Scroll to tracks section
  const tracksSection = document.getElementById("tracks");
  if (tracksSection) {
    tracksSection.scrollIntoView({ behavior: "smooth" });

    // Trigger track detail view (will be handled by track-explorer.js)
    setTimeout(() => {
      const trackElement = document.querySelector(
        `.track-item[data-track-id="${trackId}"]`,
      );
      if (trackElement) {
        trackElement.click();
        trackElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);
  }
}

/**
 * Get icon for theme
 */
function getThemeIcon(slug) {
  const icons = {
    time: '<i data-lucide="clock"></i>',
    death: '<i data-lucide="skull"></i>',
    money: '<i data-lucide="piggy-bank"></i>',
    "mental-health": '<i data-lucide="heart-handshake"></i>',
    conflict: '<i data-lucide="swords"></i>',
  };
  return icons[slug] || '<i data-lucide="info"></i>';
}

export default renderThemesExplorer;
