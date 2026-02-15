import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');

console.log('Building JSON files from SQLite database...');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
  console.error('✗ Database not found. Run: npm run db:init');
  process.exit(1);
}

const db = new Database(DB_PATH);

// Helper function to convert snake_case to camelCase
function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// Helper function to parse JSON fields
function parseJsonFields(row, jsonFields) {
  const parsed = { ...row };
  jsonFields.forEach(field => {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch (e) {
        parsed[field] = parsed[field];
      }
    }
  });
  return parsed;
}

try {
  // Build album.json
  console.log('  → Building album.json...');
  const albumRow = db.prepare('SELECT * FROM album_metadata LIMIT 1').get();
  if (albumRow) {
    const album = toCamelCase(parseJsonFields(albumRow, ['sales_figures', 'chart_positions']));
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'album.json'),
      JSON.stringify(album, null, 2)
    );
  }

  // Build tracks.json
  console.log('  → Building tracks.json...');
  const trackRows = db.prepare('SELECT * FROM tracks ORDER BY track_number').all();
  const tracks = trackRows.map(row => {
    const parsed = parseJsonFields(row, ['composers', 'themes', 'waveform_data']);
    const camelRow = toCamelCase(parsed);
    // Add full audio URL
    if (camelRow.audioPreviewFilename) {
      camelRow.audioPreviewUrl = `/assets/audio/${camelRow.audioPreviewFilename}`;
    }
    return camelRow;
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'tracks.json'),
    JSON.stringify({ tracks }, null, 2)
  );

  // Build themes.json
  console.log('  → Building themes.json...');
  const themeRows = db.prepare('SELECT * FROM themes ORDER BY display_order').all();
  const themes = themeRows.map(row => {
    const camelRow = toCamelCase(row);
    // Get associated tracks for this theme
    const trackRows = db.prepare(
      'SELECT title FROM tracks WHERE themes LIKE ? ORDER BY track_number'
    ).all(`%"${camelRow.slug}"%`);
    camelRow.associatedTracks = trackRows.map(t => t.title);
    return camelRow;
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'themes.json'),
    JSON.stringify({ themes }, null, 2)
  );

  // Build artwork.json
  console.log('  → Building artwork.json...');
  const artworkRows = db.prepare('SELECT * FROM artwork ORDER BY display_order').all();
  const artwork = artworkRows.map(row => {
    const camelRow = toCamelCase(row);
    // Add full image URLs
    if (camelRow.imageFilename) {
      camelRow.imageUrl = `/assets/images/artwork/${camelRow.imageFilename}`;
    }
    if (camelRow.thumbnailFilename) {
      camelRow.thumbnailUrl = `/assets/images/artwork/thumbnails/${camelRow.thumbnailFilename}`;
    }
    return camelRow;
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'artwork.json'),
    JSON.stringify({ artwork }, null, 2)
  );

  // Build equipment.json
  console.log('  → Building equipment.json...');
  const equipmentRows = db.prepare('SELECT * FROM equipment ORDER BY display_order').all();
  const equipment = equipmentRows.map(row => {
    const parsed = parseJsonFields(row, ['associated_tracks']);
    const camelRow = toCamelCase(parsed);
    if (camelRow.imageFilename) {
      camelRow.imageUrl = `/assets/images/equipment/${camelRow.imageFilename}`;
    }
    return camelRow;
  });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'equipment.json'),
    JSON.stringify({ equipment }, null, 2)
  );

  // Build index.json (manifest)
  console.log('  → Building index.json (manifest)...');
  const albumData = albumRow ? toCamelCase(parseJsonFields(albumRow, ['sales_figures'])) : {};
  const artworkPrimary = artwork.find(a => a.isPrimary);
  
  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    album: {
      title: albumData.title || 'The Dark Side of the Moon',
      slug: 'dark-side-of-the-moon',
      coverImage: artworkPrimary ? artworkPrimary.imageUrl : '/assets/images/artwork/prism-cover.webp'
    },
    tracks: tracks.map(t => ({
      id: t.id,
      slug: t.title.toLowerCase().replace(/\s+/g, '-'),
      title: t.title,
      duration: t.duration
    })),
    themes: themes.map(th => ({
      slug: th.slug,
      name: th.name,
      colorAccent: th.colorAccent
    })),
    stats: {
      totalTracks: tracks.length,
      totalThemes: themes.length,
      totalArtwork: artwork.length
    }
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('✓ All JSON files built successfully');
  console.log(`  Output: ${OUTPUT_DIR}`);
  
} catch (error) {
  console.error('✗ Build failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
