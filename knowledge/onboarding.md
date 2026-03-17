# Onboarding Guide: ClawMark

## Quick Start

1. Clone: `git clone https://github.com/clawlabz/clawmark`
2. Install: `cd app && pnpm install`
3. Dev: `pnpm dev` → http://localhost:3000
4. Build: `pnpm build` → outputs to `out/`

## Project Structure

```
app/
├── app/
│   ├── layout.tsx          # Root layout, font, metadata, dark mode script
│   ├── page.tsx            # Main SPA page (client component, wires everything)
│   └── globals.css         # Tailwind + shadcn CSS variables
├── components/
│   ├── layout/             # Header, TagSidebar
│   ├── bookmarks/          # BookmarkList, BookmarkCard, EmptyState
│   └── dialogs/            # Add, Edit, Delete, Import dialogs
├── hooks/
│   └── useBookmarks.ts     # Core data hook (localStorage + React state)
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── storage.ts          # localStorage helpers
│   ├── bookmarkOps.ts      # Pure CRUD + search functions
│   └── exportImport.ts     # JSON export/import/merge
└── vercel.json             # CSP headers, static output config
```

## Key Files

| File | Purpose |
|------|---------|
| `hooks/useBookmarks.ts` | Central data hook — all bookmark state lives here |
| `lib/bookmarkOps.ts` | Pure functions for CRUD, search, tags — fully testable |
| `lib/exportImport.ts` | JSON export/import with duplicate detection |
| `app/page.tsx` | Main page — wires hook to components, keyboard shortcut |

## Common Tasks

- **Adding a new feature**: Modify `useBookmarks.ts` for data logic, add component in `components/`
- **Running tests**: `pnpm test`
- **Building**: `pnpm build` → static files in `out/`
- **Deploying**: `../../scripts/vercel-deploy.sh . mark` from `app/` directory

## Architecture

- Pure client-side SPA — no server, no API routes
- All data in `localStorage` under key `clawmark_bookmarks`
- Static export via `next.config.ts` `output: 'export'`
- Dark mode via `prefers-color-scheme` + `.dark` class toggle
