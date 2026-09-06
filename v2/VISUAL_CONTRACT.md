# 苏州城市图谱 2.0 · Visual contract

- Separate application and dev server; no edits to the 1.0 sources, entry, or deployment.
- WGS84 source geometry projected to local transverse Mercator, with 1 world unit = 1 metre. Vertical scale is also 1:1.
- Cover the OSM Suzhou prefecture administrative area, including its county-level cities. Render the user-approved frozen subset of 23,898 valid footprints, covering all district/county-level city regions and SIP; never fill coverage gaps with invented buildings.
- Preserve measured footprint shapes, courtyard holes, real roads and waterways. Boundary/water/green polygons use metre-scale simplification; no imagery or live tiles required at runtime.
- Heights: OSM height, then levels × 3.2 m, then deterministic type-based estimates. Estimates and simplified landmark models are disclosed in UI and data manifest.
- Architectural map palette: warm white buildings, jade water, pale green terrain, legible graphite roads. Restrained ivory interface and deep green controls; city remains the principal subject.
- Near 120 m, design 3–20 km, far 230 km camera distances. Orbit/zoom/pan, top-down, return home, searchable landmarks, region bookmarks, day/night. No first-person walking.
- Night windows use metre-scale facade coordinates, deterministic occupancy, shared light masks, and derivative filtering. Buildings retain form without postprocessing. Rooftops do not emit window grids.
- Static merged geometry in geographic tiles with frustum culling. Building roofs and walls share a facade shader. Quality controls DPR and distant subpixel-building visibility, not coordinates or height.
- Target 33 ms/frame on desktop integrated graphics at 1440×900 / DPR 1; report measured CPU submission and RAF separately, GPU timing only if measured.
- Evidence: deterministic bookmarks, day/night/near/far/top-down/mobile, facade emission and height-source diagnostics; interaction checks, all footprints accounted for, geometry validation, runtime errors, 1.0 hash comparison.
