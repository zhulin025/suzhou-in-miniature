import { roof } from '../geometry.js';

// City-specific miniatures. Dimensions are compositional model units, not a survey.
const TAU = Math.PI * 2;
const GROUND = 1.1;

function ringRoof(c, b, m, x, y, z, radius, sides = 8, height = 1.25) {
  const verts = [];
  const p = (a, t) => [x + Math.cos(a) * radius * (.48 + .52 * t), y + height * (1 - t) ** 1.5 + .18 * t ** 5, z + Math.sin(a) * radius * (.48 + .52 * t)];
  for (let i = 0; i < sides; i++) {
    const a = i * TAU / sides, a2 = (i + 1) * TAU / sides;
    for (let j = 0; j < 4; j++) {
      const t = j / 4, u = (j + 1) / 4;
      verts.push(...p(a, t), ...p(a2, t), ...p(a, u), ...p(a2, t), ...p(a2, u), ...p(a, u));
      b.beam(m.ridge, p(a, t), p(a, u), .075, 5);
    }
    b.beam(m.ridge, p(a, 1), p(a2, 1), .075, 5);
  }
  const geo = new c.THREE.BufferGeometry();
  geo.setAttribute('position', new c.THREE.Float32BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  b.add(geo, m.roof); geo.dispose();
}

function historicTower(c, x, z, options = {}) {
  const { sides = 8, levels = 7, radius = 3.6, storey = 3.35, wall = c.m.wall, roof: roofMat = c.m.roof, taper = .065, y = GROUND, bare = false, balcony = true } = options;
  const mm = { ...c.m, roof: roofMat };
  c.local(x, z, 0, 1, b => {
    const base = y - GROUND;
    b.cyl(c.m.stone, 0, base + .35, 0, radius + 1.3, radius + 1.65, .7, sides);
    for (let k = 0; k < levels; k++) {
      const r = radius * (1 - k * taper), yy = base + .7 + k * storey;
      b.cyl(wall, 0, yy + storey * .45, 0, r * .9, r, storey * .9, sides);
      b.cyl(c.m.trim, 0, yy + .2, 0, r + .1, r + .1, .22, sides);
      for (let side = 0; side < sides; side++) {
        const a = (side + .5) * TAU / sides, cr = r * Math.cos(Math.PI / sides);
        const px = Math.cos(a) * (cr + .03), pz = Math.sin(a) * (cr + .03);
        b.box(c.m.wood, px, yy + storey * .49, pz, r * .42, storey * .53, .14, -a + Math.PI / 2);
        b.box(c.m.window, px + Math.cos(a) * .09, yy + storey * .49, pz + Math.sin(a) * .09, r * .29, storey * .40, .06, -a + Math.PI / 2);
        if (balcony && !bare) {
          const p1 = [Math.cos(side * TAU / sides) * (r + .5), yy + .82, Math.sin(side * TAU / sides) * (r + .5)];
          const p2 = [Math.cos((side + 1) * TAU / sides) * (r + .5), yy + .82, Math.sin((side + 1) * TAU / sides) * (r + .5)];
          b.beam(c.m.redwood, p1, p2, .07, 5);
          for (let q = 0; q < 3; q++) {
            const f = q / 3, xx = p1[0] * (1 - f) + p2[0] * f, zz = p1[2] * (1 - f) + p2[2] * f;
            b.beam(c.m.redwood, [xx, yy + .22, zz], [xx, yy + .92, zz], .065, 5);
          }
        }
      }
      if (!bare) ringRoof(c, b, mm, 0, yy + storey * .83, 0, r + .95, sides, storey * .38);
    }
    const top = base + .7 + levels * storey;
    if (bare) {
      b.cyl(c.m.dark, 0, top - .11, 0, radius * .49, radius * .49, .12, sides);
      const rim = new c.THREE.CylinderGeometry(radius * .63, radius * .66, .3, sides, 1, true);
      b.add(rim, wall, 0, top, 0); rim.dispose();
    } else {
      b.cyl(c.m.gold, 0, top + 1.15, 0, .07, .52, 2.3, 10);
      for (let k = 0; k < 4; k++) b.cyl(c.m.gold, 0, top + .45 + k * .4, 0, .39 - k * .06, .39 - k * .06, .13, 10);
      b.sphere(c.m.gold, 0, top + 2.45, 0, .22);
    }
  });
  c.solid(x, z, (radius + .4) * 2, (radius + .4) * 2);
}

function hall(c, x, z, w = 17, d = 10, h = 7, opts = {}) {
  const { y = GROUND, color = c.m.wall, roof: roofMat = c.m.roof, two = false } = opts;
  c.local(x, z, 0, 1, b => {
    const base = y - GROUND, mm = { ...c.m, roof: roofMat };
    b.box(c.m.stone, 0, base + .35, 0, w + 2, .7, d + 2);
    b.box(color, 0, base + h / 2 + .6, 0, w, h, d);
    const storeys = two ? 2 : 1;
    for (let k = 0; k < storeys; k++) {
      const yy = base + .6 + k * h / storeys;
      for (let i = 0; i < 7; i++) {
        const xx = -w * .44 + i * w * .88 / 6;
        b.box(c.m.wood, xx, yy + h / storeys * .52, d / 2 + .07, w * .105, h / storeys * .78, .16);
        b.box(c.m.window, xx, yy + h / storeys * .56, d / 2 + .16, w * .076, h / storeys * .60, .04);
        b.cyl(c.m.redwood, xx, yy + h / storeys * .49, d / 2 + 1, .11, .14, h / storeys, 8);
      }
      if (two && k === 0) roof(b, mm, 0, yy + h / 2 - .1, 0, w + 2.9, d + 2.9, 1.8, 0, true);
    }
    roof(b, mm, 0, base + h + .6, 0, w + 2.6, d + 2.8, 2.2, 0, true);
    for (let k = 0; k < 4; k++) b.box(c.m.stone, 0, base + k * .13, d / 2 + 1.8 - k * .36, w * .4, .24, 1.4);
  });
  c.solid(x, z, w, d);
}

function arcade(c, x, z, w = 13, d = 8, h = 9, brick = false) {
  c.local(x, z, 0, 1, b => {
    const wall = brick ? c.m.brick : c.m.wall2;
    b.box(wall, 0, h / 2, 0, w, h, d);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
      const xx = -w * .39 + i * w * .195;
      b.box(c.m.trim, xx, 2.25 + row * h * .45, d / 2 + .05, 1.3, 2.5, .15);
      b.box(c.m.window, xx, 2.25 + row * h * .45, d / 2 + .15, .85, 1.9, .1);
    }
    for (let k = 0; k < 3; k++) b.box(c.m.white, 0, k * h * .49 + .4, 0, w + .4, .28, d + .4);
    for (let i = 0; i < 6; i++) b.box(c.m.white, -w / 2 + i * w / 5, h * .51, d / 2 + .32, .28, h, .4);
    const cap = new c.THREE.ConeGeometry(w * .65, 2.5, 4);
    b.add(cap, c.m.roof, 0, h + 1.25, 0, 1, 1, d / w, Math.PI / 4); cap.dispose();
  });
  c.solid(x, z, w, d);
}

