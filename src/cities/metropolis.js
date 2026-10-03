import { roof } from '../geometry.js';

// All landmarks are modelled volumes. The atlas intentionally compresses geography.
const TAU = Math.PI * 2;
const G = 1.1;

function surface(ctx, builder, mat, point, nu, nv, closeU = false) {
  const p = [];
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const u0 = i / nu, u1 = (i + 1) / nu, v0 = j / nv, v1 = (j + 1) / nv;
    const a = point(u0, v0), b = point(u1, v0), c = point(u1, v1), d = point(u0, v1);
    p.push(...a, ...d, ...b, ...b, ...d, ...c);
  }
  const geo = new ctx.THREE.BufferGeometry();
  geo.setAttribute('position', new ctx.THREE.Float32BufferAttribute(p, 3));
  geo.computeVertexNormals();
  builder.add(geo, mat);
  geo.dispose();
}

function ring(b, mat, x, y, z, rx, rz = rx, n = 32, thickness = .07) {
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, c = (i + 1) / n * TAU;
    b.beam(mat, [x + Math.cos(a) * rx, y, z + Math.sin(a) * rz], [x + Math.cos(c) * rx, y, z + Math.sin(c) * rz], thickness, 5);
  }
}

function facade(b, m, x, z, w, d, h, wall = m.concrete, floors = Math.max(2, Math.floor(h / 2))) {
  b.box(wall, x, G + h / 2, z, w, h, d);
  b.box(m.stone, x, G + .25, z, w + .5, .5, d + .5);
  b.box(m.trim, x, G + h + .16, z, w + .35, .32, d + .35);
  for (const s of [-1, 1]) {
    for (let f = 0; f < floors; f++) {
      const y = G + 1.2 + f * (h - 1.2) / floors;
      for (let a = -w / 2 + .9; a < w / 2 - .3; a += 1.8) b.box(m.window, x + a, y, z + s * (d / 2 + .035), 1.05, .85, .07);
      for (let a = -d / 2 + .9; a < d / 2 - .3; a += 1.8) b.box(m.glass2, x + s * (w / 2 + .035), y, z + a, .07, .85, 1.05);
    }
  }
}

function block(ctx, x, z, w = 7, d = 6, h = 10, classic = false) {
  const { b, m } = ctx;
  facade(b, m, x, z, w, d, h, classic ? m.wall2 : m.concrete);
  if (classic) {
    for (let q = -w / 2 + .7; q <= w / 2; q += 2.1) b.cyl(m.wall, x + q, G + h * .53, z + d / 2 + .1, .16, .19, h * .76, 6);
    b.box(m.stone, x, G + h + .5, z, w + .65, .42, d + .65);
  } else {
    b.box(m.dark, x + w * .2, G + h + .4, z, w * .35, .5, d * .4);
  }
  ctx.solid(x, z, w, d);
}

function landmark(ctx, id, name, en, tag, desc, x, z, height, radius, walk) {
  ctx.landmark({ id, name, en, tag, desc, x, z, height, radius, walk });
}

function sphereBands(b, m, x, y, z, r, mat) {
  b.sphere(mat, x, y, z, r);
  for (const a of [-.65, -.32, 0, .32, .65]) ring(b, m.steel, x, y + r * a, z, r * Math.sqrt(1 - a * a) + .025, undefined, 24, .055);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    for (let j = 0; j < 12; j++) {
      const p = -Math.PI / 2 + j * Math.PI / 12, q = p + Math.PI / 12;
      b.beam(m.steel, [x + r * Math.cos(p) * Math.cos(a), y + r * Math.sin(p), z + r * Math.cos(p) * Math.sin(a)], [x + r * Math.cos(q) * Math.cos(a), y + r * Math.sin(q), z + r * Math.cos(q) * Math.sin(a)], .035, 4);
    }
  }
}

function shanghaiTower(ctx, x, z) {
  const { m } = ctx;
  const glass = ctx.material('shanghai-tower-glass', '#86b6c2', .24, .65);
  ctx.local(x, z, 0, 1, b => {
    const point = (a, t) => {
      const th = a * TAU, twist = t * Math.PI * 2 / 3;
      const r = 6.4 * (1 - .45 * t) * (1 + .12 * Math.cos(th * 3));
      return [r * Math.cos(th + twist), t * 59 + .4, r * Math.sin(th + twist)];
    };
    b.cyl(m.stone, 0, .2, 0, 8.1, 8.5, .4, 36);
    surface(ctx, b, glass, point, 48, 45);
    for (let j = 0; j <= 45; j++) for (let i = 0; i < 48; i++) b.beam(j % 6 === 0 ? m.steel : m.glass2, point(i / 48, j / 45), point((i + 1) / 48, j / 45), j % 6 === 0 ? .085 : .036, 4);
    for (let i = 0; i < 24; i++) for (let j = 0; j < 30; j++) b.beam(i % 8 === 0 ? m.white : m.steel, point(i / 24, j / 30), point(i / 24, (j + 1) / 30), i % 8 === 0 ? .105 : .042, 4);
    b.cyl(m.dark, 0, 59.4, 0, 2.9, 3.6, .5, 24);
    ring(b, m.citylight, 0, 58.7, 0, 3.8, 3.8, 32, .06);
  });
  ctx.solid(x, z, 13, 13);
}

