# Tasks: Pink Floyd DSOTM Fan Website

**Input**: Design documents from `/specs/1-pink-floyd-dsotm/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/data-fetching.md, research.md

**Tests**: NOT included (not requested in feature specification)

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite project with vanilla JavaScript template in project root
- [x] T002 [P] Install development dependencies: better-sqlite3, sharp, vitest in package.json
- [x] T003 [P] Configure project structure: create src/, tools/, tests/, data/ directories
- [x] T004 Create vite.config.js with custom SQLite-to-JSON build plugin
- [x] T005 Initialize SQLite database schema in data/database.sqlite (all tables)
- [x] T006 Create .env.template with VITE_CDN_URL and analytics configuration variables
- [x] T007 [P] Setup package.json scripts: dev, build, build:data, images:optimize
- [x] T008 [P] Configure .gitignore for node_modules/, dist/, .env, and local assets

**Checkpoint**: Project structure ready, Vite configured, database schema created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Data Infrastructure

- [x] T009 Create SQLite-to-JSON build script in tools/build-db.js (transforms all entities)
- [x] T010 Create image optimization script in tools/optimize-images.js (WebP generation)
- [x] T011 Implement data validation in tools/validate-db.js (schema validation)
- [x] T012 Create initial data seed in data/seed.sql (album metadata, 10 tracks, 5 themes)
- [x] T013 Generate first JSON output to public/data/ (album.json, tracks.json, themes.json, index.json)

### Core CSS Foundation

- [x] T014 [P] Create CSS custom properties in src/assets/css/main.css (colors, spacing, typography)
- [x] T015 [P] Implement neomorphic design system in src/assets/css/neomorphic.css (shadows, extrusions)
- [x] T016 Create light/dark mode variables in src/assets/css/themes.css
- [x] T017 Implement responsive breakpoints in src/assets/css/main.css (mobile, tablet, desktop, large)

### Utility Modules

- [x] T018 Create data service module in src/js/services/dataService.js (JSON fetching with caching)
- [x] T019 Create storage utility in src/js/utils/storage.js (localStorage wrapper for preferences)
- [x] T020 Create accessibility utilities in src/js/utils/a11y.js (focus management, ARIA helpers)
- [x] T021 [P] Create DOM utilities in src/js/utils/dom.js (element creation, event delegation)

### Base HTML Structure

- [x] T022 Create main entry point in src/index.html with semantic structure
- [x] T023 Implement skip-to-content link and ARIA landmarks in src/index.html
- [x] T024 Add neomorphic skeleton loading placeholders in src/index.html

**Checkpoint**: Foundation ready - database generates JSON, CSS design system complete, utilities available

---

## Phase 3: User Story 1 - Explore Album Overview (Priority: P1) 🎯 MVP

**Goal**: Display comprehensive album information including metadata, recording timeline, and commercial success statistics

**Independent Test**: Navigate to Album Overview section, verify release date (March 1, 1973), label (Harvest/Capitol), producer info displays correctly, recording timeline shows May 1972 - January 1973 milestones, responsive layout works on mobile

### Implementation

- [x] T025 [P] Create album metadata display component in src/js/components/album-overview.js
- [x] T026 [P] Implement recording timeline visualization in src/js/components/album-overview.js
- [x] T027 Create commercial success statistics display in src/js/components/album-overview.js
- [x] T028 Implement album overview section in src/index.html (integrate components)
- [x] T029 Add keyboard navigation support for timeline in src/js/components/album-overview.js
- [x] T030 Ensure reduced-motion compatibility for all animations in US1 components
- [x] T031 [P] Add alt text and ARIA labels for album artwork and timeline in src/js/components/

**Checkpoint**: User Story 1 complete - album information displays, timeline interactive, fully accessible

---

## Phase 4: User Story 2 - Browse Track-by-Track Explorer (Priority: P1) 🎯 MVP

**Goal**: Allow users to explore each track individually with 30-second audio previews, waveform visualization, and detailed analysis

**Independent Test**: Select "Time" track, click play button, verify 30-second preview plays with waveform visualization, click different track stops current playback, musical analysis section expands to show 7/4 time signature info, keyboard navigation (Tab/Enter) controls playback

### Implementation

- [x] T032 [P] Create audio player component in src/js/audio/player.js (HTML5 Audio API)
- [x] T033 [P] Implement waveform visualization in src/js/components/track-explorer.js
- [x] T034 Create track list component in src/js/components/track-explorer.js
- [x] T035 Implement track detail view in src/js/components/track-explorer.js
- [x] T036 Add 30-second auto-stop enforcement in src/js/audio/player.js
- [x] T037 Implement crossfade transitions between tracks in src/js/audio/player.js
- [x] T038 Create single-track playback management in src/js/audio/player.js (stops current when new starts)
- [x] T039 Add keyboard controls (Tab, Enter, Space) in src/js/components/track-explorer.js
- [x] T040 Implement track list display in src/index.html (integrate with track-list.js)
- [x] T041 Add rate limiting (100 plays/session) in src/js/audio/player.js
- [x] T042 Ensure audio player works without JavaScript (native controls fallback)
- [x] T043 [P] Add ARIA labels for audio controls and waveform in src/js/components/track-explorer.js

**Checkpoint**: User Story 2 complete - all 10 tracks playable, waveform visualization working, keyboard accessible

---

## Phase 5: User Story 3 - Experience Visual Art Gallery (Priority: P2)

**Goal**: Enable users to explore album artwork with high-resolution images, lightbox, and zoom functionality

**Independent Test**: Enter Visual Art Gallery, click prism cover image, verify lightbox opens with Storm Thorgerson/Hipgnosis attribution, pinch-to-zoom works on mobile, keyboard arrows navigate between images in lightbox, copyright notices visible on all images

### Implementation

- [x] T044 [P] Create gallery grid component in src/js/components/art-gallery.js
- [x] T045 [P] Implement lightbox modal in src/js/components/art-gallery.js
- [x] T046 Add pinch-to-zoom functionality in src/js/components/art-gallery.js (touch gestures)
- [x] T047 Implement keyboard navigation for lightbox in src/js/components/art-gallery.js (arrow keys)
- [x] T048 Create image lazy loading via native loading="lazy" in src/js/components/art-gallery.js
- [x] T049 Add neomorphic skeleton screens for images in src/index.html
- [x] T050 [P] Integrate optimized artwork images into src/assets/images/artwork/ (via optimize-images.js)
- [x] T051 Display copyright notices on all gallery images in src/js/components/art-gallery.js
- [x] T052 Implement responsive gallery layout in src/assets/css/components/art-gallery.css
- [x] T053 Add alt text and ARIA labels for gallery images in src/js/components/art-gallery.js

**Checkpoint**: User Story 3 complete - gallery browsable, lightbox working, zoom functional, fully accessible

---

## Phase 6: User Story 4 - Explore Themes and Meanings (Priority: P2)

**Goal**: Present conceptual themes (Time, Death, Money, Madness, Conflict) with interpretive analysis and track associations

**Independent Test**: Select "Time" theme, verify 150-250 word analysis displays with lyric excerpts under 10% fair use, click track link within theme navigates to track detail, reduced motion preference disables theme card animations, dark mode optimizes reading experience

### Implementation

- [x] T054 [P] Create theme card component in src/js/components/themes-explorer.js
- [x] T055 [P] Implement theme explorer layout in src/js/components/themes-explorer.js
- [x] T056 Add theme-to-track linking in src/js/components/themes-explorer.js (navigation)
- [x] T057 Implement card flip animations with reduced-motion support in src/js/components/themes-explorer.js
- [x] T058 Create fair use validation for lyric excerpts (ensure <10% per track, validated in seed.sql)
- [x] T059 [P] Add theme color accents to CSS variables in src/assets/css/components/themes-explorer.css
- [x] T060 Ensure theme content accessible without JavaScript in src/index.html
- [x] T061 Optimize theme text for dark mode readability in src/assets/css/components/themes-explorer.css
- [x] T062 Add ARIA labels for theme navigation in src/js/components/themes-explorer.js

**Checkpoint**: User Story 4 complete - 5 themes displayed, track linking works, accessible with animations respecting preferences

---

## Phase 7: User Story 5 - Record and Production Deep Dive (Priority: P2)

**Goal**: Display recording equipment, technical specifications, and Alan Parsons engineering contributions

**Independent Test**: Access Recording section, view equipment cards with Abbey Road Studios gear specs, examine "Money" track breakdown with signal flow diagram tooltips, toggle before/after audio comparison control, read Alan Parsons engineering contributions

### Implementation

- [x] T063 [P] Create equipment card component in src/js/components/recording-deep-dive.js
- [x] T064 [P] Implement equipment grid layout in src/js/components/recording-deep-dive.js
- [x] T065 Create signal flow diagram component in src/js/components/recording-deep-dive.js
- [x] T066 Add interactive tooltips for technical details in src/js/components/recording-deep-dive.js
- [x] T067 Implement before/after audio comparison in src/js/components/recording-deep-dive.js
- [x] T068 Create engineer information display in src/js/components/recording-deep-dive.js
- [x] T069 [P] Integrate equipment images via equipment.imageUrl in data model
- [x] T070 Add keyboard accessibility for interactive diagrams in src/js/components/recording-deep-dive.js

**Checkpoint**: User Story 5 complete - equipment displayed, signal flow interactive, audio comparison functional

---

## Phase 8: User Story 6 - Interactive Audio Experience (Priority: P3)

**Goal**: Provide interactive tools including audio visualizer, "Create Your Prism" feature, and personality quiz

**Independent Test**: Play track preview, activate visualizer, verify Canvas-based animation syncs to audio frequencies, open "Create Your Prism" tool, adjust color sliders and confirm SVG prism updates in real-time, complete personality quiz and receive track match with local storage persistence

### Implementation

- [x] T071 [P] Create canvas-based audio visualizer in src/js/components/interactive-experience.js
- [x] T072 [P] Implement "Create Your Prism" color mixer in src/js/components/interactive-experience.js
- [x] T073 Add SVG prism manipulation in src/js/components/interactive-experience.js (real-time color updates)
- [x] T074 Create personality quiz component in src/js/components/interactive-experience.js
- [x] T075 Implement quiz result persistence in src/js/utils/storage.js (localStorage) - already implemented
- [x] T076 Add graceful degradation for non-WebGL browsers in src/js/components/interactive-experience.js (fallback div)
- [x] T077 Ensure visualizer has ARIA labels and text alternatives in src/js/components/interactive-experience.js
- [x] T078 Make quiz accessible via keyboard navigation in src/js/components/interactive-experience.js

**Checkpoint**: User Story 6 complete - visualizer working, prism creator functional, quiz complete with persistence

---

## Phase 9: Cross-Cutting & Polish

**Purpose**: Features that affect multiple user stories and final quality assurance

### Light/Dark Mode (Affects All Stories)

- [x] T079 [P] Create theme toggle component in src/js/components/theme-toggle.js
- [x] T080 Implement theme persistence in src/js/utils/storage.js
- [x] T081 Add CSS custom property switching in src/assets/css/themes.css
- [x] T082 Ensure instant visual feedback (<100ms transition) in src/assets/css/themes.css

### Service Worker & Offline (Affects All Stories)

- [x] T083 Create service worker in src/sw.js (stale-while-revalidate caching)
- [x] T084 Register service worker in src/js/main.js
- [x] T085 Implement offline page display in src/offline.html
- [x] T086 Cache data files and assets for offline access in src/sw.js

### Error Monitoring & Analytics (Affects All Stories)

- [x] T087 Integrate Sentry for error tracking in src/js/utils/error-tracking.js
- [x] T088 Add privacy-focused analytics (Plausible preferred, Fathom acceptable alternative) in src/index.html
- [x] T089 Ensure analytics collects zero PII in src/js/utils/analytics.js
- [x] T090 Implement analytics graceful degradation if scripts fail in src/js/utils/analytics.js

### Performance Optimization (Affects All Stories)

- [x] T091 [P] Optimize all images to WebP with fallbacks in src/assets/images/
- [x] T092 Implement lazy loading for below-fold content in src/js/utils/lazy-load.js
- [x] T093 Add resource hints (preload, prefetch) in src/index.html
- [x] T094 Optimize CSS delivery (critical CSS inline) in src/index.html
- [x] T095 Verify all performance budgets met (FCP < 1.5s, TTI < 3.5s, LCP < 2.5s)

### Accessibility Final Pass (Affects All Stories)

- [x] T096 Verify WCAG 2.1 AA compliance across all pages (automated testing)
- [x] T097 Test keyboard navigation on all interactive elements
- [x] T098 Verify screen reader compatibility (ARIA labels, alt text)
- [x] T099 Test reduced-motion preferences across all animations
- [x] T100 Ensure all images have descriptive alt text

### Legal & Compliance (Affects All Stories)

- [x] T101 Add copyright disclaimers on every page with artwork/audio in src/index.html (validate: all 8 pages with media have visible notices)
- [x] T102 Verify all audio previews are exactly 30 seconds (validate: run `npm run audio:validate`, all 10 tracks pass duration check)
- [x] T103 Confirm all lyric excerpts are under 10% fair use (validate: content audit script flags any excerpt >10% of track lyrics)
- [x] T104 Add fair use notices in footer of src/index.html (validate: notice visible on all pages, links to full disclaimer page)

### Quality Assurance

- [x] T105 Run Lighthouse audit and achieve 90+ scores across all categories
- [x] T106 Test cross-browser compatibility (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [x] T107 Test responsive design across breakpoints (320px to 1920px+)
- [x] T108 Verify progressive enhancement (core content works without JavaScript)
- [x] T109 Run quickstart.md validation (verify all npm scripts work)
- [x] T110 Create deployment checklist and verify static site generation

**Checkpoint**: All user stories polished, performance optimized, accessibility verified, legal compliance confirmed

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ───────────────────────────────────────┐
       │                                                │
       ▼                                                │
Phase 2: Foundational ─────────────────────────────────┤
       │                                                │
       ├───▶ Phase 3: User Story 1 (P1) ────────────────┤
       │         (Album Overview - MVP)                 │
       │                                                │
       ├───▶ Phase 4: User Story 2 (P1) ────────────────┤
       │         (Track Explorer - MVP)                 │
       │                                                │
       ├───▶ Phase 5: User Story 3 (P2) ────────────────┤
       │         (Art Gallery)                          │
       │                                                │
       ├───▶ Phase 6: User Story 4 (P2) ────────────────┤
       │         (Themes)                               │
       │                                                │
       ├───▶ Phase 7: User Story 5 (P2) ────────────────┤
       │         (Production Deep Dive)                 │
       │                                                │
       └───▶ Phase 8: User Story 6 (P3) ────────────────┤
                 (Interactive Tools)                    │
                                                      │
Phase 9: Polish & Cross-Cutting ◀──────────────────────┘
       (All stories complete or sufficient for MVP)
```

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can be tested independently
- **User Story 2 (P1)**: No dependencies on other stories - can be tested independently
- **User Story 3 (P2)**: No dependencies on other stories - can be tested independently
- **User Story 4 (P2)**: Links to tracks from US2 but can display themes independently
- **User Story 5 (P2)**: References tracks from US2 but can display equipment independently
- **User Story 6 (P3)**: Uses audio player from US2 but visualizer is independent feature