function marker(c, id, name, en, tag, desc, x, z, height, radius = 13, walk) {
  c.landmark({ id, name, en, tag, desc, x, z, height, radius, walk });
}

function grove(c, count, bounds, allowed, type = 'broad', scale = 1) {
  let planted = 0;
  for (let i = 0; i < count * 25 && planted < count; i++) {
    const x = bounds[0] + c.random() * (bounds[2] - bounds[0]), z = bounds[1] + c.random() * (bounds[3] - bounds[1]);
    if (allowed(x, z)) { c.tree(x, z, (.64 + c.random() * .38) * scale, type); planted++; }
  }
}

function regularBlocks(c, xs, zs, modern = false, omit = () => false) {
  for (const x of xs) for (const z of zs) {
    if (omit(x, z)) continue;
    if (modern) c.tower(x, z, 5.5 + c.random() * 1.3, 6.1, 10 + c.random() * 15, { style: c.random() > .65 ? 'steps' : 'glass', material: c.random() > .5 ? c.m.glass2 : c.m.concrete });
    else c.house(x, z, 6.7, 5.5, 3.8 + c.random() * 2, 0, { lantern: c.random() > .4, detail: false });
  }
}

function gardenWall(c, x, z, w, d) {
  const b = c.b, m = c.m;
  b.box(m.wall, x - w / 2, 2.3, z, .55, 2.4, d);
  b.box(m.wall, x + w / 2, 2.3, z, .55, 2.4, d);
  b.box(m.wall, x, 2.3, z - d / 2, w, 2.4, .55);
  for (const side of [-1, 1]) b.box(m.wall, x + side * (w / 4 + 1.5), 2.3, z + d / 2, w / 2 - 3, 2.4, .55);
  for (const side of [-1, 1]) { b.box(m.roof, x + side * w / 2, 3.56, z, .75, .16, d + .5); c.solid(x + side * w / 2, z, .6, d); }
  c.solid(x, z - d / 2, w, .6);
  for (const side of [-1, 1]) c.solid(x + side * (w / 4 + 1.5), z + d / 2, w / 2 - 3, .6);
}

