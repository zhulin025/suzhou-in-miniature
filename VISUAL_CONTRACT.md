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
