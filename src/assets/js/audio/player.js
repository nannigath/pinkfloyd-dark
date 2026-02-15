/* ==========================================================================
   Audio Player Module
   Handles audio playback, 30-second limit enforcement, and crossfade
   ========================================================================== */

/**
 * Audio Player singleton
 * Manages global audio state and ensures only one track plays at a time
 */
class AudioPlayer {
  constructor() {
    this.currentAudio = null;
    this.currentTrackId = null;
    this.playCount = parseInt(sessionStorage.getItem('playCount') || '0');
    this.listeners = new Map();
  }

  /**
   * Play a track
   * @param {HTMLAudioElement} audioElement - Audio element to play
   * @param {number} trackId - Track ID
   * @returns {boolean} Success
   */
  play(audioElement, trackId) {
    // Rate limiting check
    if (this.playCount >= 100) {
      this.emit('rateLimitExceeded');
      return false;
    }

    // Stop current audio if different track
    if (this.currentAudio && this.currentAudio !== audioElement) {
      this.stop();
    }

    // Play new audio
    this.currentAudio = audioElement;
    this.currentTrackId = trackId;
    
    audioElement.play();
    this.playCount++;
    sessionStorage.setItem('playCount', this.playCount.toString());
    
    this.emit('play', { trackId });
    
    // Set up 30-second limit
    this.setupThirtySecondLimit(audioElement);
    
    return true;
  }

  /**
   * Pause current audio
   */
  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.emit('pause', { trackId: this.currentTrackId });
    }
  }

  /**
   * Stop current audio
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.emit('stop', { trackId: this.currentTrackId });
      this.currentAudio = null;
      this.currentTrackId = null;
    }
  }

  /**
   * Toggle play/pause
   * @param {HTMLAudioElement} audioElement - Audio element
   * @param {number} trackId - Track ID
   * @returns {boolean} New playing state
   */
  toggle(audioElement, trackId) {
    if (this.currentAudio === audioElement && !audioElement.paused) {
      this.pause();
      return false;
    } else {
      return this.play(audioElement, trackId);
    }
  }

  /**
   * Set up 30-second auto-stop
   */
  setupThirtySecondLimit(audioElement) {
    const checkTime = () => {
      if (audioElement.currentTime >= 30) {
        audioElement.pause();
        audioElement.currentTime = 0;
        this.emit('thirtySecondLimit', { trackId: this.currentTrackId });
      }
    };

    audioElement.addEventListener('timeupdate', checkTime);
    
    // Clean up listener when audio ends or pauses
    const cleanup = () => {
      audioElement.removeEventListener('timeupdate', checkTime);
      audioElement.removeEventListener('ended', cleanup);
      audioElement.removeEventListener('pause', cleanup);
    };
    
    audioElement.addEventListener('ended', cleanup);
    audioElement.addEventListener('pause', cleanup);
  }

  /**
   * Get current playback progress
   * @returns {number} Progress percentage (0-100)
   */
  getProgress() {
    if (!this.currentAudio || !this.currentAudio.duration) {
      return 0;
    }
    return (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
  }

  /**
   * Get formatted current time
   * @returns {string} Time in MM:SS format
   */
  getCurrentTime() {
    if (!this.currentAudio) return '0:00';
    return this.formatTime(this.currentAudio.currentTime);
  }

  /**
   * Format time in MM:SS
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if currently playing
   * @returns {boolean}
   */
  isPlaying() {
    return this.currentAudio && !this.currentAudio.paused;
  }

  /**
   * Get remaining plays in session
   * @returns {number}
   */
  getRemainingPlays() {
    return Math.max(0, 100 - this.playCount);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event, data = {}) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }
}

// Create singleton instance
export const audioPlayer = new AudioPlayer();

export default audioPlayer;