function buildHangzhou(c) {
  const { b, m } = c;
  c.lake(-26, 0, 58, 46);
  c.island(-42, -1, 2.8, 46);
  c.road([[-42, -47], [-42, 47]], 3.2);
  c.island(-5, -31, 17, 3.3);
  c.bridge(15, -31, 20, 4.8, 0, 'arch');
  c.road([[25, -31], [43, -31], [43, 57]], 5);
  c.street([[37, -55], [37, 56], [86, 56]], { width: 5, trees: 'willow', spacing: 12 });
  c.street([[43, 36], [88, 36]], { width: 5, spacing: 13 });
  c.road([[-84, 53], [-42, 53], [-24, 53], [-24, 65], [5, 65], [5, 53], [37, 53]], 4);
  const leiHill = c.hill(-15, 53, 12, 11, 4);
  historicTower(c, -15, 53, { levels: 5, radius: 5, storey: 4.9, roof: m.gold, wall: m.redwood, y: leiHill(-15, 53), taper: .075 });
  b.box(m.paving, -15, GROUND + .07, 66, 17, .1, 5);
  for (const [x, z] of [[-19, 13], [-26, 20], [-12, 21]]) {
    b.cyl(m.stone, x, 1.08, z, .9, 1.1, .8, 12);
    b.sphere(m.stone, x, 2.1, z, 1.1, 1.25, 1.1);
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5;
      b.sphere(m.dark, x + Math.cos(a) * 1.02, 2.12, z + Math.sin(a) * 1.02, .24, .27, .24);
    }
    b.cyl(m.stone, x, 3.5, z, .15, 1.18, 1.35, 8);
    b.sphere(m.stone, x, 4.29, z, .2);
  }
  c.island(-21, -9, 8, 5);
  c.pavilion(-21, -9, 2.8);
  c.boat(-1, 5, { travel: 8, scale: 1.2, sail: true });
  c.boat(-62, 13, { axis: 'z', travel: 9, rotation: Math.PI / 2 });
  c.shop(53, 28, { name: '龙井茶舍', width: 9, depth: 7, kind: 'tea' });
  regularBlocks(c, [49, 60, 72, 83], [-51, -40, -14, -3], true);
  regularBlocks(c, [49, 60, 72, 83], [10, 46], false);
  regularBlocks(c, [60, 72, 83], [27], false);
  regularBlocks(c, [-69, -57, -30, -18, -6, 6, 18, 29], [-60], false);
  for (let i = 0; i < 8; i++) { c.tree(-46, -40 + i * 11, .82, 'willow'); c.tree(-38, -39 + i * 11, .78, 'willow'); }
  grove(c, 44, [-88, -64, 28, 66], (x, z) => ((x + 26) / 61) ** 2 + (z / 49) ** 2 > 1 && z > -53 && Math.abs(z - 53) > 5 && Math.hypot(x + 15, z - 53) > 15, 'broad');
  grove(c, 26, [29, -62, 91, 65], (x, z) => x < 33 || z > 61, 'willow', .8);
  for (let row = 0; row < 5; row++) for (let i = 0; i < 9; i++) b.ico(m.leaf2, -80 + i * 2.5, 1.55 + row * .08, 44 + row * 2.5, 1.25, .55, .8);
  marker(c, 'leifeng', '雷峰夕照', 'LEIFENG PAGODA', '五层八角 · 铜色重檐', '以西湖南岸雷峰塔为原型，保留五层八角、逐层收分与铜色屋檐；塔基山坡作微缩处理。', -15, 53, 33, 17, [2, 2.95, 53]);
  marker(c, 'three-pools', '三潭印月', 'THREE POOLS', '湖中三塔 · 月影相连', '三座石塔用鼓腹、圆孔、攒尖顶分别塑形，与小瀛洲意象和湖面游船相伴。', -19, 18, 5, 14, [-42, 2.95, 17]);
  marker(c, 'broken-bridge', '断桥 · 白堤', 'BAI CAUSEWAY', '石桥柳堤 · 湖山一色', '以白堤东端的石拱桥与柳堤为题，把桥、湖和慢行道编成可游览的微缩路径。', 15, -31, 5, 17, [29, 2.95, -31]);
  marker(c, 'longjing', '湖畔龙井茶舍', 'LONGJING TEA', '原创茶舍 · 可以走进', '以杭州茶文化为题的原创小店，能从门前步道走进，看茶罐、茶桌和木制柜台。', 53, 28, 7, 10, [53, 2.95, 36]);
}

