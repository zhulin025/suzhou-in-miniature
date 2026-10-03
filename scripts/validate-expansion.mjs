// Run: ego-browser nodejs < scripts/validate-expansion.mjs
// Keep this task ID in sync with the one TaskSpace used for the current QA goal.
const task=await taskSpace(4),page=task.page('p2'),fs=await import('node:fs/promises');
const output='/tmp/city-expansion';await fs.mkdir(output,{recursive:true});
const cities=['chongqing','xian','guilin','harbin','xiamen','quanzhou','lhasa','dunhuang'];
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const frames=async n=>page.evaluate(n=>new Promise(resolve=>{const step=()=>--n<=0?resolve(true):requestAnimationFrame(step);requestAnimationFrame(step);}),n);
const capture=async name=>{const data=await page.evaluate(()=>window.__CITY__.capture());await fs.writeFile(`${output}/${name}.png`,Buffer.from(data.split(',')[1],'base64'));};
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
const results=[];
for(const city of cities){
 try{
  await page.goto(`http://127.0.0.1:5173/cities/${city}/`);
  await page.waitForFunction(()=>window.__CITY__?.ready&&getComputedStyle(document.querySelector('.loading')).visibility==='hidden',undefined,{timeout:20000});
  await page.evaluate(()=>window.__CITY__.setTime(0));await frames(2);
  const day=await page.evaluate(()=>window.__CITY__.metrics());assert(day.errors.length===0&&day.landmarks.length===4,`${city}: render`);
  await capture(city);
  // Actual zoom button and canvas dragging, rather than only camera setters.
  const initial=await page.evaluate(()=>window.__CITY__.getCamera());
  await page.click('[data-action="plus"]');const zoom=await page.evaluate(()=>window.__CITY__.getCamera());
  assert(Math.hypot(...initial)>Math.hypot(...zoom),`${city}: zoom`);
  await page.click('[data-action="labels"]');
  await page.mouse.move(970,550);await page.mouse.down();await page.mouse.move(1060,580);await page.mouse.up();await frames(4);
  const orbit=await page.evaluate(()=>window.__CITY__.getCamera());assert(Math.hypot(...orbit.map((v,i)=>v-zoom[i]))>.5,`${city}: rotate`);
  await page.click('[data-action="labels"]');
  const places=await page.evaluate(()=>window.__CITY__.places.slice(1));
  for(const p of places){await page.evaluate(id=>window.__CITY__.goTo(id),p.id);await frames(2);assert(await page.evaluate(()=>window.__CITY__.getCamera().every(Number.isFinite)),`${city}: landmark camera`);}
  await page.evaluate(id=>window.__CITY__.goTo(id),places[0].id);await frames(2);await capture(city+'-detail');
  await page.evaluate(()=>window.__CITY__.goTo('all'));
  await page.click('#night');await page.waitForFunction(()=>window.__CITY__.getState().night>.99,undefined,{timeout:20000});await capture(city+'-night');
  await page.click('#day');await page.click('#walk');assert(await page.evaluate(()=>window.__CITY__.getState().walk),`${city}: walk`);
  for(const p of places){await page.selectOption('#walk-destination',p.id);const camera=await page.evaluate(()=>window.__CITY__.getCamera());assert(Math.hypot(camera[0]-p.walk[0],camera[2]-p.walk[2])<.01,`${city}: walk destination`);}
  await page.selectOption('#walk-destination','all');const before=await page.evaluate(()=>window.__CITY__.getCamera());await page.keyboard.down('w');await frames(12);await page.keyboard.up('w');const after=await page.evaluate(()=>window.__CITY__.getCamera());const moved=Math.hypot(after[0]-before[0],after[2]-before[2]);assert(moved>.05,`${city}: movement`);
  await capture(city+'-walk');await page.keyboard.press('Escape');assert(!await page.evaluate(()=>window.__CITY__.getState().walk),`${city}: exit`);
  const safe=await page.evaluate(()=>{const a=window.__CITY__;return a.places.every(p=>a.isWalkable(p.walk[0],p.walk[2]))&&a.shops.every(s=>a.isWalkable(s.door[0],s.door[2])&&a.isWalkable(s.inside[0],s.inside[2]));});assert(safe,`${city}: safety`);
  results.push({city,passed:true,triangles:day.triangles,calls:day.calls,moved,landmarks:day.landmarks});
 }catch(e){results.push({city,passed:false,error:String(e)});}
 console.log(JSON.stringify(results.at(-1)));
 await fs.writeFile(output+'/desktop.json',JSON.stringify(results,null,2));
}
if(results.some(r=>!r.passed))throw new Error('City QA failed; inspect desktop.json');