function financialCenter(ctx, x, z) {
  const { m, THREE } = ctx;
  ctx.local(x, z, 0, 1, b => {
    // The actual sky portal is a geometry hole cut right through the tower.
    const shape = new THREE.Shape();
    shape.moveTo(-5.7, 0); shape.lineTo(5.7, 0); shape.lineTo(4, 49); shape.lineTo(-4, 49); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-2.65, 41.7); hole.lineTo(-3.0, 46.6); hole.lineTo(3.0, 46.6); hole.lineTo(2.65, 41.7); hole.closePath();
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 4.5, bevelEnabled: false });
    b.add(geo, m.glass2, 0, .2, -2.25); geo.dispose();
    b.box(m.stone, 0, .2, 0, 14, .4, 8);
    for (const s of [-1, 1]) {
      b.beam(m.steel, [s * 5.7, .2, 2.3], [s * 4, 49.2, 2.3], .17);
      for (let y = 2; y < 41; y += 1.15) b.box(m.steel, 0, y, s * 2.3, 11.4 - y * .069, .06, .06);
      for (const xx of [-2.7, 0, 2.7]) b.box(m.steel, xx, 20.5, s * 2.3, .07, 40, .07);
      b.box(m.white, 0, 49.15, s * 2.3, 8.2, .3, .16);
    }
    b.box(m.citylight, 0, 41.72, 2.33, 5.3, .12, .1);
  });
  ctx.solid(x, z, 12, 6);
}

function jinMao(ctx, x, z) {
  const { m } = ctx;
  ctx.local(x, z, 0, 1, b => {
    b.box(m.stone, 0, .4, 0, 13, .8, 13);
    let y = .8;
    for (let i = 0; i < 9; i++) {
      const r = 5.6 - i * .42, h = 5.4 - i * .32;
      b.cyl(m.glass, 0, y + h / 2, 0, r * .96, r, h, 8);
      for (let q = 0; q < 8; q++) {
        const a = (q + .5) / 8 * TAU;
        b.beam(m.steel, [r * Math.cos(a), y, r * Math.sin(a)], [r * .96 * Math.cos(a), y + h, r * .96 * Math.sin(a)], .1);
      }
      for (let j = 1; j <= 4; j++) ring(b, m.steel, 0, y + j * h / 4, 0, r + .05, r + .05, 8, .065);
      b.cyl(m.white, 0, y + h, 0, r + .18, r + .3, .25, 8);
      y += h;
    }
    b.cyl(m.steel, 0, y + 2.2, 0, .17, 1.8, 4.4, 8);
    b.cyl(m.steel, 0, y + 5.1, 0, .06, .12, 2.5, 8);
  });
  ctx.solid(x, z, 12, 12);
}

function pearl(ctx, x, z) {
  const { m } = ctx, pink = ctx.material('pearl-rose', '#ba7386', .3, .35);
  ctx.local(x, z, 0, 1, b => {
    b.cyl(m.stone, 0, .3, 0, 8.2, 9, .6, 24);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU;
      b.beam(m.white, [Math.cos(a) * 7.7, .5, Math.sin(a) * 7.7], [Math.cos(a) * 2.4, 12, Math.sin(a) * 2.4], .56, 10);
      b.cyl(m.white, Math.cos(a) * 1.4, 24, Math.sin(a) * 1.4, .48, .56, 29, 10);
    }
    sphereBands(b, m, 0, 13.5, 0, 5.3, pink);
    sphereBands(b, m, 0, 33.8, 0, 3.7, pink);
    b.cyl(m.white, 0, 41.2, 0, .45, .62, 10, 10);
    sphereBands(b, m, 0, 44.6, 0, 1.8, m.glass2);
    b.cyl(m.steel, 0, 49.1, 0, .06, .25, 6.5, 8);
    for (let i = 0; i < 5; i++) b.sphere(pink, Math.cos(i * 1.3) * 1.8, 20 + i * 2.0, Math.sin(i * 1.3) * 1.8, .7);
  });
  ctx.solid(x, z, 11, 11);
}

function bundClock(ctx, x, z) {
  const { b, m } = ctx;
  block(ctx, x, z, 20, 10, 12, true);
  b.box(m.wall, x, G + 16, z, 7, 8, 6);
  b.box(m.trim, x, G + 20.2, z, 8.2, .65, 7.2);
  b.box(m.stone, x, G + 21.1, z, 5.7, 1.5, 5.5);
  b.cyl(m.dark, x, G + 23, z, 0, 4.2, 3.2, 4);
  // Face and hands remain real raised geometry at walking distance.
  for (const s of [-1, 1]) {
    b.sphere(m.white, x, G + 17.4, z + s * 3.06, 1.55, 1.55, .075);
    b.beam(m.dark, [x, G + 17.4, z + s * 3.16], [x, G + 18.5, z + s * 3.16], .065);
    b.beam(m.dark, [x, G + 17.4, z + s * 3.16], [x + .8, G + 17.0, z + s * 3.16], .065);
    for (let i = 0; i < 12; i++) b.sphere(m.dark, x + Math.sin(i / 12 * TAU) * 1.23, G + 17.4 + Math.cos(i / 12 * TAU) * 1.23, z + s * 3.17, .08, .1, .055);
  }
}

