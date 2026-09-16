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
    await page.waitForTimeout(90);
    const desktop = await page.evaluate(() => {
      const hero = document.querySelector('.menu-hero').getBoundingClientRect();
      const panel = document.querySelector('.menu-control-panel').getBoundingClientRect();
      const image = menuHeroCanvas.getContext('2d').getImageData(0, 0, 520, 290).data;
      let colored = 0;
      for (let i = 0; i < image.length; i += 4) if (image[i] + image[i + 1] + image[i + 2] > 75) colored++;
      return { sideBySide: hero.right <= panel.left + 1, colored };
    });
    assert(desktop.sideBySide && desktop.colored > 300);
    await page.evaluate(() => { fragments = 50; renderCosmeticStore(); });
    await page.locator('.ship-unlock[data-skin="gold"]').click();
    await page.waitForTimeout(80);
    assert.equal(await page.locator('#menuHeroShipName').innerText(), 'FIREFLY');
    await page.locator('.menu-advanced summary').click();
    await page.locator('.aim-selector label').filter({ hasText: 'Manual' }).click();
    assert(await page.locator('input[name="aimMode"][value="manual"]').isChecked());
    console.log('PASS Portada de dos columnas, nave seleccionada y ajustes accesibles');

    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({
      noOverflow: document.documentElement.scrollWidth <= innerWidth,
      fullScreen: startScreen.getBoundingClientRect().top === 0 &&
        Math.round(startScreen.getBoundingClientRect().height) === innerHeight,
      stacked: document.querySelector('.menu-control-panel').getBoundingClientRect().top >=
        document.querySelector('.menu-hero').getBoundingClientRect().bottom,
      actionStatic: getComputedStyle(document.querySelector('.menu-actions')).position === 'static'
    }));
    assert(Object.values(mobile).every(Boolean), JSON.stringify(mobile));
    await page.locator('#storeButton').click();
    const groupData = await page.evaluate(() => [...document.querySelectorAll('.cosmetic-group')].map(group => ({
      type: group.dataset.category,
      prices: [...group.querySelectorAll('.cosmetic-item')].map(item => Number(item.dataset.price))
    })));
    assert.deepEqual(groupData.map(group => group.type), ['trail', 'aura', 'dash']);
    assert.deepEqual(groupData.map(group => group.prices.length), [30, 16, 16]);
    assert(groupData.every(group => group.prices[0] === 0 &&
      group.prices.every((price, index) => index === 0 || price >= group.prices[index - 1])));
    await page.locator('#cosmeticFilters [data-filter="dash"]').click();
    assert.equal(await page.locator('.cosmetic-group').count(), 1);
    assert.equal(await page.locator('.cosmetic-group[data-category="dash"] .cosmetic-item').count(), 16);
    await page.locator('#closeStoreTopButton').click();
    await page.locator('#bestiaryButton').click();
    assert(await page.locator('#closeBestiaryTop').isVisible());
    await page.locator('#closeBestiaryTop').click();
    console.log('PASS Cosméticos agrupados y ordenados por precio; tienda y bestiario funcionan en móvil');

    await page.locator('#startForm .primary-button').click();
    const launched = await page.evaluate(() => ({ state: gameState, skin: player?.skin, aim: aimMode }));
    assert.equal(launched.state, 'playing');
    assert.equal(launched.skin, 'gold');
    assert.equal(launched.aim, 'manual');
    assert.deepEqual(errors, []);
    console.log('PASS La misión inicia con la nave y puntería elegidas sin errores');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
