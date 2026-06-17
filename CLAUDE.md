# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses **pnpm** as the package manager.

- **Install dependencies**: `pnpm install`
- **Development server**: `pnpm dev` - Starts Nuxt dev server on http://localhost:3333
- **Build**: `pnpm build` - Builds the application for production
- **Preview**: `pnpm preview` - Locally preview production build
- **Generate**: `pnpm generate` - Generate static site
- **Prepare**: `pnpm postinstall` or `nuxt prepare` - Prepare project (auto-runs after install)

## Architecture Overview

This is a Nuxt 3 full-stack photography gallery application called "Niebieskie Aparaty" (Blue Cameras). It's a photo event management system where photographers can upload event galleries and clients can view and select photos.

### Core Tech Stack
- **Frontend**: Nuxt 3 with Vue 3, TypeScript, Tailwind CSS
- **UI Library**: Nuxt UI (v3) with Heroicons
- **Backend**: Nuxt server API routes with H3
- **Database**: AWS DynamoDB
- **Storage**: AWS S3 for images
- **Email**: AWS SES for notifications
- **Authentication**: nuxt-auth-utils with session-based auth
- **Image Processing**: Sharp for optimization
- **Virtual Scrolling**: vue-virtual-scroller for performance with large galleries

### Key Features
- **Event Management**: Create events with photo galleries
- **Photo Selection**: Clients can browse and select photos from events
- **Image Gallery**: Masonry layout with virtual scrolling for performance
- **Authentication**: Basic username/password auth with bcrypt
- **File Management**: S3 integration with presigned URLs
- **Email Notifications**: Automated selection confirmations via SES
- **Seasonal Marketing** (Currently Disabled): Christmas advertising components

### Project Structure

#### Frontend (`app/`)
- `composables/`: Business logic composables (useAuth, useEventGallery, useEvents, useSelection)
- `components/`: Vue components for UI elements
- `pages/`: File-based routing with nested routes for events and galleries
- `layouts/`: Layout templates (default, gallery, login)
- `middleware/`: Route guards (authenticated.ts)
- `plugins/`: Client-side plugins. Globally register `MasonryWall` (from `@yeger/vue-masonry-wall`) and `RecycleScroller`/`DynamicScroller`/`DynamicScrollerItem` (from `vue-virtual-scroller`) — used in templates without imports. **`vue-virtual-scroller/dist/vue-virtual-scroller.css` must be imported in the plugin** — without it, scroller items escape to the viewport.

#### Backend (`server/`)
- `api/`: API endpoints following RESTful patterns
- `config/`: AWS service configurations (DynamoDB, S3, SES)
- `repository/`: Data access layer with repository pattern
- `service/`: Business logic services (authService)
- `utils/`: Utility functions for email and file operations

#### Shared (`shared/`)
- `types/`: TypeScript interfaces shared between client and server
- `utils/`: Shared utility functions

### Database Schema (DynamoDB — single-table)
- **Table**: `niebieskie-aparaty-prod` (override with `DYNAMODB_TABLE` env var). PK + SK both String. Region `eu-central-1`.
- **Partition**: every read uses `PK = USER#<username>` (from authenticated session). SK prefixes: `#PROFILE`, `EVENT#<eventId>`, `GALLERY#<eventId>`, `GALLERY_ITEM#<eventId>#<imageName>`, `SELECTION#<eventId>`, `SELECTION_ITEM#<eventId>#<imageName>`, `FILE#<eventId>#<fileId>`.
- **Key builders**: `server/utils/keys.ts` — never inline ``` `USER#${u}` ``` at call sites (typos = silent zero-result queries).
- **No `ScanCommand`** anywhere — always `Query` (with `begins_with(SK, ...)`) or `GetItem`.
- **`TenantGallery` (`PK = TOKEN#...`)** belongs to a different future app — never read it here.
- **Selection state is dual-written**: `Selection.selectedImages` (canonical list used to restore the UI on load) AND per-row `SelectionItem.selected` (used by per-item flows — email rendering, item queries). Save/submit run `server/utils/selectionDiff.ts` for the per-item diff, then `selectionRepository.updateSelectedImages()` for the list. No client cookie/localStorage — restore is server-only.
- **MongoDB MCP server is configured globally but does NOT apply here** — this app's DB is DynamoDB. Use `aws dynamodb …` or the AWS console for DB inspection.
- Full migration contract: `specs/client-app-migration-guidelines.md`.

