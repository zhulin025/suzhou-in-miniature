import { ModelBuilder, roof, slab, polygonShape } from '../geometry.js';

// Eight distinct, geographically compressed city compositions. See docs/cities-expansion.md.
const G=1.1, TAU=Math.PI*2;
const mark=(c,id,name,en,x,z,height=15,radius=13,desc='',walk)=>c.landmark({id,name,en,x,z,height,radius,tag:name,desc,walk});
function hall(c,x,z,w,d,h,wall=c.m.wall,roofMat=c.m.roof,y=G){
 const {b,m}=c;b.box(m.stone,x,y+.25,z,w+1,.5,d+1);b.box(wall,x,y+h/2,z,w,h,d);
 for(const s of [-1,1])for(let a=-w/2+1;a<w/2;a+=2){b.box(m.wood,x+a,y+h*.48,z+s*(d/2+.06),.9,h*.57,.13);b.box(m.window,x+a,y+h*.53,z+s*(d/2+.15),.6,h*.35,.08);}
 roof(b,{...m,roof:roofMat},x,y+h,z,w+2,d+2,Math.min(3,w*.19));if(y<=G+.5)c.solid(x,z,w,d);
}
function block(c,x,z,w=7,d=7,h=8,style='flat',y=G){
 const {b,m}=c,wall=style==='red'?m.brick:style==='tibet'?m.white:m.wall2;
 b.box(wall,x,y+h/2,z,w,h,d);b.box(m.stone,x,y+.2,z,w+.4,.4,d+.4);
 for(let yy=1.8;yy<h;yy+=2.3)for(let xx=-w/2+1;xx<w/2;xx+=1.8)for(const s of [-1,1]){
  b.box(style==='tibet'?m.dark:m.trim,x+xx,y+yy,z+s*(d/2+.05),1.12,1.45,.1);
  b.box(m.window,x+xx,y+yy,z+s*(d/2+.12),.68,.95,.08);
 }
 if(style==='euro'||style==='red'){
  const g=new c.THREE.CylinderGeometry(0,1,1,4);b.add(g,m.roof,x,y+h+1.1,z,w*.8,2.2,d*.8,Math.PI/4);g.dispose();
  b.box(m.white,x,y+h-.15,z,w+.5,.4,d+.5);b.box(m.brick,x+w*.2,y+h+1.8,z-1,.65,2,.65);
 }else {b.box(style==='tibet'?m.redwood:m.trim,x,y+h,z,w+.3,.38,d+.3);b.box(m.stone,x+w*.23,y+h+.3,z,w*.28,.4,d*.35);}
 c.solid(x,z,w,d);
}
function grove(c,points,type='broad',scale=.8){for(const [x,z]of points)c.tree(x,z,scale*(.8+c.random()*.35),type);}
function rows(c,xs,zs,style='flat',height=8){for(const x of xs)for(const z of zs)block(c,x,z,6.5,6, height+c.random()*3,style);}
function circle(c,mat,x,y,z,r,t=.1,n=36){for(let i=0;i<n;i++){const a=i/n*TAU,d=(i+1)/n*TAU;c.b.beam(mat,[x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(d)*r,y,z+Math.sin(d)*r],t,5);}}
function arch(c,x,z,w,h,d,mat=c.m.stone,y=G){
 const s=new c.THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h);s.lineTo(-w/2,h);s.closePath();
 const hole=new c.THREE.Path();hole.moveTo(-w*.27,0);hole.lineTo(-w*.27,h*.45);hole.absarc(0,h*.45,w*.27,Math.PI,0,true);hole.lineTo(w*.27,0);hole.closePath();s.holes.push(hole);
 const g=new c.THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:18});c.b.add(g,mat,x,y,z-d/2);g.dispose();
 c.solid(x-w*.39,z,w*.22,d);c.solid(x+w*.39,z,w*.22,d);
}
function facadeArcade(c,x,z,w,h,d){
 const {b,m}=c;b.box(m.wall,x,G+h/2,z,w,h,d);
 for(let a=-w/2+1.4;a<w/2;a+=2.8){arch(c,x+a,z+d/2+.4,2.5,3.2,.8,m.wall);b.box(m.window,x+a,6.3,z+d/2+.05,1.15,1.8,.1);b.box(m.trim,x+a,5.2,z+d/2+.4,1.8,.13,1);}
 b.box(m.white,x,G+h,z,w+.6,.4,d+.6);c.solid(x,z,w,d);
}
function customTerrain(c,x,z,rx,rz,height,mat,shape='dune'){
 const sample=(xx,zz)=>{const u=(xx-x)/rx,v=(zz-z)/rz,q=Math.max(0,1-u*u-v*v);return G+height*Math.pow(q,shape==='dune'?1.6:.6)*(shape==='dune'?(1+.17*Math.sin(u*5+v*2)):1);};
 const g=new c.THREE.PlaneGeometry(rx*2,rz*2,40,30);g.rotateX(-Math.PI/2);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const a=p.getX(i)+x,d=p.getZ(i)+z;p.setXYZ(i,a,sample(a,d),d);}g.computeVertexNormals();c.b.add(g,mat);g.dispose();c.terrain(sample);return sample;
}
function seating(c,x,z){const {b,m}=c;for(let k=0;k<3;k++)b.box(m.wood,x,1.7,z+k*.2,3,.12,.14);for(const s of [-1,1])b.box(m.dark,x+s*1.1,1.35,z+.2,.16,.6,.6);}
function kiosk(c,x,z,name,kind='food'){c.shop(x,z,{name,kind,roofStyle:c.shopStyle});c.road([[x,z+5],[x,z+10]],3);seating(c,x+5.5,z+6);}
function people(c,points){for(const [x,z]of points){const {b,m}=c;b.cyl(m.redwood,x,1.9,z,.2,.26,.9,7);b.sphere(m.sail,x,2.55,z,.22);for(const s of [-1,1])b.beam(m.dark,[x+s*.1,1.5,z],[x+s*.12,1.15,z],.07);}}

