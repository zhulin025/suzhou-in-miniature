// Geometry and pedestrian connectivity checks, without a browser/WebGL context.
// Usage: node scripts/validate-city-geometry.mjs
// The 1-unit BFS uses cardinal steps and checks each edge midpoint against
// the real world collision function, so it cannot jump thin garden walls.
import * as THREE from 'three';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { catalog, loaders } from '../src/cities/catalog.js';
import { buildCityWorld } from '../src/cities/city-kit.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_X = -93, MAX_X = 93, MIN_Z = -69, MAX_Z = 69;
const WIDTH = MAX_X - MIN_X + 1, DEPTH = MAX_Z - MIN_Z + 1;
const nodeId = (x, z) => (z - MIN_Z) * WIDTH + x - MIN_X;
const coords = id => [id % WIDTH + MIN_X, Math.floor(id / WIDTH) + MIN_Z];

function connectivity(world) {
  const valid = new Uint8Array(WIDTH * DEPTH);
  const labels = new Int32Array(WIDTH * DEPTH).fill(-1);
  for (let z = MIN_Z; z <= MAX_Z; z++) for (let x = MIN_X; x <= MAX_X; x++) {
    valid[nodeId(x, z)] = world.isWalkable(x, z) ? 1 : 0;
  }
  const sizes = [], queue = new Int32Array(valid.length);
  for (let start = 0; start < valid.length; start++) {
    if (!valid[start] || labels[start] >= 0) continue;
    const component = sizes.length;
    let head = 0, tail = 1;
    queue[0] = start; labels[start] = component;
    while (head < tail) {
      const current = queue[head++], [x, z] = coords(current);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, nz = z + dz;
        if (nx < MIN_X || nx > MAX_X || nz < MIN_Z || nz > MAX_Z) continue;
        const next = nodeId(nx, nz);
        if (!valid[next] || labels[next] >= 0 || !world.isWalkable(x + dx * .5, z + dz * .5)) continue;
        labels[next] = component; queue[tail++] = next;
      }
    }
    sizes.push(tail);
  }
  const componentAt = point => {
    const [x, , z] = point;
    if (!world.isWalkable(x, z)) return { component: null, snappedTo: null };
    const candidates = [];
    for (let nx = Math.floor(x) - 1; nx <= Math.ceil(x) + 1; nx++) for (let nz = Math.floor(z) - 1; nz <= Math.ceil(z) + 1; nz++) {
      if (nx < MIN_X || nx > MAX_X || nz < MIN_Z || nz > MAX_Z || !valid[nodeId(nx, nz)]) continue;
      const distance = Math.hypot(nx - x, nz - z);
      if (distance > 1.6) continue;
      let clear = true;
      for (let f = .2; f < 1; f += .2) if (!world.isWalkable(x + (nx - x) * f, z + (nz - z) * f)) { clear = false; break; }
      if (clear) candidates.push({ component: labels[nodeId(nx, nz)], snappedTo: [nx, nz], distance });
    }
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0] || { component: null, snappedTo: null };
  };
  const spawn = componentAt(world.places.find(p => p.id === 'all').walk);
  const check = (id, name, point, kind) => {
    const target = componentAt(point);
    return { id, name, kind, point, walkable: world.isWalkable(point[0], point[2]), component: target.component, snappedTo: target.snappedTo, connectedFromSpawn: target.component !== null && target.component === spawn.component };
  };
  return {
    gridStep: 1,
    movement: '4-neighbor with collision-checked edge midpoints',
    bounds: [MIN_X, MIN_Z, MAX_X, MAX_Z],
    componentSizes: sizes,
    spawn: { point: world.places.find(p => p.id === 'all').walk, ...spawn },
    landmarks: world.places.filter(p => p.id !== 'all').map(p => check(p.id, p.name, p.walk, 'landmark')),
    shops: world.shops.flatMap((s, i) => [check(`shop-${i}-door`, s.name, s.door, 'shop-door'), check(`shop-${i}-inside`, s.name, s.inside, 'shop-inside')]),
  };
}

function inspectGeometry(scene) {
  let triangles = 0, meshCount = 0, nonFiniteCoordinates = 0, nonFiniteNormals = 0;
  scene.traverse(object => {
    if (!object.isMesh) return;
    meshCount++;
    const geo = object.geometry, position = geo.attributes.position;
    triangles += (geo.index ? geo.index.count : position.count) / 3;
    for (const value of position.array) if (!Number.isFinite(value)) nonFiniteCoordinates++;
    if (geo.attributes.normal) for (const value of geo.attributes.normal.array) if (!Number.isFinite(value)) nonFiniteNormals++;
  });
  return { triangles, meshCount, nonFiniteCoordinates, nonFiniteNormals, finite: !nonFiniteCoordinates && !nonFiniteNormals };
}

function inspectPaths(world) {
  let samples = 0, blockedSamples = 0;
  const blockedSegments = [];
  for (const item of world.paths) for (let k = 1; k < item.points.length; k++) {
    const a = item.points[k - 1], b = item.points[k];
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
    let blocked = 0;
    for (let j = 0; j <= steps; j++) {
      samples++;
      if (!world.isWalkable(a[0] + (b[0] - a[0]) * j / steps, a[1] + (b[1] - a[1]) * j / steps)) blocked++;
    }
    blockedSamples += blocked;
    if (blocked) blockedSegments.push({ from: a, to: b, blockedSamples: blocked });
  }
  return { samples, blockedSamples, blockedSegments };
}

