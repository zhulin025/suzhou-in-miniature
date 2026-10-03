# City module contract

Each regional module exports `cities`: an object keyed by city slug. Each value contains:

```js
{
 name: '杭州', en: 'HANGZHOU', subtitle: '西湖烟柳 · 钱塘潮声',
 intro: 'Two concise sentences about this scene.', stamp: '杭',
 coordinates: '30.2741° N · 120.1551° E', region: '江南',
 palette: { water:'#78afa2', grass:'#98ad81', roof:'#485b57' },
 spawn: [0,57], // optional preferred walking start, in world X/Z
 build(ctx) { /* author all geometry and register 3–5 landmarks */ }
}
```

`ctx` is created by the shared city-kit:

- `THREE`, `b` (existing ModelBuilder), `m` (existing-style material dictionary), `root`, seeded `random()`.
- Original materials: wall, wall2, stone, trim, paving, road, roof, ridge, tile, wood, redwood, bridge, gold, grass, earth, edge, sand, hill, hill2, bark, leaf, leaf2, leaf3, pine, pink, glass, glass2, steel, white, rock, lotus, flower, boat, sail, window, lantern, citylight, lamp, water. Extra: brick, red, blue, dark, concrete.
- `material(name,color,roughness=.8,metalness=0)` creates or reuses a named material.
- `local(x,z,rotation,scale,callback)` callback receives `(localBuilder, m)` with origin at ground; local y=0 maps to world y=1.1. All local geometry merges into world batch. Add colliders separately.
- `solid(x,z,w,d)` registers an axis-aligned footprint of FULL width/depth. Use for solid buildings only, not open plazas or doorways.
- `lake(x,z,rx,rz)` creates an elliptical recessed lake and blocks water for walking.
- `water(points)` creates a recessed water polygon from `[x,z]` pairs. Keep it strictly inside the rounded land outline (192 × 144, corner radius 11), with no self-intersections. Points inside the rectangular bounds may still lie outside a rounded corner. Avoid overlapping water shapes.
- `island(x,z,rx,rz)` adds an elliptical land patch in water; walkable.
- `road(points,width=4,material=m.paving)` continuous ground path with edging. Ground y=1.1; path should stay on land except bridges.
- `bridge(x,z,length=18,width=4,rotation=0,style='arch')`: center, length direction along local X; rotation radians, `flat` supported. Creates walking height support. Keep road→bridge connected; don't place buildings on approach.
- `hill(x,z,rx,rz,height)` terrain mound; returns height function; trees/structures on it must explicitly use sampled y.
- `tree(x,z,scale=1,type='broad',y=1.1)`: types broad, pine, willow, palm, blossom. Detailed trunks/branches/crowns.
- `house(x,z,w=7,d=6,h=4,rotation=0,options={})`: existing detailed Chinese hip roof house, collision included. options.wall, y, lantern, detail.
- `pavilion(x,z,radius=3,y=1.1,levels=1)` open structure.
- `pagoda(x,z,{levels:7,radius:4,storey:3.5,roof:m.roof,wall:m.wall,y:1.1,round:false})`: generic detailed multi-eave tower; customize real building topology yourself where distinctive.
- `tower(x,z,w,d,height,{style:'glass'|'steps'|'taper'|'twist',material:m.glass,tiers:5})`: modern detailed facade geometry and collider.
- `shop(x,z,{name:'原创店名',width:8,depth:7,kind:'tea'|'books'|'food',wall:m.wall,roof:m.roof})`: open front (+Z), interior 3D counter, shelves, goods, original text signage; walkable entrance. Add near a road with access from +Z.
- `sign(text,x,y,z,width=3,rotation=0)` double-sided freestanding/text board, faces +Z. Uses rasterized original text.
- `street(points,{width:6,trees:'broad',spacing:10})`: road, lamps and optional street trees; points simple polylines, keep clear of building footprints.
- `boat(x,z,{scale:1,rotation:0,sail:false,axis:'x'|'z',travel:8})`: animated local boat; choose travel that stays in water.
- `landmark({id,name,en,tag,desc,x,z,height:12,radius:12,walk:[x,y,z],camera:[x,y,z]})` creates UI point and detail camera bookmark. Camera optional, computed from radius/height. walk optional, kit finds a safe nearby ground point; explicit walking points highly recommended (ground eye = 2.95).

The tile is 194 × 146, x in [-94,94], z in [-70,70], northern/far edge at negative Z. Main viewing camera at [225,196,273]. Tall monuments preferably towards back, buildings leave central walking streets and focal plazas. Full overview should have readable silhouettes, 35–60 contextual buildings, 80–150 trees depending on biome, 3–5 genuine distinct landmark structures. Keep extreme heights below 65 and total triangles below ~600k per city. No giant fake labels in geometry. Background building types must match the city (not all traditional Chinese houses in modern cities).

Every city requires original modelled landmarks, no screenshot planes or renamed duplicates. Use custom THREE geometries, beams, extruded shapes, torus/cylinder rings, domes, columned arcades, trusses and roof details. Conservatively artistic reconstruction: don't assert survey scale or exact interiors. Record reliable references and model inventories in `docs/cities-REGION.md`.