function buildNantong(c) {
  const { b, m } = c;
  c.lake(1, -6, 62, 42);
  c.island(1, -6, 47, 28);
  c.street([[-42, 1], [44, 1]], { width: 5, trees: null });
  c.road([[0, -32], [0, 21], [3, 21]], 4);
  c.bridge(55, 1, 25, 5, 0, 'flat');
  c.road([[67, 1], [87, 1], [87, 51], [-43, 51], [-43, 66], [-85, 66]], 5);
  c.bridge(3, 34, 26, 5, Math.PI / 2, 'arch');
  c.road([[3, 45], [3, 51]], 5);
  // Chinese watchtower and the separate English-style clock tower behind it.
  hall(c, 15, -16, 12, 7, 4.2, { color: m.redwood });
  c.local(15, -7, 0, 1, q => {
    q.box(m.brick, 0, 8, 0, 5.8, 16, 5.4);
    for (let y = 2; y < 17; y += 4) q.box(m.white, 0, y, 0, 6.15, .33, 5.7);
    for (const side of [-1, 1]) for (const xx of [-2.65, 2.65]) q.box(m.white, xx, 8, side * 2.7, .3, 16, .22);
    for (const side of [-1, 1]) {
      const disk = new c.THREE.CircleGeometry(1.45, 24);
      q.add(disk, m.white, 0, 13.2, side * 2.74, 1, 1, 1, side < 0 ? Math.PI : 0); disk.dispose();
      q.beam(m.dark, [0, 13.2, side * 2.79], [0, 14.2, side * 2.79], .08);
      q.beam(m.dark, [0, 13.2, side * 2.8], [.78, 12.75, side * 2.8], .09);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; q.sphere(m.dark, Math.sin(a) * 1.17, 13.2 + Math.cos(a) * 1.17, side * 2.79, .07); }
      q.box(m.wood, 0, 3, side * 2.74, 1.7, 4.7, .12);
    }
    q.cyl(m.roof, 0, 18, 0, .1, 4, 4, 4);
    q.beam(m.gold, [0, 20, 0], [0, 22, 0], .07);
  });
  c.solid(15, -7, 5.8, 5.4);
  arcade(c, -21, 12, 18, 8, 8.5, true);
  hall(c, -21, -14, 17, 7, 4.8);
  for (let k = 0; k < 5; k++) c.pavilion(-23 + k * 12, -50, k === 2 ? 3.5 : 2.6, GROUND, 1);
  c.road([[-31, -50], [31, -50]], 4);
  const hillY = c.hill(-64, 51, 18, 13, 12);
  historicTower(c, -64, 51, { levels: 5, radius: 3, storey: 3.1, y: hillY(-64, 51), wall: m.wall2 });
  hall(c, -82, 34, 13, 7, 4.5);
  c.shop(27, 8, { name: '蓝印布坊', width: 9, depth: 7, kind: 'books', wall: m.wall2 });
  c.road([[38, 1], [38, 9], [33, 14], [27, 14]], 2.5);
  for (let i = 0; i < 3; i++) {
    const x = 21.2 + i * 1.6;
    b.box(m.blue, x, 2.6, 14, 1.3, 2.2, .08);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) b.sphere(m.white, x - .36 + col * .36, 1.9 + row * .44, 14.06, .06, .06, .015);
  }
  b.beam(m.wood, [20.3, 3.9, 14], [25.3, 3.9, 14], .065);
  for (const x of [20.3, 25.3]) b.beam(m.wood, [x, 1.1, 14], [x, 3.9, 14], .065);
  regularBlocks(c, [-37, -27, -17, -7, 6, 31, 40], [-24], false, x => x < -40 || (x > 7 && x < 29));
  regularBlocks(c, [-38, -28, -17, -7, 6, 30, 39], [-7], false, x => x > 6 && x < 29);
  regularBlocks(c, [-39, -7, 7], [13], false);
  regularBlocks(c, [70, 82], [-54, -42, -30, -18, 18, 32], true);
  regularBlocks(c, [-29, -17, 18, 31, 44, 58, 72, 84], [61], true);
  c.boat(-53, -7, { axis: 'z', travel: 10, rotation: Math.PI / 2, scale: 1.1 });
  c.boat(25, 28, { travel: 7 });
  grove(c, 64, [-88, -65, 88, 65], (x, z) => {
    const outer = ((x - 1) / 65) ** 2 + ((z + 6) / 45) ** 2;
    return outer > 1 && x < 64 && Math.abs(z - 51) > 7 && Math.abs(z + 50) > 6 && !(x < -43 && z > 25);
  }, 'broad');
  for (let i = 0; i < 32; i++) {
    const a = i * TAU / 32, x = 1 + Math.cos(a) * 44, z = -6 + Math.sin(a) * 25;
    if (Math.abs(z - 1) > 5 && Math.abs(x - 3) > 5) c.tree(x, z, .7, 'willow');
  }
  marker(c, 'clock', '钟楼与谯楼', 'CLOCK & WATCHTOWER', '中西并置 · 通城时刻', '方形红砖钟楼配四向表盘、层间石线，与中式重檐谯楼并置；压缩了两座建筑的间距。', 15, -9, 23, 14, [15, 2.95, 1]);
  marker(c, 'haopavilions', '濠河五亭', 'HAOHE PAVILIONS', '环城水脉 · 五亭相望', '濠河的环城水系化成一圈可辨认的碧水，北岸五座亭子以连廊步道相接。', 1, -50, 7, 28, [0, 2.95, -56]);
  marker(c, 'museum', '南通博物苑', 'NANTONG MUSEUM', '博物之城 · 园林建筑', '取博物苑中西建筑并存的特征，组成红砖展馆、传统厅堂和树庭的微缩院落。', -21, 12, 12, 16, [-21, 2.95, 1]);
  marker(c, 'wolfhill', '狼山塔影', 'LANGSHAN HILL', '江海丘陵 · 山寺相依', '以狼山上的寺塔与沿江孤丘为原型，山体、塔檐和山脚殿宇分层塑造。', -64, 51, 33, 19, [-46, 2.95, 51]);
}

