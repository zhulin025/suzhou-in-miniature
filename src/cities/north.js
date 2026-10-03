import { roof } from '../geometry.js';

// All dimensions are composition units. These are researched, artistic miniatures,
// not survey models. Historic interiors are deliberately not reconstructed.
const TAU = Math.PI * 2;

function ring(ctx, b, mat, x, y, z, radius, tube = .14, segments = 48) {
  const g = new ctx.THREE.TorusGeometry(radius, tube, 5, segments);
  b.add(g, mat, x, y, z, 1, 1, 1, 0, Math.PI / 2);
  g.dispose();
}

function lathe(ctx, b, mat, points, x = 0, y = 0, z = 0, segments = 48) {
  const g = new ctx.THREE.LatheGeometry(points.map(p => new ctx.THREE.Vector2(...p)), segments);
  b.add(g, mat, x, y, z);
  g.dispose();
}

function roundRoof(ctx, b, mat, r, y, h, z = 0, sides = 48) {
  lathe(ctx, b, mat, [[0, 0], [r, 0], [r * .98, .23], [r * .72, h * .43], [r * .32, h * .83], [0, h]], 0, y, z, sides);
  ring(ctx, b, mat, 0, y + .1, z, r, .12, sides);
  for (let i = 0; i < sides; i++) {
    const a = i * TAU / sides;
    const p = (rr, yy) => [Math.cos(a) * rr, yy, z + Math.sin(a) * rr];
    b.beam(mat, p(r, y + .14), p(r * .72, y + h * .43), .045, 4);
    b.beam(mat, p(r * .72, y + h * .43), p(r * .32, y + h * .83), .045, 4);
  }
}

function hall(ctx, b, m, { w = 22, d = 12, h = 6, y = 0, z = 0, roofMat = m.roof, wall = m.redwood, double = false } = {}) {
  b.box(m.stone, 0, y + .6, z, w + 3, 1.2, d + 3);
  b.box(wall, 0, y + h / 2 + 1, z - 1, w - 1.4, h, d - 2);
  const palette = { ...m, roof: roofMat, tile: roofMat, ridge: roofMat };
  roof(b, palette, 0, y + h + 1, z, w + 4, d + 4, h * .45, 0, true);
  if (double) roof(b, palette, 0, y + h + 3.5, z, w + .7, d + 1.4, h * .46, 0, true);
  for (let i = -5; i <= 5; i++) {
    const x = i * (w - 2) / 10;
    b.cyl(m.redwood, x, y + 1 + h / 2, z + d / 2, .22, .25, h, 8);
    b.box(m.gold, x, y + h + .72, z + d / 2, .8, .36, 1.1);
    b.box(m.window, x, y + h * .55 + 1, z + d / 2 - 1.92, 1.1, h * .55, .08);
    b.box(m.wood, x, y + 1.8, z + d / 2 - 1.83, 1.15, .13, .1);
  }
  for (const x of [-w * .57, w * .57]) b.cyl(m.gold, x, y + 1.65, z + d * .6, .6, .45, .85, 10);
}

function gateArch(ctx, b, m, w, h, d, opening = 3.1) {
  const shape = new ctx.THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(-opening, 0); shape.lineTo(-opening, h * .34);
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI - Math.PI * i / 20;
    shape.lineTo(opening * Math.cos(a), h * .34 + opening * Math.sin(a));
  }
  shape.lineTo(opening, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, h); shape.lineTo(-w / 2, h); shape.closePath();
  const g = new ctx.THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, steps: 1, curveSegments: 12 });
  b.add(g, m.brick, 0, 0, -d / 2); g.dispose();
  for (let x = -w / 2 + .7; x < w / 2; x += 1.65) b.box(m.brick, x, h + .55, 0, 1, 1.1, d);
  for (let yy = 1; yy < h; yy += .75) {
    for (const sign of [-1, 1]) b.box(m.stone, sign * (w / 4 + opening / 2), yy, d / 2 + .025, w / 2 - opening, .045, .04);
  }
}

function villa(ctx, x, z, { w = 7, d = 6, h = 5, color = '#e6c99c', turret = false, roofColor = '#ac5945', rotation = 0 } = {}) {
  const wall = ctx.material(`villa-${color}`, color), terracotta = ctx.material(`roof-${roofColor}`, roofColor);
  ctx.local(x, z, rotation, 1, (b, m) => {
    b.box(m.stone, 0, .25, 0, w + .5, .5, d + .5);
    b.box(wall, 0, h / 2, 0, w, h, d);
    const tri = new ctx.THREE.Shape(); tri.moveTo(-w / 2 - .4, 0); tri.lineTo(0, 2.2); tri.lineTo(w / 2 + .4, 0); tri.closePath();
    const geo = new ctx.THREE.ExtrudeGeometry(tri, { depth: d + .8, bevelEnabled: false });
    b.add(geo, terracotta, 0, h, -d / 2 - .4); geo.dispose();
    for (let y = 1.5; y < h; y += 2.1) for (const xx of [-w * .29, w * .29]) {
      b.box(m.white, xx, y, d / 2 + .04, 1.3, 1.55, .1);
      b.box(m.window, xx, y, d / 2 + .11, 1.03, 1.26, .1);
      b.box(m.white, xx, y, d / 2 + .18, .07, 1.4, .08);
      b.box(m.white, xx, y, d / 2 + .18, 1.1, .07, .08);
    }
    b.box(m.wood, 0, 1.25, d / 2 + .05, 1.1, 2.5, .12);
    b.box(m.white, 0, h * .55, d / 2 + .07, w + .12, .16, .18);
    b.box(m.brick, -w * .25, h + 1.8, -d * .17, .85, 2.9, .8);
    if (turret) {
      b.cyl(wall, w * .43, h * .62, d * .25, 1.35, 1.35, h * 1.24, 8);
      b.cyl(terracotta, w * .43, h * 1.24 + 1.5, d * .25, 0, 1.9, 3, 8);
      b.cyl(m.gold, w * .43, h * 1.24 + 3.2, d * .25, .06, .1, .7, 6);
    }
  });
  ctx.solid(x, z, Math.max(w, d) + .6, Math.max(w, d) + .6);
}

