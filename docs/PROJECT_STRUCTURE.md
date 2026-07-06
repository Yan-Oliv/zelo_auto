# Project Structure

This project is organized by feature first, with shared utilities separated from page-specific code.

## Source

- `src/App.tsx`: route switch for the landing page and development debug pages.
- `src/main.tsx`: React entry point and global providers.
- `src/features/landing`: public landing page, section data, and landing-only UI components.
- `src/features/cinematic`: 3D car scene, cinematic keyframes, GSAP ScrollTrigger hook, and scroll state context.
- `src/features/debug`: isolated pages for validating GLB loading and clean/dirty crossfade.
- `src/shared`: reusable components, hooks, and motion settings used across features.
- `src/images`: raster images imported by React components.
- `src/logos`: Zelo logo assets imported by React components.
- `src/index.css`: Tailwind layers, tokens, and global component classes.

## Static Assets

- `public/models`: GLB files and generated model previews served directly by Vite.
- `assets/source-models`: original/source model files kept for reference or future processing.

## Project Reference

- `docs/reference/stitch`: original Stitch visual reference exported for consultation.
- `docs/qa/captures`: screenshots generated during validation.
- `docs/qa/reports`: JSON reports generated during validation.
- `scripts/qa`: Playwright and validation scripts used during development.
- `tools`: local tooling used to process 3D assets, including Blender automation.

## Import Aliases

- `@/*`: anything under `src`.
- `@assets/*`: visual assets under `src`.
- `@features/*`: feature modules under `src/features`.
- `@shared/*`: shared modules under `src/shared`.

Prefer aliases for cross-feature imports. Prefer relative imports only inside the same feature folder.
