const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: process.env.TEST_BROWSER || 'msedge', headless: true });
  try {
    const url = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    desktop.on('pageerror', error => errors.push(error.message));
    desktop.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await desktop.goto(url);
    await desktop.locator('.menu-advanced summary').click();
    assert.equal(await desktop.locator('#keyBindingGrid button').count(), 7);
    const defaults = await desktop.evaluate(() => ({ ...controlBindings }));
    assert.deepEqual(defaults, { up: 'w', down: 's', left: 'a', right: 'd',
      dash: 'Shift', ultimate: 'q', pause: 'p' });

    const bind = async (action, key) => {
      await desktop.locator(`#keyBindingGrid [data-action="${action}"]`).click();
      await desktop.keyboard.press(key);
    };
    await bind('up', 'i');
    await bind('dash', 'q');
    const swapped = await desktop.evaluate(() => ({ ...controlBindings }));
    assert.equal(swapped.dash, 'q');
    assert.equal(swapped.ultimate, 'Shift');
    await bind('dash', 'e');
    await bind('ultimate', 'u');
    await bind('pause', 'o');
    const saved = await desktop.evaluate(() => ({ bindings: { ...controlBindings },
      stored: JSON.parse(safeStorageGet(SETTINGS_KEY)).controlBindings,
      hint: keyHint.textContent }));
    assert.deepEqual(saved.bindings, saved.stored);
    assert(saved.hint.includes('DASH: E'));
    console.log('PASS Siete acciones de teclado se reasignan, intercambian conflictos y guardan');

    await desktop.locator('#startForm .primary-button').click();
    await desktop.evaluate(() => { threats = []; obstacles = []; boss = null; chest = null; });
    await desktop.keyboard.down('i');
    const moved = await desktop.evaluate(() => { const y = player.y; updatePlayer(.1); return player.y < y; });
    await desktop.keyboard.up('i');
    assert.equal(moved, true);
    await desktop.keyboard.down('ArrowUp');
    const arrow = await desktop.evaluate(() => { const y = player.y; updatePlayer(.1); return player.y < y; });
    await desktop.keyboard.up('ArrowUp');
    assert.equal(arrow, true);
    await desktop.keyboard.press('e');
    assert(await desktop.evaluate(() => player.dashCooldown > 0));
    await desktop.keyboard.press('o');
    assert.equal(await desktop.evaluate(() => gameState), 'paused');
    await desktop.keyboard.press('o');
    assert.equal(await desktop.evaluate(() => gameState), 'playing');
    console.log('PASS Movimiento, flechas alternativas, dash y pausa obedecen las nuevas teclas');

    await desktop.reload();
    assert.equal(await desktop.evaluate(() => controlBindings.up), 'i');
    assert.equal(await desktop.evaluate(() => controlBindings.dash), 'e');
    await desktop.locator('.menu-advanced summary').click();
    await bind('ultimate', 'ArrowUp');
    const alias = await desktop.evaluate(() => {
      keys = { ArrowUp: true };
      const result = { action: actionForKey('ArrowUp'), movesUp: isActionHeld('up') };
      keys = {};
      return result;
    });
    assert.deepEqual(alias, { action: 'ultimate', movesUp: false });
    await desktop.locator('#resetKeyBindings').click();
    assert.deepEqual(await desktop.evaluate(() => ({ ...controlBindings })), defaults);
    console.log('PASS Las teclas persisten al recargar y se pueden restablecer');

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 },
      isMobile: true, hasTouch: true });
    mobile.on('pageerror', error => errors.push(error.message));
    mobile.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await mobile.goto(url);
    await mobile.locator('#startForm .primary-button').click();
    const surface = await mobile.evaluate(() => ({ session: document.body.classList.contains('mobile-session'),
      visible: getComputedStyle(mobileControls).display !== 'none',
      moveWidth: moveStick.getBoundingClientRect().width,
      overflow: document.documentElement.scrollWidth > innerWidth }));
    assert.deepEqual([surface.session, surface.visible, surface.overflow], [true, true, false]);
    assert(surface.moveWidth >= 140);
    const overlay = await mobile.evaluate(() => {
      showUpgradeSelection();
      const hidden = getComputedStyle(mobileControls).display === 'none';
      upgradeScreen.classList.remove('active'); gameState = 'playing';
      return hidden;
    });
    assert.equal(overlay, true);
    const move = await mobile.locator('#moveStick').boundingBox();
    await mobile.mouse.move(move.x + move.width * .75, move.y + move.height / 2);
    await mobile.mouse.down();
    const floating = await mobile.evaluate(() => ({ strength: touchMovement.x,
      faceLeft: moveStick.querySelector('.stick-face').style.left }));
    assert.equal(floating.strength, 0);
    assert.notEqual(floating.faceLeft, '50%');
    await mobile.mouse.move(move.x + move.width * .75 + 38, move.y + move.height / 2);
    assert(await mobile.evaluate(() => touchMovement.x > .5));
    await mobile.mouse.move(move.x + move.width + 80, move.y + move.height / 2);
    assert(await mobile.evaluate(() => touchMovement.x > .9));
    await mobile.mouse.up();
    assert.equal(await mobile.evaluate(() => touchMovement.x), 0);

    const aim = await mobile.locator('#aimStick').boundingBox();
    await mobile.mouse.move(aim.x + aim.width / 2, aim.y + aim.height / 2);
    await mobile.mouse.down();
    await mobile.mouse.move(aim.x + aim.width / 2 - 35, aim.y + aim.height / 2 - 18);
    const aiming = await mobile.evaluate(() => ({ mode: aimMode,
      active: manualAim.stickActive, x: manualAim.vectorX }));
    assert.equal(aiming.mode, 'manual');
    assert.equal(aiming.active, true);
    assert(aiming.x < -.7);
    await mobile.mouse.up();
    assert.equal(await mobile.evaluate(() => manualAim.stickActive), false);
    console.log('PASS Joysticks flotantes, respuesta temprana, captura fuera del círculo y puntería');

    const cdp = await mobile.context().newCDPSession(mobile);
    const moveTouch = await mobile.locator('#moveStick').boundingBox();
    const aimTouch = await mobile.locator('#aimStick').boundingBox();
    const first = { x: moveTouch.x + moveTouch.width / 2,
      y: moveTouch.y + moveTouch.height / 2, id: 1 };
    const second = { x: aimTouch.x + aimTouch.width / 2,
      y: aimTouch.y + aimTouch.height / 2, id: 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first, second] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [
      { ...first, x: first.x + 35 }, { ...second, x: second.x - 35 }] });
    const dual = await mobile.evaluate(() => ({ moving: touchMovement.x > .4,
      aiming: manualAim.stickActive && manualAim.vectorX < -.8,
      pointers: !!stickPointers.move && !!stickPointers.aim }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.deepEqual(dual, { moving: true, aiming: true, pointers: true });
    console.log('PASS Movimiento y puntería responden a dos dedos al mismo tiempo');

    await mobile.locator('#editTouchGame').click();
    assert.equal(await mobile.evaluate(() => gameState), 'paused');
    assert.equal(await mobile.locator('#touchEditor').isVisible(), true);
    const deck = await mobile.locator('#mobileControls').boundingBox();
    const dash = await mobile.locator('#mobileDash').boundingBox();
    await mobile.mouse.move(dash.x + dash.width / 2, dash.y + dash.height / 2);
    await mobile.mouse.down();
    await mobile.mouse.move(deck.x + deck.width * .50, deck.y + deck.height * .34);
    await mobile.mouse.up();
    await mobile.locator('#saveTouchLayout').click();
    const portrait = await mobile.evaluate(() => ({ point: touchLayouts.portrait.dash,
      stored: JSON.parse(safeStorageGet(SETTINGS_KEY)).touchLayouts.portrait.dash,
      gameState }));
    assert.equal(portrait.gameState, 'playing');
    assert.deepEqual(portrait.point, portrait.stored);
    assert(Math.abs(portrait.point.x - .5) < .04);
    assert(Math.abs(portrait.point.y - .34) < .04);

    await mobile.locator('#editTouchGame').click();
    const ultimate = await mobile.locator('#mobileUltimate').boundingBox();
    await mobile.mouse.move(ultimate.x + ultimate.width / 2, ultimate.y + ultimate.height / 2);
    await mobile.mouse.down();
    await mobile.mouse.move(deck.x + deck.width * .50, deck.y + deck.height * .70);
    await mobile.mouse.up();
    await mobile.locator('#cancelTouchLayout').click();
    assert.deepEqual(await mobile.evaluate(() => touchLayouts.portrait.ultimate),
      { x: .55, y: .78 });
    console.log('PASS Editor táctil guarda una posición y Cancelar recupera la anterior');

    await mobile.setViewportSize({ width: 844, height: 390 });
    assert.equal(await mobile.locator('#moveStick').isVisible(), true);
    await mobile.locator('#editTouchGame').click();
    const landscapeBefore = await mobile.evaluate(() => touchLayouts.landscape.dash.x);
    const landscapeDeck = await mobile.locator('#mobileControls').boundingBox();
    const landscapeDash = await mobile.locator('#mobileDash').boundingBox();
    await mobile.mouse.move(landscapeDash.x + landscapeDash.width / 2,
      landscapeDash.y + landscapeDash.height / 2);
    await mobile.mouse.down();
    await mobile.mouse.move(landscapeDeck.x + landscapeDeck.width * .75,
      landscapeDeck.y + landscapeDeck.height * .23);
    await mobile.mouse.up();
    await mobile.locator('#saveTouchLayout').click();
    const landscapeAfter = await mobile.evaluate(() => touchLayouts.landscape.dash.x);
    assert(landscapeAfter < landscapeBefore);
    await mobile.setViewportSize({ width: 390, height: 844 });
    assert(Math.abs(await mobile.evaluate(() => touchLayouts.portrait.dash.x) - .5) < .04);
    await mobile.reload();
    assert(Math.abs(await mobile.evaluate(() => touchLayouts.portrait.dash.x) - .5) < .04);
    assert(Math.abs(await mobile.evaluate(() => touchLayouts.landscape.dash.x) - .75) < .04);
    console.log('PASS Distribuciones vertical y horizontal se guardan por separado y persisten');

    await mobile.locator('.menu-advanced summary').click();
    await mobile.locator('#editTouchMenu').click();
    assert.equal(await mobile.locator('#touchEditor').isVisible(), true);
    await mobile.locator('#resetTouchLayout').click();
    await mobile.locator('#saveTouchLayout').click();
    assert.deepEqual(await mobile.evaluate(() => touchLayouts.portrait.dash), { x: .55, y: .22 });
    assert.equal(await mobile.evaluate(() => gameState), 'menu');
    console.log('PASS El editor también abre desde el menú y restablece la orientación actual');

    assert.deepEqual(errors, []);
    console.log('PASS Sin errores de navegador');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