function chongqing(c){
 const {b,m}=c;
 // Two river arms meet in front of the Yuzhong peninsula.
 c.water([[-89,-42],[-55,-35],[-49,-23],[-7,-17],[16,-8],[60,11],[88,19],[89,38],[43,32],[2,7],[-28,-13],[-90,-22]]);
 c.water([[-89,26],[-48,12],[-13,15],[25,38],[87,44],[88,62],[21,57],[-17,33],[-48,31],[-89,44]]);
 c.street([[-86,-55],[-12,-55],[47,-41],[84,-36]],{width:6});
 c.street([[-84,0],[-36,-1],[-7,4]],{width:5,trees:false});
 c.street([[-82,55],[-37,53],[0,64],[78,66]],{width:4,trees:false});
 c.bridge(-61,-29,40,5,-Math.PI/2,'flat');c.road([[-61,-55],[-61,-49]],5);c.road([[-61,-9],[-61,0]],5);
 c.bridge(-61,29,42,5,-Math.PI/2,'flat');c.road([[-61,0],[-61,8]],5);c.road([[-61,50],[-61,55]],5);
 // Thousand-stilt-house silhouette: stepped terraces, balconies, raised roofline.
 b.box(m.rock,-31,-.8,-37,39,7,18);
 for(let level=0;level<4;level++){
  const y=G+level*4.2,z=-28-level*3.2,w=35-level*4;
  hall(c,-30,z,w,5.8,3.7,m.redwood,m.roof,y);
  b.box(m.wood,-30,y+.25,z+3.9,w+2,.3,2);
  for(let a=-w/2;a<=w/2;a+=2.2){b.box(m.gold,-30+a,y+1.1,z+4.8,.12,1.7,.12);b.sphere(m.lantern,-30+a,y+2.7,z+4.1,.32,.48,.32);}
  b.beam(m.gold,[-30-w/2,y+1.8,z+4.8],[-30+w/2,y+1.8,z+4.8],.08);
 }
 // Qiansimen-inspired cable stayed bridge, with accessible deck below.
 for(const zz of [-42,-17]){b.box(m.red,-61,12,zz,1.1,22,1.2);for(const off of [-10,-6,-2,2,6,10])b.beam(m.red,[-61,22,zz],[-61,2,zz+off],.07);}
 for(const x of [1,14,27,40])c.tower(x,-28,7,8,31+Math.sin(x)*5,{style:'taper'});
 b.box(m.glass2,20,35,-28,51,4,10);for(let x=-3;x<46;x+=2)b.box(m.steel,x,35,-22.9,.15,4,.12);
 // Animated cable car follows a suspended cable over the lower river.
 const from=[-25,23,0],to=[10,18,64];b.beam(m.steel,from,to,.08);
 for(const p of [from,to]){b.box(m.concrete,p[0],p[1]/2,p[2],1,p[1],1);b.box(m.red,p[0],p[1]-2,p[2],5,2,4);}
 const car=new c.THREE.Group(),bb=new ModelBuilder(car);bb.box(m.red,0,0,0,3.7,2.7,2.8);bb.box(m.glass2,0,.35,0,3.85,1.2,2.9);bb.box(m.white,0,1.45,0,4,.22,3);bb.beam(m.steel,[0,1.5,0],[0,3.3,0],.1);bb.finish();c.root.add(car);
 c.onUpdate(t=>{const f=.5+.42*Math.sin(t*.18);car.position.set(from[0]+(to[0]-from[0])*f,from[1]+(to[1]-from[1])*f-3.3,from[2]+(to[2]-from[2])*f);});
 rows(c,[-80,-68,-55,-42,-29,-16],[-64], 'flat',13);
 const slope=customTerrain(c,67,-61,23,10,13,m.hill);
 for(const x of [52,66,80]){block(c,x,-62,6,5,8,'flat',slope(x,-62));c.tree(x-5,-62,.8,'broad',slope(x-5,-62));}
 rows(c,[56,70,83],[-48], 'flat',20);
 for(const x of [-78,-45,-32]){block(c,x,-9,7,5,9);block(c,x,42,7,5,12);}
 rows(c,[35,49,63,77],[57],'flat',10);kiosk(c,-80,47,'山城小面');kiosk(c,-41,58,'江畔茶馆','tea');
 for(const z of [-7,41])c.boat(27,z,{axis:'x',travel:8,rotation:Math.PI/2});
 mark(c,'hongya','洪崖洞','HONGYA CAVE',-30,-35,22,22,'悬崖上的吊脚楼层层退台，木廊与暖灯沿江展开。',[-30,3,-16]);
 mark(c,'qiansimen','千厮门大桥意象','QIANSIMEN BRIDGE',-61,-29,23,19,'斜拉索与桥塔跨越嘉陵江意象河道，桥面可步行。',[-61,3,-10]);
 mark(c,'chaotianmen','朝天门天际线','CHAOTIANMEN',21,-28,40,24,'高楼与横向连廊勾勒两江交汇处的现代轮廓。',[27,3,-11]);
 mark(c,'cable','长江索道','YANGTZE CABLEWAY',-25,0,24,13,'红色轿厢沿索道来回运行，可在江岸近看。',[-17,3,0]);
}

