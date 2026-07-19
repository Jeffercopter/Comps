# Global Mine & Processing Sites — Mobile Map

A mobile-friendly interactive map of 1,175 producing mines, smelters and
refineries worldwide, converted from `data/Global_Mine_Sites.kml`
(FINEPRINT project, Jasansky et al. 2023, CC BY 4.0; prepared by CMD
Consulting).

## Use it on a phone

Open `index.html` in any browser. The easiest way to get a shareable link
is GitHub Pages:

1. Repo **Settings → Pages**
2. Source: **Deploy from a branch**, select the branch and `/ (root)`
3. Open the published URL on your phone (add it to your home screen for
   an app-like experience)

## Features

- **Full-screen touch map** with pinch-zoom and marker clustering, so all
  1,175 sites stay usable on a small screen
- **Search** by site name, country, commodity, owner or region
- **Filter chips** — All / Mines (green) / Smelters & Refineries (blue)
- **Bottom-sheet details** on tap: commodities, owner/operator, status,
  production start, coordinates, plus one-tap **Google Maps** directions
  and the original **source** document
- Swipe down to dismiss the detail sheet; safe-area aware for notched
  phones

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The map app (self-contained UI, no build step) |
| `data/sites.js` | All 1,175 sites converted from the KML to compact JSON |
| `data/Global_Mine_Sites.kml` | Original KML source data |
| `vendor/` | Leaflet 1.9.4 + Leaflet.markercluster 1.5.3 (vendored so the app works without a CDN) |

Map tiles are the only external dependency (© OpenStreetMap © CARTO).
