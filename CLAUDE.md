# CurriculumVitae

Static CV site (RO/EN) on GitHub Pages, content in Supabase. No build step, no framework, no package.json.

## Layout

- `index.html` + `js/main.js` - public page. Reads Supabase REST with plain `fetch()` (`js/services/CvRepository.js`). Don't add supabase-js here.
- `admin.html` + `js/admin/` - login, glass sidebar with one `TableView` per table, add/edit in `RecordDialog`, delete via `ConfirmDialog` (native `<dialog>`). Uses supabase-js from jsdelivr (pinned version in `js/services/supabaseClient.js`).
- `js/admin/editorSchemas.js` - sidebar icon, list columns and form fields per table. New DB column = schema field + mapping in `CvRepository.js` + output in `CvRenderer.js`. Lookup tables (e.g. `collaboration_types`) get their own tab and are referenced with `optionsFrom` on a select field; the public page reads them through a PostgREST embed (`select=*,collaboration_types(...)`).
- `supabase/migrations/` - schema, RLS, constraints. The owner runs these by hand in the Supabase SQL Editor; never assume a migration has been applied, write them so they can run on top of the previous ones.

- `.github/workflows/deploy.yml` - deploys Pages and stamps `?v=<commit>` on every local CSS/JS URL and relative `import`. Keep imports static and relative (`from "./x.js"`) so the stamping catches them; `data-version="dev"` on `<html>` must stay as is in the source.

## Rules

- Naming: camelCase in JS and CSS classes (`timelineItem__period`), snake_case in SQL.
- Everything that goes into `innerHTML` passes through `escapeHtml`; URLs through `safeExternalUrl`.
- Both HTML files have a CSP meta tag. A new external host (CDN, API) has to be added there or it gets blocked silently.
- Writes are protected by RLS (`private.is_admin()`), not by the admin UI.
- Measure before optimizing (`/webperf`); keep it minimal (`/ponytail`); review SQL against the Supabase Postgres best practices skill.

## Run locally

```bash
python3 -m http.server 8000
```