function treeRows(ctx, rows, type = 'broad') {
  for (const [x1, z1, x2, z2, count] of rows) for (let i = 0; i < count; i++) {
    const t = count === 1 ? .5 : i / (count - 1);
    ctx.tree(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, .65 + ctx.random() * .25, type);
  }
}

function mark(ctx, id, name, en, tag, desc, x, z, height, radius, walk) {
  ctx.landmark({ id, name, en, tag, desc, x, z, height, radius, walk });
}

function buildNanjing(c) {
  const { m } = c, blue = c.material('nanjing-blue', '#325e79'), ochre = c.material('nanjing-glaze', '#b58c45');
  c.water([[-92,20],[-30,20],[5,21],[45,19],[92,22],[92,34],[45,31],[5,34],[-30,32],[-92,34]]);
  c.street([[-89,13],[89,13]], { width: 4.3, trees: 'willow', spacing: 11 });
  c.street([[-89,39],[89,39]], { width: 4.3, trees: 'willow', spacing: 11 });
  c.street([[15,-55],[15,0],[0,0],[0,16]], { width: 5, trees: 'broad', spacing: 13 });
  c.road([[0,37],[0,68]], 5); c.bridge(0,27,23,5,Math.PI / 2);
  c.bridge(-72,27,22,4,Math.PI / 2); c.boat(33,26,{travel:18,scale:.9,axis:'x',rotation:Math.PI/2}); c.boat(-35,26,{travel:17,scale:.8,axis:'x',rotation:Math.PI/2});
  // Four successive gateways and three open barbicans, the defining Zhonghua form.
  c.local(-58,-24,0,1,(b,mm) => {
    for (let i = 0; i < 4; i++) {
      const zz = -17 + i * 11;
      c.local(-58, -24 + zz, 0, 1, (bb,mmm) => gateArch(c,bb,mmm,29,i === 3 ? 10 : 7.3,3.2));
    }
    for (const side of [-1,1]) {
      b.box(mm.brick,side*14,3.5,0,2.6,7,36);
      for(let zz=-17;zz<=17;zz+=2) b.box(mm.brick,side*14,7.65,zz,2.6,1.3,1.15);
    }
  });
  for (const x of [-72,-44]) c.solid(x,-24,3,38);
  for (const z of [-41,-30,-19,-8]) { c.solid(-67,z,11,3.2); c.solid(-49,z,11,3.2); }
  c.road([[-58,-50],[-58,13]],4.7);
  mark(c,'zhonghua','中华门瓮城','ZHONGHUA GATE','四重城门','四道券门贯穿三道瓮城，厚城砖与垛口构成南京城墙的轮廓。可沿中央通道穿行。',-58,-24,13,26,[-58,2.95,8]);
  c.local(-8,-24,0,1,(b,mm) => {
    hall(c,b,mm,{w:25,d:12,h:6,roofMat:ochre});
    for(const x of [-17,17]) { b.box(mm.wall,x,2,3,1,4,22); roof(b,mm,x,4,3,2,23,.65,0,false); }
    b.box(mm.redwood,0,2.9,14,16,.9,.9);
    for(const x of [-8,0,8]) b.cyl(mm.stone,x,2.2,14,.32,.36,4.4,8);
    roof(b,{...mm,roof:ochre},0,4,14,20,3,1.5,0,true);
  });
  c.solid(-8,-24,26,13); c.solid(-25,-21,1.2,22); c.solid(9,-21,1.2,22); c.road([[-8,-10],[-8,13]],4);
  c.local(-8,35.2,0,1,(b,mm)=> { b.box(mm.redwood,0,2.8,0,29,5.6,.9); roof(b,{...mm,roof:ochre},0,5.6,0,31,2,1.2,0,true); });
  c.solid(-8,35.2,30,1.2);
  mark(c,'fuzimiao','夫子庙 · 秦淮','QINHUAI RIVER','灯影秦淮','黄色屋瓦、庙前照壁与秦淮画舫组成压缩的河岸街景；位置与尺度经过艺术化编排。',-8,-24,13,22,[-8,2.95,10]);
  c.local(53,-33,0,1,(b,mm) => {
    for(let i=0;i<22;i++) b.box(mm.white,0,.16+i*.15,16-i*.95,10,.32+i*.3,.96);
    b.box(mm.stone,0,3.9,-12,24,7.8,20);
    hall(c,b,mm,{w:21,d:12,h:6,y:7.8,z:-12,roofMat:blue,wall:mm.white,double:false});
    for(const x of [-6.6,0,6.6]) {
      b.box(mm.dark,x,11.3,-5.94,2.4,5,.15);
      b.box(mm.white,x,14,-5.8,3.2,.45,.4);
    }
    for(const side of [-1,1]) for(let i=0;i<11;i++) b.cyl(mm.white,side*6, .7+i*.3,16-i*1.9,.12,.15,1,8);
    for(const x of [-8,0,8]) b.cyl(mm.white,x,2.8,22,.45,.48,5.6,8);
    b.box(mm.white,0,5.45,22,21,.7,1.3); roof(b,{...mm,roof:blue},0,5.75,22,23,3.6,1.4,0,true);
  });
  c.solid(53,-45,27,22);
  mark(c,'zhongshan','中山陵祭堂','SUN YAT-SEN MAUSOLEUM','蓝瓦长阶','依照中山陵的蓝色琉璃瓦、浅色祭堂与中轴台阶重构外观；长阶采用微缩表达。',53,-41,21,25,[53,2.95,-6]);
  for(const z of [49,62]) for(let x=-84;x<=84;x+=14) if(Math.abs(x)>6) c.house(x,z,8.6,6.7,3.5+ c.random()*1.2,0,{lantern:true,detail:false});
  for(let x=-84;x<=25;x+=12) c.house(x,-60,7.8,6,4,0,{detail:false});
  for(const z of [-42,-27,-12]) c.house(-86,z,7,7,4,Math.PI/2,{detail:false});
  for(const x of [25,37,73,85]) c.house(x,-5,7,6,4,0,{detail:false});
  c.shop(24,0,{name:'秦淮书舍',kind:'books',width:9,depth:7});
  treeRows(c,[[-91,-60,-91,4,11],[30,-61,86,-61,10],[35,-50,35,-17,7],[72,-51,72,-17,7],[-32,-51,-32,0,9],[-88,69,88,69,20]],'broad');
}

