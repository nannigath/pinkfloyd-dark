# 🎵 FLAC to MP3 Conversion Instructions

I've created a conversion script at `tools/convert-audio.js`. Here's how to run it:

## Quick Start (Automated)

**Option 1: Using npm script (Recommended)**
```bash
npm run audio:convert
```

**Option 2: Direct Node.js**
```bash
node tools/convert-audio.js
```

## Manual Conversion (If Automated Fails)

If you need to convert files manually, use these ffmpeg commands in a terminal:

```bash
# Create the audio directory first
mkdir -p src/assets/audio

# Convert each track (30 seconds, 128kbps MP3)
ffmpeg -i "01 - Pink Floyd - Speak to Me (2023 Remaster) (Explicit).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-01-speak-to-me-preview.mp3"

ffmpeg -i "02 - Pink Floyd - Breathe (In the Air) (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-02-breathe-preview.mp3"

ffmpeg -i "03 - Pink Floyd - On the Run (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-03-on-the-run-preview.mp3"

ffmpeg -i "04 - Pink Floyd - Time (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-04-time-preview.mp3"

ffmpeg -i "05 - Pink Floyd - The Great Gig in the Sky (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-05-the-great-gig-in-the-sky-preview.mp3"

ffmpeg -i "06 - Pink Floyd - Money (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-06-money-preview.mp3"

ffmpeg -i "07 - Pink Floyd - Us and Them (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-07-us-and-them-preview.mp3"

ffmpeg -i "08 - Pink Floyd - Any Colour You Like (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-08-any-colour-you-like-preview.mp3"

ffmpeg -i "09 - Pink Floyd - Brain Damage (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-09-brain-damage-preview.mp3"

ffmpeg -i "10 - Pink Floyd - Eclipse (2023 Remaster).flac" -ss 0 -t 30 -b:a 128k -y "src/assets/audio/track-10-eclipse-preview.mp3"
```

## Requirements

- **ffmpeg**: Install with `choco install ffmpeg -y` (Windows)
- **Node.js**: Already installed (you have it)

## What Gets Created

✓ `src/assets/audio/track-XX-*.mp3` (30-second previews at 128kbps)
- Fair use compliant (30-second preview)
- Optimized file size
- Ready for streaming

## Next Steps After Conversion

1. **Add cover art:**
   ```bash
   mkdir -p src/assets/images/artwork
   copy "hi-res-album-cover-art-for-pink-floyd-the-dark-side-of-the-v0-hzp5g0ox18la1.webp" "src/assets/images/artwork/prism-cover.webp"
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```

## Troubleshooting

- **ffmpeg not found**: Install it with `choco install ffmpeg -y`
- **File not found**: Make sure you're in the project root directory
- **Permission denied**: Run terminal as Administrator