### Within Each User Story

1. Components/modules marked [P] can be developed in parallel
2. Integration tasks depend on components being complete
3. Accessibility testing after implementation
4. Story validation before moving to next

### Critical Path

**Minimum Viable Product (MVP)**: Phase 1 → Phase 2 → Phase 3 + Phase 4 → Deploy

1. Setup (T001-T008)
2. Foundational (T009-T024) - CRITICAL BLOCKER
3. User Story 1 (T025-T031) - MVP Core
4. User Story 2 (T032-T043) - MVP Core
5. Basic polish (T079-T082 for themes, T105 for lighthouse) - MVP

**Full Feature**: Continue through Phase 9

---

## Parallel Example: User Story 2 Implementation

```bash
# Parallel tasks for Track Explorer (all can start together):
Task T032: "Create audio player component in src/js/audio/player.js"
Task T033: "Implement waveform visualization in src/js/audio/waveform.js"
Task T034: "Create track list component in src/js/components/track-list.js"

# Sequential (after above complete):
Task T038: "Create single-track playback management..." (depends on T032)
Task T040: "Implement track list display in src/index.html..." (depends on T034)
```

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T024) - **BLOCKS ALL**
3. Complete Phase 3: User Story 1 (T025-T031) - Album Overview
4. Complete Phase 4: User Story 2 (T032-T043) - Track Explorer
5. Add minimal cross-cutting: T079-T082 (theme toggle)
6. Run validation: T105-T107 (lighthouse, cross-browser, responsive)
7. **STOP - MVP COMPLETE** ✅

