// Browser checks for the three selectable operator ships.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'msedge', headless: true });
  const output = path.resolve(__dirname, '..', 'work', 'verification');
  fs.mkdirSync(output, { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
    await page.waitForTimeout(150);
    const previews = await page.locator('.skin-preview').evaluateAll(canvases => canvases.map(canvas => {
      const data = canvas.getContext('2d').getImageData(0, 0, 96, 96).data;
      let pixels = 0, fingerprint = 2166136261;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 80) pixels++;
        for (let c = 0; c < 4; c++) fingerprint = Math.imul(fingerprint ^ data[i + c], 16777619);
      }
      return { pixels, fingerprint: fingerprint >>> 0 };
    }));
    assert.equal(previews.length, 3);
    assert(previews.every(preview => preview.pixels > 300));
    assert.equal(new Set(previews.map(preview => preview.fingerprint)).size, 3);
    console.log('PASS All three menu portraits render as distinct ships');
    await page.screenshot({ path: path.join(output, 'player-menu.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    assert(await page.locator('.skin-preview').evaluateAll(canvases => canvases.every(canvas => canvas.getBoundingClientRect().width >= 55)));
    await page.locator('.skin-selector').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'player-menu-mobile.png'), fullPage: true });
    console.log('PASS Mobile skin portraits remain visible without sideways scrolling');
    await page.setViewportSize({ width: 1440, height: 1000 });

    const expected = {
      cyan: [0.34, 1, 650],
      violet: [0.52, 0.85, 590],
      gold: [0.72, 2.4, 500]
    };
    const shipImages = [];
    for (const skin of Object.keys(expected)) {
      const result = await page.evaluate(skin => {
        selectedSkin = skin;
        resetGame();
        const render = document.createElement('canvas');
        render.width = render.height = 144;
        const artist = render.getContext('2d');
        PlayerArt.draw(artist, skin, { x: 72, y: 65, scale: 2.5, time: 0.6, reducedMotion: true });
        return {
          stats: [player.attackInterval, player.projectileDamage, player.projectileSpeed],
          hitbox: [player.width, player.height],
          image: render.toDataURL()
        };
      }, skin);
      assert.deepEqual(result.hitbox, [44, 44]);
      assert.deepEqual(result.stats, expected[skin]);
      shipImages.push(result.image);
      console.log(`PASS ${skin} keeps its hitbox and weapon attributes`);
    }
    assert.equal(new Set(shipImages).size, 3);
    console.log('PASS Combat artwork differs for all three skins');

    await page.evaluate(() => { fragments = 50; renderCosmeticStore(); });
    await page.locator('.ship-unlock[data-skin="violet"]').click();
    await page.locator('input[name="skin"][value="violet"]').check();
    assert(await page.locator('input[name="skin"][value="violet"]').evaluate(input => input.closest('.skin-option').classList.contains('selected')));
    assert((await page.locator('#skinDescription').innerText()).includes('arco'));
    console.log('PASS The selector explains the chosen ship power');
    await page.locator('#startForm .primary-button').click();
    assert(await page.evaluate(() => gameState === 'playing' && player.skin === 'violet'));
    console.log('PASS Selected portrait launches the matching ship');
    await page.evaluate(() => {
      gameState = 'paused';
      stopMusic();
      threats = []; powerUps = []; particles = []; enemyProjectiles = []; playerProjectiles = [];
      obstacles = []; chest = null; boss = null;
      player.x = 450; player.y = 245;
      player.invulnerableTime = 0;
      player.attackTimer = -1;
      draw(performance.now());
    });
    await page.locator('#gameCanvas').screenshot({ path: path.join(output, 'player-combat.png') });
    assert.deepEqual(errors, []);
    console.log('PASS No browser errors');
    console.log('SUCCESS 9 checks');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
