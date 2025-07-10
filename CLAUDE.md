# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Interactive Next.js web application displaying Thailand provinces with population data visualization. Features authentication and React Leaflet integration with careful SSR handling.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
- `npm run test` - Run all Playwright E2E tests
- `npx playwright test --headed` - Run tests with browser UI
- `npx playwright test --ui` - Run tests in interactive mode
- `npx playwright show-report` - View test results
- `npx playwright install` - Install browser dependencies (required for first test run)

## Architecture Overview

### Next.js App Router Structure
- Uses modern App Router with `app/` directory
- Route-based authentication with middleware protection
- Client-side only rendering for map components to prevent SSR issues

### Authentication System
- **Hardcoded credentials**: `username: tester`, `password: abc123`
- Cookie-based sessions with 24-hour expiry
- Middleware automatically redirects: unauthenticated → `/login`, authenticated accessing `/login` → `/map`
- API endpoint: `/api/auth` for login validation

### Map Implementation Critical Details
**SSR Prevention Strategy:**
- All Leaflet components use `'use client'` directive
- Dynamic imports with `ssr: false` to prevent "window is not defined" errors
- Leaflet CSS loaded dynamically via CDN (not bundled)
- Map components wrapped in multiple layers of dynamic imports

**File Structure:**
- `/app/map/page.tsx` - Protected map page (client component)
- `/components/ThailandMap.tsx` - Main map with dynamic React Leaflet imports
- `/components/LeafletWrapper.tsx` - CSS loading wrapper
- `/public/data/thailand-provinces.json` - Authentic GeoJSON data (78 provinces)

### Data Source
- **Real Thailand provinces**: Sourced from https://simplemaps.com/static/svg/country/th/admin1/th.json
- 78 authentic provinces with accurate boundaries (no overlapping geometry)
- Population data integrated for hover tooltips

## Critical Implementation Notes

### Leaflet Integration
- **Never import Leaflet components directly** - always use dynamic imports with `ssr: false`
- **CSS loading**: Leaflet CSS must be loaded client-side via CDN, not bundled
- **Component testing**: Tests must wait for `.leaflet-container` element, not `data-testid` attributes

### Testing Specifics
- Playwright tests configured for `http://localhost:3000`
- Tests require increased timeouts (10-15 seconds) for dynamic component loading
- Province hover tests check for tooltip appearance with specific `data-testid` patterns
- Browser installation required: `npx playwright install`

### TailwindCSS Configuration
- Uses `@tailwindcss/postcss` plugin (not standard tailwindcss)
- Global styles in `app/globals.css`
- Dark mode support via CSS variables

## Common Issues & Solutions

### Map Not Rendering
- Check that component has `'use client'` directive
- Verify all Leaflet imports use `dynamic(..., { ssr: false })`
- Ensure Leaflet CSS is loaded (check LeafletWrapper component)

### Test Failures
- Run `npx playwright install` if browsers are missing
- Increase timeouts for dynamic component loading
- Use `.leaflet-container` selector instead of `data-testid="map-container"`

### Authentication Issues
- Verify cookies are being set properly in browser dev tools
- Check middleware configuration for route protection
- Default credentials: `tester` / `abc123`

## File Organization
- `/app/` - Next.js App Router pages and layouts
- `/components/` - Reusable React components
- `/lib/` - Utility functions (auth, etc.)
- `/public/data/` - Static GeoJSON data files
- `/tests/e2e/` - Playwright test suites
- `/middleware.ts` - Route protection logic