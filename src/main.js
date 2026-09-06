import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createIcons, ArrowUpRight, VolumeX, Volume2, Sun, Moon, Play, Pause, Scan, Plus, Minus, Rotate3d, MapPin, Camera, Expand, Compass, Globe, Waves, Flower2, Landmark, Building2, Mountain, Mouse, MoveVertical, Hand, Footprints, ArrowUp, ArrowLeft, ArrowDown, ArrowRight, X } from 'lucide';
import { buildWorld, places } from './world.js';
import './style.css';

const icons={ArrowUpRight,VolumeX,Volume2,Sun,Moon,Play,Pause,Scan,Plus,Minus,Rotate3d,MapPin,Camera,Expand,Compass,Globe,Waves,Flower2,Landmark,Building2,Mountain,Mouse,MoveVertical,Hand,Footprints,ArrowUp,ArrowLeft,ArrowDown,ArrowRight,X};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], icon=(name,cls='')=>`<i data-lucide="${name}" class="${cls}"></i>`;
const pavilionIcon=`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor"><path d="M4 17Q12 16 20 6Q28 16 36 17L31 20H9Z M11 21V31M20 20V31M29 21V31M7 32H33M5 37Q12 34 20 37T35 37" stroke-linejoin="round"/></svg>`;
$('#app').innerHTML=`
 <main id="scene" aria-label="可交互的苏州三维场景：拖动旋转，滚轮缩放" tabindex="0"></main>
 <header class="topbar">
  <button class="brand" aria-label="回到姑苏全景"> <span class="brandmark">${pavilionIcon}</span><span><span class="brandname">姑苏小境</span><span class="brand-en">SUZHOU IN MINIATURE</span></span></button>
  <nav class="topnav" aria-label="主导航"><button class="nav-button active" data-nav="explore">探索苏州</button><button class="nav-button" data-nav="walk">城市漫游</button><button class="nav-button" data-nav="about">关于此境 ${icon('arrow-up-right')}</button></nav>
  <div class="top-actions"><button class="audio-btn" title="开启水乡环境音" aria-label="开启环境音" aria-pressed="false">${icon('volume-x')}</button><div class="day-toggle" aria-label="昼夜切换"><button id="day" class="active" aria-pressed="true">${icon('sun')}白昼</button><button id="night" aria-pressed="false">${icon('moon')}入夜</button></div></div>
 </header>
 <aside class="intro"><div class="eyebrow">A LITTLE WORLD, A SLOWER LIFE</div><h1>把江南，<br><em>放在掌心。</em><span class="small-stamp">苏</span></h1><p class="intro-copy">漫游苏州的水巷、园林与湖光。<br>在方寸之间，遇见千年姑苏。</p><div class="mode-label"><span class="pulse-dot"></span><span id="mode-label">自由探索</span><span style="opacity:.4;margin:0 3px">/</span><span id="time-label">日光和煦</span></div><div class="intro-line"></div><div class="place-detail"><span class="detail-overline" id="detail-en">THE WHOLE PICTURE</span><h2 id="detail-title">一城水色 · 千年姑苏</h2><p id="detail-description">从粉墙黛瓦到湖畔新城，转动这座小小的苏州，发现属于你的江南一角。</p></div><div class="intro-buttons"><button class="walk-button" id="walk">开启漫游 ${icon('arrow-up-right')}</button><button class="tour-button" id="tour" title="自动游览六处风景" aria-label="自动游览" aria-pressed="false">${icon('play')}</button></div><div class="tour-caption">步入街巷，听见水乡的呼吸。</div></aside>
 <div class="compass"><span>N</span><svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="17" stroke="currentColor" opacity=".3"/><path d="M20 1V5M20 35V39M1 20H5M35 20H39" stroke="currentColor"/><g id="needle"><path d="M20 7L24 23L20 20Z" fill="#52755e"/><path d="M20 7L16 23L20 20Z" fill="#b8c6a6"/><path d="M20 33L16 23L20 25L24 23Z" fill="#b8c6a6" opacity=".6"/></g></svg><span>自由视角</span></div>
 <div class="location-labels" aria-label="场景地标">${places.slice(1).map(p=>`<button class="poi" data-place="${p.id}"><span class="dot"></span>${p.name}</button>`).join('')}<span class="region-text" id="taihu-text">太 湖</span><span class="region-text" id="jinji-text">金 鸡 湖</span></div>
 <div class="tools" role="toolbar" aria-label="视角工具"><button data-action="home" title="重置全景 (H)" aria-label="重置全景">${icon('scan')}</button><hr><button data-action="plus" title="拉近视角" aria-label="拉近视角">${icon('plus')}</button><button data-action="minus" title="拉远视角" aria-label="拉远视角">${icon('minus')}</button><hr><button data-action="rotate" title="自动环绕" aria-label="自动环绕" aria-pressed="false">${icon('rotate-3d')}</button><button data-action="labels" class="active" title="显示或隐藏地标" aria-label="显示或隐藏地标" aria-pressed="true">${icon('map-pin')}</button><button data-action="capture" title="保存此刻" aria-label="保存场景截图">${icon('camera')}</button><button data-action="fullscreen" title="全屏查看" aria-label="全屏查看">${icon('expand')}</button></div>
 <div class="minimap"><div class="map-header"><span>一览姑苏</span><span>REGION 01</span></div><svg class="map-svg" viewBox="0 0 194 122" fill="none"><path d="M7 30L20 12L164 9L184 23L184 100L170 112L73 109L58 85L35 77L27 58L8 58Z" fill="#c6d3b9" fill-opacity=".65"/><path d="M7 58L27 58L35 77L58 85L73 109L11 109Z" fill="#98c1b0" fill-opacity=".5"/><ellipse cx="153" cy="67" rx="25" ry="22" fill="#98c1b0" fill-opacity=".7"/><path d="M93 18V110M45 74H126" stroke="#87b7a5" stroke-width="3.4"/><path d="M18 34L29 21L40 33L48 18L65 41L42 53Z" fill="#96b08a" opacity=".7"/><path d="M75 21H124V58H75ZM76 81H124V101H76Z" stroke="#f5f4e5" stroke-width="1.2"/><path d="M104 19V109M72 66H127M71 92H126" stroke="#f5f4e5" stroke-width="1.2"/>${places.slice(1).map(p=>`<g class="map-point" data-place="${p.id}" tabindex="0" role="button" aria-label="前往${p.name}"><circle cx="${97+p.pos[0]*.89}" cy="${62+p.pos[2]*.69}" r="6" fill="transparent"/><circle cx="${97+p.pos[0]*.89}" cy="${62+p.pos[2]*.69}" r="2.7" fill="#66866a" stroke="#f5f5e9" stroke-width="1.4"/></g>`).join('')}<g id="map-camera"><path d="M0 -7L-4 4L0 2L4 4Z" fill="#ae8158" stroke="#f4f2df" stroke-width="1"/></g></svg><div class="map-footer"><i></i>艺术化缩景</div></div>
 <nav class="destinations" aria-label="选择目的地"><div class="dock-caption">${icon('compass')} 循着水脉，遇见苏州 <span style="opacity:.45">/</span> 选择一处风景</div>${places.map((p,i)=>`<button class="destination ${i===0?'active':''}" data-place="${p.id}" aria-pressed="${i===0}"><span class="destination-number">0${i+1}</span>${icon(p.icon,'destination-icon')}<span class="destination-name">${p.name}</span></button>`).join('')}</nav>
 <div class="scene-index"><strong id="scene-number">01</strong><span>— 06</span></div>
 <footer class="footer"><div class="footer-left"><span id="coordinates">31.2989° N · 120.5853° E</span><span class="sep">|</span><span class="model-note">一座可以走进去的江南</span></div><div class="controls-hint"><span>${icon('mouse')}拖动旋转</span><span>${icon('move-vertical')}滚轮缩放</span><span>${icon('hand')}右键平移</span></div><div class="walk-instructions"><span><kbd>W A S D</kbd> 行走</span><span>拖动鼠标环顾</span><span><kbd>Shift</kbd> 加速</span><span><kbd>Esc</kbd> 退出</span></div></footer>
 <div class="walk-hud">${icon('footprints')} <span>水巷漫游</span><button id="reset-walk">回到河畔</button><button id="exit-walk">退出漫游</button></div><div class="crosshair"></div><div class="walk-touch"><button data-key="KeyW" aria-label="向前走">${icon('arrow-up')}</button><button data-key="KeyA" aria-label="向左走">${icon('arrow-left')}</button><button data-key="KeyS" aria-label="向后走">${icon('arrow-down')}</button><button data-key="KeyD" aria-label="向右走">${icon('arrow-right')}</button></div>
 <div class="toast" role="status" aria-live="polite"></div>
 <div class="modal-backdrop" hidden><section class="modal" role="dialog" aria-modal="true" aria-labelledby="about-title"><button class="modal-close" aria-label="关闭">${icon('x')}</button><div class="eyebrow">AN ODE TO JIANGNAN</div><h2 id="about-title">方寸姑苏，处处江南。</h2><p>姑苏小境是一座可以探索的微缩城市。古城水巷、苏式园林、虎丘古塔与湖畔天际线，在这里相遇。</p><p>所有建筑与山水均以程序化几何构建。地标比例与空间距离经过艺术化编排，希望你放慢脚步，看看屋檐下、石桥边，藏着怎样的小风景。</p><div class="modal-line"></div><div class="modal-keys"><div><kbd>拖动</kbd> 旋转视角</div><div><kbd>滚轮</kbd> 拉近细节</div><div><kbd>N</kbd> 切换昼夜</div><div><kbd>H</kbd> 回到全景</div><div><kbd>WASD</kbd> 漫游行走</div><div><kbd>Esc</kbd> 退出漫游</div></div><div class="modal-line"></div><p style="font-size:10px;margin-bottom:0;letter-spacing:1px">以苏州为灵感的艺术缩景 · 非实测地理模型</p></section></div>
 <div class="loading"><div class="loading-title">姑苏小境</div><div class="loading-sub">正在铺开一卷江南</div><div class="loading-bar"></div></div>
`;
createIcons({icons});
$('.nav-button[data-nav="about"] svg').style.cssText='display:inline;width:12px;height:12px;vertical-align:-2px;margin-left:3px';

