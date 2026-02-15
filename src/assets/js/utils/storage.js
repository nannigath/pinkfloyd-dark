/* ==========================================================================
   Storage Utility Module
   localStorage wrapper with error handling and serialization
   ========================================================================== */

const STORAGE_KEY = 'dsotm-preferences';

/**
 * Default user preferences
 */
const DEFAULT_PREFERENCES = {
  themeMode: 'system', // 'light' | 'dark' | 'system'
  reducedMotion: false,
  fontSize: 'medium', // 'small' | 'medium' | 'large'
  highContrast: false,
  quizResults: null // { trackMatch: string, date: string }
};

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all preferences from storage
 * @returns {Object} User preferences merged with defaults
 */
function getPreferences() {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage not available, using defaults');
    return { ...DEFAULT_PREFERENCES };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsed };
    
  } catch (error) {
    console.error('[Storage] Error reading preferences:', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save preferences to storage
 * @param {Object} preferences - Preferences to save
 * @returns {boolean} Success status
 */
function savePreferences(preferences) {
  if (!isStorageAvailable()) {
    console.warn('[Storage] localStorage not available');
    return false;
  }
  
  try {
    const current = getPreferences();
    const merged = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    console.log('[Storage] Preferences saved');
    return true;
    
  } catch (error) {
    console.error('[Storage] Error saving preferences:', error);
    return false;
  }
}

/**
 * Get a single preference value
 * @param {string} key - Preference key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} The preference value
 */
function getPreference(key, defaultValue = null) {
  const preferences = getPreferences();
  return preferences[key] !== undefined ? preferences[key] : defaultValue;
}

/**
 * Set a single preference value
 * @param {string} key - Preference key
 * @param {*} value - Value to set
 * @returns {boolean} Success status
 */
function setPreference(key, value) {
  return savePreferences({ [key]: value });
}

/**
 * Clear all preferences (reset to defaults)
 * @returns {boolean} Success status
 */
function clearPreferences() {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] Preferences cleared');
    return true;
    
  } catch (error) {
    console.error('[Storage] Error clearing preferences:', error);
    return false;
  }
}

/**
 * Save quiz results
 * @param {string} trackMatch - The matched track name
 * @returns {boolean} Success status
 */
function saveQuizResult(trackMatch) {
  return setPreference('quizResults', {
    trackMatch,
    date: new Date().toISOString()
  });
}

/**
 * Get saved quiz results
 * @returns {Object|null} Quiz results or null
 */
function getQuizResult() {
  return getPreference('quizResults', null);
}

/**
 * Initialize theme based on stored preference or system preference
 */
function initializeTheme() {
  const preferences = getPreferences();
  let theme = preferences.themeMode;
  
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  console.log(`[Storage] Theme initialized: ${theme}`);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  setPreference('themeMode', newTheme);
  
  console.log(`[Storage] Theme toggled: ${newTheme}`);
  return newTheme;
}

/**
 * Set specific theme
 * @param {'light'|'dark'|'system'} theme - Theme to set
 */
function setTheme(theme) {
  let appliedTheme = theme;
  
  if (theme === 'system') {
    appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', appliedTheme);
  setPreference('themeMode', theme);
  
  console.log(`[Storage] Theme set: ${theme} (applied: ${appliedTheme})`);
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
function prefersReducedMotion() {
  // Check stored preference first
  const stored = getPreference('reducedMotion', false);
  if (stored) return true;
  
  // Check system preference
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Storage API exports
export const storage = {
  getPreferences,
  savePreferences,
  getPreference,
  setPreference,
  clearPreferences,
  saveQuizResult,
  getQuizResult,
  initializeTheme,
  toggleTheme,
  setTheme,
  prefersReducedMotion,
  isStorageAvailable
};

export default storage;
