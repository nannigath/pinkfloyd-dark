/* ==========================================================================
   Recording Deep Dive Component
   Displays recording equipment, signal flow diagrams, and engineer info
   ========================================================================== */

import dataApi from "../services/dataService.js";
import { a11y } from "../utils/a11y.js";

/**
 * Render recording deep dive section
 * @param {HTMLElement} container - Container element
 */
export async function renderRecordingDeepDive(container) {
  try {
    const [{ equipment }, { tracks }] = await Promise.all([
      dataApi.getEquipment(),
      dataApi.getTracks(),
    ]);

    const html = `
      <div class="recording-deep-dive">
        <!-- Introduction -->
        <div class="recording-intro neo-flat">
          <h3>The Sound of Innovation</h3>
          <p>Recorded at Abbey Road Studios between May 1972 and January 1973, 
          "The Dark Side of the Moon" pushed the boundaries of studio technology. 
          Under the engineering mastery of Alan Parsons, Pink Floyd utilized groundbreaking 
          techniques and equipment that would define the album's legendary sound.</p>
        </div>
        
        <!-- Signal Flow Diagram (Money Track) -->
        <div class="signal-flow-section neo-flat">
          <h3>Signal Flow: "Money" Track Breakdown</h3>
          <p class="section-description">Explore how the iconic 7/4 time signature and tape loop effects were created</p>
          
          <div class="signal-flow-diagram" role="img" aria-label="Signal flow diagram for Money track">
            <div class="signal-flow-stages">
              <div class="flow-stage" data-tooltip="source">
                <div class="stage-icon neo-convex">In</div>
                <span class="stage-label">Source</span>
                <span class="stage-detail">Guitar/Bass</span>
              </div>
              
              <div class="flow-arrow">→</div>
              
              <div class="flow-stage" data-tooltip="tape-loop">
                <div class="stage-icon neo-convex">1</div>
                <span class="stage-label">Tape Loop</span>
                <span class="stage-detail">7/4 Loop</span>
              </div>
              
              <div class="flow-arrow">→</div>
              
              <div class="flow-stage" data-tooltip="mixer">
                <div class="stage-icon neo-convex">2</div>
                <span class="stage-label">EMI Console</span>
                <span class="stage-detail">16-Track Mix</span>
              </div>
              
              <div class="flow-arrow">→</div>
              
              <div class="flow-stage" data-tooltip="effects">
                <div class="stage-icon neo-convex">3</div>
                <span class="stage-label">Effects</span>
                <span class="stage-detail">Delay/Reverb</span>
              </div>
              
              <div class="flow-arrow">→</div>
              
              <div class="flow-stage" data-tooltip="master">
                <div class="stage-icon neo-convex">Out</div>
                <span class="stage-label">Master</span>
                <span class="stage-detail">Stereo Out</span>
              </div>
            </div>
            
            <!-- Tooltip Panel -->
            <div class="signal-flow-tooltip neo-concave" id="signal-tooltip" hidden>
              <h4 class="tooltip-title"></h4>
              <p class="tooltip-description"></p>
            </div>
          </div>
          
          <!-- Audio Comparison -->
          <div class="audio-comparison">
            <h4>Before & After Comparison</h4>
            <div class="comparison-controls neo-concave">
              <button class="comparison-btn neo-button active" data-type="raw">
                Raw Recording
              </button>
              <button class="comparison-btn neo-button" data-type="final">
                Final Mix
              </button>
            </div>
            <div class="comparison-player">
              <audio 
                id="comparison-audio" 
                controls
                class="neo-audio-player"
                src="/assets/audio/money-raw-preview.mp3"
              >
                Your browser does not support the audio element.
              </audio>
              <p class="comparison-note">Listen to the transformation from raw recording to final mix</p>
            </div>
          </div>
        </div>
        
        <!-- Equipment Grid -->
        <div class="equipment-section">
          <h3>Recording Equipment</h3>
          <div class="equipment-grid" role="list" aria-label="Recording equipment">
            ${equipment
              .map(
                (item) => `
              <article class="equipment-card neo-convex" role="listitem">
                <div class="equipment-image">
                  ${
                    item.imageUrl
                      ? `
                    <img 
                      src="${item.imageUrl}" 
                      alt="${item.name}"
                      loading="lazy"
                    >
                  `
                      : `
                    <div class="equipment-placeholder">
                      <span>${getEquipmentIcon(item.type)}</span>
                    </div>
                  `
                  }
                </div>
                <div class="equipment-info">
                  <h4 class="equipment-name">${item.name}</h4>
                  <p class="equipment-manufacturer">${item.manufacturer} ${item.model}</p>
                  <p class="equipment-type">${formatEquipmentType(item.type)}</p>
                  
                  ${
                    item.specifications
                      ? `
                    <div class="equipment-specs neo-concave">
                      <h5>Specifications</h5>
                      <p>${item.specifications}</p>
                    </div>
                  `
                      : ""
                  }
                  
                  ${
                    item.usageDescription
                      ? `
                    <div class="equipment-usage">
                      <h5>Album Usage</h5>
                      <p>${item.usageDescription}</p>
                    </div>
                  `
                      : ""
                  }
                  
                  ${
                    item.associatedTracks && item.associatedTracks.length
                      ? `
                    <div class="equipment-tracks">
                      <h5>Used On</h5>
                      <div class="track-tags">
                        ${item.associatedTracks
                          .map(
                            (track) => `
                          <span class="track-tag neo-concave">${track}</span>
                        `,
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </article>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <!-- Engineer Profile -->
        <div class="engineer-profile neo-flat">
          <div class="engineer-header">
            <div class="engineer-avatar neo-convex">
              <span>AP</span>
            </div>
            <div class="engineer-title">
              <h3>Alan Parsons</h3>
              <p class="engineer-role">Recording Engineer</p>
            </div>
          </div>
          
          <div class="engineer-contributions">
            <h4>Engineering Innovations</h4>
            <ul class="contributions-list">
              <li class="contribution-item neo-concave">
                <strong>Multitrack Recording:</strong> Pioneered innovative use of 16-track tape machines, 
                allowing complex layering of instruments and effects
              </li>
              <li class="contribution-item neo-concave">
                <strong>Tape Loop Techniques:</strong> Created seamless tape loops for "Money" and "Time," 
                achieving rhythmic precision unheard of at the time
              </li>
              <li class="contribution-item neo-concave">
                <strong>Analog Synthesis:</strong> Integrated EMS Synthi AKS synthesizer into the recording 
                chain, expanding the sonic palette
              </li>
              <li class="contribution-item neo-concave">
                <strong>Vocal Processing:</strong> Developed unique approaches to recording Clare Torry's 
                iconic wordless vocals on "The Great Gig in the Sky"
              </li>
            </ul>
          </div>
          
          <blockquote class="engineer-quote neo-concave">
            <p>"The Dark Side of the Moon was a perfect storm of technology, talent, and timing. 
            We were pushing the boundaries of what could be done in a recording studio."</p>
            <cite>— Alan Parsons, 2003 Interview</cite>
          </blockquote>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Set up interactions
    setupSignalFlowInteractions(container);
    setupAudioComparison(container);
  } catch (error) {
    console.error("Failed to render recording deep dive:", error);
    container.innerHTML = `
      <div class="error-message neo-flat">
        <p>Unable to load recording information. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Set up signal flow diagram interactions
 */
function setupSignalFlowInteractions(container) {
  const tooltip = container.querySelector("#signal-tooltip");
  const tooltipTitle = tooltip.querySelector(".tooltip-title");
  const tooltipDesc = tooltip.querySelector(".tooltip-description");

  const tooltipContent = {
    source: {
      title: "Source Instruments",
      description:
        "Roger Waters' bass guitar and David Gilmour's guitar provided the foundational riff. The distinctive sound comes from the use of a Binson Echorec unit.",
    },
    "tape-loop": {
      title: "Tape Loop Creation",
      description:
        "A 7/4 time signature tape loop was created using cash register and coin sounds recorded at Abbey Road Studios. The loop runs continuously throughout the track.",
    },
    mixer: {
      title: "EMI TG12345 Console",
      description:
        "The revolutionary transistor-based mixing console allowed unprecedented control over each track. Alan Parsons utilized every channel for complex layering.",
    },
    effects: {
      title: "Analog Effects Chain",
      description:
        'Carefully crafted delay and reverb using EMI\'s custom plate reverb units. The tape delay created the signature "slapback" effect on vocals.',
    },
    master: {
      title: "Final Master",
      description:
        "Mixed to stereo with careful attention to dynamic range. The album became a reference standard for audio quality and engineering excellence.",
    },
  };

  container.querySelectorAll(".flow-stage").forEach((stage) => {
    const tooltipKey = stage.dataset.tooltip;

    stage.addEventListener("mouseenter", () => {
      const content = tooltipContent[tooltipKey];
      if (content) {
        tooltipTitle.textContent = content.title;
        tooltipDesc.textContent = content.description;
        tooltip.hidden = false;
      }
    });

    stage.addEventListener("mouseleave", () => {
      tooltip.hidden = true;
    });

    // Keyboard accessibility
    stage.addEventListener("focus", () => {
      const content = tooltipContent[tooltipKey];
      if (content) {
        tooltipTitle.textContent = content.title;
        tooltipDesc.textContent = content.description;
        tooltip.hidden = false;
      }
    });

    stage.addEventListener("blur", () => {
      tooltip.hidden = true;
    });

    stage.setAttribute("tabindex", "0");
    stage.setAttribute("role", "button");
    stage.setAttribute(
      "aria-label",
      `Learn about ${tooltipContent[tooltipKey]?.title || tooltipKey}`,
    );
  });
}

/**
 * Set up audio comparison controls
 */
function setupAudioComparison(container) {
  const buttons = container.querySelectorAll(".comparison-btn");
  const audio = container.querySelector("#comparison-audio");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active state
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Change audio source
      const type = btn.dataset.type;
      const newSrc =
        type === "raw"
          ? "/assets/audio/money-raw-preview.mp3"
          : "/assets/audio/money-final-preview.mp3";

      // Only change if different
      if (audio.src !== newSrc) {
        const currentTime = audio.currentTime;
        audio.src = newSrc;
        audio.load();

        // Restore position if possible
        audio.addEventListener(
          "loadedmetadata",
          () => {
            audio.currentTime = Math.min(currentTime, audio.duration || 30);
          },
          { once: true },
        );

        // Auto-play if was playing
        if (!audio.paused) {
          audio.play();
        }
      }

      // Announce to screen readers
      a11y.announce(
        `Switched to ${type === "raw" ? "raw recording" : "final mix"}`,
      );
    });
  });
}

/**
 * Get icon for equipment type
 */
function getEquipmentIcon(type) {
  const icons = {
    synthesizer: "SYN",
    microphone: "MIC",
    mixer: "MIX",
    effects: "FX",
    tape: "TAPE",
  };
  return icons[type] || "EQ";
}

/**
 * Format equipment type for display
 */
function formatEquipmentType(type) {
  const formats = {
    synthesizer: "Synthesizer",
    microphone: "Microphone",
    mixer: "Mixing Console",
    effects: "Effects Unit",
    tape: "Tape Machine",
  };
  return formats[type] || type;
}

export default renderRecordingDeepDive;