function buildShanghai(ctx) {
  const { b, m } = ctx;
  ctx.water([[-24,-68],[-3,-68],[-3,-25],[9,7],[13,42],[24,68],[3,68],[-9,43],[-13,10],[-26,-25]]);
  ctx.street([[-33,-61],[-32,-22],[-23,10],[-22,42],[-9,64]], { width: 5, spacing: 10 });
  ctx.street([[3,-59],[3,-23],[17,-13],[24,5],[27,38],[38,63]], { width: 5, spacing: 11 });
  ctx.street([[-87,42],[-22,42]], { width: 5 });
  ctx.street([[24,42],[86,42]], { width: 5 });
  ctx.bridge(2, 42, 44, 5, 0, 'flat');
  ctx.road([[-20,42],[-22,42]],5); ctx.road([[24,42],[27,42]],5);
  shanghaiTower(ctx, 45, -36); financialCenter(ctx, 69, -29); jinMao(ctx, 63, -54); pearl(ctx, 14, -34);
  bundClock(ctx, -51, -29);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const x = -80 + col * 13, z = -57 + row * 22;
    if (Math.abs(x + 51) < 17 && Math.abs(z + 29) < 12) continue;
    block(ctx, x, z, 8 + ctx.random() * 2, 8, 5 + ctx.random() * 6, true);
  }
  for (const z of [4,20,58]) for (const x of [43,57,71,84]) block(ctx,x,z,7,7,8+ctx.random()*14);
  for (const x of [-79,-64,-49,-34]) for (const z of [53,65]) block(ctx,x,z,8,6,5+ctx.random()*3,true);
  for (const x of [27,43,84]) block(ctx,x,-57,7,7,9+ctx.random()*6);
  ctx.shop(-58,17,{name:'弄堂生煎',width:9,depth:7,kind:'food',wall:m.brick});
  ctx.road([[-58,23],[-58,42]],3);
  for (let i=0;i<36;i++) { const x=-90+ctx.random()*173,z=i%2?-66:67; if (x>-30&&x<28)continue;ctx.tree(x,z,.55+ctx.random()*.35,'broad'); }
  for (let i=0;i<36;i++) { const x=i%2?-89:90,z=-58+ctx.random()*115;ctx.tree(x,z,.6+ctx.random()*.4,'broad'); }
  for(let i=0;i<18;i++)ctx.tree(31+(i%6)*9,29+Math.floor(i/6)*3,.48,'broad');
  ctx.boat(-12,-51,{axis:'z',travel:7,rotation:Math.PI/2,scale:1.1});
  ctx.boat(1,14,{axis:'z',travel:6,rotation:Math.PI/2,scale:.9});
  landmark(ctx,'shanghai-tower','上海中心','SHANGHAI TOWER','螺旋幕墙','逐层收分的圆角三角形塔身旋转上升；幕墙竖肋沿立面连续扭转。',45,-36,61,14,[31,2.95,-25]);
  landmark(ctx,'world-financial-center','环球金融中心','WORLD FINANCIAL CENTER','天空之窗','楔形塔体的顶部开口真正贯穿模型，可以转动视角透过天空之窗。',69,-29,50,12,[69,2.95,-15]);
  landmark(ctx,'jin-mao','金茂大厦','JIN MAO TOWER','层层收分','八边形塔身叠出宝塔般的退台，金属檐口和尖冠保留节奏。',63,-54,46,11,[76,2.95,-46]);
  landmark(ctx,'oriental-pearl','东方明珠','ORIENTAL PEARL','大珠小珠','斜撑托起玫红色球体，三根主柱串联上下观景球与天线。',14,-34,53,12,[15,2.95,-18]);
  landmark(ctx,'the-bund','外滩钟楼','THE BUND','浦江两岸','石色立面、柱廊和钟楼对应外滩历史建筑群，与江对岸的摩天楼相望。',-51,-29,25,16,[-37,2.95,-19]);
}

function cantonTower(ctx,x,z) {
  const {m}=ctx;
  const magenta=ctx.material('canton-rose','#c894b3',.37,.45);
  const cyan=ctx.material('canton-cyan','#95ccd4',.37,.45);
  ctx.local(x,z,0,1,b=>{
    b.cyl(m.stone,0,.25,0,8.5,9,.5,32);
    b.cyl(m.glass2,0,23.7,0,1.5,1.85,46.8,24);
    const point=(i,t)=>{
      const a=i/24*TAU, q=a+Math.PI*.75;
      return [(1-t)*6.8*Math.cos(a)+t*4.5*Math.cos(q)+t*.6, .5+t*47, (1-t)*5.2*Math.sin(a)+t*3.4*Math.sin(q)];
    };
    for(let i=0;i<24;i++)for(let j=0;j<32;j++)b.beam(i%3===0?magenta:m.white,point(i,j/32),point(i,(j+1)/32),.105,5);
    for(let j=0;j<=36;j++)for(let i=0;i<24;i++)b.beam(j%4===0?cyan:m.steel,point(i,j/36),point(i+1,j/36),.06,5);
    for(let j=0;j<18;j++)for(let i=0;i<24;i++)b.beam(m.steel,point(i,j/18),point(i+1,(j+1)/18),.034,4);
    for(let i=0;i<5;i++)b.cyl(m.glass,0,39+i*1.5,0,2.8+i*.17,2.6+i*.17,1.2,24);
    ring(b,m.white,.6,47.7,0,4.5,3.4,36,.17);
    for(let i=0;i<12;i++){const a=i/12*TAU;b.sphere(m.glass2,.6+Math.cos(a)*4.4,48.2,Math.sin(a)*3.3,.45,.55,.45);}
    b.cyl(m.white,0,52,0,.22,.45,10,12);b.cyl(m.steel,0,59,0,.04,.17,5,8);
  });ctx.solid(x,z,6,6);
}

function operaPebble(ctx,x,z,sx,sz,height,rotation=0) {
  const {m}=ctx, shell=ctx.material('opera-stone','#b9bcb9',.83,.08);
  ctx.local(x,z,rotation,1,b=>{
    b.box(m.paving,0,.18,0,sx*2.1,.35,sz*2.1);
    const point=(u,v)=>{
      const a=u*TAU, t=v*Math.PI/2;
      const radial=Math.cos(t);
      return [Math.cos(a)*sx*radial+Math.sin(t)*sx*.17, .2+Math.sin(t)*height, Math.sin(a)*sz*radial];
    };
    surface(ctx,b,shell,point,12,5);
    for(let j=0;j<5;j++)for(let i=0;i<12;i++){
      b.beam(m.dark,point(i/12,j/5),point((i+1)/12,j/5),.045,4);
      b.beam(m.dark,point(i/12,j/5),point((i+1)/12,(j+1)/5),.045,4);
      b.beam(m.dark,point(i/12,j/5),point(i/12,(j+1)/5),.045,4);
    }
    b.box(m.glass2,0,2.2,sz*.81,sx*1.32,4.2,.35);
    for(let i=-3;i<=3;i++)b.beam(m.white,[i*sx*.21,.4,sz*.84],[i*sx*.18,4.3,sz*.84],.07);
  });ctx.solid(x,z,sx*1.8,sz*1.8);
}

