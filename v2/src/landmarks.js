import * as THREE from 'three';
import {project,unproject} from './geo.js';
export const landmarks=[
 {id:'gate',name:'东方之门',en:'GATE TO THE EAST',category:'城市地标',lon:120.67375,lat:31.31756,height:301.8,distance:1500,azimuth:1.05,polar:1.05,region:'sip',fact:'301.8 m',factLabel:'建筑高度',description:'两座塔楼在空中相连，形成面向金鸡湖的巨大门洞。东方之门将苏州园林的空间意象，转译为湖西天际线上鲜明的城市轮廓。',source:'https://jinjilake.sipac.gov.cn/zuixinzixun_article-342-3339.html',sourceLabel:'金鸡湖景区',model:'gate'},
 {id:'ifs',name:'苏州国际金融中心',short:'国金中心',en:'SUZHOU IFS',category:'湖东天际线',lon:120.7189,lat:31.3205,height:450,distance:1950,azimuth:2.6,polar:1.04,region:'sip',fact:'450 m',factLabel:'建筑高度',description:'坐落于金鸡湖东岸的超高层建筑，以逐渐收束的塔身形成挺拔的天际线。隔湖向西，可以望见东方之门与苏州中心。',source:'https://www.skyscrapercenter.com/building/suzhou-ifs/196',sourceLabel:'CTBUH · The Skyscraper Center',model:'ifs'},
 {id:'museum',name:'苏州博物馆',en:'SUZHOU MUSEUM',category:'建筑与人文',lon:120.6235,lat:31.3246,height:15,distance:1050,azimuth:.3,polar:.7,region:'gusu',fact:'贝聿铭',factLabel:'建筑设计',description:'白墙、深灰色石材与几何屋顶，把苏州民居和古典园林的语言带入现代建筑。院落、光线与借景共同构成这座博物馆的空间体验。',source:'https://dx.szmuseum.com/views/NewsDetails.aspx?guid=349a54de-f3f5-41bc-b86d-7c3488d3c0d6',sourceLabel:'苏州博物馆'},
 {id:'garden',name:'拙政园',en:'HUMBLE ADMINISTRATOR’S GARDEN',category:'古典园林',lon:120.6272,lat:31.3253,height:12,distance:1350,azimuth:.35,polar:.55,region:'gusu',fact:'世界遗产',factLabel:'苏州古典园林',description:'以水为中心组织园林，亭台、曲廊与山石在池畔展开。拙政园是苏州古典园林世界遗产的组成部分，也是观察江南园林空间的代表。',source:'https://whc.unesco.org/en/list/813',sourceLabel:'UNESCO 世界遗产中心'},
 {id:'tiger',name:'虎丘塔',en:'TIGER HILL PAGODA',category:'千年古迹',lon:120.5751,lat:31.3383,height:47.7,distance:1250,azimuth:.2,polar:.87,region:'gusu',fact:'47.7 m',factLabel:'现存塔高',description:'云岩寺塔立于虎丘山上，七层八角的砖塔轮廓与倾斜的塔身，让它成为姑苏历史悠久的城市标志。虎丘塔也是大运河世界遗产的组成部分。',source:'https://english.suzhou.gov.cn/szsenglish/szgt/201611/5e2a12729cfe4151ad21506c251487ee.shtml',sourceLabel:'苏州市人民政府',model:'pagoda'},
 {id:'arts',name:'苏州文化艺术中心',short:'文化艺术中心',en:'SUZHOU CULTURE & ARTS CENTRE',category:'湖畔文化',lon:120.7014,lat:31.3245,height:30,distance:1750,azimuth:2.8,polar:.92,region:'sip',fact:'金鸡湖畔',factLabel:'城市文化空间',description:'剧场、展览和公共文化活动在金鸡湖畔相遇。文化艺术中心与月光码头、国际博览中心共同组成湖东北岸的城市公共空间。',source:'https://jinjilake.sipac.gov.cn/zuixinzixun_article-342-4252.html',sourceLabel:'金鸡湖景区'},
 {id:'ligongdi',name:'李公堤',en:'LIGONGDI CAUSEWAY',category:'湖光水岸',lon:120.699,lat:31.295,height:12,distance:2900,azimuth:.7,polar:.83,region:'sip',fact:'湖上长堤',factLabel:'江南水岸',description:'长堤、石桥和滨水建筑把金鸡湖南岸连成一幅水乡长卷。传统建筑意象、当代公共艺术和沿湖生活，在这里交织。',source:'https://jinjilake.sipac.gov.cn/upload/202311/24/202311241459264601.pdf',sourceLabel:'金鸡湖景区'},
 {id:'lingering',name:'留园',en:'LINGERING GARDEN',category:'古典园林',lon:120.5886,lat:31.3174,height:10,distance:1150,azimuth:.35,polar:.62,region:'gusu',fact:'世界遗产',factLabel:'苏州古典园林',description:'厅堂、廊道、庭院与山石相互呼应，以紧凑的空间构成丰富的游赏层次。留园是苏州古典园林世界遗产的组成部分。',source:'https://whc.unesco.org/en/list/813',sourceLabel:'UNESCO 世界遗产中心'}
];
for(const l of landmarks)l.pos=project(l.lon,l.lat);

