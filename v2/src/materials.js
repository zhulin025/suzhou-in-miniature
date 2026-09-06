import * as THREE from 'three';
export function createMaterials(){
 const uniforms={night:{value:0},debug:{value:0},time:{value:0}};
 const buildings=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.78,metalness:.06});
 buildings.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{uNight:uniforms.night,uDebug:uniforms.debug});
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
   attribute float heightSource;
   varying vec2 vFacade; varying float vRoof; varying float vSource;
  `).replace('#include <begin_vertex>',`#include <begin_vertex>
   vFacade=uv;vRoof=abs(normal.y);vSource=heightSource;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform float uNight;uniform float uDebug;
   varying vec2 vFacade;varying float vRoof;varying float vSource;
   float cellHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  `).replace('#include <color_fragment>',`#include <color_fragment>
   vec2 grid=vFacade/vec2(3.1,3.25);
   vec2 footprint=max(fwidth(grid),vec2(.001));
   vec2 f=fract(grid);
   vec2 mask=smoothstep(vec2(.16),vec2(.16)+footprint,f)*(1.-smoothstep(vec2(.77)-footprint,vec2(.77),f));
   float resolved=1.-smoothstep(.25,1.2,max(footprint.x,footprint.y));
   float pane=mask.x*mask.y*resolved*(1.-step(.35,vRoof))*step(2.5,vFacade.y);
   float occupied=step(.26,cellHash(floor(grid)));
   float windowLight=pane*occupied;
   diffuseColor.rgb*=mix(1.,.67,step(.5,vRoof));
   diffuseColor.rgb*=mix(1.,.5,uNight);
   diffuseColor.rgb*=mix(.83,1.,smoothstep(0.,9.,vFacade.y)+step(.5,vRoof));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.23,.37,.37),pane*.36);
   if(uDebug>.5&&uDebug<1.5){diffuseColor.rgb=vSource>1.5?vec3(.08,.52,.34):vSource>.5?vec3(.16,.37,.69):vec3(.72,.37,.12);}
  `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   vec3 lamp=mix(vec3(1.,.58,.22),vec3(.73,.88,1.),step(.88,cellHash(floor(grid)+vec2(7.))));
   totalEmissiveRadiance+=lamp*windowLight*uNight*2.4;
   if(uDebug>1.5){diffuseColor.rgb=vec3(.012);totalEmissiveRadiance=lamp*windowLight*1.65;}
  `);
 };
 buildings.customProgramCacheKey=()=> 'suzhou-v2-facade-1';
 const ground=new THREE.MeshStandardMaterial({color:'#b8cbb0',roughness:1});
 const green=new THREE.MeshStandardMaterial({color:'#9fb69a',roughness:1});
 const roads=new THREE.MeshStandardMaterial({color:'#dfe0d2',roughness:1});
 const highways=new THREE.MeshStandardMaterial({color:'#c5c6b7',roughness:1});
 const rail=new THREE.MeshStandardMaterial({color:'#7f9182',roughness:1});
 const water=new THREE.MeshStandardMaterial({color:'#7faea2',roughness:.52,metalness:.2});
 water.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,{uWaterNight:uniforms.night,uWaterTime:uniforms.time});
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWaterPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterPosition=position.xz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterNight;uniform float uWaterTime;varying vec2 vWaterPosition;').replace('#include <color_fragment>',`#include <color_fragment>
   vec2 q=vWaterPosition*.045;float fw=max(fwidth(q.x),fwidth(q.y));
   float ripples=(sin(q.x+q.y*.7+uWaterTime*.28)*sin(q.y*1.13-uWaterTime*.19))*.025*(1.-smoothstep(.7,2.,fw));
   diffuseColor.rgb*=1.+ripples*.35;
  `);
 };
 const day={ground:new THREE.Color('#b8cbb0'),green:new THREE.Color('#9fb69a'),roads:new THREE.Color('#e1e0d3'),highways:new THREE.Color('#c7c6b6'),rail:new THREE.Color('#859286'),water:new THREE.Color('#7faea2')};
 const dark={ground:new THREE.Color('#2c4444'),green:new THREE.Color('#173d34'),roads:new THREE.Color('#415453'),highways:new THREE.Color('#566560'),rail:new THREE.Color('#293f3e'),water:new THREE.Color('#102d36')};
 const mats={ground,green,roads,highways,rail,water};
 return{...mats,buildings,uniforms,update(n,t){uniforms.night.value=n;uniforms.time.value=t;for(const key in mats)mats[key].color.copy(day[key]).lerp(dark[key],n);roads.emissive.set('#efb45d');roads.emissiveIntensity=n*.1;highways.emissive.set('#ffbe62');highways.emissiveIntensity=n*.18;}};
}
