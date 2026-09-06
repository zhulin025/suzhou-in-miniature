import * as THREE from 'three';
import {buildLandmarks} from './landmarks.js';
async function fetchBytes(url){
 const res=await fetch(url);if(!res.ok)throw new Error(`数据加载失败 ${res.status}: ${url}`);
 const raw=await res.arrayBuffer(),magic=new Uint8Array(raw,0,Math.min(2,raw.byteLength));
 // Vite serves .gz with Content-Encoding; other static servers may serve raw gzip.
 return magic[0]===31&&magic[1]===139?await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():raw;
}
export async function getJSON(url){return JSON.parse(new TextDecoder().decode(await fetchBytes(url)));}
async function getGeometry(url){
 const buffer=await fetchBytes(url);
 const headerSize=new DataView(buffer).getUint32(0,true),header=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,headerSize)));const start=4+headerSize;
 const constructors={Float32Array,Int8Array,Uint8Array,Uint32Array};const geo=new THREE.BufferGeometry();
 for(const [key,a] of Object.entries(header.attributes))geo.setAttribute(key,new THREE.BufferAttribute(new constructors[a.type](buffer,start+a.offset,a.length),a.itemSize,a.normalized));
 const i=header.index;geo.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,start+i.offset,i.length),1));geo.computeBoundingSphere();geo.computeBoundingBox();return geo;
}
function polygonGeometry(polygons,y){
 const pos=[],idx=[];
 for(const poly of polygons){
  if(!poly[0]||poly[0].length<3)continue;const rings=poly.map(r=>r.map(p=>new THREE.Vector2(...p)));const points=rings.flat(),start=pos.length/3;
  for(const p of points)pos.push(p.x,y,p.y);
  for(const t of THREE.ShapeUtils.triangulateShape(rings[0],rings.slice(1))){const a=points[t[0]],b=points[t[1]],c=points[t[2]];const cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);idx.push(start+t[0],start+t[cross>0?2:1],start+t[cross>0?1:2]);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
function ribbons(lines,widthFn,yFn){const p=[],idx=[];for(const l of lines){const w=widthFn(l)/2,y=yFn(l);for(let i=1;i<l.p.length;i++){const a=l.p[i-1],b=l.p[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.1)continue;const nx=-dz/len*w,nz=dx/len*w,j=p.length/3;p.push(a[0]+nx,y,a[1]+nz,a[0]-nx,y,a[1]-nz,b[0]-nx,y,b[1]-nz,b[0]+nx,y,b[1]+nz);idx.push(j,j+2,j+1,j,j+3,j+2);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();return g;}
export async function buildWorld(scene,materials,onProgress){
 const [manifest,landscape,replacements]=await Promise.all([getJSON('/data/manifest.json'),getJSON('/data/landscape.json.gz'),getJSON('/data/landmark-footprints.json')]);
 const root=new THREE.Group();scene.add(root);const tiles=[];const layers={buildings:new THREE.Group(),water:new THREE.Group(),green:new THREE.Group(),roads:new THREE.Group()};Object.values(layers).forEach(g=>root.add(g));
 function add(g,mat,parent= root){const m=new THREE.Mesh(g,mat);m.receiveShadow=true;parent.add(m);return m;}
 for(const [i,m] of [materials.ground,materials.green,materials.water,materials.roads,materials.highways].entries()){m.polygonOffset=true;m.polygonOffsetFactor=-i;m.polygonOffsetUnits=-i;}
 const ground=add(polygonGeometry(landscape.boundary,-1),materials.ground);
 add(polygonGeometry(landscape.green.map(p=>p.p),.1),materials.green,layers.green);
 add(polygonGeometry(landscape.water.map(p=>p.p),.8),materials.water,layers.water);
 add(ribbons(landscape.streams,l=>l.w,()=>.75),materials.water,layers.water);
 const major=landscape.roads.filter(r=>/motorway|trunk|primary/.test(r.k));
 const medium=landscape.roads.filter(r=>/secondary|tertiary/.test(r.k));
 const minor=landscape.roads.filter(r=>/residential|unclassified|living_street/.test(r.k));
 const rails=landscape.roads.filter(r=>r.k==='rail');
 const roadY=l=>l.b?5.5:1.2;
 add(ribbons(major,l=>l.w,roadY),materials.highways,layers.roads);
 add(ribbons(medium,l=>l.w,roadY),materials.roads,layers.roads);
 const minorMesh=add(ribbons(minor,l=>l.w,roadY),materials.roads,layers.roads);
 const railMesh=add(ribbons(rails,l=>l.w,roadY),materials.rail,layers.roads);
 const borderPoints=[];for(const poly of landscape.boundary)for(const ring of poly)for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];borderPoints.push(a[0],3,a[1],b[0],3,b[1]);}
 const borderGeo=new THREE.BufferGeometry();borderGeo.setAttribute('position',new THREE.Float32BufferAttribute(borderPoints,3));const border=new THREE.LineSegments(borderGeo,new THREE.LineBasicMaterial({color:'#fbf7e7',transparent:true,opacity:.8}));root.add(border);
 const marks=buildLandmarks(scene,materials,replacements);layers.buildings.add(marks.root);
 let loaded=0,completed=0;const ordered=[...manifest.tiles].sort((a,b)=>Math.hypot(a.origin[0],a.origin[1])-Math.hypot(b.origin[0],b.origin[1]));
 onProgress(0,manifest.buildingCount,'正在展开真实建筑轮廓');
 let cursor=0;
 const workers=Array.from({length:5},async()=>{while(cursor<ordered.length){const tile=ordered[cursor++];const geometry=await getGeometry('/data/tiles/'+tile.id+'.bin.gz');const mesh=new THREE.Mesh(geometry,materials.buildings);mesh.position.set(tile.origin[0],0,tile.origin[1]);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData=tile;layers.buildings.add(mesh);tiles.push(mesh);loaded+=tile.count;completed++;onProgress(loaded,manifest.buildingCount,`已展开 ${completed} / ${ordered.length} 个城市分块`);if(completed%8===0)await new Promise(resolve=>setTimeout(resolve,0));}});
 await Promise.all(workers);
 return{root,layers,tiles,manifest,landscape,landmarks:marks,ground,loaded,
  update(n,time,distance,quality){materials.update(n,time);marks.update(n);minorMesh.visible=distance<(quality==='high'?65000:36000);railMesh.visible=distance<85000;},
  setLayer(name,show){if(layers[name])layers[name].visible=show;},
  setDebug(mode){materials.uniforms.debug.value=mode==='height'?1:mode==='emission'?2:0;materials.buildings.wireframe=mode==='wireframe';},
 };
}
