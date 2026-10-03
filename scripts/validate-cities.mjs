// Run with: ego-browser nodejs < scripts/validate-cities.mjs
// Resume the single TaskSpace created for this build. Edit config for your QA session.
// Ego's Node runtime is isolated: it does not inherit the launching shell's environment.
const config = { taskSpaceId:2, output:'/tmp/city-validation', onlyCities:null };
const fs = await import('node:fs/promises');
const path = await import('node:path');
const task = await taskSpace(config.taskSpaceId);
const page = task.page('p1');
const output = config.output;
await fs.mkdir(output, { recursive: true });
const cities = config.onlyCities || ['hangzhou','shanghai','nantong','wuxi','changzhou','nanjing','wenzhou','ningbo','guangzhou','shenzhen','beijing','datong','changsha','wuhan','qingdao','dalian'];
const results = [];
const frames = async n => page.evaluate(n => new Promise(resolve => {
  const step = () => --n <= 0 ? resolve(true) : requestAnimationFrame(step);
  requestAnimationFrame(step);
}), n);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
await page.cdp('Emulation.setDeviceMetricsOverride', { width:1440,height:1000,deviceScaleFactor:1,mobile:false });
await page.cdp('Emulation.setTouchEmulationEnabled', { enabled:false });
for (const city of cities) {
  try {
    await page.goto(`http://127.0.0.1:5173/cities/${city}/`);
    await page.waitForFunction(city => window.__CITY__?.ready && window.__CITY__.city===city && getComputedStyle(document.querySelector('.loading')).visibility === 'hidden', city, { timeout:20000 });
    await page.evaluate(() => window.__CITY__.setTime(0));
    await frames(5);
    const day = await page.evaluate(() => window.__CITY__.metrics());
    assert(day.city === city && day.triangles > 10000 && day.errors.length === 0, `${city}: renderer failed`);
    await page.screenshot({ path:path.join(output,`${city}-day.png`) });
    const bookmarks = await page.evaluate(() => window.__CITY__.places.slice(1).map(p => ({ id:p.id, name:p.name, walk:p.walk })));
    for (const bookmark of bookmarks) {
      await page.evaluate(id => window.__CITY__.goTo(id), bookmark.id);
      await frames(2);
      assert(await page.evaluate(() => window.__CITY__.getCamera().every(Number.isFinite)), `${city}: invalid camera`);
    }
    await page.evaluate(() => window.__CITY__.goTo(window.__CITY__.places[1].id));
    await frames(3);
    await page.screenshot({ path:path.join(output,`${city}-detail.png`) });
    await page.evaluate(() => window.__CITY__.goTo('all'));
    await page.click('#night');
    await page.waitForFunction(() => window.__CITY__.getState().night > .99, undefined, { timeout:10000 });
    await page.screenshot({ path:path.join(output,`${city}-night.png`) });
    const night = await page.evaluate(() => window.__CITY__.metrics());
    await page.click('#day');
    await page.click('#walk');
    assert(await page.evaluate(() => window.__CITY__.getState().walk), `${city}: walk not enabled`);
    for (const bookmark of bookmarks) {
      await page.selectOption('#walk-destination',bookmark.id);
      const position=await page.evaluate(() => window.__CITY__.getCamera());
      assert(Math.hypot(position[0]-bookmark.walk[0],position[2]-bookmark.walk[2])<.01,`${city}: walking destination failed`);
    }
    await page.selectOption('#walk-destination','all');
    const before = await page.evaluate(() => window.__CITY__.getCamera());
    await page.keyboard.down('w');
    await frames(35);
    await page.keyboard.up('w');
    const after = await page.evaluate(() => window.__CITY__.getCamera());
    const movement = Math.hypot(after[0]-before[0],after[2]-before[2]);
    const safe = await page.evaluate(() => {
      const app=window.__CITY__, p=app.getCamera();
      return app.isWalkable(p[0],p[2]) && app.places.every(p=>app.isWalkable(p.walk[0],p.walk[2])) && app.shops.every(p=>app.isWalkable(p.door[0],p.door[2]) && app.isWalkable(p.inside[0],p.inside[2]));
    });
    assert(movement > .05 && safe, `${city}: walk movement/collision failed (${movement})`);
    await page.screenshot({ path:path.join(output,`${city}-walk.png`) });
    await page.keyboard.press('Escape');
    assert(!await page.evaluate(() => window.__CITY__.getState().walk), `${city}: escape failed`);
    results.push({ city, passed:true, day, night, bookmarks, movement, safe });
    console.log(JSON.stringify({ city, passed:true, triangles:day.triangles, calls:day.calls, movement:+movement.toFixed(2), landmarks:bookmarks.length }));
  } catch (error) {
    results.push({ city, passed:false, error:String(error) });
    console.log(JSON.stringify({ city, passed:false, error:String(error) }));
  }
  await fs.writeFile(path.join(output,'validation.json'),JSON.stringify({ viewport:[1440,1000], renderer:'WebGL2', results },null,2));
}
console.log({ passed:results.filter(r=>r.passed).length,total:cities.length,artifactDirectory:output });
if (results.some(r=>!r.passed)) process.exitCode=1;