function buildWuxi(c) {
  const { b, m } = c;
  c.lake(-63, 7, 28, 52);
  c.island(-48, 27, 18, 11);
  c.road([[-61, 27], [-26, 27], [10, 27]], 4);
  c.water([[17, -68], [29, -68], [29, 68], [17, 68]]);
  c.bridge(23, 20, 25, 5.2, 0, 'arch');
  c.bridge(23, 59, 25, 4, 0, 'flat');
  c.street([[10, -64], [10, 59], [86, 59]], { width: 4, trees: null });
  c.street([[37, -64], [37, 58]], { width: 5, trees: 'willow', spacing: 13 });
  c.road([[35, 20], [82, 20]], 5);
  c.pavilion(-53, 27, 3.5, GROUND, 2);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU; b.ico(m.rock, -57 + Math.cos(a) * 9, 1.5, 27 + Math.sin(a) * 6, 2.8, 1.5, 1.5, a);
  }
  c.lake(-11, -30, 12.7, 8.4);
  gardenWall(c, -11, -30, 35, 34);
  hall(c, -11, -43, 21, 5.5, 4.4);
  c.pavilion(-21, -24, 2.5);
  c.road([[-11, -13], [-11, -17], [2, -17], [2, -42]], 2.1);
  for (let i = 0; i < 14; i++) b.ico(m.rock, -21 + c.random() * 5, 1.5 + c.random() * 2, -34 + c.random() * 12, 1.1, 2 + c.random() * 2, 1.2, c.random());
  historicTower(c, 58, -35, { levels: 7, radius: 3.4, storey: 3.1, wall: m.wall2, taper: .06 });
  hall(c, 58, -21, 18, 8, 5.5);
  c.road([[58, -13], [58, 20]], 4);
  c.shop(-9, 3, { name: '惠山泥人铺', width: 9, depth: 7, kind: 'books' });
  for (let i = 0; i < 5; i++) {
    const x = -12.4 + i * .85;
    b.cyl(i % 2 ? m.red : m.blue, x, 3.03, 1.7, .15, .23, .5, 8);
    b.sphere(m.sail, x, 3.45, 1.7, .21, .23, .2);
    b.box(m.dark, x, 3.39, 1.895, .04, .04, .015);
  }
  c.road([[-30, 10], [10, 10]], 4);
  regularBlocks(c, [-26, -16, -5], [41, 53], false);
  regularBlocks(c, [-26, -16, -5], [64], false);
  regularBlocks(c, [-27, -17], [-6, 3], false);
  regularBlocks(c, [46, 57, 68, 79], [32, 45], false);
  regularBlocks(c, [47, 59, 72, 85], [-57], true);
  regularBlocks(c, [78, 88], [-42, -29, -15, 0], true);
  regularBlocks(c, [47, 70, 82], [6], false);
  c.boat(23, -7, { axis: 'z', travel: 13, rotation: Math.PI / 2 });
  c.boat(-65, -10, { axis: 'z', travel: 13, sail: true, scale: 1.1 });
  grove(c, 41, [-87, -60, -35, 64], (x, z) => ((x + 63) / 31) ** 2 + ((z - 7) / 55) ** 2 > 1 && Math.abs(z - 27) > 5, 'blossom', .9);
  for (let i = 0; i < 18; i++) { const a = i * TAU / 18; c.tree(-48 + Math.cos(a) * 13, 27 + Math.sin(a) * 8, .62, 'blossom'); }
  grove(c, 34, [-30, -64, 89, 65], (x, z) => (z < -61 || z > 63) && Math.abs(x - 23) > 10, 'broad');
  marker(c, 'jichang', '寄畅园', 'JICHANG GARDEN', '山池借景 · 曲廊叠石', '以园中的水池、叠石、厅堂和临水小亭组织空间，保留江南园林的疏密节奏。', -11, -30, 9, 21, [-11, 2.95, -11]);
  marker(c, 'qingming', '清名桥', 'QINGMING BRIDGE', '单孔石拱 · 运河人家', '以清名桥的单孔石拱轮廓连接两岸街巷，桥石、望柱、运河船与沿街屋檐均为立体几何。', 23, 20, 6, 18, [8, 2.95, 20]);
  marker(c, 'yuantouzhu', '鼋头渚', 'TURTLE HEAD ISLE', '太湖半岛 · 樱花水岸', '以鼋头渚的太湖半岛与樱花水岸为意象；临水双层亭与石岸是艺术化的景观组合。', -53, 27, 12, 20, [-30, 2.95, 27]);
  marker(c, 'nanchan', '南禅寺 · 妙光塔', 'NANCHAN TEMPLE', '古寺塔影 · 梁溪街市', '以妙光塔的多层楼阁轮廓与南禅寺的市井环境为题，让寺院与运河街道相邻。', 58, -35, 27, 18, [58, 2.95, -12]);
}

