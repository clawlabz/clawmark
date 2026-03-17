# PRD: ClawMark

> Version: 1.1 (post-review)
> Date: 2026-03-17
> Status: Pending Approval
> Based on: P0 Brainstorm Report

## 1. Background & Objectives

### Problem Statement
Browser bookmarks lack tags and meaningful search. Cloud bookmark tools (Raindrop, Pinboard) require accounts and upload data to third-party servers. Self-hosted alternatives (Linkding, Karakeep) need Docker infrastructure. There is no zero-friction, privacy-first bookmark tool that works instantly in the browser with no setup.

### Product Vision
ClawMark is a minimalist, pure client-side bookmark manager. Open the URL → paste a link → add tags → find it later. No account, no server, no sync complexity. Data lives in localStorage — you own it completely.

### Success Criteria
- User can add, search, and manage bookmarks within 3 seconds of opening the app
- All data persists across browser sessions via localStorage
- App loads in < 1 second (static site, no API calls)
- Export/import works reliably for data portability

## 2. Target User Personas

### Persona 1: Dev (Developer Power User)
- **Role**: Software developer, 25-40, uses 3+ browsers
- **Goals**: Save reference links (docs, Stack Overflow, GitHub repos) with tags for fast retrieval
- **Pain Points**: Browser bookmarks are unsearchable chaos; Notion/Raindrop is overkill for link saving
- **Tech Proficiency**: High — comfortable with JSON export, keyboard shortcuts

### Persona 2: Min (Privacy Minimalist)
- **Role**: Privacy-conscious professional, 30-50
- **Goals**: Keep a personal link collection without uploading to any cloud service
- **Pain Points**: Every bookmark tool wants an account and uploads data; doesn't trust third-party servers
- **Tech Proficiency**: Medium — can use a web app, won't self-host Docker

## 3. Core Features

### P0 — Must Have (MVP)

| # | Feature | Description | User Story Ref |
|---|---------|-------------|----------------|
| 1 | Add Bookmark | Save URL + title + optional description + tags | US-001 |
| 2 | Bookmark List | Display all bookmarks in a searchable list/grid | US-002 |
| 3 | Search & Filter | Full-text search across title/URL/description + tag filter | US-003 |
| 4 | Edit Bookmark | Modify title, URL, description, tags of existing bookmark | US-004 |
| 5 | Delete Bookmark | Remove a bookmark with confirmation | US-005 |
| 6 | Tag Management | View all tags, filter by tag, multi-tag filter | US-006 |
| 7 | Export JSON | Download all bookmarks as a JSON file | US-007 |
| 8 | Import JSON | Upload a JSON file to restore/merge bookmarks | US-008 |
| 9 | Keyboard Shortcut | `Cmd/Ctrl+K` to open quick-add dialog | US-009 |
| 10 | Responsive Design | Works on desktop and mobile browsers | US-010 |
| 11 | System Theme | Auto dark/light via `prefers-color-scheme` (no toggle UI) | US-011 |
| 12 | Favicon Display | Show site favicon via Google Favicons API with fallback icon | US-012 |

### P1 — Should Have (v1.1)

| # | Feature | Description |
|---|---------|-------------|
| 1 | Theme Toggle | Manual dark/light override on top of system detection |
| 2 | Bulk Delete | Select multiple bookmarks and delete |
| 3 | Sort Options | Sort by date added, title, most recently accessed |
| 4 | Bookmarklet | One-click save from any page (drag to toolbar, no install) |
| 5 | Sort Preference Persistence | Remember user's chosen sort across sessions |

### P2 — Nice to Have (Future)

| # | Feature | Description |
|---|---------|-------------|
| 1 | Browser Extension | One-click save from any page (Chrome/Firefox store) |
| 2 | Optional Cloud Sync | Opt-in sync via Supabase or file |
| 3 | Bookmark Groups/Folders | Organize beyond flat tag system |
| 4 | Auto-fetch Title | Fetch page title from URL automatically |

## 4. User Stories & Acceptance Criteria

### US-001: Add Bookmark
**As a** user, **I want to** save a web link with a title, description, and tags, **so that** I can find it later.
**Acceptance Criteria:**
- Given I click the "Add" button or press `Cmd/Ctrl+K`, When I enter a URL and title, Then a new bookmark is created and appears in the list
- Given I add tags (comma-separated or space-separated), When I save, Then the tags are stored and displayed as chips
- Given I leave description blank, When I save, Then the bookmark is saved without description (optional field)
- Given I enter a URL that already exists, When I save, Then I see a warning with options: "Update existing" (overwrites the old entry) or "Save as new" (creates a second entry)
- Given I leave URL or title blank, When I click Save, Then I see inline validation errors and the bookmark is not saved