function xian(c){
 const {b,m}=c,stone=c.material('xian-wall','#8f9285');
 c.street([[-66,0],[66,0]],{width:7,trees:'broad'});c.street([[0,-61],[0,63]],{width:7});
 // Rectangular city wall with four real gate openings.
 for(const z of [-48,48]){
  for(const x of [-40,40]){b.box(stone,x,4.5,z,62,7,3);c.solid(x,z,62,3);}
  arch(c,0,z,18,7,4,stone);hall(c,0,z,21,8,4.5,m.redwood,m.roof,8.1);
  for(let x=-70;x<=70;x+=3)if(Math.abs(x)>10)b.box(m.stone,x,8.4,z,1.5,.9,3.4);
 }
 for(const x of [-72,72]){b.box(stone,x,4.5,0,3,7,99);c.solid(x,0,3,99);for(let z=-48;z<=48;z+=3)b.box(m.stone,x,8.4,z,3.4,.9,1.5);}
 // Zhonglou: raised arched masonry plinth, triple golden-green eaves.
 arch(c,-30,12,19,7,16,stone);for(let l=0;l<3;l++)hall(c,-30,12,18-l*3.2,14-l*2.3,2.8,m.redwood,m.roof,8+l*3.5);
 // Big Wild Goose Pagoda has square masonry tiers, restrained projecting cornices.
 const px=39,pz=-24;
 for(let l=0;l<7;l++){const w=12-l*.85,yy=G+l*4.1;b.box(m.wall2,px,yy+2,pz,w,4,w);b.box(m.trim,px,yy+4,pz,w+.7,.35,w+.7);for(const side of [-1,1]){b.box(m.dark,px,yy+1.9,pz+side*(w/2+.03),1.2,2.4,.09);}}
 b.cyl(m.gold,px,31,pz,.05,.35,2,8);c.solid(px,pz,13,13);
 for(const z of [-37,-12])hall(c,39,z,23,6,4.5,m.redwood);
 // Tang-style palace axis and terraced square.
 for(let i=0;i<4;i++)b.box(m.stone,-37,G+i*.25,-28,28-i*2,.3,18-i*2);
 hall(c,-37,-28,22,12,6,m.redwood);for(const x of [-54,-20])hall(c,x,-29,6,17,4,m.redwood);
 rows(c,[-59,-47,-35,-23],[-10,32],'flat',5);rows(c,[16,29,42,55],[17,31],'flat',5);
 for(const x of [-57,-43,-29,25,40,55])c.house(x,-60,8,6,4,0,{lantern:true});
 c.street([[-62,41],[62,41]],{width:3,trees:false});kiosk(c,-54,25,'长安面坊');kiosk(c,54,52,'城南书肆','books');
 grove(c,[[-62,-35],[-60,14],[-15,-37],[17,-36],[59,-35],[62,8],[-19,22],[16,52],[31,58],[70,59]],'broad',1);
 people(c,[[-3,35],[5,18],[-7,-14],[-26,2],[35,-6]]);
 mark(c,'wall','永宁门与城墙','CITY WALL',0,48,16,21,'连续城墙围合古城，门洞是真实几何开口，可沿中轴穿行。',[0,3,61]);
 mark(c,'bell','钟楼','BELL TOWER',-30,12,22,17,'拱券台基与层叠檐口构成钟楼轮廓，近看可见窗棂与瓦脊。',[-30,3,27]);
 mark(c,'goose','大雁塔','GIANT WILD GOOSE PAGODA',39,-24,32,17,'方形七层砖塔，逐层收分；以简洁檐口区别于楼阁式宝塔。',[39,3,0]);
 mark(c,'tang','唐式宫阙意象','TANG PALACE',-37,-28,13,20,'宽阔台基、红柱殿堂与两侧廊庑，演绎长安宫阙的秩序。',[-37,3,-15]);
}

function karst(c,x,z,rx,rz,h){
 const {b,m}=c;customTerrain(c,x,z,rx,rz,h,m.hill,'karst');
 // Vertical limestone ribs follow the peak rather than using smooth cones.
 for(let k=0;k<10;k++){const a=k/10*TAU,r=.55+.16*Math.sin(k*4);b.ico(k%3?m.hill:m.rock,x+Math.cos(a)*rx*r,G+h*.42,z+Math.sin(a)*rz*r,rx*.27,h*.42,rz*.27,a);}
 c.solid(x,z,rx*1.65,rz*1.65);
}
function guilin(c){
 const {b,m}=c;
 c.water([[-14,-67],[11,-67],[16,-37],[33,-13],[28,14],[4,40],[1,65],[-20,65],[-21,37],[5,8],[9,-10],[-9,-33]]);
 for(const p of [[-71,-44,13,12,33],[-48,-53,11,11,45],[-25,-50,9,10,29],[36,-54,10,11,35],[61,-44,13,12,46],[80,-19,9,11,29],[-73,10,12,12,25],[65,25,13,12,36]])karst(c,...p);
 c.street([[-60,-20],[-34,-10],[-31,22],[-27,36],[-28,51]],{width:4,trees:'broad'});
 c.street([[45,-30],[47,-7],[47,18],[32,46],[29,62]],{width:4,trees:'broad'});
 c.bridge(-6,24,59,4,0,'flat');c.road([[-31,22],[-31,24]],4);c.road([[23.5,24],[40,24],[47,18]],4);
 // Elephant Trunk Hill: a rock silhouette with an actual opening under the trunk.
 const sh=new c.THREE.Shape();sh.moveTo(-16,0);sh.lineTo(17,0);sh.bezierCurveTo(14,7,15,16,7,18);sh.bezierCurveTo(0,30,-15,26,-17,12);sh.closePath();
 const hole=new c.THREE.Path();hole.absellipse(7,6.6,5,5.3,0,TAU,true);sh.holes.push(hole);
 const geo=new c.THREE.ExtrudeGeometry(sh,{depth:12,bevelEnabled:true,bevelThickness:.5,bevelSize:.4,bevelSegments:2,curveSegments:24});b.add(geo,m.hill2,-15,G,-16);geo.dispose();
 c.solid(-22,-10,19,14);c.solid(0,-10,5,14);
 c.pagoda(-23,-11,{levels:2,radius:1.5,storey:2,wall:m.stone,roof:m.stone,y:27});
 c.lake(-59,39,17,12);c.island(-59,39,8,5);c.bridge(-59,27,18,3,-Math.PI/2,'flat');
 c.pagoda(-63,39,{levels:7,radius:2.4,storey:2.4,roof:m.gold});c.pagoda(-55,39,{levels:6,radius:2,storey:2.3,roof:m.steel});
 c.road([[-59,18],[-59,24]],3);c.road([[-59,18],[-31,18]],3);
 rows(c,[-84,-72,-60,-48],[-10],'flat',5);rows(c,[60,73,85],[1,53],'flat',6);
 for(const x of [-78,-64,-49])c.house(x,60,8,6,4,0,{lantern:true});
 kiosk(c,-38,39,'漓岸米粉');kiosk(c,45,48,'山水书屋','books');
 c.boat(1,-40,{travel:7,axis:'z'});c.boat(15,0,{travel:6,axis:'z'});c.boat(-7,50,{travel:8,axis:'z'});
 grove(c,[[-86,29],[-81,47],[-40,60],[24,56],[53,38],[39,-42],[80,40],[-37,5]],'broad',1);
 mark(c,'elephant','象鼻山','ELEPHANT TRUNK HILL',-15,-10,30,22,'石山与伸向江面的象鼻围出水月洞，洞口由真实穿孔几何构成。',[-24,3,7]);
 mark(c,'river','漓江峰林','LI RIVER',42,-45,43,24,'石灰岩峰林疏密相间，漓江从山间穿过，游船缓缓行进。',[46,3,-28]);
 mark(c,'twin','日月双塔意象','SUN AND MOON PAGODAS',-59,39,21,17,'金银两色塔影落入湖中，步行桥连接艺术化湖心观景点。',[-59,3,34]);
 mark(c,'village','漓岸街巷','RIVERSIDE LANES',-38,39,8,15,'低矮街屋、米粉小店与树荫步道相连，可以走进店里。',[-38,3,49]);
}

