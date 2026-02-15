/* ==========================================================================
   Interactive Audio Experience Component
   Audio visualizer, "Create Your Prism" tool, and personality quiz
   ========================================================================== */

import dataApi from '../services/dataService.js';
import { storage } from '../utils/storage.js';
import { a11y } from '../utils/a11y.js';
import { audioPlayer } from '../audio/player.js';

let audioContext = null;
let analyser = null;
let animationId = null;

/**
 * Render interactive experience section
 * @param {HTMLElement} container - Container element
 */
export async function renderInteractiveExperience(container) {
  try {
    const { tracks } = await dataApi.getTracks();
    
    const html = `
      <div class="interactive-experience">
        <!-- Audio Visualizer -->
        <div class="visualizer-section neo-flat">
          <h3>Audio Visualizer</h3>
          <p class="section-description">Play any track and watch the music come to life</p>
          
          <div class="visualizer-container">
            <canvas 
              id="audio-visualizer" 
              class="visualizer-canvas"
              width="800" 
              height="300"
              role="img"
              aria-label="Audio frequency visualization"
            ></canvas>
            
            <div class="visualizer-controls">
              <select id="visualizer-track-select" class="neo-input">
                <option value="">Select a track...</option>
                ${tracks.map(track => `
                  <option value="${track.audioPreviewUrl}">${track.title}</option>
                `).join('')}
              </select>
              
              <button id="visualizer-play-btn" class="neo-button visualizer-play-btn" disabled>
                <i data-lucide="play" class="play-icon"></i> Play with Visualizer
              </button>
              
              <button id="visualizer-stop-btn" class="neo-button" disabled>
                <i data-lucide="square"></i> Stop
              </button>
            </div>
            
            <div class="visualizer-legend">
              <div class="legend-item">
                <span class="legend-color" style="background: var(--color-accent-red)"></span>
                <span>Bass (Low)</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: var(--color-accent-green)"></span>
                <span>Mid Range</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: var(--color-accent-blue)"></span>
                <span>Treble (High)</span>
              </div>
            </div>
          </div>
          
          <!-- Fallback for non-WebGL browsers -->
          <div class="visualizer-fallback" hidden>
            <p>Your browser doesn't support advanced audio visualization. 
            The audio player above still works perfectly!</p>
          </div>
        </div>
        
        <!-- Create Your Prism -->
        <div class="prism-creator-section neo-flat">
          <h3>Create Your Prism</h3>
          <p class="section-description">Design your own light spectrum inspired by the iconic album cover</p>
          
          <div class="prism-creator">
            <div class="prism-preview">
              <svg 
                id="prism-svg" 
                viewBox="0 0 400 300" 
                class="prism-svg"
                role="img"
                aria-label="Interactive prism spectrum designer"
              >
                <!-- Light beam entering -->
                <defs>
                  <linearGradient id="lightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
                  </linearGradient>
                  
                  <!-- Spectrum gradient (user-customizable) -->
                  <linearGradient id="spectrumGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" id="spectrum-color-1" style="stop-color:#ff0000" />
                    <stop offset="20%" id="spectrum-color-2" style="stop-color:#ff7f00" />
                    <stop offset="40%" id="spectrum-color-3" style="stop-color:#ffff00" />
                    <stop offset="60%" id="spectrum-color-4" style="stop-color:#00ff00" />
                    <stop offset="80%" id="spectrum-color-5" style="stop-color:#0000ff" />
                    <stop offset="100%" id="spectrum-color-6" style="stop-color:#8b00ff" />
                  </linearGradient>
                </defs>
                
                <!-- White light beam -->
                <rect x="20" y="140" width="100" height="20" fill="url(#lightBeam)" opacity="0.8" />
                
                <!-- Prism triangle -->
                <polygon 
                  points="150,100 150,200 220,150" 
                  fill="rgba(255,255,255,0.1)" 
                  stroke="rgba(255,255,255,0.5)"
                  stroke-width="2"
                />
                
                <!-- Spectrum rays -->
                <g id="spectrum-rays">
                  <path d="M 220 150 L 380 80" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 100" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 120" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 140" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 160" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 180" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 200" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                  <path d="M 220 150 L 380 220" stroke="url(#spectrumGradient)" stroke-width="8" opacity="0.9" />
                </g>
                
                <!-- Glow effect -->
                <circle cx="185" cy="150" r="30" fill="white" opacity="0.1" filter="blur(10px)" />
              </svg>
            </div>
            
            <div class="prism-controls">
              <div class="color-sliders">
                <div class="color-control">
                  <label for="color-1">Red</label>
                  <input type="color" id="color-1" value="#ff0000" class="color-picker neo-input">
                </div>
                <div class="color-control">
                  <label for="color-2">Orange</label>
                  <input type="color" id="color-2" value="#ff7f00" class="color-picker neo-input">
                </div>
                <div class="color-control">
                  <label for="color-3">Yellow</label>
                  <input type="color" id="color-3" value="#ffff00" class="color-picker neo-input">
                </div>
                <div class="color-control">
                  <label for="color-4">Green</label>
                  <input type="color" id="color-4" value="#00ff00" class="color-picker neo-input">
                </div>
                <div class="color-control">
                  <label for="color-5">Blue</label>
                  <input type="color" id="color-5" value="#0000ff" class="color-picker neo-input">
                </div>
                <div class="color-control">
                  <label for="color-6">Purple</label>
                  <input type="color" id="color-6" value="#8b00ff" class="color-picker neo-input">
                </div>
              </div>
              
              <div class="prism-actions">
                <button id="reset-prism" class="neo-button">Reset to Classic</button>
                <button id="random-prism" class="neo-button neo-button--accent">Random Colors</button>
                <button id="save-prism" class="neo-button neo-button--primary">Save Design</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Personality Quiz -->
        <div class="quiz-section neo-flat">
          <h3>Which Dark Side Track Are You?</h3>
          <p class="section-description">Take this personality quiz to find out which track matches your personality</p>
          
          <div id="quiz-container" class="quiz-container">
            <!-- Quiz will be rendered here -->
            ${renderQuizStart()}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;

    // Initialize Lucide icons in the container
    if (window.initLucideIcons) window.initLucideIcons(container);

    // Set up all interactive features
    setupVisualizer(container, tracks);
    setupPrismCreator(container);
    setupQuiz(container, tracks);

  } catch (error) {
    console.error('Failed to render interactive experience:', error);
    container.innerHTML = `
      <div class="error-message neo-flat">
        <p>Unable to load interactive features. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Set up audio visualizer
 */
function setupVisualizer(container, tracks) {
  const canvas = container.querySelector('#audio-visualizer');
  const trackSelect = container.querySelector('#visualizer-track-select');
  const playBtn = container.querySelector('#visualizer-play-btn');
  const stopBtn = container.querySelector('#visualizer-stop-btn');
  const fallback = container.querySelector('.visualizer-fallback');
  
  // Check for Web Audio API support
  if (!window.AudioContext && !window.webkitAudioContext) {
    fallback.hidden = false;
    canvas.parentElement.hidden = true;
    return;
  }
  
  // Enable play button when track selected
  trackSelect.addEventListener('change', () => {
    playBtn.disabled = !trackSelect.value;
  });
  
  playBtn.addEventListener('click', () => {
    const audioUrl = trackSelect.value;
    if (!audioUrl) return;
    
    // Create audio element
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    
    // Set up Web Audio API
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Play audio
    audio.play();
    playBtn.disabled = true;
    stopBtn.disabled = false;
    
    // Start visualization
    visualize();
    
    // Handle audio end
    audio.addEventListener('ended', () => {
      stopVisualizer();
    });
    
    // Store reference for stopping
    window.currentVisualizerAudio = audio;
  });
  
  stopBtn.addEventListener('click', stopVisualizer);
  
  function visualize() {
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
      animationId = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Clear canvas
      ctx.fillStyle = 'rgba(224, 229, 236, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        // Color based on frequency
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        
        // Draw mirrored bars
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    }
    
    draw();
  }
  
  function stopVisualizer() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    if (window.currentVisualizerAudio) {
      window.currentVisualizerAudio.pause();
      window.currentVisualizerAudio.currentTime = 0;
      window.currentVisualizerAudio = null;
    }
    
    playBtn.disabled = false;
    stopBtn.disabled = true;
    
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Set up prism creator
 */
function setupPrismCreator(container) {
  const colorInputs = container.querySelectorAll('.color-picker');
  const resetBtn = container.querySelector('#reset-prism');
  const randomBtn = container.querySelector('#random-prism');
  const saveBtn = container.querySelector('#save-prism');
  
  // Update spectrum when colors change
  colorInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      const gradientStop = document.getElementById(`spectrum-color-${index + 1}`);
      if (gradientStop) {
        gradientStop.style.stopColor = input.value;
      }
    });
  });
  
  // Reset to classic colors
  resetBtn.addEventListener('click', () => {
    const classicColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    colorInputs.forEach((input, index) => {
      input.value = classicColors[index];
      const gradientStop = document.getElementById(`spectrum-color-${index + 1}`);
      if (gradientStop) {
        gradientStop.style.stopColor = classicColors[index];
      }
    });
    a11y.announce('Reset to classic rainbow colors');
  });
  
  // Random colors
  randomBtn.addEventListener('click', () => {
    colorInputs.forEach((input, index) => {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      input.value = randomColor;
      const gradientStop = document.getElementById(`spectrum-color-${index + 1}`);
      if (gradientStop) {
        gradientStop.style.stopColor = randomColor;
      }
    });
    a11y.announce('Applied random colors');
  });
  
  // Save design
  saveBtn.addEventListener('click', () => {
    const colors = Array.from(colorInputs).map(input => input.value);
    const design = {
      colors,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const saved = localStorage.setItem('prismDesign', JSON.stringify(design));
    
    // Show confirmation
    saveBtn.innerHTML = '<i data-lucide="check"></i> Saved!';
    if (window.initLucideIcons) window.initLucideIcons(saveBtn); // Initialize the icon
    setTimeout(() => {
      saveBtn.textContent = 'Save Design';
    }, 2000);
    
    a11y.announce('Prism design saved');
  });
  
  // Load saved design if exists
  const saved = localStorage.getItem('prismDesign');
  if (saved) {
    try {
      const design = JSON.parse(saved);
      if (design.colors && design.colors.length === 6) {
        design.colors.forEach((color, index) => {
          colorInputs[index].value = color;
          const gradientStop = document.getElementById(`spectrum-color-${index + 1}`);
          if (gradientStop) {
            gradientStop.style.stopColor = color;
          }
        });
      }
    } catch (e) {
      console.log('Could not load saved prism design');
    }
  }
}

