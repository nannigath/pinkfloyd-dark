import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);

console.log('Initializing database schema...');

// Create tables
db.exec(`
  -- Album metadata table
  CREATE TABLE IF NOT EXISTS album_metadata (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    release_date DATE NOT NULL,
    record_label TEXT NOT NULL,
    producer TEXT NOT NULL,
    recording_location TEXT,
    recording_start_date DATE,
    recording_end_date DATE,
    overview_text TEXT,
    sales_figures TEXT,
    chart_positions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tracks table
  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY,
    track_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    composers TEXT NOT NULL,
    themes TEXT NOT NULL,
    lyrics_excerpt TEXT,
    musical_analysis TEXT,
    cultural_significance TEXT,
    audio_preview_filename TEXT,
    waveform_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Themes table
  CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    color_accent TEXT NOT NULL,
    display_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Artwork table
  CREATE TABLE IF NOT EXISTS artwork (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_filename TEXT NOT NULL,
    thumbnail_filename TEXT,
    designer TEXT,
    description TEXT,
    year INTEGER,
    copyright_notice TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    display_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Equipment table
  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    specifications TEXT,
    image_filename TEXT,
    usage_description TEXT,
    associated_tracks TEXT,
    display_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Analytics events table (optional, for server-side storage)
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY,
    event_type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT NOT NULL,
    page_path TEXT,
    metadata TEXT
  );
`);

console.log('✓ Database schema initialized successfully');
console.log(`  Location: ${DB_PATH}`);

db.close();