function onion(c,x,y,z,r,h,mat){
 const pts=[[0,0],[r*.68,0],[r*.7,h*.12],[r,h*.34],[r*.96,h*.52],[r*.65,h*.7],[r*.24,h*.89],[0,h]].map(p=>new c.THREE.Vector2(...p));
 const g=new c.THREE.LatheGeometry(pts,32);c.b.add(g,mat,x,y,z);g.dispose();
 c.b.beam(c.m.gold,[x,y+h,z],[x,y+h+2,z],.08);c.b.beam(c.m.gold,[x-.6,y+h+1.3,z],[x+.6,y+h+1.3,z],.08);
}
function harbin(c){
 c.shopStyle='gable';
 const {b,m}=c;
 c.water([[-88,-61],[87,-61],[88,-39],[-88,-32]]);
 // Frozen river is pale blue, surrounded by a snow-colored city tile.
 c.street([[-11,60],[-11,-26]],{width:9,trees:'pine',spacing:13});c.street([[-81,10],[81,10]],{width:6,trees:'pine'});
 c.bridge(0,-47,37,5,-Math.PI/2,'flat');c.road([[0,-28],[-11,-26]],5);c.road([[0,-65],[0,-66]],5);
 // St Sophia: cruciform red masonry body, drum, onion dome and bell tower.
 const sx=29,sz=30;
 b.box(m.brick,sx,7.1,sz,22,12,14);b.box(m.brick,sx,6,sz,13,10,26);
 for(const x of [sx-9,sx+9])for(const z of [sz-5,sz+5]){b.box(m.trim,x,8,z,1,14,1);onion(c,x,14,z,1.4,3,m.roof);}
 b.cyl(m.brick,sx,16,sz,6,7,9,16);onion(c,sx,20,sz,7,12,m.roof);
 for(let i=0;i<12;i++){const a=i/12*TAU;b.box(m.window,sx+Math.cos(a)*6.05,16,sz+Math.sin(a)*6.05,1,3,.15,-a+Math.PI/2);}
 arch(c,sx,sz+14,8,9,3,m.brick);b.box(m.brick,sx,13,sz+14,6,8,5);onion(c,sx,17,sz+14,3.4,7,m.roof);
 for(const x of [sx-7,sx+7])b.box(m.window,x,7,sz+7.05,2,5,.15);
 c.solid(sx,sz,22,26);
 // Glowing translucent-looking solid ice towers (depth-correct opaque ice).
 const ice=c.material('ice-cyan','#9ccfd8',.23,.18),ice2=c.material('ice-blue','#87b4d2',.2,.1);
 ice.emissive=new c.THREE.Color('#38a3c7');ice2.emissive=new c.THREE.Color('#6572db');
 c.onUpdate((t,n)=>{ice.emissiveIntensity=n*.8;ice2.emissiveIntensity=n*.7;});
 const ix=49,iz=-19;
 for(const x of [ix-18,ix,ix+18]){const h=x===ix?20:13;b.box(ice,x,G+h/2,iz,7,h,7);b.cyl(ice2,x,G+h+3,iz,0,5,6,4);for(let y=3;y<h;y+=3)b.box(m.white,x,y,iz+3.6,6,.12,.1);c.solid(x,iz,7,7);}
 for(const x of [ix-9,ix+9])arch(c,x,iz,11,8,3,ice2);
 b.box(ice,ix,1.3,iz+12,48,.5,12);
 rows(c,[-72,-56,-40],[34,49,-15], 'euro',8);rows(c,[23,38,53,68],[60],'euro',7);
 for(const x of [-73,-56,-39])block(c,x,3,10,9,12,'red');
 kiosk(c,-26,32,'雪街面包坊');kiosk(c,-84,51,'松江书屋','books');
 // Railway truss detail at the upstream river edge.
 c.bridge(-62,-47,38,5,-Math.PI/2,'flat');for(const x of [-65,-59]){b.beam(m.dark,[x,6,-66],[x,6,-28],.2);for(let z=-65;z<-29;z+=5){b.beam(m.dark,[x,1.7,z],[x,6,z+5],.12);b.beam(m.dark,[x,6,z],[x,1.7,z+5],.12);}}
 grove(c,[[81,-24],[82,3],[83,39],[-84,-22],[-83,39],[9,57],[10,38],[12,-16]],'pine',1);
 const snowGeo=new c.THREE.BufferGeometry(),positions=[];for(let i=0;i<160;i++)positions.push((c.random()-.5)*180,4+c.random()*42,(c.random()-.5)*130);snowGeo.setAttribute('position',new c.THREE.Float32BufferAttribute(positions,3));const snow=new c.THREE.Points(snowGeo,new c.THREE.PointsMaterial({color:0xffffff,size:.24}));c.root.add(snow);
 c.onUpdate(t=>{const p=snowGeo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,4+((positions[i*3+1]-4-t*.7)%42+42)%42);p.needsUpdate=true;});
 mark(c,'sophia','圣索菲亚教堂','SAINT SOPHIA',sx,sz,35,24,'红砖墙体、十字形平面与洋葱形穹顶，构成雪地中的城市地标。',[29,3,50]);
 mark(c,'central','中央大街意象','CENTRAL STREET',-40,3,15,20,'欧式街屋、雪覆屋顶与面包小店沿步行街排列。',[-20,3,3]);
 mark(c,'ice','冰雪大世界意象','ICE AND SNOW',ix,iz,26,26,'冰塔与拱门以透亮蓝色组合，夜间渐亮；为原创冰雕编排。',[49,3,-5]);
 mark(c,'rail','松花江铁路桥意象','SONGHUA RAIL BRIDGE',-62,-47,8,22,'细密钢桁架跨过浅蓝色冬日江面，桥面可步行。',[-62,3,-25]);
}

