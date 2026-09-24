/* Headless regression/coverage runner. Uses a fresh browser profile, never the
   user's browser session. Run with NODE_PATH pointing to bundled Playwright.
   Modes: behavior (default), coverage [start] [end]. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const zlib = require('node:zlib');
const ROOT = path.resolve(__dirname, '../..');
const BASE = process.env.JOURNAL_URL || 'http://127.0.0.1:8965';
const OUT = path.join(ROOT, 'output/playwright/journal');
const article = '/learn/weather-and-safety/how-to-read-a-taf/';
const blog = '/blog/private-pilot-cost-louisville-ky/';
const solo = '/simply-endorsed/blog/first-solo-endorsement/';
const results = [];
let activePage;

async function check(name, run) {
  try { await run(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log('FAIL ' + name + ': ' + error.message.slice(0,200)); if(activePage) console.log(await activePage.evaluate(()=>({url:location.href,width:innerWidth,styles:[...document.styleSheets].map(s=>s.href),size:document.body.dataset.readerSize})));  }
}
async function context(browser, options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  ctx.setDefaultTimeout(8000);
  // Typeface is the OS system stack; remote font CSS is unnecessary for tests.
  await ctx.route('**/fonts.googleapis.com/**', route => route.abort());
  if (new URL(BASE).hostname === '127.0.0.1') await ctx.route('https://suarezcfi.com/assets/**', route => {
    const local = new URL(route.request().url()).pathname;
    return route.fulfill({ path: path.join(ROOT, local) });
  });
  return ctx;
}
async function load(page, route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  // Assert the new document and final cascade, not only network-idle: a busy
  // bulk sweep can observe the initial empty document before its first paint.
  await page.waitForFunction(() => document.readyState === 'complete' && document.querySelector('body.journal-article,body.journal-library') && document.querySelector('h1') && [...document.styleSheets].some(s => s.href && s.href.includes('/assets/journal.css')));
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal page overflow');
}
async function capture(page, name, fullPage = true) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage, animations: 'disabled' });
}
async function behavior(browser) {
  const ctx = await context(browser);
  const page = await ctx.newPage(); activePage=page; page.on('requestfailed',r=>console.log('REQUEST FAILED',r.url(),r.failure()));
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await check('473 article / 27 library content preservation', async () => {
    const report = JSON.parse(await fs.readFile(path.join(ROOT, 'docs/journal/preservation.json')));
    assert.equal(report.routes, 500); assert.equal(report.failures.length, 0);
  });
  await check('Script compression budget', async () => {
    assert.ok(zlib.gzipSync(await fs.readFile(path.join(ROOT, 'assets/journal.js'))).length < 12288);
  });
  await check('Complete chapters and one reader per page', async () => {
    await load(page, article);
    assert.equal(await page.locator('.journal-layout').count(), 1);
    assert.equal(await page.locator('.journal-chapters a').count(), await page.locator('.journal-layout > article :is(h2,h3,h4,h5,h6)').count());
    await noOverflow(page); await capture(page, 'representative-taf-desktop');
  });
  await check('Chapter links, focus, progress, and browser Back', async () => {
    await page.locator('.journal-chapters a[href="#wind"]').click();
    await page.waitForFunction(() => location.hash === '#wind' && document.querySelector('.journal-chapters a[href="#wind"]').getAttribute('aria-current') === 'location');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'wind');
    assert.ok(await page.evaluate(() => parseFloat(document.body.style.getPropertyValue('--journal-progress')) > 0));
    await capture(page, 'representative-taf-chapter', false);
    await page.goBack();
    assert.equal(new URL(page.url()).hash, '');
  });
  await check('Text size / motion preferences persist across articles', async () => {
    await page.locator('.journal-settings summary').click();
    await page.locator('button[data-reader-size="larger"]').click();
    assert.equal(await page.locator('.prose').first().evaluate(el => getComputedStyle(el).fontSize), '26px');
    await page.locator('input[data-reader-motion]').uncheck();
    await load(page, solo);
    assert.equal(await page.locator('body').getAttribute('data-reader-size'), 'larger');
    assert.equal(await page.locator('body').getAttribute('data-reader-motion'), 'off');
    assert.equal(await page.locator('.journal-layout').count(), 1);
    assert.equal(await page.locator('.journal-chapters a').count(), await page.locator('.journal-layout > article :is(h2,h3,h4,h5,h6)').count());
    await noOverflow(page);
    await capture(page, 'representative-solo-large');
  });
  await check('Keyboard settings escape and visible focus', async () => {
    await page.locator('.journal-settings summary').focus(); await page.keyboard.press('Enter');
    await page.locator('button[data-reader-size="standard"]').focus(); await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.journal-settings').getAttribute('open'), null);
    assert.ok(await page.locator('.journal-settings summary').evaluate(el => el === document.activeElement && getComputedStyle(el).outlineStyle !== 'none'));
  });
  await check('Theme persistence and menu coexistence', async () => {
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByRole('button', { name: 'Day', exact: true }).click();
    await page.keyboard.press('Escape');
    await load(page, blog);
    assert.equal(await page.locator('html').getAttribute('data-suarez-theme'), 'light');
    assert.equal(await page.locator('.journal-chapters a').count(), await page.locator('.journal-layout > article :is(h2,h3,h4,h5,h6)').count());
    await capture(page, 'representative-blog-day');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByRole('button', { name: 'System', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.suarezTheme === 'dark');
    assert.equal(await page.locator('html').getAttribute('data-suarez-theme'), 'dark');
  });
  await check('Reading text contrast in Day and Dark across all article templates', async () => {
    await page.emulateMedia({reducedMotion:'reduce'});
    for (const route of [article,blog,solo]) {
      await load(page,route);
      for (const theme of ['light','dark']) {
        await page.evaluate(theme=>document.documentElement.dataset.suarezTheme=theme,theme);
        const failures=await page.evaluate(()=>{
          function rgba(s) { const a=(s.match(/[\d.]+/g)||[]).map(Number);return [a[0],a[1],a[2],a.length>3?a[3]:1]; }
          function blend(f,b) { return f.slice(0,3).map((v,i)=>v*f[3]+b[i]*(1-f[3])); }
          function lum(c) { const a=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]; }
          return [...document.querySelectorAll('.prose p,.prose li,.prose th,.prose td,.prose blockquote,.article-header > p,.article-meta,.journal-chapters a,.seo-guide-item h3,.seo-guide-item p,.seo-guide-id,.seo-guide-note')].filter(el=>el.getClientRects().length&&el.textContent.trim()).map(el=>{
            let node=el,stack=[],bg=[255,255,255];while(node){stack.push(rgba(getComputedStyle(node).backgroundColor));node=node.parentElement;}
            stack.reverse().forEach(c=>bg=blend(c,bg));
            const style=getComputedStyle(el),fg=blend(rgba(style.color),bg),a=lum(fg),b=lum(bg);
            const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
            return {text:el.textContent.slice(0,60),ratio,minimum:parseFloat(style.fontSize)>=24?3:4.5};
          }).filter(r=>r.ratio<r.minimum);
        });
        assert.deepEqual(failures,[],route+' '+theme+': '+JSON.stringify(failures.slice(0,8)));
      }
    }
    await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await check('Reader controls clear the dock at narrow and short desktop sizes', async () => {
    for(const viewport of [{width:1440,height:500},{width:1100,height:1000},{width:1100,height:740}]) {
      await page.setViewportSize(viewport);await load(page,blog);
      await page.locator('.journal-settings summary').click();
      await page.locator('button[data-reader-size="standard"]').focus();
      const overlap=await page.evaluate(()=>{
        const a=document.querySelector('.journal-rail').getBoundingClientRect(),b=document.querySelector('.liquid-dock').getBoundingClientRect();
        return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
      });
      assert.equal(overlap,false,JSON.stringify(viewport));
      await capture(page,`representative-desktop-${viewport.width}-${viewport.height}`,false);
    }
  });
  await check('Mobile chapters collapse and link navigation', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await load(page, article);
    assert.equal(await page.locator('.journal-chapters').getAttribute('open'), null);
    await page.locator('.journal-chapters summary').click();
    await page.locator('.journal-chapters a[href="#wind"]').click();
    assert.equal(await page.locator('.journal-chapters').getAttribute('open'), null);
    await noOverflow(page); await capture(page, 'representative-taf-mobile-chapter', false);
  });
  await check('320px, larger text, wide table and FAQ', async () => {
    await page.setViewportSize({ width: 320, height: 740 }); await load(page, blog);
    await page.locator('.journal-settings summary').click();
    await page.locator('button[data-reader-size="larger"]').click();
    await noOverflow(page);
    assert.ok(await page.locator('.table-wrap').first().evaluate(el => el.scrollWidth > el.clientWidth));
    const faq = page.locator('.faq-item summary').nth(1);
    await faq.click(); assert.ok(await faq.evaluate(el => el.parentElement.open));
    await capture(page, 'representative-blog-320-larger');
  });
  await check('200% text zoom and native document search', async () => {
    await page.setViewportSize({ width: 720, height: 500 }); await load(page, article);
    await page.addStyleTag({ content: '.journal-layout > article { zoom:2; }' });
    await noOverflow(page);
    assert.ok(await page.evaluate(() => window.find('Probability groups')));
    await capture(page, 'representative-zoom-200');
  });
  await check('Reduced motion wins over saved preference', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await load(page, article);
    assert.equal(await page.locator('body').getAttribute('data-reader-motion'), 'off');
    assert.ok(await page.locator('input[data-reader-motion]').isDisabled());
    assert.equal(await page.locator('.journal-arriving').count(), 0);
  });
  await check('Fast scrolling never leaves invisible content', async () => {
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('.journal-settings summary').click();
    await page.locator('input[data-reader-motion]').check();
    assert.equal(await page.locator('body').getAttribute('data-reader-motion'),'on');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    assert.equal(await page.locator('.journal-layout > article p').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).opacity === '0' || getComputedStyle(n).visibility === 'hidden').length), 0);
  });
  await check('Print keeps article content and hides reading chrome', async () => {
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.journal-rail').isVisible(), false);
    assert.ok(await page.locator('.prose').first().isVisible());
    assert.equal(await page.locator('.prose p').first().evaluate(el=>getComputedStyle(el).color),'rgb(17, 17, 17)');
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await capture(page,'representative-print',false);
    await page.pdf({ path: path.join(OUT, 'taf-print.pdf'), format: 'A4', printBackground: false });
    await page.emulateMedia({ media: 'screen' });
  });
  await check('Library search, filters, and no-result state', async () => {
    await page.setViewportSize({ width: 1440, height: 1000 }); await load(page, '/learn/');
    const input = page.locator('.library-search-input'); await input.fill('weather');
    await page.waitForFunction(() => document.querySelectorAll('.library-search-result').length > 0);
    await page.locator('#library-search-stage').selectOption({ label: 'Instrument' });
    await page.waitForFunction(()=>new URL(location.href).searchParams.get('stage')==='Instrument');
    await page.waitForFunction(() => document.querySelectorAll('.library-search-result').length > 0);
    await input.fill('zzzz-no-such-lesson-zzzz');
    await page.waitForFunction(() => document.querySelector('.library-search-status').textContent === '0 results found');
    assert.ok(await page.locator('.library-search-empty').isVisible());
    await page.goBack();
    await page.waitForFunction(()=>document.querySelector('.library-search-input').value==='weather');
    assert.equal(await page.locator('#library-search-stage').inputValue(),'Instrument');
    await input.fill(''); await page.locator('#library-search-stage').selectOption('');
    await capture(page, 'representative-library'); await noOverflow(page);
  });
  await check('Current Blog category filtering and show-more behavior', async () => {
    await load(page,'/blog/');
    assert.equal(await page.locator('.blog-stories .blog-story:visible').count(),6);
    await page.locator('#blog-show-more').click();
    assert.equal(await page.locator('.blog-stories .blog-story:visible').count(),12);
    const category=page.locator('[data-blog-category]').nth(1);
    const value=await category.getAttribute('data-blog-category');await category.click();
    assert.ok(await page.locator('.blog-stories .blog-story:visible').evaluateAll((els,v)=>els.every(e=>e.dataset.category===v),value));
    await page.locator('[data-blog-category=""]').click();
    await capture(page,'release-blog-library');await noOverflow(page);
  });
  await check('JavaScript-disabled static chapters and content', async () => {
    const plain = await context(browser, { javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const p = await plain.newPage(); await load(p, article);
    assert.ok(await p.locator('.prose').first().isVisible());
    assert.ok(await p.locator('.journal-chapters a').count() > 10);
    assert.equal(await p.locator('.journal-settings').isVisible(), false);
    await noOverflow(p); await capture(p, 'representative-no-javascript'); await plain.close();
  });
  await check('Storage-blocked fallback', async () => {
    const blocked = await context(browser);
    await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked storage'); } }); });
    const p = await blocked.newPage(); await load(p, article);
    await p.locator('.journal-settings summary').click(); await p.locator('button[data-reader-size="large"]').click();
    assert.equal(await p.locator('body').getAttribute('data-reader-size'), 'large');
    await blocked.close();
  });
  await check('No uncaught browser errors', async () => assert.deepEqual(errors, []));
  await ctx.close();
  await fs.writeFile(path.join(ROOT, 'docs/journal/behavior.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (results.some(r => !r.passed)) process.exitCode = 1;
}

async function coverage(browser) {
  const inventory = JSON.parse(await fs.readFile(path.join(ROOT, 'docs/journal/preservation.json'))).pages;
  const start = Number(process.argv[3] || 0), end = Number(process.argv[4] || inventory.length);
  const selected = process.env.JOURNAL_INDEXES ? new Set(process.env.JOURNAL_INDEXES.split(',').map(Number)) : null;
  const reportName = selected ? `coverage-repair-${start}-${end}.json` : `coverage-${start}-${end}.json`;
  const data = [];
  if (selected) { try { data.push(...JSON.parse(await fs.readFile(path.join(OUT, reportName))).filter(r=>!selected.has(r.index))); } catch {} }
  let next = start, completed = 0;
  let writes = Promise.resolve();
  async function worker() {
  // Each worker owns independent desktop/mobile contexts.
  const contexts = await Promise.all([{ width:1440,height:1000 },{ width:390,height:844 }].map(viewport => context(browser, {viewport, reducedMotion:'reduce'})));
  const pages = await Promise.all(contexts.map(c => c.newPage()));
  while (next < Math.min(end, inventory.length)) {
    const i = next++;
    if (selected && !selected.has(i)) continue;
    const row = inventory[i];
    const captures = await Promise.all(pages.map(async (page, index) => {
      const device = index ? 'mobile' : 'desktop';
      const name = String(i).padStart(3,'0') + '-' + device;
      const errors=[]; const listen=e=>errors.push(e.message); page.on('pageerror',listen);
      try {
        await load(page,row.path);
        const metrics=await page.evaluate(() => {
          const article=document.querySelector('.journal-layout > article');
          const links=[...document.querySelectorAll('.journal-chapters a')];
          const missing=links.filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1))));
          const originalIds=[...document.querySelectorAll('[id]')].map(n=>n.id);
          return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
            title:document.querySelector('h1')?.textContent,readerCount:document.querySelectorAll('.journal-layout').length,
            chapters:links.length,missingAnchors:missing.length,duplicateIds:originalIds.length-new Set(originalIds).size,
            journalStylesLoaded:[...document.styleSheets].some(s=>s.href&&s.href.includes('/assets/journal.css')),
            bodyFont:article?getComputedStyle(article.querySelector('.prose')||article).fontSize:null,
            hiddenText:article?[...article.querySelectorAll('p')].filter(n=>getComputedStyle(n).visibility==='hidden'||getComputedStyle(n).opacity==='0').length:0};
        });
        await capture(page,name,true);
        await capture(page,name+'-opening',false);
        return {device,screenshot:'output/playwright/journal/'+name+'.png',opening:'output/playwright/journal/'+name+'-opening.png',metrics,errors,passed:metrics.journalStylesLoaded&&metrics.scrollWidth<=metrics.width+1&&metrics.missingAnchors===0&&metrics.hiddenText===0&&errors.length===0&&metrics.readerCount===(row.kind==='article'?1:0)&&(!metrics.bodyFont||metrics.bodyFont===(index?'18px':'20px'))};
      } catch(error) { return {device,passed:false,error:error.message}; }
      finally {page.off('pageerror',listen);}
    }));
    data.push({index:i,path:row.path,kind:row.kind,captures});
    completed++;
    if (completed%10===0) { const json=JSON.stringify([...data].sort((a,b)=>a.index-b.index),null,2); writes=writes.then(()=>fs.writeFile(path.join(OUT,reportName),json)); console.log(`${completed}/${selected?selected.size:end-start} routes captured`); }
  }
  await Promise.all(contexts.map(c=>c.close()));
  }
  await Promise.all(Array.from({length:3},()=>worker()));
  await writes;
  data.sort((a,b)=>a.index-b.index);
  await fs.writeFile(path.join(OUT,reportName),JSON.stringify(data,null,2));
  const failures=data.filter(r=>r.captures.some(c=>!c.passed)).map(r=>r.path);
  console.log(JSON.stringify({routes:data.length,failures}));
  if(failures.length)process.exitCode=1;
}
(async()=>{
  await fs.mkdir(OUT,{recursive:true});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try { await (process.argv[2]==='coverage'?coverage:behavior)(browser); }
  finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
