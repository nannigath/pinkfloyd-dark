/* ==========================================================================
   Album Overview Component
   Displays album metadata, recording timeline, and commercial success
   ========================================================================== */

import dataApi from "../services/dataService.js";
import { dom } from "../utils/dom.js";

/**
 * Render album overview section
 * @param {HTMLElement} container - Container element
 */
export async function renderAlbumOverview(container) {
  try {
    const [album, artwork] = await Promise.all([
      dataApi.getAlbum(),
      dataApi.getPrimaryArtwork(),
    ]);

    const html = `
      <div class="album-overview">
        <div class="album-hero">
          <div class="album-cover neo-flat">
            <img 
              src="${artwork?.imageUrl || "/assets/images/artwork/prism-cover.webp"}" 
              alt="${album.title} album cover"
              loading="lazy"
              onerror="this.src='data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 400%27><rect fill=%27%23E0E5EC%27 width=%27400%27 height=%27400%27/><text x=%2750%%27 y=%2750%%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 font-size=%2780%27>🌈</text></svg>'"
            >
          </div>
          <div class="album-info">
            <h1 class="album-title">${album.title}</h1>
            <div class="album-meta neo-concave">
              <div class="meta-item">
                <span class="meta-label">Released</span>
                <span class="meta-value">${formatDate(album.releaseDate)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Label</span>
                <span class="meta-value">${album.recordLabel}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Producer</span>
                <span class="meta-value">${album.producer}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Recording Location</span>
                <span class="meta-value">${album.recordingLocation}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="album-description neo-flat">
          <h2>About the Album</h2>
          <p>${album.overviewText}</p>
        </div>
        
        ${renderRecordingTimeline(album)}
        ${renderCommercialSuccess(album)}
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    console.error("Failed to render album overview:", error);
    container.innerHTML = `
      <div class="error-message neo-flat">
        <p>Unable to load album information. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Render recording timeline
 */
function renderRecordingTimeline(album) {
  const startDate = new Date(album.recordingStartDate);
  const endDate = new Date(album.recordingEndDate);

  const milestones = [
    {
      date: album.recordingStartDate,
      label: "Recording Begins",
      description: "Sessions begin at Abbey Road Studios",
    },
    {
      date: "1972-06-01",
      label: "Live Debut",
      description: "Album performed live for the first time",
    },
    {
      date: "1972-12-01",
      label: "Vocal Sessions",
      description: 'Clare Torry records "The Great Gig in the Sky"',
    },
    {
      date: album.recordingEndDate,
      label: "Recording Completed",
      description: "Final mixes completed",
    },
  ];

  return `
    <div class="recording-timeline neo-flat">
      <h2>Recording Timeline</h2>
      <div class="timeline" role="list" aria-label="Recording timeline">
        ${milestones
          .map(
            (milestone, index) => `
          <div class="timeline-item" role="listitem" tabindex="0">
            <div class="timeline-marker ${index === 0 || index === milestones.length - 1 ? "marker-major" : ""}"></div>
            <div class="timeline-content neo-convex">
              <time class="timeline-date" datetime="${milestone.date}">${formatDate(milestone.date)}</time>
              <h3 class="timeline-label">${milestone.label}</h3>
              <p class="timeline-description">${milestone.description}</p>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

/**
 * Render commercial success statistics
 */
function renderCommercialSuccess(album) {
  const sales = album.salesFigures || {};
  const charts = album.chartPositions || [];

  return `
    <div class="commercial-success neo-flat">
      <h2>Commercial Success</h2>
      <div class="stats-grid">
        <div class="stat-card neo-convex">
          <span class="stat-number">${sales.worldwide || "45+ million"}</span>
          <span class="stat-label">Copies Sold Worldwide</span>
        </div>
        <div class="stat-card neo-convex">
          <span class="stat-number">${sales.billboardWeeks || "900+"}</span>
          <span class="stat-label">Weeks on Billboard 200</span>
        </div>
        ${charts
          .map(
            (chart) => `
          <div class="stat-card neo-convex">
            <span class="stat-number">#${chart.position}</span>
            <span class="stat-label">${chart.chart} (${chart.year})</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `;
}

/**
 * Format date string
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default renderAlbumOverview;