function xiamen(c){
 c.shopStyle='gable';
 const {b,m}=c;
 // Curved shoreline encloses a broad channel and the real island is separate.
 c.water([[-90,-60],[-27,-60],[-23,-36],[-9,-12],[5,8],[28,29],[86,39],[89,64],[-88,65],[-90,43]]);
 c.island(-53,22,30,27);
 c.street([[0,-52],[17,-28],[26,-7],[45,14],[78,26]],{width:6,trees:'palm',spacing:12});
 c.road([[-78,17],[-76,29],[-67,42],[-51,46],[-34,39],[-27,24],[-31,7],[-49,-3],[-69,2],[-78,17]],3);
 // Sunlight Rock is deliberately irregular, with a small viewing balustrade.
 b.ico(m.rock,-61,7,18,8,6,6);b.ico(m.stone,-59,11,17,5.8,7.8,4.5);b.box(m.paving,-59,18.3,17,7,.5,5);
 for(const z of [14.5,19.5]){b.beam(m.white,[-62.5,19.5,z],[-55.5,19.5,z],.08);for(let x=-62.5;x<-55;x+=1)b.box(m.white,x,18.9,z,.09,1.2,.09);}c.solid(-60,18,15,12);
 // Eight Trigrams mansion: veranda, radial drum and red domed roof.
 const x=-42,z=20;
 facadeArcade(c,x,z,16,7.8,10);b.cyl(m.wall,x,11,z,5.5,5.8,6,8);
 for(let i=0;i<8;i++){const a=(i+.5)/8*TAU;b.box(m.window,x+Math.cos(a)*5.5,11,z+Math.sin(a)*5.5,1.6,2.3,.12,-a+Math.PI/2);}
 const dome=new c.THREE.SphereGeometry(6.4,24,12,0,TAU,0,Math.PI/2);b.add(dome,m.roof,x,14,z,1,.7,1);dome.dispose();b.cyl(m.white,x,18.4,z,.6,.9,1.2,8);
 // Sail-shaped twin towers: custom asymmetric swept volumes, not boxes.
 for(const [tx,tz,h]of [[50,-24,48],[65,-18,43]]){
  const sh=new c.THREE.Shape();sh.moveTo(-5,0);sh.lineTo(6,0);sh.bezierCurveTo(7,h*.45,2,h*.82,-3,h);sh.lineTo(-5,0);
  const g=new c.THREE.ExtrudeGeometry(sh,{depth:7,bevelEnabled:false,curveSegments:30});b.add(g,m.glass,tx,G,tz-3.5);g.dispose();
  for(let y=3;y<h-2;y+=1.5){const w=10*(1-y/h)+1.5;b.box(m.steel,tx-.5,y+G,tz+3.56,w,.065,.1);}
  c.solid(tx,tz,13,9);
 }
 rows(c,[21,34,47],[-62,-47],'flat',9);rows(c,[38,52,67,81],[-54],'flat',13);
 for(const [x,z]of [[-66,33],[-58,6],[-43,5],[-36,29],[-72,22],[-67,9]])block(c,x,z,6,5,6,'red');
 for(const x of [39,53,67,81])facadeArcade(c,x,-5,10,7,7);
 kiosk(c,24,9,'海风沙茶面');kiosk(c,-53,29,'岛上书房','books');
 grove(c,[[-78,16],[-64,44],[-47,46],[-32,18],[-49,5],[-73,28],[-20,-54],[82,-39],[85,17],[5,-9],[34,29]],'palm',.9);
 c.boat(-6,34,{scale:1.8,axis:'z',travel:12});c.boat(47,49,{scale:1.3,axis:'x',travel:17,sail:true});
 mark(c,'rock','鼓浪屿日光岩','SUNLIGHT ROCK',-60,18,20,18,'海岛上的花岗岩高点与观景平台，周围铺开红瓦街巷。',[-72,3,17]);
 mark(c,'bagua','八卦楼','BAGUA MANSION',-42,20,20,16,'红色穹顶、八角鼓座与外廊构成鼓浪屿的建筑轮廓。',[-42,3,33]);
 mark(c,'sails','双子塔','TWIN SAIL TOWERS',57,-22,50,24,'两片弯曲的帆形体量面向海湾，立面按楼层刻画。',[59,3,-4]);
 mark(c,'coast','环岛海岸','ISLAND COAST',45,25,8,22,'棕榈步道与海湾帆影。鼓浪屿没有虚构陆桥，可从地标漫游入口上岛。',[45,3,21]);
}

