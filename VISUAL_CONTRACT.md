# 姑苏小境 · Visual contract

- Subject: a handcrafted, geographically compressed Suzhou miniature, not a survey or navigational map.
- Identities: whitewashed courtyard walls, sculpted charcoal eaves, true arched stone bridges, seven-tier Tiger Hill pagoda, a hollow Gate of the Orient, gardens and turquoise bounded lakes.
- Silhouette: layered landscape plinth; hills to the west; low central city; contemporary skyline to the east.
- Materials: plaster, charcoal clay tile, weathered stone, warm timber, jade water and blue-green glass remain distinguishable without post-processing.
- Motion: slow analytic water normals, canal boats, bird flocks; time-based day/night transition; eased camera bookmarks.
- Camera: walking eye level 1.8 units above paving; inspection distance 8–100; design distance ~260; far limit 410.
- Invariants: bridges have open arches; pagoda has seven separate roof levels; Oriental Gate has an open center; canal-side walking route remains passable; UI never intercepts canvas gestures outside controls.
- Input seed: 310528 by default, query parameter `seed` available. Building locations and landmarks are fixed, vegetation and small details seeded.
- Rendering: WebGL2, physically lit materials, no bloom or screen-space post-processing; capped DPR, static shadow cache. Normal-only water, no displaced geometry or screen-space refraction claims.
- Inspection: `window.__SUZHOU__` exposes camera bookmarks, fixed time, seed, water-normal and wireframe diagnostics, quality and metrics. `?debug=1` adds a panel.
- Quality: standard DPR <= 1.5 with 2048 shadows; high DPR <= 2 with 4096 shadows. Geometry is merged by material after construction.
- Target: 16.7–33.3 ms steady-state frame interval on desktop, report measured CPU/RAF interval separately from unavailable GPU timings.
- Known artistic compressions: district distances, building sizes and terrain outlines are composed for readability; landmarks are recognizable procedural interpretations.

## Multi-city extension

- Preserve the original Suzhou scene at `/` and v2 at `/v2/`. The 17-city selector at `/cities.html` is a lightweight DOM page; load a regional model module only after entering a city.
- New independent scenes: Hangzhou, Shanghai, Nantong, Wuxi, Changzhou, Nanjing, Wenzhou, Ningbo, Guangzhou, Shenzhen, Beijing, Datong (Shanxi), Changsha, Wuhan, Qingdao and Dalian.
- Share the interaction, lighting and material toolkit, while keeping separate water outlines, street layouts, landmark geometry and shop interiors. This is a composed miniature, not a geographical navigation service.
- Identity checks: five octagonal Leifeng tiers; thirteen Tianning tiers; roofless banyan-topped Wenzhou East Tower; Shanghai World Financial Center's open portal; Guangzhou Tower's waisted lattice; Shenzhen Civic Center's winged roof; Beijing's three circular Temple of Heaven roofs; Datong's recessed grotto niches; Qingdao's twin church spires; Dalian's suspended coastal bridge.
- Each new city has at least three landmark camera bookmarks and one shop with an open entrance, shelves, counter and local goods. Spawn points, landmarks and shop interiors use walkable land and bridges. Wenzhou's real offshore Jiangxin Island remains separate: choose an island landmark in the walking destination selector to start there. No invisible pedestrian bridge is implied.
- Recess water polygons into the land plinth. Water shader normals are filtered and normal-only; never imply ocean simulation or physical refraction.
- Desktop: rotate, zoom, pan, day/night, camera bookmarks, tour and WASD walking. Mobile: orbit/pinch, a walking joystick and independent look drag. Cancel movement on pointer cancellation, blur, modal opening or walk exit.
- Diagnostic API: `window.__CITY__`, seed 310528, `setTime(0)`, `setDebug('wireframe')`, `setDebug('water-normals')`, `metrics()`. RAF time includes browser scheduling and is not GPU time.
- New-city QA: `scripts/validate-city-geometry.mjs` checks geometry, collision and connectivity; `scripts/validate-cities.mjs` checks actual WebGL2 pages, day/night, camera bookmarks and keyboard walking in Ego Browser.
- Primary references and all local simplifications are recorded in `docs/cities-jiangnan.md`, `docs/cities-metropolis.md`, and `docs/cities-north.md`.
