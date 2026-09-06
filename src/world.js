import * as THREE from 'three';
import { ModelBuilder, rng, polygonShape, roundedShape, slab, roof, house, pavilion, bridge } from './geometry.js';

export const places = [
 {id:'all',name:'姑苏全景',en:'THE WHOLE PICTURE',tag:'一城水色 · 千年姑苏',desc:'从粉墙黛瓦到湖畔新城，转动这座小小的苏州，发现属于你的江南一角。',pos:[0,0,0],camera:[225,196,273],target:[0,0,0],icon:'globe',coord:'31.2989° N · 120.5853° E'},
 {id:'pingjiang',name:'平江路',en:'PINGJIANG ROAD',tag:'小桥流水 · 枕河人家',desc:'沿着青石板路慢慢走。乌篷船穿过石拱桥，白墙、木窗与灯笼倒映在一河碧水里。',pos:[0,5,20],camera:[29,28,58],target:[-2,3,17],walk:[5.6,2.95,36],icon:'waves',coord:'31.3180° N · 120.6315° E'},
 {id:'garden',name:'拙政园',en:'HUMBLE ADMINISTRATOR’S GARDEN',tag:'咫尺山水 · 一步一景',desc:'亭台依水，曲廊绕池。透过月洞门，看看太湖石、荷叶与层层叠叠的飞檐。',pos:[-29,6,-19],camera:[-2,36,8],target:[-29,3,-21],walk:[-17,2.95,-19],icon:'flower-2',coord:'31.3242° N · 120.6290° E'},
 {id:'tiger',name:'虎丘',en:'TIGER HILL',tag:'云岩古塔 · 吴中胜景',desc:'七级古塔立于苍翠之间。绕到塔身近处，细看八角回廊、层叠檐口与微微倾斜的轮廓。',pos:[-57,40,-41],camera:[-10,56,14],target:[-57,22,-41],walk:[-48,2.95,-25],icon:'landmark',coord:'31.3373° N · 120.5790° E'},
 {id:'lake',name:'金鸡湖',en:'JINJI LAKE',tag:'湖光新城 · 古今相望',desc:'东方之门跨向天空，现代楼宇与湖面相映。入夜后，沿湖的灯光勾勒出另一种苏州。',pos:[57,41,-21],camera:[126,64,71],target:[59,18,-17],walk:[34,2.95,28],icon:'building-2',coord:'31.3176° N · 120.6872° E'},
 {id:'taihu',name:'太湖',en:'TAIHU LAKE',tag:'远山如黛 · 一湖烟波',desc:'把视线留给开阔的湖水。小岛、帆影和起伏的西山，是这座微缩江南最安静的边缘。',pos:[-65,2,41],camera:[-91,32,95],target:[-65,1,34],walk:[-35,2.95,37],icon:'mountain',coord:'31.2000° N · 120.2000° E'},
];