function buildBeijing(c) {
  const blue=c.material('heaven-blue','#284f80'), gold=c.material('palace-roof','#d4a63e');
  c.lake(-62,-42,24,20); c.island(-62,-42,10,9);
  c.bridge(-62,-23,24,4.2,Math.PI/2); c.road([[-62,-9],[-62,3]],4.5);
  c.local(-62,-42,0,1,(b,m)=> {
    for(let i=0;i<3;i++) b.box(m.white,0,.45+i*.8,0,12-i*1.2,.8,11-i*1.2);
    lathe(c,b,m.white,[[0,0],[4.7,0],[5.4,2],[4.8,5],[3.7,8],[2.3,10],[1.8,11],[0,11]],0,2.5,0,40);
    for(let i=0;i<12;i++) b.cyl(m.white,0,14+i*.48,0,1.75-i*.075,1.9-i*.075,.3,32);
    b.cyl(m.gold,0,20.2,0,2.1,1.6,.5,32); b.cyl(m.gold,0,21.3,0,.08,.5,1.8,12);
    b.box(m.redwood,0,9,4.58,1.7,2.5,.15); b.box(m.gold,0,9,4.69,.85,1.4,.06);
  }); c.solid(-62,-42,11,11);
  mark(c,'beihai','北海白塔','BEIHAI WHITE DAGOBA','琼华白塔','白色覆钵塔身、相轮与金色塔刹立于湖中小岛；北海水岸采用微缩重组。',-62,-42,24,24,[-62,2.95,-11]);
  c.local(-50,23,0,1,(b,m)=> {
    for(let i=0;i<3;i++) { const r=15-i*1.6; b.cyl(m.white,0,.4+i*.65,0,r,r,.8,64); ring(c,b,m.white,0,1+i*.65,0,r-.35,.15);
      for(let j=0;j<40;j++) {const a=j*TAU/40; if(Math.abs(Math.cos(a))>.96) continue; b.cyl(m.white,Math.cos(a)*(r-.5),1.4+i*.65,Math.sin(a)*(r-.5),.09,.13,.7,6); }
    }
    b.cyl(m.redwood,0,5.4,0,8.2,8.2,6.7,48);
    for(let i=0;i<24;i++){const a=i*TAU/24; b.cyl(m.redwood,Math.cos(a)*8.4,5.7,Math.sin(a)*8.4,.2,.23,7.2,8);}
    for(let i=0;i<3;i++) {
      const y=8.5+i*3.8, r=11-i*2.15;
      if(i) b.cyl(m.redwood,0,y-1.15,0,r*.78,r*.78,2.5,48);
      roundRoof(c,b,blue,r,y,3.7,0,64); ring(c,b,m.gold,0,y+.12,0,r,.09);
    }
    b.cyl(m.gold,0,21.1,0,.07,.45,1.6,12); b.sphere(m.gold,0,21.9,0,.4);
    for(let i=0;i<7;i++) b.box(m.white,0,.1+i*.14,16-i*.48,4,.2+i*.28,.55);
  }); c.solid(-50,23,18,18);
  mark(c,'tiantan','天坛 · 祈年殿','TEMPLE OF HEAVEN','三重蓝檐','三层白石台基、红柱与三重蓝色圆攒尖顶；屋瓦、圆环与柱列均为实体几何。',-50,23,25,23,[-50,2.95,43]);
  c.local(8,-35,0,1,(b,m)=> {
    for(let i=0;i<3;i++) b.box(m.white,0,.5+i*.8,0,34-i*2,1,23-i*2);
    hall(c,b,m,{w:29,d:14,h:6,y:2.4,roofMat:gold,double:true});
    for(const side of [-1,1]) {
      b.box(m.redwood,side*25,2,8,1.3,4,40);
      roof(b,{...m,roof:gold},side*25,4,8,3,42,1,0,false);
      b.box(m.redwood,side*25,3.5,-11,7,7,8);
      roof(b,{...m,roof:gold},side*25,7,-11,9,10,2,0,true);
    }
    for(const [left,right] of [[-25,-9.5],[-6.5,-1.5],[1.5,6.5],[9.5,25]]) b.box(m.redwood,(left+right)/2,2.5,26,right-left,5,2.5);
    b.box(m.redwood,0,4.7,26,50,.6,2.5);
    roof(b,{...m,roof:gold},0,5,26,53,5,2,0,true);
    for(let i=0;i<8;i++) b.box(m.white,0,.15+i*.16,15-i*.6,6,.3+i*.32,.65);
  }); c.solid(8,-35,34,23);
  for(const [left,right] of [[-25,-9.5],[-6.5,-1.5],[1.5,6.5],[9.5,25]]) c.solid(8+(left+right)/2,-9,right-left,3);
  for(const x of [-17,33]) c.solid(x,-27,2,40);
  mark(c,'palace','故宫 · 太和殿','THE FORBIDDEN CITY','朱墙金瓦','突出太和殿的重檐庑殿顶、白石三层基座及红色院墙。院落为压缩布局，不代表完整宫城。',8,-35,20,31,[8,2.95,-14]);
  c.street([[-88,-2],[88,-2]],{width:5,trees:'broad',spacing:14});
  c.street([[0,3],[0,66]],{width:6,trees:'broad',spacing:11});
  c.street([[44,-64],[44,64]],{width:5,trees:'broad',spacing:13});
  c.road([[-76,47],[-25,47],[0,48],[86,48]],5);
  c.local(12,21,0,1,(b,m)=> {
    gateArch(c,b,m,17,7,11,2.8);
    hall(c,b,m,{w:16,d:10,h:5,y:7,roofMat:m.roof,double:true});
    for(const xx of [-6,-3,0,3,6]) b.box(m.dark,xx,10.6,5.08,1.5,2.6,.1);
  }); c.solid(5.9,21,5,11); c.solid(18.1,21,5,11);
  mark(c,'gulou','鼓楼街景','DRUM TOWER & HUTONG','京城里巷','高台、红色楼身与灰瓦重檐压住街道轴线；周围四合院与店铺是原创街巷组合。',12,21,20,18,[12,2.95,37]);
  // Twelve compact three-wing courtyards: 36 contextual residential buildings.
  for(const x of [59,79]) for(const z of [-54,-34,-14,10,31,56]) {
    c.house(x,z-4,10,4,3.2,0,{detail:false,wall:c.m.brick});
    c.house(x-5,z+1,3.6,7,3,0,{detail:false,wall:c.m.brick});
    c.house(x+5,z+1,3.6,7,3,0,{detail:false,wall:c.m.brick});
  }
  for(const x of [-28,-13,4,21]) c.house(x,-62,10,5,3.3,0,{detail:false,wall:c.m.redwood});
  c.shop(24,54,{name:'胡同小茶馆',kind:'tea',width:10,depth:8,wall:c.m.brick});
  treeRows(c,[[-88,-62,-88,59,18],[-83,59,-11,59,13],[-30,7,-30,39,6],[-76,4,-76,37,6],[-31,-62,-31,-14,8],[-48,-64,-78,-64,6],[37,59,37,9,8]],'pine');
}

