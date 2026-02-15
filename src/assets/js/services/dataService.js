/* ==========================================================================
   Data Service Module
   JSON fetching with caching for static data files
   ========================================================================== */

const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const cache = new Map();

/**
 * Fetch data from JSON endpoint with caching
 * @param {string} endpoint - The data endpoint (e.g., 'tracks', 'album')
 * @returns {Promise<Object>} The parsed JSON data
 */
async function fetchData(endpoint) {
  // Check cache first
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[DataService] Cache hit: ${endpoint}`);
    return cached.data;
  }
  
  try {
    const response = await fetch(`/data/${endpoint}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${endpoint}: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache
    cache.set(endpoint, {
      data,
      timestamp: Date.now()
    });
    
    console.log(`[DataService] Fetched: ${endpoint}`);
    return data;
    
  } catch (error) {
    console.error(`[DataService] Error loading ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Clear the entire cache or a specific endpoint
 * @param {string} [endpoint] - Optional endpoint to clear, clears all if omitted
 */
function clearCache(endpoint) {
  if (endpoint) {
    cache.delete(endpoint);
    console.log(`[DataService] Cache cleared: ${endpoint}`);
  } else {
    cache.clear();
    console.log('[DataService] Cache cleared: all');
  }
}

/**
 * Preload multiple endpoints in parallel
 * @param {string[]} endpoints - Array of endpoint names
 * @returns {Promise<Object>} Object with endpoint names as keys
 */
async function preloadData(endpoints) {
  const promises = endpoints.map(async (endpoint) => {
    try {
      const data = await fetchData(endpoint);
      return [endpoint, data];
    } catch (error) {
      console.error(`[DataService] Failed to preload ${endpoint}:`, error);
      return [endpoint, null];
    }
  });
  
  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}

// Data API exports
export const dataApi = {
  /**
   * Get the site manifest
   * @returns {Promise<Object>} Site manifest with album info, tracks list, themes list
   */
  getManifest: () => fetchData('index'),
  
  /**
   * Get full album metadata
   * @returns {Promise<Object>} Album metadata
   */
  getAlbum: () => fetchData('album'),
  
  /**
   * Get all tracks
   * @returns {Promise<Object>} Object with tracks array
   */
  getTracks: () => fetchData('tracks'),
  
  /**
   * Get a specific track by ID
   * @param {number} id - Track ID
   * @returns {Promise<Object|null>} Track object or null if not found
   */
  getTrackById: async (id) => {
    const { tracks } = await fetchData('tracks');
    return tracks.find(track => track.id === id) || null;
  },
  
  /**
   * Get a specific track by slug
   * @param {string} slug - Track slug (e.g., 'time', 'money')
   * @returns {Promise<Object|null>} Track object or null if not found
   */
  getTrackBySlug: async (slug) => {
    const { tracks } = await fetchData('tracks');
    return tracks.find(track => 
      track.title.toLowerCase().replace(/\s+/g, '-') === slug
    ) || null;
  },
  
  /**
   * Get all themes
   * @returns {Promise<Object>} Object with themes array
   */
  getThemes: () => fetchData('themes'),
  
  /**
   * Get a specific theme by slug
   * @param {string} slug - Theme slug (e.g., 'time', 'money')
   * @returns {Promise<Object|null>} Theme object or null if not found
   */
  getThemeBySlug: async (slug) => {
    const { themes } = await fetchData('themes');
    return themes.find(theme => theme.slug === slug) || null;
  },
  
  /**
   * Get all artwork
   * @returns {Promise<Object>} Object with artwork array
   */
  getArtwork: () => fetchData('artwork'),
  
  /**
   * Get primary album artwork
   * @returns {Promise<Object|null>} Primary artwork or null
   */
  getPrimaryArtwork: async () => {
    const { artwork } = await fetchData('artwork');
    return artwork.find(item => item.isPrimary) || null;
  },
  
  /**
   * Get all equipment
   * @returns {Promise<Object>} Object with equipment array
   */
  getEquipment: () => fetchData('equipment'),
  
  // Utility functions
  clearCache,
  preloadData
};

export default dataApi;
