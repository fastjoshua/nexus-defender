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
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
    const catalog = await page.evaluate(() => {
      const artHash = item => {
        const canvas = document.createElement('canvas'); canvas.width = 240; canvas.height = 86;
        CosmeticArt.preview(canvas, item, .6, true);
        const image = canvas.getContext('2d').getImageData(0, 0, 240, 86).data;
        let hash = 0;
        for (let i = 0; i < image.length; i += 17) hash = (hash * 31 + image[i]) >>> 0;
        return hash;
      };
      return {
        groups: ['trail', 'aura', 'dash'].map(type => ({ type,
          items: cosmeticCatalog.filter(item => item.category === type).map(item => ({
            id: item.id, motif: item.motif, price: item.price, base: item.basePrice,
            hash: artHash(item)
          })) })),
        ships: ownedShips, locked: [...document.querySelectorAll('input[name="skin"]')]
          .filter(input => input.disabled).map(input => input.value)
      };
    });
    assert.deepEqual(catalog.groups.map(group => group.items.length), [30, 16, 16]);
    assert(catalog.groups.every(group => group.items.every(item => item.price === Math.ceil(item.base * 1.2))));
    for (const type of ['aura', 'dash']) {
      const designs = catalog.groups.find(group => group.type === type).items.slice(1);
      assert.equal(designs.length, 15);
      assert.equal(new Set(designs.map(item => item.motif)).size, 15);
      assert.equal(new Set(designs.map(item => item.hash)).size, 15);
    }
    assert.deepEqual(catalog.ships, ['cyan']);
    assert.deepEqual(catalog.locked, ['violet', 'gold']);
    assert.equal(await page.locator('#menuHeroShipName').innerText(), 'CORE');
    console.log('PASS Moneda estelar, precios +20%, 15 auras y 15 dash activos con dibujos distintos');

    await page.evaluate(() => { fragments = 49; renderCosmeticStore(); });
    await page.locator('.ship-unlock[data-skin="violet"]').click();
    const insufficient = await page.evaluate(() => ({ coins: fragments, ships: ownedShips,
      message: shipPurchaseMessage.textContent }));
    assert.equal(insufficient.coins, 49);
    assert.deepEqual(insufficient.ships, ['cyan']);
    assert(insufficient.message.includes('50 monedas estelares'));
    await page.evaluate(() => { fragments = 100; renderCosmeticStore(); });
    await page.locator('.ship-unlock[data-skin="violet"]').click();
    await page.locator('.ship-unlock[data-skin="gold"]').click();
    const purchased = await page.evaluate(() => ({ coins: fragments, ships: ownedShips,
      selected: selectedSkin, stored: JSON.parse(safeStorageGet(SHIPS_KEY)) }));
    assert.equal(purchased.coins, 0);
    assert.deepEqual(purchased.ships, ['cyan', 'violet', 'gold']);
    assert.deepEqual(purchased.stored, purchased.ships);
    assert.equal(purchased.selected, 'gold');
    await page.waitForFunction(() => menuHeroShipName.textContent === 'FIREFLY');
    assert.equal(await page.locator('#menuHeroShipName').innerText(), 'FIREFLY');
    console.log('PASS Serenity y Firefly exigen 50 monedas estelares cada una y guardan la compra');

    const bareHash = await page.evaluate(() => {
      drawMenuHero(.6);
      const data = menuHeroCanvas.getContext('2d').getImageData(0, 0, 520, 290).data;
      let hash = 0; for (let i = 0; i < data.length; i += 71) hash = (hash * 33 + data[i]) >>> 0;
      return hash;
    });
    await page.evaluate(() => { fragments = 500; renderCosmeticStore(); });
    await page.locator('#storeButton').click();
    await page.locator('#cosmeticFilters [data-filter="trail"]').click();
    await page.locator('.cosmetic-item').filter({ hasText: 'Rastro Neón' }).getByRole('button').click();
    await page.locator('#cosmeticFilters [data-filter="aura"]').click();
    await page.locator('.cosmetic-item').filter({ hasText: 'Flor Estelar' }).getByRole('button').click();
    await page.locator('#cosmeticFilters [data-filter="dash"]').click();
    await page.locator('.cosmetic-item').filter({ hasText: 'Impulso Flecha' }).getByRole('button').click();
    await page.locator('#closeStoreTopButton').click();
    const equipped = await page.evaluate(() => {
      drawMenuHero(.6);
      const data = menuHeroCanvas.getContext('2d').getImageData(0, 0, 520, 290).data;
      let hash = 0; for (let i = 0; i < data.length; i += 71) hash = (hash * 33 + data[i]) >>> 0;
      return { trail: selectedTrail, aura: selectedAura, dash: selectedDashStyle,
        labels: [...menuEquipped.querySelectorAll('span')].map(span => span.textContent), hash };
    });
    assert.deepEqual([equipped.trail, equipped.aura, equipped.dash], ['neon', 'aura_petals', 'dash_chevron']);
    assert.equal(equipped.labels.length, 3);
    assert(equipped.labels.some(label => label.includes('Flor Estelar')));
    assert.notEqual(equipped.hash, bareHash);
    console.log('PASS Estela, aura y dash equipados aparecen y se dibujan en la nave del menú');

    const unlock = await page.evaluate(() => {
      resetGame(); score = 5000; gameState = 'playing';
      normalBossVictories = 0; hardBossVictories = 0; finalBossDefeats = 0;
      selectedDifficulty = 'bossrush'; winGame();
      const rush = [hardModeInput.disabled, bossRushInput.disabled];
      selectedDifficulty = 'normal'; winGame();
      const normal = [hardModeInput.disabled, bossRushInput.disabled];
      selectedDifficulty = 'hard'; winGame();
      const hard = [hardModeInput.disabled, bossRushInput.disabled];
      return { rush, normal, hard, wins: [normalBossVictories, hardBossVictories],
        stored: [safeStorageGet(NORMAL_BOSS_VICTORIES_KEY), safeStorageGet(HARD_BOSS_VICTORIES_KEY)] };
    });
    assert.deepEqual(unlock.rush, [true, true]);
    assert.deepEqual(unlock.normal, [false, true]);
    assert.deepEqual(unlock.hard, [false, false]);
    assert.deepEqual(unlock.wins, [1, 1]);
    assert.deepEqual(unlock.stored, ['1', '1']);
    console.log('PASS Difícil solo abre tras victoria normal; Boss Rush solo tras victoria difícil');
    await page.reload();
    const persisted = await page.evaluate(() => ({ ships: ownedShips, skin: selectedSkin,
      cosmetics: [selectedTrail, selectedAura, selectedDashStyle],
      modes: [hardModeInput.disabled, bossRushInput.disabled] }));
    assert.deepEqual(persisted.ships, ['cyan', 'violet', 'gold']);
    assert.equal(persisted.skin, 'gold');
    assert.deepEqual(persisted.cosmetics, ['neon', 'aura_petals', 'dash_chevron']);
    assert.deepEqual(persisted.modes, [false, false]);
    console.log('PASS Naves, cosméticos y modos desbloqueados persisten al recargar');
    assert.deepEqual(errors, []);
    console.log('PASS Sin errores de navegador');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
