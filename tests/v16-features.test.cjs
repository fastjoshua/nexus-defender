const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
    assert.equal(await page.locator('.cosmetic-item').count(), 62);
    await page.locator('#storeButton').click();
    for (const [filter, expected] of [['trail', 30], ['aura', 16], ['dash', 16], ['all', 62]]) {
      await page.locator(`#cosmeticFilters [data-filter="${filter}"]`).click({ force: true });
      assert.equal(await page.locator('.cosmetic-item').count(), expected);
    }
    const previews = await page.evaluate(() => {
      const fingerprint = id => {
        const canvas = document.querySelector(`canvas[data-cosmetic="${id}"]`);
        canvas.scrollIntoView({ block: 'center' });
        drawCosmeticPreviews(.6);
        const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let hash = 0;
        for (let i = 0; i < image.length; i += 31) hash = (hash * 33 + image[i]) >>> 0;
        return hash;
      };
      return [fingerprint('neon'), fingerprint('sakura'), fingerprint('aura_halo'), fingerprint('dash_wave')];
    });
    assert.equal(new Set(previews).size, 4);
    await page.evaluate(() => { fragments = 250; renderCosmeticStore(); });
    await page.locator('#cosmeticFilters [data-filter="aura"]').click({ force: true });
    await page.locator('.cosmetic-item').filter({ hasText: 'Halo Core' }).getByRole('button').click({ force: true });
    await page.locator('#cosmeticFilters [data-filter="dash"]').click({ force: true });
    await page.locator('.cosmetic-item').filter({ hasText: 'Salto Digital' }).getByRole('button').click({ force: true });
    const equipped = await page.evaluate(() => ({ aura: selectedAura, dash: selectedDashStyle,
      owned: ownedCosmetics.includes('aura_halo') && ownedCosmetics.includes('dash_digital'),
      saved: JSON.parse(safeStorageGet(SETTINGS_KEY)) }));
    assert.equal(equipped.aura, 'aura_halo'); assert.equal(equipped.dash, 'dash_digital');
    assert(equipped.owned && equipped.saved.aura === 'aura_halo' && equipped.saved.dashStyle === 'dash_digital');
    const equippedVisuals = await page.evaluate(() => {
      resetGame(); gameState = 'paused'; screenShake = 0; combatTime = 0;
      threats = []; boss = null; obstacles = []; comets = []; powerUps = []; particles = [];
      playerProjectiles = []; enemyProjectiles = []; cosmeticTrail = []; dashBursts = [];
      const hash = () => {
        draw(0);
        const image = ctx.getImageData(0, 0, GAME_WIDTH, GAME_HEIGHT).data;
        let result = 0;
        for (let i = 0; i < image.length; i += 103) result = (result * 31 + image[i]) >>> 0;
        return result;
      };
      selectedAura = 'aura_none'; const bare = hash();
      selectedAura = 'aura_halo'; const halo = hash();
      selectedAura = 'aura_none';
      dashEchoes = [{x: 540, y: 600, life: .2, maxLife: .2, skin: player.skin},
        {x: 565, y: 610, life: .2, maxLife: .2, skin: player.skin}];
      selectedDashStyle = 'dash_none'; const classic = hash();
      selectedDashStyle = 'dash_digital'; const digital = hash();
      selectedAura = 'aura_halo';
      return { bare, halo, classic, digital };
    });
    assert.notEqual(equippedVisuals.bare, equippedVisuals.halo);
    assert.notEqual(equippedVisuals.classic, equippedVisuals.digital);
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileStore = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      screenTop: Math.round(storeScreen.getBoundingClientRect().top),
      closeVisible: closeStoreTopButton.getBoundingClientRect().top >= 0
    }));
    assert.equal(mobileStore.overflow, false);
    assert.equal(mobileStore.screenTop, 0);
    assert.equal(mobileStore.closeVisible, true);
    await page.setViewportSize({ width: 1440, height: 1000 });
    console.log('PASS 62 cosméticos, filtros, vistas distintas y equipamiento persistente');

    const mechanics = await page.evaluate(() => {
      resetGame(); gameState = 'playing'; obstacles = []; threats = []; enemyProjectiles = [];
      player.x = 700; player.y = 500; player.shieldTime = 0;
      player.invulnerableTime = 0; player.aegisUnlocked = false; lives = 3;
      const make = (icon, x = 500, y = 300) => ({
        x, y, width: 70, height: 70, baseSize: 70, speed: 0,
        velocityX: 0, velocityY: 0, rotation: 0, rotationSpeed: 0,
        sizePulse: 0, sizePulseSpeed: 0, health: 5, maxHealth: 5,
        shotTimer: .01, shotInterval: 2.15, type: threatTypes.find(type => type.icon === icon)
      });
      const glitch = make('glitch', 420, 250);
      const gbrain = EnemyBehavior.initialize(glitch);
      const firstCooldown = gbrain.cooldown;
      let echoWarnings = 0, previousMode = gbrain.mode;
      for (let tick = 0; tick < 110; tick++) {
        EnemyBehavior.step(glitch, player, .05, () => true);
        if (previousMode !== 'echo' && gbrain.mode === 'echo') echoWarnings++;
        previousMode = gbrain.mode;
      }
      const glitchResult = { firstCooldown, echoWarnings, cycles: gbrain.cycle };

      const mine = make('mine');
      mine.brain = EnemyBehavior.initialize(mine);
      const center = EnemyBehavior.center(mine);
      player.x = center.x + 80 - player.width / 2;
      player.y = center.y - player.height / 2;
      mine.brain.gapIndex = 0;
      threats = [mine]; enemyProjectiles = [];
      updateThreats(.02);
      const safe = { lives, bullets: enemyProjectiles.length, pulse: mine.pulseTime,
        bulletSize: enemyProjectiles[0]?.width, nextInterval: mine.shotInterval };
      mine.shotTimer = .01; mine.brain.gapIndex = 1;
      enemyProjectiles = []; updateThreats(.02);
      const danger = { lives, bullets: enemyProjectiles.length };

      player.x = 900; player.y = 600; player.invulnerableTime = 100;
      threats = []; enemyProjectiles = [];
      const bossTransitions = [];
      for (const bossLevel of [3, 6, 9, 12, 15]) {
        level = bossLevel; spawnBoss();
        updateBoss(boss.entranceDuration);
        const before = { x: boss.x, y: boss.y, name: boss.name };
        updateBoss(.016);
        bossTransitions.push({ name: before.name,
          distance: Math.hypot(boss.x - before.x, boss.y - before.y) });
      }
      level = 6; spawnBoss(); boss.entranceTime = 0;
      boss.x = 500; boss.y = boss.targetY;
      boss.dashMode = 'rush'; boss.dashFromX = 500; boss.dashMarkX = 175; boss.dashTimer = .01;
      updateBoss(.02);
      const rushEndpoint = boss.x;
      updateBoss(.016);
      const recoveryDistance = Math.abs(boss.x - rushEndpoint);
      boss = null; threats = []; enemyProjectiles = []; gameState = 'paused';
      return { glitchResult, safe, danger, bossTransitions, rushEndpoint, recoveryDistance };
    });
    assert(mechanics.glitchResult.firstCooldown <= .8 && mechanics.glitchResult.echoWarnings >= 3 && mechanics.glitchResult.cycles >= 3);
    assert.equal(mechanics.safe.lives, 3); assert.equal(mechanics.safe.bullets, 7);
    assert.equal(mechanics.safe.bulletSize, 18); assert.equal(mechanics.safe.nextInterval, 2.15);
    assert(mechanics.safe.pulse > 0);
    assert.equal(mechanics.danger.lives, 2); assert.equal(mechanics.danger.bullets, 7);
    assert(mechanics.bossTransitions.every(item => item.distance <= (item.name === 'YACERAMI' ? 6.9 : 5.7)), JSON.stringify(mechanics.bossTransitions));
    assert.equal(mechanics.rushEndpoint, 175);
    assert(mechanics.recoveryDistance <= 5.61);
    console.log('PASS GLITCH frecuente; mina con carril seguro y pulso dañino; jefes sin saltos de posición');
    assert.deepEqual(errors, []);
    console.log('PASS Sin errores de JavaScript');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