### Authentication Flow
1. Client submits credentials via basic auth (username:password base64 encoded)
2. Server validates against DynamoDB profile rows using **nuxt-auth-utils scrypt**: `hashPassword(pw)` / `verifyPassword(hash, pw)` (auto-imported server-side). Bcrypt has been removed — legacy bcrypt-hashed rows will not verify and need re-hashing on next set or a migration.
3. Session created with 7-day expiration using nuxt-auth-utils
4. Middleware protects routes requiring authentication

### File Management
- **GalleryItem / SelectionItem rows already carry pre-signed CloudFront URLs** (6-month TTL). **DB attribute names are `cloudFront`-prefixed** — `cloudFrontWebpUrl` + `cloudFrontOriginalUrl` on GalleryItem, `cloudFrontUrl` on SelectionItem. Repositories remap them to `webpUrl`/`originalUrl`/`url` for the typed view — keep that mapping when adding fields. Read directly — no signing in this app.
- **`<NuxtImg>` with signed CloudFront URLs**: do NOT pass `format=...`, `:placeholder="true"`, or other IPX-triggering props — IPX rewrites the URL and the signature breaks silently (no console error, just a gray placeholder). Plain `:src` only, or use `<img>`.
- **Nitro `defineCachedFunction` caches across edits**: gallery and selection list endpoints cache for 5 min in-memory. After a repository/mapping fix, restart `pnpm dev` (or wait out the TTL) — bad cached payloads do not invalidate on HMR. **Do not cache the `/download` endpoints** — each call must re-presign (60s TTL) so the redirect target is always fresh.
- **Event cover (`imagePlaceholderObjectKey`) + Files (`FILE#...`)**: only `objectKey` is stored. Sign on demand via `server/utils/generatePresignedUrl.ts` (S3 presigner, bucket `niebieskie-aparaty-client-gallery`, 60s TTL).
- **Never store presigned URLs you generate yourself in DynamoDB** — they expire; the long-lived CloudFront URLs are written by the admin app, not this one.
- **`imageName` asymmetry**: GalleryItem `imageName` has **no file extension** (`IMG_4896`); SelectionItem `imageName` **keeps the extension** (`IMG_0004.jpg`). Both are SK-shaped — use as-is for DynamoDB SKs and object reads. For UI labels only, `toDisplayName()` in `shared/utils/imageName.ts` strips the trailing extension.
- **UI label is `displayName`**: `useEventGallery`/`useSelection` decorate fetched items with `displayName = toDisplayName(imageName)`. Read `item.displayName` in templates/emails — don't re-strip the extension at the call site.
- **Image downloads go through a same-origin redirect, not the stored CloudFront URL.** `app/utils/downloadFromUrl.ts#triggerDownload(path)` synthesizes an `<a>` click to `/api/events/[eventId]/gallery/[imageName]/download` (or `/api/selections/[eventId]/items/[imageName]/download`). The endpoint authenticates, looks up `originalObjectKey` / `objectKey` on the row, and `sendRedirect(302)`s to an S3 presigned URL signed with `ResponseContentDisposition: attachment; filename="..."` via `generatePresignedDownloadUrl(bucket, key, filename)` in `server/utils/generatePresignedUrl.ts`. Browser streams direct from S3 — no JS blob, no proxy. **Don't try to append `response-content-disposition` to the stored `cloudFrontOriginalUrl` / `cloudFrontUrl`** — they use a canned policy whose Resource is the bare URL, so any extra query param invalidates the signature (silent CloudFront 403). Re-signing with CloudFront would require the admin app's key pair, which this app doesn't have — sign with S3 directly.
- **S3 buckets**: gallery originals live in `niebieskie-aparaty-gallery-images` (behind CloudFront `dlolzcr6ej14p`); selection originals + `FILE#` objects share `niebieskie-aparaty-client-gallery` (selection behind `d319ycflg0po6r`). CloudFront URL pathname = literal S3 object key (no path rewrites) — but prefer the stored `originalObjectKey` / `objectKey` attributes over parsing URLs.
- **CloudFront CORS** (Managed-SimpleCORS on both image distributions) is still attached but is no longer required for downloads after the redirect refactor. Leaving it on is fine; not needed for new behaviors that serve only downloads.

