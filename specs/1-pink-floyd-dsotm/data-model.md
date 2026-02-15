# Data Model

**Feature**: Pink Floyd DSOTM Fan Website  
**Source**: Feature Specification Entities  
**Format**: SQLite Schema (development) → JSON (production)

---

## Entity Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AlbumMetadata  │────▶│     Track       │◀────│     Theme       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                ┌──────┴──────┐               │
         │                │             │               │
         ▼                ▼             ▼               ▼
┌─────────────────┐  ┌─────────┐  ┌──────────┐  ┌─────────────────┐
│    Artwork      │  │Equipment│  │UserPrefs │  │ AnalyticsEvent  │
└─────────────────┘  └─────────┘  └──────────┘  └─────────────────┘
```

---

## Entities

### 1. AlbumMetadata

**Description**: Core album information and commercial statistics

**SQLite Schema**:
```sql
CREATE TABLE album_metadata (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    release_date DATE NOT NULL,
    record_label TEXT NOT NULL,
    producer TEXT NOT NULL,
    recording_location TEXT,
    recording_start_date DATE,
    recording_end_date DATE,
    overview_text TEXT,           -- 300-500 word overview
    sales_figures TEXT,           -- JSON: {worldwide: "45M+", billboard_weeks: 900}
    chart_positions TEXT,         -- JSON array of {chart: string, position: number}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**JSON Output** (`album.json`):
```json
{
  "title": "The Dark Side of the Moon",
  "releaseDate": "1973-03-01",
  "recordLabel": "Harvest/Capitol",
  "producer": "Pink Floyd with Alan Parsons engineering",
  "recordingLocation": "Abbey Road Studios, London",
  "recordingStartDate": "1972-05-01",
  "recordingEndDate": "1973-01-01",
  "overviewText": "...",
  "salesFigures": {
    "worldwide": "45+ million",
    "billboardWeeks": 900
  },
  "chartPositions": [
    {"chart": "Billboard 200", "position": 1, "year": 1973}
  ]
}
```

---

### 2. Track

**Description**: Album track information with analysis and audio metadata

**SQLite Schema**:
```sql
CREATE TABLE tracks (
    id INTEGER PRIMARY KEY,
    track_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    duration TEXT NOT NULL,       -- Format: "MM:SS"
    composers TEXT NOT NULL,      -- JSON array
    themes TEXT NOT NULL,         -- JSON array of theme slugs
    lyrics_excerpt TEXT,          -- <10% of total lyrics (fair use)
    musical_analysis TEXT,        -- Technical analysis
    cultural_significance TEXT,   -- Historical context
    audio_preview_filename TEXT,  -- "track-01-time-preview.mp3"
    waveform_data TEXT,           -- JSON array of amplitude values
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO tracks VALUES
(1, 1, 'Speak to Me', '1:30', '["Nick Mason"]', '["madness"]', 
 '...', '...', '...', 'track-01-speak-to-me-preview.mp3', '[0.1, 0.3, ...]');
```

**JSON Output** (`tracks.json`):
```json
{
  "tracks": [
    {
      "id": 1,
      "trackNumber": 1,
      "title": "Speak to Me",
      "duration": "1:30",
      "composers": ["Nick Mason"],
      "themes": ["madness"],
      "lyricsExcerpt": "...",
      "musicalAnalysis": "...",
      "culturalSignificance": "...",
      "audioPreviewUrl": "/assets/audio/track-01-speak-to-me-preview.mp3",
      "waveformData": [0.1, 0.3, 0.5, 0.2, ...]
    }
  ]
}
```

**Validation Rules**:
- `track_number`: 1-10 (album has exactly 10 tracks)
- `duration`: Valid MM:SS format
- `lyrics_excerpt`: Maximum 10% of total lyrics per track
- `audio_preview_filename`: Must exist in assets/audio/

---

### 3. Theme

**Description**: Conceptual analysis themes linking to tracks

**SQLite Schema**:
```sql
CREATE TABLE themes (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,    -- URL-friendly identifier
    name TEXT NOT NULL,           -- Display name
    description TEXT NOT NULL,    -- 150-250 word analysis
    icon TEXT,                    -- Icon name or SVG reference
    color_accent TEXT NOT NULL,   -- Hex color for UI theming
    display_order INTEGER,        -- Sort order
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO themes (slug, name, description, color_accent, display_order) VALUES
('time', 'Time', '...analysis text...', '#FF6B6B', 1),
('death', 'Death & Mortality', '...', '#4ECDC4', 2),
('money', 'Money & Greed', '...', '#45B7D1', 3),
('mental-health', 'Mental Health', '...', '#96CEB4', 4),
('conflict', 'Conflict & War', '...', '#FFEAA7', 5);
```

**JSON Output** (`themes.json`):
```json
{
  "themes": [
    {
      "slug": "time",
      "name": "Time",
      "description": "150-250 word analysis...",
      "icon": "clock",
      "colorAccent": "#FF6B6B",
      "associatedTracks": ["Time", "Breathe"],
      "displayOrder": 1
    }
  ]
}
```

**Validation Rules**:
- `slug`: kebab-case, unique
- `description`: 150-250 words
- `color_accent`: Valid hex color

---

### 4. Artwork

**Description**: Visual artwork and gallery images

**SQLite Schema**:
```sql
CREATE TABLE artwork (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,       -- 'cover', 'variant', 'promo', 'behind-scenes'
    image_filename TEXT NOT NULL, -- High-res image filename
    thumbnail_filename TEXT,      -- Optimized thumbnail filename
    designer TEXT,                -- Storm Thorgerson, Hipgnosis, etc.
    description TEXT,
    year INTEGER,
    copyright_notice TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT 0, -- Primary album cover
    display_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**JSON Output** (`artwork.json`):
```json
{
  "artwork": [
    {
      "id": 1,
      "title": "Prism Album Cover",
      "category": "cover",
      "imageUrl": "/assets/images/artwork/prism-cover.webp",
      "thumbnailUrl": "/assets/images/artwork/thumbnails/prism-cover.webp",
      "designer": "Storm Thorgerson / Hipgnosis",
      "description": "Iconic prism dispersing white light into spectrum...",
      "year": 1973,
      "copyrightNotice": "© 1973 Pink Floyd Music Ltd. Design by Hipgnosis.",
      "isPrimary": true,
      "displayOrder": 1
    }
  ]
}
```

**Categories**:
- `cover`: Official album covers
- `variant`: International variants
- `promo`: Promotional materials
- `behind-scenes`: Recording session photos

---

### 5. Equipment

**Description**: Recording equipment and technical specifications

**SQLite Schema**:
```sql
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,           -- 'synthesizer', 'mixer', 'effects', 'tape'
    manufacturer TEXT,
    model TEXT,
    specifications TEXT,          -- Technical specs
    image_filename TEXT,
    usage_description TEXT,       -- How it was used on the album
    associated_tracks TEXT,       -- JSON array of track titles
    display_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**JSON Output** (`equipment.json`):
```json
{
  "equipment": [
    {
      "id": 1,
      "name": "EMS Synthi AKS",
      "type": "synthesizer",
      "manufacturer": "EMS",
      "model": "Synthi AKS",
      "specifications": "Portable synthesizer with pin matrix...",
      "imageUrl": "/assets/images/equipment/ems-synthi.webp",
      "usageDescription": "Used extensively on 'On the Run'...",
      "associatedTracks": ["On the Run", "Any Colour You Like"]
    }
  ]
}
```

---

### 6. UserPreferences (Client-Side Only)

**Description**: User settings stored in browser localStorage

**No SQLite Table** - Stored client-side only

**Schema**:
```typescript
interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  quizResults?: {
    trackMatch: string;
    date: string;
  };
}
```

**localStorage Key**: `dsotm-preferences`

---

### 7. AnalyticsEvent (Privacy-Compliant)

**Description**: Anonymous usage tracking (if analytics enabled)

**SQLite Schema** (if storing server-side, optional):
```sql
CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY,
    event_type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT NOT NULL,     -- Anonymous session identifier
    page_path TEXT,
    metadata TEXT                 -- JSON: {trackId: 1, action: 'play'}
);
```

**Privacy Compliance**:
- No PII collected
- Session ID is random UUID, not linked to identity
- GDPR/CCPA compliant (no cookie consent required)

---

## JSON Output Files

The build process generates these static JSON files from SQLite:

```
public/data/
├── album.json          # AlbumMetadata (single object)
├── tracks.json         # Track[] (10 items)
├── themes.json         # Theme[] (5 items)
├── artwork.json        # Artwork[] (10-20 items)
├── equipment.json      # Equipment[] (8-12 items)
└── index.json          # Combined manifest for fast lookup
```

### Index Manifest

`index.json` provides quick reference without loading all data:

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-15T10:30:00Z",
  "album": {
    "title": "The Dark Side of the Moon",
    "slug": "dark-side-of-the-moon",
    "coverImage": "/assets/images/artwork/prism-cover.webp"
  },
  "tracks": [
    {"id": 1, "slug": "speak-to-me", "title": "Speak to Me", "duration": "1:30"},
    ...
  ],
  "themes": [
    {"slug": "time", "name": "Time", "colorAccent": "#FF6B6B"},
    ...
  ],
  "stats": {
    "totalTracks": 10,
    "totalThemes": 5,
    "totalArtwork": 15
  }
}
```

---

## Build-Time Data Pipeline

```
┌──────────────────┐
│  data/           │
│  database.sqlite │
└────────┬─────────┘
         │ 1. Query all tables
         ▼