let renderer,scene,camera,controls,world;
const params=new URLSearchParams(location.search),seed=Number(params.get('seed')||310528);
const state={place:'all',night:0,nightTarget:0,walk:false,labels:true,tour:false,tourElapsed:0,time:0,paused:false,quality:'standard',audio:false,yaw:0,pitch:0};
let flight=null,lastFrame=performance.now(),toastTimer,frameCounter=0,frameTotal=0,lastMetrics=performance.now(),rafMs=0,cpuMs=0,savedOrbit=null,audioContext=null,audioMaster=null,lastModalFocus=null;
const keys=new Set(),pointer={down:false,x:0,y:0,id:null};
function toast(message){$('.toast').textContent=message;$('.toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('show'),3200);}
const lerp=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;

function init() {
 scene=new THREE.Scene();scene.background=new THREE.Color('#e8eee4');scene.fog=new THREE.Fog('#e8eee4',470,850);
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;renderer.outputColorSpace=THREE.SRGBColorSpace;$('#scene').append(renderer.domElement);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('图形上下文暂时中断，请刷新页面恢复场景。');});
 camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.15,1100);camera.position.fromArray(places[0].camera);
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.maxPolarAngle=Math.PI/2-.035;controls.minPolarAngle=.15;controls.minDistance=8;controls.maxDistance=410;controls.panSpeed=.7;controls.rotateSpeed=.55;controls.zoomSpeed=.75;controls.autoRotateSpeed=.4;controls.enablePan=true;
 controls.addEventListener('start',()=>{flight=null;if(state.tour)stopTour();});
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.05).texture;scene.environmentIntensity=.4;room.dispose();pmrem.dispose();
 const hemi=new THREE.HemisphereLight('#e9f2df','#7e987b',2.55);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff0d1',3.5);sun.position.set(-70,130,60);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-145,right:145,top:145,bottom:-145,near:1,far:360});sun.shadow.bias=-.0003;sun.shadow.normalBias=.16;sun.shadow.camera.updateProjectionMatrix();scene.add(sun);
 const fill=new THREE.DirectionalLight('#d3e9de',.65);fill.position.set(90,60,-60);scene.add(fill);
 const floorMat=new THREE.MeshStandardMaterial({color:'#e5ecdf',roughness:1});const floor=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-7.8;floor.receiveShadow=true;scene.add(floor);
 world=buildWorld(scene,seed);
 const nightLights=[];
 for(const [x,y,z,color,power,range] of [[-25,8,-20,'#ffe0a0',160,26],[0,7,24,'#ffc48a',200,35],[-55,22,-40,'#ffd59d',230,35],[57,22,-17,'#83d2d0',330,55],[24,5,33,'#ffd8a4',100,28]]){const light=new THREE.PointLight(color,0,range,1.7);light.position.set(x,y,z);scene.add(light);nightLights.push({light,power});}
 const dayBg=new THREE.Color('#e8eee4'),nightBg=new THREE.Color('#152d35'),dayFloor=new THREE.Color('#e5ecdf'),nightFloor=new THREE.Color('#1c3740');
 let shadowNightBucket=-1;
 function lighting(dt) {
  state.night=lerp(state.night,state.nightTarget,1-Math.exp(-dt*2.4));if(Math.abs(state.night-state.nightTarget)<.001)state.night=state.nightTarget;
  const n=state.night;scene.background.copy(dayBg).lerp(nightBg,n);scene.fog.color.copy(scene.background);floorMat.color.copy(dayFloor).lerp(nightFloor,n);
  hemi.intensity=lerp(2.55,.68,n);sun.intensity=lerp(3.5,.85,n);sun.color.set(n>.5?'#a9c6e0':'#fff0d1');fill.intensity=lerp(.65,.45,n);scene.environmentIntensity=lerp(.4,.23,n);renderer.toneMappingExposure=lerp(1.14,1.0,n);nightLights.forEach(({light,power})=>light.intensity=power*n);
  const bucket=Math.round(n*4);if(bucket!==shadowNightBucket){shadowNightBucket=bucket;renderer.shadowMap.needsUpdate=true;}
 }
 function animate(now) {
  requestAnimationFrame(animate);const start=performance.now(),rawDt=(now-lastFrame)/1000,dt=Math.min(Math.max(rawDt,0),.05);lastFrame=now;
  if(!state.paused)state.time+=dt;
  lighting(dt);world.update(state.time,state.night);
  if(state.walk)updateWalk(dt);else {
   if(flight){flight.elapsed+=dt;const t=Math.min(flight.elapsed/flight.duration,1),e=t*t*(3-2*t);camera.position.lerpVectors(flight.from,flight.to,e);controls.target.lerpVectors(flight.fromTarget,flight.toTarget,e);if(t===1)flight=null;}
   controls.update();
  }
  if(state.tour&&!state.paused){state.tourElapsed+=dt;if(state.tourElapsed>7){state.tourElapsed=0;const next=(places.findIndex(p=>p.id===state.place)+1)%places.length;goTo(places[next].id,true);}}
  renderer.render(scene,camera);updateLabels();
  frameTotal+=Math.min(rawDt*1000,200);frameCounter++;cpuMs=lerp(cpuMs,performance.now()-start,.06);
  if(now-lastMetrics>1000){rafMs=frameTotal/frameCounter;frameCounter=0;frameTotal=0;lastMetrics=now;updateMetrics();}
 }
 resize();requestAnimationFrame(animate);
 renderer.compile(scene,camera);renderer.render(scene,camera);setTimeout(()=>$('.loading').classList.add('hide'),180);
 if(params.get('night')==='1')setNight(true);if(params.get('place'))goTo(params.get('place'));if(params.get('debug')==='1')mountDebug();
}