function swallowRoof(c,x,z,w,d,y){
 const {b,m}=c;roof(b,{...m,roof:m.roof},x,y,z,w,d,2.2);
 // Paired rising ridge tails distinguish Minnan roofs from Jiangnan roofs.
 for(const side of [-1,1]){const a=[x+side*w*.28,y+2.3,z],e=[x+side*w*.46,y+4,z];b.beam(m.white,a,e,.15);b.beam(m.brick,[e[0],e[1]-.1,z],[e[0]+side*.6,e[1]+.5,z],.11);}
}
function minnan(c,x,z,w=8,d=6,h=4){
 const {b,m}=c;b.box(m.brick,x,G+h/2,z,w,h,d);b.box(m.white,x,G+.4,z,w+.1,.4,d+.1);
 for(const a of [-w*.3,0,w*.3]){b.box(m.white,x+a,G+h*.48,z+d/2+.04,1.4,h*.68,.15);b.box(a===0?m.wood:m.window,x+a,G+h*.45,z+d/2+.15,1,h*.55,.12);}
 swallowRoof(c,x,z,w+1.5,d+1.2,G+h);c.solid(x,z,w,d);
}
function quanzhou(c){
 const {b,m}=c;
 c.water([[-88,44],[-47,36],[0,43],[49,33],[88,39],[88,62],[-87,62]]);
 c.street([[-83,8],[82,8]],{width:7,trees:'broad'});c.street([[-4,-62],[-4,32]],{width:5,trees:false});
 // Kaiyuan's twin octagonal stone pagodas; sculptural niches and projecting galleries.
 for(const x of [-56,-22]){
  c.pagoda(x,-34,{levels:5,radius:4.4,storey:4.2,roof:m.stone,wall:m.stone});
  for(let l=0;l<5;l++)for(let i=0;i<8;i++){
   const a=(i+.5)/8*TAU,r=4.4*(1-l/7*.5),xx=x+Math.cos(a)*r,zz=-34+Math.sin(a)*r;
   b.sphere(m.dark,xx,G+l*4.2+1.55,zz,.28,.65,.28);b.sphere(m.wall,xx,G+l*4.2+1.65,zz,.12,.25,.12);
  }
 }
 hall(c,-39,-53,27,11,6,m.brick);swallowRoof(c,-39,-53,29,13,7.1);
 for(const z of [-20,-7])for(const x of [-75,-59,-43,-27,12,27,42,57,73])minnan(c,x,z);
 // Qingjing Mosque's pale stone pointed entrance and open courtyard.
 const sh=new c.THREE.Shape();sh.moveTo(-7,0);sh.lineTo(7,0);sh.lineTo(7,14);sh.lineTo(-7,14);sh.closePath();
 const hole=new c.THREE.Path();hole.moveTo(-3,0);hole.lineTo(-3,6);hole.quadraticCurveTo(-3,9,0,11);hole.quadraticCurveTo(3,9,3,6);hole.lineTo(3,0);hole.closePath();sh.holes.push(hole);
 const geo=new c.THREE.ExtrudeGeometry(sh,{depth:3,bevelEnabled:false});b.add(geo,m.stone,37,G,-39);geo.dispose();c.solid(31.7,-37.5,3.4,3);c.solid(42.3,-37.5,3.4,3);
 for(const x of [24,50]){b.box(m.stone,x,3,-49,.8,4,20);c.solid(x,-49,.8,20);}b.box(m.stone,37,3,-59,27,4,.8);c.solid(37,-59,27,.8);
 // Luoyang bridge: broad stone piers and oyster-reef-like bases in tidal water.
 c.bridge(55,48,38,5,-Math.PI/2,'flat');
 for(let z=32;z<=64;z+=6){b.cyl(m.rock,55,.5,z,2,3,2,6);for(const x of [52.2,57.8]){b.cyl(m.stone,x,2.5,z,.25,.3,2,8);b.sphere(m.stone,x,3.65,z,.4);}}
 c.road([[55,8],[55,29]],5);c.road([[55,67],[55,68]],4);
 for(const x of [-75,-60,-45,-18,3,36,73])minnan(c,x,26);
 kiosk(c,-33,15,'古巷面线糊');kiosk(c,19,15,'刺桐茶铺','tea');
 c.boat(-26,51,{axis:'x',travel:22,rotation:Math.PI/2,sail:true});
 grove(c,[[-84,-53],[-78,37],[-12,-52],[8,-51],[66,-45],[80,-54],[80,37],[-14,34]],'broad',1);
 mark(c,'kaiyuan','开元寺东西塔','KAIYUAN TWIN PAGODAS',-39,-34,25,25,'八角五层的石塔双峰对峙，檐下廊台与龛像用体积刻画。',[-39,3,-18]);
 mark(c,'weststreet','西街与红砖古厝','WEST STREET',-43,-7,10,20,'红砖、白石与燕尾脊组成闽南街屋，沿街可进入原创面线糊小店。',[-43,3,8]);
 mark(c,'qingjing','清净寺石门','QINGJING MOSQUE',37,-38,16,18,'尖拱石门、院墙与开敞庭院展示泉州多元建筑传统。',[37,3,-29]);
 mark(c,'luoyang','洛阳桥意象','LUOYANG BRIDGE',55,48,5,23,'以石梁、船形感桥墩与潮水演绎古桥，地理位置经过压缩编排。',[55,3,27]);
}

