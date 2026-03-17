# P5 Test Report — ClawMark

> Date: 2026-03-17
> Phase: P5 (Unit Tests) + P6 (Verification)
> Status: PASS

---

## P5 — Unit Tests

### Setup

- Installed: `vitest@4.1.0`, `@testing-library/react@16.3.2`, `@testing-library/jest-dom@6.9.1`, `jsdom@29.0.0`
- Created: `app/vitest.config.ts` (jsdom environment, `@/` path alias)
- Added `"test": "vitest run"` script to `app/package.json`

### Test Files Written

| File | Tests | Coverage Target |
|------|-------|----------------|
| `lib/bookmarkOps.test.ts` | 57 tests | normalizeTags, createBookmark, updateBookmark, deleteBookmark, findByUrl, searchBookmarks, getAllTags, formatRelativeTime, getFaviconUrl |
| `lib/exportImport.test.ts` | 19 tests | mergeBookmarks, parseImportFile |
| `lib/storage.test.ts` | 11 tests | estimateQuota |

**Total: 87 tests**

### Test Results

```
 RUN  v4.1.0 /Users/ludis/Desktop/work/claw/projects/clawmark/app

 Test Files  3 passed (3)
       Tests  87 passed (87)
    Start at  08:30:47
    Duration  1.24s (transform 190ms, setup 0ms, import 271ms, tests 67ms, environment 2.82s)
```

**All 87 tests pass. 0 failures. 0 skipped.**

### Test Coverage by Function

#### `normalizeTags` (9 tests)
- Splits on commas
- Splits on whitespace
- Splits on comma+space
- Lowercases all tags
- Trims whitespace from each tag
- Removes duplicate tags (case-normalized)
- Empty string → []
- Whitespace-only string → []
- Mixed separators

#### `createBookmark` (7 tests)
- Generates non-empty id
- Generates unique ids on successive calls
- Sets createdAt = updatedAt at creation time
- Trims url and title
- Normalizes tags (dedup + lowercase)
- Empty description → undefined
- Non-empty description persisted

#### `updateBookmark` (6 tests)
- Returns new array (immutable)
- Updates target bookmark fields
- Sets new updatedAt timestamp
- Preserves original createdAt
- Does not modify other bookmarks
- No-op when id not found

#### `deleteBookmark` (5 tests)
- Removes bookmark with given id
- Returns new array (immutable)
- Returns same-length array when id not found
- Returns empty array when deleting sole bookmark
- Does not mutate the original array

#### `findByUrl` (5 tests)
- Finds by exact URL
- Case-insensitive match
- Returns undefined when not found
- Trims whitespace from query
- Returns undefined for empty bookmarks array

#### `searchBookmarks` (9 tests)
- Returns all when query empty and no active tag
- Searches by title
- Searches by URL
- Searches by description
- Searches by tag
- Case-insensitive search
- AND logic: activeTag + query both must match
- activeTag with empty query filters to tagged only
- Empty array when nothing matches
- Handles bookmark without description (no throw)

#### `getAllTags` (4 tests)
- Empty map for no bookmarks
- Counts each tag occurrence correctly
- Sorts by count descending
- Handles bookmarks with no tags

#### `formatRelativeTime` (7 tests, with fake timers)
- < 60s → "just now"
- < 60m → "5m ago"
- < 24h → "3h ago"
- < 30d → "7d ago"
- < 12mo → "2mo ago"
- >= 12mo → "1y ago"
- Boundary: exactly 60s → "1m ago"

#### `getFaviconUrl` (4 tests)
- Valid URL → Google favicons endpoint with correct domain
- Extracts hostname only (strips path/query/hash)
- Invalid URL → empty string
- Empty string → empty string

#### `mergeBookmarks` (8 tests)
- Imports new bookmarks not in existing
- Skips duplicate URLs (case-insensitive)
- First-wins: existing takes priority over incoming
- Deduplicates within incoming (first wins)
- New bookmarks prepended before existing in merged result
- Returns empty errors array
- Empty + empty → zero imported/skipped
- Empty existing + non-empty incoming → all imported

#### `parseImportFile` (11 tests)
- Parses valid ClawMark JSON export
- Preserves existing id when present
- Generates id when not present
- Defaults tags to [] when missing
- Throws on invalid JSON
- Throws when JSON is an object (not array)
- Throws when JSON is a string (not array)
- Throws when item missing url field
- Throws when item missing title field
- Throws when array contains non-object items
- Returns empty array for empty JSON array
- Handles multiple valid bookmarks