/**
 * Render quiz start screen
 */
function renderQuizStart() {
  return `
    <div class="quiz-start">
      <div class="quiz-intro">
        <p>Answer 5 questions to discover which Dark Side of the Moon track matches your personality.</p>
        <p>This quiz takes about 2 minutes to complete.</p>
      </div>
      <button id="start-quiz" class="neo-button neo-button--primary quiz-start-btn">
        Start Quiz
      </button>
      
      ${renderSavedResult()}
    </div>
  `;
}

/**
 * Render saved quiz result if exists
 */
function renderSavedResult() {
  const saved = storage.getQuizResult();
  if (!saved) return '';
  
  return `
    <div class="saved-result neo-concave">
      <p>You previously got: <strong>${saved.trackMatch}</strong></p>
      <button id="retake-quiz" class="neo-button">Retake Quiz</button>
    </div>
  `;
}

/**
 * Set up personality quiz
 */
function setupQuiz(container, tracks) {
  const quizContainer = container.querySelector('#quiz-container');
  
  const questions = [
    {
      id: 1,
      question: "How do you prefer to spend your free time?",
      answers: [
        { text: "Contemplating life's big questions", track: "Breathe" },
        { text: "Being productive and organized", track: "Time" },
        { text: "Pursuing wealth and success", track: "Money" },
        { text: "Exploring creative outlets", track: "Any Colour You Like" },
        { text: "Helping others", track: "Us and Them" }
      ]
    },
    {
      id: 2,
      question: "What is your greatest fear?",
      answers: [
        { text: "Running out of time", track: "Time" },
        { text: "Losing my mind", track: "Brain Damage" },
        { text: "Death and the unknown", track: "The Great Gig in the Sky" },
        { text: "Financial instability", track: "Money" },
        { text: "Conflict and war", track: "Us and Them" }
      ]
    },
    {
      id: 3,
      question: "Which word best describes your personality?",
      answers: [
        { text: "Peaceful", track: "Breathe" },
        { text: "Intense", track: "Time" },
        { text: "Ambitious", track: "Money" },
        { text: "Mysterious", track: "Eclipse" },
        { text: "Empathetic", track: "Us and Them" }
      ]
    },
    {
      id: 4,
      question: "What motivates you most?",
      answers: [
        { text: "Inner peace", track: "Breathe" },
        { text: "Achievement", track: "Time" },
        { text: "Material success", track: "Money" },
        { text: "Understanding life", track: "Eclipse" },
        { text: "Making a difference", track: "Us and Them" }
      ]
    },
    {
      id: 5,
      question: "How do you handle stress?",
      answers: [
        { text: "Take a step back and breathe", track: "Breathe" },
        { text: "Push through and stay busy", track: "On the Run" },
        { text: "Treat myself to something nice", track: "Money" },
        { text: "Express my emotions", track: "The Great Gig in the Sky" },
        { text: "Seek support from others", track: "Us and Them" }
      ]
    }
  ];
  
  let currentQuestion = 0;
  const answers = [];
  
  // Start quiz
  quizContainer.addEventListener('click', (e) => {
    if (e.target.id === 'start-quiz' || e.target.id === 'retake-quiz') {
      currentQuestion = 0;
      answers.length = 0;
      showQuestion();
    }
  });
  
  function showQuestion() {
    const question = questions[currentQuestion];
    
    quizContainer.innerHTML = `
      <div class="quiz-question">
        <div class="quiz-progress">
          <div class="progress-bar neo-progress">
            <div class="progress-fill neo-progress-bar" style="width: ${(currentQuestion / questions.length) * 100}%"></div>
          </div>
          <span class="progress-text">Question ${currentQuestion + 1} of ${questions.length}</span>
        </div>
        
        <h4 class="question-text">${question.question}</h4>
        
        <div class="quiz-answers">
          ${question.answers.map((answer, index) => `
            <button class="quiz-answer-btn neo-convex" data-track="${answer.track}" data-index="${index}">
              ${answer.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add click handlers
    quizContainer.querySelectorAll('.quiz-answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const track = btn.dataset.track;
        answers.push(track);
        
        if (currentQuestion < questions.length - 1) {
          currentQuestion++;
          showQuestion();
        } else {
          showResult();
        }
      });
    });
  }
  
  function showResult() {
    // Calculate result (most frequent track)
    const trackCounts = {};
    answers.forEach(track => {
      trackCounts[track] = (trackCounts[track] || 0) + 1;
    });
    
    const resultTrack = Object.entries(trackCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    const track = tracks.find(t => t.title === resultTrack);
    
    // Save result
    storage.saveQuizResult(resultTrack);
    
    quizContainer.innerHTML = `
      <div class="quiz-result">
        <h4>You are...</h4>
        <div class="result-track neo-convex">
          <h2 class="result-title">${resultTrack}</h2>
          ${track ? `
            <p class="result-duration">${track.duration}</p>
            <p class="result-description">${track.musicalAnalysis.substring(0, 150)}...</p>
          ` : ''}
        </div>
        
        <div class="result-actions">
          <a href="#tracks" class="neo-button" id="listen-result">Listen to This Track</a>
          <button class="neo-button" id="retake-result">Retake Quiz</button>
        </div>
        
        <p class="result-save-note">Your result has been saved!</p>
      </div>
    `;
    
    // Handle listen button
    const listenBtn = quizContainer.querySelector('#listen-result');
    if (listenBtn && track) {
      listenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const tracksSection = document.getElementById('tracks');
        if (tracksSection) {
          tracksSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            const trackElement = document.querySelector(`.track-item[data-track-id="${track.id}"]`);
            if (trackElement) {
              trackElement.click();
              trackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      });
    }
    
    // Handle retake button
    const retakeBtn = quizContainer.querySelector('#retake-result');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        currentQuestion = 0;
        answers.length = 0;
        showQuestion();
      });
    }
    
    a11y.announce(`Quiz complete! You are ${resultTrack}`);
  }
}

export default renderInteractiveExperience;
