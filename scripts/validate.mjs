import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const failures=[],checks=[],metrics=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const check=async(name,fn)=>{try{await fn();checks.push(name);console.log('PASS',name);}catch(e){failures.push({name,error:e.message});console.log('FAIL',name,e.message);}};
const state=()=>page.evaluate(()=>window.__SUZHOU__.getState());
const cam=()=>page.evaluate(()=>window.__SUZHOU__.getCamera());
const dist=(a,b)=>Math.hypot(...a.map((n,i)=>n-b[i]));
await fs.mkdir('artifacts',{recursive:true});
try {
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>window.__SUZHOU__?.ready);await page.waitForTimeout(1200);
 await check('WebGL scene ready without errors',async()=>assert.equal(errors.length,0));
 await page.evaluate(()=>window.__SUZHOU__.setTime(0));await page.screenshot({path:'artifacts/final-day.png'});
 metrics.push(await page.evaluate(()=>window.__SUZHOU__.metrics()));
 await check('Orbit drag changes viewpoint',async()=>{const a=await cam();await page.mouse.move(1000,240);await page.mouse.down();await page.mouse.move(1170,280,{steps:14});await page.mouse.up();await page.waitForTimeout(600);assert.ok(dist(a,await cam())>5);});
 await check('Wheel zoom approaches the target',async()=>{const a=await cam(),target=await page.evaluate(()=>window.__SUZHOU__.metrics().target);await page.mouse.move(1060,310);await page.mouse.wheel(0,-420);await page.waitForTimeout(450);assert.ok(dist(await cam(),target)<dist(a,target));});
 await check('Home button returns to full view',async()=>{await page.locator('[data-action="home"]').click();await page.waitForTimeout(1800);assert.equal((await state()).place,'all');assert.ok(dist(await cam(),[225,196,273])<.1);});
 await check('Day / night changes lights and interface',async()=>{await page.locator('#night').click();await page.waitForTimeout(3300);assert.ok((await state()).night>.99);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('night')),true);await page.screenshot({path:'artifacts/final-night.png'});await page.keyboard.press('n');await page.waitForTimeout(3300);assert.ok((await state()).night<.01);});
 for(const id of ['pingjiang','garden','tiger','lake','taihu']) {
  await check(`Landmark navigation: ${id}`,async()=>{await page.locator(`.destination[data-place="${id}"]`).click();await page.waitForTimeout(1800);assert.equal((await state()).place,id);assert.equal(await page.locator(`.destination[data-place="${id}"]`).getAttribute('aria-pressed'),'true');await page.screenshot({path:`artifacts/detail-${id}.png`});});
 }
 await check('Geometry and water normal diagnostic controls',async()=>{await page.evaluate(()=>{window.__SUZHOU__.goTo('all');window.__SUZHOU__.setDebug('wireframe');});await page.waitForTimeout(200);await page.screenshot({path:'artifacts/debug-wireframe.png'});await page.evaluate(()=>window.__SUZHOU__.setDebug('water-normals'));await page.waitForTimeout(200);await page.screenshot({path:'artifacts/debug-water-normals.png'});await page.evaluate(()=>window.__SUZHOU__.setDebug('final'));assert.equal(errors.length,0);});
 await check('Labels can be hidden and restored',async()=>{await page.locator('[data-action="labels"]').click();assert.equal((await state()).labels,false);await page.locator('[data-action="labels"]').click();assert.equal((await state()).labels,true);});
 await check('Scene screenshot downloads a valid PNG',async()=>{const download=page.waitForEvent('download');await page.locator('[data-action="capture"]').click();const file=await download;await file.saveAs('artifacts/saved-scene.png');const buffer=await fs.readFile('artifacts/saved-scene.png');assert.equal(buffer.subarray(1,4).toString(),'PNG');assert.ok(buffer.length>10000);});
 await check('Walking movement and mouse look',async()=>{await page.locator('#walk').click();assert.equal((await state()).walk,true);const a=await cam();await page.keyboard.down('KeyW');await page.waitForTimeout(650);await page.keyboard.up('KeyW');assert.ok(dist(a,await cam())>1);await page.mouse.move(780,480);await page.mouse.down();await page.mouse.move(900,470,{steps:10});await page.mouse.up();assert.ok(Math.abs((await state()).yaw)>.3);await page.screenshot({path:'artifacts/final-walk.png'});});
 await check('Water and building collisions, bridge and garden access',async()=>{const results=await page.evaluate(()=>[[0,30],[-13,-3],[63,14],[0,42],[-31,20],[-17,-19],[5.6,36]].map(([x,z])=>window.__SUZHOU__.isWalkable(x,z)));assert.deepEqual(results,[false,false,false,true,true,true,true]);});
 await check('Walking over a bridge follows its curved surface',async()=>{await page.evaluate(()=>window.__SUZHOU__.setCamera([5.3,3,42],[0,1,0]));await page.locator('#reset-walk').click();await page.evaluate(()=>window.__SUZHOU__.setCamera([5.3,3,42],[0,1,0]));const yaw=(await state()).yaw;assert.equal(yaw,0);await page.keyboard.down('KeyA');await page.waitForTimeout(1450);await page.keyboard.up('KeyA');const position=await cam();assert.ok(Math.abs(position[0])<1.3,JSON.stringify(position));assert.ok(position[1]>5,JSON.stringify(position));});
 await check('Escape restores orbit controls',async()=>{await page.keyboard.press('Escape');assert.equal((await state()).walk,false);await page.locator('[data-action="home"]').click();await page.waitForTimeout(1800);assert.equal((await state()).place,'all');});
 await check('Guided tour advances and can be paused',async()=>{await page.evaluate(()=>window.__SUZHOU__.resume());await page.locator('#tour').click();await page.waitForTimeout(7800);assert.equal((await state()).place,'garden');await page.locator('#tour').click();assert.equal((await state()).tour,false);});
 await check('About dialog supports focus and Escape',async()=>{await page.locator('[data-nav="about"]').click();assert.equal(await page.locator('.modal-backdrop').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.modal-backdrop').isVisible(),false);});
 await check('High quality and far camera remain renderable',async()=>{await page.evaluate(()=>{window.__SUZHOU__.setQuality('high');window.__SUZHOU__.setTime(0);window.__SUZHOU__.setCamera([250,210,295],[0,1,0]);});await page.waitForTimeout(350);await page.screenshot({path:'artifacts/far-high.png'});metrics.push(await page.evaluate(()=>window.__SUZHOU__.metrics()));await page.evaluate(()=>window.__SUZHOU__.setQuality('standard'));assert.equal(errors.length,0);});
 await check('Alternate procedural seed remains renderable',async()=>{await page.goto('http://127.0.0.1:5173/?seed=91');await page.waitForFunction(()=>window.__SUZHOU__?.ready);await page.evaluate(()=>window.__SUZHOU__.setTime(0));await page.waitForTimeout(300);await page.screenshot({path:'artifacts/stress-seed-91.png'});assert.equal((await page.evaluate(()=>window.__SUZHOU__.metrics())).seed,91);});
 await check('Mobile layout and touch walking controls',async()=>{await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.__SUZHOU__?.ready);await page.waitForTimeout(800);await page.evaluate(()=>window.__SUZHOU__.setTime(0));await page.screenshot({path:'artifacts/mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#walk').click();assert.equal(await page.locator('.walk-touch').isVisible(),true);await page.screenshot({path:'artifacts/mobile-walk.png'});await page.locator('#exit-walk').click();assert.equal((await state()).walk,false);});
 await check('No browser or shader errors across all modes',async()=>assert.deepEqual(errors,[]));
} finally {
 await fs.writeFile('artifacts/validation.json',JSON.stringify({date:new Date().toISOString(),checks,failures,errors,metrics},null,2));
 await browser.close();
}
console.log(JSON.stringify({passed:checks.length,failures},null,2));if(failures.length)process.exit(1);
