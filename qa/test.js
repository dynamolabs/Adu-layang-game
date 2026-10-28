// QA Adu Layang: node test.js [menit_bot]  (butuh phaser.min.js: env PHASER=path, cdnjs diblokir di sandbox)
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const PH = fs.readFileSync(process.env.PHASER || path.join(__dirname, 'phaser.min.js'));
const URL = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = process.env.OUT || __dirname;
const botMin = +process.argv[2] || 3;
const FONTS = !!process.env.HTTPS_PROXY; // huruf Google ikut dimuat kalau ada proxy
const results = []; const ok = (name, pass, info = '') => { results.push({ name, pass, info }); console.log((pass ? 'LULUS ' : 'GAGAL ') + name + (info ? '  ' + info : '')); };

async function open(browser, mobile) {
  const ctx = await browser.newContext({ ...(mobile ? devices['Pixel 7'] : { viewport: { width: 500, height: 860 } }), ignoreHTTPSErrors: true });
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') page.errors.push('console: ' + m.text()); });
  await page.route('**/*', r => { const u = r.request().url();
    if (u.includes('phaser')) return r.fulfill({ body: PH, contentType: 'application/javascript' });
    if (u.startsWith('file:') || (FONTS && /fonts\.(googleapis|gstatic)\.com/.test(u))) return r.continue(); return r.abort(); });
  await page.goto(URL);
  await page.waitForFunction(() => window.__g && __g.scene.isActive('menu'));
  return { ctx, page };
}
const startPlay = async page => { await page.keyboard.press('Enter'); await page.waitForFunction(() => __g.scene.isActive('play') && window.__play); };
const S = page => page.evaluate(() => { const p = __play; return { t: +p.time0.toFixed(1), score: p.score, cuts: p.cuts, hp: +p.k.hp.toFixed(2), y: Math.round(p.k.y), over: p.over, cause: p.cause, opps: p.opps.filter(o => o.state === 'fly').length, birds: p.birds.length, fps: Math.round(__g.loop.actualFps) }; });

const BOT = `
window.__botInput = { hold: false, x: 225 };
window.__fps = [];
window.__botMode = window.__botMode || 'smart';
setInterval(() => {
  const p = window.__play; if (!p || p.over) return;
  __fps.push(__g.loop.actualFps);
  const k = p.k; let ty = 300, tx = 225;
  const opp = p.opps.find(o => o.state === 'fly');
  if (opp) { tx = opp.x + (opp.side ? 110 : -110); ty = opp.y - 70; }
  for (const b of p.birds) { // hindari burung yang akan lewat
    const eta = b.warn > 0 ? b.warn + Math.abs((b.vx > 0 ? -30 : 480) - k.x) / Math.abs(b.vx) : (b.x - k.x) / -b.vx;
    if (eta > -0.2 && eta < 2.2 && Math.abs(b.y - ty) < 80) ty = b.y > 330 ? b.y - 110 : b.y + 110;
  }
  ty = Math.max(110, Math.min(520, ty)); tx = Math.max(30, Math.min(420, tx));
  let hold = k.y > ty || (k.y > ty - 30 && k.vy > 40);
  if (p.crossing) hold = __botMode === 'smart';
  if (k.y > 540) hold = true;
  __botInput.hold = hold; __botInput.x = tx;
}, 33);`;