function buildChangzhou(c) {
  const { b, m } = c;
  c.water([[-92, 31], [-32, 31], [-9, 37], [29, 31], [92, 31], [92, 43], [29, 43], [-9, 49], [-32, 43], [-92, 43]]);
  c.bridge(-48, 37, 24, 5, Math.PI / 2, 'arch');
  c.bridge(43, 37, 24, 5, Math.PI / 2, 'flat');
  c.street([[-87, 23], [85, 23]], { width: 5, trees: 'willow', spacing: 12 });
  c.street([[-88, 54], [88, 54]], { width: 5, spacing: 14 });
  c.road([[-48, 23], [-48, -51], [-26, -51]], 5);
  c.road([[43, 23], [43, -50]], 5);
  historicTower(c, -25, -35, { sides: 8, levels: 13, radius: 5.8, storey: 3.4, wall: m.redwood, roof: m.gold, taper: .042 });
  hall(c, -25, -12, 23, 11, 7.3, { color: m.redwood, roof: m.gold });
  hall(c, -25, 8, 16, 7, 4.5, { color: m.redwood });
  c.road([[-25, 23], [-25, 14]], 6);
  c.lake(20, -7, 13, 9);
  hall(c, 16, -31, 18, 11, 9.2, { two: true, color: m.redwood });
  c.local(16, -18, 0, 1, q => {
    for (const x of [-5.5, -2.1, 2.1, 5.5]) q.cyl(m.stone, x, 3.2, 0, .2, .25, 6.4, 8);
    q.box(m.stone, 0, 5.5, 0, 12, .7, 1); q.box(m.stone, 0, 6.5, 0, 5.6, .8, 1);
    for (const x of [-5.5, -2.1, 2.1, 5.5]) q.sphere(m.stone, x, 6.7, 0, .3);
  });
  historicTower(c, 64, -35, { sides: 8, levels: 7, radius: 3, storey: 3.2, wall: m.wall2, roof: m.roof, taper: .065 });
  c.pavilion(66, 11, 3.4, GROUND, 2);
  c.road([[43, 11], [73, 11]], 4);
  c.shop(-66, 13, { name: '龙城糕点', width: 9, depth: 7, kind: 'food' });
  regularBlocks(c, [-82, -71, -60], [-52, -39, -25, -10], true);
  regularBlocks(c, [-83, -72, -61, -34, -20, -6, 9, 24, 57, 70, 83], [63], false);
  regularBlocks(c, [-4, 8, 20, 32, 46, 58, 70, 82], [-60], true);
  regularBlocks(c, [82], [-44, -30, -16, -1, 13], true);
  c.boat(0, 43, { axis: 'x', travel: 12, rotation: Math.PI / 2, scale: 1.1 });
  c.boat(-71, 37, { axis: 'x', travel: 8, rotation: Math.PI / 2 });
  grove(c, 52, [-6, -51, 37, 17], (x, z) => Math.hypot((x - 20) / 1.3, z + 7) > 13 && Math.hypot(x - 16, z + 31) > 14 && z < 16, 'blossom');
  grove(c, 34, [-89, -64, 90, 66], (x, z) => x < -87 || x > 89 || z < -63, 'broad');
  marker(c, 'tianning', '天宁宝塔', 'TIANNING PAGODA', '十三层八角 · 龙城塔冠', '依十三层、八角重檐和金色塔刹塑形，塔前以寺殿轴线与开阔步道构成前景。', -25, -35, 49, 23, [-25, 2.95, 20]);
  marker(c, 'hongmei', '红梅阁', 'HONGMEI PAVILION', '双层重檐 · 红梅春晓', '以红梅阁的两层、重檐、前方石坊为主要特征，周围配以梅林和园池。', 16, -31, 14, 17, [36, 2.95, -30]);
  marker(c, 'wenbi', '文笔塔', 'WENBI PAGODA', '七级八面 · 如笔临空', '与天宁宝塔形成高低对景，文笔塔保留七层八面与逐层收分的细长轮廓。', 64, -35, 28, 15, [43, 2.95, -35]);
  marker(c, 'dongpo', '东坡园意', 'DONGPO GARDEN', '古运河畔 · 舣舟亭意象', '以常州东坡园的水岸亭阁为原型，设置双层亭、柳岸步道和流动的运河舟影。', 66, 11, 12, 14, [60, 2.95, 23]);
}

