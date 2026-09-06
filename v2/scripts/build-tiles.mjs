import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { ShapeUtils, Vector2, Color } from 'three';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'public/data');
const buildings=JSON.parse(await fs.readFile(path.join(root,'data-cache/buildings-projected.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(out,'manifest.json'),'utf8'));
const named=JSON.parse(await fs.readFile(path.join(root,'data-cache/named-buildings.json'),'utf8'));
const replacements=named.filter(b=>/^(东方之门|苏州国际金融中心|云岩寺塔|虎丘塔(?:（云岩寺塔）)?)$/.test(b.name));
await fs.writeFile(path.join(out,'landmark-footprints.json'),JSON.stringify(replacements,null,2));
const skip=new Set(replacements.map(b=>b.id));
const tiles=new Map();
for(const b of buildings){const key=`${Math.floor(b.c[0]/4000)}_${Math.floor(b.c[1]/4000)}`;if(!tiles.has(key))tiles.set(key,[]);tiles.get(key).push(b);}
const palette={white:new Color('#dedbd1'),residential:new Color('#ddd8cc'),glass:new Color('#9cbbb6'),industrial:new Color('#bbc4bd')};
function encode(arrays){
 const header={attributes:{},index:null};let offset=0;const parts=[];
 for(const [name,arr,size,normalized] of arrays){const pad=(4-offset%4)%4;if(pad){parts.push(Buffer.alloc(pad));offset+=pad;}
 const info={offset,length:arr.length,type:arr.constructor.name,itemSize:size,normalized:!!normalized};if(name==='index')header.index=info;else header.attributes[name]=info;
 const bytes=Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength);parts.push(bytes);offset+=bytes.length;}
 const raw=Buffer.from(JSON.stringify(header));const head=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(head);const len=Buffer.alloc(4);len.writeUInt32LE(head.length);return Buffer.concat([len,head,...parts]);
}
await fs.mkdir(path.join(out,'tiles'),{recursive:true});
let vertices=0,triangles=0,compressedBytes=0;const tileManifest=[];
for(const [key,list] of tiles){
 const [ix,iz]=key.split('_').map(Number),origin=[ix*4000,iz*4000];
 const pos=[],normal=[],uv=[],color=[],source=[],indices=[];let v=0;
 function vertex(x,y,z,nx,ny,nz,u,w,c,s){pos.push(x-origin[0],y,z-origin[1]);normal.push(Math.round(nx*127),Math.round(ny*127),Math.round(nz*127));uv.push(u,w);color.push(Math.round(c.r*255),Math.round(c.g*255),Math.round(c.b*255));source.push(s);return v++;}
 for(const b of list){
  if(skip.has(b.id))continue;
  const seed=Number(b.id.slice(-6))%997;
  const pal=b.h>60?palette.glass:/industrial|warehouse/.test(b.k)?palette.industrial:/apartments|residential/.test(b.k)?palette.residential:palette.white;
  const col=pal.clone().multiplyScalar(.92+(seed%19)/140);
  for(const polygon of b.p){
   const rings=polygon.map(r=>r.map(p=>new Vector2(...p)));
   // Clockwise in X/Z gives outward wall normals and positive-Y roof winding.
   if(!ShapeUtils.isClockWise(rings[0]))rings[0].reverse();
   for(const hole of rings.slice(1))if(ShapeUtils.isClockWise(hole))hole.reverse();
   const points=rings.flat(),start=v;
   for(const p of points)vertex(p.x,b.h,p.y,0,1,0,0,0,col,b.s);
   for(const t of ShapeUtils.triangulateShape(rings[0],rings.slice(1))){const a=points[t[0]],bb=points[t[1]],c=points[t[2]],cross=(bb.x-a.x)*(c.y-a.y)-(bb.y-a.y)*(c.x-a.x);if(cross>0)indices.push(start+t[0],start+t[2],start+t[1]);else indices.push(...t.map(n=>start+n));}
   for(const ring of rings){let u=seed*8;
    for(let i=0;i<ring.length;i++){const a=ring[i],b2=ring[(i+1)%ring.length],dx=b2.x-a.x,dz=b2.y-a.y,len=Math.hypot(dx,dz);if(len<.01)continue;
     const n=[-dz/len,dx/len],s=v;
     vertex(a.x,b.base,a.y,...[n[0],0,n[1]],u,b.base,col,b.s);
     vertex(b2.x,b.base,b2.y,...[n[0],0,n[1]],u+len,b.base,col,b.s);
     vertex(b2.x,b.h,b2.y,...[n[0],0,n[1]],u+len,b.h,col,b.s);
     vertex(a.x,b.h,a.y,...[n[0],0,n[1]],u,b.h,col,b.s);
     indices.push(s,s+1,s+2,s,s+2,s+3);u+=len;
    }
   }
  }
 }
 const packed=encode([['position',new Float32Array(pos),3],['normal',new Int8Array(normal),3,true],['uv',new Float32Array(uv),2],['color',new Uint8Array(color),3,true],['heightSource',new Uint8Array(source),1],['index',new Uint32Array(indices),1]]);
 const gz=gzipSync(packed,{level:9});await fs.writeFile(path.join(out,'tiles',key+'.bin.gz'),gz);
 vertices+=v;triangles+=indices.length/3;compressedBytes+=gz.length;
 tileManifest.push({id:key,origin,count:list.length,vertices:v,triangles:indices.length/3,bytes:gz.length,maxHeight:Math.max(...list.map(b=>b.h))});
}
manifest.tiles=tileManifest;manifest.tileSize=4000;manifest.geometry={vertices,triangles,compressedBytes};manifest.landmarkReplacements=replacements.map(b=>({id:b.id,name:b.name}));
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
// Distribute a compact, source-ID-preserving derived footprint database under ODbL.
await fs.writeFile(path.join(out,'footprints.json.gz'),gzipSync(Buffer.from(JSON.stringify(buildings)),{level:9}));
console.log({tiles:tiles.size,buildings:buildings.length,replacements,vertices,triangles,compressedMB:compressedBytes/1048576});
