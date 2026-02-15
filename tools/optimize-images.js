import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '..', 'src', 'assets', 'images', 'source');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'images');

console.log('Optimizing images...');

// Ensure source directory exists
if (!fs.existsSync(SOURCE_DIR)) {
  console.log('  → Creating source directory...');
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
}

// Ensure output directories exist
const artworkDir = path.join(OUTPUT_DIR, 'artwork');
const thumbnailDir = path.join(OUTPUT_DIR, 'thumbnails');
const equipmentDir = path.join(OUTPUT_DIR, 'equipment');

[OUTPUT_DIR, artworkDir, thumbnailDir, equipmentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Get all image files from source
const imageFiles = fs.readdirSync(SOURCE_DIR)
  .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

if (imageFiles.length === 0) {
  console.log('  → No source images found. Add images to src/assets/images/source/');
  process.exit(0);
}

console.log(`  → Found ${imageFiles.length} images to optimize`);

async function optimizeImage(filename) {
  const inputPath = path.join(SOURCE_DIR, filename);
  const basename = path.basename(filename, path.extname(filename));
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Determine if artwork or equipment based on filename convention
    const isEquipment = filename.toLowerCase().includes('equipment') || 
                        filename.toLowerCase().includes('ems') ||
                        filename.toLowerCase().includes('mixer');
    
    const outputSubdir = isEquipment ? equipmentDir : artworkDir;
    
    // Generate WebP versions
    // Full size (max 1920px width)
    await image
      .clone()
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(outputSubdir, `${basename}.webp`));
    
    // Thumbnail (400px width)
    await image
      .clone()
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(thumbnailDir, `${basename}.webp`));
    
    // JPEG fallback for older browsers
    await image
      .clone()
      .resize(1920, null, { withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(outputSubdir, `${basename}.jpg`));
    
    console.log(`  ✓ ${filename} → WebP + JPEG (${metadata.width}x${metadata.height})`);
    
  } catch (error) {
    console.error(`  ✗ Failed to optimize ${filename}:`, error.message);
  }
}

(async () => {
  for (const file of imageFiles) {
    await optimizeImage(file);
  }
  console.log('✓ Image optimization complete');
})();
