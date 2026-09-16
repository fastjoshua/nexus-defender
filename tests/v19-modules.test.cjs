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

    const selection = await page.evaluate(() => {
      resetGame(); gameState = 'playing';
      const modules = upgradeCatalog.map(item => item.id);
      const newSynergies = newSynergyCatalog.map(item => item.id);
      showUpgradeSelection();
      const categories = [...upgradeOptions.children].map(card => card.querySelector('.upgrade-category').textContent);
      const clues = [...upgradeOptions.children].map(card => card.querySelector('.upgrade-synergy-tag').textContent);
      upgradeScreen.classList.remove('active'); gameState = 'playing';
      for (const module of upgradeCatalog.filter(item => item.oneTime)) player.upgrades.push(module.id);
      showUpgradeSelection();
      const repeated = [...upgradeOptions.children].map(card => card.dataset.module)
        .filter(id => upgradeCatalog.find(item => item.id === id)?.oneTime);
      upgradeScreen.classList.remove('active'); gameState = 'playing';
      return { modules, newSynergies, categories, clues, repeated,
        bestiaryModules: moduleCompendium.children.length,
        bestiarySynergies: synergyCompendium.children.length };
    });
    assert.equal(selection.modules.length, 14);
    assert.equal(selection.newSynergies.length, 8);
    assert.equal(selection.bestiaryModules, 14);
    assert.equal(selection.bestiarySynergies, 24);
    assert.deepEqual(selection.categories, ['ATAQUE', 'DEFENSA', 'MOVILIDAD · ENERGÍA']);
    assert(selection.clues.every(clue => clue.length > 4));
    assert.deepEqual(selection.repeated, []);
    console.log('PASS 14 módulos, 8 sinergias nuevas y tres cartas por categoría sin repetir módulos únicos');

    const unlocks = await page.evaluate(() => {
      resetGame(); gameState = 'playing';
      for (const upgrade of upgradeCatalog) { upgrade.apply(); player.upgrades.push(upgrade.id); }
      checkUpgradeSynergies(); renderModuleRack();
      const first = [...player.synergies];
      checkUpgradeSynergies();
      return { first, second: [...player.synergies], rack: moduleRack.children.length,
        old: [player.synergyUnlocked, player.shockwaveUnlocked, player.aegisUnlocked, player.reactorUnlocked] };
    });
    assert.equal(unlocks.first.length, 8);
    assert.deepEqual(unlocks.first, unlocks.second);
    assert.deepEqual(unlocks.old, [true, true, true, true]);
    assert.equal(unlocks.rack, 22);
    console.log('PASS Ocho sinergias se activan una vez y conviven con las cuatro existentes');

    const offensive = await page.evaluate(() => {
      const threat = (x, y, health = 5) => ({ x, y, width: 30, height: 30, health,
        type: { icon: 'virus', color: '#ff477e', shoots: false, behavior: 'basic' },
        velocityX: 0, velocityY: 0, brain: { mode: 'travel' } });
      resetGame(); gameState = 'playing'; obstacles = []; combatTime = 10;
      for (const id of ['ionic', 'tactical', 'fractal', 'drones', 'condenser', 'overclock', 'damage'])
        player.upgrades.push(id);
      checkUpgradeSynergies();
      const markTarget = threat(500, 400);
      const normalShot = { source: 'normal' };
      const firstMarkDamage = applyTacticalMark(markTarget, 1, normalShot);
      const marked = markTarget.markUntil > combatTime;
      const secondMarkDamage = applyTacticalMark(markTarget, 1, normalShot);
      const consumed = markTarget.markUntil === 0;

      const from = threat(400, 400), near = threat(430, 400), priority = threat(485, 400);
      priority.markUntil = combatTime + 3;
      threats = [from, near, priority];
      triggerIonicArc(from);
      const arc = { near: near.health, priority: priority.health, consumed: priority.markUntil === 0 };

      playerProjectiles = []; player.prismDartsCount = 0;
      splitFractal(415, 415, from);
      splitFractal(415, 415, from);
      splitFractal(415, 415, from);
      const darts = playerProjectiles.filter(projectile => projectile.source === 'fractal');

      threats = [threat(650, 300)]; playerProjectiles = []; player.droneTimer = 0;
      updateCombatModules(.1);
      const drones = playerProjectiles.filter(projectile => projectile.source === 'drone');
      player.ultimateEnergy = 0;
      gainUltimate(10);
      return { firstMarkDamage, marked, secondMarkDamage, consumed, arc,
        darts: darts.length, droneShots: drones.length, energy: player.ultimateEnergy };
    });
    assert.deepEqual([offensive.firstMarkDamage, offensive.marked, offensive.secondMarkDamage,
      offensive.consumed], [1, true, 2, true]);
    assert.equal(offensive.arc.near, 5);
    assert.equal(offensive.arc.priority, 4.2);
    assert.equal(offensive.arc.consumed, true);
    assert.equal(offensive.darts, 4);
    assert.equal(offensive.droneShots, 2);
    assert.equal(offensive.energy, 12);
    console.log('PASS Marca, arco prioritario, dardos limitados, drones y energía extra funcionan');

    const collisions = await page.evaluate(() => {
      const threat = (x, y, health) => ({ x, y, width: 30, height: 30, health,
        type: { icon: 'virus', color: '#ff477e', shoots: false, behavior: 'basic' },
        velocityX: 0, velocityY: 0, brain: { mode: 'travel' } });
      resetGame(); gameState = 'playing'; obstacles = []; chest = null; boss = null;
      player.upgrades.push('ionic');
      const hit = threat(400, 400, 100), arcTarget = threat(460, 400, 100);
      threats = [hit, arcTarget];
      for (let i = 0; i < 6; i += 1) {
        createPlayerProjectile(410, 410, 0, 1, 8, false, { guided: false });
        updatePlayerProjectiles(0);
      }
      const arc = { hits: player.ionicHits, health: arcTarget.health };

      resetGame(); gameState = 'playing'; obstacles = []; chest = null; boss = null;
      for (const id of ['drones', 'condenser']) player.upgrades.push(id);
      checkUpgradeSynergies();
      threats = [threat(400, 400, .2)]; player.ultimateEnergy = 0;
      createPlayerProjectile(410, 410, 0, .6, 7, false,
        { source: 'drone', guided: false, color: '#43ff9b' });
      updatePlayerProjectiles(0);
      const drone = { kills: player.droneKills, energy: player.ultimateEnergy,
        survivors: threats.length };

      resetGame(); gameState = 'playing'; obstacles = []; chest = null; boss = null;
      for (const id of ['fractal', 'overclock']) player.upgrades.push(id);
      checkUpgradeSynergies();
      threats = [threat(600, 380, 100)];
      player.shotCounter = 7; player.attackTimer = 0;
      updatePlayerAttack(0);
      const rain = playerProjectiles.some(projectile => projectile.prismRain);
      return { arc, drone, rain };
    });
    assert.deepEqual(collisions.arc, { hits: 6, health: 99.5 });
    assert.equal(collisions.drone.kills, 1);
    assert.equal(collisions.drone.survivors, 0);
    assert(Math.abs(collisions.drone.energy - 14.4) < .001);
    assert.equal(collisions.rain, true);
    console.log('PASS Integración de seis impactos, baja por dron y octavo disparo prismático');

    const bossMark = await page.evaluate(() => {
      resetGame(); gameState = 'playing'; obstacles = []; threats = []; chest = null;
      player.upgrades.push('tactical'); combatTime = 10;
      boss = { x: 400, y: 400, width: 80, height: 80, health: 100,
        maxHealth: 100, entranceTime: 0, damageHistory: [],
        name: 'YACERAMI', color: '#ff477e' };
      const shot = () => {
        createPlayerProjectile(410, 410, 0, 1, 8, false, { guided: false });
        updatePlayerProjectiles(0);
      };
      shot();
      const marked = boss.markUntil > combatTime;
      boss.damageHistory = [{ time: combatTime, amount: 20 }];
      const healthBeforeCap = boss.health;
      shot();
      const blocked = boss.health === healthBeforeCap && boss.markUntil > combatTime;
      combatTime = 11.1; shot();
      return { marked, blocked, consumed: boss.markUntil === 0,
        resumedDamage: healthBeforeCap - boss.health };
    });
    assert.deepEqual(bossMark, { marked: true, blocked: true,
      consumed: true, resumedDamage: 1.5 });
    console.log('PASS Una marca sobre jefe espera si el límite de daño bloquea el disparo');

    const phaseControl = await page.evaluate(() => {
      const threat = x => ({ x, y: 200, width: 30, height: 30, baseSize: 30,
        speed: 100, velocityX: 0, velocityY: 100, rotation: 0, rotationSpeed: 0,
        sizePulse: 0, sizePulseSpeed: 0, pulseTime: 0, shotTimer: 10, health: 5,
        type: { icon: 'bug', color: '#ff477e', shoots: false, radialShoots: false } });
      resetGame(); gameState = 'playing'; obstacles = [];
      const slowed = threat(400), free = threat(600);
      threats = [slowed, free];
      phaseFields = [{ x: 415, y: 215, radius: 90, life: .5, maxLife: .5, vortex: true }];
      updateThreats(.2);
      const movement = { slowed: slowed.y - 200, free: free.y - 200 };
      const beforePush = { x: slowed.x, y: slowed.y };
      phaseFields[0].life = .05;
      updateCombatModules(.1);
      return { movement, pushed: slowed.x !== beforePush.x || slowed.y !== beforePush.y,
        fieldGone: phaseFields.length === 0 };
    });
    assert(phaseControl.movement.slowed < phaseControl.movement.free * .55);
    assert.equal(phaseControl.pushed, true);
    assert.equal(phaseControl.fieldGone, true);
    console.log('PASS Zona de fase ralentiza amenazas y Vórtice las aparta al terminar');

    const defensive = await page.evaluate(() => {
      const threat = { x: 580, y: 580, width: 30, height: 30,
        type: { icon: 'virus', color: '#ff477e' }, health: 4,
        velocityX: 0, velocityY: 0, brain: { mode: 'travel' } };
      resetGame(); gameState = 'playing'; obstacles = [];
      for (const id of ['nano', 'armor', 'repulsor', 'phaseAnchor', 'shield']) player.upgrades.push(id);
      checkUpgradeSynergies();
      player.x = 550; player.y = 550;
      threats = [threat]; boss = { x: 610, y: 610, width: 60, height: 60 };
      player.repulsorTimer = .01;
      const enemyBefore = threat.x, bossBefore = boss.x;
      updateCombatModules(.1);
      const repulsed = threat.x > enemyBefore, bossFixed = boss.x === bossBefore;
      threats = []; boss = null;

      player.dashCooldown = 0; player.dashTime = 0; player.dashCount = 0;
      useDash(); updatePlayer(.23);
      const firstFieldCount = phaseFields.length;
      player.dashCooldown = 0; player.dashTime = 0; player.shieldTime = 0;
      player.phaseShieldCooldown = 0;
      useDash(); updatePlayer(.23);
      const field = phaseFields[0];
      const initialShield = player.shieldTime > 0;
      player.x = field.x + field.radius + 10;
      updateCombatModules(.05);
      player.x = field.x - player.width / 2;
      player.y = field.y - player.height / 2;
      updateCombatModules(.05);
      const fieldResult = { count: phaseFields.length, radius: field.radius,
        duration: field.maxLife, initialShield, shield: player.shieldTime > 0,
        cooldown: player.phaseShieldCooldown };

      level = 1; lives = player.maxLives - 1;
      player.nanoObservedKills = 0; player.nanoWaveLevel = 1;
      player.nanoKillsThisWave = 0; player.nanoRepairedThisWave = false;
      runStats.enemiesDestroyed = 12; updateNanoSwarm();
      const repaired = lives;
      runStats.enemiesDestroyed = 20; updateNanoSwarm();
      const once = lives;
      level = 2; player.shieldTime = 0;
      runStats.enemiesDestroyed = 32; updateNanoSwarm();
      const fullHealthShield = player.shieldTime > 0;
      return { repulsed, bossFixed, firstFieldCount, fieldResult,
        repaired, once, fullHealthShield, maxLives: player.maxLives };
    });
    assert.equal(defensive.repulsed, true);
    assert.equal(defensive.bossFixed, true);
    assert.equal(defensive.firstFieldCount, 0);
    assert.deepEqual([defensive.fieldResult.count, defensive.fieldResult.radius,
      defensive.fieldResult.duration, defensive.fieldResult.initialShield,
      defensive.fieldResult.shield], [1, 120, 1.6, false, true]);
    assert(defensive.fieldResult.cooldown > 19);
    assert.equal(defensive.repaired, defensive.maxLives);
    assert.equal(defensive.once, defensive.maxLives);
    assert.equal(defensive.fullHealthShield, true);
    console.log('PASS Repulsor, segunda ancla de dash, manto y reparación por oleada funcionan');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { startGame(); showUpgradeSelection(); });
    const mobile = await page.evaluate(() => ({ position: getComputedStyle(upgradeScreen).position,
      cardCount: upgradeOptions.children.length,
      canScroll: upgradeScreen.scrollHeight > upgradeScreen.clientHeight,
      overflow: document.documentElement.scrollWidth > innerWidth }));
    assert.deepEqual(mobile, { position: 'fixed', cardCount: 3, canScroll: true, overflow: false });
    await page.locator('#upgradeOptions button').nth(2).click();
    assert.equal(await page.evaluate(() => gameState), 'playing');
    console.log('PASS Las tres cartas son accesibles en móvil y la misión continúa al elegir');

    assert.deepEqual(errors, []);
    console.log('PASS Sin errores de navegador');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