export function buildWorld(scene,seed=310528) {
 const random=rng(seed), root=new THREE.Group();root.name='Suzhou miniature';scene.add(root);
 const b=new ModelBuilder(root), materials={};
 function mat(name,color,roughness=.85,metalness=0) {const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;materials[name]=m;return m;}
 const m={
  wall:mat('warm plaster','#f3eedb'),wall2:mat('aged plaster','#e4dfc9'),stone:mat('limestone','#b9bba6'),trim:mat('stone footings','#899187'),
  paving:mat('pale paving','#d2d0b7'),road:mat('grey promenade','#aeb6a6'),roof:mat('charcoal ceramic roofs','#455452',.82),ridge:mat('eaves and ridges','#384541'),tile:mat('tile ribs','#687672'),
  wood:mat('dark timber','#514e3d'),redwood:mat('painted timber','#794e3e'),bridge:mat('bridge sandstone','#dedbc6'),gold:mat('brass','#ae9567',.45,.35),
  grass:mat('garden lawn','#8ca777'),earth:mat('island earth','#8b9780'),edge:mat('island stratum','#b3b9a2'),sand:mat('lakebed','#afcbb3'),hill:mat('hills','#779876'),hill2:mat('hill highlights','#91aa81'),
  bark:mat('bark','#685e47'),leaf:mat('foliage jade','#63856c'),leaf2:mat('foliage sage','#7e9e76'),leaf3:mat('foliage light','#a2b28a'),pine:mat('pine foliage','#426e5d'),pink:mat('blossoms','#d8b5a4'),
  glass:mat('blue green glass','#61999c',.29,.4),glass2:mat('deep teal glass','#477d83',.35,.35),steel:mat('facade fins','#bdd0c4',.45,.45),white:mat('architectural white','#e3e3d4'),
  rock:mat('weathered scholar rocks','#949f93'),lotus:mat('lotus leaves','#5d976f'),flower:mat('lotus flowers','#e9c6b5'),boat:mat('boat timber','#675740'),sail:mat('linen sails','#f4e8cc'),
 };
 m.roof.side=THREE.DoubleSide;
 m.window=mat('warm windows','#b7ba94',.47);m.window.emissive=new THREE.Color('#ffc170');m.window.emissiveIntensity=0;
 m.lantern=mat('lantern silk','#ba6946',.6);m.lantern.emissive=new THREE.Color('#ff9c3e');m.lantern.emissiveIntensity=.05;
 m.citylight=mat('city windows','#bbcbb0',.42,.15);m.citylight.emissive=new THREE.Color('#ffcb82');m.citylight.emissiveIntensity=0;
 m.lamp=mat('promenade lights','#efd9a2');m.lamp.emissive=new THREE.Color('#ffd08a');m.lamp.emissiveIntensity=.1;
 const waterUniforms={time:{value:0},debug:{value:0}};
 m.water=new THREE.MeshPhysicalMaterial({color:'#68ad9f',roughness:.28,metalness:.06,ior:1.333,reflectivity:.28,clearcoat:.7,clearcoatRoughness:.28});m.water.name='analytic jade water';m.water.userData.noShadow=true;
 m.water.onBeforeCompile=shader=>{
  shader.uniforms.uTime=waterUniforms.time;shader.uniforms.uWaterDebug=waterUniforms.debug;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWaterWorld;');
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWaterWorld = (modelMatrix * vec4(transformed,1.0)).xyz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform float uTime; uniform float uWaterDebug; varying vec3 vWaterWorld;
   vec2 waveGradient(vec2 p) {
    vec2 g=vec2(0.0); float footprint=max(length(dFdx(p)),length(dFdy(p)));
    for(int i=0;i<4;i++) {
      float fi=float(i), k=0.7+fi*0.85;vec2 dir=vec2(cos(fi*1.9+0.3),sin(fi*1.9+0.3));
      float aa=1.0-smoothstep(0.6,2.4,footprint*k);
      g+=dir*cos(dot(p,dir)*k-uTime*sqrt(9.81*k)*0.36)*(0.07/(1.0+fi))*aa;
    } return g;
   }`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    vec2 waterSlope=waveGradient(vWaterWorld.xz);
    vec3 waterNormal=normalize(vec3(-waterSlope.x,1.0,-waterSlope.y));
    normal=normalize(mat3(viewMatrix)*waterNormal);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`if(uWaterDebug>0.5) outgoingLight=waterNormal*0.5+0.5;
    #include <opaque_fragment>`);
 };
 materials.water=m.water;

 slab(b,roundedShape(194,146,14),m.edge,-1.3,5.5,.6);
 slab(b,roundedShape(192.5,144.5,13.5),m.earth,-.8,1.1,.3);
 slab(b,roundedShape(192,144,13),m.sand,-.3,.55,.2);
 slab(b,roundedShape(191.5,143.5,13),m.water,.28,.06);
 const coast=[[-95,-57],[-86,-69],[84,-69],[95,-57],[95,54],[84,69],[-16,69],[-29,61],[-36,49],[-38,35],[-43,27],[-52,23],[-60,12],[-69,6],[-86,8],[-95,-4]];
 const land=polygonShape(coast);
 const cross=[[-3,-55],[3,-55],[3,17],[37,17],[37,23],[3,23],[3,61],[-3,61],[-3,23],[-48,23],[-48,17],[-3,17]];
 land.holes.push(new THREE.Path(polygonShape(cross).getPoints()));
 const lakehole=new THREE.Path();lakehole.absellipse(63,-14,26,24,0,Math.PI*2,true);land.holes.push(lakehole);
 slab(b,land,m.grass,1,1.2,.12);
 // Walkable riverside stone paths and quay courses.
 for(const s of [-1,1]) {
  for(const [z,length] of [[-19.5,73],[42.5,39]]) {
   b.box(m.paving,s*5.5,1.12,z,4.8,.24,length);
   b.box(m.stone,s*3.2,.58,z,.45,1,length);
  }
  for(let z=-54;z<61;z+=1.4)if(z<16.5||z>23.5)b.box(m.trim,s*3.43,.85,z,.07,.15,.8);
  for(const [x,length] of [[-25.5,44],[19.5,32]]){
   b.box(m.paving,x,1.12,20+s*4.5,length,.24,3);
   b.box(m.stone,x,.58,20+s*3.2,length,1,.4);
  }
 }
 for(let z=-54;z<61;z+=1.8)if(z<16.5||z>23.5)for(const x of [-5.8,5.8])b.box(m.stone,x,1.255,z,3.1,.015,.035);
 for(const z of [-49,-6,45,59])for(const [x,w] of [[-21.9,36.2],[21.4,35.2]])b.box(m.paving,x,1.1,z,w,.2,2.7);
 for(const x of [-43,-10,25,34])for(const [z,d] of [[-18.5,71],[40.5,35]])b.box(m.paving,x,1.1,z,2.6,.2,d);
 for(const z of [-35,-22,7,33])b.box(m.paving,17,1.08,z,24,.16,1.9);

 const colliders=[];
 const home=(x,z,w,d,h=3.6,r=0,opts={})=>{house(b,m,x,z,w,d,h,r,opts);const ww=r?d:w,dd=r?w:d;colliders.push({x,z,w:ww/2+.3,d:dd/2+.3});};
 // Closely composed courtyard neighbourhoods, with alleys left open.
 for(const x of [-34,-23,-13,14,25])for(const z of [-42,-30,-17,-3,9,32,44,55]) {
  if(x< -13&&z< -3)continue;
  if(x===-23&&z===-3)continue;
  if(x===25&&z===55)continue;
  const gardenEdge=x===-13&&z<-3;
  const ww=gardenEdge?5.2:6+random()*2.3,dd=4.6+random()*1.5;
  home(gardenEdge?-11.2:x+(random()-.5)*1.2,z,ww,dd,3.1+random()*1.9,0,{wall:random()>.7?m.wall2:m.wall,lantern:Math.abs(x)<18||z===32});
  if(!gardenEdge&&(z===-30||z===32||z===55)) {
   b.box(m.wall,x,2,z-4.1,ww+.8,1.8,.3);
   for(const side of [-1,1])b.box(m.wall,x+side*(ww/2+.25),2,z-2.6,.3,1.8,3.2);
  }
 }
 // Canal-facing shop houses, terrace details, awnings and signs.
 for(const z of [-45,-34,-21,-10,3,34,46,55])for(const side of [-1,1]) {
  const x=side*10.6; if(side<0&&z>25)continue;
  if(z<10&&z>-45)continue;
  b.box(m.wood,x,2,z,2,.9,.6);
 }
 for(let i=0;i<7;i++){const x=-42+i*5.1;home(x,31,4.5,4.4,3.5+(i%3)*.35,0,{lantern:true});}
 for(const [x,z] of [[0,42],[0,0],[0,-36],[-31,20],[22,20]])bridge(b,m,x,z,11,3.8,x===0?0:Math.PI/2);
 for(const [x,z] of [[0,60],[0,-54]])bridge(b,m,x,z,9,3,0);

 function tree(x,z,s=1,y=1.12,type=0) {
  b.cyl(m.bark,x,y+1.45*s,z,.15*s,.25*s,2.9*s,7);
  const leaf=type===2?m.pink:[m.leaf,m.leaf2,m.leaf3][Math.floor(random()*3)];
  if(type===1) {
   for(let i=0;i<3;i++){const yy=y+(2.4+i*.82)*s;b.ico(m.pine,x+(i%2)*.4*s,yy,z,(2.25-i*.38)*s,.78*s,(1.75-i*.2)*s);}
  } else {
   b.ico(leaf,x,y+3.25*s,z,1.65*s,1.9*s,1.55*s,random()*6);
   for(let i=0;i<3;i++){const a=i*2.1+random()*.6,xx=x+Math.cos(a)*.94*s,zz=z+Math.sin(a)*.94*s;b.beam(m.bark,[x,y+1.8*s,z],[xx,y+3*s,zz],.08*s);b.ico(leaf,xx,y+(2.9+random()*.7)*s,zz,1.23*s,1.35*s,1.23*s,random()*6);}
  }
 }
 function shrub(x,z,s=1,y=1.1){b.ico(m.leaf2,x,y+.5*s,z,s,.62*s,s*.75);}
 // Garden enclosure, sculpted moon gate, pond and covered walkways.
 b.box(m.paving,-29,1.1,-22,27,.22,31);
 for(const xx of [-43,-15]){b.box(m.wall,xx,2.3,-22,.6,2.6,32);b.box(m.roof,xx,3.7,-22,.9,.24,32.5);}
 b.box(m.wall,-29,2.3,-38,28,2.6,.6);b.box(m.roof,-29,3.7,-38,28.4,.24,.9);
 b.box(m.wall,-35,2.3,-6,16,2.6,.6);b.box(m.wall,-17,2.3,-6,4,2.6,.6);
 const gate=new THREE.Shape();gate.moveTo(-3,0);gate.lineTo(3,0);gate.lineTo(3,4.5);gate.lineTo(-3,4.5);gate.closePath();const gateHole=new THREE.Path();gateHole.absarc(0,1.85,1.7,0,Math.PI*2,true);gate.holes.push(gateHole);
 const gg=new THREE.ExtrudeGeometry(gate,{depth:.6,bevelEnabled:false,curveSegments:36});b.add(gg,m.wall,-23,1.1,-6);gg.dispose();roof(b,m,-23,5.6,-5.8,7,2,1,0);
 const pond=new THREE.Shape();pond.absellipse(-29,22,8.5,9.4,0,Math.PI*2,false);slab(b,pond,m.water,1.23,.04);
 for(let i=0;i<39;i++){const a=i/39*Math.PI*2;b.ico(m.stone,-29+8.7*Math.cos(a),1.25,-22+9.6*Math.sin(a),.6,.3,.55);}
 pavilion(b,m,-33,-24,2.65,1.32);
 // Zig-zag walkway over the garden pond.
 for(const [x,z,w,d] of [[-26,-14,9,1.5],[-22,-18,1.5,8],[-26,-21.5,8,1.5]]){
  b.box(m.bridge,x,1.65,z,w,.35,d);
  for(const side of [-1,1]){
   const a=w>d?[x-w/2,2.4,z+side*d/2]:[x+side*w/2,2.4,z-d/2];const c=w>d?[x+w/2,2.4,z+side*d/2]:[x+side*w/2,2.4,z+d/2];b.beam(m.wood,a,c,.06);
   const posts=Math.ceil(Math.max(w,d)/1.3);for(let i=0;i<=posts;i++){const t=i/posts,xx=a[0]*(1-t)+c[0]*t,zz=a[2]*(1-t)+c[2]*t;b.beam(m.wood,[xx,1.8,zz],[xx,2.48,zz],.055);}
  }
 }
 house(b,m,-29,-34,12,4.2,3.2,0,{detail:true});colliders.push({x:-29,z:-34,w:6.3,d:2.4});
 for(let z=-31;z<=-12;z+=4) {
  roof(b,m,-40,3.7,z,4.4,3.3,.9,Math.PI/2);
  for(const xx of [-41.1,-38.9])b.cyl(m.redwood,xx,2.4,z,.1,.12,2.6,7);
 }
 for(let i=0;i<17;i++) {
  const a=random()*6.28,r=4+random()*3.5,xx=-29+Math.cos(a)*r,zz=-22+Math.sin(a)*r;
  b.cyl(m.lotus,xx,1.3,zz,.45,.45,.035,10);if(i%3===0)b.sphere(m.flower,xx+.15,1.45,zz,.16,.12,.16);
 }
 for(const [x,z] of [[-36,-12],[-20,-30],[-36,-30],[-18,-10]]){
  for(let i=0;i<4;i++){const s=.6+random()*.9;b.ico(m.rock,x+(random()-.5)*2,1+s,z+(random()-.5)*1.8,s,s*1.7,s*.6,random()*6);}
 }
 for(const [x,z,s,t] of [[-39,-9,1,1],[-19,-34,.8,2],[-18,-13,.7,0],[-36,-32,.7,1],[-41,-34,.85,2]])tree(x,z,s,1.2,t);

 function hill(x,z,rx,rz,height,material=m.hill) {
  const geo=new THREE.PlaneGeometry(2,2,24,24);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const xx=pos.getX(i),zz=pos.getZ(i),r=Math.sqrt(xx*xx+zz*zz);pos.setXYZ(i,xx*rx,Math.pow(Math.max(0,1-r*r),1.65)*height*(1+.06*Math.sin(xx*11+zz*9)),zz*rz);}
  geo.computeVertexNormals();b.add(geo,material,x,1,z);geo.dispose();
  const hy=(xx,zz)=>1+Math.pow(Math.max(0,1-((xx-x)/rx)**2-((zz-z)/rz)**2),1.65)*height;
  for(let i=0;i<65;i++) {const a=random()*6.283,rr=Math.sqrt(random())*.94,xx=x+Math.cos(a)*rx*rr,zz=z+Math.sin(a)*rz*rr;if(rr<.27)continue;tree(xx,zz,.55+random()*.65,hy(xx,zz),random()>.6?1:0);}
  return hy;
 }
 hill(-75,-39,20,23,13);hill(-77,-10,16,15,8,m.hill2);
 const hy=hill(-57,-43,17,21,10.5);
 // Tiger Hill's seven octagonal storeys, with an intentional subtle lean.
 const py=hy(-57,-43);b.cyl(m.stone,-57,py+.25,-43,5.9,6.5,.8,8);
 const pagodaGroup=new THREE.Group(),pb=new ModelBuilder(pagodaGroup);
 for(let k=0;k<7;k++) {
  const r=4.2-k*.33, yy=k*3.65;
  pb.cyl(m.wall2,0,yy+1.6,0,r*.87,r,3.15,8);
  pb.cyl(m.wood,0,yy+.3,0,r*1.1,r*1.1,.22,8);
  for(let i=0;i<8;i++) {
   const a=(i+.5)*Math.PI/4; const xx=Math.cos(a)*r*.91,zz=Math.sin(a)*r*.91;
   pb.box(m.wood,xx,yy+1.8,zz,.9,1.45,.14,-a+Math.PI/2);
   pb.box(m.window,xx*1.01,yy+1.85,zz*1.01,.54,1.05,.06,-a+Math.PI/2);
   const bx=Math.cos(i*Math.PI/4)*r, bz=Math.sin(i*Math.PI/4)*r;pb.cyl(m.redwood,bx,yy+1.8,bz,.09,.12,2.6,6);
  }
  // Eight-sided flared roofs built from rings, preserving an octagonal silhouette.
  const verts=[];const profile=[[r*1.35,yy+3.03],[r*1.10,yy+3.03],[r*.55,yy+3.86]];
  for(let j=0;j<2;j++)for(let i=0;i<8;i++) {
   const a=i*Math.PI/4,c=(i+1)*Math.PI/4;
   const p=(ang,l)=>[Math.cos(ang)*profile[l][0],profile[l][1],Math.sin(ang)*profile[l][0]];
   verts.push(...p(a,j),...p(a,j+1),...p(c,j),...p(c,j),...p(a,j+1),...p(c,j+1));
   pb.beam(m.ridge,p(a,j),p(a,j+1),.085);
  }
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));pg.computeVertexNormals();pb.add(pg,m.roof);pg.dispose();
  for(let i=0;i<8;i++) {const a=i*Math.PI/4,c=(i+1)*Math.PI/4;pb.beam(m.ridge,[Math.cos(a)*r*1.35,yy+3.06,Math.sin(a)*r*1.35],[Math.cos(c)*r*1.35,yy+3.06,Math.sin(c)*r*1.35],.10);}
 }
 pb.cyl(m.gold,0,26.45,0,.03,.2,2,8);pb.finish();pagodaGroup.position.set(-57,py+.5,-43);pagodaGroup.rotation.z=-.035;pagodaGroup.updateMatrixWorld(true);
 pagodaGroup.traverse(o=>{if(o.isMesh){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);b.add(g,o.material);g.dispose();o.geometry.dispose();}});
 // Stone stair approach to the hill.
 for(let i=0;i<20;i++){const z=-24-i*.75,yy=hy(-52,z);b.box(m.bridge,-52,yy+.08,z,2.8,.22,.85);}
 house(b,m,-55,-21,9,5,3.5);colliders.push({x:-55,z:-21,w:4.8,d:2.8});pavilion(b,m,-79,-14,2.5,7.2);

 // Oriental Gate: continuous arch profile extruded through the building.
 const gateShape=new THREE.Shape();gateShape.moveTo(-11,0);gateShape.lineTo(-10.5,24);gateShape.bezierCurveTo(-10.5,43,10.5,43,10.5,24);gateShape.lineTo(11,0);gateShape.lineTo(5.8,0);gateShape.lineTo(5.2,23);gateShape.bezierCurveTo(5.2,34.5,-5.2,34.5,-5.2,23);gateShape.lineTo(-5.8,0);gateShape.closePath();
 const gateGeo=new THREE.ExtrudeGeometry(gateShape,{depth:7,bevelEnabled:true,bevelSize:.28,bevelThickness:.25,bevelSegments:2,curveSegments:36});
 b.add(gateGeo,m.glass,56,1.25,-27);gateGeo.dispose();b.box(m.white,56,1.25,-23.5,28,.5,13);
 function bezierArchY(x,r,base,rise) {
  let lo=0,hi=1;
  for(let i=0;i<22;i++){const t=(lo+hi)/2,xx=-r+6*r*t*t-4*r*t*t*t;if(xx<x)lo=t;else hi=t;}
  const t=(lo+hi)/2;return base+3*rise*t*(1-t);
 }
 const outerY=x=>bezierArchY(x,10.5,24,19);
 for(let x=-10;x<=10;x+=.65) {
  const yTop=outerY(x);
  for(const zz of [-27.3,-19.7]) {
   const ax=Math.abs(x),yBottom=ax>=5.8?0:ax>5.2?(5.8-ax)/.6*23:bezierArchY(x,5.2,23,11.5);
   b.beam(m.steel,[56+x,yBottom+1.4,zz],[56+x,yTop+1.1,zz],.05,4);
  }
 }
 for(let y=3;y<24;y+=1.1)for(const s of [-1,1])for(const zz of [-27.35,-19.65])b.box(m.steel,56+s*8.05,y,zz,4.75,.065,.08);
 colliders.push({x:48,z:-23.5,w:3,d:4},{x:64,z:-23.5,w:3,d:4});
 // Modern district: alternating setbacks, podiums and readable facade grids.
 function tower(x,z,w,d,h,type=0) {
  b.box(m.white,x,1.3,z,w+2,.65,d+2);b.box(type?m.glass2:m.glass,x,1.5+h/2,z,w,h,d);
  b.box(m.steel,x,h+1.6,z,w+.4,.28,d+.4);
  for(let y=3;y<h+1;y+=1.45) {
   for(const s of [-1,1])b.box(m.steel,x,y,z+s*(d/2+.03),w,.055,.08);
   for(const s of [-1,1])b.box(m.steel,x+s*(w/2+.03),y,z,.08,.055,d);
   for(let xx=-w/2+.5;xx<w/2;xx+=1.0)if(random()>.6)b.box(m.citylight,x+xx,y+.45,z+d/2+.055,.44,.55,.04);
  }
  for(let xx=-w/2+.5;xx<w/2;xx+=1.1)for(const s of [-1,1])b.box(m.steel,x+xx,1.5+h/2,z+s*(d/2+.09),.065,h,.1);
  b.box(m.glass2,x,h+2.3,z,w*.56,1.5,d*.7);
  colliders.push({x,z,w:w/2+.5,d:d/2+.5});
 }
 tower(77,-44,8,9,35);tower(88,-31,5,7,24,1);tower(67,-53,7,7,20);tower(46,-49,7,8,24,1);tower(35,-40,5,6,16);tower(85,-9,5,7,13,1);
 for(const [x,z] of [[80,48],[68,53],[54,54],[85,36],[37,-56]])tower(x,z,5.5,6.5,8+random()*6,1);
 b.box(m.road,63,1.08,-36,58,.15,3);b.box(m.road,91,1.08,8,2.3,.15,79);
 // Lakefront promenade follows the actual hole boundary.
 for(let i=0;i<104;i++) {
  const a=i/104*Math.PI*2,xx=63+27*Math.cos(a),zz=14+25*Math.sin(a);
  b.box(m.paving,xx,1.15,zz,2.7,.24,2.5,-a);if(i%4===0)shrub(63+28.5*Math.cos(a),14+26.5*Math.sin(a),.7);
 }
 // A small island and lakeside sculpture.
 const island=new THREE.Shape();island.absellipse(70,-15,5.8,3.3,0,Math.PI*2,false);slab(b,island,m.grass,1.15,.8,.2);tree(69,15,.9);tree(72,16,.6);pavilion(b,m,70,13,1.7,1.2);
 const ring=new THREE.TorusGeometry(3.1,.25,8,40);b.add(ring,m.steel,84,4.3,23,1,1,1,0);ring.dispose();b.box(m.white,84,1.3,23,7,.4,3);

 // Taihu islands, sailing boats, dock and the quieter water-town edge.
 for(const [x,z,rx,rz] of [[-73,32,7,4],[-83,51,5,3],[-52,56,4.2,2.8]]) {
  const s=new THREE.Shape();s.absellipse(x,-z,rx,rz,0,Math.PI*2,false);slab(b,s,m.grass,1,.8,.3);
  tree(x,z,.7);tree(x+2,z,.6,1,1);
 }
 pavilion(b,m,-72,32,2,1.1);
 b.box(m.wood,-45,1,38,16,.35,2.5);
 for(let x=-52;x<-37;x+=2){b.cyl(m.wood,x,.4,37,.13,.15,2,8);b.cyl(m.wood,x,.4,39,.13,.15,2,8);b.box(m.gold,x,1.2,38,.04,.04,2.5);}
 for(const [x,z] of [[-25,52],[-17,60],[-32,42]])home(x,z,7,5,3.3,0,{lantern:true});
 // Trees planted along roads, embankments, and landscape margins.
 for(let z=-53;z<64;z+=9)for(const side of [-1,1])if(Math.abs(z-20)>7)tree(side*7.2,z,.55+random()*.17,1.15,z%3===0?2:0);
 for(let x=-40;x<35;x+=8){tree(x,26,.58,1.1);if(x>3)tree(x,-53,.72,1.1);}
 for(let i=0;i<105;i++) {
  const x=-87+random()*173,z=-63+random()*125;
  if((x< -47&&z<10)||(x>32&&z< -35)||((x-63)**2/31**2+(z-14)**2/28**2<1.2)||Math.abs(x)<10||Math.abs(z-20)<10)continue;
  if(x<-38&&z>13||x<-20&&z>57||x< -14&&x> -45&&z<-5)continue;
  if(colliders.some(c=>Math.abs(x-c.x)<c.w+2&&Math.abs(z-c.z)<c.d+2))continue;
  tree(x,z,.5+random()*.6,1.1,random()>.88?2:0);
 }
 for(let z=-51;z<58;z+=10)for(const x of [-4,4]) {
  b.cyl(m.wood,x,2.15,z,.07,.1,2.1,6);b.box(m.gold,x,3.2,z,.45,.1,.45);b.box(m.lamp,x,2.97,z,.28,.4,.28);roof(b,m,x,3.3,z,.75,.75,.23,0,false);
 }
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2;const x=63+27*Math.cos(a),z=14+25*Math.sin(a);b.cyl(m.steel,x,2.25,z,.07,.09,2.2,6);b.sphere(m.lamp,x,3.4,z,.22);}
 // Tiny benches, street carts, people and pots reward a closer camera.
 for(const [x,z] of [[7,11],[-7,30],[6,-17],[34,19],[-17,-8],[-38,33]]) {
  b.box(m.wood,x,1.75,z,1.5,.15,.55);b.box(m.wood,x,2.1,z-.24,1.5,.6,.12);
  for(const s of [-1,1])b.box(m.wood,x+s*.55,1.45,z,.1,.6,.5);
 }
 const peopleMats=[m.redwood,m.wall2,m.glass2,m.gold];
 for(let i=0;i<38;i++) {
  const x=i<28?(i%2?5.3:-5.3):32+random()*3,z=i<28?-48+random()*102:-5+random()*40;
  if(Math.abs(z-20)<4)continue;
  const pm=peopleMats[i%4];b.cyl(pm,x,1.8,z,.19,.14,.68,7);b.sphere(m.sand,x,2.28,z,.18,.21,.18);
  for(const s of [-1,1])b.beam(m.wood,[x+s*.085,1.57,z],[x+s*.12,1.15,z+s*.1],.055);
 }
 b.finish();

 const boats=[];
 function boat(x,z,scale=1,sailing=false,angle=0) {
  const group=new THREE.Group(),bb=new ModelBuilder(group);
  const hull=new THREE.Shape();hull.moveTo(0,-2.6);hull.quadraticCurveTo(-1.05,-1.8,-.95,1.65);hull.quadraticCurveTo(0,3.2,.95,1.65);hull.quadraticCurveTo(1.05,-1.8,0,-2.6);
  slab(bb,hull,m.boat,.35,.55,.08);bb.box(m.wood,0,.39,0,1.6,.16,3.7);
  if(sailing) {
   bb.cyl(m.wood,0,2.7,0,.055,.07,5.4,6);
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute([0,.7,0,0,5.2,0,2.8,.7,.2, 0,.7,0,2.8,.7,.2,0,5.2,0],3));sg.computeVertexNormals();bb.add(sg,m.sail);sg.dispose();
  } else {
   const cover=new THREE.CylinderGeometry(.76,.76,2.6,12,1,true,0,Math.PI);bb.add(cover,m.roof,0,.6,0,1,1,1,0,Math.PI/2);cover.dispose();
   for(const zz of [-1.4,1.4])bb.beam(m.wood,[-.8,.4,zz],[.8,.4,zz],.07);
   bb.beam(m.wood,[.4,.65,2],[1.3,.08,3.5],.045);
  }
  bb.finish();group.position.set(x,.38,z);group.rotation.y=angle;group.scale.setScalar(scale);root.add(group);boats.push({group,x,z,angle,sailing});return group;
 }
 boat(-.5,31,.78);boat(.6,-20,.75,false,Math.PI);boat(-22,20,.73,false,Math.PI/2);boat(66,25,1.15,true,.65);boat(-66,48,1.4,true,-.65);boat(-85,17,1,true,.6);boat(-48,37,.82);
 const birds=new THREE.Group();root.add(birds);const birdMat=new THREE.MeshBasicMaterial({color:'#546b61',side:THREE.DoubleSide});
 for(let i=0;i<10;i++) {
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.65,.2,0,0,0,.15,0,0,-.1,0,0,-.1,0,0,.15,.65,.2,0],3));geo.computeVertexNormals();const bird=new THREE.Mesh(geo,birdMat);bird.position.set((i%5)*2,Math.sin(i)*1.2,Math.floor(i/5)*3);birds.add(bird);
 }
 const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,224,162,1)');gradient.addColorStop(.14,'rgba(255,187,91,.65)');gradient.addColorStop(.4,'rgba(255,151,58,.18)');gradient.addColorStop(1,'rgba(255,151,58,0)');gc.fillStyle=gradient;gc.fillRect(0,0,64,64);
 const glowTexture=new THREE.CanvasTexture(glowCanvas);glowTexture.colorSpace=THREE.SRGBColorSpace;
 const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,color:'#ffd59d'});
 for(let z=-51;z<58;z+=10)if(z<16||z>24)for(const x of [-4,4]){const glow=new THREE.Sprite(glowMaterial);glow.position.set(x,3,z);glow.scale.set(2.6,2.6,1);root.add(glow);}
 const fireflyPositions=[];for(let i=0;i<80;i++)fireflyPositions.push(-42+random()*30,1.7+random()*5,-37+random()*30);
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fireflyPositions,3));const fireflies=new THREE.Points(fg,new THREE.PointsMaterial({color:'#ffe6a7',size:.18,transparent:true,opacity:0,depthWrite:false}));root.add(fireflies);

 const walkBridges=[{x:0,z:42,l:11,w:3.8},{x:0,z:0,l:11,w:3.8},{x:0,z:-36,l:11,w:3.8},{x:-31,z:20,l:11,w:3.8,vertical:true},{x:22,z:20,l:11,w:3.8,vertical:true},{x:0,z:60,l:9,w:3},{x:0,z:-54,l:9,w:3}];
 function bridgeAt(x,z){return walkBridges.find(q=>Math.abs((q.vertical?z:x)-(q.vertical?q.z:q.x))<=q.l/2&&Math.abs((q.vertical?x:z)-(q.vertical?q.x:q.z))<=q.w/2-.2);}
 function groundHeight(x,z) {
  const q=bridgeAt(x,z);if(q){const t=((q.vertical?z-q.z:x-q.x)+q.l/2)/q.l;return 1.25+2.55*Math.sin(Math.PI*t);}
  let y=1.15;
  for(const [hx,hz,rx,rz,h] of [[-75,-39,20,23,13],[-77,-10,16,15,8],[-57,-43,17,21,10.5]]) {
   const u=(x-hx)/rx,v=(z-hz)/rz;y=Math.max(y,1+Math.pow(Math.max(0,1-u*u-v*v),1.65)*h*(1+.06*Math.sin(u*11+v*9)));
  }
  if(x>-31&&x<-20.5&&z>-23&&z<-12&&onGardenWalk(x,z))y=1.85;
  return y;
 }
 function onGardenWalk(x,z){return (Math.abs(z+14)<.6&&x>-30.5&&x<-21.5)||(Math.abs(x+22)<.6&&z>-22&&z<-14)||(Math.abs(z+21.5)<.6&&x>-30&&x<-22);}
 function isWalkable(x,z) {
  let inLand=false;for(let i=0,j=coast.length-1;i<coast.length;j=i++){const [xi,zi]=coast[i],[xj,zj]=coast[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))inLand=!inLand;}
  if(!inLand)return false;
  if(bridgeAt(x,z))return true;
  if((x-63)**2/26.5**2+(z-14)**2/24.5**2<1)return false;
  if(Math.abs(x)<3.65&&z>-55&&z<61||z>16.5&&z<23.5&&x>-49&&x<38)return false;
  if(Math.hypot(x+57,z+43)<5.6)return false;
  if(x>-43.5&&x<-14.5&&z>-38.5&&z<-5.5) {
   if((x+29)**2/8.7**2+(z+22)**2/9.6**2<1&&!onGardenWalk(x,z))return false;
   if(x<-42.3||x>-15.7||z<-37.3)return false;
   if(z>-6.5&&(x<-24.4||x>-21.6))return false;
  }
  return !colliders.some(c=>Math.abs(x-c.x)<c.w+.25&&Math.abs(z-c.z)<c.d+.25);
 }
 return {root,materials:m,waterUniforms,boats,birds,fireflies,colliders,isWalkable,groundHeight,seed,
  update(time,night) {
   waterUniforms.time.value=time;
   for(let i=0;i<boats.length;i++){const boat=boats[i];boat.group.position.y=.43+Math.sin(time*.85+i)*.035;boat.group.rotation.z=Math.sin(time*.7+i)*.013;if(i<2)boat.group.position.z=boat.z+Math.sin(time*.065+i)*10;else if(i===2)boat.group.position.x=boat.x+Math.sin(time*.07)*9;}
   birds.position.set(Math.sin(time*.035)*38,32+Math.sin(time*.08)*2,Math.cos(time*.035)*31);birds.rotation.y=-time*.035;birds.children.forEach((v,i)=>v.rotation.z=Math.sin(time*3+i)*.15);
   m.window.emissiveIntensity=night*2.6;m.lantern.emissiveIntensity=.05+night*3.5;m.citylight.emissiveIntensity=night*2.8;m.lamp.emissiveIntensity=.1+night*4;glowMaterial.opacity=night*.72;
   fireflies.material.opacity=night*(.4+Math.sin(time*1.3)*.2);fireflies.position.y=Math.sin(time*.4)*.45;
  }
 };
}