### US-002: Bookmark List
**As a** user, **I want to** see all my bookmarks in a clean list, **so that** I can browse and access them.
**Acceptance Criteria:**
- Given I open the app, When bookmarks exist, Then I see them ordered by most recently added (newest first)
- Given I click a bookmark URL, When the link opens, Then it opens in a new tab
- Given I have 0 bookmarks, When I open the app, Then I see an empty state with guidance to add first bookmark

### US-003: Search & Filter
**As a** user, **I want to** search bookmarks by keyword and filter by tag, **so that** I can quickly find what I need.
**Acceptance Criteria:**
- Given I type in the search bar, When I enter text, Then results filter in real-time (no submit needed)
- Given I search "react", When matching bookmarks exist, Then bookmarks with "react" in title, URL, description, or tags are shown
- Given I click a tag chip, When the tag filter is active, Then only bookmarks with that tag are shown
- Given I combine search text + tag filter, When both are active, Then results match BOTH criteria (AND logic)

### US-004: Edit Bookmark
**As a** user, **I want to** edit an existing bookmark, **so that** I can correct mistakes or update tags.
**Acceptance Criteria:**
- Given I click the edit button on a bookmark, When the edit form opens, Then all fields are pre-filled with current values
- Given I change the title and save, When the form closes, Then the updated title is reflected immediately
- Given I press Escape or click outside, When editing, Then changes are discarded
- Given I clear the URL or title field while editing, When I click Save, Then I see inline validation errors and the bookmark is not saved

### US-005: Delete Bookmark
**As a** user, **I want to** delete a bookmark I no longer need.
**Acceptance Criteria:**
- Given I click delete on a bookmark, When the confirmation dialog appears, Then I must confirm before deletion
- Given I confirm deletion, When the bookmark is removed, Then it disappears from the list and localStorage is updated

### US-006: Tag Management
**As a** user, **I want to** see all my tags and filter by them, **so that** I can organize and browse by category.
**Acceptance Criteria:**
- Given bookmarks have tags, When I view the tag area, Then all unique tags are shown with bookmark counts
- Given I click a tag, When the filter activates, Then only bookmarks with that tag are displayed
- Given I click the active tag again, When de-selected, Then the filter is removed and all bookmarks show

### US-007: Export JSON
**As a** user, **I want to** export all bookmarks as a JSON file, **so that** I can back up my data.
**Acceptance Criteria:**
- Given I click "Export", When the download starts, Then a `clawmark-export-YYYY-MM-DD.json` file downloads
- Given the export file, When I open it, Then it contains a valid JSON array of all bookmarks

### US-008: Import JSON
**As a** user, **I want to** import bookmarks from a JSON file, **so that** I can restore or migrate data.
**Acceptance Criteria:**
- Given I click "Import" and select a valid ClawMark JSON file, When parsing succeeds, Then bookmarks are merged (duplicates by URL are skipped, first occurrence wins)
- Given I upload an invalid file or non-ClawMark format, When parsing fails, Then I see an error message "Invalid format. Only ClawMark JSON exports are supported." and no data is changed
- Given I import N bookmarks, When complete, Then I see a summary "Imported X new, Y skipped (duplicate)"
- Given the import file contains two entries with the same URL, When parsed, Then only the first occurrence is imported

### US-009: Keyboard Shortcut
**As a** power user, **I want to** press `Cmd/Ctrl+K` to quickly add a bookmark.
**Acceptance Criteria:**
- Given I press `Cmd/Ctrl+K` anywhere in the app, When the shortcut fires, Then the add-bookmark dialog opens with focus on URL field
- Given the add dialog is already open, When I press `Cmd/Ctrl+K`, Then focus returns to the URL field (no second dialog opens)

### US-010: Responsive Design
**As a** mobile user, **I want to** use ClawMark on my phone.
**Acceptance Criteria:**
- Given I open ClawMark on a 375px-wide screen, When the page loads, Then all elements are usable without horizontal scroll
- Given I'm on mobile, When I tap a tag, Then the filter works the same as desktop
- Given I'm on mobile, When I want to add a bookmark, Then the Add button is prominent and tappable (keyboard shortcut not available on mobile)

### US-011: System Theme
**As a** user, **I want** the app to follow my OS dark/light preference automatically.
**Acceptance Criteria:**
- Given my OS is in dark mode, When I open ClawMark, Then the UI renders in dark theme
- Given my OS switches theme, When the change propagates, Then ClawMark updates in real-time without reload

### US-012: Favicon Display
**As a** user, **I want** to see site favicons next to bookmarks for visual recognition.
**Acceptance Criteria:**
- Given a bookmark has a URL, When rendered, Then a 16x16 favicon is shown via Google Favicons API (`https://www.google.com/s2/favicons?domain=...&sz=32`)
- Given the favicon fails to load, When the image errors, Then a generic link icon is shown as fallback
- Note: This makes a third-party request to Google. No user data beyond the domain name is sent. For privacy-conscious users, this is acknowledged as a tradeoff for visual usability.

