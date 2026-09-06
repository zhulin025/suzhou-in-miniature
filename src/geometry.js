import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export class ModelBuilder {
  constructor(parent) { this.parent = parent; this.batches = new Map(); this.matrix = new THREE.Matrix4(); this.quat = new THREE.Quaternion(); }
  add(geometry, material, x=0,y=0,z=0, sx=1,sy=1,sz=1, ry=0, rx=0, rz=0) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    g.deleteAttribute('uv'); g.deleteAttribute('color');
    this.quat.setFromEuler(new THREE.Euler(rx,ry,rz));
    this.matrix.compose(new THREE.Vector3(x,y,z), this.quat, new THREE.Vector3(sx,sy,sz));
    g.applyMatrix4(this.matrix);
    if (!this.batches.has(material)) this.batches.set(material,[]);
    this.batches.get(material).push(g);
  }
  box(m,x,y,z,w,h,d,ry=0) { this.add(BOX,m,x,y,z,w,h,d,ry); }
  sphere(m,x,y,z,sx,sy=sx,sz=sx) { this.add(SPHERE,m,x,y,z,sx,sy,sz); }
  ico(m,x,y,z,sx,sy=sx,sz=sx,ry=0) { this.add(ICO,m,x,y,z,sx,sy,sz,ry); }
  cyl(m,x,y,z,rt,rb,h,n=12) { const g=new THREE.CylinderGeometry(rt,rb,h,n); this.add(g,m,x,y,z); g.dispose(); }
  beam(m,a,b,r=.08,n=6) {
    const va=new THREE.Vector3(...a), vb=new THREE.Vector3(...b), d=vb.clone().sub(va);
    const g=new THREE.CylinderGeometry(r,r,d.length(),n).toNonIndexed(); g.deleteAttribute('uv');
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())); g.translate(...va.add(vb).multiplyScalar(.5).toArray());
    if(!this.batches.has(m))this.batches.set(m,[]);this.batches.get(m).push(g);
  }
  finish() {
    for(const [mat,list] of this.batches) {
      const g=mergeGeometries(list); const mesh=new THREE.Mesh(g,mat);
      mesh.castShadow=!mat.userData.noShadow; mesh.receiveShadow=true; mesh.name=mat.name;
      this.parent.add(mesh); list.forEach(x=>x.dispose());
    }
    this.batches.clear();
  }
}
const BOX=new THREE.BoxGeometry(1,1,1), SPHERE=new THREE.SphereGeometry(1,10,7), ICO=new THREE.IcosahedronGeometry(1,1);

export function polygonShape(points) { const s=new THREE.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();return s; }
export function roundedShape(w,d,r) {
 const s=new THREE.Shape(), x=-w/2, y=-d/2;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
export function slab(builder,shape,mat,y,depth,bevel=.0) {
 const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,steps:1,curveSegments:32});
 builder.add(geo,mat,0,y-depth,0,1,1,1,0,-Math.PI/2);geo.dispose();
}

// Four curved hip-roof surfaces, tiled seams, raised eaves and a ridge cap.
export function roof(b,m,x,y,z,w,d,h=1.8,rot=0,detail=true) {
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]]; const pos=[];
 function point(side,u,v) {
  const a=corners[side],c=corners[(side+1)%4], ex=(a[0]*(1-u)+c[0]*u), ez=(a[1]*(1-u)+c[1]*u);
  const px=ex*(w*.28*(1-v)+w*.5*v), pz=ez*(d*.05*(1-v)+d*.5*v);
  const eaveScale=Math.min(1,Math.min(w,d)/3);
  const py=h*Math.pow(1-v,1.8)+eaveScale*(.30*Math.pow(v,5)+.22*Math.pow(Math.abs(2*u-1),8)*v);
  return [px,py,pz];
 }
 for(let s=0;s<4;s++)for(let j=0;j<7;j++)for(let i=0;i<12;i++) {
  const a=point(s,i/12,j/7),c=point(s,(i+1)/12,j/7),d1=point(s,(i+1)/12,(j+1)/7),e=point(s,i/12,(j+1)/7);
  pos.push(...a,...c,...e,...c,...d1,...e);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 b.add(g,m.roof,x,y,z,1,1,1,rot);g.dispose();
 const world=(p)=>[x+p[0]*Math.cos(rot)+p[2]*Math.sin(rot),y+p[1],z-p[0]*Math.sin(rot)+p[2]*Math.cos(rot)];
 for(let s=0;s<4;s++) {
  for(let j=0;j<7;j++)b.beam(m.ridge,world(point(s,0,j/7)),world(point(s,0,(j+1)/7)),.10);
  const n=Math.ceil((s%2?d:w)/.58);
  if(detail)for(let i=1;i<n;i++)for(let j=0;j<4;j++) {
   const a=point(s,i/n,j/4),c=point(s,i/n,(j+1)/4);a[1]+=.035;c[1]+=.035;
   b.beam(m.tile,world(a),world(c),.033,4);
  }
  for(let i=0;i<12;i++)b.beam(m.ridge,world(point(s,i/12,1)),world(point(s,(i+1)/12,1)),.09);
 }
 b.beam(m.ridge,world([-w*.28,h+.09,0]),world([w*.28,h+.09,0]),.14);
}