function resize() {
 if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;if(!state.walk)camera.fov=innerWidth<=760?70:35;
 camera.clearViewOffset();if(!state.walk){if(innerWidth>760)camera.setViewOffset(innerWidth,innerHeight,-innerWidth*(innerWidth>1050?.105:.09),innerHeight*.02,innerWidth,innerHeight);else camera.setViewOffset(innerWidth,innerHeight,0,-innerHeight*.09,innerWidth,innerHeight);}
 camera.updateProjectionMatrix();
 if(!state.walk&&state.place==='all'&&innerWidth<=760&&!flight){camera.position.set(233,225,283);controls.target.set(0,1,0);controls.update();}
}
addEventListener('resize',resize);

function setNight(night) {
 state.nightTarget=night?1:0;document.body.classList.toggle('night',night);$('#day').classList.toggle('active',!night);$('#night').classList.toggle('active',night);$('#day').setAttribute('aria-pressed',String(!night));$('#night').setAttribute('aria-pressed',String(night));$('#time-label').textContent=night?'灯火阑珊':'日光和煦';
}
function updateSelected(id) {
 state.place=id;document.body.classList.toggle('detail-view',id!=='all');const p=places.find(p=>p.id===id),idx=places.indexOf(p);
 $$('[data-place]').forEach(el=>{el.classList.toggle('active',el.dataset.place===id);if(el.tagName==='BUTTON')el.setAttribute('aria-pressed',String(el.dataset.place===id));});
 $('#detail-en').textContent=p.en;$('#detail-title').textContent=p.tag;$('#detail-description').textContent=p.desc;$('#coordinates').textContent=p.coord;$('#scene-number').textContent=String(idx+1).padStart(2,'0');
}
function goTo(id,fromTour=false,instant=false) {
 const p=places.find(p=>p.id===id);if(!p)return;if(state.walk)exitWalk(false);if(!fromTour)stopTour();controls.autoRotate=false;setTool('rotate',false);updateSelected(id);
 let pos=new THREE.Vector3(...p.camera);if(innerWidth<761){if(id==='all')pos.set(233,225,283);else pos.sub(new THREE.Vector3(...p.target)).multiplyScalar(1.38).add(new THREE.Vector3(...p.target));}
 if(instant){flight=null;camera.position.copy(pos);controls.target.fromArray(p.target);controls.update();}
 else flight={from:camera.position.clone(),to:pos,fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...p.target),elapsed:0,duration:1.65};
 if(innerWidth<761&&id!=='all')toast(p.name+' · '+p.tag);
}
function setTool(action,on){const el=$(`[data-action="${action}"]`);el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));}
function stopTour(){state.tour=false;state.tourElapsed=0;$('#tour').classList.remove('active');$('#tour').setAttribute('aria-pressed','false');$('#tour').innerHTML=icon('play');createIcons({icons});$('#mode-label').textContent=state.walk?'街巷漫游':'自由探索';}
function toggleTour() {
 if(state.tour){stopTour();toast('已暂停自动游览');return;}if(state.walk)exitWalk();state.tour=true;state.tourElapsed=0;$('#tour').classList.add('active');$('#tour').setAttribute('aria-pressed','true');$('#tour').innerHTML=icon('pause');createIcons({icons});$('#mode-label').textContent='循水游览';goTo('pingjiang',true);toast('游览已开启，每处停留 7 秒；拖动视角即可暂停');
}
function enterWalk() {
 if(state.walk)return;stopTour();flight=null;controls.autoRotate=false;setTool('rotate',false);savedOrbit={pos:camera.position.clone(),target:controls.target.clone(),place:state.place};state.walk=true;controls.enabled=false;document.body.classList.add('is-walking');$$('.nav-button').forEach(e=>e.classList.toggle('active',e.dataset.nav==='walk'));
 const p=places.find(p=>p.id===state.place);camera.position.fromArray(p.walk||places[1].walk);if(!world.isWalkable(camera.position.x,camera.position.z))camera.position.fromArray(places[1].walk);state.yaw=0;state.pitch=.04;camera.rotation.order='YXZ';camera.rotation.set(-state.pitch,state.yaw,0);camera.fov=64;resize();keys.clear();toast('WASD 行走 · 按住鼠标拖动环顾 · Esc 返回全景');
}
function exitWalk(restore=true) {
 if(!state.walk)return;state.walk=false;keys.clear();pointer.down=false;controls.enabled=true;document.body.classList.remove('is-walking');$$('.nav-button').forEach(e=>e.classList.toggle('active',e.dataset.nav==='explore'));camera.fov=35;camera.rotation.order='XYZ';if(restore&&savedOrbit){camera.position.copy(savedOrbit.pos);controls.target.copy(savedOrbit.target);}resize();controls.update();
}
let footPhase=0;
function updateWalk(dt) {
 const front=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
 const length=Math.hypot(front,side)||1,speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?7.5:3.5)*dt;
 const dx=(-Math.sin(state.yaw)*front+Math.cos(state.yaw)*side)*speed/length,dz=(-Math.cos(state.yaw)*front-Math.sin(state.yaw)*side)*speed/length;
 if(world.isWalkable(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(world.isWalkable(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
 if(front||side)footPhase+=dt*9;camera.position.y=world.groundHeight(camera.position.x,camera.position.z)+1.8+(front||side?Math.sin(footPhase)*.035:0);camera.rotation.set(-state.pitch,state.yaw,0);
}
function updateLabels() {
 const vec=new THREE.Vector3(), rect={w:innerWidth,h:innerHeight};
 for(const p of places.slice(1)) {
  const el=$(`.poi[data-place="${p.id}"]`);vec.set(...p.pos).project(camera);
  const x=(vec.x*.5+.5)*rect.w,y=(-vec.y*.5+.5)*rect.h;
  const visible=state.labels&&!state.walk&&vec.z<1&&vec.z>0&&x>40&&x<rect.w-70&&y>100&&y<rect.h-166&&!(rect.w>760&&x<320&&y<670);
  el.style.left=x+'px';el.style.top=(y-17)+'px';el.style.opacity=visible?'1':'0';el.style.pointerEvents=visible?'auto':'none';el.tabIndex=visible?0:-1;
 }
 for(const [id,pos] of [['taihu-text',[-62,.35,54]],['jinji-text',[62,.35,8]]]) {
  const el=$('#'+id);vec.set(...pos).project(camera);el.style.left=((vec.x*.5+.5)*rect.w)+'px';el.style.top=((-vec.y*.5+.5)*rect.h)+'px';el.style.opacity=state.labels&&!state.walk&&state.place==='all'&&vec.z<1?'1':'0';
 }
 const az=state.walk?state.yaw:controls.getAzimuthalAngle();$('#needle').style.transform=`rotate(${-az*180/Math.PI}deg)`;
 const mapX=97+clamp(state.walk?camera.position.x:controls.target.x,-86,85)*.89,mapY=62+clamp(state.walk?camera.position.z:controls.target.z,-60,60)*.69;
 $('#map-camera').setAttribute('transform',`translate(${mapX} ${mapY}) rotate(${-az*180/Math.PI})`);
}

$('#day').addEventListener('click',()=>setNight(false));$('#night').addEventListener('click',()=>setNight(true));$('.brand').addEventListener('click',()=>goTo('all'));$('#walk').addEventListener('click',enterWalk);$('#exit-walk').addEventListener('click',()=>exitWalk());$('#reset-walk').addEventListener('click',()=>{camera.position.fromArray(places[1].walk);state.yaw=0;state.pitch=.04;toast('已回到平江路河畔');});$('#tour').addEventListener('click',toggleTour);
$$('[data-place]').forEach(el=>{el.addEventListener('click',()=>goTo(el.dataset.place));if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goTo(el.dataset.place);}});});
function openAbout(){lastModalFocus=document.activeElement;$('.modal-backdrop').hidden=false;$('.modal-close').focus();keys.clear();}
function closeAbout(){$('.modal-backdrop').hidden=true;lastModalFocus?.focus();}
$$('[data-nav]').forEach(el=>el.addEventListener('click',()=>el.dataset.nav==='about'?openAbout():el.dataset.nav==='walk'?enterWalk():goTo('all')));
$('.modal-close').addEventListener('click',closeAbout);$('.modal-backdrop').addEventListener('click',e=>{if(e.target===$('.modal-backdrop'))closeAbout();});
$$('[data-action]').forEach(el=>el.addEventListener('click',async()=>{
 const action=el.dataset.action;
 if(action==='home')goTo('all');
 else if(action==='plus'||action==='minus') {
  if(state.walk){camera.fov=clamp(camera.fov+(action==='plus'?-5:5),40,85);camera.updateProjectionMatrix();return;}
  flight=null;const diff=camera.position.clone().sub(controls.target),dist=clamp(diff.length()*(action==='plus'?.8:1.25),8,410);camera.position.copy(controls.target).add(diff.setLength(dist));controls.update();
 }else if(action==='rotate'){if(state.walk)exitWalk();stopTour();flight=null;controls.autoRotate=!controls.autoRotate;setTool('rotate',controls.autoRotate);}
 else if(action==='labels'){state.labels=!state.labels;setTool('labels',state.labels);}
 else if(action==='capture'){renderer.render(scene,camera);const link=document.createElement('a');link.download=`姑苏小境-${places.find(p=>p.id===state.place).name}-${state.nightTarget?'夜':'昼'}.png`;link.href=renderer.domElement.toDataURL('image/png');link.click();toast('已保存此刻的江南');}
 else if(action==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('当前窗口不支持全屏，请使用浏览器全屏功能。');}}
}));
$('#scene').addEventListener('pointerdown',e=>{if(!state.walk||e.button!==0)return;pointer.down=true;pointer.x=e.clientX;pointer.y=e.clientY;pointer.id=e.pointerId;$('#scene').setPointerCapture(e.pointerId);});
$('#scene').addEventListener('pointermove',e=>{if(!state.walk||!pointer.down)return;state.yaw-=(e.clientX-pointer.x)*.004;state.pitch=clamp(state.pitch+(e.clientY-pointer.y)*.003,-1.2,1.2);pointer.x=e.clientX;pointer.y=e.clientY;});
const pointerUp=()=>{pointer.down=false;pointer.id=null;};$('#scene').addEventListener('pointerup',pointerUp);$('#scene').addEventListener('pointercancel',pointerUp);$('#scene').addEventListener('contextmenu',e=>e.preventDefault());
$$('[data-key]').forEach(el=>{el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);keys.add(el.dataset.key);});for(const name of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(name,()=>keys.delete(el.dataset.key));});
addEventListener('keydown',e=>{
 if(!$('.modal-backdrop').hidden){if(e.key==='Escape')closeAbout();if(e.key==='Tab'){e.preventDefault();$('.modal-close').focus();}return;}
 if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
 if(e.code==='Escape'){exitWalk();return;}if(!e.repeat&&e.code==='KeyN')setNight(!state.nightTarget);if(!e.repeat&&e.code==='KeyH')goTo('all');
 if(state.walk&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}
});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();pointerUp();});document.addEventListener('visibilitychange',()=>{keys.clear();pointerUp();lastFrame=performance.now();});