## 5. Non-functional Requirements

### Performance
- First Contentful Paint < 1 second on 4G
- Search/filter response < 50ms for up to 5,000 bookmarks
- Static site — zero API calls after initial page load

### Storage Limits
- Display a warning when localStorage usage exceeds 80% of available quota
- Gracefully reject new bookmarks if quota is full with a clear error message
- Estimated capacity: ~10,000-20,000 bookmarks at ~500 bytes each

### Security & Privacy
- No server — no attack surface for data exfiltration
- Content Security Policy headers via `vercel.json`: `default-src 'self'; img-src 'self' https://www.google.com`
- No third-party scripts (no analytics in MVP)
- No user data (URLs, titles, tags) is sent to any server. Only domain names are sent to Google Favicons API for favicon display.

### Accessibility
- WCAG 2.1 AA compliance
- All interactive elements keyboard-accessible
- Proper ARIA labels on buttons and modals
- Focus management on dialog open/close

### Browser Support
- Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- Mobile: iOS Safari 15+, Chrome Android 90+

### Mobile Responsiveness
- Breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Touch-friendly tap targets (min 44px)

## 6. Data Model Overview

### Key Entities

**Bookmark**
- id (string, nanoid)
- url (string, required)
- title (string, required)
- description (string, optional)
- tags (string[], default [])
- createdAt (ISO string)
- updatedAt (ISO string)
- lastAccessedAt (ISO string, optional — unused in MVP, reserved for P1 sort-by-access feature)
- favicon (string, optional — cached favicon URL)

### Storage
- Single localStorage key: `clawmark_bookmarks`
- Value: JSON-serialized `Bookmark[]`
- No relationships — flat array, tags are inline strings

## 7. Page / Route List

| Page | Route | Purpose | Key Components |
|------|-------|---------|----------------|
| Main (SPA) | `/` | The entire app — single page | SearchBar, TagFilter, BookmarkList, AddDialog, EditDialog |

This is a single-page application. All UI lives on one route.

## 8. MVP Scope

### In Scope
- Add/edit/delete bookmarks with URL, title, description, tags
- Real-time search across all fields
- Tag-based filtering
- JSON export/import
- Keyboard shortcut (Cmd/Ctrl+K)
- Responsive design (mobile + desktop)
- localStorage persistence
- Empty state guidance
- Duplicate URL detection (update existing or save as new)
- System theme auto-detection (dark/light via prefers-color-scheme)
- Favicon display via Google Favicons API
- localStorage quota warning

### Out of Scope (Explicitly)
- User accounts / authentication
- Server-side storage / database
- Cross-device sync
- Browser extension (P2)
- Bookmarklet (P1)
- Auto-fetching page titles from URLs (title entry is manual — acknowledged UX tradeoff)
- Manual theme toggle UI (P1, auto-detection only in MVP)
- Bulk operations (P1)
- Folders/collections
- Social sharing
- Analytics

## 9. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Page Load Time | < 1s FCP | Lighthouse |
| Search Latency | < 50ms for 5K bookmarks | Manual testing |
| Accessibility Score | > 90 (Lighthouse) | Lighthouse audit |
| Export/Import Reliability | 100% round-trip fidelity | Automated test |
| Bundle Size | < 200KB gzipped | Build output |

## 10. Self-Review Log

### Round 1: Product Manager Review (automated)
- Unified duplicate URL policy: US-001 now offers "Update existing" or "Save as new" instead of ambiguous warning; US-008 import skips duplicates (first-wins) — consistent dedup strategy
- Added edit form validation AC (US-004): clear required field → inline error
- Added `lastAccessedAt` to data model — unused in MVP, avoids breaking schema change for P1 sort feature
- Added Cmd/Ctrl+K behavior when dialog already open (US-009)
- Added round-trip test note for export/import reliability metric
- Clarified import only supports ClawMark JSON format with explicit error message
- Added import dedup for internal file duplicates (first occurrence wins)

### Round 2: User Perspective Review (automated)
- Promoted dark/light theme to P0 as system auto-detection (`prefers-color-scheme`) — near-zero implementation cost, critical for daily-use tool
- Promoted favicon display to P0 via Google Favicons API — visual scanning essential for 50+ bookmarks; documented privacy tradeoff (domain sent to Google)
- Added bookmarklet to P1 as lightweight browser extension substitute — zero install, fits "no setup" ethos
- Added localStorage quota warning NFR — graceful handling at capacity
- Added mobile-specific AC for US-010: prominent Add button, keyboard shortcut gracefully absent
- Documented manual title entry as acknowledged UX tradeoff (auto-fetch requires network/CORS)
