# Visual review · 2026-09-06

## Result

Accepted as a stylized procedural Suzhou miniature. Browser interaction checks, deterministic diagnostic views, desktop and mobile layouts have been exercised. The full report is in `validation.json`; `visual-review.html` presents the view set.

## Evidence

- Three.js r180, WebGL2, desktop Chrome. Main capture 1440 × 1000, DPR 1. Mobile 390 × 844.
- Seed 310528 and stress seed 91. Baseline animation time 0; additional river checkpoints at 0, 12 and 24 seconds.
- All six camera bookmarks inspected. The pagoda and Oriental Gate are fully framed by their dedicated bookmarks; close-up roof and garden views reveal the authored geometry.
- No post-processing pipeline is present, so the final daytime capture is also the no-post baseline. Night lamps add local light and small transparent sprite halos, not a full-screen effect.
- Wireframe and analytic water normal views alter the actual materials. Water is explicitly normal-only; the surface remains flat and does not claim true reflection or depth refraction.
- Walk movement, mouse look, building and water boundaries, garden access and actual bridge height changes passed browser checks.
- Camera motion, day/night interpolation and guided-tour progression were exercised over time without runtime or shader errors. Temporal checkpoints inspect boat positions and water response; they do not constitute a quantified shimmer benchmark.

## Performance

- Main view: approximately 569,458 triangles, 90 render calls, 71 geometries and 3 reported textures.
- Captured desktop RAF intervals approximately 16.7–20.7 ms; measured CPU submission approximately 0.5–1.1 ms. These are local browser observations, not GPU execution time.
- GPU timing and allocated GPU memory were unavailable. No claim of GPU profiling is made.
- Persistent render targets: PMREM environment and one directional shadow map. No screen-sized post-process targets.
- Standard: DPR capped at 1.5 and 2048 shadow map. High: DPR capped at 2 and 4096 shadow map. Geometry remains the same; higher quality improves sampling and shadow fidelity.

## Deliberate compromises

- Geographic scale, landmarks and terrain are art-directed approximations. The visual arrangement is not a geographic reconstruction.
- Walking constrains water and major buildings and samples ground height. It is not a full rigid-body physics simulation.
- Foliage uses sculpted low-polygon crowns; no leaf simulation. The water uses filtered analytic normals, with no volumetric water or planar reflections.
- Geometry is batched by material for low draw overhead. This makes very close views retain much of the scene's vertex workload.
- Browser startup and shader compilation can temporarily run slower than steady-state measurements.