const groups = Object.fromEntries(await Promise.all(Object.entries(loaders).map(async ([name, load]) => [name, (await load()).cities])));
const results = [];
for (const entry of catalog.filter(item => item.group)) {
  const scene = new THREE.Scene();
  try {
    const definition = groups[entry.group][entry.id];
    if (!definition) throw new Error(`Missing definition: ${entry.id}`);
    const world = buildCityWorld(scene, definition, 310528);
    const geometry = inspectGeometry(scene);
    const pedestrian = connectivity(world);
    const targets = [...pedestrian.landmarks, ...pedestrian.shops];
    const invalidTargets = targets.filter(target => !target.walkable);
    const disconnectedTargets = targets.filter(target => !target.connectedFromSpawn);
    const islandTargets = pedestrian.landmarks.filter(target => ['easttower', 'westtower', 'jiangxin'].includes(target.id));
    const islandInternallyConnected = entry.id === 'wenzhou' && islandTargets.length === 3 && islandTargets.every(target => target.walkable && target.component !== null) && new Set(islandTargets.map(target => target.component)).size === 1;
    const gulangyuTargets = targets.filter(target => ['rock', 'bagua'].includes(target.id) || target.name === '岛上书房');
    const gulangyuConnected = entry.id === 'xiamen' && gulangyuTargets.length === 4 && gulangyuTargets.every(target => target.walkable && target.component !== null) && new Set(gulangyuTargets.map(target => target.component)).size === 1;
    for (const target of disconnectedTargets) {
      if (islandInternallyConnected && ['easttower', 'westtower', 'jiangxin'].includes(target.id)) {
        target.expectedIslandTransfer = {
          mode: 'landmark-walk-spawn',
          reason: '江心屿为瓯江中真实岛屿，与大陆不设虚构步行桥。使用漫游起点/地标入口上岛；该目标独立通过 isWalkable 且岛内三个地标相互连通。',
        };
      }
      if (gulangyuConnected && gulangyuTargets.includes(target)) {
        target.expectedIslandTransfer = {
          mode: 'landmark-walk-spawn',
          reason: '鼓浪屿保留独立海岛，通过日光岩或八卦楼漫游起点上岛；两个地标及书房门口、室内均验证岛内连通。',
        };
      }
    }
    const unexpectedDisconnectedTargets = disconnectedTargets.filter(target => !target.expectedIslandTransfer);
    const paths = inspectPaths(world);
    const result = { city: entry.id, name: entry.name, group: entry.group, geometry, pedestrian, paths, invalidTargets, disconnectedTargets, unexpectedDisconnectedTargets, geometryAndPositionsPassed: geometry.finite && !invalidTargets.length, walkConnectivityPassed: !disconnectedTargets.length, connectivityPassed: !unexpectedDisconnectedTargets.length, pathsPassed: !paths.blockedSamples };
    results.push(result);
    console.log(JSON.stringify({ city: entry.id, triangles: geometry.triangles, finite: geometry.finite, invalidTargets: invalidTargets.map(t => t.name), unexpectedDisconnected: unexpectedDisconnectedTargets.map(t => `${t.kind}:${t.name}`), expectedIslandTransfer: disconnectedTargets.filter(t => t.expectedIslandTransfer).map(t => t.name), blockedPathSamples: paths.blockedSamples }));
  } catch (error) {
    results.push({ city: entry.id, error: String(error), geometryAndPositionsPassed: false, connectivityPassed: false });
    console.error(entry.id, error);
  } finally {
    scene.traverse(object => { if (object.isMesh) object.geometry.dispose(); });
  }
}
const report = {
  tool: 'validate-city-geometry',
  generatedAt: new Date().toISOString(),
  purpose: 'Static geometry, real collision-function placement checks, and 1-unit pedestrian connectivity for every new city',
  note: 'Connectivity records physical walking only. Disconnected real islands may intentionally use landmark entry; such cases are reported explicitly, not silently counted as connected.',
  summary: { cities: results.length, geometryAndPositionsPassed: results.filter(r => r.geometryAndPositionsPassed).length, fullyWalkConnected: results.filter(r => r.walkConnectivityPassed).length, connectivityWithExplicitIslandTransfersPassed: results.filter(r => r.connectivityPassed).length, expectedIslandTransferTargets: results.reduce((sum, r) => sum + (r.disconnectedTargets?.filter(t => t.expectedIslandTransfer).length || 0), 0), unexpectedDisconnectedTargets: results.reduce((sum, r) => sum + (r.unexpectedDisconnectedTargets?.length || 0), 0), blockedPathSamples: results.reduce((sum, r) => sum + (r.paths?.blockedSamples || 0), 0) },
  results,
};
await mkdir(path.join(projectRoot, 'artifacts'), { recursive: true });
await writeFile(path.join(projectRoot, 'artifacts/city-geometry.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary));
if (results.some(r => !r.geometryAndPositionsPassed || !r.connectivityPassed || !r.pathsPassed)) process.exitCode = 1;