function archRibBridge(ctx,x,z,length,width,rotation=0) {
  const {m}=ctx;
  ctx.bridge(x,z,length,width,rotation,'flat');
  ctx.local(x,z,rotation,1,b=>{
    const p=t=>[-length/2+t*length,1.35+11*Math.sin(t*Math.PI),-width*.55];
    for(let i=0;i<40;i++)b.beam(m.white,p(i/40),p((i+1)/40),.38,8);
    for(let i=2;i<20;i++){const t=i/20,a=p(t);b.beam(m.steel,a,[a[0],1.3,width*.45],.065,5);}
  });
}

function buildGuangzhou(ctx) {
  const {m}=ctx;
  ctx.water([[-93,8],[93,8],[93,27],[30,24],[-25,27],[-93,23]]);
  ctx.street([[-89,1],[-40,1],[0,0],[40,0],[87,1]],{width:5,trees:'broad',spacing:10});
  ctx.street([[-87,34],[-40,34],[10,33],[61,33],[88,35]],{width:5,trees:'palm',spacing:10});
  ctx.street([[4,-64],[4,0]],{width:7,trees:'palm',spacing:10});
  cantonTower(ctx,30,48);
  operaPebble(ctx,-36,-13,12,8,9,-.12);operaPebble(ctx,-59,-11,7.6,6,6,.25);
  archRibBridge(ctx,62,17,40,4.2,Math.PI/2);
  ctx.road([[62,-3],[62,1]],4.2);ctx.road([[62,37],[62,34]],4.2);
  // Dense Pearl River New Town volumes, with a landscaped central axis.
  for(const z of [-57,-42,-27])for(const x of [-80,-65,-50,-35,-20,20,36,52,69,84]){
    if(z===-27&&x>=-65&&x<=-20)continue;
    block(ctx,x,z,7+ctx.random()*2,7,9+ctx.random()*17);
  }
  for(const z of [49,63])for(const x of [-81,-65,-49,-33,-17,64,81]){
    if(z===63&&x<0)continue;
    block(ctx,x,z,9,7,5+ctx.random()*5,true);
  }
  ctx.shop(2,44,{name:'榕荫茶楼',width:10,depth:8,kind:'tea',wall:m.wall2});
  ctx.road([[2,49],[2,57],[14,57],[14,34]],3);
  // Lingnan qilou: raised upper storeys leave a real open colonnaded arcade.
  for(let i=0;i<6;i++){
    const x=-81+i*10;
    ctx.b.box(m.wall2,x,G+5,58,8.8,5.5,7);
    for(const q of [-3.5,3.5])ctx.b.box(m.wall,x+q,G+1.4,62, .55,2.8,.55);
    ctx.b.box(m.trim,x,G+3,62,9,.35,1.8);
    for(const q of [-2.5,0,2.5])ctx.b.box(m.window,x+q,G+5.5,61.55,1.35,1.8,.1);
    ctx.solid(x,56.5,8.8,4);
  }
  for(let i=0;i<24;i++)ctx.tree(-90+ctx.random()*180,i%2?-67:68,.65+ctx.random()*.35,'palm');
  for(let i=0;i<14;i++)ctx.tree(-90+ctx.random()*178,30,.6,'palm');
  for(let i=0;i<16;i++)ctx.tree(-6+(i%2)*20,-62+Math.floor(i/2)*6,.58,'broad');
  ctx.boat(-40,16,{axis:'x',travel:12,scale:1.1});ctx.boat(17,17,{axis:'x',travel:9,scale:.9});
  landmark(ctx,'canton-tower','广州塔','CANTON TOWER','珠水小蛮腰','相错旋转的椭圆端面生成纤腰钢网，环梁、斜撑与塔顶观景舱逐件建模。',30,48,62,13,[42,2.95,36]);
  landmark(ctx,'opera-house','广州大剧院','GUANGZHOU OPERA HOUSE','珠江双砾','大小两枚不对称石砾伏在江畔；三角分缝、玻璃入口与立体壳面共同塑形。',-42,-13,12,24,[-38,2.95,0]);
  landmark(ctx,'haixin-bridge','海心桥','HAIXIN BRIDGE','一弧越珠江','白色倾侧拱肋与纤细吊杆跨过珠江，保留开敞的行人桥面。',62,17,15,23,[62,2.95,37]);
  landmark(ctx,'lingnan-arcade','岭南骑楼街','LINGNAN ARCADES','廊下饮茶','连续柱廊遮出一段可行走的骑楼街，原创茶楼里有茶罐、柜台与坐席。',-58,58,10,22,[-53,2.95,64]);
}

function pingAn(ctx,x,z) {
  const {m}=ctx;
  ctx.local(x,z,0,1,b=>{
    const corners=[[-.65,-1],[.65,-1],[1,-.65],[1,.65],[.65,1],[-.65,1],[-1,.65],[-1,-.65]];
    const pt=(i,t)=>{const c=corners[i%8],r=6*(1-.2*t);return[c[0]*r,t*50,c[1]*r];};
    const pts=[];
    for(let i=0;i<8;i++){const a=pt(i,0),c=pt(i+1,0),d=pt(i+1,1),e=pt(i,1);pts.push(...a,...e,...c,...c,...e,...d);}
    const geo=new ctx.THREE.BufferGeometry();geo.setAttribute('position',new ctx.THREE.Float32BufferAttribute(pts,3));geo.computeVertexNormals();b.add(geo,m.glass);geo.dispose();
    b.box(m.stone,0,.3,0,16,.6,15);
    for(let i=0;i<8;i++){
      b.beam(m.white,pt(i,0),pt(i,1),.28,6);
      const top=pt(i,1);b.beam(m.white,top,[top[0]*.21,59,top[2]*.21],.25,6);
      for(let j=1;j<38;j++)b.beam(m.steel,pt(i,j/38),pt(i+1,j/38),.055,4);
    }
    const crown=new ctx.THREE.CylinderGeometry(1,4.8,9,8);b.add(crown,m.glass2,0,54.5,0);crown.dispose();
    b.cyl(m.white,0,59,0,.45,1.2,.6,8);
    for(const x2 of [-8,8])b.box(m.wall2,x2,2.6,0,3.6,5.2,13);
  });ctx.solid(x,z,16,15);
}