function facadeGeometry(geo){
 const g=geo.index?geo.toNonIndexed():geo;const p=g.attributes.position,n=g.attributes.normal;const uv=new Float32Array(p.count*2),col=new Float32Array(p.count*3),source=new Uint8Array(p.count);const c=new THREE.Color('#adc6c2');
 for(let i=0;i<p.count;i++){uv[i*2]=(Math.abs(n.getX(i))>.7?p.getZ(i):p.getX(i))+1000;uv[i*2+1]=p.getY(i);col.set([c.r,c.g,c.b],i*3);source[i]=2;}
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('heightSource',new THREE.BufferAttribute(source,1));return g;
}
export function buildLandmarks(scene,materials,replacements=[]){
 const root=new THREE.Group(),pickables=[];
 const stone=new THREE.MeshStandardMaterial({color:'#d3c3a8',roughness:1});const roof=new THREE.MeshStandardMaterial({color:'#686d61',roughness:1});
 const trim=new THREE.MeshStandardMaterial({color:'#c8d8d0',roughness:.4,metalness:.3,emissive:'#86dfce',emissiveIntensity:0});
 const invis=new THREE.MeshBasicMaterial({visible:false});
 function mesh(geo,mat,group,l){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;m.userData.landmark=l.id;group.add(m);pickables.push(m);return m;}
 for(const l of landmarks){
  const match=replacements.find(r=>r.name===l.name||(l.id==='tiger'&&/云岩寺塔|虎丘塔/.test(r.name)));
  if(match){l.pos=[match.x,match.z];[l.lon,l.lat]=unproject(match.x,match.z);l.sourceOSM=match.id;}
  const group=new THREE.Group();group.position.set(l.pos[0],0,l.pos[1]);group.userData.landmark=l.id;root.add(group);
  if(l.model==='gate'){
   const s=new THREE.Shape();s.moveTo(-76,0);s.lineTo(-76,213);s.bezierCurveTo(-76,271,-41,301.8,0,301.8);s.bezierCurveTo(41,301.8,76,271,76,213);s.lineTo(76,0);s.lineTo(30,0);s.lineTo(30,195);s.bezierCurveTo(30,219,17,234,0,234);s.bezierCurveTo(-17,234,-30,219,-30,195);s.lineTo(-30,0);s.closePath();
   const g=new THREE.ExtrudeGeometry(s,{depth:54,bevelEnabled:false,curveSegments:24});g.translate(0,0,-27);g.rotateY(Math.PI/2);mesh(facadeGeometry(g),materials.buildings,group,l);
   for(const dz of [-73,73]){const rail=mesh(new THREE.BoxGeometry(1.5,203,1.5),trim,group,l);rail.position.set(27,101.5,dz);}
  }else if(l.model==='ifs'){
   const shape=new THREE.Shape();const r=43;for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;const x=Math.cos(a)*r,z=Math.sin(a)*r;i?shape.lineTo(x,z):shape.moveTo(x,z);}shape.closePath();
   const g=new THREE.ExtrudeGeometry(shape,{depth:450,steps:30,bevelEnabled:false});g.rotateX(-Math.PI/2);
   const p=g.attributes.position;for(let i=0;i<p.count;i++){const h=p.getY(i),t=h/450;const taper=1-.2*t-.58*Math.pow(Math.max(0,(t-.76)/.24),1.3);p.setX(i,p.getX(i)*taper+Math.pow(t,4)*13);p.setZ(i,p.getZ(i)*taper);}g.computeVertexNormals();mesh(facadeGeometry(g),materials.buildings,group,l);
  }else if(l.model==='pagoda'){
   const tower=new THREE.Group();tower.rotation.z=-.045;group.add(tower);
   for(let i=0;i<7;i++){const radius=7.2-i*.53,h=5.6;const body=mesh(new THREE.CylinderGeometry(radius*.94,radius,h,8),stone,tower,l);body.position.y=3.1+i*6.2;const eave=mesh(new THREE.CylinderGeometry(radius+.85,radius+1.8,1.2,8),roof,tower,l);eave.position.y=6+i*6.2;}
   const top=mesh(new THREE.ConeGeometry(3.5,4.3,8),roof,tower,l);top.position.y=45.55;
  }
  // Invisible raycast proxy for footprint-based landmarks; rendering stays in the OSM layer.
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(l.model?80:140,l.height+10,l.model?80:140),invis);proxy.position.y=(l.height+10)/2;proxy.userData.landmark=l.id;group.add(proxy);pickables.push(proxy);
 }
 scene.add(root);
 const ring=new THREE.Mesh(new THREE.RingGeometry(78,82,96),new THREE.MeshBasicMaterial({color:'#c89347',transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=5;ring.visible=false;scene.add(ring);
 return{root,pickables,select(id){const l=landmarks.find(l=>l.id===id);ring.visible=!!l;if(l){ring.position.set(l.pos[0],5,l.pos[1]);const size=l.model?1:1.5;ring.scale.setScalar(size);}},update(n){trim.emissiveIntensity=n*1.8;stone.emissive.set('#ffb868');stone.emissiveIntensity=n*.12;},get positions(){return landmarks;}};
}
