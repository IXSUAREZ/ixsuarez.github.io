/* Before/after motion evidence; uses the same real-browser runtime as the dock tests. */
const {chromium, webkit} = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
let browser;
(async () => {
  const engine = process.env.DOCK_ENGINE || 'chromium';
  const label = process.env.DOCK_LABEL || 'after';
  const base = process.env.DOCK_URL || 'http://127.0.0.1:8970';
  const out = path.resolve(__dirname, '../../output/playwright/dock-motion', engine, label);
  await fs.mkdir(out, {recursive:true});
  browser = await ({chromium,webkit}[engine]).launch({headless:true});
  const ctx = await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:out,size:{width:390,height:844}}});
  const page = await ctx.newPage();
  await page.goto(base + '/learn/weather-and-safety/how-to-read-a-taf/');
  await page.waitForSelector('[data-compact-dock]');
  await page.evaluate(async()=>{await document.fonts.ready;});
  await page.waitForTimeout(300);
  await page.screenshot({path:path.join(out,'expanded.png')});
  const profile = await page.evaluate(async () => {
    const nav = document.querySelector('[data-compact-dock]'), shell = nav.querySelector('.liquid-dock-shell');
    const icon = nav.querySelector('.liquid-dock-menu-icon') || nav.querySelector('.nav-menu-toggle .av-icon');
    async function sample(y, targetWidth) {
      const frames = [], start = performance.now();
      window.scrollTo({top:y,behavior:'instant'});
      await new Promise(resolve => {
        function frame(now) {
          const r = shell.getBoundingClientRect(), i = icon.getBoundingClientRect();
          frames.push({ms:now-start,width:r.width,iconWidth:i.width,iconHeight:i.height,state:nav.dataset.compactDock});
          if(now-start<1400)requestAnimationFrame(frame);else resolve();
        }
        requestAnimationFrame(frame);
      });
      const intervals = frames.slice(1).map((f,i)=>f.ms-frames[i].ms).sort((a,b)=>a-b);
      return {settledMs:frames.find(f=>Math.abs(f.width-targetWidth)<.5)?.ms,
        frameIntervalMedianMs:intervals[Math.floor(intervals.length*.5)],frameIntervalP95Ms:intervals[Math.floor(intervals.length*.95)],
        framesOver34ms:intervals.filter(v=>v>34).length,frames};
    }
    const expandedWidth = shell.getBoundingClientRect().width;
    const collapse = await sample(500,56), expand = await sample(470,expandedWidth);
    return {collapse,expand};
  });
  await page.evaluate(()=>window.scrollTo({top:600,behavior:'instant'}));
  await page.waitForTimeout(label==='before'?1200:300);
  await page.screenshot({path:path.join(out,'collapsed.png')});
  await fs.writeFile(path.join(out,'profile.json'),JSON.stringify({engine,label,base,...profile},null,2));
  const video = page.video(); await ctx.close(); await video.saveAs(path.join(out,'motion.webm'));
  await browser.close();
  console.log(JSON.stringify({engine,label,collapseMs:profile.collapse.settledMs,expandMs:profile.expand.settledMs,p95:[profile.collapse.frameIntervalP95Ms,profile.expand.frameIntervalP95Ms],out}));
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