### TypeScript
- `verbatimModuleSyntax` is enabled. Always import types with `import type { ... }`, otherwise `tsc --noEmit` fails with TS1484.
- There are two pre-existing TS errors in `server/api/login.post.ts` (string-undefined assignments) that pre-date the single-table migration — ignore in baseline `tsc` runs.

### Performance Optimizations
- Virtual scrolling for large image galleries via `DynamicScroller` with `page-mode` (uses window scroll, no inner scrollbar) wrapping chunks of images, each rendered as a `MasonryWall`. Chunks carry an `offset` so click/load handlers can map back to the flat index.
- Image lazy loading with placeholder animations
- Chunked rendering (~200 images per chunk) so only nearby chunks instantiate their `MasonryWall`
- Masonry layout with responsive columns
- `DynamicScroller` chunk size and `MasonryWall` are coupled: gallery uses ~200/chunk and works; chunks of ~20 break the masonry layout (columns don't lay out). If you need smaller batches inside masonry, use a concurrency-limited load queue (see `app/components/SelectedItemsWrapper.vue`) instead of virtualization.
- **Selection page image throttle**: `app/components/SelectedItemsWrapper.vue` gates `<NuxtImg>` rendering via `v-if="shouldLoad(imageName)"` so only ~4 images load at a time (top-down). Derived from `props.loadedImages`, not a local counter — local state would reset when parent's `getItemsForTab()` returns a new sliced array on every selection toggle.

### Environment Variables Required
- `AWS_REGION`: AWS region for services
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

### Key Patterns
- Repository pattern for data access
- Singleton pattern for services (AuthService, repositories)
- Composables for reactive state management
- Type-safe API endpoints with shared TypeScript interfaces
- Error handling with toast notifications
- **`loadedImages` is the source of truth for per-image load state** (in `useSelection`/`useEventGallery`, keyed by `imageName`). It persists across tab switches, pagination, and selection toggles. Child components throttling/gating image loads should *derive* from it — never mirror it into local state and `watch(() => props.items)`, because `getItemsForTab()` returns a fresh `.slice()` on every parent rerender (selection toggle → `tabs` computed re-runs → new array reference).

### Seasonal Marketing Features

The application includes Christmas/holiday advertising components that are currently **commented out** but preserved for future use.

#### Components
- **ChristmasPopup** (`app/components/ChristmasPopup.vue`): Modal popup promoting Christmas photo sessions
- **Christmas Banner** (in `app/components/Navbar.vue`): Top banner with holiday messaging

#### How to Re-enable for Next Season

1. **Navbar Banner** (`app/components/Navbar.vue`):
   - Uncomment lines 3-41 (the Christmas banner HTML)
   - Update navbar position from `top-0` back to `top-[52px]`

2. **Popup Component** (`app/layouts/default.vue`):
   - Uncomment line 8: `<ChristmasPopup ref="christmasPopup" @close="handlePopupClose" />`
   - Uncomment lines 14-36 (the popup logic in script setup)

3. **Login Trigger** (`app/composables/useAuth.ts`):
   - Uncomment lines 16-20 (localStorage flag that triggers popup after login)

All commented sections are marked with `COMMENTED OUT FOR NEXT YEAR` for easy searching.

#### How It Works
- Christmas banner displays at top of navbar on all pages
- Popup appears once after user login (controlled via localStorage)
- Users can dismiss popup, and it won't show again (persisted in localStorage)
- Banner links to main photography website for booking sessions