function tibetBlock(c,x,z,w,d,h,y=G,red=false){
 const {b,m}=c;
 // White/red masonry volumes, black window surrounds and heavy horizontal cornice.
 b.box(red?m.redwood:m.white,x,y+h/2,z,w,h,d);
 b.box(red?m.dark:m.redwood,x,y+h,z,w+.3,.55,d+.3);
 for(let yy=2;yy<h;yy+=2.8)for(let a=-w/2+1.5;a<w/2-1;a+=2.6){b.box(m.dark,x+a,y+yy,z+d/2+.05,1.5,1.6,.12);b.box(m.window,x+a,y+yy+.05,z+d/2+.13,.8,1,.09);b.box(m.white,x+a,y+yy+.9,z+d/2+.14,1.8,.2,.3);}
 for(let yy=2;yy<h;yy+=2.8)for(let a=-d/2+1.5;a<d/2-1;a+=2.6)for(const side of [-1,1]){b.box(m.dark,x+side*(w/2+.05),y+yy,z+a,.15,1.6,1.5);b.box(m.window,x+side*(w/2+.14),y+yy+.05,z+a,.1,1,.8);}
 c.solid(x,z,w,d);
}
function lhasa(c){
 c.shopStyle='flat';
 const {b,m}=c;
 customTerrain(c,-29,-32,47,30,12,m.rock);c.solid(-29,-32,88,48);
 // Potala reads as a wide ascending white palace with a dominant central red mass.
 for(const [x,z,w,d,h,y,red]of [[-29,-26,73,24,12,8,false],[-29,-33,55,23,14,18,false],[-29,-36,29,21,17,27,true],[-55,-30,12,20,17,17,false],[-3,-32,14,22,16,18,false]])tibetBlock(c,x,z,w,d,h,y,red);
 for(const x of [-39,-29,-19]){b.box(m.gold,x,44.7,-36,7,.8,8);roof(b,{...m,roof:m.gold},x,45,-36,8,9,2);b.cyl(m.gold,x,47.8,-36,.05,.3,1.2,8);}
 // Zig-zag stair bands are visible across the rock face; palace interior is not reconstructed.
 for(let j=0;j<18;j++)b.box(m.white,-57+j*.7,G+j*.55,-9-j*.6,9,.5,1.3);
 c.street([[-83,8],[10,8],[70,8]],{width:8,trees:false});c.street([[19,-58],[19,57]],{width:6,trees:false});
 b.box(m.paving,-31,1.15,22,65,.15,23);c.road([[-31,8],[-31,34]],7);
 // Jokhang courtyard and golden roof volumes.
 for(const [x,z,w,d]of [[48,-38,30,9],[33,-25,7,20],[63,-25,7,20],[48,-13,30,7]])tibetBlock(c,x,z,w,d,7,G);
 for(const [x,z]of [[43,-38],[53,-38]]){roof(b,{...m,roof:m.gold},x,9,z,11,10,2.7);b.cyl(m.gold,x,12.3,z,.08,.4,1.3,8);}
 c.road([[25,-51],[73,-51],[73,-2],[25,-2],[25,-51]],4);
 // Chorten: square plinth, rounded body, stepped rings and sun-shaped finial.
 for(const x of [-78,-63,-48]){b.box(m.white,x,2,49,5,2,5);b.cyl(m.white,x,4.3,49,1.7,2.5,3,16);b.cyl(m.gold,x,7,49,.25,1.1,2.5,16);for(let j=0;j<6;j++)circle(c,m.gold,x,6+j*.35,49,1-j*.12,.07,16);b.sphere(m.gold,x,8.7,49,.23);c.solid(x,49,5,5);}
 rows(c,[26,40,54,68,82],[28,44,59],'tibet',5);rows(c,[-82,-68,-54,-40,-26,-12],[-62],'tibet',5);
 kiosk(c,-8,38,'日光甜茶馆','tea');kiosk(c,-36,48,'高原书屋','books');
 grove(c,[[-80,21],[-69,34],[-17,27],[2,56],[81,-23],[80,5],[17,22]],'broad',.8);
 // Strings of small flags made from individually colored cloth shapes.
 const colors=['#698ab0','#f0e7c9','#b9604e','#79a48e','#d8b85e'];for(let row=0;row<3;row++){
  const z=34+row*5;b.beam(m.wood,[-75,5,z],[-50,5,z],.025);
  for(let k=0;k<19;k++)b.box(c.material('flag-'+k%5,colors[k%5]),-74+k*1.25,4.6,z,.7,.85,.035);
 }
 mark(c,'potala','布达拉宫','POTALA PALACE',-29,-31,49,44,'白宫层叠、红宫居中，金顶与黑框窗沿山体展开；展示建筑外观意象。',[-29,3,9]);
 mark(c,'jokhang','大昭寺意象','JOKHANG TEMPLE',48,-27,15,25,'院落、白墙与金色屋顶组合，环绕寺院的步道保持通行。',[48,3,-2]);
 mark(c,'barkhor','八廓街意象','BARKHOR STREET',50,44,10,21,'藏式平顶街屋以深色窗框和檐口区分，甜茶馆可进入。',[50,3,35]);
 mark(c,'chorten','白塔与经幡','CHORTEN AND FLAGS',-63,49,10,21,'白塔、层叠相轮与五色经幡构成高原街景；为艺术化组合。',[-63,3,59]);
}

function camel(c,x,z){
 const {b,m}=c,y=G;b.sphere(m.earth,x,y+1.7,z,1.3,.7,.55);b.sphere(m.sand,x-.45,y+2.3,z,.48,.7,.48);b.sphere(m.sand,x+.45,y+2.3,z,.45,.65,.45);
 for(const a of [-.85,.85])for(const s of [-1,1])b.beam(m.wood,[x+a,y+1.4,z+s*.35],[x+a+.12,y,z+s*.4],.1);
 b.beam(m.earth,[x+1,y+1.9,z],[x+1.4,y+3.1,z],.27);b.sphere(m.earth,x+1.7,y+3.2,z,.6,.3,.3);b.box(m.redwood,x,y+2,z,1,.2,1.3);
}
function dunhuang(c){
 c.shopStyle='flat';
 const {b,m}=c;
 // Swept dunes, each with a different ridge and a shared walkable height sampler.
 customTerrain(c,-60,-35,31,26,22,m.sand);customTerrain(c,-9,-49,38,20,28,m.hill);customTerrain(c,40,-52,25,17,19,m.sand);customTerrain(c,-75,21,15,30,11,m.hill);
 // Crescent silhouette is one simple closed concave polygon, no overlapping lakes.
 const crescent=[];for(let i=0;i<=40;i++){const a=-Math.PI*.7+i/40*Math.PI*1.4;crescent.push([-23+29*Math.cos(a),19+17*Math.sin(a)]);}for(let i=40;i>=0;i--){const a=-Math.PI*.7+i/40*Math.PI*1.4;crescent.push([-31+25*Math.cos(a),19+13*Math.sin(a)]);}c.water(crescent);
 hall(c,-39,19,12,8,5,m.wall2);c.pagoda(-39,19,{levels:3,radius:3.1,storey:3.5,wall:m.wall2});
 for(const z of [6,32])hall(c,-40,z,19,6,3.5,m.wall2);
 c.street([[-58,55],[-33,48],[0,48],[28,29],[47,8],[54,-9]],{width:4,trees:false});c.road([[-40,42],[-40,48]],3);
 // Mogao's cliff faces the walking route; rock ledges break up the skyline.
 for(let k=0;k<7;k++){
  const x=39+k*7,h=17+(k%3)*2.5;
  b.box(m.rock,x,G+h/2,-43,7.2,h,17);b.box(m.earth,x,G+h-1,-43,7.4,1.5,17.4);
  b.ico(m.sand,x,G+h,-44,4,2.4,7);c.solid(x,-43,7.2,17);
  for(let y=4;y<h-1;y+=4.5){b.box(m.dark,x,y,-34.42,2,2.5,.2);b.box(m.wood,x,y-1.4,-34.3,2.8,.2,.3);}
 }
 for(let l=0;l<9;l++){
  const yy=G+l*3.1,w=14-l*.55;
  b.box(m.redwood,61,yy+1.5,-30,w,2.8,5);roof(b,m,61,yy+2.8,-30,w+2,7,1.4);
  for(const xx of [61-w*.3,61+w*.3])b.box(m.window,xx,yy+1.6,-27.4,1.1,1.5,.12);
 }
 c.solid(61,-30,15,7);c.road([[54,-9],[61,-14],[82,-14]],4);
 // Desert beacon is rammed earth, inset courses and crenellated parapet.
 const tx=30,tz=48;
 b.box(m.earth,tx,5,tz,10,8,10);b.box(m.sand,tx,9.1,tz,10.6,.7,10.6);
 for(let y=2;y<8;y+=1.1)b.box(m.hill,tx,y,tz+5.03,10,.1,.06);
 for(const s of [-1,1])for(let k=-4;k<=4;k+=2){b.box(m.earth,tx+k,10,tz+s*4.7,1.2,1.4,1);b.box(m.earth,tx+s*4.7,10,tz+k,1,1.4,1.2);}c.solid(tx,tz,11,11);
 // Oasis settlement: flat earthen courtyard houses instead of Jiangnan houses.
 rows(c,[-60,-47,-34,-21,-8,5],[62],'flat',3.5);rows(c,[52,65,79],[48,61],'flat',4);
 for(const p of [[-53,43],[-43,48],[-30,47],[-13,47],[7,47],[21,37]])camel(c,...p);
 kiosk(c,6,31,'沙洲面馆');kiosk(c,76,24,'丝路书铺','books');
 grove(c,[[-49,8],[-49,25],[-50,34],[-42,42],[-31,39],[-18,42],[6,59],[21,59],[78,34],[87,16]],'broad',.6);
 mark(c,'crescent','月牙泉','CRESCENT LAKE',-23,19,8,28,'弯月形泉水与沙丘相依，泉畔楼阁是可近看的三维模型。',[-40,3,42]);
 mark(c,'dunes','鸣沙山','SINGING SAND DUNES',-9,-49,30,30,'连绵沙脊以独立地形构成，可以沿沙坡步行，感受地势起伏。',[-9,3,-20]);
 mark(c,'mogao','莫高窟九层楼意象','MOGAO GROTTOES',61,-30,31,25,'崖壁洞窟与九层檐楼展示外观意象，未复制壁画或虚构洞窟内部。',[61,3,-17]);
 mark(c,'silkroad','丝路烽燧意象','SILK ROAD BEACON',30,48,12,19,'夯土烽燧与驼队演绎沙洲丝路景观，为艺术化编排。',[30,3,60]);
}

