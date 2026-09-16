// Browser integration checks for exact movement, ship powers and procedural audio.
const assert = require('node:assert/strict');
const fs = require('node:fs');
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
    await page.locator('.menu-advanced summary').click();
    await page.locator('#musicButton').click();
    await page.locator('#startForm .primary-button').click();
    const results = await page.evaluate(() => {
      effectsVolume = 0; stopMusic(); boss = null; chest = null;
      const type = threatTypes.find(entry => entry.icon === 'bug');
      function fixture(x, y, health = 10) {
        return { x, y, width: 30, height: 30, baseSize: 30, speed: 130,
          velocityX: 0, velocityY: 0, health, maxHealth: health,
          type, rotation: 0, sizePulse: 0, sizePulseSpeed: 0 };
      }
      function select(skin) {
        selectedSkin = skin; resetGame(); player.skin = skin;
        gameState = 'playing'; aimMode = 'manual';
        manualAim = { hasDirection: true, hasPointer: false, stickActive: false,
          vectorX: 1, vectorY: 0, x: 0, y: 0 };
        threats = []; obstacles = []; boss = null; chest = null;
        playerProjectiles = []; enemyProjectiles = []; ultimateEffects = [];
      }
      function putOn(projectile, threat) {
        projectile.x = threat.x + threat.width / 2 - projectile.width / 2;
        projectile.y = threat.y + threat.height / 2 - projectile.height / 2;
        projectile.velocityX = 0; projectile.velocityY = 0;
      }
      const out = {};
      select('cyan');
      player.shotCounter = 3; player.attackTimer = 0;
      updatePlayerAttack(0);
      out.nexoPierceReady = playerProjectiles[0].pierce === 1;
      const first = fixture(100, 100), second = fixture(160, 100);
      threats = [first, second];
      putOn(playerProjectiles[0], first); updatePlayerProjectiles(0);
      out.nexoFirst = playerProjectiles.length === 1 && first.health === 9;
      putOn(playerProjectiles[0], second); updatePlayerProjectiles(0);
      out.nexoSecond = playerProjectiles.length === 0 && second.health === 9;

      select('violet'); player.attackTimer = 0; updatePlayerAttack(0);
      out.quantumPair = playerProjectiles.length === 2 &&
        playerProjectiles[0].quantumCycle === playerProjectiles[1].quantumCycle &&
        playerProjectiles[0].velocityY * playerProjectiles[1].velocityY < 0;
      const paired = fixture(100, 100), nearby = fixture(145, 100);
      threats = [paired, nearby];
      putOn(playerProjectiles[0], paired); updatePlayerProjectiles(0);
      putOn(playerProjectiles[0], paired); updatePlayerProjectiles(0);
      out.quantumArc = nearby.health < 10 && paired.health < 9;

      select('gold'); player.attackTimer = 0; updatePlayerAttack(0);
      const heavy = fixture(100, 100), splash = fixture(140, 100);
      threats = [heavy, splash];
      putOn(playerProjectiles[0], heavy); updatePlayerProjectiles(0);
      out.beckerSplash = Math.abs(splash.health - (10 - 2.4 * 0.3)) < 1e-8;

      select('cyan'); player.ultimateEnergy = player.ultimateMax;
      useUltimate(); updateUltimateEffects(.57);
      out.nexoUltimate = playerProjectiles.length === 21 &&
        playerProjectiles.every(projectile => projectile.velocityX > 0 && projectile.isUltimate);

      select('violet'); player.ultimateEnergy = player.ultimateMax;
      const phased = fixture(player.x + 170, player.y, 10);
      threats = [phased];
      enemyProjectiles = [{ x: player.x + 150, y: player.y, radius: 6,
        width: 12, height: 12, velocityX: 0, velocityY: 0, color: '#fff' }];
      useUltimate(); updateUltimateEffects(.45);
      out.quantumUltimate = player.shieldTime >= 4 && player.slowTime >= 2 &&
        phased.health < 10 && enemyProjectiles.length === 0;

      select('gold'); player.ultimateEnergy = player.ultimateMax;
      threats = [fixture(player.x + 100, player.y)];
      obstacles = [{ x: player.x + 90, y: player.y, width: 20, height: 20, health: 2 }];
      enemyProjectiles = [{ x: player.x + 100, y: player.y, radius: 6,
        width: 12, height: 12, velocityX: 0, velocityY: 0, color: '#fff' }];
      useUltimate(); updateUltimateEffects(.2);
      out.solarCharges = threats.length === 1 && obstacles.length === 1;
      updateUltimateEffects(.5);
      out.solarWave = threats.length === 0 && obstacles.length === 0 && enemyProjectiles.length === 0;

      select('cyan'); player.dashCooldown = 0; keys = { ArrowRight: true };
      useDash(); updatePlayer(.05);
      out.dashEcho = dashEchoes.length > 0 &&
        Math.hypot(dashEchoes[0].x - player.x - player.width / 2,
          dashEchoes[0].y - player.y - player.height / 2) < 1e-8;
      keys = {}; gameState = 'paused'; stopMusic();
      return out;
    });
    for (const [name, passed] of Object.entries(results)) {
      assert(passed, name); console.log(`PASS ${name}`);
    }
    const audio = await page.evaluate(() => {
      effectsVolume = 0.7; musicVolume = 0.35; musicEnabled = true;
      scenarioIndex = 0; boss = null; startMusic(); const initial = GameAudio.status();
      scenarioIndex = 1; startMusic(); const lunar = GameAudio.status();
      boss = { final: true, phaseTwo: true }; startMusic(); const final = GameAudio.status();
      for (const skin of ['cyan', 'violet', 'gold']) {
        player.skin = skin; playSound('playerShot');
      }
      playSound('ultimate'); playSound('dash'); playSound('collision');
      stopMusic(); const stopped = GameAudio.status(); boss = null;
      return { initial, lunar, final, stopped };
    });
    assert(audio.initial.playing && audio.initial.scene === 0);
    assert(audio.lunar.playing && audio.lunar.scene === 1);
    assert(audio.final.playing && audio.final.scene === 6 && audio.final.trackCount === 7);
    assert(!audio.stopped.playing);
    console.log('PASS Five scenario scores and boss transitions run without restarting the browser');
    const output = path.resolve(__dirname, '..', 'work', 'verification');
    fs.mkdirSync(output, { recursive: true });
    await page.evaluate(() => {
      selectedSkin = 'gold'; resetGame(); gameState = 'playing'; stopMusic(); effectsVolume = 0;
      threats = []; obstacles = []; enemyProjectiles = []; boss = null;
      player.x = 560; player.y = 340;
      player.ultimateEnergy = player.ultimateMax;
      useUltimate(); ultimateEffects[0].age = 0.57;
      gameState = 'paused'; draw(performance.now());
    });
    await page.locator('#gameCanvas').screenshot({ path: path.join(output, 'v15-solar.png') });
    await page.evaluate(() => {
      selectedSkin = 'violet'; resetGame(); gameState = 'playing';
      threats = []; obstacles = []; boss = null; player.x = 380; player.y = 340;
      keys = { ArrowRight: true }; useDash();
      for (let i = 0; i < 3; i++) updatePlayer(.04);
      keys = {}; gameState = 'paused'; draw(performance.now());
    });
    await page.locator('#gameCanvas').screenshot({ path: path.join(output, 'v15-dash.png') });
    await page.evaluate(() => {
      selectedSkin = 'cyan'; resetGame(); gameState = 'paused'; stopMusic();
      obstacles = []; boss = null; powerUps = []; enemyProjectiles = [];
      player.x = 690; player.y = 350;
      const type = threatTypes.find(entry => entry.icon === 'skull');
      const threat = { x: 470, y: 390, width: 48, height: 48, baseSize: 48,
        speed: 130, velocityX: 0, velocityY: 0, type, health: 3, maxHealth: 3,
        rotation: 0, rotationSpeed: 0, sizePulse: 0, sizePulseSpeed: 0 };
      EnemyBehavior.initialize(threat).cooldown = 0;
      EnemyBehavior.step(threat, player, .02, () => true);
      threats = [threat]; draw(performance.now());
    });
    await page.locator('#gameCanvas').screenshot({ path: path.join(output, 'v15-exact-path.png') });
    assert.deepEqual(errors, []);
    console.log('PASS No browser errors during powers or audio');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