function buildDatong(c) {
  const sandstone=c.material('datong-sandstone','#b99770'), darkSand=c.material('datong-cave','#6d5844'), statue=c.material('datong-buddha','#d1ad80');
  c.local(-46,-46,0,1,(b,m)=> {
    // Cliff is built around the niches: no opaque wall through the open main cave.
    b.box(sandstone,0,12,-6,68,24,8);
    for(const [xx,ww,hh] of [[-30,10,21],[-17,10,25],[17,10,23],[30,10,19]]) b.box(sandstone,xx,hh/2,1,ww,hh,11);
    b.box(sandstone,0,22,0,23,6,14);
    b.box(darkSand,0,10,-1.85,23,20,.3);
    for(let i=0;i<11;i++) b.box(darkSand,0,2+i*1.8,-1.59,64,.085,.08);
    b.cyl(statue,0,2.2,5,6.5,7.2,2.3,24);
    b.sphere(statue,0,7.4,4.6,4.8,5.5,2.7); b.sphere(statue,0,14.5,4.7,2.4,3.1,2.1);
    b.sphere(darkSand,0,16.7,4.3,2.35,1.1,1.85); b.sphere(statue,0,17.65,4.4,.7,.55,.7);
    b.sphere(statue,-5,3.8,6.9,3.6,1.45,2); b.sphere(statue,5,3.8,6.9,3.6,1.45,2);
    b.beam(statue,[-4,10,4.6],[-4.8,6,7.3],1,10); b.beam(statue,[4,10,4.6],[4.8,6,7.3],1,10);
    b.sphere(statue,-4.8,5.8,7.4,1.05,.7,1); b.sphere(statue,4.8,5.8,7.4,1.05,.7,1);
    b.sphere(statue,0,14.4,6.73,.38,.65,.45); b.beam(darkSand,[-1.6,15.2,6.25],[-.55,15.05,6.66],.09,5); b.beam(darkSand,[.55,15.05,6.66],[1.6,15.2,6.25],.09,5);
    b.beam(darkSand,[-.6,13.4,6.62],[.6,13.4,6.62],.075,5);
    for(let i=0;i<6;i++) {
      const y=6+i*.65; b.beam(darkSand,[-3.2,y+1,7.05],[3.1,y,7.05],.065,5);
    }
    for(const xx of [-26,26]) {
      b.box(darkSand,xx,5.6,6.58,4,9,.12);
      b.sphere(statue,xx,3.9,6.9,1.25,2, .8); b.sphere(statue,xx,6.4,7, .72,.95,.7);
    }
    for(let i=0;i<12;i++) b.ico(sandstone,-32+i*5.8,23+Math.sin(i*1.3)*2,-4,4.2,2.5,5,.2*i);
  }); c.solid(-46,-50,69,18); c.solid(-46,-39,16,10);
  mark(c,'yungang','云冈石窟意象','YUNGANG GROTTOES','崖壁佛影','崖壁龛口与坐佛以实体雕塑重构；这是石窟艺术意象，不对应具体洞窟的精密复原。',-46,-46,29,32,[-46,2.95,-25]);
  c.local(45,-36,0,1,(b,m)=> {
    hall(c,b,m,{w:32,d:19,h:7,roofMat:m.roof,wall:m.redwood});
    for(let i=-4;i<=4;i++) for(const zz of [-9.8,9.8]) {
      b.box(m.gold,i*3.5,7.6,zz,1.7,.22,1.6);
      b.box(m.wood,i*3.5,8.1,zz,2.2,.2,2.1);
    }
    for(const side of [-1,1]) { b.box(m.redwood,side*21,2,7,1,4,29); roof(b,m,side*21,4,7,3,30,1,0,false); }
  }); c.solid(45,-36,34,22);
  mark(c,'huayan','华严寺大殿','HUAYAN TEMPLE','辽金木构','宽阔单檐大屋顶、红柱与层叠斗栱强调辽金大殿的舒展体量；庭院经微缩编排。',45,-36,15,28,[45,2.95,-15]);
  const glaze=[c.material('dragon-gold','#d5a741'),c.material('dragon-green','#729379'),c.material('dragon-blue','#366d86')];
  c.local(31,16,0,1,(b,m)=> {
    b.box(m.stone,0,.6,0,43,1.2,3);
    b.box(glaze[2],0,4.3,0,41,7.4,1.5);
    roof(b,{...m,roof:glaze[0],ridge:glaze[1],tile:glaze[0]},0,8,0,44,3.2,1.5,0,true);
    for(let i=0;i<9;i++) {
      const x=-18+i*4.5, mat=glaze[i%3];
      let prev=null;
      for(let j=0;j<29;j++) { const t=j/28, p=[x+Math.sin(t*TAU*1.25)*1.1,2.1+t*4.4,1.02+Math.cos(t*TAU)*.12]; if(prev)b.beam(mat,prev,p,.24,7);prev=p; }
      b.ico(mat,x+1.05,6.6,1.14,.48,.43,.36); b.beam(m.gold,[x+1,6.85,1.15],[x+.65,7.45,1.19],.06,5);
      b.sphere(m.white,x+1.2,6.75,1.46,.09); b.sphere(m.dark,x+1.2,6.75,1.54,.042);
      for(const s of [-1,1]) {b.beam(mat,[x,4,1.1],[x+s*1.2,4.6,1.22],.12,6);b.beam(mat,[x+s*1.2,4.6,1.22],[x+s*1.55,4.35,1.22],.08,5);}
      b.sphere(m.white,x,1.72,1,.6,.2,.15);
    }
  }); c.solid(31,16,44,3.2);
  mark(c,'nine-dragons','大同九龙壁','NINE-DRAGON SCREEN','琉璃游龙','九条独立起伏的龙身、龙首、角与爪构成三维浮雕；色釉与细部为简化艺术表达。',31,16,11,25,[31,2.95,26]);
  c.local(-56,25,0,1,(b,m)=> {
    gateArch(c,b,m,29,8,9,3.2); hall(c,b,m,{w:23,d:10,h:5,y:8,double:true});
    for(const s of [-1,1]) {b.box(m.brick,s*25,3.5,0,22,7,6);for(let x=15;x<36;x+=2)b.box(m.brick,s*x,7.6,0,1.2,1.2,6);}
  }); c.solid(-76,25,34,9); c.solid(-36,25,34,9);
  c.road([[-56,-22],[-56,63]],5.5);
  mark(c,'datong-wall','大同古城门','DATONG CITY WALL','城垣高台','高大的灰砖城台承托重檐楼阁，与南侧街巷形成北方古城轮廓。城楼为风貌重构。',-56,25,23,30,[-56,2.95,45]);
  c.street([[-90,-17],[88,-17]],{width:5,trees:'pine',spacing:13});
  c.street([[-90,38],[88,38]],{width:5,trees:'broad',spacing:13});
  c.street([[0,-17],[0,66]],{width:6,trees:'broad',spacing:12});
  for(const z of [51,64]) for(let x=-85;x<=85;x+=13) if(Math.abs(x+56)>5&&Math.abs(x)>5) c.house(x,z,8,6,3.4,0,{wall:c.m.brick,detail:false});
  for(const z of [-4,9]) for(const x of [-85,-73,-38,-25,12,68,82]) c.house(x,z,7.6,6,3.6,0,{wall:c.m.brick,detail:false});
  c.shop(54,27,{name:'古城面香',kind:'food',width:9,depth:7,wall:c.m.brick});
  treeRows(c,[[-90,-61,-90,16,12],[88,-61,88,20,13],[19,-61,81,-61,10],[-90,69,89,69,22],[-17,-12,-17,31,8]],'pine');
}