(async () => {
  const b = await chromium.launch(FONTS ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  // 1. Menu + bot bermain di laptop
  { const { page } = await open(b, false);
    await page.screenshot({ path: path.join(OUT, 'menu.png') });
    await startPlay(page);
    await page.addScriptTag({ content: BOT });
    const t0 = Date.now(); let s, maxCuts = 0, shot = false;
    while (Date.now() - t0 < botMin * 60000) {
      await page.waitForTimeout(2000); s = await S(page); maxCuts = s.cuts;
      if (!shot && s.t > 50) { shot = true; await page.screenshot({ path: path.join(OUT, 'play.png') }); }
      if (s.over) break;
    }
    const fps = await page.evaluate(() => { const f = __fps.slice(60).sort((a, b) => a - b); return { med: Math.round(f[f.length >> 1] || 0), p5: Math.round(f[Math.floor(f.length * 0.05)] || 0) }; });
    if (s.over) { await page.waitForTimeout(1800); await page.screenshot({ path: path.join(OUT, 'gameover.png') }); }
    ok('bot bermain tanpa error', page.errors.length === 0, page.errors.slice(0, 3).join(' | '));
    ok('bot memutus benang lawan', maxCuts >= 1, `putus=${maxCuts}, bertahan ${s.t} dtk, skor ${s.score}, sebab=${s.cause || 'masih hidup'}`);
    ok('fps stabil', fps.med >= 50, `median ${fps.med}, p5 ${fps.p5}`);
    fs.writeFileSync(path.join(OUT, 'bot-run.json'), JSON.stringify({ final: s, fps }, null, 1));
    // main lagi
    if (s.over) { await page.keyboard.press('Enter'); await page.waitForTimeout(500); const r = await S(page); ok('MAIN LAGI mereset game', !r.over && r.score === 0); }
    await page.context().close(); }
  // 2. Tanpa input: layangan turun dan nyangkut di kabel
  { const { page } = await open(b, false); await startPlay(page);
    await page.evaluate(() => { window.__botInput = { hold: true, x: 225 }; setTimeout(() => window.__botInput = { hold: false, x: 225 }, 300); });
    await page.waitForTimeout(9000); const s = await S(page);
    ok('kabel listrik memutus benang', s.over && s.cause === 'kabel', JSON.stringify(s)); await page.context().close(); }
  // 3. Burung
  { const { page } = await open(b, false); await startPlay(page);
    await page.evaluate(() => { window.__botInput = { hold: true, x: 225 }; });
    await page.waitForTimeout(800);
    await page.evaluate(() => { const p = __play; p.birds.push({ x: p.k.x - 70, y: p.k.y, vx: 260, warn: 0, flap: 0, chirped: false }); window.__botInput = null; window.__botInput = { hold: false, x: 225 }; p.k.vy = 0; p.k.y = 300; p.birds[p.birds.length - 1].y = 300; });
    await page.waitForTimeout(1500); const s = await S(page);
    ok('burung memutus benang', s.over && s.cause === 'burung', JSON.stringify(s)); await page.context().close(); }
  // 4. Kalah adu: bot lemah selalu kendur saat bergesekan
  { const { page } = await open(b, false); await startPlay(page);
    await page.evaluate(() => { window.__botMode = 'weak'; });
    await page.addScriptTag({ content: BOT });
    await page.evaluate(() => { __play.birdTimer = 999; });
    let s; for (let i = 0; i < 45; i++) { await page.waitForTimeout(1000); s = await S(page); if (s.over) break; }
    ok('kalah adu memutus benang', s.over && s.cause === 'adu', JSON.stringify(s)); await page.context().close(); }
  // 5. HP: sentuhan asli (CDP) + layout
  { const { page } = await open(b, true);
    await page.screenshot({ path: path.join(OUT, 'hp-menu.png') });
    const box = await page.evaluate(() => { const c = document.querySelector('canvas').getBoundingClientRect(); return { x: c.x, y: c.y, w: c.width, h: c.height }; });
    const sx = box.w / 450; const mb = await page.evaluate(() => { const z = __g.scene.getScene('menu').mainBtn.z; return { x: z.x, y: z.y }; });
    await page.touchscreen.tap(box.x + mb.x * sx, box.y + mb.y * sx);
    await page.waitForFunction(() => __g.scene.isActive('play') && window.__play, null, { timeout: 3000 });
    const cdp = await page.context().newCDPSession(page);
    const y0 = (await S(page)).y;
    const pt = [{ x: box.x + 225 * sx, y: box.y + 450 * sx }];
    // tunggu dalam waktu game (bukan waktu dinding): kanvas HD lambat di browser tanpa GPU
    const waitGame = s => page.evaluate(s => new Promise(r => { const t0 = __play.time0; const iv = setInterval(() => { if (__play.time0 - t0 >= s) { clearInterval(iv); r(); } }, 20); }), s);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
    await page.waitForTimeout(100); await waitGame(0.9);
    const y1 = (await S(page)).y;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await waitGame(2.2);
    const y2 = (await S(page)).y;
    ok('HP: tahan jari = layangan naik, lepas = turun', y1 < y0 - 40 && y2 > y1, `y ${y0} -> ${y1} -> ${y2}`);
    // tombol jeda tidak ikut menarik benang
    await page.touchscreen.tap(box.x + 416 * sx, box.y + 32 * sx); await page.waitForTimeout(300);
    const paused = await page.evaluate(() => __play.paused);
    ok('HP: tombol jeda bekerja', paused);
    await page.touchscreen.tap(box.x + 225 * sx, box.y + 400 * sx); await page.waitForTimeout(200);
    await page.evaluate(() => { __play.k.y = 300; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUT, 'hp-play.png') });
    await page.evaluate(() => { __play.lose('kabel', 'Layanganmu nyangkut di kabel listrik.'); }); await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, 'hp-gameover.png') });
    const vp = page.viewportSize(); ok('HP: layar penuh tanpa pita hitam', Math.abs(box.w - vp.width) < 3 && Math.abs(box.h - vp.height) < 3, `canvas ${Math.round(box.w)}x${Math.round(box.h)}, layar ${vp.width}x${vp.height}`);
    const dpr = await page.evaluate(() => __g.canvas.width / __g.canvas.getBoundingClientRect().width);
    ok('HP: kanvas tajam (HD)', dpr >= 1.9, 'piksel kanvas per piksel layar: ' + dpr.toFixed(2));
    ok('HP: tanpa error', page.errors.length === 0, page.errors.slice(0, 3).join(' | '));
    await page.context().close(); }
  await b.close();
  fs.writeFileSync(path.join(OUT, 'test-output.json'), JSON.stringify(results, null, 1));
  console.log(results.filter(r => r.pass).length + '/' + results.length + ' lulus');
})();
