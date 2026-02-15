import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');

console.log('Validating database schema and data...');

if (!fs.existsSync(DB_PATH)) {
  console.error('✗ Database not found');
  process.exit(1);
}

const db = new Database(DB_PATH);
const errors = [];

try {
  // Validate tables exist
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table'"
  ).all().map(t => t.name);
  
  const requiredTables = ['album_metadata', 'tracks', 'themes', 'artwork', 'equipment'];
  requiredTables.forEach(table => {
    if (!tables.includes(table)) {
      errors.push(`Missing table: ${table}`);
    }
  });
  
  // Validate album metadata
  const album = db.prepare('SELECT * FROM album_metadata LIMIT 1').get();
  if (!album) {
    errors.push('No album metadata found');
  } else {
    if (!album.title) errors.push('Album: missing title');
    if (!album.release_date) errors.push('Album: missing release_date');
    if (!album.record_label) errors.push('Album: missing record_label');
  }
  
  // Validate tracks
  const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks').get().count;
  if (trackCount === 0) {
    errors.push('No tracks found');
  } else if (trackCount !== 10) {
    errors.push(`Expected 10 tracks, found ${trackCount}`);
  }
  
  // Validate track data
  const tracks = db.prepare('SELECT * FROM tracks').all();
  tracks.forEach(track => {
    if (!track.title) errors.push(`Track ${track.track_number}: missing title`);
    if (!track.duration) errors.push(`Track ${track.track_number}: missing duration`);
    if (!track.audio_preview_filename) {
      errors.push(`Track ${track.track_number}: missing audio_preview_filename`);
    }
  });
  
  // Validate themes
  const themeCount = db.prepare('SELECT COUNT(*) as count FROM themes').get().count;
  if (themeCount === 0) {
    errors.push('No themes found');
  }
  
  // Validate artwork
  const artworkCount = db.prepare('SELECT COUNT(*) as count FROM artwork').get().count;
  if (artworkCount === 0) {
    errors.push('No artwork found');
  }
  
  // Check for primary artwork
  const primaryArtwork = db.prepare('SELECT * FROM artwork WHERE is_primary = 1').get();
  if (!primaryArtwork) {
    errors.push('No primary artwork designated');
  }
  
  if (errors.length > 0) {
    console.error('✗ Validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('✓ Database validation passed');
    console.log(`  - Album: ${album ? album.title : 'N/A'}`);
    console.log(`  - Tracks: ${trackCount}`);
    console.log(`  - Themes: ${themeCount}`);
    console.log(`  - Artwork: ${artworkCount}`);
  }
  
} catch (error) {
  console.error('✗ Validation error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
