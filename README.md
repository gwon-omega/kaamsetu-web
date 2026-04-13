# Shram Sewa

Production bootstrap for the Nepal local-government manpower platform.

## Quick Start

1. Install dependencies:

   pnpm install

2. Configure web environment:

   Copy apps/web/.env.example to apps/web/.env.local

   Keep PUBLIC_ENABLE_SUPABASE=false until backend is ready

3. Run web app:

   pnpm dev

4. Build web app:

   pnpm --filter @shram-sewa/web build

## Android Quick Start

1. Configure Android environment:

   Copy apps/android/.env.example to apps/android/.env.local

   Set PUBLIC_ENABLE_SUPABASE=true when backend is ready

2. Run Android app:

   pnpm --filter @shram-sewa/android dev

3. Validate Android config and types before release builds:

   pnpm --filter @shram-sewa/android config:public
   pnpm --filter @shram-sewa/android typecheck

4. Build with EAS profiles:

   pnpm --filter @shram-sewa/android eas:build:preview
   pnpm --filter @shram-sewa/android eas:build:production

5. If you need non-interactive startup in CI shells:

   $env:CI=1; pnpm --filter @shram-sewa/android exec expo start --host lan --port 8081

## Web Deployment Choice

- Selected platform: Cloudflare Pages
- Build command: pnpm --filter @shram-sewa/web build
- Output directory: apps/web/dist
- Why this was chosen: aligns with planned Cloudflare edge layer in architecture, supports Vite build defaults, and keeps one deployment surface for the web client.

## UI Media Policy

- Web UI uses royalty-free stock photos served via Pexels CDN with responsive sizing parameters.
- Image definitions are centralized in apps/web/src/lib/royalty-free-images.ts.
- Home page uses adaptive picture sources (portrait/landscape) for better orientation fit and faster first paint.

## Workspace Layout

- apps/web: Vite + React + PWA starter
- apps/android: Android workspace placeholder
- packages/shared: Shared types and constants
- packages/ui-tokens: Color, spacing, and typography tokens

## Root Scripts

- pnpm dev
- pnpm lint
- pnpm typecheck
- pnpm release:android
- pnpm release:android:preview
- pnpm release:android:submit
