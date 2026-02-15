# Implementation Plan: Pink Floyd DSOTM Fan Website

**Branch**: `1-pink-floyd-dsotm` | **Date**: 2026-02-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/1-pink-floyd-dsotm/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Pink Floyd "Dark Side of the Moon" fan website with neomorphic design, featuring track exploration with 30-second audio previews, visual art gallery, thematic analysis, and interactive tools. Technical approach: Vite-based build system with vanilla HTML/CSS/JS, SQLite database for metadata, local static assets. **Key conflict to resolve**: Spec calls for JAMstack/static site but user requires SQLite database.

## Technical Context

**Language/Version**: JavaScript (ES2022+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tool), vanilla HTML/CSS/JS, **NEEDS CLARIFICATION: SQLite integration approach**  
**Storage**: SQLite database for metadata (tracks, themes, album info), local filesystem for images/audio, **NEEDS CLARIFICATION: Build-time vs runtime database access**  
**Testing**: Vitest or native browser testing, Lighthouse CI  
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, iOS Safari 14+, Chrome Android 90+)  
**Project Type**: Web application  
**Performance Goals**: First Contentful Paint < 1.5s, Time to Interactive < 3.5s, Largest Contentful Paint < 2.5s, Google Lighthouse 90+ all categories, 60fps animations  
**Constraints**: 
- WCAG 2.1 AA accessibility compliance
- 30-second audio preview hard limit (fair use)
- All images local (not uploaded to external services)
- Minimal external libraries (vanilla JS preferred)
- **NEEDS CLARIFICATION: How to reconcile static site spec with SQLite requirement**  
**Scale/Scope**: Single album fan site, ~10 tracks, 5 themes, 10-20 artwork images, static content updates quarterly

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Neomorphic Design Integrity | ✅ PASS | Spec defines CSS custom properties (#E0E5EC light, #2E3239 dark, prism accents) |
| II. Accessibility-First | ✅ PASS | WCAG 2.1 AA compliance required (FR-020), keyboard nav, ARIA labels, reduced motion |
| III. Performance Budget | ✅ PASS | FCP < 1.5s, TTI < 3.5s, LCP < 2.5s, Lighthouse 90+ (FR-014, FR-018) |
| IV. Progressive Enhancement | ✅ PASS | Core content works without JS (FR-015), graceful degradation for enhanced features |
| V. Content Compliance & Fair Use | ✅ PASS | 30s audio limit (FR-021, FR-003), <10% lyrics, proper attribution (FR-019) |

**Gate Status**: ✅ **PASSED** - All constitution principles satisfied in specification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── index.html              # Main entry point
├── assets/
│   ├── css/
│   │   ├── main.css        # Global styles, CSS custom properties
│   │   ├── neomorphic.css  # Neomorphic design system
│   │   └── themes.css      # Light/Dark mode variables
│   ├── js/
│   │   ├── main.js         # App initialization
│   │   ├── audio/          # Audio player, waveform visualizer
│   │   ├── gallery/        # Image gallery, lightbox
│   │   ├── themes/         # Theme explorer
│   │   └── utils/          # Utilities (storage, a11y, etc.)
│   ├── images/             # Local artwork, thumbnails
│   └── audio/              # 30-second preview clips
├── data/
│   └── database.sqlite     # SQLite metadata database
├── components/             # Reusable HTML components (if using templates)
└── pages/                  # Page-specific HTML files

tools/
├── build-db.js             # Build-time database export/generation
└── optimize-images.js      # Image optimization script

tests/
├── accessibility/          # Axe, WAVE test results
├── performance/            # Lighthouse reports
└── e2e/                    # End-to-end browser tests
```

**Structure Decision**: Single-page web application using Vite build system. SQLite database accessed at build time to generate static JSON/content, OR served via lightweight local API. Images and audio stored locally (not on CDN per user requirement).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected. All principles satisfied by specification.

---

## Phase 0: Research & Clarification

**Status**: ✅ **COMPLETE**

**NEEDS CLARIFICATION - RESOLVED**:

1. ✅ **SQLite vs Static Site Architecture**: **DECISION** - SQLite used at build-time only to generate static JSON files. No runtime database access. Hybrid approach preserves static site benefits while allowing structured data management.

2. ✅ **Audio/CDN Strategy**: **DECISION** - Local assets with optional CDN path via environment variable. Respects user requirement for local images while allowing production CDN deployment if desired.

3. ✅ **Database Access Pattern**: **DECISION** - Build-time only. Vite plugin queries SQLite during build and generates JSON files in `public/data/`. Production site is fully static.

**Research Tasks Completed**:
- [x] Research: Best practices for SQLite with Vite static sites → Use build-time extraction to JSON
- [x] Research: Local audio file handling vs CDN tradeoffs → Local storage feasible (<5MB total)
- [x] Research: Build-time data generation patterns → Vite plugin approach selected

**Output**: [research.md](research.md)

---

## Phase 1: Design & Contracts

**Status**: ✅ **COMPLETE**

**Artifacts Generated**:
- [x] `research.md` - Phase 0 findings with all clarifications resolved
- [x] `data-model.md` - Entity definitions and JSON schemas
- [x] `contracts/` - API contracts (data fetching patterns)
- [x] `quickstart.md` - Developer setup guide

### Phase 1 Summary

**Data Architecture**: Build-time SQLite → JSON generation → Static site deployment

**Key Design Decisions**:
- No runtime backend server required
- SQLite used only during development/build
- JSON files served as static assets
- All images stored locally in repository
- Optional CDN deployment via environment configuration

**Technology Stack**:
- Build: Vite 6.x with custom SQLite plugin
- Data: better-sqlite3 (dev), JSON files (production)
- Styling: Vanilla CSS with CSS custom properties
- Audio: Native Web Audio API + HTML5 Audio
- Images: Sharp optimization at build time
- Testing: Vitest + Lighthouse CI

---

## Constitution Check (Post-Design Re-evaluation)

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Neomorphic Design Integrity | ✅ PASS | CSS custom properties defined, vanilla CSS implementation planned |
| II. Accessibility-First | ✅ PASS | WCAG 2.1 AA compliance in data model, keyboard nav contracts defined |
| III. Performance Budget | ✅ PASS | Build-time JSON eliminates runtime DB queries, WebP optimization planned |
| IV. Progressive Enhancement | ✅ PASS | Core content in static HTML, JS enhances progressively |
| V. Content Compliance & Fair Use | ✅ PASS | 30s audio constraint in data model, copyright fields in artwork schema |

**Final Gate Status**: ✅ **PASSED** - Design maintains all constitution principles.
