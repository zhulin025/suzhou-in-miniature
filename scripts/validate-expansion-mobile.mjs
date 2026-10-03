const t=await taskSpace(4),p=t.page('p2'),fs=await import('node:fs/promises');
const ids=['chongqing','xian','guilin','harbin','xiamen','quanzhou','lhasa','dunhuang'];
const results=[],assert=(v,msg)=>{if(!v)throw new Error(msg);};
const frames=n=>p.evaluate(n=>new Promise(r=>{const f=()=>--n<=0?r(true):requestAnimationFrame(f);requestAnimationFrame(f);}),n);
const capture=async name=>{const data=await p.evaluate(()=>__CITY__.capture());await fs.writeFile('/tmp/city-expansion/'+name+'.png',Buffer.from(data.split(',')[1],'base64'));};
for(const id of ids){try{
 await p.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await p.cdp('Emulation.setTouchEmulationEnabled',{enabled:false});
 await p.goto('http://127.0.0.1:5173/cities/'+id+'/');await p.waitForFunction(()=>window.__CITY__?.ready,undefined,{timeout:15000});
 if(id==='lhasa'){await p.evaluate(()=>__CITY__.setTime(0));await frames(2);await capture('lhasa');await p.evaluate(()=>__CITY__.goTo('potala'));await frames(2);await capture('lhasa-detail');await p.evaluate(()=>__CITY__.goTo('all'));}
 await p.evaluate(()=>{__CITY__.enterWalk();const s=__CITY__.shops[0];__CITY__.setCamera(s.door,s.inside);});await frames(2);await capture(id+'-shop-door');
 const shop=await p.evaluate(()=>__CITY__.shops[0]);await p.keyboard.down('w');
 try{await p.waitForFunction(z=>__CITY__.getCamera()[2]<z+1.4,shop.z,{timeout:8000});}finally{await p.keyboard.up('w');}
 assert(await p.evaluate(()=>{const a=__CITY__,c=a.getCamera();return a.isWalkable(c[0],c[2]);}),id+' shop walking');await capture(id+'-shop-inside');
 await p.evaluate(()=>{__CITY__.exitWalk();__CITY__.goTo('all');});
 await p.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await p.cdp('Emulation.setTouchEmulationEnabled',{enabled:true});await frames(3);await capture(id+'-mobile');
 await p.click('#walk');
 const rect=await p.evaluate(()=>{const r=document.querySelector('.walk-joystick').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
 const before=await p.evaluate(()=>__CITY__.getCamera());
 const point=(x,y)=>[{id:1,x,y,radiusX:2,radiusY:2,force:1}];
 await p.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:point(rect.x,rect.y)});await p.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:point(rect.x+17,rect.y-25)});await frames(12);await p.cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await p.evaluate(()=>__CITY__.getCamera());const moved=Math.hypot(after[0]-before[0],after[2]-before[2]);assert(moved>.1,id+' joystick movement');await frames(5);const stopped=await p.evaluate(()=>__CITY__.getCamera());assert(Math.hypot(stopped[0]-after[0],stopped[2]-after[2])<.02,id+' joystick release');
 const yaw=await p.evaluate(()=>__CITY__.getState().yaw);await p.cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:point(280,450)});await p.cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:point(335,455)});await p.cdp('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await frames(2);assert(Math.abs(await p.evaluate(()=>__CITY__.getState().yaw)-yaw)>.05,id+' touch look');
 await p.click('#exit-walk');assert(!await p.evaluate(()=>__CITY__.getState().walk),id+' mobile exit');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' mobile overflow');
 results.push({city:id,passed:true,shop:shop.name,joystickMoved:moved});
}catch(e){results.push({city:id,passed:false,error:String(e)});}console.log(JSON.stringify(results.at(-1)));await fs.writeFile('/tmp/city-expansion/mobile-shops.json',JSON.stringify(results,null,2));}
