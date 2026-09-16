// Browser integration checks. Requires Playwright and Microsoft Edge.
// Run: node tests/enemy-art.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'work', 'verification');
fs.mkdirSync(output, { recursive: true });
let checks = 0;
function check(condition, label) { assert.ok(condition, label); checks++; console.log(`PASS ${label}`); }

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/favicon.ico') { res.writeHead(204).end(); return; }
  const target = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(target, (error, bytes) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' })[path.extname(target)] || 'application/octet-stream' });
    res.end(bytes);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(origin);
    check(await page.locator('.bestiary-portrait').count() === 16, 'All 16 bestiary entries mount');
    await page.locator('#bestiaryButton').click();
    await page.waitForTimeout(200);
    check(await page.locator('#bestiaryScreen').evaluate(el => el.classList.contains('active')), 'Bestiary opens');
    const bot = await page.locator('#regularBestiary article').nth(1).innerText();
    check(bot.includes('marca un carril'), 'BOT description matches its new movement');
    await page.locator('#closeBestiaryButton').click();
    await page.locator('.menu-advanced summary').click();
    await page.locator('#musicButton').click();
    await page.locator('#startForm .primary-button').click();
    await page.waitForTimeout(200);
    check(await page.evaluate(() => gameState === 'playing' && lives === 3), 'Normal mission starts with three lives');

    const mechanics = await page.evaluate(() => {
      gameState = 'paused'; stopMusic(); effectsVolume = 0;
      function fixture(icon, extra = {}) {
        const type = threatTypes.find(type => type.icon === icon);
        return { x: 160, y: 130, width: 52, height: 52, baseSize: 52, speed: 130, velocityX: 0, velocityY: 100, side: 'top', shotTimer: 0.02, shotInterval: 1.5, health: 2, maxHealth: 2, rotation: 0.37, rotationSpeed: 0, sizePulse: 0, sizePulseSpeed: 2, behaviorPhase: 0, type, ...extra };
      }
      const results = {};
      player.x = 650; player.y = 420; level = 4;
      threats = [fixture('turret')]; enemyProjectiles = [];
      updateThreats(0.03);
      results.sniperShot = enemyProjectiles.length === 1 && threats[0].shotTimer === threats[0].shotInterval;
      results.sniperAimed = enemyProjectiles[0].velocityX > 0 && enemyProjectiles[0].velocityY > 0;
      threats = [fixture('mine')]; enemyProjectiles = [];
      updateThreats(0.03);
      results.mineShot = enemyProjectiles.length === 7 && threats[0].shotInterval === 2.15;
      const rotation = threats[0].rotation;
      results.mineDirections = enemyProjectiles.every(p => p.width === 18 && Array.from({length: 8}, (_, i) => Math.cos(rotation + i * Math.PI / 4) * 225).some(v => Math.abs(v - p.velocityX) < 1e-8));
      const firstShotAfter = [];
      for (const icon of ['turret', 'mine']) {
        threats = [fixture(icon, { shotTimer: 0.1, shotInterval: 0.1 })];
        enemyProjectiles = [];
        for (let i = 0; i < 5; i++) updateThreats(0.03);
        firstShotAfter.push(enemyProjectiles.length);
      }
      results.firstAttack = firstShotAfter[0] === 1 && firstShotAfter[1] === 7;
      threats = [fixture('eye')]; updateThreats(0.03);
      results.hunterTurns = threats[0].velocityX > 0;
      threats = [fixture('glitch')]; threats[0].brain = EnemyBehavior.initialize(threats[0]); threats[0].brain.cooldown = 0;
      updateThreats(0.03);
      results.glitchEcho = threats[0].brain.mode === 'echo' && Math.hypot(threats[0].brain.targetX - (player.x + player.width / 2), threats[0].brain.targetY - (player.y + player.height / 2)) >= 95;
      updateThreats(0.5);
      results.glitchMoves = threats[0].x !== 160 && threats[0].brain.mode === 'travel';
      threats = [fixture('orbiter')]; updateThreats(0.03);
      results.orbiterCurves = threats[0].velocityX !== 0;
      threats = [fixture('mine', { shotTimer: 2 })]; updateThreats(0.5);
      results.mineSlows = threats[0].velocityY < 100;
      // Phantom is vulnerable only while materialized; ghost shots fly through.
      threats = [fixture('phantom', { health: 2, maxHealth: 2 })];
      obstacles = []; chest = null; boss = null;
      playerProjectiles = [{ x: 176, y: 147, width: 12, height: 12, velocityX: 0, velocityY: 0, damage: 1, color: '#fff' }];
      updatePlayerProjectiles(0);
      results.phantomVulnerable = threats[0].health === 1;
      threats[0].brain = EnemyBehavior.initialize(threats[0]);
      threats[0].brain.mode = 'ethereal'; threats[0].brain.timer = .4;
      playerProjectiles = [{ x: 176, y: 147, width: 12, height: 12, velocityX: 0, velocityY: 0, damage: 1, color: '#fff' }];
      updatePlayerProjectiles(0);
      results.phantomGhost = threats[0].health === 1 && playerProjectiles.length === 1 && getNearestTarget() !== threats[0];
      player.shieldTime = 0; player.invulnerableTime = 0; player.aegisUnlocked = false; lives = 3;
      threats = [fixture('bug', { x: player.x, y: player.y })]; updateThreats(0);
      results.contact = lives === 2 && threats.length === 0;
      player.shieldTime = 4; threats = [fixture('tank', { x: player.x, y: player.y, health: 7 })]; updateThreats(0);
      results.shield = lives === 2 && threats.length === 0;
      player.x = 620; player.y = 390; player.motionX = 0; player.motionY = 0;
      obstacles = []; chest = null; boss = null; enemyProjectiles = [];
      threats = [fixture('bug', { x: 180, y: 150, health: 1, maxHealth: 1 })];
      playerProjectiles = [{ x: 195, y: 166, width: 12, height: 12, velocityX: 0, velocityY: 0, damage: 1, color: '#fff' }];
      updatePlayerProjectiles(0);
      results.virusSplits = threats.length === 2 && threats.every(t => t.isSpore && t.health === 1 && t.width < 52);
      results.virusCannotChain = EnemyBehavior.spores(threats[0], 2).length === 0;
      let botThreat = fixture('skull', { x: 540, y: 325 });
      EnemyBehavior.initialize(botThreat).cooldown = 0;
      EnemyBehavior.step(botThreat, player, .02, () => true);
      results.botWarns = botThreat.brain.mode === 'scan' && botThreat.velocityX === 0 && botThreat.velocityY === 0;
      EnemyBehavior.step(botThreat, player, .36, () => true);
      results.botAxisDash = botThreat.brain.mode === 'step' &&
        ((Math.abs(botThreat.brain.targetX - botThreat.brain.startX) < 1e-8) !==
          (Math.abs(botThreat.brain.targetY - botThreat.brain.startY) < 1e-8));
      const botMarked = [botThreat.brain.targetX, botThreat.brain.targetY];
      EnemyBehavior.advance(botThreat, .31, 1);
      results.botExactEndpoint = botThreat.brain.mode === 'travel' &&
        Math.hypot(EnemyBehavior.center(botThreat).x - botMarked[0],
          EnemyBehavior.center(botThreat).y - botMarked[1]) < 1e-8;
      let spamThreat = fixture('mail', { x: 8, velocityX: -90, velocityY: 90, speed: 220 });
      EnemyBehavior.step(spamThreat, player, .03, () => true);
      results.spamBanks = spamThreat.velocityX > 0 && spamThreat.velocityY > 90;
      let sniperThreat = fixture('turret', { x: 500, y: 190, shotTimer: .6, shotInterval: 1.5 });
      EnemyBehavior.step(sniperThreat, player, .03, () => true);
      const lockX = sniperThreat.brain.targetX, lockY = sniperThreat.brain.targetY;
      player.x = 720; player.y = 430;
      threats = [sniperThreat]; enemyProjectiles = [];
      updateThreats(.6);
      const sniperOrigin = EnemyBehavior.center(sniperThreat);
      const lockedAngle = Math.atan2(lockY - sniperOrigin.y, lockX - sniperOrigin.x);
      results.sniperCanBeDodged = sniperThreat.brain.mode === 'travel' && Math.abs(Math.atan2(enemyProjectiles[0].velocityY, enemyProjectiles[0].velocityX) - lockedAngle) < .02 && lockX !== player.x + player.width / 2;
      let hunterThreat = fixture('eye', { x: 650, y: 355 });
      EnemyBehavior.initialize(hunterThreat).cooldown = 0;
      EnemyBehavior.step(hunterThreat, player, .02, () => true);
      results.hunterWarns = hunterThreat.brain.mode === 'mark';
      EnemyBehavior.step(hunterThreat, player, .45, () => true);
      results.hunterRush = hunterThreat.brain.mode === 'rush' &&
        Math.hypot(hunterThreat.brain.targetX - hunterThreat.brain.startX,
          hunterThreat.brain.targetY - hunterThreat.brain.startY) > 0;
      const hunterMarked = [hunterThreat.brain.targetX, hunterThreat.brain.targetY];
      EnemyBehavior.advance(hunterThreat, .28, 1);
      results.hunterExactEndpoint = Math.hypot(EnemyBehavior.center(hunterThreat).x - hunterMarked[0],
        EnemyBehavior.center(hunterThreat).y - hunterMarked[1]) < 1e-8;
      let tankThreat = fixture('tank', { x: player.x - 72, y: player.y - 30, speed: 65 });
      EnemyBehavior.initialize(tankThreat).cooldown = 0;
      EnemyBehavior.step(tankThreat, player, .02, () => true);
      results.tankWarns = tankThreat.brain.mode === 'stomp';
      const stomp = EnemyBehavior.step(tankThreat, player, .8, () => true);
      results.tankStomps = stomp.stomp === true && tankThreat.brain.mode === 'impact';
      let orbiterThreat = fixture('orbiter', { x: player.x - 80, y: player.y - 25 });
      EnemyBehavior.initialize(orbiterThreat).cooldown = 0;
      EnemyBehavior.step(orbiterThreat, player, .02, () => true);
      results.orbiterWarns = orbiterThreat.brain.mode === 'sling';
      EnemyBehavior.step(orbiterThreat, player, .4, () => true);
      results.orbiterSlings = orbiterThreat.brain.mode === 'fly' &&
        Math.hypot(orbiterThreat.brain.targetX - orbiterThreat.brain.startX,
          orbiterThreat.brain.targetY - orbiterThreat.brain.startY) > 0;
      const orbiterMarked = [orbiterThreat.brain.targetX, orbiterThreat.brain.targetY];
      EnemyBehavior.advance(orbiterThreat, .34, .48);
      results.orbiterSlowKeepsEndpoint = orbiterThreat.brain.mode === 'fly' &&
        Math.hypot(EnemyBehavior.center(orbiterThreat).x - orbiterMarked[0],
          EnemyBehavior.center(orbiterThreat).y - orbiterMarked[1]) > 0;
      EnemyBehavior.advance(orbiterThreat, .34 / .48, .48);
      results.orbiterExactEndpoint = Math.hypot(EnemyBehavior.center(orbiterThreat).x - orbiterMarked[0],
        EnemyBehavior.center(orbiterThreat).y - orbiterMarked[1]) < 1e-8;
      let mineThreat = fixture('mine');
      EnemyBehavior.initialize(mineThreat).gapIndex = 2;
      threats = [mineThreat]; enemyProjectiles = [];
      updateThreats(.03);
      results.mineSafeGap = enemyProjectiles.length === 7 && mineThreat.brain.gapIndex === 5
        && !enemyProjectiles.some(p => Math.abs(p.velocityX - Math.cos(mineThreat.rotation + 2 * Math.PI / 4) * 225) < .001 && Math.abs(p.velocityY - Math.sin(mineThreat.rotation + 2 * Math.PI / 4) * 225) < .001);
      let phantomThreat = fixture('phantom', { x: player.x, y: player.y });
      phantomThreat.brain = EnemyBehavior.initialize(phantomThreat); phantomThreat.brain.mode = 'ethereal'; phantomThreat.brain.timer = .4;
      threats = [phantomThreat]; lives = 3; player.invulnerableTime = 0; player.shieldTime = 0;
      updateThreats(.1);
      results.phantomContactPasses = lives === 3 && threats.length === 1;
      player.x = 470; player.y = 130; keys = {};
      level = 3; spawnBoss(); boss.entranceTime = 0; boss.y = 45; boss.x = 425; boss.wellActive = true;
      const beforePull = player.x;
      updatePlayer(.1);
      results.moonPulls = player.x < beforePull;
      level = 6; spawnBoss(); boss.entranceTime = 0; boss.y = 45; boss.dashCooldown = 0;
      player.x = 720; player.y = 390;
      updateBoss(.02);
      results.marsWarns = boss.dashMode === 'warn' && boss.dashMarkX !== boss.x;
      updateBoss(.59); const marsBefore = boss.x;
      updateBoss(.2);
      results.marsMoves = boss.dashMode === 'rush' && boss.x !== marsBefore;
      level = 9; spawnBoss(); boss.entranceTime = 0; boss.y = 45;
      updateBoss(.4);
      results.venusOrbits = Math.abs(boss.y - boss.targetY) > 10 && Math.abs(boss.x - (GAME_WIDTH - boss.width) / 2) > 30;
      level = 12; spawnBoss(); boss.entranceTime = 0; boss.y = 45; boss.crystalCooldown = 0;
      updateBoss(.02);
      const mercuryHealth = boss.health;
      const denied = applyDamageToBoss(3);
      boss.crystalTimer = 0;
      const admitted = applyDamageToBoss(3);
      results.mercuryShield = denied === 0 && admitted > 0 && boss.health < mercuryHealth;
      level = 15; spawnBoss(); boss.entranceTime = 0; boss.y = 45;
      boss.phaseTwo = true; boss.color = '#ff003c'; player.x = 640; player.y = 370; player.motionX = 0; player.motionY = 0;
      for (let i = 0; i < 3; i++) fireBossPattern();
      results.yaceramiMarks = boss.voidMark && boss.voidMark.time === 1.05;
      const mark = boss.voidMark; player.x = mark.x - player.width / 2; player.y = mark.y - player.height / 2;
      lives = 3; player.invulnerableTime = 0; player.shieldTime = 0;
      boss.shotTimer = 10; updateBoss(1.06);
      results.yaceramiZoneHits = boss.voidMark === null && lives === 2;
      boss = null; cometWarning = null; comets = [];
      scheduleCometReturn({ x: 800, y: 200, width: 34, height: 34, velocityX: 820, velocityY: 0, returnPass: false });
      results.cometReturnsWithWarning = cometWarning?.returnPass === true && cometWarning.time === 1.2;
      updateCometEvent(1.21);
      results.cometSecondPass = comets.length === 1 && comets[0].returnPass === true && Math.hypot(comets[0].velocityX, comets[0].velocityY) < 820;
      cometWarning = null; comets = [];
      player.x = 650; player.y = 420;
      results.bossPatterns = [];
      for (const [bossLevel, count] of [[3,5], [6,3], [9,7], [12,8]]) {
        level = bossLevel; spawnBoss(); enemyProjectiles = []; fireBossPattern();
        results.bossPatterns.push(enemyProjectiles.length === count && boss.shotTimer === boss.shotInterval);
        boss.entranceTime = 0; boss.y = 45; drawBoss();
      }
      level = 15; spawnBoss(); boss.entranceTime = 0; boss.health = boss.maxHealth / 2;
      updateBoss(0);
      results.phaseTwo = boss.phaseTwo && boss.color === '#ff003c';
      enemyProjectiles = []; fireBossPattern();
      results.phaseTwoPattern = enemyProjectiles.length === 15 && boss.shotInterval === boss.shotTimer;
      boss.health = boss.maxHealth; boss.damageHistory = [];
      const dealt = applyDamageToBoss(1000);
      results.bossDamageCap = Math.abs(dealt - boss.maxHealth * 0.2) < 1e-8 && applyDamageToBoss(10) === 0;
      startCometWarning(); updateCometEvent(1.59);
      results.cometWarning = comets.length === 0;
      updateCometEvent(0.02);
      results.cometLaunch = comets.length === 1;
      // Render all types in actual combat without mutating their collision boxes.
      threats = threatTypes.map((type, i) => fixture(type.icon, { x: 85 + i % 5 * 172, y: 165 + Math.floor(i / 5) * 135 }));
      const bounds = JSON.stringify(threats.map(t => [t.x, t.y, t.width, t.height]));
      draw(performance.now());
      results.boundsUnchanged = bounds === JSON.stringify(threats.map(t => [t.x, t.y, t.width, t.height]));
      // Deterministic time samples across sizes and every animated state.
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 300;
      const context = canvas.getContext('2d');
      let finite = true;
      for (const entry of [...EnemyArt.catalog, ...EnemyArt.bosses, EnemyArt.hazard]) {
        for (const radius of [12, 24, 46, 100]) {
          for (const time of [0, .28, 1.2, 2.5]) {
            context.clearRect(0,0,300,300);
            EnemyArt.draw(context, entry.id, { x: 150, y: 150, radiusX: radius, time, charge: .95, healthRatio: .3, phaseTwo: entry.id === 'yacerami' });
            finite = finite && context.getImageData(0,0,300,300).data.some((v,i) => i % 4 === 3 && v > 0);
          }
        }
      }
      results.everyDesignVisible = finite;
      function pixels(id, charge, healthRatio = 1, phaseTwo = false) {
        context.clearRect(0,0,300,300);
        EnemyArt.draw(context, id, { x: 150, y: 150, radiusX: 80, time: 0, charge, healthRatio, phaseTwo });
        return canvas.toDataURL();
      }
      results.sniperChargeVisible = pixels('turret', 0) !== pixels('turret', .95);
      results.mineChargeVisible = pixels('mine', 0) !== pixels('mine', .95);
      results.tankDamageVisible = pixels('tank', 0) !== pixels('tank', 0, .3);
      results.phaseTwoVisible = pixels('yacerami', 0) !== pixels('yacerami', 0, .3, true);
      // Measure real drawing work with a dense wave (not a FPS guarantee).
      threats = Array.from({length: 50}, (_, i) => fixture(threatTypes[i % 10].icon, { x: (i % 10) * 85 + 10, y: Math.floor(i / 10) * 90 + 10 }));
      const times = [];
      for (let frame = 0; frame < 30; frame++) { const t = performance.now(); draw(t); times.push(performance.now() - t); }
      times.sort((a,b) => a-b); results.drawMedianMs = times[15];
      threats = []; boss = null; comets = []; playerProjectiles = []; enemyProjectiles = []; obstacles = [];
      gameState = 'playing'; player.invulnerableTime = 10000; player.attackTimer = 0;
      for (let i = 0; i < 3600; i++) update(1/60);
      results.progression = level >= 3 && (boss || bossIncomingTimer > 0);
      gameState = 'paused'; stopMusic();
      return results;
    });
    for (const [name, result] of Object.entries(mechanics)) {
      if (name === 'drawMedianMs') { console.log(`METRIC 50 enemies: median draw ${result.toFixed(2)} ms`); continue; }
      check(Array.isArray(result) ? result.every(Boolean) : result, name);
    }
    await page.evaluate(() => {
      gameState = 'paused'; stopMusic(); boss = null; bossBar.classList.remove('visible');
      cometWarning = null; comets = []; chest = null; powerUps = []; obstacles = []; enemyProjectiles = []; playerProjectiles = [];
      player.x = 453; player.y = 450;
      threats = threatTypes.map((type, i) => {
        const x = 70 + (i % 5) * 178, y = 100 + Math.floor(i / 5) * 175;
        const t = { x, y, width: 55, height: 55, baseSize: 55, speed: 130, velocityX: 0, velocityY: 85,
          side: 'top', shotTimer: .45, shotInterval: 1.5, health: 2, maxHealth: 2,
          rotation: .1, rotationSpeed: 0, sizePulse: 0, sizePulseSpeed: 2, behaviorPhase: 0, type };
        EnemyBehavior.initialize(t); return t;
      });
      threats[1].brain.mode = 'scan'; threats[1].brain.timer = .2; threats[1].brain.targetX = 375; threats[1].brain.targetY = 127;
      threats[3].brain.mode = 'lock'; threats[3].brain.targetX = 490; threats[3].brain.targetY = 400;
      threats[4].brain.mode = 'mark'; threats[4].brain.targetX = 680; threats[4].brain.targetY = 410;
      threats[5].brain.mode = 'echo'; threats[5].brain.targetX = 310; threats[5].brain.targetY = 310;
      threats[6].brain.mode = 'stomp'; threats[6].brain.timer = .25;
      threats[7].brain.mode = 'sling'; threats[7].brain.targetX = 530; threats[7].brain.targetY = 430;
      threats[8].brain.gapIndex = 2;
      threats[9].brain.mode = 'ethereal'; threats[9].brain.timer = .2;
      draw(performance.now());
    });
    await page.locator('#gameCanvas').screenshot({ path: path.join(output, 'behavior-signals.png') });
    await page.goto(origin + '/designs.html');
    await page.waitForTimeout(200);
    check(await page.locator('.design-card').count() === 16, 'Gallery includes all 16 live designs');
    await page.locator('#animationToggle').click();
    await page.locator('#damageToggle').click();
    await page.locator('#phaseToggle').click();
    await page.locator('#bossDesigns').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const previewDrawn = await page.locator('#bossDesigns canvas').last().evaluate(c => c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i) => i % 4 === 3 && v > 0));
    check(previewDrawn, 'Offscreen portraits render after scrolling while paused');
    await page.locator('#sizeToggle').click();
    check(await page.locator('#sizeToggle').getAttribute('aria-pressed') === 'true', 'Combat-size preview toggles');
    await page.locator('#sizeToggle').click();
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, 'gallery-desktop.png'), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile gallery has no horizontal overflow');
    await page.screenshot({ path: path.join(output, 'gallery-mobile.png'), fullPage: true });
    await page.goto(origin);
    await page.locator('#bestiaryButton').click();
    await page.waitForTimeout(200);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile bestiary has no horizontal overflow');
    await page.screenshot({ path: path.join(output, 'bestiary-mobile.png') });
    check(await page.locator('#closeBestiaryTop').isVisible(), 'Mobile bestiary has a visible close button');
    check(await page.locator('#bestiaryScreen').evaluate(el => el.getBoundingClientRect().height === innerHeight), 'Mobile bestiary uses the full screen');
    await page.locator('#closeBestiaryTop').click();
    await page.locator('#startForm .primary-button').click();
    await page.evaluate(() => { gameState = 'paused'; stopMusic(); level = 3; spawnBoss(); boss.entranceTime = 0; boss.y = 45; updateHud(); draw(performance.now()); });
    check(await page.locator('#levelProgress').evaluate(el => getComputedStyle(el).visibility === 'hidden'), 'Boss bar does not overlap wave progress');
    await page.screenshot({ path: path.join(output, 'combat-mobile.png') });
    const reduced = await browser.newContext({ reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(origin + '/designs.html');
    check(await reducedPage.locator('#animationToggle').getAttribute('aria-pressed') === 'true', 'Gallery respects reduced motion');
    await reduced.close();
    // The game also works without a server, using its existing storage fallback.
    const filePage = await context.newPage();
    await filePage.goto('file:///' + path.join(root, 'index.html').replace(/\\/g, '/'));
    await filePage.locator('#startForm .primary-button').click();
    check(await filePage.evaluate(() => gameState === 'playing'), 'Direct local-file launch works');
    await filePage.close();
    check(errors.length === 0, 'No JavaScript or browser console errors: ' + errors.join('; '));
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checks, mechanics, errors }, null, 2));
    console.log(`SUCCESS ${checks} checks`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