export function house(b,m,x,z,w=6,d=5,h=3.7,rot=0,options={}) {
 const y=options.y??1.1;
 const p=(a,c)=>[x+a*Math.cos(rot)+c*Math.sin(rot),z-a*Math.sin(rot)+c*Math.cos(rot)];
 const box=(mat,a,yy,c,ww,hh,dd)=>{const [xx,zz]=p(a,c);b.box(mat,xx,yy,zz,ww,hh,dd,rot);};
 box(m.stone,0,y+.22,0,w+.4,.44,d+.4);
 box(options.wall||m.wall,0,y+h/2,0,w,h,d);
 box(m.trim,0,y+.6,0,w+.07,.35,d+.07);
 for(const side of [-1,1]) {
  box(m.wood,0,y+h*.43,side*(d/2+.03),1.18,h*.78,.12);
  for(const offset of [-w*.31,w*.31]) {
   box(m.wood,offset,y+h*.59,side*(d/2+.08),1.05,1.35,.1);
   box(m.window,offset,y+h*.59,side*(d/2+.14),.88,1.13,.06);
   for(let q=-1;q<=1;q++)box(m.wood,offset+q*.28,y+h*.59,side*(d/2+.18),.065,1.2,.06);
   box(m.wood,offset,y+h*.59,side*(d/2+.18),.97,.075,.06);
  }
  box(m.wood,0,y+h-.2,side*(d/2+.06),w,.13,.13);
 }
 roof(b,m,x,y+h,z,w+1.05,d+1.0,Math.min(2.15,w*.28),rot,options.detail!==false);
 if(options.lantern)for(const offset of [-w*.38,w*.38]) {
  const [xx,zz]=p(offset,d/2+.6);b.beam(m.wood,[xx,y+h-.3,zz],[xx,y+h-1.3,zz],.035);
  b.sphere(m.lantern,xx,y+h-1.4,zz,.28,.42,.28);b.cyl(m.gold,xx,y+h-1.86,zz,.06,.06,.22,6);
 }
}

export function pavilion(b,m,x,z,r=3.1,y=1.1,levels=1) {
 b.cyl(m.stone,x,y+.22,z,r+1,r+1.25,.44,8);
 for(let k=0;k<levels;k++) {
  const rr=r*(1-k*.15), yy=y+k*3.8;
  for(let i=0;i<8;i++) {const a=(i+.5)*Math.PI/4,xx=x+Math.cos(a)*rr*.72,zz=z+Math.sin(a)*rr*.72;b.cyl(m.redwood,xx,yy+1.6,zz,.14,.17,3.2,8);}
  roof(b,m,x,yy+3.05,z,rr*2.3,rr*2.3,1.6,Math.PI/4,true);
 }
 b.cyl(m.gold,x,y+3.05+(levels-1)*3.8+1.85,z,.03,.17,.5,8);
}

export function bridge(b,m,x,z,length=11,width=3.8,rot=0) {
 const shape=new THREE.Shape(), n=32, rise=2.55;
 const top=t=>1.2+rise*Math.sin(Math.PI*t);
 shape.moveTo(-length/2,.1);
 for(let i=0;i<=n;i++)shape.lineTo(-length/2+length*i/n,top(i/n));
 shape.lineTo(length/2,.1);shape.lineTo(length/2-1.3,.1);
 for(let i=n;i>=0;i--)shape.lineTo((-length/2+1.3)+(length-2.6)*i/n,.15+2.4*Math.sin(Math.PI*i/n));
 shape.lineTo(-length/2,.1);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,steps:1,curveSegments:24});geo.translate(0,0,-width/2);
 b.add(geo,m.bridge,x,0,z,1,1,1,rot);geo.dispose();
 const world=(px,py,pz)=>[x+px*Math.cos(rot)+pz*Math.sin(rot),py,z-px*Math.sin(rot)+pz*Math.cos(rot)];
 for(const side of [-1,1]) {
  for(let i=0;i<=12;i++) {const t=i/12,a=world(-length/2+length*t,top(t)+.5,side*width/2);b.cyl(m.bridge,...a,.1,.14,1,6);b.sphere(m.stone,a[0],a[1]+.55,a[2],.17);}
  for(let i=0;i<24;i++)b.beam(m.bridge,world(-length/2+length*i/24,top(i/24)+.9,side*width/2),world(-length/2+length*(i+1)/24,top((i+1)/24)+.9,side*width/2),.11);
 }
 for(let i=0;i<28;i++){const t=(i+.5)/28;const a=world(-length/2+length*t,top(t)+.025,0);b.box(m.paving,a[0],a[1],a[2],length/28-.045,.1,width-.15,rot);}
}
