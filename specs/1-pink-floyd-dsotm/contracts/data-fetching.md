# Data Fetching Contracts

**Pattern**: Static JSON files fetched via standard HTTP GET

Since this is a static site, there is no traditional API. Instead, we define contracts for how the frontend fetches and uses JSON data files.

---

## Base URL

All data files are served from `/data/` path:

```
Production: https://example.com/data/{file}.json
Development: http://localhost:5173/data/{file}.json
```

## Endpoints (Data Files)

### 1. GET /data/index.json

**Purpose**: Manifest file for quick site overview

**Response**: `IndexManifest`

```typescript
interface IndexManifest {
  version: string;
  generatedAt: string;
  album: {
    title: string;
    slug: string;
    coverImage: string;
  };
  tracks: Array<{
    id: number;
    slug: string;
    title: string;
    duration: string;
  }>;
  themes: Array<{
    slug: string;
    name: string;
    colorAccent: string;
  }>;
  stats: {
    totalTracks: number;
    totalThemes: number;
    totalArtwork: number;
  };
}
```

**Usage**: Load on app initialization for navigation and overview

**Caching**: Cache for 1 hour (content updates quarterly)

---

### 2. GET /data/album.json

**Purpose**: Complete album metadata

**Response**: `AlbumMetadata`

```typescript
interface AlbumMetadata {
  title: string;
  releaseDate: string;        // ISO 8601 date
  recordLabel: string;
  producer: string;
  recordingLocation: string;
  recordingStartDate: string;
  recordingEndDate: string;
  overviewText: string;       // 300-500 words
  salesFigures: {
    worldwide: string;
    billboardWeeks: number;
  };
  chartPositions: Array<{
    chart: string;
    position: number;
    year: number;
  }>;
}
```

**Usage**: Album overview page

**Caching**: Cache for 1 hour

---

### 3. GET /data/tracks.json

**Purpose**: All track information

**Response**: `TracksResponse`

```typescript
interface TracksResponse {
  tracks: Track[];
}

interface Track {
  id: number;
  trackNumber: number;
  title: string;
  duration: string;           // MM:SS format
  composers: string[];
  themes: string[];           // Theme slugs
  lyricsExcerpt: string;      // <10% fair use
  musicalAnalysis: string;
  culturalSignificance: string;
  audioPreviewUrl: string;    // Path to 30s audio file
  waveformData: number[];     // Normalized amplitude values (0-1)
}
```

**Usage**: Track explorer, individual track pages

**Caching**: Cache for 1 hour

---

### 4. GET /data/themes.json

**Purpose**: Conceptual theme analysis

**Response**: `ThemesResponse`

```typescript
interface ThemesResponse {
  themes: Theme[];
}

interface Theme {
  slug: string;
  name: string;
  description: string;        // 150-250 words
  icon: string;
  colorAccent: string;        // Hex color
  associatedTracks: string[]; // Track titles
  displayOrder: number;
}
```

**Usage**: Themes explorer page

**Caching**: Cache for 1 hour

---

### 5. GET /data/artwork.json

**Purpose**: Visual art gallery data

**Response**: `ArtworkResponse`

```typescript
interface ArtworkResponse {
  artwork: Artwork[];
}

interface Artwork {
  id: number;
  title: string;
  category: 'cover' | 'variant' | 'promo' | 'behind-scenes';
  imageUrl: string;           // WebP path
  thumbnailUrl: string;       // Optimized thumbnail
  designer: string;
  description: string;
  year: number;
  copyrightNotice: string;
  isPrimary: boolean;
  displayOrder: number;
}
```

**Usage**: Art gallery, lightbox

**Caching**: Cache for 1 hour

---

### 6. GET /data/equipment.json

**Purpose**: Recording equipment and technical details

**Response**: `EquipmentResponse`

```typescript
interface EquipmentResponse {
  equipment: Equipment[];
}

interface Equipment {
  id: number;
  name: string;
  type: 'synthesizer' | 'mixer' | 'effects' | 'tape' | 'microphone';
  manufacturer: string;
  model: string;
  specifications: string;
  imageUrl: string;
  usageDescription: string;
  associatedTracks: string[];
  displayOrder: number;
}
```

**Usage**: Recording deep dive section

**Caching**: Cache for 1 hour

---

## Error Handling

Since these are static files, errors are limited to:

### 404 Not Found

**Cause**: File missing or path incorrect

**Response**: Standard HTTP 404

**Frontend Handling**:
```javascript
try {
  const response = await fetch('/data/tracks.json');
  if (!response.ok) {
    if (response.status === 404) {
      // Show error: "Content temporarily unavailable"
      // Log to error monitoring
    }
  }
} catch (error) {
  // Network error - show offline message
}
```

### JSON Parse Error

**Cause**: Corrupted or invalid JSON file

**Response**: None (parsing fails on client)

**Frontend Handling**:
```javascript
try {
  const data = await response.json();
} catch (parseError) {
  // Show error: "Failed to load content"
  // Log to error monitoring
}
```

---

## Client Implementation Pattern

### Data Service Module

```javascript
// src/js/services/dataService.js

const CACHE_DURATION = 3600000; // 1 hour
const cache = new Map();

async function fetchData(endpoint) {
  // Check cache
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Fetch fresh data
  const response = await fetch(`/data/${endpoint}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load ${endpoint}: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Update cache
  cache.set(endpoint, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}

// Exported functions
export const dataApi = {
  getManifest: () => fetchData('index'),
  getAlbum: () => fetchData('album'),
  getTracks: () => fetchData('tracks'),
  getThemes: () => fetchData('themes'),
  getArtwork: () => fetchData('artwork'),
  getEquipment: () => fetchData('equipment')
};
```

### Usage Example

```javascript
import { dataApi } from './services/dataService.js';

// Load tracks
async function loadTrackExplorer() {
  try {
    const { tracks } = await dataApi.getTracks();
    renderTrackList(tracks);
  } catch (error) {
    showErrorMessage('Unable to load tracks. Please try again later.');
    console.error('Failed to load tracks:', error);
  }
}
```

---

## Caching Strategy

### HTTP Caching

Static files served with these headers:

```
Cache-Control: public, max-age=3600
ETag: "{file-hash}"
Last-Modified: {build-timestamp}
```

### Service Worker Caching

Service worker implements stale-while-revalidate:

```javascript
// Cache data files
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/data/'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'data-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);
```

### Memory Caching

In-memory cache (shown above) prevents duplicate requests within session.

---

## Versioning

JSON files include version info in index.json:

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-15T10:30:00Z"
}
```

Breaking changes to data structure require major version bump and coordinated frontend update.

---

## Contract Testing

Verify contracts with these tests:

```javascript
// tests/contracts/data-contracts.test.js

describe('Data Contracts', () => {
  it('tracks.json matches Track interface', async () => {
    const response = await fetch('/data/tracks.json');
    const { tracks } = await response.json();
    
    tracks.forEach(track => {
      expect(track).toHaveProperty('id');
      expect(track).toHaveProperty('trackNumber');
      expect(track).toHaveProperty('title');
      expect(track).toHaveProperty('audioPreviewUrl');
      expect(track.waveformData).toBeInstanceOf(Array);
    });
  });
  
  it('all audio files exist', async () => {
    const { tracks } = await dataApi.getTracks();
    
    for (const track of tracks) {
      const response = await fetch(track.audioPreviewUrl, { method: 'HEAD' });
      expect(response.ok).toBe(true);
    }
  });
});
```