#### `estimateQuota` (10 tests)
- Returns correct total of 5MB
- Calculates used as jsonLength * 2 (UTF-16 bytes)
- Calculates percentUsed correctly
- isWarning false for low usage
- isWarning false below 80% threshold
- isFull false for low usage
- isWarning true when > 80%
- isFull true when > 95%
- used = 4 for empty array ("[]".length * 2)
- used increases with more bookmarks

---

## P6 — Verification

### Build

```
pnpm build
```

Result: **PASS**

```
▲ Next.js 16.1.7 (Turbopack)
✓ Compiled successfully in 4.1s
✓ Generating static pages using 7 workers (4/4)

Route (app)
┌ ○ /
└ ○ /_not-found
```

Static export generates cleanly. Both routes prerendered as static content.

### Lint

```
pnpm lint
```

Result: **PASS** — No ESLint warnings or errors.

### Code Quality Scan

| Check | Result |
|-------|--------|
| `console.log` / debug statements | None found |
| TODO / FIXME / HACK comments | None found |
| Hardcoded secrets or tokens | None found |
| Mutation of state | Not present — all ops return new arrays |
| Error handling | Present in storage (QuotaExceededError), exportImport (parse errors) |
| Input validation | Present in AddBookmarkDialog (URL format, required fields) |

One intentional `eslint-disable` comment found in `BookmarkCard.tsx` (`@next/next/no-img-element`) — this is correct usage because the Google Favicons API requires an `<img>` tag with a dynamic external src that Next.js's Image component cannot optimize.

### P0 Feature Presence Cross-Check (PRD §3)

| # | Feature | Status |
|---|---------|--------|
| 1 | Add Bookmark | `AddBookmarkDialog.tsx` + `createBookmark()` in `bookmarkOps.ts` |
| 2 | Bookmark List | `BookmarkList.tsx` + `BookmarkCard.tsx` |
| 3 | Search & Filter | `searchBookmarks()`, debounced in `useBookmarks.ts`, Header search input |
| 4 | Edit Bookmark | `EditBookmarkDialog.tsx` + `updateBookmark()` |
| 5 | Delete Bookmark | `DeleteConfirmDialog.tsx` + `deleteBookmark()` |
| 6 | Tag Management | `TagSidebar.tsx`, `getAllTags()`, `activeTag` state, tag click in `BookmarkCard` |
| 7 | Export JSON | `exportToJson()` in `exportImport.ts`, hooked to Header download button |
| 8 | Import JSON | `ImportDialog.tsx` + `parseImportFile()` + `mergeBookmarks()` |
| 9 | Keyboard Shortcut | `Cmd/Ctrl+K` → `setAddOpen(true)` in `app/page.tsx` useEffect |
| 10 | Responsive Design | Tailwind responsive classes (`hidden sm:inline`, flexible layout) |
| 11 | System Theme | CSS `prefers-color-scheme` via Tailwind (no toggle UI required) |
| 12 | Favicon Display | `getFaviconUrl()` in `BookmarkCard`, fallback `LinkIcon` on error |

**All 12 P0 features present in code.**

### Additional Quality Notes

- **Immutability**: All bookmark operations (`createBookmark`, `updateBookmark`, `deleteBookmark`, `mergeBookmarks`) return new arrays/objects. No in-place mutation detected.
- **Error boundaries**: `saveBookmarks` handles `QuotaExceededError` with user-friendly message. Storage quota warning UI shown at >80% usage.
- **Duplicate detection**: `findByUrl` + duplicate warning UI in `AddBookmarkDialog` implements US-001 duplicate warning acceptance criteria.
- **AND search logic**: `searchBookmarks` correctly filters by activeTag first, then applies query — matches PRD US-003.
- **File size**: All lib files are under 150 lines. All component files are under 200 lines. Well within the 800-line maximum.

---

## Summary

| Phase | Result |
|-------|--------|
| P5: vitest setup | PASS |
| P5: 87 unit tests | 87/87 PASS |
| P6: build | PASS |
| P6: lint | PASS |
| P6: code quality scan | PASS (clean) |
| P6: P0 feature presence | 12/12 PASS |