function bambooTower(ctx,x,z) {
  const {m}=ctx;
  ctx.local(x,z,0,1,b=>{
    const point=(u,t)=>{const a=u*TAU,r=6.5*Math.pow(Math.sin((.22+t*.78)*Math.PI),.57);return[Math.cos(a)*r,.3+t*45,Math.sin(a)*r];};
    surface(ctx,b,m.glass2,point,48,36);
    for(let i=0;i<28;i++)for(let j=0;j<36;j++)b.beam(m.white,point(i/28,j/36),point(i/28,(j+1)/36),.075,4);
    for(let j=1;j<32;j++)for(let i=0;i<48;i++)b.beam(m.steel,point(i/48,j/36),point((i+1)/48,j/36),.035,4);
    for(let j=28;j<36;j++)for(let i=0;i<28;i++)b.beam(m.white,point(i/28,j/36),point((i+1)/28,(j+1)/36),.055,4);
    b.cyl(m.stone,0,.2,0,8.5,9,.4,32);
  });ctx.solid(x,z,13,13);
}

function civicCenter(ctx,x,z) {
  const {m}=ctx;
  const orange=ctx.material('civic-ochre','#cdb467',.72);
  const red=ctx.material('civic-red','#b9554c',.72);
  ctx.local(x,z,0,1,b=>{
    b.box(m.stone,0,.15,0,49,.3,20);
    for(const s of [-1,1]){
      b.box(m.glass2,s*16,4.2,0,14,8.4,14);
      for(let j=0;j<4;j++)b.box(m.white,s*16,1.5+j*2,-7.1,14,.13,.14);
      for(let i=0;i<7;i++)b.box(m.white,s*16-6+i*2,4.2,7.1,.12,8.4,.15);
    }
    b.cyl(orange,-5,5.5,-1,2.3,2.3,11,32);b.box(red,5,5.5,-1,4.8,11,5);
    const wing=(u,v)=>{const xx=(u-.5)*53;return[xx,9+Math.pow(Math.abs(xx)/26.5,2.3)*5+.45*Math.cos((v-.5)*Math.PI), (v-.5)*19];};
    surface(ctx,b,m.blue,wing,40,8);
    for(let i=0;i<=40;i++)b.beam(m.white,wing(i/40,0),wing(i/40,1),.06,4);
    for(const v of [0,1])for(let i=0;i<40;i++)b.beam(m.white,wing(i/40,v),wing((i+1)/40,v),.17,6);
    for(const s of [-1,1])for(let i=0;i<5;i++)b.cyl(m.white,s*(10+i*3),4.1,8.3,.16,.2,8.2,8);
  });
  ctx.solid(x-16,z,14,14);ctx.solid(x+16,z,14,14);ctx.solid(x-5,z-1,4.6,4.6);ctx.solid(x+5,z-1,4.8,5);
}

function buildShenzhen(ctx) {
  const {m}=ctx;
  ctx.water([[-93,50],[-60,41],[-18,34],[20,29],[57,32],[93,43],[93,69],[-93,69]]);
  ctx.street([[-89,42],[-60,32],[-20,25],[20,20],[56,23],[87,33]],{width:5,trees:'palm',spacing:9});
  ctx.street([[-2,-65],[-2,-17]],{width:7,trees:'palm'});
  ctx.street([[-89,-18],[-45,-18],[-2,-18],[45,-18],[87,-18]],{width:6,trees:'broad',spacing:11});
  pingAn(ctx,-35,-41);bambooTower(ctx,43,-36);civicCenter(ctx,-4,0);
  for(const z of [-61,-43,-28])for(const x of [-81,-67,-53,12,68,83])block(ctx,x,z,7.5,8,11+ctx.random()*15);
  for(const z of [-61,-55])for(const x of [-15,24,44])block(ctx,x,z,8,5,10+ctx.random()*7);
  for(const z of [-4,12])for(const x of [-82,-67,-52,62,78])block(ctx,x,z,8,7,6+ctx.random()*10);
  for(const x of [-38,-24,36,49])block(ctx,x,17,7,5,6+ctx.random()*3);
  ctx.shop(-61,21,{name:'海风书房',width:9,depth:7,kind:'books',wall:m.white});
  ctx.road([[-61,26],[-61,32]],3);
  for(let i=0;i<25;i++)ctx.tree(-89+ctx.random()*175,i%2?-67:-(i%3===0?12:11),.55+ctx.random()*.45,'palm');
  for(let i=0;i<18;i++){
    const x=-88+i*10;
    const coastalZ=x<-60?41+(-60-x)*9/33:x<-18?34+(-18-x)*7/42:x<20?29+(20-x)*5/38:x<57?29+(x-20)*3/37:32+(x-57)*11/36;
    ctx.tree(x,coastalZ-3.5,.5,'broad');
  }
  // Mangroves along the western shallows stay rooted in small land hummocks.
  for(let i=0;i<16;i++){const x=-86+i*3.5,z=45+(i%2);ctx.island(x,z,1.5,1.0);ctx.tree(x,z,.48,'broad');}
  ctx.boat(36,51,{axis:'x',travel:12,sail:true,scale:1.1});ctx.boat(-9,57,{axis:'x',travel:9,sail:true,scale:.8});
  landmark(ctx,'ping-an','平安金融中心','PING AN FINANCE CENTRE','鹏城天际线','倒角八边形塔体向上收分，竖向巨柱延伸到尖削冠部，形成平安大厦的笔直轮廓。',-35,-41,61,15,[-19,2.95,-29]);
  landmark(ctx,'china-resources','春笋 · 华润大厦','CHINA RESOURCES TOWER','向海生长','圆形塔身中部微鼓，密集竖肋在顶端收为一点，呼应冬笋的几何形态。',43,-36,47,13,[43,2.95,-20]);
  landmark(ctx,'civic-center','市民中心','SHENZHEN CIVIC CENTER','大鹏展翅','长幅屋顶两端翘起；红色方塔与黄色圆塔立在中央，柱廊下保留通行空间。',-4,0,17,29,[-4,2.95,13]);
  landmark(ctx,'shenzhen-bay','深圳湾滨海步道','SHENZHEN BAY','红树林海岸','弯曲海岸、浅滩树丛与帆船构成深圳湾的缩景，沿棕榈步道可观看城市全景。',29,29,5,23,[25,2.95,21]);
}

