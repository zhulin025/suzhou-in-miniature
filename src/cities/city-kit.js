import * as THREE from 'three';
import { ModelBuilder, rng, polygonShape, roundedShape, slab, roof, house as makeHouse, pavilion as makePavilion, bridge as makeBridge } from '../geometry.js';

const inside=(x,z,pts)=>{let yes=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [a,c]=pts[i],[b,d]=pts[j];if((c>z)!==(d>z)&&x<(b-a)*(z-c)/(d-c)+a)yes=!yes;}return yes;};
const ellipse=(x,z,rx,rz)=>Array.from({length:64},(_,i)=>[x+rx*Math.cos(i/64*Math.PI*2),z+rz*Math.sin(i/64*Math.PI*2)]);

export function createCityContext(scene,definition,seed=310528){
 const root=new THREE.Group();root.name=definition.name+' miniature';scene.add(root);
 const b=new ModelBuilder(root), random=rng(seed), materials=new Map(), m={}, colliders=[],waterAreas=[],islands=[],hills=[],crossings=[],paths=[],landmarks=[],boats=[],shops=[],lamps=[];
 const material=(name,color,roughness=.8,metalness=0)=>{if(materials.has(name))return materials.get(name);const mat=new THREE.MeshStandardMaterial({color,roughness,metalness});mat.name=name;materials.set(name,mat);return mat;};
 const palette={wall:'#ede8d5',wall2:'#d9d5bf',stone:'#b3b7a3',trim:'#849387',paving:'#d4d2bb',road:'#94a69d',roof:'#465a57',ridge:'#354842',tile:'#6a7a70',wood:'#594c39',redwood:'#8d5140',bridge:'#d3ccb3',gold:'#bda067',grass:'#93aa7c',earth:'#8c9a82',edge:'#b0baa5',sand:'#a3c5ad',hill:'#759573',hill2:'#98ac7e',bark:'#655b43',leaf:'#648b70',leaf2:'#81a277',leaf3:'#abc08c',pine:'#426d58',pink:'#dcbfae',glass:'#6c9fa2',glass2:'#486f7f',steel:'#b8ccbf',white:'#e5e6d7',rock:'#939e8f',lotus:'#62957d',flower:'#e6c1b3',boat:'#77614b',sail:'#f1e1ba',window:'#a7b8a0',lantern:'#cc764b',citylight:'#cfccb1',lamp:'#e9d9a2',brick:'#b46f57',red:'#ae4c3c',blue:'#4c758f',dark:'#354a47',concrete:'#bec2b2',...definition.palette};
 Object.entries(palette).forEach(([key,color])=>m[key]=material(key,color,key.includes('glass')?.3:.82,key.includes('glass')?.35:0));
 m.roof.side=THREE.DoubleSide;m.gold.metalness=.3;m.steel.metalness=.45;
 for(const key of ['window','citylight','lamp','lantern']){m[key].emissive=new THREE.Color(key==='lantern'?'#ffad59':'#ffd293');m[key].emissiveIntensity=0;}
 const waterUniforms={time:{value:0},debug:{value:0}};
 m.water=new THREE.MeshPhysicalMaterial({color:definition.palette?.water||'#6cafa4',roughness:.3,metalness:.08,ior:1.333,clearcoat:.5});m.water.name='water';m.water.userData.noShadow=true;
 m.water.onBeforeCompile=shader=>{
  shader.uniforms.uTime=waterUniforms.time;shader.uniforms.uDebug=waterUniforms.debug;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWaterWorld;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWaterWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   varying vec3 vWaterWorld;uniform float uTime;uniform float uDebug;
   vec2 waterGradient(vec2 p){vec2 g=vec2(0.0);float fp=max(length(dFdx(p)),length(dFdy(p)));for(int i=0;i<4;i++){float n=float(i),k=.55+n*.78;vec2 d=vec2(cos(n*1.9+.3),sin(n*1.9+.3));float aa=1.0-smoothstep(.6,2.4,fp*k);g+=d*cos(dot(p,d)*k-uTime*sqrt(9.81*k)*.34)*(.08/(1.0+n))*aa;}return g;}`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec2 slope=waterGradient(vWaterWorld.xz);vec3 waterN=normalize(vec3(-slope.x,1.0,-slope.y));normal=normalize(mat3(viewMatrix)*waterN);`)
   .replace('#include <opaque_fragment>',`if(uDebug>.5)outgoingLight=waterN*.5+.5;\n#include <opaque_fragment>`);
 };
 slab(b,roundedShape(194,146,12),m.edge,-1.3,5.4,.5);slab(b,roundedShape(193,145,11.5),m.earth,-.5,.85,.15);
 function solid(x,z,w,d){colliders.push({x,z,w:w/2,d:d/2});}
 function local(x,z,rotation,scale,callback){
  const group=new THREE.Group(),builder=new ModelBuilder(group);callback(builder,m);builder.finish();group.position.set(x,1.1,z);group.rotation.y=rotation||0;group.scale.setScalar(scale||1);group.updateMatrixWorld(true);
  group.traverse(o=>{if(o.isMesh){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);b.add(g,o.material);g.dispose();o.geometry.dispose();}});
 }
 function water(points){waterAreas.push(points);slab(b,polygonShape(points),m.water,.35,.08);}
 function lake(x,z,rx,rz){water(ellipse(x,z,rx,rz));}
 function island(x,z,rx,rz){const points=ellipse(x,z,rx,rz);islands.push(points);slab(b,polygonShape(points),m.grass,1.1,1.0,.15);}
 function road(points,width=4,mat=m.paving){
  paths.push({points,width});for(let i=1;i<points.length;i++){const [x0,z0]=points[i-1],[x1,z1]=points[i],dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz);if(len<.01)continue;const angle=Math.atan2(dx,dz);
   b.box(mat,(x0+x1)/2,1.14,(z0+z1)/2,width,.14,len+.1,angle);
   for(const side of [-1,1]){const ox=dz/len*width*.5*side,oz=-dx/len*width*.5*side;b.beam(m.stone,[x0+ox,1.25,z0+oz],[x1+ox,1.25,z1+oz],.11);}
   for(let s=1;s<len;s+=2.3){const t=s/len;b.box(m.stone,x0+dx*t,1.215,z0+dz*t,width-.35,.014,.04,angle);}
  }
 }
 function bridge(x,z,length=18,width=4,rotation=0,style='arch'){
  if(style==='flat'){
   b.box(m.bridge,x,1.36,z,length,.42,width,rotation);
   const p=(xx,yy,zz)=>[x+xx*Math.cos(rotation)+zz*Math.sin(rotation),yy,z-xx*Math.sin(rotation)+zz*Math.cos(rotation)];
   for(const s of [-1,1]){b.beam(m.steel,p(-length/2,2.5,s*width/2),p(length/2,2.5,s*width/2),.09);for(let j=-length/2;j<=length/2;j+=2)b.beam(m.steel,p(j,1.5,s*width/2),p(j,2.5,s*width/2),.07);}
  }else makeBridge(b,m,x,z,length,width,rotation);
  crossings.push({x,z,length,width,rotation,style});
 }
 function hill(x,z,rx,rz,h){
  const sample=(xx,zz)=>1.1+Math.pow(Math.max(0,1-((xx-x)/rx)**2-((zz-z)/rz)**2),1.6)*h;
  const g=new THREE.PlaneGeometry(2,2,24,24);g.rotateX(-Math.PI/2);const a=g.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i)*rx,zz=a.getZ(i)*rz;a.setXYZ(i,xx,sample(x+xx,z+zz)-1.1,zz);}g.computeVertexNormals();b.add(g,m.hill,x,1.1,z);g.dispose();hills.push(sample);return sample;
 }
 function tree(x,z,s=1,type='broad',y=1.1){
  if(type==='palm'){
   b.beam(m.bark,[x,y,z],[x+.2*s,y+5.8*s,z],.18*s,8);
   for(let k=0;k<9;k++){const a=k/9*Math.PI*2,points=[];for(let j=0;j<5;j++){const t=j/4;points.push([x+Math.cos(a)*3*s*t,y+(5.8+Math.sin(t*Math.PI)*.7-t*.9)*s,z+Math.sin(a)*3*s*t]);}for(let j=1;j<5;j++)b.beam(m.leaf,points[j-1],points[j],(.22-j*.035)*s,5);for(let j=1;j<4;j++)b.ico(m.leaf2,points[j][0],points[j][1],points[j][2],.38*s,.09*s,.75*s,a);}
   return;
  }
  const leaf=type==='blossom'?m.pink:type==='pine'?m.pine:[m.leaf,m.leaf2,m.leaf3][Math.floor(random()*3)];
  b.cyl(m.bark,x,y+1.8*s,z,.16*s,.29*s,3.6*s,7);
  b.cyl(m.stone,x,y+.07,z,.57*s,.64*s,.15,12);
  if(type==='pine')for(let j=0;j<4;j++){b.ico(leaf,x+(j%2)*.25*s,y+(2.6+j*.8)*s,z,(2.15-j*.28)*s,.78*s,(1.85-j*.24)*s);}
  else {
   for(let k=0;k<5;k++){const a=k*2.4,xx=x+Math.cos(a)*1.25*s,zz=z+Math.sin(a)*1.25*s,yy=y+(3.5+(k%2)*.7)*s;b.beam(m.bark,[x,y+2*s,z],[xx,yy,zz],.075*s);b.ico(leaf,xx,yy,zz,1.5*s,1.4*s,1.4*s,a);}
   if(type==='willow')for(let k=0;k<15;k++){const a=k/15*Math.PI*2,r=2.3*s,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;b.beam(m.leaf,[xx,y+3.4*s,zz],[xx+.12*s,y+1.4*s,zz+.15*s],.07*s,4);}
  }
 }
 function house(x,z,w=7,d=6,h=4,rotation=0,options={}){makeHouse(b,m,x,z,w,d,h,rotation,options);solid(x,z,Math.abs(w*Math.cos(rotation))+Math.abs(d*Math.sin(rotation)),Math.abs(w*Math.sin(rotation))+Math.abs(d*Math.cos(rotation)));}
 function pavilion(x,z,r=3,y=1.1,levels=1){makePavilion(b,m,x,z,r,y,levels);}
 function pagoda(x,z,{levels=7,radius=4,storey=3.5,roof:roofMat=m.roof,wall=m.wall,y=1.1,round=false}={}){
  const faces=round?32:8;b.cyl(m.stone,x,y+.3,z,radius*1.45,radius*1.55,.6,faces);
  for(let k=0;k<levels;k++){const r=radius*(1-k/(levels+2)*.5),yy=y+.5+k*storey;b.cyl(wall,x,yy+storey*.38,z,r*.85,r,storey*.76,faces);
   const profile=[new THREE.Vector2(r*1.28,0),new THREE.Vector2(r*1.12,.04),new THREE.Vector2(r*.68,storey*.26),new THREE.Vector2(r*.15,storey*.43)];const g=new THREE.LatheGeometry(profile,faces);b.add(g,roofMat,x,yy+storey*.73,z);g.dispose();
   b.cyl(m.ridge,x,yy+storey*.76,z,r*1.27,r*1.27,.10,faces);
   for(let j=0;j<8;j++){const a=(j+.5)*Math.PI/4,xx=x+Math.cos(a)*r*.89,zz=z+Math.sin(a)*r*.89;b.box(m.wood,xx,yy+storey*.4,zz,r*.3,storey*.42,.09,-a+Math.PI/2);b.box(m.window,xx+(xx-x)*.01,yy+storey*.42,zz+(zz-z)*.01,r*.2,storey*.32,.06,-a+Math.PI/2);}
  }
  b.cyl(m.gold,x,y+.5+levels*storey+.5,z,.02,.2,1.5,8);solid(x,z,radius*2,radius*2);
 }
 function tower(x,z,w,d,h,{style='glass',material:mat=m.glass,tiers=5}={}){
  b.box(m.white,x,1.3,z,w+1.8,.4,d+1.8);
  const count=style==='steps'?tiers:style==='twist'||style==='taper'?Math.max(8,Math.ceil(h/3)):1;
  for(let k=0;k<count;k++){const t=k/count,s=style==='glass'?1:style==='steps'?1-t*.48:1-t*.38,angle=style==='twist'?t*.9:0,hh=h/count,yy=1.5+(k+.5)*hh;
   b.box(mat,x,yy,z,w*s,hh+.015,d*s,angle);
   b.box(m.steel,x,yy+hh/2,z,w*s+.08,.075,d*s+.08,angle);
   for(let j=0;j<hh;j+=1.55)for(const side of [-1,1]){const zz=side*d*s/2+.04*side;b.box(m.steel,x+zz*Math.sin(angle),yy-hh/2+j,z+zz*Math.cos(angle),w*s,.045,.08,angle);}
   const n=Math.max(2,Math.floor(w*s/1.1));for(let j=0;j<n;j++)for(const side of [-1,1]){const xx=-w*s/2+(j+.5)*w*s/n,zz=side*(d*s/2+.075);b.box(m.steel,x+xx*Math.cos(angle)+zz*Math.sin(angle),yy,z-xx*Math.sin(angle)+zz*Math.cos(angle),.045,hh,.065,angle);}
  }
  for(let yy=3;yy<h;yy+=2.4)for(let xx=-w/2+.7;xx<w/2-.3;xx+=1.45)if(random()>.72&&style==='glass')b.box(m.citylight,x+xx,yy,z+d/2+.055,.5,.65,.06);
  b.box(m.steel,x,h+1.5,z,w*.3,.65,d*.3);solid(x,z,w,d);
 }
 function sign(text,x,y,z,width=3,rotation=0){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const g=canvas.getContext('2d');g.fillStyle='#37554a';g.fillRect(0,0,512,128);g.strokeStyle='#b5ad79';g.lineWidth=5;g.strokeRect(7,7,498,114);g.fillStyle='#f3ebd0';g.font='500 55px "Songti SC", "Noto Serif SC", serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,66,470);
  const pixels=g.getImageData(0,0,512,128).data,flipped=new Uint8Array(pixels.length);for(let row=0;row<128;row++)flipped.set(pixels.subarray(row*2048,(row+1)*2048),(127-row)*2048);
  const texture=new THREE.DataTexture(flipped,512,128);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;texture.minFilter=THREE.LinearFilter;
  const mat=new THREE.MeshStandardMaterial({map:texture,roughness:.8,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),mat);mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);
 }
 function shop(x,z,{name='城市小店',width=8,depth=7,kind='tea',wall=m.wall,roof:roofMat=m.roof}={}){
  const w=width,d=depth;b.box(m.paving,x,1.16,z,w+.6,.12,d+.6);
  for(const side of [-1,1]){b.box(wall,x+side*w/2,3.15,z,.3,4.2,d);solid(x+side*w/2,z,.4,d);}
  b.box(wall,x,3.15,z-d/2,w,4.2,.3);solid(x,z-d/2,w,.4);
  b.box(m.wood,x,4.9,z+d/2,w,.45,.3);roof(b,{...m,roof:roofMat},x,5.2,z,w+1.2,d+1.3,1.75,0,true);
  sign(name,x,4.55,z+d/2+.18,w*.77);
  b.box(m.wood,x-1.6,1.95,z-1.3,w*.55,1.6,1.1);solid(x-1.6,z-1.3,w*.55,1.1);
  for(const side of [-1,1])for(let j=0;j<3;j++){
   const xx=x+side*(w/2-.7),yy=1.6+j*.8;b.box(m.wood,xx,yy,z-1,.8,.1,3.6);
   for(let n=0;n<5;n++){const zz=z-2.4+n*.6;if(kind==='books')b.box(n%2?m.redwood:m.glass2,xx,yy+.25,zz,.45,.45,.2);else if(kind==='food'){b.cyl(m.paving,xx,yy+.12,zz,.25,.23,.12,10);b.sphere(m.sail,xx,yy+.25,zz,.17,.15,.17);}else{b.cyl(m.gold,xx,yy+.25,zz,.14,.16,.42,8);}}
  }
  for(const side of [-1,1])solid(x+side*(w/2-.7),z-1,1,3.8);
  b.cyl(m.redwood,x-2.1,1.5,z+d/2+1.6,.35,.4,.7,12);b.ico(m.leaf2,x-2.1,2,z+d/2+1.6,.55,.6,.55);
  shops.push({name,x,z,width:w,depth:d,door:[x,2.95,z+d/2+1.2],inside:[x+.8,2.95,z+.8]});
 }
 function lamp(x,z){b.cyl(m.dark,x,2.8,z,.08,.12,3.4,8);b.box(m.dark,x,4.58,z,.52,.12,.52);b.sphere(m.lamp,x,4.35,z,.22,.27,.22);lamps.push([x,4.35,z]);}
 function street(points,{width=6,trees='broad',spacing=10}={}){
  road(points,width);for(let i=1;i<points.length;i++){const [x0,z0]=points[i-1],[x1,z1]=points[i],dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz);if(len<.1)continue;for(let dist=4;dist<len-2;dist+=spacing){const t=dist/len;for(const side of [-1,1]){const xx=x0+dx*t+dz/len*(width/2+1.25)*side,zz=z0+dz*t-dx/len*(width/2+1.25)*side;lamp(xx,zz);if(trees)tree(xx+dz/len*1.25*side,zz-dx/len*1.25*side,.6,trees);}}
  }
 }
 function boat(x,z,{scale=1,rotation=0,sail=false,axis='z',travel=8}={}){
  const g=new THREE.Group(),bb=new ModelBuilder(g),shape=new THREE.Shape();shape.moveTo(0,-2.6);shape.quadraticCurveTo(-1,-2,-.8,1.8);shape.quadraticCurveTo(0,2.7,.8,1.8);shape.quadraticCurveTo(1,-2,0,-2.6);slab(bb,shape,m.boat,.3,.45,.05);bb.box(m.wood,0,.36,0,1.4,.1,3.8);
  if(sail){bb.beam(m.wood,[0,.3,0],[0,5.4,0],.06);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([0,.6,0,0,5.1,0,2.4,.6,0,2.4,.6,0,0,5.1,0,0,.6,0],3));geo.computeVertexNormals();bb.add(geo,m.sail);geo.dispose();}
  else {const cover=new THREE.CylinderGeometry(.73,.73,2.5,12,1,true,0,Math.PI);bb.add(cover,m.roof,0,.55,0,1,1,1,0,Math.PI/2);cover.dispose();}
  bb.finish();g.position.set(x,.43,z);g.scale.setScalar(scale);g.rotation.y=rotation;root.add(g);boats.push({group:g,x,z,axis,travel,rotation});
 }
 function landmark({id,name,en='',tag='',desc='',x,z,height=12,radius=12,walk,camera}){
  const target=[x,Math.max(3,height*.36),z],distance=Math.max(36,radius*2.5,height*1.8);
  landmarks.push({id,name,en,tag:tag||name,desc,x,z,height,radius,pos:[x,height+3,z],target,camera:camera||[x+distance*.85,target[1]+distance*.75,z+distance*1.05],walk,icon:height>20?'landmark':'map-pin',coord:definition.coordinates});
 }
 function crossingAt(x,z){return crossings.find(c=>{const dx=x-c.x,dz=z-c.z,xx=dx*Math.cos(c.rotation)-dz*Math.sin(c.rotation),zz=dx*Math.sin(c.rotation)+dz*Math.cos(c.rotation);return Math.abs(xx)<=c.length/2&&Math.abs(zz)<c.width/2-.22;});}
 function groundHeight(x,z){const c=crossingAt(x,z);if(c){if(c.style==='flat')return 1.6;const xx=(x-c.x)*Math.cos(c.rotation)-(z-c.z)*Math.sin(c.rotation);return 1.25+2.55*Math.sin(Math.PI*(xx/c.length+.5));}return hills.reduce((h,fn)=>Math.max(h,fn(x,z)),1.15);}
 function isWalkable(x,z){if(Math.abs(x)>93||Math.abs(z)>69)return false;if(crossingAt(x,z))return true;if(waterAreas.some(p=>inside(x,z,p))&&!islands.some(p=>inside(x,z,p)))return false;return !colliders.some(c=>Math.abs(x-c.x)<c.w+.25&&Math.abs(z-c.z)<c.d+.25);}
 function safePoint(x,z){if(isWalkable(x,z))return [x,groundHeight(x,z)+1.8,z];for(let r=2;r<90;r+=2)for(let j=0;j<24;j++){const xx=x+Math.cos(j/24*Math.PI*2)*r,zz=z+Math.sin(j/24*Math.PI*2)*r;if(isWalkable(xx,zz))return [xx,groundHeight(xx,zz)+1.8,zz];}return [0,2.95,64];}
 function finish(){
  const land=roundedShape(192,144,11);for(const pts of waterAreas){const path=new THREE.Path(polygonShape(pts).getPoints());land.holes.push(path);}slab(b,land,m.grass,1.06,1.2);
  b.finish();
  for(const p of landmarks)p.walk=safePoint(...(p.walk?[p.walk[0],p.walk[2]]:[p.x,p.z+p.radius+5]));
  const defaultSpawn=safePoint(...(definition.spawn||[0,57]));
  const places=[{id:'all',name:definition.name+'全景',en:definition.en+' IN MINIATURE',tag:definition.subtitle,desc:definition.intro,pos:[0,0,0],camera:[225,196,273],target:[0,1,0],walk:defaultSpawn,icon:'globe',coord:definition.coordinates},...landmarks];
  const birdGeo=new THREE.BufferGeometry();birdGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.8,.12,0,0,0,.15,0,0,-.15,0,0,-.15,0,0,.15,.8,.12,0],3));birdGeo.computeVertexNormals();const birds=new THREE.Group(),birdMat=new THREE.MeshBasicMaterial({color:'#526d61',side:THREE.DoubleSide});for(let j=0;j<8;j++){const bird=new THREE.Mesh(birdGeo,birdMat);bird.position.set((j%4)*2.4,Math.sin(j),Math.floor(j/4)*3.5);birds.add(bird);}root.add(birds);
  return {root,materials:m,waterUniforms,boats,birds,colliders,places,shops,waterAreas,islands,paths,landmarks,isWalkable,groundHeight,safePoint,seed,
   update(time,night){waterUniforms.time.value=time;m.window.emissiveIntensity=night*2;m.citylight.emissiveIntensity=night*2.6;m.lamp.emissiveIntensity=night*3.5;m.lantern.emissiveIntensity=night*3;for(const [j,item]of boats.entries()){item.group.position[item.axis]=(item.axis==='x'?item.x:item.z)+Math.sin(time*.06+j)*item.travel;item.group.position.y=.43+Math.sin(time*.8+j)*.035;item.group.rotation.z=Math.sin(time*.5+j)*.015;}birds.position.set(Math.sin(time*.03)*40,42,Math.cos(time*.03)*30);birds.rotation.y=-time*.03;birds.children.forEach((o,j)=>o.rotation.z=Math.sin(time*3+j)*.12);},
  };
 }
 return {THREE,b,m,root,random,material,local,solid,water,lake,island,road,bridge,hill,tree,house,pavilion,pagoda,tower,shop,sign,street,boat,landmark,finish,isWalkable,groundHeight};
}

export function buildCityWorld(scene,definition,seed){const ctx=createCityContext(scene,definition,seed);definition.build(ctx);return ctx.finish();}
