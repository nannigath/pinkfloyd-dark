/* ==========================================================================
   Track Explorer Component
   Browse tracks with audio previews, waveform visualization, and analysis
   ========================================================================== */

import dataApi from "../services/dataService.js";
import { dom } from "../utils/dom.js";
import { audioPlayer } from "../audio/player.js";

let currentTrackId = null;

/**
 * Render track explorer section
 * @param {HTMLElement} container - Container element
 */
export async function renderTrackExplorer(container) {
  try {
    const { tracks } = await dataApi.getTracks();

    const html = `
      <div class="track-explorer">
        <div class="track-list-container">
          <ul class="track-list" role="list" aria-label="Album tracks">
            ${tracks
              .map(
                (track, index) => `
              <li class="track-item neo-convex" data-track-id="${track.id}" role="listitem" tabindex="0">
                <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
                <div class="track-info">
                  <h3 class="track-title">${track.title}</h3>
                  <span class="track-duration">${track.duration}</span>
                </div>
                <button 
                  class="track-play-btn neo-button"
                  aria-label="Play ${track.title}"
                  data-track-id="${track.id}"
                >
                  <span class="play-icon">▶</span>
                </button>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
        
        <div class="track-detail-container">
          <div id="track-detail" class="track-detail neo-flat">
            <div class="track-detail-placeholder">
              <p>Select a track to view details and listen to a preview</p>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Set up event listeners
    setupTrackListEvents(container, tracks);
  } catch (error) {
    console.error("Failed to render track explorer:", error);
    container.innerHTML = `
      <div class="error-message neo-flat">
        <p>Unable to load tracks. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Set up track list event listeners
 */
function setupTrackListEvents(container, tracks) {
  // Click on track item
  container.querySelectorAll(".track-item").forEach((item) => {
    item.addEventListener("click", () => {
      const trackId = parseInt(item.dataset.trackId);
      showTrackDetail(trackId, tracks);
    });

    // Keyboard navigation
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const trackId = parseInt(item.dataset.trackId);
        showTrackDetail(trackId, tracks);
      }
    });
  });

  // Click on play button
  container.querySelectorAll(".track-play-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const trackId = parseInt(btn.dataset.trackId);
      const track = tracks.find((t) => t.id === trackId);
      if (track) {
        playTrack(track);
      }
    });
  });
}

/**
 * Show track detail view
 */
async function showTrackDetail(trackId, tracks) {
  const track = tracks.find((t) => t.id === trackId);
  if (!track) return;

  currentTrackId = trackId;

  const detailContainer = document.getElementById("track-detail");

  const html = `
    <div class="track-detail-content">
      <div class="track-detail-header">
        <span class="track-detail-number">Track ${track.trackNumber}</span>
        <h2 class="track-detail-title">${track.title}</h2>
        <span class="track-detail-duration">${track.duration}</span>
      </div>
      
      ${renderAudioPlayer(track)}
      
      <div class="track-analysis">
        ${
          track.musicalAnalysis
            ? `
          <div class="analysis-section neo-concave">
            <h3>Musical Analysis</h3>
            <p>${track.musicalAnalysis}</p>
          </div>
        `
            : ""
        }
        
        ${
          track.culturalSignificance
            ? `
          <div class="analysis-section neo-concave">
            <h3>Cultural Significance</h3>
            <p>${track.culturalSignificance}</p>
          </div>
        `
            : ""
        }
        
        ${
          track.lyricsExcerpt
            ? `
          <div class="analysis-section neo-concave">
            <h3>Lyrics</h3>
            <blockquote class="lyrics-excerpt">
              <p>${track.lyricsExcerpt}</p>
            </blockquote>
          </div>
        `
            : ""
        }
        
        <div class="track-meta">
          <div class="meta-item">
            <span class="meta-label">Composers</span>
            <span class="meta-value">${track.composers.join(", ")}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Themes</span>
            <span class="meta-value">${track.themes.join(", ")}</span>
          </div>
        </div>
      </div>
      
      <div class="track-navigation">
        ${
          track.trackNumber > 1
            ? `
          <button class="nav-btn neo-button" data-nav="prev" aria-label="Previous track">
            ← Previous
          </button>
        `
            : "<span></span>"
        }
        
        ${
          track.trackNumber < tracks.length
            ? `
          <button class="nav-btn neo-button" data-nav="next" aria-label="Next track">
            Next →
          </button>
        `
            : "<span></span>"
        }
      </div>
    </div>
  `;

  detailContainer.innerHTML = html;

  // Set up audio player
  setupAudioPlayer(track);

  // Set up navigation
  detailContainer.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const direction = btn.dataset.nav;
      const newTrackId = direction === "next" ? trackId + 1 : trackId - 1;
      if (newTrackId >= 1 && newTrackId <= tracks.length) {
        showTrackDetail(newTrackId, tracks);

        // Update selected state in list
        document.querySelectorAll(".track-item").forEach((item) => {
          item.classList.remove("active");
          if (parseInt(item.dataset.trackId) === newTrackId) {
            item.classList.add("active");
            item.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      }
    });
  });

  // Highlight current track in list
  document.querySelectorAll(".track-item").forEach((item) => {
    item.classList.remove("active");
    if (parseInt(item.dataset.trackId) === trackId) {
      item.classList.add("active");
    }
  });
}

/**
 * Render audio player HTML
 */
function renderAudioPlayer(track) {
  return `
    <div class="audio-player-container neo-flat">
      <div class="waveform-container" id="waveform-${track.id}">
        ${renderWaveform(track.waveformData)}
      </div>
      
      <div class="audio-controls">
        <button class="audio-btn audio-btn--play neo-button" id="play-btn-${track.id}" aria-label="Play preview">
          <span class="play-icon">▶</span>
        </button>
        
        <div class="audio-progress">
          <div class="progress-bar neo-progress">
            <div class="progress-fill neo-progress-bar" id="progress-${track.id}" style="width: 0%"></div>
          </div>
          <div class="time-display">
            <span id="current-time-${track.id}">0:00</span>
            <span>/</span>
            <span>0:30</span>
          </div>
        </div>
        
        <button class="audio-btn neo-button" aria-label="Link to streaming" title="Listen on streaming services">
          <span>Stream</span>
        </button>
      </div>
      
      <audio 
        id="audio-${track.id}" 
        src="${track.audioPreviewUrl}" 
        preload="metadata"
      ></audio>
    </div>
  `;
}

/**
 * Render waveform visualization
 */
function renderWaveform(waveformData) {
  if (!waveformData || !Array.isArray(waveformData)) {
    return '<div class="waveform-placeholder">Waveform visualization</div>';
  }

  const bars = waveformData
    .map((amplitude, index) => {
      const height = Math.max(10, amplitude * 100);
      return `
      <div 
        class="waveform-bar" 
        style="height: ${height}%"
        data-index="${index}"
      ></div>
    `;
    })
    .join("");

  return `<div class="waveform" role="img" aria-label="Audio waveform visualization">${bars}</div>`;
}

/**
 * Set up audio player functionality
 */
function setupAudioPlayer(track) {
  const audio = document.getElementById(`audio-${track.id}`);
  const playBtn = document.getElementById(`play-btn-${track.id}`);
  const progressBar = document.getElementById(`progress-${track.id}`);
  const currentTimeEl = document.getElementById(`current-time-${track.id}`);

  if (!audio || !playBtn) return;

  let isPlaying = false;
  let playCount = parseInt(sessionStorage.getItem("playCount") || "0");

  playBtn.addEventListener("click", () => {
    // Rate limiting: max 100 plays per session
    if (playCount >= 100) {
      alert(
        "You've reached the maximum number of plays for this session. Please explore other content.",
      );
      return;
    }

    if (isPlaying) {
      audio.pause();
      playBtn.innerHTML = '<span class="play-icon">▶</span>';
      playBtn.setAttribute("aria-label", "Play preview");
      isPlaying = false;
    } else {
      // Stop any other playing audio
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });

      audio.play();
      playBtn.innerHTML = '<span class="pause-icon">⏸</span>';
      playBtn.setAttribute("aria-label", "Pause preview");
      isPlaying = true;

      // Increment play count
      playCount++;
      sessionStorage.setItem("playCount", playCount.toString());
    }
  });

  // Update progress
  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);

    // Animate waveform bars
    const bars = document.querySelectorAll(
      `#waveform-${track.id} .waveform-bar`,
    );
    const barIndex = Math.floor(
      (audio.currentTime / audio.duration) * bars.length,
    );
    bars.forEach((bar, index) => {
      if (index <= barIndex) {
        bar.classList.add("active");
      } else {
        bar.classList.remove("active");
      }
    });
  });

  // Auto-stop at 30 seconds
  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime >= 30) {
      audio.pause();
      audio.currentTime = 0;
      playBtn.innerHTML = '<span class="play-icon">▶</span>';
      playBtn.setAttribute("aria-label", "Play preview");
      isPlaying = false;
    }
  });

  // Reset when ended
  audio.addEventListener("ended", () => {
    playBtn.innerHTML = '<span class="play-icon">▶</span>';
    playBtn.setAttribute("aria-label", "Play preview");
    progressBar.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    isPlaying = false;
  });
}

/**
 * Play track directly
 */
function playTrack(track) {
  showTrackDetail(track.id, [track]);

  // Auto-play after a short delay
  setTimeout(() => {
    const playBtn = document.getElementById(`play-btn-${track.id}`);
    if (playBtn) {
      playBtn.click();
    }
  }, 100);
}

/**
 * Format time in MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default renderTrackExplorer;