// Quiet, locally synthesized stream ambience. No remote audio or microphone.
$('.audio-btn').addEventListener('click',async()=>{
 try {
  if(!audioContext){audioContext=new AudioContext();audioMaster=audioContext.createGain();audioMaster.gain.value=0;audioMaster.connect(audioContext.destination);const buf=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate),data=buf.getChannelData(0);let v=0;for(let i=0;i<data.length;i++){v=(v+(Math.random()*2-1)*.035)/1.025;data[i]=v;}const src=audioContext.createBufferSource();src.buffer=buf;src.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1150;src.connect(filter);filter.connect(audioMaster);src.start();}
  await audioContext.resume();state.audio=!state.audio;audioMaster.gain.setTargetAtTime(state.audio?.28:0,audioContext.currentTime,.6);$('.audio-btn').innerHTML=icon(state.audio?'volume-2':'volume-x');$('.audio-btn').setAttribute('aria-pressed',String(state.audio));$('.audio-btn').setAttribute('aria-label',state.audio?'关闭环境音':'开启环境音');createIcons({icons});toast(state.audio?'水声轻起，慢慢游。':'环境音已关闭');
 }catch{toast('当前浏览器无法播放环境音。');}
});

function quality(tier) {
 state.quality=tier;renderer.setPixelRatio(Math.min(devicePixelRatio,tier==='high'?2:1.5));scene.traverse(o=>{if(o.isDirectionalLight&&o.castShadow){o.shadow.map?.dispose();o.shadow.map=null;o.shadow.mapSize.setScalar(tier==='high'?4096:2048);}});renderer.shadowMap.needsUpdate=true;resize();
}
function setDebug(mode) {
 world.waterUniforms.debug.value=mode==='water-normals'?1:0;world.root.traverse(o=>{if(o.isMesh)o.material.wireframe=mode==='wireframe';});
}
function metrics(){return {seed,three:THREE.REVISION,backend:'WebGL2',quality:state.quality,viewport:[innerWidth,innerHeight],dpr:renderer.getPixelRatio(),place:state.place,time:+state.time.toFixed(3),night:+state.night.toFixed(3),walk:state.walk,camera:camera.position.toArray(),target:controls.target.toArray(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,rafFrameMs:+rafMs.toFixed(2),cpuSubmitMs:+cpuMs.toFixed(2),gpuMs:null,postprocessing:'none',renderTargets:['environment PMREM cubeUV','directional shadow map'],errors:window.__runtimeErrors||[]};}
function updateMetrics(){const el=$('.debug-metrics');if(el){const v=metrics();el.textContent=`seed ${seed} · Three r${v.three}\n${v.calls} calls · ${v.triangles.toLocaleString()} tris\nRAF ${v.rafFrameMs} ms · CPU ${v.cpuSubmitMs} ms\nGPU timer unavailable\n${v.geometries} geometries · ${v.textures} textures\n${v.viewport.join(' × ')} · DPR ${v.dpr}`;}}
function mountDebug(){const el=document.createElement('div');el.className='debug-panel';el.innerHTML=`<div>VISUAL INSPECTION</div><button id="debug-pause">Pause / resume</button><button id="debug-reset">t = 0</button><br><select id="debug-mode"><option value="final">Final / no-post baseline</option value="wireframe">Geometry wireframe</option value="water-normals">Water normals</option></select><select id="debug-quality"><option value="standard">Standard</option><option value="high">High</option></select><div class="debug-metrics"></div>`;document.body.append(el);$('#debug-pause').onclick=()=>state.paused=!state.paused;$('#debug-reset').onclick=()=>{state.time=0;state.paused=true;};$('#debug-mode').onchange=e=>setDebug(e.target.value);$('#debug-quality').onchange=e=>quality(e.target.value);}
window.__runtimeErrors=[];addEventListener('error',e=>window.__runtimeErrors.push(e.message));
window.__SUZHOU__={ready:false,goTo:(id,instant=true)=>goTo(id,false,instant),setNight,enterWalk,exitWalk,setTime:t=>{state.time=t;state.paused=true;},resume:()=>state.paused=false,setDebug,setQuality:quality,metrics:()=>metrics(),getState:()=>({...state}),getCamera:()=>camera.position.toArray(),isWalkable:(x,z)=>world.isWalkable(x,z),capture:()=>{renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');},setCamera:(position,target)=>{flight=null;camera.position.fromArray(position);controls.target.fromArray(target);controls.update();},reset:()=>{exitWalk();setNight(false);state.night=0;state.time=0;state.paused=true;setDebug('final');goTo('all',false,true);}};
try{init();window.__SUZHOU__.ready=true;}catch(e){console.error(e);$('.loading-title').textContent='小境暂未展开';$('.loading-sub').textContent='请使用支持 WebGL 2 的浏览器刷新重试';$('.loading-bar').style.display='none';window.__runtimeErrors.push(e.message);}