### Incremental Delivery

After MVP:

1. Add User Story 3 (T044-T053) - Art Gallery → Deploy
2. Add User Story 4 (T054-T062) - Themes → Deploy
3. Add User Story 5 (T063-T070) - Production Deep Dive → Deploy
4. Add User Story 6 (T071-T078) - Interactive Tools → Deploy
5. Complete Phase 9 polish → Final Deploy

### Parallel Team Strategy

With multiple developers after Foundational phase:

- **Developer A**: User Story 1 + Theme toggle (T025-T031, T079-T082)
- **Developer B**: User Story 2 (T032-T043)
- **Developer C**: User Story 3 + User Story 4 (T044-T062)

Each works independently, integrates at checkpoints.

---

## Summary Statistics

| Phase                 | Tasks   | Stories       | Priority |
| --------------------- | ------- | ------------- | -------- |
| Phase 1: Setup        | 8       | -             | Setup    |
| Phase 2: Foundational | 15      | -             | Blocking |
| Phase 3: User Story 1 | 7       | 1             | P1 (MVP) |
| Phase 4: User Story 2 | 12      | 1             | P1 (MVP) |
| Phase 5: User Story 3 | 10      | 1             | P2       |
| Phase 6: User Story 4 | 9       | 1             | P2       |
| Phase 7: User Story 5 | 8       | 1             | P2       |
| Phase 8: User Story 6 | 8       | 1             | P3       |
| Phase 9: Polish       | 32      | Cross-cutting | Final    |
| **TOTAL**             | **109** | **6**         | -        |

### MVP Scope (Phases 1-4 + minimal polish)

**MVP Tasks**: 8 + 15 + 7 + 12 + 4 = **46 tasks**  
**MVP Stories**: 2 (Album Overview + Track Explorer)  
**MVP delivers**: Core educational value with audio previews

### Parallel Opportunities Summary

- **Phase 1**: 4 tasks marked [P] can run in parallel (T002, T003, T007, T008)
- **Phase 2**: 6 tasks marked [P] can run in parallel (T014, T015, T018, T020, T021)
- **Per User Story**: Components marked [P] can be developed in parallel
- **After Foundational**: All 6 user stories can proceed in parallel (team capacity dependent)

---

## Notes

- Tasks marked [P] have no dependencies on other incomplete tasks
- Each user story is independently completable and testable
- No test tasks included (not requested in specification)
- Verify constitution compliance after each user story (neomorphic design, accessibility, performance)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
