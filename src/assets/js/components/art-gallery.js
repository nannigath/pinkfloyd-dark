/* ==========================================================================
   Art Gallery Component
   Displays album artwork with lightbox, zoom, and keyboard navigation
   ========================================================================== */

import dataApi from "../services/dataService.js";
import { a11y } from "../utils/a11y.js";

let currentImageIndex = 0;
let galleryImages = [];

/**
 * Render art gallery section
 * @param {HTMLElement} container - Container element
 */
export async function renderArtGallery(container) {
  try {
    const { artwork } = await dataApi.getArtwork();
    galleryImages = artwork;

    // Group artwork by category
    const groupedArtwork = groupByCategory(artwork);

    const html = `
      <div class="art-gallery">
        ${Object.entries(groupedArtwork)
          .map(
            ([category, items]) => `
          <div class="gallery-section">
            <h3 class="gallery-category-title">${formatCategoryName(category)}</h3>
            <div class="gallery-grid" role="list" aria-label="${formatCategoryName(category)} gallery">
              ${items
                .map(
                  (item, index) => `
                <div 
                  class="gallery-item neo-convex" 
                  role="listitem"
                  tabindex="0"
                  data-image-index="${artwork.indexOf(item)}"
                  data-image-id="${item.id}"
                >
                  <div class="gallery-image-wrapper">
                    <img 
                      src="${item.thumbnailUrl || item.imageUrl}" 
                      alt="${item.title}"
                      loading="lazy"
                      class="gallery-thumbnail"
                      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    >
                    <div class="gallery-placeholder" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
                      <span class="placeholder-text">Image</span>
                    </div>
                    <div class="gallery-overlay">
                      <i data-lucide="eye" class="gallery-view-icon"></i>
                    </div>
                  </div>
                  <div class="gallery-item-info">
                    <h4 class="gallery-item-title">${item.title}</h4>
                    <p class="gallery-item-designer">${item.designer}</p>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <!-- Lightbox Modal -->
      <div 
        id="lightbox" 
        class="lightbox" 
        role="dialog" 
        aria-modal="true"
        aria-label="Image viewer"
        hidden
      >
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content neo-flat">
          <button
            class="lightbox-close neo-button"
            aria-label="Close image viewer"
            id="lightbox-close"
          >
            <i data-lucide="x"></i>
          </button>

          <button
            class="lightbox-nav lightbox-prev neo-button"
            aria-label="Previous image"
            id="lightbox-prev"
          >
            <i data-lucide="chevron-left"></i>
          </button>

          <div class="lightbox-image-container">
            <img
              id="lightbox-image"
              src=""
              alt=""
              class="lightbox-image"
            >
          </div>

          <button
            class="lightbox-nav lightbox-next neo-button"
            aria-label="Next image"
            id="lightbox-next"
          >
            <i data-lucide="chevron-right"></i>
          </button>
          
          <div class="lightbox-info neo-concave">
            <h3 id="lightbox-title"></h3>
            <p id="lightbox-description"></p>
            <p id="lightbox-designer" class="lightbox-credit"></p>
            <p id="lightbox-copyright" class="lightbox-copyright"></p>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Initialize Lucide icons in the container
    if (window.initLucideIcons) window.initLucideIcons(container);

    // Set up gallery interactions
    setupGalleryInteractions(container);
  } catch (error) {
    console.error("Failed to render art gallery:", error);
    container.innerHTML = `
      <div class="error-message neo-flat">
        <p>Unable to load gallery. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Group artwork by category
 */
function groupByCategory(artwork) {
  return artwork.reduce((groups, item) => {
    const category = item.category || "uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
}

/**
 * Format category name for display
 */
function formatCategoryName(category) {
  const names = {
    cover: "Album Covers",
    variant: "International Variants",
    promo: "Promotional Materials",
    "behind-scenes": "Behind the Scenes",
    uncategorized: "Gallery",
  };
  return names[category] || category;
}

/**
 * Set up gallery interactions
 */
function setupGalleryInteractions(container) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDescription = document.getElementById("lightbox-description");
  const lightboxDesigner = document.getElementById("lightbox-designer");
  const lightboxCopyright = document.getElementById("lightbox-copyright");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let focusTrapCleanup = null;

  // Open lightbox when clicking gallery item
  container.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.imageIndex);
      openLightbox(index);
    });

    // Keyboard navigation
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const index = parseInt(item.dataset.imageIndex);
        openLightbox(index);
      }
    });
  });

  // Open lightbox function
  function openLightbox(index) {
    currentImageIndex = index;
    const image = galleryImages[index];

    lightboxImage.src = image.imageUrl;
    lightboxImage.alt = image.title;
    lightboxTitle.textContent = image.title;
    lightboxDescription.textContent = image.description || "";
    lightboxDesigner.textContent = image.designer
      ? `Designer: ${image.designer}`
      : "";
    lightboxCopyright.textContent = image.copyrightNotice || "";

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";

    // Set focus and trap it
    closeBtn.focus();
    focusTrapCleanup = a11y.trapFocus(
      lightbox.querySelector(".lightbox-content"),
    );

    // Announce to screen readers
    a11y.announce(
      `Viewing ${image.title}. Use arrow keys to navigate, Escape to close.`,
    );
  }

  // Close lightbox function
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";

    if (focusTrapCleanup) {
      focusTrapCleanup();
      focusTrapCleanup = null;
    }

    // Return focus to gallery item
    const galleryItem = container.querySelector(
      `[data-image-index="${currentImageIndex}"]`,
    );
    if (galleryItem) {
      galleryItem.focus();
    }
  }

  // Navigate to previous image
  function prevImage() {
    currentImageIndex =
      (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  // Navigate to next image
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  // Update lightbox image
  function updateLightboxImage() {
    const image = galleryImages[currentImageIndex];

    // Add fade transition
    lightboxImage.style.opacity = "0";

    setTimeout(() => {
      lightboxImage.src = image.imageUrl;
      lightboxImage.alt = image.title;
      lightboxTitle.textContent = image.title;
      lightboxDescription.textContent = image.description || "";
      lightboxDesigner.textContent = image.designer
        ? `Designer: ${image.designer}`
        : "";
      lightboxCopyright.textContent = image.copyrightNotice || "";

      lightboxImage.onload = () => {
        lightboxImage.style.opacity = "1";
      };

      a11y.announce(`Now viewing ${image.title}`);
    }, 200);
  }

  // Event listeners
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", prevImage);
  nextBtn.addEventListener("click", nextImage);

  // Close on backdrop click
  lightbox
    .querySelector(".lightbox-backdrop")
    .addEventListener("click", closeLightbox);

  // Keyboard navigation in lightbox
  lightbox.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeLightbox();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevImage();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextImage();
        break;
    }
  });

  // Touch gestures for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const lightboxContent = lightbox.querySelector(".lightbox-content");

  lightboxContent.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
  );

  lightboxContent.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true },
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }
}

export default renderArtGallery;
