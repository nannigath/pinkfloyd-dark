#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const tracks = [
  { input: '01 - Pink Floyd - Speak to Me (2023 Remaster) (Explicit).flac', output: 'track-01-speak-to-me-preview.mp3' },
  { input: '02 - Pink Floyd - Breathe (In the Air) (2023 Remaster).flac', output: 'track-02-breathe-preview.mp3' },
  { input: '03 - Pink Floyd - On the Run (2023 Remaster).flac', output: 'track-03-on-the-run-preview.mp3' },
  { input: '04 - Pink Floyd - Time (2023 Remaster).flac', output: 'track-04-time-preview.mp3' },
  { input: '05 - Pink Floyd - The Great Gig in the Sky (2023 Remaster).flac', output: 'track-05-the-great-gig-in-the-sky-preview.mp3' },
  { input: '06 - Pink Floyd - Money (2023 Remaster).flac', output: 'track-06-money-preview.mp3' },
  { input: '07 - Pink Floyd - Us and Them (2023 Remaster).flac', output: 'track-07-us-and-them-preview.mp3' },
  { input: '08 - Pink Floyd - Any Colour You Like (2023 Remaster).flac', output: 'track-08-any-colour-you-like-preview.mp3' },
  { input: '09 - Pink Floyd - Brain Damage (2023 Remaster).flac', output: 'track-09-brain-damage-preview.mp3' },
  { input: '10 - Pink Floyd - Eclipse (2023 Remaster).flac', output: 'track-10-eclipse-preview.mp3' }
];

const audioDir = path.join(__dirname, 'src', 'assets', 'audio');

// Create audio directory if it doesn't exist
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log(`✓ Created directory: ${audioDir}`);
}

console.log('🎵 Converting FLAC files to MP3 previews...\n');

tracks.forEach((track, index) => {
  const inputPath = path.join(__dirname, track.input);
  const outputPath = path.join(audioDir, track.output);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.log(`✗ Track ${index + 1}: Input file not found - ${track.input}`);
    return;
  }

  try {
    console.log(`Converting track ${index + 1}/10: ${track.input.split(' - ')[1] || 'Unknown'}`);
    
    // Convert FLAC to MP3 preview (30 seconds, 128kbps)
    execSync(
      `ffmpeg -i "${inputPath}" -ss 0 -t 30 -b:a 128k -y "${outputPath}"`,
      { 
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024
      }
    );
    
    console.log(`  ✓ ${track.output}\n`);
  } catch (error) {
    console.log(`  ✗ Error converting ${track.input}`);
    console.log(`  Error: ${error.message}\n`);
  }
});

console.log('✓ Conversion complete! Files are in: src/assets/audio/');
console.log('\nNext steps:');
console.log('1. Copy cover art: src/assets/images/artwork/');
console.log('2. Run: npm run build');
console.log('3. Test the application');