┌──────────────────┐
│  tools/          │
│  build-db.js     │
└────────┬─────────┘
         │ 2. Transform & validate
         ▼
┌──────────────────┐
│  public/data/    │
│  *.json files    │
└────────┬─────────┘
         │ 3. Vite processes
         ▼
┌──────────────────┐
│  dist/           │
│  (production)    │
└──────────────────┘
```

### Build Script (`tools/build-db.js`)

Key responsibilities:
1. Connect to SQLite database
2. Query each table
3. Transform to camelCase JSON
4. Validate against schemas
5. Write to `public/data/`
6. Generate `index.json` manifest

---

## Data Validation Rules

### Required Fields (All Entities)
- `id`: Unique integer
- `created_at`: ISO 8601 timestamp

### Audio Constraints (Fair Use Compliance)
- All audio files: Exactly 30 seconds
- Format: MP3, 128kbps CBR
- File naming: `track-{NN}-{slug}-preview.mp3`

### Image Constraints
- Format: WebP with JPEG fallback
- Thumbnails: <50KB
- Gallery images: <200KB
- Full resolution: <500KB

### Text Constraints
- Album overview: 300-500 words
- Theme descriptions: 150-250 words
- Lyrics excerpts: <10% per track
- All text: UTF-8 encoding

---

## Update Workflow

**Quarterly Content Updates**:

1. Update SQLite database with new content
2. Run `npm run build` to regenerate JSON
3. Validate with `npm run test:data`
4. Deploy updated static files
5. Clear CDN cache (if using CDN)

**Emergency Updates** (legal/compliance):

1. Direct database edit
2. Immediate rebuild and deploy
3. Document change in changelog