function multiEaveHall(ctx,x,z,{width=14,depth=10,levels=3,storey=3.8,y=G,roofMat=ctx.m.roof,wall=ctx.m.redwood}={}){
  const {b,m}=ctx, mats={...m,roof:roofMat,tile:roofMat};
  roofMat.side=ctx.THREE.DoubleSide;
  b.box(m.stone,x,y+.3,z,width+3,.6,depth+3);
  for(let i=0;i<levels;i++){
    const w=width-i*1.45,d=depth-i*.95,yy=y+.6+i*storey;
    b.box(wall,x,yy+storey*.45,z,w*.72,storey*.9,d*.72);
    for(const s of [-1,1])for(let c=0;c<5;c++){
      const xx=x-w*.4+c*w*.2;
      b.cyl(m.redwood,xx,yy+storey*.43,z+s*d*.43,.15,.18,storey*.86,8);
      b.box(m.window,xx,yy+storey*.47,z+s*d*.37,.6,1.15,.08);
    }
    b.box(m.wood,x,yy+.45,z+d*.49,w,.12,.12);
    for(let j=0;j<=14;j++)b.box(m.redwood,x-w/2+j*w/14,yy+.52,z+d*.49,.09,.9,.09);
    roof(b,mats,x,yy+storey*.82,z,w+2.1,d+2.1,1.7,0,true);
  }
  ctx.solid(x,z,width*.75,depth*.75);
}

function aiwan(ctx,x,z,y) {
  const {b,m}=ctx, green=ctx.material('aiwan-green','#41675d',.48);
  green.side=ctx.THREE.DoubleSide;
  b.box(m.stone,x,y+.2,z,9,.4,9);
  for(const xx of [-3,3])for(const zz of [-3,3])b.box(m.stone,x+xx,y+2.3,z+zz,.48,4.4,.48);
  for(const xx of [-1.8,1.8])for(const zz of [-1.8,1.8])b.cyl(m.redwood,x+xx,y+3,z+zz,.18,.2,5.5,8);
  const mats={...m,roof:green,tile:green};
  roof(b,mats,x,y+4.2,z,10.2,10.2,2.3,0,true);
  roof(b,mats,x,y+6.25,z,7.1,7.1,2.4,0,true);
  b.cyl(m.gold,x,y+8.85,z,.05,.25,.7,8);
  ctx.sign('爱晚亭',x,y+3.55,z+3.1,2.3);
}

function luckyKnot(ctx,x,z) {
  const {m}=ctx, red=ctx.material('lucky-knot-vermilion','#c63738',.57,.22);
  ctx.bridge(x,z,52,3.2,0,'flat');
  ctx.local(x,z,0,1,b=>{
    for(let lane=0;lane<3;lane++){
      const p=(t,side=0)=>[-17.5+t*35,1.5+(5+lane*2.3)*Math.pow(Math.sin(Math.PI*t),1.3),Math.sin(t*Math.PI*2+lane*Math.PI*.7)*(2.8+lane*.55)+side];
      for(let i=0;i<56;i++)for(const s of [-1,1]){
        const a=p(i/56,s*.7),c=p((i+1)/56,s*.7),aa=[a[0],a[1]+1.15,a[2]],cc=[c[0],c[1]+1.15,c[2]];
        b.beam(red,a,c,.17,5);b.beam(red,aa,cc,.1,5);b.beam(red,a,cc,.065,4);
        if(i%2===0)b.beam(red,a,aa,.065,4);
      }
      for(let i=0;i<56;i++)b.beam(red,p(i/56,-.7),p(i/56,.7),.13,5);
    }
  });
}

