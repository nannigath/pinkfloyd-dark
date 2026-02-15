# Phase 0: Research Findings

**Date**: 2026-02-15  
**Feature**: Pink Floyd DSOTM Fan Website  
**Researcher**: Implementation Planning Agent

---

## Clarification 1: SQLite vs Static Site Architecture

### Problem
Spec requires JAMstack/static site architecture (FR-024) but user specified SQLite database for metadata storage.

### Decision
**Hybrid Approach**: SQLite used at build-time only to generate static JSON files. No runtime database access.

### Rationale
- **Static Site Benefits**: Matches spec requirements for CDN deployment, 99.9% uptime, fast global distribution
- **Build-Time Generation**: Vite build process queries SQLite and generates static `data/` folder with JSON files
- **No Runtime DB**: Eliminates need for backend server, maintains static site architecture integrity
- **Data Management**: SQLite provides structured data management during development; JSON provides runtime performance

### Implementation Pattern
```
Build Process:
1. Vite config imports SQLite client (dev dependency only)
2. Build script queries all tables (tracks, themes, artwork, equipment)
3. Generates optimized JSON files in public/data/
4. Application fetches JSON at runtime (fetch API)
5. No SQLite in production bundle
```

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Runtime SQLite via sql.js | Adds 500KB+ WASM bundle, violates performance budget |
| Backend API server | Violates static site spec (FR-024), adds complexity |
| Direct JSON editing | Loses structured data benefits, error-prone |

---

## Clarification 2: Local Assets vs CDN Strategy

### Problem
Spec requires CDN audio hosting (FR-021) but user specified "images are not uploaded anywhere" implying local assets.

### Decision
**Local Assets with Optional CDN Path**: Store all assets locally in repository, configure CDN path as environment variable for production deployment.

### Rationale
- **Development**: Local assets ensure offline development, fast iteration, no external dependencies
- **Production Flexibility**: Build process can prepend CDN base URL to asset paths via env variable
- **Fair Use Compliance**: 30-second clips are small (~500KB each = ~5MB total), local storage feasible
- **User Requirement**: Respects explicit instruction that images are not uploaded

### Asset Storage Plan
```
Repository Structure:
src/assets/
├── audio/          # 10 tracks × 30s previews (~5MB total)
├── images/         # Artwork, thumbnails (~2MB total)
│   ├── artwork/
│   └── thumbnails/
└── data/           # Generated JSON from SQLite

Production (optional):
- Upload dist/assets/ to CDN
- Set VITE_CDN_URL=https://cdn.example.com
- Build prepends CDN URL to asset paths
```

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| CDN-only (per spec) | Violates user requirement for local images |
| Local-only (no CDN) | Limits production scalability, slower global delivery |
| Hybrid approach chosen | Balances development simplicity with production flexibility |

---

## Clarification 3: Database Access Pattern

### Problem
Need to determine if SQLite requires runtime API or can be build-time only.

### Decision
**Build-Time Only**: SQLite used exclusively during build process. Production site is fully static with JSON data files.

### Rationale
- **Performance**: No database queries at runtime means faster page loads
- **Simplicity**: No backend server to maintain, deploy, or scale
- **Constitution Alignment**: Matches Principle III (Performance Budget) and Principle IV (Progressive Enhancement)
- **Update Workflow**: Quarterly content updates regenerate JSON files from updated SQLite database

### Build Pipeline
```javascript
// vite.config.js enhancement
import { generateDataFiles } from './tools/build-db.js';

export default {
  plugins: [
    {
      name: 'sqlite-to-json',
      buildStart() {
        // Runs at build time only
        generateDataFiles({
          dbPath: './data/database.sqlite',
          outputDir: './public/data/'
        });
      }
    }
  ]
};
```

### Data Files Generated
- `tracks.json` - All 10 tracks with metadata, analysis, audio URLs
- `themes.json` - 5 conceptual themes with descriptions
- `album.json` - Album metadata, recording info, chart positions
- `artwork.json` - Gallery images with attribution
- `equipment.json` - Recording gear specifications

---

## Technology Decisions

### Build Tool
**Decision**: Vite (already specified)
- **Rationale**: Modern, fast HMR, excellent static site generation, native ES modules support
- **Version**: Latest stable (6.x)

### Styling
**Decision**: Vanilla CSS with CSS Custom Properties
- **Rationale**: Minimal dependencies per user requirement, neomorphic design achievable with pure CSS
- **Features**: CSS variables for theming, media queries for responsive design

### Audio Handling
**Decision**: Native Web Audio API + HTML5 Audio element
- **Rationale**: No external libraries needed, supports 30s preview limitation
- **Features**: Waveform visualization via Canvas API (FR-008)

### Image Optimization
**Decision**: Sharp (Node.js) at build time
- **Rationale**: Generate WebP with fallbacks, responsive sizes, optimize for performance budget
- **Tool**: Sharp library in build pipeline

### Testing
**Decision**: Vitest for unit, Lighthouse CI for performance/a11y
- **Rationale**: Vitest integrates with Vite, Lighthouse validates constitution requirements

### Error Monitoring
**Decision**: Sentry browser SDK (lightweight)
- **Rationale**: PII-free configuration satisfies privacy requirements, client-side only

---

## Dependencies Summary

### Production Dependencies
- None (vanilla JS)
- Optional: @sentry/browser (error tracking)

### Development Dependencies
- `vite` - Build tool
- `better-sqlite3` - SQLite client (build-time only)
- `sharp` - Image optimization
- `vitest` - Testing framework
- `lighthouse` - Performance auditing

### Browser APIs Used
- Web Audio API (waveform visualization)
- Canvas API (visualizations, animations)
- Intersection Observer (lazy loading)
- Service Worker API (caching, offline)
- LocalStorage (preferences, quiz results)

---

## Risk Mitigation

### Risk: SQLite Build-Time Complexity
**Mitigation**: Simple extraction script, well-documented schema, validation checks during build

### Risk: Audio File Sizes
**Mitigation**: Compress to 128kbps MP3 (~500KB per 30s track), total site size <10MB

### Risk: Browser Compatibility
**Mitigation**: Feature detection, graceful degradation, polyfills only where absolutely necessary

### Risk: Static Site Update Workflow
**Mitigation**: Document quarterly update process, include data validation scripts

---

## Open Questions (Deferred to Implementation)

1. **Audio format**: MP3 for compatibility or OGG for quality? → MP3 (broader support)
2. **Image breakpoints**: How many responsive sizes? → 3 sizes (thumbnail, gallery, full)
3. **Service worker scope**: Full offline support or asset caching only? → Asset caching + offline page

---

**Research Status**: ✅ Complete  
**All NEEDS CLARIFICATION resolved**: Yes  
**Ready for Phase 1**: Yes