function buildQingdao(c) {
  const red=c.material('may-wind-red','#d84b38'), cream=c.material('qingdao-cathedral','#e5c59e'), terracotta=c.material('qingdao-red-roof','#b9533e');
  c.water([[-93,27],[-61,23],[-22,25],[5,32],[45,27],[93,19],[93,69],[-93,69]]);
  c.street([[-90,16],[-54,15],[-10,18],[35,19],[89,10]],{width:5,trees:'broad',spacing:11});
  c.street([[-90,-10],[88,-10]],{width:5,trees:'broad',spacing:12});
  c.road([[-45,-18],[-45,21]],5);
  c.island(-45,59,8,7); c.bridge(-45,39,43,4,Math.PI/2,'flat');
  c.local(-45,59,0,1,(b,m)=> {
    b.cyl(m.stone,0,.35,0,7,7.5,.7,32);
    for(let i=0;i<8;i++) {const a=(i+.5)*TAU/8;b.cyl(m.redwood,Math.cos(a)*4,2.8,Math.sin(a)*4,.23,.25,5,8);}
    b.cyl(m.wall,0,2.5,0,3.65,3.65,4.3,8);
    for(let i=0;i<8;i++) {const a=(i+.5)*TAU/8; b.box(m.window,Math.cos(a)*3.53,3,Math.sin(a)*3.53,1.6,2,.08,-a+Math.PI/2);}
    roundRoof(c,b,m.gold,5.8,4.9,2.5,0,8);
    b.cyl(m.wall,0,7.1,0,2.8,2.8,2.7,8);roundRoof(c,b,m.gold,4.6,8.3,2.6,0,8);
    b.cyl(m.gold,0,11.4,0,.05,.2,1,8);
  }); c.solid(-45,59,7,7);
  mark(c,'zhanqiao','栈桥 · 回澜阁','ZHANQIAO PIER','飞阁回澜','细长栈桥伸入海湾，末端是黄色琉璃瓦、八角双层飞檐的回澜阁。',-45,59,14,20,[-45,2.95,48]);
  c.local(30,3,0,1,(b,m)=> {
    b.cyl(m.paving,0,.08,0,15,15,.16,64);ring(c,b,m.white,0,.2,0,12.5,.19);
    const pos=[],indices=[];
    // Wide sculptural ribbon with thickness, three-dimensional spiral rather than stacked rings.
    const n=180;
    for(let i=0;i<=n;i++){
      const t=i/n,a=t*TAU*3.3,r=8.5-3.2*t,y=2+t*18;
      for(const side of [-1,1])for(const thick of [-1,1])pos.push(Math.cos(a)*(r+side*1.85),y+thick*.38,Math.sin(a)*(r+side*1.85));
    }
    for(let i=0;i<n;i++){const k=i*4,l=k+4;for(const [a,b1]of [[0,1],[1,3],[3,2],[2,0]])indices.push(k+a,l+a,k+b1,k+b1,l+a,l+b1);}
    indices.push(0,2,1,1,2,3,n*4,n*4+1,n*4+2,n*4+1,n*4+3,n*4+2);
    const geo=new c.THREE.BufferGeometry();geo.setAttribute('position',new c.THREE.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();b.add(geo,red);geo.dispose();
    b.cyl(red,0,3.5,0,3.8,5.3,7,24);
  }); c.solid(30,3,21,21);
  mark(c,'may-wind','五月的风','MAY WIND','红色回旋','海湾广场上的红色风形雕塑以有厚度的连续螺旋体重构，夜色下仍保持鲜明轮廓。',30,3,24,22,[30,2.95,19]);
  c.local(-47,-38,0,1,(b,m)=> {
    b.box(cream,0,7,0,17,14,24); b.box(cream,0,6,-3,29,12,9);
    const g=new c.THREE.CylinderGeometry(0,12.8,5,4);b.add(g,terracotta,0,16.5,0,1,1,1.25,Math.PI/4);g.dispose();
    for(const side of [-1,1]) {
      const x=side*10; b.box(cream,x,12,10,7,24,7); b.box(m.white,x,20.2,10,7.3,.7,7.3);
      b.cyl(terracotta,x,29,10,0,5.5,10,4);
      b.beam(m.dark,[x,33,10],[x,36,10],.14,6);b.beam(m.dark,[x-1,34.8,10],[x+1,34.8,10],.14,6);
      for(const xx of [-1.2,1.2])b.box(m.dark,x+xx,21,13.54,1.1,3.2,.09);
    }
    const wheel=new c.THREE.TorusGeometry(2.6,.22,6,32);b.add(wheel,m.white,0,10.2,12.1);wheel.dispose();
    const roseGlass=new c.THREE.CircleGeometry(2.4,32);b.add(roseGlass,m.window,0,10.2,12.03);roseGlass.dispose();
    for(let i=0;i<12;i++){const a=i*TAU/12;b.beam(m.white,[0,10.2,12.17],[Math.cos(a)*2.4,10.2+Math.sin(a)*2.4,12.17],.06,5);}
    for(const x of [-5,0,5]){ b.box(m.dark,x,2.7,12.12,2.7,5.4,.1);b.cyl(cream,x,5.8,12.1,1.7,1.7,.3,16); }
  }); c.solid(-47,-38,30,26);
  mark(c,'cathedral','圣弥厄尔教堂','ST. MICHAEL’S CATHEDRAL','双塔红顶','以黄褐立面、红色双尖塔、十字架与玫瑰窗重构青岛天主教堂的辨识轮廓。',-47,-38,39,27,[-47,2.95,-18]);
  c.island(-6,51,7,7);
  c.local(-6,51,0,1,(b,m)=> {
    b.cyl(m.white,0,6,0,1.7,2.4,12,20);b.cyl(m.white,0,12.3,0,2.5,2.5,.6,24);b.cyl(m.glass,0,13.5,0,1.65,1.65,2,16);
    for(let i=0;i<8;i++){const a=i*TAU/8;b.beam(m.dark,[Math.cos(a)*1.7,12.5,Math.sin(a)*1.7],[Math.cos(a)*1.7,14.5,Math.sin(a)*1.7],.07,5);}
    b.cyl(m.dark,0,15,0,0,2.2,1.6,16);b.sphere(m.lamp,0,13.5,0,.75);
  }); c.solid(-6,51,5,5);
  mark(c,'little-qingdao','小青岛灯塔','LITTLE QINGDAO','白塔海岛','白色灯塔、礁石小岛与海湾帆影构成小青岛的微缩意象。',-6,51,18,13,[-6,2.95,20]);
  for(const z of [-60,-43,-26])for(let x=-85;x<=85;x+=15){if(x>-68&&x<-27&&z>-57)continue;villa(c,x,z,{h:4.5+c.random()*2.4,turret:(x+z)%3===0,color:['#e6ccaa','#d5b99b','#ecddbd'][Math.floor(c.random()*3)]});}
  for(const x of [-80,-65,-23,-8,7,68,84]) villa(c,x,3,{w:8,d:6,h:5.5,turret:true});
  for(const x of [61,75,88])c.tower(x,-61,7,7,18+c.random()*12,{style:'steps'});
  c.shop(-18,-2,{name:'海风小书屋',kind:'books',width:9,depth:7,roof:terracotta});
  treeRows(c,[[-91,-64,-91,13,12],[-87,-69,87,-69,24],[89,-55,89,-17,7],[-80,-17,-80,7,5],[51,-56,51,-17,7],[-19,-56,-19,-19,7]],'broad');
  c.boat(42,47,{scale:.9,travel:17,sail:true});c.boat(-73,49,{scale:.75,travel:13,sail:true});
}

function buildDalian(c) {
  const seaSteel=c.material('dalian-bridge','#d5dedd'), slate=c.material('dalian-slate','#5a7783');
  const bookStone=c.material('dalian-book-stone','#e5e6d7');bookStone.side=c.THREE.DoubleSide;
  c.water([[-92,28],[-63,24],[-23,23],[18,23],[58,20],[92,27],[92,69],[-92,69]]);
  c.street([[-91,17],[-54,14],[-17,16],[26,15],[89,14]],{width:5,trees:'broad',spacing:12});
  c.street([[-89,-8],[88,-8]],{width:5,trees:'broad',spacing:12});
  c.local(0,48,0,1,(b,m)=> {
    for(const y of [6.1,9])b.box(seaSteel,0,y,0,177,.65,7);
    b.box(m.road,0,9.36,0,177,.06,6.5);
    for(let x=-87;x<=87;x+=5.8)for(const s of [-1,1]){
      b.beam(seaSteel,[x,6.2,s*3.6],[x+5.8,9,s*3.6],.16,6);b.beam(seaSteel,[x,9,s*3.6],[x+5.8,6.2,s*3.6],.16,6);
    }
    for(const tx of [-44,44]) {
      for(const s of [-1,1]){b.box(m.concrete,tx,17,s*5,2.5,34,2.8);b.box(m.white,tx,33,s*5,3.1,1.2,3.3);}
      for(const y of [13,27,32])b.box(m.concrete,tx,y,0,2.3,2.1,13);
      b.box(m.stone,tx,1.5,0,9,3,17);
    }
    for(const s of [-1,1]) {
      const yAt=x=>Math.abs(x)<=44?14+19*(x/44)**2:33-23*(Math.abs(x)-44)/45;
      for(let x=-89;x<89;x+=2)b.beam(m.white,[x,yAt(x),s*4.2],[x+2,yAt(x+2),s*4.2],.2,7);
      for(let x=-84;x<=84;x+=4)b.beam(m.white,[x,9.2,s*4.2],[x,yAt(x),s*4.2],.067,5);
      b.beam(m.lamp,[-88,10.1,s*3.7],[88,10.1,s*3.7],.065,5);
    }
    for(let x=-86;x<=86;x+=9)b.box(m.white,x,9.45,0,3,.05,.12);
  });
  mark(c,'xinghai-bridge','星海湾跨海大桥','XINGHAI BAY BRIDGE','双层悬索','双层桥面、钢桁架、两座门形主塔与悬索吊杆组合成大连海湾长桥；从岸边观看。',0,48,38,70,[0,2.95,18]);
  c.local(-3,1,0,1,(b,m)=> {
    b.cyl(m.paving,0,.08,0,18,18,.16,64);ring(c,b,m.white,0,.18,0,16,.2);ring(c,b,m.trim,0,.18,0,12,.16);
    for(let i=0;i<12;i++){const a=i*TAU/12;b.beam(m.white,[Math.cos(a)*5,.2,Math.sin(a)*5],[Math.cos(a)*15.5,.2,Math.sin(a)*15.5],.13,5);}
    // Open-book monument: two curved sheets with a shared valley, visibly sculptural.
    for(const s of [-1,1])for(let i=0;i<20;i++) {
      const t=i/20,t2=(i+1)/20,x=s*t*9,x2=s*t2*9,y=.5+6*t*t,y2=.5+6*t2*t2;
      b.beam(m.white,[x,y,17],[x2,y2,17],.23,5);b.beam(m.white,[x,y,21],[x2,y2,21],.23,5);
      const verts=[x,y,17,x2,y2,17,x,y,21,x2,y2,17,x2,y2,21,x,y,21];
      const g=new c.THREE.BufferGeometry();g.setAttribute('position',new c.THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();b.add(g,bookStone);g.dispose();
    }
  }); c.solid(-3,20,20,5);
  mark(c,'xinghai-square','星海广场','XINGHAI SQUARE','海滨长卷','开阔圆形铺地与面海的翻页雕塑构成星海广场意象，保留宽阔散步空间。',-3,1,10,22,[-3,2.95,11]);
  c.local(47,-35,0,1,(b,m)=> {
    b.cyl(m.paving,0,.05,0,17,17,.1,64);ring(c,b,m.white,0,.16,0,13.8,.18);b.cyl(m.grass,0,.14,0,8,8,.12,48);
    for(let i=0;i<10;i++){const a=i*TAU/10;b.beam(m.white,[Math.cos(a)*8,.24,Math.sin(a)*8],[Math.cos(a)*16,.24,Math.sin(a)*16],.12,5);}
  });
  // Five arcaded civic facades around the round square; evocative, not named replicas.
  for(const [x,z,r]of [[23,-54,0],[47,-60,0],[72,-53,-.6],[23,-23,.5],[72,-24,-.5]]) {
    c.local(x,z,r,1,(b,m)=> {
      const beige=c.material('dalian-stone','#d7c9ac'); b.box(beige,0,4.3,0,13,8.6,7);
      b.box(m.white,0,8.6,0,14,.55,8); b.box(slate,0,9.5,0,12,1.3,6);
      for(let i=-2;i<=2;i++) {b.cyl(m.white,i*2.45,3,4.15,.25,.3,5.6,10);for(const yy of [2.5,6.5]) b.box(m.window,i*2.4,yy,3.56,1.3,1.9,.1);}
      b.box(m.white,0,6.1,4.15,14,.6,1);
      lathe(c,b,slate,[[0,0],[2.5,0],[2.6,1],[2.1,2.2],[1.1,3],[0,3.4]],0,10,0,24);
    });c.solid(x,z,15,11);
  }
  mark(c,'zhongshan-square','中山广场建筑群','ZHONGSHAN SQUARE','放射街廓','圆形广场与近代柱廊、穹顶、线脚共同呈现港城街廓。环广场单体为风貌重构。',47,-35,16,28,[47,2.95,-22]);
  for(const x of [-82,-67,-35])for(const z of [-57,-40,-23])villa(c,x,z,{w:8,d:7,h:6+c.random()*2,turret:true,roofColor:'#53757a',color:['#cfac81','#e8d6b2','#bf8169'][Math.floor(c.random()*3)]});
  c.street([[-51,-63],[-51,-12]],{width:5,trees:'broad',spacing:11});
  c.shop(-39,-16,{name:'海港小咖啡',kind:'food',width:10,depth:8,roof:slate});
  mark(c,'russian-street','俄罗斯风情街','RUSSIAN-STYLE STREET','彩墙尖顶','坡屋顶、尖角塔、彩色立面与临街小店组合成步行街。商铺及建筑细部是原创设计。',-56,-34,15,28,[-51,2.95,-17]);
  for(const z of [-63,-46])for(const x of [-16,-3,10])c.tower(x,z,7.5,7,14+c.random()*15,{style:'steps',material:c.m.glass2});
  for(const x of [-87,-73,-59,-35,24,39,56,72,87])villa(c,x,3,{w:8,d:6,h:5+c.random()*2,roofColor:'#687f81',turret:false});
  for(const [x,z] of [[-82,-67],[-67,-67],[-35,-67],[-14,-28],[0,-28],[14,-28]])villa(c,x,z,{w:6,d:4,h:4.5,roofColor:'#876857'});
  c.local(84,20,0,1,(b,m)=> {
    b.cyl(m.white,0,5,0,1.4,2.1,10,18);b.cyl(m.red,0,6,0,1.65,1.85,2,18);b.cyl(m.dark,0,10.3,0,2.1,2.1,.5,18);b.cyl(m.glass,0,11.3,0,1.3,1.3,1.7,12);b.cyl(m.red,0,12.6,0,0,1.9,1.1,16);b.sphere(m.lamp,0,11.3,0,.6);
  });c.solid(84,20,5,5);
  treeRows(c,[[-91,-65,-91,5,12],[-87,-68,85,-68,25],[87,-61,87,-21,8],[-25,-57,-25,-17,8],[16,-56,16,-20,7]],'pine');
  c.boat(-49,33,{travel:17,scale:1,sail:true,axis:'x'});c.boat(49,58,{travel:8,scale:1.2,sail:true});
}

export const cities = {
  nanjing: { name:'南京',en:'NANJING',subtitle:'秦淮灯影 · 金陵城垣',intro:'沿秦淮河穿过画舫与旧街，在中华门的瓮城间散步。抬头寻找钟山蓝瓦与金陵大屋顶。',stamp:'宁',coordinates:'32.0603° N · 118.7969° E',region:'江南',palette:{water:'#779d92',grass:'#8fa578',roof:'#56615c'},build:buildNanjing },
  beijing: { name:'北京',en:'BEIJING',subtitle:'朱墙金瓦 · 天圆地方',intro:'蓝色圆檐、白塔与宫城映出北京的层次。穿过林荫道，走到灰瓦四合院旁的茶馆。',stamp:'京',coordinates:'39.9042° N · 116.4074° E',region:'华北',palette:{water:'#709da2',grass:'#9aa879',roof:'#626867'},build:buildBeijing },
  datong: { name:'山西大同',en:'DATONG',subtitle:'云冈石影 · 古都城墙',intro:'厚重崖壁与舒展的辽金屋顶在古城相遇。近看九条琉璃游龙，再走进街边的小面馆。',stamp:'同',coordinates:'40.0768° N · 113.3001° E',region:'华北',palette:{water:'#8ca6a2',grass:'#aca982',roof:'#706b60'},build:buildDatong },
  qingdao: { name:'青岛',en:'QINGDAO',subtitle:'红瓦绿树 · 碧海帆影',intro:'从双尖塔与红瓦街区走向海湾，栈桥尽头就是回澜阁。红色的五月之风在海边盘旋。',stamp:'青',coordinates:'36.0671° N · 120.3826° E',region:'黄海',spawn:[-45,16],palette:{water:'#66a7b4',grass:'#9eaf87',roof:'#a85b46'},build:buildQingdao },
  dalian: { name:'大连',en:'DALIAN',subtitle:'星海长桥 · 海港街廓',intro:'海面上的双层悬索桥连接天际线，岸边是开阔广场。转入彩色尖顶的小街，在咖啡香里歇脚。',stamp:'连',coordinates:'38.9140° N · 121.6147° E',region:'黄海',spawn:[-3,11],palette:{water:'#6b9fac',grass:'#96a784',roof:'#637c7d'},build:buildDalian },
};