function buildChangsha(ctx) {
  const {b,m}=ctx;
  ctx.water([[-10,-68],[23,-68],[23,68],[-10,68]]);
  ctx.island(6,6,7.7,48);
  ctx.road([[6,-34],[6,42]],2.8);
  ctx.street([[-17,-65],[-17,65]],{width:5,trees:'broad'});
  ctx.street([[30,-65],[30,65]],{width:5,trees:'broad'});
  ctx.bridge(6,-35,43,4,0,'flat');
  ctx.road([[-17,-35],[-15.5,-35]],4);ctx.road([[27.5,-35],[30,-35]],4);
  const hill=ctx.hill(-64,-39,25,24,11);
  const pavilionY=hill(-60,-34);
  aiwan(ctx,-60,-34,pavilionY);
  ctx.road([[-18,-23],[-31,-23],[-41,-23],[-50,-28]],3);
  multiEaveHall(ctx,44,24,{width:15,depth:10,levels:3,roofMat:ctx.material('dufu-roof','#b88654',.72)});
  ctx.lake(-58,28,23,12);
  luckyKnot(ctx,-58,28);
  ctx.road([[-87,28],[-84,28]],3.2);ctx.road([[-32,28],[-17,28]],3.2);
  ctx.street([[38,-12],[87,-12]],{width:5,trees:'broad'});
  for(const z of [-57,-40,-24,2,48,62])for(const x of [44,60,77]){
    if(z===2&&x===44)continue;
    block(ctx,x,z,8,8,z<0?10+ctx.random()*19:5+ctx.random()*7);
  }
  for(const z of [5,48,61])for(const x of [-83,-67,-50,-34])block(ctx,x,z,8,7,5+ctx.random()*7);
  for(const x of [-36,-48,-79])block(ctx,x,-59,7,6,5+ctx.random()*3,true);
  for(const [x,z] of [[-33,-43],[-32,-9],[-82,-6],[-49,-9]])block(ctx,x,z,7,6,5+ctx.random()*5,true);
  ctx.shop(67,21,{name:'湘江米粉铺',width:10,depth:7,kind:'food',wall:m.brick});
  ctx.road([[67,26],[67,35],[30,35]],3);
  ctx.sign('橘子洲',6,2.5,37,3);
  for(let i=0;i<20;i++){const zz=-29+i*3.4,xx=6+(i%2?4.4:-4.4);ctx.tree(xx,zz,.62,'broad');}
  for(let i=0;i<35;i++){const a=ctx.random()*TAU,r=11+ctx.random()*11,xx=-64+Math.cos(a)*r,zz=-39+Math.sin(a)*r;ctx.tree(xx,zz,.7+ctx.random()*.5,'broad',hill(xx,zz));}
  for(let i=0;i<32;i++)ctx.tree(i%2?-90:89,-64+ctx.random()*126,.65+ctx.random()*.35,'broad');
  for(let i=0;i<18;i++)ctx.tree(-82+i*2.8,43,.55,'blossom');
  ctx.boat(18,24,{axis:'z',travel:8,rotation:Math.PI/2,scale:.8});ctx.boat(-5,4,{axis:'z',travel:9,rotation:Math.PI/2,scale:.75});
  landmark(ctx,'orange-isle','橘子洲','ORANGE ISLE','一洲浮碧','细长洲岛位于湘江中，林荫步道串起亲水平台；两侧保留连续江面。',6,8,5,25,[6,2.95,32]);
  landmark(ctx,'aiwan-pavilion','岳麓山 · 爱晚亭','AIWAN PAVILION','丹柱碧瓦','方形石柱、内圈红柱与绿色重檐攒尖屋顶，藏在岳麓山的树梢之间。',-60,-34,pavilionY+10,17,[-44,2.95,-22]);
  landmark(ctx,'dufu-pavilion','杜甫江阁','DU FU RIVER PAVILION','江畔诗意','宽阔台基上叠起层层飞檐，木柱与栏杆围绕三层临江楼阁。',44,24,16,14,[31,2.95,26]);
  landmark(ctx,'lucky-knot','梅溪湖 · 中国结桥','LUCKY KNOT','红色流线','三条起伏的钢构线路交织成中国结意象；细部包含红色桁架与栏杆。',-58,28,13,27,[-84,2.95,28]);
}

function yellowCrane(ctx,x,z,y) {
  const {b,m}=ctx;
  const gold=ctx.material('yellow-crane-tiles','#bd9145',.59,.13),mats={...m,roof:gold,tile:gold,ridge:m.gold};
  gold.side=ctx.THREE.DoubleSide;
  b.box(m.stone,x,y+.45,z,20,.9,18);
  for(let k=0;k<5;k++){
    const w=15-k*1.45,d=13-k*1.22,yy=y+.9+k*4.1;
    b.box(m.wall2,x,yy+1.9,z,w*.68,3.8,d*.68);
    for(const s of [-1,1])for(let j=0;j<5;j++){
      const q=-.4+j*.2;
      b.cyl(m.redwood,x+q*w,yy+1.8,z+s*d*.43,.17,.18,3.6,8);
      b.box(m.window,x+q*w,yy+1.9,z+s*d*.35,.7,1.5,.08);
    }
    b.box(m.redwood,x,yy+.5,z+d*.48,w,.12,.15);
    for(let j=0;j<17;j++)b.box(m.redwood,x-w/2+j*w/16,yy+.54,z+d*.48,.075,1.0,.075);
    roof(b,mats,x,yy+3.2,z,w+3,d+3,1.95,0,true);
  }
  b.cyl(m.gold,x,y+23.7,z,.05,.32,1,8);
  ctx.solid(x,z,12,10);
}

function yangtzeBridge(ctx,x,z) {
  const {m}=ctx;
  ctx.bridge(x,z,42,6,0,'flat');
  ctx.local(x,z,0,1,b=>{
    // Road deck above railway deck; continuous triangulated side girders.
    b.box(m.dark,0,.65,0,42,.25,5.4);
    for(const q of [-1.6,-.9,.9,1.6])b.box(m.steel,0,.83,q,42,.07,.07);
    for(const s of [-1,1]){
      b.box(m.steel,0,2.2,s*3,42,.22,.25);
      b.box(m.steel,0,5.7,s*3,42,.24,.24);
      for(let i=0;i<=14;i++){
        const a=-21+i*3;
        b.beam(m.steel,[a,2.2,s*3],[a,5.7,s*3],.12,5);
        if(i<14)b.beam(m.steel,[a,2.2,s*3],[a+3,5.7,s*3],.12,5);
      }
    }
    for(const q of [-12,0,12])b.box(m.stone,q,.1,0,2,2.2,7.5);
    for(const s of [-1,1]){
      for(const edge of [-1,1])b.box(m.stone,s*19.5,3.4,edge*4.2,3,6.8,1.8);
      b.box(m.wall,s*19.5,7.3,0,4,1,9);
      b.box(m.dark,s*19.5,8,0,4.5,.45,9.5);
      for(const zz of [-3,0,3])b.box(m.window,s*19.5,5.7,zz,.1,1.4,1);
    }
  });
}