function buildNingbo(c) {
  const { b, m } = c;
  c.water([[-92, -39], [-10, -17], [1, -9], [15, -21], [92, -45], [92, -28], [26, -4], [9, 11], [10, 68], [-7, 68], [-8, 12], [-22, -1], [-92, -22]]);
  c.bridge(1, 37, 26, 5.4, 0, 'flat');
  c.street([[-30, 61], [-30, 0], [-83, -14]], { width: 5, spacing: 14 });
  c.street([[23, 61], [23, 15], [83, -9]], { width: 5, spacing: 13 });
  c.road([[-14, 37], [-30, 37]], 5); c.road([[14, 37], [23, 37]], 5);
  c.street([[-46, -53], [-6, -53], [-6, -30], [20, -30], [20, -54], [67, -54]], { width: 4, spacing: 14 });
  // Tianyi library: long two-storey timber facade, courtyard water and rockery.
  hall(c, -55, 17, 23, 9, 8, { two: true, color: m.wall });
  c.lake(-55, 33, 11, 5.6);
  gardenWall(c, -55, 25, 33, 35);
  c.road([[-55, 44], [-55, 48], [-30, 48]], 3);
  for (let k = 0; k < 10; k++) b.ico(m.rock, -69 + c.random() * 6, 2, 28 + c.random() * 10, 1.7, 2.5 + c.random(), 1.3);
  // Old Bund church landmark: nave, pitched roof, rose window, pointed tower.
  c.local(7, -48, 0, 1, q => {
    const cream = c.material('ningbo-church-sandstone', '#c8b49a');
    q.box(cream, 0, 5, 0, 14, 10, 18);
    const roofGeo = new c.THREE.CylinderGeometry(0, 10, 5, 4);
    q.add(roofGeo, m.roof, 0, 12, 0, 1, 1, 1.5, Math.PI / 4); roofGeo.dispose();
    q.box(cream, 0, 12, 9.8, 5.4, 24, 5.4);
    for (const yy of [7, 15, 21]) q.box(m.white, 0, yy, 9.8, 5.8, .45, 5.8);
    q.cyl(m.roof, 0, 29, 9.8, 0, 4.3, 11, 4);
    q.beam(m.gold, [0, 34.5, 9.8], [0, 36.5, 9.8], .09);
    q.beam(m.gold, [-.65, 35.8, 9.8], [.65, 35.8, 9.8], .09);
    for (const x of [-4.8, 4.8]) for (let z = -6; z <= 6; z += 6) {
      q.box(m.window, x * 1.47, 5, z, .08, 5.2, 1.55);
      q.box(m.white, x * 1.47, 8.4, z, .22, .25, 2.1);
    }
    for (const xx of [-1.5, 0, 1.5]) q.box(m.window, xx, 18, 12.57, .75, 3, .1);
    q.box(m.wood, 0, 2.7, 12.55, 2.6, 5.4, .1);
  });
  c.solid(7, -48, 14, 25);
  for (const [x, z, w] of [[-31, -34, 13], [-15, -38, 12], [28, -42, 13], [43, -45, 12], [60, -44, 13]]) arcade(c, x, z, w, 7, 7.6, x < 0);
  historicTower(c, 48, 27, { sides: 6, levels: 7, radius: 3.5, storey: 3.6, wall: m.redwood, roof: m.roof, taper: .065 });
  c.shop(44, 48, { name: '明州汤圆铺', width: 9, depth: 7, kind: 'food' });
  c.road([[23, 56], [68, 56]], 4);
  regularBlocks(c, [-82, -70, -57, -44, -31, -18, 30, 44, 57, 71, 84], [-61], true);
  regularBlocks(c, [-84], [-5, 8, 23, 39, 55], false);
  regularBlocks(c, [-71, -59, -45], [58], false);
  regularBlocks(c, [70, 82], [6, 19, 33, 47, 60], true);
  regularBlocks(c, [-45], [3], false);
  c.boat(1, 20, { axis: 'z', travel: 9, rotation: Math.PI / 2 });
  c.boat(49, -23, { axis: 'x', travel: 9, rotation: Math.PI / 2, scale: 1.15 });
  grove(c, 46, [-88, -65, 90, 65], (x, z) => (z < -64 || z > 62 || (x < -88 && z > -16)), 'broad');
  grove(c, 30, [-75, 1, -36, 50], (x, z) => x < -73 || (z > 46 && Math.abs(z - 48) > 2) || z < 3, 'broad', .85);
  marker(c, 'tianyi', '天一阁', 'TIANYI LIBRARY', '藏书楼 · 明州文脉', '以两层藏书楼、木格窗、庭园水池和叠石为主要形体，细部按艺术化尺度组织。', -55, 17, 13, 22, [-55, 2.95, 46]);
  marker(c, 'oldbund', '老外滩', 'THE OLD BUND', '三江交汇 · 近代街廓', '借江北天主堂的尖塔轮廓和老外滩中西街廓为题，配置山墙、钟塔、券窗与沿岸街道。', 7, -48, 38, 24, [-4, 2.95, -29]);
  marker(c, 'tianfeng', '天封塔', 'TIANFENG PAGODA', '六角七层 · 甬城塔影', '表现天封塔六角形、可见七层的楼阁轮廓，深色檐口与红色塔身形成清晰对比。', 48, 27, 31, 18, [48, 2.95, 39]);
  marker(c, 'sanjiang', '三江口', 'THREE RIVER CONFLUENCE', '甬江 · 姚江 · 奉化江', '用一体化的分汊水面呈现三江交汇，桥梁、游船和两岸步行道组成宁波的水城骨架。', 1, 0, 3, 24, [23, 2.95, 17]);
}

