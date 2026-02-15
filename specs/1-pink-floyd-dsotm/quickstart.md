# Quickstart Guide

**Project**: Pink Floyd DSOTM Fan Website  
**Tech Stack**: Vite + Vanilla JS + SQLite (build-time)  
**Node Version**: 18+ (LTS recommended)

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ 
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) (pnpm recommended)
- Git

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd beatles
```

### 2. Install Dependencies

```bash
npm install
```

**Key Dependencies**:
- `vite` - Build tool and dev server
- `better-sqlite3` - SQLite client (build-time only)
- `sharp` - Image optimization
- `vitest` - Testing framework

### 3. Set Up Database

```bash
# Database file should exist at:
# data/database.sqlite

# If starting fresh, create from template:
npm run db:init
```

### 4. Start Development Server

```bash
npm run dev
```

**Access**: http://localhost:5173

**Features**:
- Hot Module Replacement (HMR)
- SQLite to JSON regeneration on data changes
- Source maps for debugging

---

## Project Structure

```
.
├── data/                       # SQLite database
│   └── database.sqlite
├── src/
│   ├── index.html             # Entry point
│   ├── assets/
│   │   ├── css/              # Stylesheets
│   │   │   ├── main.css
│   │   │   ├── neomorphic.css
│   │   │   └── themes.css
│   │   ├── js/               # JavaScript modules
│   │   │   ├── main.js
│   │   │   ├── audio/
│   │   │   ├── gallery/
│   │   │   ├── themes/
│   │   │   └── utils/
│   │   ├── images/           # Image assets
│   │   └── audio/            # 30-second previews
│   └── data/                 # Generated JSON (build output)
├── tools/
│   ├── build-db.js           # SQLite → JSON generator
│   └── optimize-images.js    # Image optimization
├── specs/
│   └── 1-pink-floyd-dsotm/   # Feature specifications
├── public/                   # Static assets
├── tests/
│   ├── accessibility/
│   ├── performance/
│   └── e2e/
├── vite.config.js
└── package.json
```

---

## Development Workflow

### Adding Content

#### 1. Add Track Data

Edit database:
```bash
npm run db:edit
# Or use any SQLite editor on data/database.sqlite
```

Insert track:
```sql
INSERT INTO tracks (track_number, title, duration, composers, themes, lyrics_excerpt, musical_analysis, audio_preview_filename)
VALUES (1, 'Track Name', '3:45', '["Composer Name"]', '["theme-slug"]', '...', '...', 'track-01-name-preview.mp3');
```

#### 2. Add Audio Files

Place 30-second MP3 preview in:
```
src/assets/audio/track-{NN}-{slug}-preview.mp3
```

Requirements:
- Exactly 30 seconds
- 128kbps CBR MP3
- Filename matches database entry

#### 3. Add Images

Place source images in:
```
src/assets/images/source/
```

Run optimization:
```bash
npm run images:optimize
```

Generates:
- WebP versions
- Thumbnails
- Responsive sizes

#### 4. Regenerate JSON

```bash
npm run build:data
```

This queries SQLite and updates `src/data/*.json` files.

---

## Available Scripts

### Development

```bash
npm run dev          # Start dev server with HMR
npm run preview      # Preview production build
```

### Building

```bash
npm run build        # Full production build
npm run build:data   # Regenerate JSON from SQLite only
```

### Database

```bash
npm run db:init      # Initialize empty database
npm run db:seed      # Seed with sample data
npm run db:edit      # Open SQLite CLI
npm run db:validate  # Validate data integrity
```

### Assets

```bash
npm run images:optimize    # Optimize all images
npm run audio:validate     # Check audio file constraints
```

### Testing

```bash
npm run test         # Run all tests
npm run test:unit    # Unit tests with Vitest
npm run test:e2e     # End-to-end browser tests
npm run test:a11y    # Accessibility audit (axe-core)
npm run lighthouse   # Performance audit
```

### Code Quality

```bash
npm run lint         # ESLint
npm run format       # Prettier formatting
npm run typecheck    # JSDoc/TypeScript checking
```

---

## Configuration

### Vite Config (`vite.config.js`)

```javascript
export default {
  // Development server
  server: {
    port: 5173,
    open: true
  },
  
  // Build output
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'src/index.html'
      }
    }
  },
  
  // Environment variables
  envPrefix: 'VITE_'
};
```

### Environment Variables

Create `.env` file:

```bash
# Optional CDN base URL for production assets
VITE_CDN_URL=https://cdn.example.com

# Analytics configuration
VITE_SENTRY_DSN=your-sentry-dsn
VITE_PLAUSIBLE_DOMAIN=yourdomain.com

# Feature flags
VITE_ENABLE_VISUALIZER=true
```

---

## Content Update Workflow

### Quarterly Update

1. **Update database**:
   ```bash
   npm run db:edit
   # Make content changes
   ```

2. **Validate data**:
   ```bash
   npm run db:validate
   npm run audio:validate
   ```

3. **Regenerate**:
   ```bash
   npm run build:data
   ```

4. **Test locally**:
   ```bash
   npm run build
   npm run preview
   npm run test
   ```

5. **Commit and deploy**:
   ```bash
   git add .
   git commit -m "content: Q1 2026 update"
   git push origin 1-pink-floyd-dsotm
   ```

### Emergency Update (Legal/Compliance)

1. Make urgent database edit
2. Skip to step 3-5 above
3. Deploy immediately
4. Document in `CHANGELOG.md`

---

## Browser Support

Development tested on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Android 90+

---

## Troubleshooting

### Issue: `better-sqlite3` install fails

**Solution**:
```bash
# Windows
npm install --build-from-source

# Or use prebuilt binaries
npm install better-sqlite3@latest
```

### Issue: Audio files not playing

**Check**:
1. File exists in `src/assets/audio/`
2. Filename matches database entry exactly
3. File is valid MP3, 30 seconds
4. Browser console for CORS errors

### Issue: Images not loading

**Check**:
1. Source image in `src/assets/images/source/`
2. Run `npm run images:optimize`
3. Check generated WebP in `src/assets/images/`
4. Verify filename in database

### Issue: Data not updating

**Check**:
1. Changes made to `data/database.sqlite`
2. Run `npm run build:data` to regenerate JSON
3. Check `src/data/*.json` files updated
4. Hard refresh browser (Ctrl+F5)

---

## Performance Guidelines

### Images
- Use WebP format (auto-generated)
- Lazy load below-fold images
- Keep thumbnails <50KB
- Gallery images <200KB

### Audio
- Compress to 128kbps MP3
- Lazy load audio elements
- Single audio context for visualizer

### Code
- Code split by route
- Tree-shake unused code
- Minimize external dependencies

### Build
- Enable brotli/gzip compression
- Use CDN for static assets (optional)
- Implement service worker caching

---

## Deployment

### Static Hosting (Recommended)

Build for production:
```bash
npm run build
```

Upload `dist/` folder to:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- Any static host

### With CDN

1. Set `VITE_CDN_URL` in environment
2. Build: `npm run build`
3. Upload `dist/assets/` to CDN
4. Upload `dist/` (without assets) to origin

---

## Contributing

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `content`: Content update
- `style`: CSS/styling changes
- `refactor`: Code restructuring
- `test`: Tests
- `docs`: Documentation

Examples:
```
content(tracks): add "Time" track analysis

feat(gallery): implement lightbox navigation

fix(audio): resolve waveform visualization on Safari
```

### Pull Request Process

1. Create feature branch from `1-pink-floyd-dsotm`
2. Make changes with tests
3. Ensure `npm run test` passes
4. Update documentation
5. Submit PR with description
6. Code review required

---

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting)
- Review [spec.md](spec.md) for requirements
- Open issue in repository
