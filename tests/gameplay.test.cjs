// Ejecutar con Playwright instalado: node tests/gameplay.test.cjs
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
    assert.deepEqual(await page.locator('#gameCanvas').evaluate(canvas => [canvas.width, canvas.height]), [1200, 750]);
    assert.equal(await page.locator('.cosmetic-item').count(), 62);
    await page.locator('#playerName').fill('Prueba');
    await page.getByRole('button', { name: 'INICIAR MISIÓN' }).click();
    await page.waitForTimeout(2300);
    const running = await page.evaluate(() => ({ state: gameState, time: elapsedTime, enemies: threats.length }));
    assert.equal(running.state, 'playing');
    assert(running.time > 1.8);
    assert(running.enemies > 0);
    console.log('PASS Arena ampliada, tienda y misión activa con enemigos/progreso');

    const aim = await page.evaluate(() => {
      threats = []; obstacles = []; chest = null; playerProjectiles = [];
      boss = { x: 600, y: 100, width: 100, height: 100, entranceTime: 0 };
      aimMode = 'manual';
      createPlayerProjectile(100, 300, 0, 1, 8);
      const manual = playerProjectiles[0];
      const before = [manual.velocityX, manual.velocityY];
      updatePlayerProjectiles(0.1);
      const after = [manual.velocityX, manual.velocityY];
      playerProjectiles = [];
      aimMode = 'auto';
      createPlayerProjectile(100, 300, 0, 1, 8);
      const guided = playerProjectiles[0].guided;
      boss = null;
      playerProjectiles = [];
      return { before, after, guided };
    });
    assert.deepEqual(aim.after, aim.before);
    assert.equal(aim.guided, true);
    console.log('PASS Puntería manual no redirige balas hacia el jefe');

    const ultimate = await page.evaluate(() => {
      player.skin = 'gold'; player.ultimateEnergy = player.ultimateMax;
      threats = []; obstacles = []; enemyProjectiles = [];
      boss = { name: 'YACERAMI', x: 500, y: 70, width: 120, height: 80,
        health: 100, maxHealth: 100, entranceTime: 0, damageHistory: [] };
      combatTime = 10;
      useUltimate();
      const charge = boss.health;
      combatTime = 10.9;
      updateUltimateEffects(0.9);
      const first = boss.health;
      combatTime = 12;
      updateUltimateBossPulse(1.1);
      const second = boss.health;
      boss = null; ultimateBossPulse = null; ultimateEffects = [];
      return { charge, first, second };
    });
    assert.equal(ultimate.charge, 100);
    assert.equal(ultimate.first, 80);
    assert.equal(ultimate.second, 75);
    console.log('PASS Ultimate alcanza 25% en dos ventanas sin violar 20% por segundo');

    const capped = await page.evaluate(() => {
      lowPerformance = true;
      particles = []; enemyProjectiles = [];
      createParticles(100, 100, '#fff', 1000);
      for (let i = 0; i < 1000; i++) spawnRawEnemyProjectile(100, 100, 200, 0, '#fff');
      return { particles: particles.length, projectiles: enemyProjectiles.length };
    });
    assert(capped.particles <= 90);
    assert(capped.projectiles <= 130);
    console.log('PASS Límites adaptativos de partículas y proyectiles');

    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.locator('#moveStick').isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const stick = await page.locator('#moveStick').boundingBox();
    await page.mouse.move(stick.x + stick.width / 2, stick.y + stick.height / 2);
    await page.mouse.down();
    await page.mouse.move(stick.x + stick.width / 2 + 38, stick.y + stick.height / 2);
    assert(await page.evaluate(() => touchMovement.x > 0.2));
    await page.mouse.up();
    assert.equal(await page.evaluate(() => touchMovement.x), 0);
    console.log('PASS Joystick móvil analógico y sin desbordamiento horizontal');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