function buildWenzhou(c) {
  const { b, m } = c;
  c.water([[-92, -63], [92, -63], [92, 2], [-92, 2]]);
  c.island(-10, -29, 54, 22);
  c.street([[-87, 11], [86, 11]], { width: 6, trees: 'broad', spacing: 13 });
  c.street([[-79, 44], [83, 44]], { width: 6, spacing: 15 });
  c.road([[0, 11], [0, 65]], 5);
  c.road([[-55, -24], [-52, -20], [-27, -21], [-23, -25], [6, -25], [10, -24], [14, -21], [17, -22], [17, -35], [31, -35], [38, -29]], 3.5);
  // The twin pagodas deliberately have different structures.
  historicTower(c, -44, -30, { sides: 6, levels: 7, radius: 3, storey: 3.6, wall: m.brick, roof: m.roof, taper: .054 });
  historicTower(c, 24, -29, { sides: 6, levels: 7, radius: 3.7, storey: 3.2, wall: m.brick, bare: true, balcony: false, taper: .045 });
  c.tree(24, -29, .9, 'broad', GROUND + 23.4);
  for (let k = 0; k < 6; k++) b.beam(m.bark, [24 + (k - 2.5) * .32, 24, -28.6], [24 + (k - 2.5) * .2, 18 + k * .3, -28.7], .055);
  hall(c, -9, -34, 22, 10, 6, { roof: m.gold, color: m.wall2 });
  hall(c, -9, -15, 14, 6, 4.4, { roof: m.gold, color: m.wall2 });
  arcade(c, 26, -14, 14, 7, 7.3, true);
  c.road([[-9, -8], [-9, -11]], 5);
  // Ferry wharves are landings, not a fictional road bridge to the island.
  b.box(m.wood, -9, 1.3, -5, 8, .5, 8); b.box(m.wood, -9, 1.3, 5, 8, .5, 7);
  c.boat(-9, -.1, { travel: 0, scale: 1.25 });
  c.boat(61, -29, { axis: 'z', travel: 12, rotation: Math.PI / 2, scale: 1.3 });
  c.boat(-68, -35, { axis: 'z', travel: 8, rotation: Math.PI / 2 });
  // Compact Wuma street with narrow republican-era facades.
  for (let i = 0; i < 6; i++) arcade(c, -67 + i * 12, 30, 9.4, 7, 7.2 + (i % 2), i % 3 === 0);
  for (let i = 0; i < 5; i++) arcade(c, -66 + i * 12, 56, 9.4, 7, 7.2 + (i % 2), i % 3 === 1);
  c.shop(18, 34, { name: '瓯江鱼丸铺', width: 9, depth: 7, kind: 'food', wall: m.wall2 });
  regularBlocks(c, [38, 50, 62, 76, 87], [25, 59], true);
  regularBlocks(c, [-86], [23, 36, 56], true);
  regularBlocks(c, [-74, -62, -50, -37, -24, 10, 23, 36, 49, 63, 78, 89], [-68], true);
  grove(c, 47, [-62, -49, 41, -10], (x, z) => ((x + 10) / 51) ** 2 + ((z + 29) / 20) ** 2 < 1 && Math.abs(z + 29) > 5 && Math.hypot(x + 9, z + 34) > 16 && Math.hypot(x - 26, z + 14) > 10 && Math.hypot(x + 44, z + 30) > 7 && Math.hypot(x - 24, z + 29) > 7, 'broad', .85);
  grove(c, 32, [-90, 15, 90, 66], (x, z) => z > 64 || (x > 88 && z > 16) || (x < -88 && z > 16), 'broad');
  marker(c, 'easttower', '江心东塔', 'EAST PAGODA', '六面七层 · 塔树共生', '东塔以裸露砖身、无檐塔顶和顶端榕树塑造，与西塔完整的层檐形成鲜明区别。', 24, -29, 31, 15, [13, 2.95, -29]);
  marker(c, 'westtower', '江心西塔', 'WEST PAGODA', '古航标 · 六角重檐', '西塔保留六角七层与檐廊的识别特征；双塔分立岛屿两端，映照瓯江。', -44, -30, 31, 16, [-33, 2.95, -29]);
  marker(c, 'jiangxin', '江心寺', 'JIANGXIN TEMPLE', '瓯江孤屿 · 寺院中轴', '以江心屿中央寺院为原型，前殿、主殿与树庭沿轴线排列，可在岛上环游。', -9, -34, 11, 20, [-9, 2.95, -24]);
  marker(c, 'wuma', '五马街意象', 'WUMA STREET', '骑楼街廓 · 瓯味小店', '以五马街和旧城的近代建筑街面为题，窄面宽店屋、连续檐口与原创鱼丸店形成慢行街区。', -30, 43, 11, 27, [-30, 2.95, 44]);
}

export const cities = {
  hangzhou: { name: '杭州', en: 'HANGZHOU', subtitle: '一湖烟柳 · 半城诗意', intro: '沿白堤看湖光，在雷峰塔下等晚照。把西湖的水、柳、石塔与龙井茶香收进一座可漫游的小城。', stamp: '杭', coordinates: '30.2741° N · 120.1551° E', region: '江南', palette: { water: '#70b5ad', grass: '#a4b98d', roof: '#465f58' }, build: buildHangzhou },
  nantong: { name: '南通', en: 'NANTONG', subtitle: '濠河一弯 · 江海相逢', intro: '碧水绕城，钟楼与谯楼隔着时间相望。从濠河五亭走向博物苑，再看狼山塔影。', stamp: '通', coordinates: '31.9800° N · 120.8943° E', region: '江海', palette: { water: '#71aeb0', grass: '#a5b28c', roof: '#53615c' }, build: buildNantong },
  wuxi: { name: '无锡', en: 'WUXI', subtitle: '太湖樱岸 · 梁溪橹声', intro: '寄畅园的山池、清名桥的石拱和太湖樱花共处一方微缩天地。沿古运河走进有灯火的小街。', stamp: '锡', coordinates: '31.4900° N · 120.3124° E', region: '江南', palette: { water: '#6dada4', grass: '#a9b58b', roof: '#505f5b' }, build: buildWuxi },
  changzhou: { name: '常州', en: 'CHANGZHOU', subtitle: '天宁金顶 · 运河梅影', intro: '十三层宝塔立于龙城天际，红梅与文笔塔在园中相映。沿古运河走过街巷与糕点铺。', stamp: '常', coordinates: '31.8112° N · 119.9741° E', region: '江南', palette: { water: '#75aead', grass: '#a3b086', roof: '#55584e' }, build: buildChangzhou },
  ningbo: { name: '宁波', en: 'NINGBO', subtitle: '三江潮起 · 一阁书香', intro: '三江口展开水城骨架，老外滩尖塔与天封塔隔岸相望。在天一阁的书窗与庭院间停一停。', stamp: '甬', coordinates: '29.8683° N · 121.5440° E', region: '东海', palette: { water: '#72aab3', grass: '#a6b397', roof: '#4b5d62' }, build: buildNingbo },
  wenzhou: { name: '温州', en: 'WENZHOU', subtitle: '瓯江双塔 · 岛上诗声', intro: '江心屿双塔立在瓯江水心，一座重檐，一座古树生于塔顶。回到五马街意象街区，走进一间鱼丸小铺。', stamp: '瓯', coordinates: '27.9943° N · 120.6994° E', region: '浙南', palette: { water: '#72aeb4', grass: '#a3b894', roof: '#526163' }, build: buildWenzhou },
};