function buildWuhan(ctx) {
  const {b,m}=ctx;
  ctx.water([[-15,-68],[17,-68],[17,68],[-15,68]]);
  ctx.street([[-22,-65],[-22,65]],{width:5,trees:'broad'});
  ctx.street([[24,-64],[24,64]],{width:5,trees:'broad'});
  yangtzeBridge(ctx,1,16);
  ctx.road([[-22,16],[-20,16]],6);ctx.road([[22,16],[24,16]],6);
  const hill=ctx.hill(51,-30,27,20,8);
  const towerY=hill(47,-31);
  yellowCrane(ctx,47,-31,towerY);
  ctx.road([[24,-8],[36,-8],[47,-12]],3);
  multiEaveHall(ctx,-44,-9,{width:16,depth:11,levels:2,storey:4.2,roofMat:m.roof});
  // A courtyard and flanking hall roofs make Qingchuan a complex, not a second tower.
  for(const x of [-61,-28])ctx.house(x,-12,7,14,4,0,{wall:m.wall2,lantern:true});
  ctx.road([[-44,-1],[-44,8],[-22,8]],3);
  ctx.lake(66,42,24,16);ctx.island(66,42,7,4);
  ctx.pavilion(66,42,2.3,G,1);
  ctx.bridge(45,42,29,3.3,0,'flat');
  ctx.road([[24,42],[30.5,42]],3.3);ctx.road([[59.5,42],[66,42]],3.3);
  for(const z of [-56,-38,30,46,62])for(const x of [-81,-66,-50,-35])block(ctx,x,z,8,7,6+ctx.random()*13,z<0);
  for(const z of [-60,6,23,64])for(const x of [38,54,74,88]){
    if(z===23&&x>54)continue;block(ctx,x,z,7,6,7+ctx.random()*11);
  }
  for(const x of [78,89])block(ctx,x,-43,7,7,9+ctx.random()*10);
  ctx.shop(-62,12,{name:'汉口热干面',width:10,depth:7,kind:'food',wall:m.brick});
  ctx.road([[-62,17],[-62,23],[-22,23]],3);
  for(let i=0;i<28;i++){const a=ctx.random()*TAU,r=12+ctx.random()*11,xx=51+Math.cos(a)*r,zz=-30+Math.sin(a)*r;ctx.tree(xx,zz,.65+ctx.random()*.3,'broad',hill(xx,zz));}
  for(let i=0;i<36;i++)ctx.tree(i%2?-90:91,-64+ctx.random()*125,.6+ctx.random()*.35,'broad');
  for(let i=0;i<22;i++){const a=i/22*TAU;ctx.tree(66+Math.cos(a)*26,42+Math.sin(a)*18,.65,'blossom');}
  ctx.boat(4,-45,{axis:'z',travel:9,rotation:Math.PI/2,scale:1.3});ctx.boat(-6,44,{axis:'z',travel:8,rotation:Math.PI/2,scale:1});
  landmark(ctx,'yellow-crane-tower','黄鹤楼','YELLOW CRANE TOWER','黄鹤凌空','蛇山之上，五层楼身层层收分，金黄色琉璃瓦与舒展飞檐遥望长江。',47,-31,towerY+25,21,[36,2.95,-8]);
  landmark(ctx,'yangtze-bridge','武汉长江大桥','YANGTZE RIVER BRIDGE','一桥飞架','双层桥体、连续钢桁架与端部桥头堡构成第一座长江公铁两用大桥的缩影。',1,16,11,26,[25,2.95,16]);
  landmark(ctx,'qingchuan','晴川阁','QINGCHUAN PAVILION','隔江相望','双层楼阁连着两侧院落，与黄鹤楼分据长江两岸。',-44,-9,13,20,[-44,2.95,6]);
  landmark(ctx,'east-lake','东湖樱径','EAST LAKE','湖光花影','以湖面、樱花步道与水榭表现东湖园景，可步行到湖心小亭。',66,42,7,24,[32,2.95,42]);
}

export const cities = {
  shanghai: {name:'上海',en:'SHANGHAI',subtitle:'浦江双岸 · 万象天际',intro:'循着黄浦江的弯道，从外滩钟楼走到陆家嘴。螺旋、开窗、退台与球体，五种轮廓组成一座微缩上海。',stamp:'沪',coordinates:'31.2304° N · 121.4737° E',region:'长江三角洲',spawn:[-27,42],palette:{water:'#6b9f9e',grass:'#93aa83',roof:'#5a625d'},build:buildShanghai},
  guangzhou: {name:'广州',en:'GUANGZHOU',subtitle:'珠水流光 · 花城晚风',intro:'广州塔的钢网映着珠江，大剧院像两枚江岸石砾。沿白色拱桥过江，在骑楼廊下歇一杯茶。',stamp:'穗',coordinates:'23.1291° N · 113.2644° E',region:'岭南',spawn:[14,34],palette:{water:'#65a59e',grass:'#86a476',roof:'#676b58'},build:buildGuangzhou},
  shenzhen: {name:'深圳',en:'SHENZHEN',subtitle:'大鹏展翼 · 向海生长',intro:'尖削塔冠与春笋曲面勾出鹏城天际线。穿过市民中心的翼形屋顶，沿红树林与海风走到深圳湾。',stamp:'深',coordinates:'22.5431° N · 114.0579° E',region:'岭南',spawn:[-4,13],palette:{water:'#6aaab3',grass:'#8fb37b',roof:'#607a73'},build:buildShenzhen},
  changsha: {name:'长沙',en:'CHANGSHA',subtitle:'湘江北去 · 岳麓晚红',intro:'湘江绕过细长橘子洲，岳麓山下藏着丹柱碧瓦。江阁、米粉铺与交织的中国结桥，接起山水和城市的烟火。',stamp:'湘',coordinates:'28.2282° N · 112.9388° E',region:'湖湘',spawn:[30,35],palette:{water:'#70a69c',grass:'#91a97a',roof:'#5e695b'},build:buildChangsha},
  wuhan: {name:'武汉',en:'WUHAN',subtitle:'江城三镇 · 白云黄鹤',intro:'登临蛇山看五层金色飞檐，沿钢桁架大桥横越长江。隔江晴川与东湖花影，留下一段可以慢慢走的江城。',stamp:'汉',coordinates:'30.5928° N · 114.3055° E',region:'荆楚',spawn:[-22,23],palette:{water:'#7da8a4',grass:'#9ba77e',roof:'#66625a'},build:buildWuhan},
};