export const cities={
 chongqing:{name:'重庆',en:'CHONGQING',stamp:'渝',region:'长江',coordinates:'29.5630° N · 106.5516° E',subtitle:'两江灯火 · 立体山城',intro:'两江围出半岛，吊脚楼与高楼沿岸层叠。索道越过水面，把山城的白昼与灯火连在一起。',palette:{water:'#789e96',grass:'#9eae8e',roof:'#655a4d'},spawn:[-80,0],build:chongqing},
 xian:{name:'西安',en:'XI’AN',stamp:'安',region:'古都',coordinates:'34.2658° N · 108.9541° E',subtitle:'城阙长安 · 雁塔晨光',intro:'城墙围合长安街巷，方塔与钟楼各守一方。穿过城门，沿中轴走向红墙与层叠屋檐。',palette:{grass:'#aaa783',roof:'#57776c',wall2:'#c9b490'},spawn:[0,62],build:xian},
 guilin:{name:'桂林',en:'GUILIN',stamp:'桂',region:'山水',coordinates:'25.2742° N · 110.2991° E',subtitle:'漓江清影 · 千峰入画',intro:'漓江在峰林之间蜿蜒，象鼻山临水而立。双塔、街巷和缓行游船，组成一幅可走入的山水长卷。',palette:{water:'#72b6a0',grass:'#9db58b',hill:'#608e70',hill2:'#8da67a',rock:'#97a98e'},spawn:[-31,57],build:guilin},
 harbin:{name:'哈尔滨',en:'HARBIN',stamp:'冰',region:'冰雪',coordinates:'45.8038° N · 126.5349° E',subtitle:'松江雪霁 · 冰城灯影',intro:'细雪落在红砖穹顶与欧式街屋上，钢桥横跨松花江。入夜后，冰雕的蓝色光芒照亮冬日小城。',palette:{grass:'#e6e9e1',earth:'#ccd5d2',edge:'#ccd8d7',water:'#bedce0',roof:'#729a96',leaf:'#bccfc0',pine:'#8ea899',brick:'#ac7260',wall2:'#e0d8c8'},spawn:[-11,60],build:harbin},
 xiamen:{name:'厦门',en:'XIAMEN',stamp:'鹭',region:'海滨',coordinates:'24.4798° N · 118.0894° E',subtitle:'鹭岛海风 · 红瓦琴声',intro:'鼓浪屿与城市隔海相望，红色穹顶藏在岛上绿意里。沿棕榈海岸漫步，看双帆形高楼与小船相遇。',palette:{water:'#83bac1',grass:'#a6b895',roof:'#ad7660',hill:'#879f7b'},spawn:[26,13],build:xiamen},
 quanzhou:{name:'泉州',en:'QUANZHOU',stamp:'泉',region:'闽南',coordinates:'24.8741° N · 118.6757° E',subtitle:'刺桐双塔 · 红砖海丝',intro:'东西石塔映着红砖燕尾脊，古巷通向海丝港湾。石门、院落与跨水古桥，留下多元文化相遇的形状。',palette:{water:'#85b4aa',grass:'#b0b594',roof:'#a76a56',brick:'#b77965',stone:'#b7b19b'},spawn:[-4,30],build:quanzhou},
 lhasa:{name:'拉萨',en:'LHASA',stamp:'拉',region:'高原',coordinates:'29.6520° N · 91.1721° E',subtitle:'日光宫城 · 高原清风',intro:'白墙红宫沿山体升起，金顶迎着高原日光。沿八廓街意象街巷行走，在甜茶馆与白塔旁停一停。',palette:{grass:'#b5b39a',hill:'#b8aa91',rock:'#b5a691',white:'#eee9d9',redwood:'#985148',roof:'#77554b'},spawn:[-31,34],build:lhasa},
 dunhuang:{name:'敦煌',en:'DUNHUANG',stamp:'煌',region:'丝路',coordinates:'40.1421° N · 94.6619° E',subtitle:'沙海月泉 · 千年丝路',intro:'沙丘环抱一弯清泉，崖壁九层楼静立于沙洲。循着驼队与烽燧，走进暖金色的丝路缩景。',palette:{grass:'#d9bc88',earth:'#b99969',edge:'#c1a780',sand:'#d8b37b',hill:'#c9a571',rock:'#b89976',wall2:'#cfb48b',water:'#68aa9d',roof:'#696d58',leaf:'#81956a'},spawn:[0,48],build:dunhuang},
};
