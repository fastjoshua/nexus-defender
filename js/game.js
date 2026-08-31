"use strict";

/*
 * NEXUS DEFENDER
 * ---------------------------------
 * El juego está organizado en funciones pequeñas para que sea fácil estudiarlo:
 * 1. Reiniciar datos.
 * 2. Actualizar posiciones y colisiones.
 * 3. Dibujar cada elemento en el canvas.
 * 4. Repetir el ciclo con requestAnimationFrame.
 */

// Referencias a los elementos de la página.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startForm = document.getElementById("startForm");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const upgradeScreen = document.getElementById("upgradeScreen");
const upgradeOptions = document.getElementById("upgradeOptions");
const victoryScreen = document.getElementById("victoryScreen");
const bestiaryScreen = document.getElementById("bestiaryScreen");
const bestiaryButton = document.getElementById("bestiaryButton");
const closeBestiaryButton = document.getElementById("closeBestiaryButton");
const restartButton = document.getElementById("restartButton");
const victoryRestartButton = document.getElementById("victoryRestartButton");
const pauseMessage = document.getElementById("pauseMessage");
const powerStatus = document.getElementById("powerStatus");
const musicButton = document.getElementById("musicButton");
const mobileDash = document.getElementById("mobileDash");
const mobileUltimate = document.getElementById("mobileUltimate");
const dashIndicator = document.getElementById("dashIndicator");
const levelProgressText = document.getElementById("levelProgressText");
const levelProgressBar = document.getElementById("levelProgressBar");
const nextBossText = document.getElementById("nextBossText");
const bossBar = document.getElementById("bossBar");
const bossTime = document.getElementById("bossTime");
const bossProgress = document.getElementById("bossProgress");
const bossName = document.getElementById("bossName");
const recordsBody = document.getElementById("recordsBody");
const bossIncoming = document.getElementById("bossIncoming");
const incomingBossName = document.getElementById("incomingBossName");
const finalBossDefeatsText = document.getElementById("finalBossDefeats");
const hardModeOption = document.getElementById("hardModeOption");
const hardModeInput = hardModeOption.querySelector("input");
const hardModeHint = document.getElementById("hardModeHint");
const achievementsList = document.getElementById("achievementsList");
const gameOverStats = document.getElementById("gameOverStats");
const victoryStats = document.getElementById("victoryStats");
const storeButton = document.getElementById("storeButton");
const upgradeStoreButton = document.getElementById("upgradeStoreButton");
const storeScreen = document.getElementById("storeScreen");
const closeStoreButton = document.getElementById("closeStoreButton");
const storeFragments = document.getElementById("storeFragments");
const storeBalance = document.getElementById("storeBalance");
const cosmeticGrid = document.getElementById("cosmeticGrid");
const bossRushOption = document.getElementById("bossRushOption");
const bossRushInput = bossRushOption.querySelector("input");
const bossRushHint = document.getElementById("bossRushHint");
const aimStick = document.getElementById("aimStick");
const aimKnob = document.getElementById("aimKnob");
const musicVolumeSlider = document.getElementById("musicVolume");
const effectsVolumeSlider = document.getElementById("effectsVolume");
const musicVolumeValue = document.getElementById("musicVolumeValue");
const effectsVolumeValue = document.getElementById("effectsVolumeValue");
const ultimateIndicator = document.getElementById("ultimateIndicator");
const ultimateValue = document.getElementById("ultimateValue");
const ultimateBar = document.getElementById("ultimateBar");

const hudPlayer = document.getElementById("hudPlayer");
const hudLives = document.getElementById("hudLives");
const hudScore = document.getElementById("hudScore");
const hudLevel = document.getElementById("hudLevel");
const hudDash = document.getElementById("hudDash");
const hudHighScore = document.getElementById("hudHighScore");

// Medidas internas fijas. El CSS adapta el canvas al tamaño de la pantalla.
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const HIGH_SCORE_KEY = "nexusDefenderHighScore";
const RECORDS_KEY = "nexusDefenderRecords";
const FINAL_BOSS_DEFEATS_KEY = "nexusDefenderYaceramiDefeats";
const SETTINGS_KEY = "nexusDefenderSettings";
const ACHIEVEMENTS_KEY = "nexusDefenderAchievements";
const FRAGMENTS_KEY = "nexusDefenderFragments";
const COSMETICS_KEY = "nexusDefenderCosmetics";
const DASH_COOLDOWN = 6;
const LEVEL_DURATION = 20;

// Algunos navegadores limitan localStorage cuando index.html se abre con file://.
// Estas funciones mantienen el juego operativo aunque el guardado no esté disponible.
const temporaryStorage = {};
function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return temporaryStorage[key] ?? null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    temporaryStorage[key] = String(value);
  }
}

// Estado general del juego.
let gameState = "menu"; // Posibles valores: menu, playing, paused, gameover.
let playerName = "Operador";
let player;
let threats = [];
let powerUps = [];
let particles = [];
let enemyProjectiles = [];
let playerProjectiles = [];
let boss = null;
let obstacles = [];
let scenarioIndex = 0;
let chest = null;
let chestTimer = 0;
let lastCalculatedLevel = 1;
let keys = {};
let score = 0;
let level = 1;
let lives = 3;
let highScore = Number(safeStorageGet(HIGH_SCORE_KEY)) || 0;
let elapsedTime = 0;
let threatTimer = 0;
let powerUpTimer = 0;
let lastTime = 0;
let screenShake = 0;
const savedSettings = loadSettings();
let selectedSkin = ["cyan", "violet", "gold"].includes(savedSettings.skin) ? savedSettings.skin : "cyan";
let selectedDifficulty = "normal";
let musicEnabled = savedSettings.musicEnabled !== false;
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let musicVolume = Number.isFinite(savedSettings.musicVolume) ? savedSettings.musicVolume : 0.35;
let effectsVolume = Number.isFinite(savedSettings.effectsVolume) ? savedSettings.effectsVolume : 0.7;
let records = loadRecords();
let finalBossDefeats = Number(safeStorageGet(FINAL_BOSS_DEFEATS_KEY)) || 0;
let bossIncomingTimer = 0;
let pendingBossLevel = null;
let combatTime = 0;
let cometTimer = 0;
let cometWarning = null;
let comets = [];
let manualAim = { hasPointer: false, stickActive: false, x: GAME_WIDTH / 2, y: 0, vectorX: 0, vectorY: -1 };
let aimMode = ["auto", "manual"].includes(savedSettings.aimMode) ? savedSettings.aimMode : "auto";
let fragments = Number(safeStorageGet(FRAGMENTS_KEY)) || 0;
let ownedCosmetics = loadCosmetics();
let selectedTrail = savedSettings.trail || "none";
let cosmeticTrail = [];
let cosmeticTrailTimer = 0;
let storeReturnState = "menu";
let bossRushIndex = 0;
let pendingBossRushAdvance = false;
let pausedByVisibility = false;
const bossRushLevels = [3, 6, 9, 12, 15];
let runStats = createEmptyStats();
let unlockedAchievements = loadAchievements();

const achievementCatalog = [
  { id: "untouched", icon: "◇", name: "Nexo intacto", description: "Derrota a YACERAMI sin recibir daño." },
  { id: "centurion", icon: "✹", name: "Centinela centenario", description: "Destruye 100 enemigos en una misión." },
  { id: "ultimate_master", icon: "✦", name: "Poder absoluto", description: "Usa la Ultimate tres veces en una misión." },
  { id: "hard_victory", icon: "⚠", name: "Soberano del vacío", description: "Vence a YACERAMI en modo difícil." }
];

const cosmeticCatalog = [
  { id: "none", name: "Sin estela", description: "Silueta limpia del Nexo.", price: 0, color: "#8296a6" },
  { id: "neon", name: "Rastro Neón", description: "Partículas cian de defensa.", price: 10, color: "#00f0ff" },
  { id: "quantum", name: "Eco Quantum", description: "Estela violeta intermitente.", price: 20, color: "#c084fc" },
  { id: "solar", name: "Cometa Solar", description: "Brillo dorado de alta energía.", price: 35, color: "#ffd166" },
  { id: "void", name: "Vacío YACERAMI", description: "Rastro carmesí para veteranos.", price: 55, color: "#ff2d75" }
];

// Datos visuales de los distintos enemigos.
const threatTypes = [
  { name: "VIRUS", icon: "bug", color: "#ff2d75", sides: 6 },
  { name: "BOT", icon: "skull", color: "#a855f7", sides: 4 },
  { name: "SPAM", icon: "mail", color: "#ff9f1c", sides: 3 },
  { name: "SNIPER", icon: "turret", color: "#ff5f5f", sides: 8, shoots: true },
  { name: "HUNTER", icon: "eye", color: "#ff477e", sides: 5, behavior: "hunter" },
  { name: "GLITCH", icon: "glitch", color: "#f72585", sides: 4, behavior: "glitch" },
  { name: "TANK", icon: "tank", color: "#e63946", sides: 8, behavior: "tank" },
  { name: "ORBITER", icon: "orbiter", color: "#00f0ff", sides: 7, behavior: "orbiter" },
  { name: "MINA PULSAR", icon: "mine", color: "#ff9f1c", sides: 10, behavior: "mine", radialShoots: true },
  { name: "PHANTOM", icon: "phantom", color: "#f72585", sides: 4, behavior: "phantom" }
];

const scenarioThemes = [
  { name: "Puerta del Nexo", background: "#020611", grid: "rgba(0, 240, 255, 0.09)", accent: "#00f0ff" },
  { name: "Órbita Lunar", background: "#08051a", grid: "rgba(192, 132, 252, 0.11)", accent: "#c084fc" },
  { name: "Cinturón Carmesí", background: "#12050b", grid: "rgba(255, 71, 126, 0.11)", accent: "#ff477e" },
  { name: "Vacío de Venus", background: "#110d03", grid: "rgba(255, 209, 102, 0.11)", accent: "#ffd166" },
  { name: "Trono de YACERAMI", background: "#100313", grid: "rgba(247, 37, 133, 0.13)", accent: "#f72585" }
];

hudHighScore.textContent = formatScore(highScore);
renderRecords();
finalBossDefeatsText.textContent = String(finalBossDefeats);
applySavedSettings();
updateDifficultyAvailability();
renderAchievements();
renderCosmeticStore();
drawBackground(0);

/** Prepara todos los datos necesarios para una partida nueva. */
function resetGame() {
  player = {
    x: GAME_WIDTH / 2 - 22,
    y: GAME_HEIGHT - 82,
    width: 44,
    height: 44,
    speed: 330,
    shieldTime: 0,
    slowTime: 0,
    invulnerableTime: 0,
    dashCooldown: 0,
    dashTime: 0,
    dashX: 0,
    dashY: -1,
    dashReadyAnnounced: true,
    attackTimer: 0,
    attackInterval: 0.48,
    projectileDamage: 1,
    projectileSpeed: 560,
    dashCooldownMax: DASH_COOLDOWN,
    maxLives: selectedDifficulty === "hard" ? 2 : 3,
    upgrades: [],
    synergyUnlocked: false,
    shotCounter: 0,
    ultimateEnergy: 0,
    // Requiere el doble de energía que la primera versión para reservarla para emergencias.
    ultimateMax: 200,
    ultimateBossDamageRemaining: 0,
    shockwaveUnlocked: false,
    aegisUnlocked: false,
    reactorUnlocked: false,
    aegisCooldown: 0,
    skin: selectedSkin
  };

  // Cada skin cambia el estilo de disparo desde el inicio.
  if (selectedSkin === "cyan") {
    player.attackInterval = 0.34;
    player.projectileDamage = 1;
    player.projectileSpeed = 650;
  } else if (selectedSkin === "violet") {
    player.attackInterval = 0.52;
    player.projectileDamage = 0.85;
    player.projectileSpeed = 590;
  } else {
    player.attackInterval = 0.72;
    player.projectileDamage = 2.4;
    player.projectileSpeed = 500;
  }

  threats = [];
  powerUps = [];
  particles = [];
  enemyProjectiles = [];
  playerProjectiles = [];
  boss = null;
  scenarioIndex = 0;
  generateScenario();
  chest = null;
  chestTimer = 0;
  bossIncomingTimer = 0;
  pendingBossLevel = null;
  combatTime = 0;
  cometTimer = 0;
  cometWarning = null;
  comets = [];
  cosmeticTrail = [];
  cosmeticTrailTimer = 0;
  bossRushIndex = 0;
  pendingBossRushAdvance = false;
  keys = {};
  score = 0;
  level = 1;
  lastCalculatedLevel = 1;
  lives = player.maxLives;
  runStats = createEmptyStats();
  elapsedTime = 0;
  threatTimer = 0;
  powerUpTimer = 0;
  screenShake = 0;
  powerStatus.textContent = "";
  bossBar.classList.remove("visible");
  bossIncoming.classList.remove("visible");
  updateHud();
}

/** Inicia la partida después de escribir el nombre. */
function startGame() {
  resetGame();
  gameState = "playing";
  startScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");
  upgradeScreen.classList.remove("active");
  victoryScreen.classList.remove("active");
  bestiaryScreen.classList.remove("active");
  storeScreen.classList.remove("active");
  pauseMessage.classList.remove("visible");
  lastTime = performance.now();
  ensureAudioContext();
  startMusic();
  // El foco pasa al área de juego para que el teclado funcione de inmediato.
  requestAnimationFrame(() => canvas.focus({ preventScroll: true }));
  if (selectedDifficulty === "bossrush") {
    level = bossRushLevels[0];
    lastCalculatedLevel = level;
    scenarioIndex = 0;
    generateScenario();
    startBossWarning();
  }
}

/** Crea una amenaza desde arriba, la izquierda o la derecha. */
function spawnThreat() {
  // El rango aumenta con el nivel: pueden aparecer amenazas pequeñas y veloces
  // o amenazas grandes que ocupan más espacio.
  let size = randomBetween(24, Math.min(82, 48 + level * 3));
  // Los comportamientos avanzados se incorporan gradualmente.
  let availableTypes = threatTypes.slice(0, 3);
  if (level >= 2) availableTypes = threatTypes.slice(0, 4);
  if (level >= 3) availableTypes = threatTypes.slice(0, 6);
  if (level >= 4) availableTypes = threatTypes;
  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  if (type.behavior === "tank") size = Math.min(92, size * 1.45);
  if (type.behavior === "mine") size = Math.min(68, size * 1.18);
  const side = ["top", "left", "right"][Math.floor(Math.random() * 3)];
  let speedFactor = type.shoots ? 0.48 : 1;
  if (type.behavior === "hunter") speedFactor = 0.88;
  if (type.behavior === "tank") speedFactor = 0.42;
  if (type.behavior === "mine") speedFactor = 0.34;
  if (type.behavior === "orbiter") speedFactor = 0.78;
  const difficultySpeed = selectedDifficulty === "hard" ? 1.22 : 1;
  const speed = (randomBetween(115, 165) + level * 18) * speedFactor * difficultySpeed;
  const baseHealth = type.behavior === "tank" ? 7 : type.behavior === "mine" ? 5 : type.shoots ? 3 : Math.max(1, Math.round(size / 38));
  const health = selectedDifficulty === "hard" ? Math.ceil(baseHealth * 1.3) : baseHealth;
  let x;
  let y;
  let velocityX;
  let velocityY;

  if (side === "left") {
    x = -size;
    y = randomBetween(35, GAME_HEIGHT - size - 35);
    velocityX = speed;
    velocityY = randomBetween(-30, 30);
  } else if (side === "right") {
    x = GAME_WIDTH + size;
    y = randomBetween(35, GAME_HEIGHT - size - 35);
    velocityX = -speed;
    velocityY = randomBetween(-30, 30);
  } else {
    x = randomBetween(10, GAME_WIDTH - size - 10);
    y = -size;
    velocityX = randomBetween(-36, 36);
    velocityY = speed;
  }

  threats.push({
    x,
    y,
    width: size,
    height: size,
    speed,
    velocityX,
    velocityY,
    side,
    shotTimer: randomBetween(0.8, 1.5),
    health,
    maxHealth: health,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: randomBetween(-2, 2),
    baseSize: size,
    sizePulse: randomBetween(0, Math.PI * 2),
    sizePulseSpeed: randomBetween(1.5, 3.2),
    behaviorPhase: randomBetween(0, Math.PI * 2),
    type
  });
}

/** Crea un módulo de IA. El tipo se elige al azar. */
function spawnPowerUp() {
  const powerTypes = [
    { type: "shield", symbol: "S", color: "#00f0ff" },
    { type: "slow", symbol: "T", color: "#a855f7" },
    { type: "repair", symbol: "+", color: "#43ff9b" }
  ];
  const power = powerTypes[Math.floor(Math.random() * powerTypes.length)];

  powerUps.push({
    x: randomBetween(30, GAME_WIDTH - 60),
    y: -35,
    width: 34,
    height: 34,
    speed: 105,
    pulse: 0,
    ...power
  });
}

/** Actualiza la partida. deltaTime representa segundos desde el cuadro anterior. */
function update(deltaTime) {
  if (gameState !== "playing") return;
  combatTime += deltaTime;

  // El reloj de nivel se detiene durante un jefe: hay que derrotarlo para avanzar.
  if (!boss && bossIncomingTimer <= 0) elapsedTime += deltaTime;
  threatTimer += deltaTime;
  powerUpTimer += deltaTime;
  chestTimer += deltaTime;

  // Un nivel nuevo cada 20 segundos. La barra muestra el avance de la oleada.
  const calculatedLevel = selectedDifficulty === "bossrush"
    ? level
    : Math.min(15, Math.floor(elapsedTime / LEVEL_DURATION) + 1);
  if (selectedDifficulty !== "bossrush" && calculatedLevel !== lastCalculatedLevel) {
    lastCalculatedLevel = calculatedLevel;
    level = calculatedLevel;
    const newScenarioIndex = Math.floor((level - 1) / 3);
    if (newScenarioIndex !== scenarioIndex) {
      scenarioIndex = newScenarioIndex;
      generateScenario();
    }
    playSound("level");
    if (level % 3 === 0) startBossWarning();
  }
  score += deltaTime * (10 + level * 2);

  updatePlayer(deltaTime);
  updatePlayerAttack(deltaTime);
  updatePlayerProjectiles(deltaTime);
  updateThreats(deltaTime);
  updatePowerUps(deltaTime);
  updateChest(deltaTime);
  updateCometEvent(deltaTime);
  updateEnemyProjectiles(deltaTime);
  updateBossWarning(deltaTime);
  updateBoss(deltaTime);
  updateParticles(deltaTime);
  updateCosmeticTrail(deltaTime);

  // Los enemigos aparecen cada vez más rápido al subir de nivel.
  const difficultySpawnFactor = selectedDifficulty === "hard" ? 0.75 : 1;
  const spawnInterval = (boss ? 1.6 : Math.max(0.3, 1.05 - level * 0.06)) * difficultySpawnFactor;
  if (selectedDifficulty !== "bossrush" && threatTimer >= spawnInterval) {
    spawnThreat();
    threatTimer = 0;
  }

  // Un power-up aparece aproximadamente cada 10 segundos.
  if (powerUpTimer >= 10) {
    spawnPowerUp();
    powerUpTimer = 0;
  }


  if (chestTimer >= 28 && !chest) {
    spawnChest();
    chestTimer = 0;
  }


  if (selectedDifficulty !== "bossrush" && level >= 2 && !boss) {
    cometTimer += deltaTime;
    if (cometTimer >= 14 && !cometWarning && comets.length === 0) {
      startCometWarning();
      cometTimer = 0;
    }
  }

  screenShake = Math.max(0, screenShake - deltaTime * 35);
  updateHud();
}

function updatePlayer(deltaTime) {
  const previousX = player.x;
  const previousY = player.y;
  let directionX = 0;
  let directionY = 0;

  if (keys.ArrowLeft || keys.a) directionX -= 1;
  if (keys.ArrowRight || keys.d) directionX += 1;
  if (keys.ArrowUp || keys.w) directionY -= 1;
  if (keys.ArrowDown || keys.s) directionY += 1;

  // Normalizar evita que el movimiento diagonal sea más rápido.
  if (directionX !== 0 && directionY !== 0) {
    directionX *= Math.SQRT1_2;
    directionY *= Math.SQRT1_2;
  }

  player.x += directionX * player.speed * deltaTime;
  player.y += directionY * player.speed * deltaTime;

  // Durante el dash se conserva la última dirección y aumenta mucho la velocidad.
  if (player.dashTime > 0) {
    const dashSpeed = 980;
    player.x += player.dashX * dashSpeed * deltaTime;
    player.y += player.dashY * dashSpeed * deltaTime;
    player.dashTime = Math.max(0, player.dashTime - deltaTime);
    player.invulnerableTime = Math.max(player.invulnerableTime, 0.08);
    createDashTrail();
  }

  player.x = clamp(player.x, 8, GAME_WIDTH - player.width - 8);
  player.y = clamp(player.y, 8, GAME_HEIGHT - player.height - 8);

  // Los obstáculos de cada escenario bloquean el movimiento del jugador.
  if (obstacles.some((obstacle) => isColliding(player, obstacle))) {
    player.x = previousX;
    player.y = previousY;
  }

  player.shieldTime = Math.max(0, player.shieldTime - deltaTime);
  player.slowTime = Math.max(0, player.slowTime - deltaTime);
  player.invulnerableTime = Math.max(0, player.invulnerableTime - deltaTime);
  player.dashCooldown = Math.max(0, player.dashCooldown - deltaTime);
  player.aegisCooldown = Math.max(0, player.aegisCooldown - deltaTime);
  if (player.dashCooldown <= 0 && !player.dashReadyAnnounced) {
    player.dashReadyAnnounced = true;
    playSound("dashReady");
  }

  const activePowers = [];
  if (player.shieldTime > 0) activePowers.push(`ESCUDO IA ${Math.ceil(player.shieldTime)}s`);
  if (player.slowTime > 0) activePowers.push(`ANÁLISIS TEMPORAL ${Math.ceil(player.slowTime)}s`);
  if (player.synergyUnlocked) activePowers.push("SINERGIA: NOVA ESTELAR");
  if (player.shockwaveUnlocked) activePowers.push("SINERGIA: IMPACTO HIPERSÓNICO");
  if (player.aegisUnlocked) activePowers.push(`ÉGIDA ${player.aegisCooldown <= 0 ? "LISTA" : Math.ceil(player.aegisCooldown) + "s"}`);
  if (player.reactorUnlocked) activePowers.push("REACTOR QUANTUM");
  powerStatus.textContent = activePowers.join("  //  ");
}

/** Ataque automático: busca el objetivo más cercano y dispara según la skin. */
function updatePlayerAttack(deltaTime) {
  player.attackTimer -= deltaTime;
  if (player.attackTimer > 0) return;

  const originX = player.x + player.width / 2;
  const originY = player.y + player.height / 2;
  let baseAngle;

  if (aimMode === "manual") {
    if (manualAim.stickActive) {
      baseAngle = Math.atan2(manualAim.vectorY, manualAim.vectorX);
    } else if (manualAim.hasPointer) {
      baseAngle = Math.atan2(manualAim.y - originY, manualAim.x - originX);
    } else {
      return;
    }
  } else {
    const target = getNearestTarget();
    if (!target) return;
    const targetX = target.x + target.width / 2;
    const targetY = target.y + target.height / 2;
    baseAngle = Math.atan2(targetY - originY, targetX - originX);
  }

  if (player.skin === "violet") {
    createPlayerProjectile(originX, originY, baseAngle - 0.1, 1, 7);
    createPlayerProjectile(originX, originY, baseAngle + 0.1, 1, 7);
  } else if (player.skin === "gold") {
    createPlayerProjectile(originX, originY, baseAngle, 1, 14);
  } else {
    createPlayerProjectile(originX, originY, baseAngle, 1, 8);
  }

  player.shotCounter += 1;
  // Nova Estelar tarda 100% más: se activa cada 10 ciclos, antes era cada 5.
  if (player.synergyUnlocked && player.shotCounter % 10 === 0) {
    [-0.28, -0.14, 0, 0.14, 0.28].forEach((offset) => {
      createPlayerProjectile(originX, originY, baseAngle + offset, 1.5, 12);
    });
    createParticles(originX, originY, "#43ff9b", 12);
    playSound("powerUp");
  }

  player.attackTimer = player.attackInterval;
  playSound("playerShot");
}

function getNearestTarget() {
  if (boss) return boss;
  if (chest) return chest;
  const targets = [...threats, ...obstacles];
  if (targets.length === 0) return null;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  return targets.reduce((nearest, threat) => {
    const currentDistance = Math.hypot(threat.x - centerX, threat.y - centerY);
    const nearestDistance = Math.hypot(nearest.x - centerX, nearest.y - centerY);
    return currentDistance < nearestDistance ? threat : nearest;
  });
}

function createPlayerProjectile(x, y, angle, damageMultiplier, size, isUltimate = false) {
  const colors = getSkinColors();
  playerProjectiles.push({
    x: x - size / 2,
    y: y - size / 2,
    width: size,
    height: size,
    velocityX: Math.cos(angle) * player.projectileSpeed,
    velocityY: Math.sin(angle) * player.projectileSpeed,
    damage: player.projectileDamage * damageMultiplier,
    color: colors.primary,
    skin: player.skin,
    isUltimate
  });
}

function updatePlayerProjectiles(deltaTime) {
  for (let i = playerProjectiles.length - 1; i >= 0; i -= 1) {
    const projectile = playerProjectiles[i];

    // Guía ligera contra jefes móviles para que el disparo conserve su objetivo.
    if (boss) {
      const speed = Math.hypot(projectile.velocityX, projectile.velocityY);
      const desiredAngle = Math.atan2(
        boss.y + boss.height / 2 - projectile.y,
        boss.x + boss.width / 2 - projectile.x
      );
      const currentAngle = Math.atan2(projectile.velocityY, projectile.velocityX);
      const angleDifference = Math.atan2(Math.sin(desiredAngle - currentAngle), Math.cos(desiredAngle - currentAngle));
      const guidedAngle = currentAngle + angleDifference * Math.min(1, deltaTime * 4.5);
      projectile.velocityX = Math.cos(guidedAngle) * speed;
      projectile.velocityY = Math.sin(guidedAngle) * speed;
    }

    projectile.x += projectile.velocityX * deltaTime;
    projectile.y += projectile.velocityY * deltaTime;
    let consumed = false;

    if (chest && isColliding(projectile, chest)) {
      chest.health -= projectile.damage;
      createParticles(projectile.x, projectile.y, "#ffd166", 4);
      playerProjectiles.splice(i, 1);
      consumed = true;
      if (chest.health <= 0) openChest();
    }

    if (consumed) continue;

    if (boss && boss.entranceTime <= 0 && isColliding(projectile, boss)) {
      let requestedDamage = projectile.damage;
      if (projectile.isUltimate) {
        requestedDamage = Math.min(requestedDamage, player.ultimateBossDamageRemaining);
      }
      const appliedDamage = applyDamageToBoss(requestedDamage);
      if (projectile.isUltimate) {
        player.ultimateBossDamageRemaining = Math.max(0, player.ultimateBossDamageRemaining - appliedDamage);
      }
      createParticles(projectile.x, projectile.y, projectile.color, 3);
      playerProjectiles.splice(i, 1);
      consumed = true;
      if (boss.health <= 0) defeatBoss();
    }

    if (consumed) continue;

    for (let obstacleIndex = obstacles.length - 1; obstacleIndex >= 0; obstacleIndex -= 1) {
      const obstacle = obstacles[obstacleIndex];
      if (!isColliding(projectile, obstacle)) continue;
      obstacle.health -= projectile.damage;
      createParticles(projectile.x, projectile.y, scenarioThemes[scenarioIndex].accent, 3);
      playerProjectiles.splice(i, 1);
      consumed = true;
      if (obstacle.health <= 0) {
        createParticles(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          scenarioThemes[scenarioIndex].accent,
          22
        );
        obstacles.splice(obstacleIndex, 1);
        score += 40;
        gainUltimate(4);
      }
      break;
    }

    if (consumed) continue;

    for (let threatIndex = threats.length - 1; threatIndex >= 0; threatIndex -= 1) {
      const threat = threats[threatIndex];
      if (!isColliding(projectile, threat)) continue;
      threat.health -= projectile.damage;
      playerProjectiles.splice(i, 1);
      consumed = true;
      if (threat.health <= 0) {
        createParticles(threat.x, threat.y, threat.type.color, 12);
        threats.splice(threatIndex, 1);
        score += threat.type.shoots ? 90 : 35;
        runStats.enemiesDestroyed += 1;
        gainUltimate(threat.type.behavior === "tank" ? 18 : threat.type.shoots ? 13 : 9);
      }
      break;
    }

    if (!consumed && (
      projectile.x < -40 || projectile.x > GAME_WIDTH + 40 ||
      projectile.y < -40 || projectile.y > GAME_HEIGHT + 40
    )) playerProjectiles.splice(i, 1);
  }
}

function updateThreats(deltaTime) {
  const slowFactor = player.slowTime > 0 ? 0.48 : 1;

  for (let i = threats.length - 1; i >= 0; i -= 1) {
    const threat = threats[i];

    if (threat.type.behavior === "hunter") {
      const targetAngle = Math.atan2(
        player.y + player.height / 2 - threat.y,
        player.x + player.width / 2 - threat.x
      );
      const desiredX = Math.cos(targetAngle) * threat.speed;
      const desiredY = Math.sin(targetAngle) * threat.speed;
      const turnAmount = Math.min(1, deltaTime * 1.35);
      threat.velocityX += (desiredX - threat.velocityX) * turnAmount;
      threat.velocityY += (desiredY - threat.velocityY) * turnAmount;
    }

    if (threat.type.behavior === "glitch") {
      threat.behaviorPhase += deltaTime * 7;
      const jump = Math.sin(threat.behaviorPhase) * 105 * deltaTime;
      if (threat.side === "top") threat.x += jump;
      else threat.y += jump;
    }

    if (threat.type.behavior === "orbiter") {
      const targetAngle = Math.atan2(player.y - threat.y, player.x - threat.x);
      const orbitAngle = targetAngle + (Math.sin(threat.behaviorPhase) > 0 ? 1 : -1) * 0.9;
      threat.behaviorPhase += deltaTime * 1.8;
      threat.velocityX += (Math.cos(orbitAngle) * threat.speed - threat.velocityX) * deltaTime * 1.1;
      threat.velocityY += (Math.sin(orbitAngle) * threat.speed - threat.velocityY) * deltaTime * 1.1;
    }

    if (threat.type.behavior === "phantom") {
      threat.behaviorPhase += deltaTime * 5.5;
      threat.velocityX += Math.sin(threat.behaviorPhase * 1.7) * 120 * deltaTime;
      threat.velocityY += Math.cos(threat.behaviorPhase) * 70 * deltaTime;
    }

    if (threat.type.behavior === "mine" && isInsideArena(threat)) {
      threat.velocityX *= Math.pow(0.08, deltaTime);
      threat.velocityY *= Math.pow(0.08, deltaTime);
    }

    threat.y += threat.velocityY * slowFactor * deltaTime;
    threat.x += threat.velocityX * slowFactor * deltaTime;
    threat.rotation += threat.rotationSpeed * deltaTime;
    threat.sizePulse += threat.sizePulseSpeed * deltaTime;

    if (threat.type.shoots) {
      threat.shotTimer -= deltaTime;
      if (threat.shotTimer <= 0 && isInsideArena(threat)) {
        spawnEnemyProjectile(threat.x + threat.width / 2, threat.y + threat.height / 2, 245);
        threat.shotTimer = Math.max(0.85, 1.8 - level * 0.04);
        playSound("enemyShot");
      }
    }

    if (threat.type.radialShoots) {
      threat.shotTimer -= deltaTime;
      if (threat.shotTimer <= 0 && isInsideArena(threat)) {
        for (let shot = 0; shot < 8; shot += 1) {
          spawnRawEnemyProjectile(
            threat.x + threat.width / 2,
            threat.y + threat.height / 2,
            190,
            (shot / 8) * Math.PI * 2 + threat.rotation,
            threat.type.color
          );
        }
        threat.shotTimer = 2.5;
        playSound("enemyShot");
      }
    }

    // Cada amenaza cambia suavemente de tamaño mientras desciende.
    const animatedSize = threat.baseSize * (1 + Math.sin(threat.sizePulse) * 0.12);
    const sizeDifference = animatedSize - threat.width;
    threat.x -= sizeDifference / 2;
    threat.y -= sizeDifference / 2;
    threat.width = animatedSize;
    threat.height = animatedSize;

    if (isColliding(player, threat)) {
      handleThreatCollision(threat, i);
      continue;
    }

    if (
      threat.y > GAME_HEIGHT + 90 ||
      threat.x > GAME_WIDTH + 90 ||
      threat.x + threat.width < -90
    ) {
      threats.splice(i, 1);
      score += 5;
    }
  }
}

function updatePowerUps(deltaTime) {
  for (let i = powerUps.length - 1; i >= 0; i -= 1) {
    const power = powerUps[i];
    power.y += power.speed * deltaTime;
    power.pulse += deltaTime * 5;

    if (isColliding(player, power)) {
      activatePowerUp(power);
      createParticles(power.x + power.width / 2, power.y + power.height / 2, power.color, 18);
      powerUps.splice(i, 1);
      score += 100;
      playSound("powerUp");
      continue;
    }

    if (power.y > GAME_HEIGHT + 40) powerUps.splice(i, 1);
  }
}

function spawnChest() {
  const fromLeft = Math.random() < 0.5;
  chest = {
    x: fromLeft ? -60 : GAME_WIDTH + 60,
    y: randomBetween(120, GAME_HEIGHT - 135),
    width: 48,
    height: 34,
    velocityX: fromLeft ? 115 : -115,
    health: 8,
    maxHealth: 8,
    pulse: 0
  };
}

function updateChest(deltaTime) {
  if (!chest) return;
  chest.x += chest.velocityX * deltaTime;
  chest.pulse += deltaTime * 4;

  if (chest.x < -110 || chest.x > GAME_WIDTH + 110) chest = null;
}

function openChest() {
  if (!chest) return;
  const centerX = chest.x + chest.width / 2;
  const centerY = chest.y + chest.height / 2;
  createParticles(centerX, centerY, "#ffd166", 38);
  score += 300;
  runStats.chestsOpened += 1;
  gainUltimate(15);

  const powerTypes = [
    { type: "shield", symbol: "S", color: "#00f0ff" },
    { type: "slow", symbol: "T", color: "#a855f7" },
    { type: "repair", symbol: "+", color: "#43ff9b" }
  ];
  const reward = powerTypes[Math.floor(Math.random() * powerTypes.length)];
  powerUps.push({
    x: centerX - 17,
    y: centerY - 17,
    width: 34,
    height: 34,
    speed: 38,
    pulse: 0,
    ...reward
  });
  chest = null;
  playSound("bossDefeat");
}

/** Prepara una línea de advertencia antes de lanzar la estrella fugaz. */
function startCometWarning() {
  const fromLeft = Math.random() < 0.5;
  cometWarning = {
    time: 1.6,
    startX: fromLeft ? -70 : GAME_WIDTH + 70,
    startY: randomBetween(80, GAME_HEIGHT - 120),
    endX: fromLeft ? GAME_WIDTH + 70 : -70,
    endY: randomBetween(80, GAME_HEIGHT - 120),
    color: "#ffd166"
  };
  playSound("level");
}

function updateCometEvent(deltaTime) {
  if (cometWarning) {
    cometWarning.time -= deltaTime;
    if (cometWarning.time <= 0) {
      const angle = Math.atan2(
        cometWarning.endY - cometWarning.startY,
        cometWarning.endX - cometWarning.startX
      );
      comets.push({
        x: cometWarning.startX,
        y: cometWarning.startY,
        width: 34,
        height: 34,
        velocityX: Math.cos(angle) * 820,
        velocityY: Math.sin(angle) * 820,
        angle
      });
      cometWarning = null;
    }
  }

  for (let index = comets.length - 1; index >= 0; index -= 1) {
    const comet = comets[index];
    comet.x += comet.velocityX * deltaTime;
    comet.y += comet.velocityY * deltaTime;
    if (isColliding(player, comet)) {
      if (player.shieldTime <= 0 && player.invulnerableTime <= 0) {
        damagePlayer(comet.x, comet.y, "#ffd166");
      }
      createParticles(comet.x, comet.y, "#ffd166", 24);
      comets.splice(index, 1);
      continue;
    }
    if (comet.x < -120 || comet.x > GAME_WIDTH + 120 || comet.y < -120 || comet.y > GAME_HEIGHT + 120) {
      comets.splice(index, 1);
    }
  }
}

function spawnEnemyProjectile(x, y, speed, angleOffset = 0, color = "#ff5f5f") {
  const targetX = player.x + player.width / 2;
  const targetY = player.y + player.height / 2;
  const angle = Math.atan2(targetY - y, targetX - x) + angleOffset;
  enemyProjectiles.push({
    x: x - 6,
    y: y - 6,
    width: 12,
    height: 12,
    radius: 6,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    color
  });
}

function spawnRawEnemyProjectile(x, y, speed, angle, color) {
  enemyProjectiles.push({
    x: x - 6,
    y: y - 6,
    width: 12,
    height: 12,
    radius: 6,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    color
  });
}

function updateEnemyProjectiles(deltaTime) {
  const slowFactor = player.slowTime > 0 ? 0.65 : 1;
  for (let i = enemyProjectiles.length - 1; i >= 0; i -= 1) {
    const projectile = enemyProjectiles[i];
    projectile.x += projectile.velocityX * slowFactor * deltaTime;
    projectile.y += projectile.velocityY * slowFactor * deltaTime;

    if (isColliding(player, projectile)) {
      enemyProjectiles.splice(i, 1);
      if (player.shieldTime > 0 || player.invulnerableTime > 0) {
        createParticles(projectile.x, projectile.y, "#43ff9b", 8);
      } else {
        damagePlayer(projectile.x, projectile.y, projectile.color);
      }
      continue;
    }

    if (
      projectile.x < -30 || projectile.x > GAME_WIDTH + 30 ||
      projectile.y < -30 || projectile.y > GAME_HEIGHT + 30
    ) enemyProjectiles.splice(i, 1);
  }
}

function getBossNameForLevel(bossLevel) {
  return ({
    3: "Sailor Moon",
    6: "Sailor Mars",
    9: "Sailor Venus",
    12: "Sailor Mercury",
    15: "YACERAMI"
  })[bossLevel] || "GUARDIÁN DESCONOCIDO";
}

/** Detiene brevemente la oleada y anuncia con claridad la llegada del jefe. */
function startBossWarning() {
  pendingBossLevel = level;
  bossIncomingTimer = 2.6;
  incomingBossName.textContent = getBossNameForLevel(level);
  bossIncoming.classList.add("visible");
  playSound("boss");
}

function updateBossWarning(deltaTime) {
  if (bossIncomingTimer <= 0) return;
  bossIncomingTimer = Math.max(0, bossIncomingTimer - deltaTime);
  if (bossIncomingTimer === 0) {
    bossIncoming.classList.remove("visible");
    level = pendingBossLevel;
    pendingBossLevel = null;
    spawnBoss();
  }
}

/** Los guardianes aparecen cada tres niveles; YACERAMI espera en el nivel 15. */
function spawnBoss() {
  const bossDefinitions = {
    3: { name: "Sailor Moon", pattern: "fan", health: 45, color: "#ffd166" },
    6: { name: "Sailor Mars", pattern: "burst", health: 65, color: "#ff477e" },
    9: { name: "Sailor Venus", pattern: "spiral", health: 90, color: "#ff9f1c" },
    12: { name: "Sailor Mercury", pattern: "cross", health: 115, color: "#00f0ff" },
    // 247 equivale a 30% más vida que los 190 puntos originales.
    15: { name: "YACERAMI", pattern: "hybrid", health: 247, color: "#ff2d75", final: true }
  };
  const definition = bossDefinitions[level];
  if (!definition) return;

  boss = {
    x: GAME_WIDTH / 2 - (definition.final ? 82 : 60),
    y: definition.final ? -170 : -130,
    startY: definition.final ? -170 : -130,
    targetY: definition.final ? 32 : 45,
    width: definition.final ? 164 : 120,
    height: definition.final ? 108 : 80,
    health: definition.health,
    maxHealth: definition.health,
    shotTimer: 1.2,
    phase: 0,
    entranceTime: definition.final ? 2.8 : 2.3,
    entranceDuration: definition.final ? 2.8 : 2.3,
    entranceElapsed: 0,
    attackCycle: 0,
    phaseTwo: false,
    damageHistory: [],
    ...definition
  };
  if (selectedDifficulty === "hard") {
    boss.health = Math.ceil(boss.health * 1.25);
    boss.maxHealth = boss.health;
  }
  bossBar.classList.add("visible");
  bossName.textContent = definition.final
    ? "⚠ JEFE FINAL: YACERAMI"
    : `⚠ GUARDIÁN: ${definition.name}`;
  stopMusic();
  startMusic();
  playSound("boss");
}

function updateBoss(deltaTime) {
  if (!boss) return;
  boss.phase += deltaTime;

  if (boss.entranceTime > 0) {
    boss.entranceElapsed += deltaTime;
    boss.entranceTime = Math.max(0, boss.entranceDuration - boss.entranceElapsed);
    const progress = Math.min(1, boss.entranceElapsed / boss.entranceDuration);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    boss.y = boss.startY + (boss.targetY - boss.startY) * easedProgress;
    boss.x = GAME_WIDTH / 2 - boss.width / 2 + Math.sin(boss.phase * 7) * (1 - progress) * 28;
    screenShake = Math.max(screenShake, boss.final ? 4 : 2);
    if (boss.entranceTime <= 0) boss.y = boss.targetY;
    return;
  }

  if (boss.final && !boss.phaseTwo && boss.health <= boss.maxHealth * 0.5) {
    activateFinalBossPhaseTwo();
  }

  boss.x = GAME_WIDTH / 2 - boss.width / 2 + Math.sin(boss.phase * (boss.final ? 1.55 : 1.15)) * 270;
  if (boss.final) boss.y = boss.targetY + Math.sin(boss.phase * 2.2) * 12;
  boss.shotTimer -= deltaTime;

  if (isColliding(player, boss) && player.invulnerableTime <= 0 && player.shieldTime <= 0) {
    damagePlayer(player.x, player.y, "#ff2d75");
  }

  if (boss.shotTimer <= 0) {
    fireBossPattern();
    playSound("enemyShot");
  }
}

function fireBossPattern() {
  if (!boss) return;
  const originX = boss.x + boss.width / 2;
  const originY = boss.y + boss.height;
  let pattern = boss.pattern;

  if (pattern === "hybrid") {
    pattern = ["fan", "burst", "spiral", "cross"][boss.attackCycle % 4];
  }

  if (pattern === "fan") {
    const amount = boss.final ? 7 : 5;
    const middle = (amount - 1) / 2;
    for (let index = 0; index < amount; index += 1) {
      spawnEnemyProjectile(originX, originY, boss.final ? 300 : 245, (index - middle) * 0.17, boss.color);
    }
    boss.shotTimer = boss.final ? 0.95 : 1.35;
  } else if (pattern === "burst") {
    [-0.09, 0, 0.09].forEach((offset) => {
      spawnEnemyProjectile(originX, originY, boss.final ? 360 : 315, offset, boss.color);
    });
    boss.shotTimer = boss.final ? 0.6 : 0.82;
  } else if (pattern === "spiral") {
    const amount = boss.final ? 10 : 7;
    for (let index = 0; index < amount; index += 1) {
      const angle = boss.phase * 1.7 + (index / amount) * Math.PI * 2;
      spawnRawEnemyProjectile(originX, originY, boss.final ? 255 : 205, angle, boss.color);
    }
    boss.shotTimer = boss.final ? 0.72 : 1.05;
  } else {
    // Patrón de Mercury: cruz rotatoria con diagonales.
    const amount = boss.final ? 12 : 8;
    const rotation = boss.phase * 0.65;
    for (let index = 0; index < amount; index += 1) {
      const angle = rotation + (index / amount) * Math.PI * 2;
      spawnRawEnemyProjectile(originX, originY, boss.final ? 275 : 225, angle, boss.color);
    }
    boss.shotTimer = boss.final ? 0.8 : 1.15;
  }

  // En la segunda fase YACERAMI añade una corona rotatoria y ataca con mayor frecuencia.
  if (boss.final && boss.phaseTwo) {
    if (boss.attackCycle % 2 === 0) {
      for (let index = 0; index < 8; index += 1) {
        const angle = -boss.phase * 1.4 + (index / 8) * Math.PI * 2;
        spawnRawEnemyProjectile(originX, originY, 315, angle, "#ff003c");
      }
    }
    boss.shotTimer *= 0.62;
  }

  boss.attackCycle += 1;
}

function activateFinalBossPhaseTwo() {
  boss.phaseTwo = true;
  boss.color = "#ff003c";
  boss.shotTimer = 0.2;
  bossName.textContent = "☠ YACERAMI · FASE 2";
  incomingBossName.textContent = "YACERAMI DESATADO";
  screenShake = 16;
  createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, "#ff003c", 90);
  stopMusic();
  startMusic();
  playSound("boss");
}

/**
 * Limita todo el daño combinado a 20% de la vida máxima dentro de cualquier
 * ventana móvil de un segundo. Incluye disparos normales, dash y Ultimate.
 */
function applyDamageToBoss(requestedDamage) {
  if (!boss || requestedDamage <= 0) return 0;
  boss.damageHistory = boss.damageHistory.filter((hit) => combatTime - hit.time < 1);
  const recentDamage = boss.damageHistory.reduce((total, hit) => total + hit.amount, 0);
  const availableDamage = Math.max(0, boss.maxHealth * 0.2 - recentDamage);
  const appliedDamage = Math.min(requestedDamage, availableDamage, boss.health);
  if (appliedDamage > 0) {
    boss.health -= appliedDamage;
    boss.damageHistory.push({ time: combatTime, amount: appliedDamage });
  } else {
    createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, "#ffffff", 2);
  }
  return appliedDamage;
}

function defeatBoss() {
  if (!boss) return;
  const defeatedBoss = boss;
  score += defeatedBoss.final ? 6000 : 1200 * (level / 3);
  runStats.enemiesDestroyed += 1;
  createParticles(
    defeatedBoss.x + defeatedBoss.width / 2,
    defeatedBoss.y + defeatedBoss.height / 2,
    defeatedBoss.color,
    defeatedBoss.final ? 100 : 55
  );
  if (!defeatedBoss.final) gainUltimate(35);
  boss = null;
  bossBar.classList.remove("visible");
  enemyProjectiles = [];
  stopMusic();
  startMusic();
  playSound("bossDefeat");

  if (defeatedBoss.final) {
    winGame();
  } else if (selectedDifficulty === "bossrush") {
    bossRushIndex += 1;
    level = bossRushLevels[bossRushIndex];
    lastCalculatedLevel = level;
    scenarioIndex = Math.min(scenarioThemes.length - 1, bossRushIndex);
    generateScenario();
    pendingBossRushAdvance = true;
    showUpgradeSelection();
  } else {
    showUpgradeSelection();
  }
}

function updateParticles(deltaTime) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.life -= deltaTime;
    if (particle.life <= 0) particles.splice(i, 1);
  }
}

function handleThreatCollision(threat, index) {
  // El escudo destruye la amenaza sin perder una vida.
  if (player.shieldTime > 0) {
    createParticles(threat.x, threat.y, "#00f0ff", 14);
    threats.splice(index, 1);
    score += 75;
    runStats.enemiesDestroyed += 1;
    gainUltimate(9);
    return;
  }

  // Un breve periodo de invulnerabilidad impide perder varias vidas de golpe.
  if (player.invulnerableTime > 0) return;
  threats.splice(index, 1);
  damagePlayer(threat.x, threat.y, threat.type.color);
}

function damagePlayer(x, y, color) {
  if (player.aegisUnlocked && player.aegisCooldown <= 0) {
    player.aegisCooldown = 20;
    player.shieldTime = Math.max(player.shieldTime, 2.5);
    createParticles(player.x + player.width / 2, player.y + player.height / 2, "#43ff9b", 24);
    playSound("powerUp");
    return;
  }

  lives -= 1;
  runStats.damageTaken += 1;
  player.invulnerableTime = 1.4;
  screenShake = 10;
  createParticles(x, y, color, 22);
  playSound("collision");
  if (lives <= 0) endGame();
}

/** Activa un desplazamiento rápido. Solo funciona una vez cada 6 segundos. */
function useDash() {
  if (gameState !== "playing" || player.dashCooldown > 0 || player.dashTime > 0) return;

  let directionX = 0;
  let directionY = 0;
  if (keys.ArrowLeft || keys.a) directionX -= 1;
  if (keys.ArrowRight || keys.d) directionX += 1;
  if (keys.ArrowUp || keys.w) directionY -= 1;
  if (keys.ArrowDown || keys.s) directionY += 1;

  // Si no hay una dirección presionada, el dash se realiza hacia arriba.
  if (directionX === 0 && directionY === 0) directionY = -1;
  const length = Math.hypot(directionX, directionY) || 1;
  player.dashX = directionX / length;
  player.dashY = directionY / length;
  player.dashTime = 0.22;
  player.dashCooldown = player.dashCooldownMax;
  player.dashReadyAnnounced = false;
  createParticles(player.x + 22, player.y + 22, getSkinColors().primary, 12);
  if (player.shockwaveUnlocked) activateShockwave();
  playSound("dash");
}

function activateShockwave() {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const radius = 145;

  for (let index = threats.length - 1; index >= 0; index -= 1) {
    const threat = threats[index];
    const distance = Math.hypot(threat.x + threat.width / 2 - centerX, threat.y + threat.height / 2 - centerY);
    if (distance > radius) continue;
    threat.health -= 3;
    if (threat.health <= 0) {
      createParticles(threat.x, threat.y, threat.type.color, 10);
      threats.splice(index, 1);
      score += 45;
      runStats.enemiesDestroyed += 1;
      gainUltimate(8);
    }
  }

  for (let index = obstacles.length - 1; index >= 0; index -= 1) {
    const obstacle = obstacles[index];
    const distance = Math.hypot(obstacle.x + obstacle.width / 2 - centerX, obstacle.y + obstacle.height / 2 - centerY);
    if (distance <= radius) {
      obstacle.health -= 4;
      if (obstacle.health <= 0) obstacles.splice(index, 1);
    }
  }

  enemyProjectiles = enemyProjectiles.filter((projectile) =>
    Math.hypot(projectile.x - centerX, projectile.y - centerY) > radius
  );
  if (boss && Math.hypot(boss.x + boss.width / 2 - centerX, boss.y + boss.height / 2 - centerY) <= radius + 70) {
    applyDamageToBoss(8);
    if (boss.health <= 0) defeatBoss();
  }
  createParticles(centerX, centerY, "#43ff9b", 35);
  screenShake = Math.max(screenShake, 6);
}

function gainUltimate(amount) {
  const multiplier = player.reactorUnlocked ? 1.5 : 1;
  player.ultimateEnergy = Math.min(player.ultimateMax, player.ultimateEnergy + amount * multiplier);
}

function useUltimate() {
  if (gameState !== "playing" || player.ultimateEnergy < player.ultimateMax) return;
  player.ultimateEnergy = 0;
  player.ultimateBossDamageRemaining = boss ? boss.maxHealth * 0.2 : 0;
  runStats.ultimatesUsed += 1;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  if (player.skin === "gold") {
    runStats.enemiesDestroyed += threats.length;
    threats.forEach((threat) => {
      createParticles(threat.x, threat.y, "#ffd166", 10);
      score += 55;
    });
    threats = [];
    obstacles.forEach((obstacle) => createParticles(obstacle.x, obstacle.y, "#ffd166", 8));
    obstacles = [];
    enemyProjectiles = [];
    if (boss && boss.entranceTime <= 0) {
      const appliedDamage = Math.min(40.5, player.ultimateBossDamageRemaining);
      const realDamage = applyDamageToBoss(appliedDamage);
      player.ultimateBossDamageRemaining -= realDamage;
      if (boss.health <= 0) defeatBoss();
    }
    createParticles(centerX, centerY, "#ffd166", 100);
  } else {
    const amount = player.skin === "violet" ? 20 : 26;
    const damageMultiplier = player.skin === "violet" ? 2.25 : 2.7;
    for (let index = 0; index < amount; index += 1) {
      const angle = (index / amount) * Math.PI * 2;
      createPlayerProjectile(centerX, centerY, angle, damageMultiplier, player.skin === "violet" ? 11 : 9, true);
    }
    if (player.skin === "violet") player.shieldTime = Math.max(player.shieldTime, 6);
    createParticles(centerX, centerY, getSkinColors().primary, 75);
  }

  screenShake = 13;
  playSound("bossDefeat");
}

function activatePowerUp(power) {
  if (power.type === "shield") player.shieldTime = 7;
  if (power.type === "slow") player.slowTime = 6;
  if (power.type === "repair") lives = Math.min(player.maxLives, lives + 1);
}

const upgradeCatalog = [
  {
    id: "overclock",
    icon: "⚡",
    name: "Overclock",
    description: "Dispara 22% más rápido.",
    apply: () => { player.attackInterval *= 0.78; }
  },
  {
    id: "damage",
    icon: "✦",
    name: "Pulso ofensivo",
    description: "Aumenta el daño de cada disparo.",
    apply: () => { player.projectileDamage += 0.7; }
  },
  {
    id: "speed",
    icon: "➤",
    name: "Propulsores",
    description: "Aumenta 15% la velocidad de movimiento.",
    apply: () => { player.speed *= 1.15; }
  },
  {
    id: "armor",
    icon: "♥",
    name: "Núcleo reforzado",
    description: "Obtén una vida máxima adicional.",
    apply: () => { player.maxLives += 1; lives = Math.min(player.maxLives, lives + 1); }
  },
  {
    id: "dash",
    icon: "◇",
    name: "Dash cuántico",
    description: "Reduce un segundo la recarga del dash.",
    apply: () => { player.dashCooldownMax = Math.max(3, player.dashCooldownMax - 1); }
  },
  {
    id: "shield",
    icon: "⬡",
    name: "Escudo Becker",
    description: "Activa un escudo durante 10 segundos.",
    apply: () => { player.shieldTime = 10; }
  }
];

function showUpgradeSelection() {
  gameState = "upgrading";
  const choices = [...upgradeCatalog].sort(() => Math.random() - 0.5).slice(0, 3);
  upgradeOptions.textContent = "";

  choices.forEach((upgrade) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-option";

    const icon = document.createElement("span");
    icon.className = "upgrade-icon";
    icon.textContent = upgrade.icon;
    const name = document.createElement("strong");
    name.textContent = upgrade.name;
    const description = document.createElement("small");
    description.textContent = upgrade.description;
    button.append(icon, name, description);

    button.addEventListener("click", () => {
      upgrade.apply();
      player.upgrades.push(upgrade.id);
      checkUpgradeSynergies();
      player.invulnerableTime = 1.5;
      upgradeScreen.classList.remove("active");
      gameState = "playing";
      lastTime = performance.now();
      if (pendingBossRushAdvance) {
        pendingBossRushAdvance = false;
        startBossWarning();
      }
      playSound("powerUp");
    });
    upgradeOptions.appendChild(button);
  });

  upgradeScreen.classList.add("active");
}

function checkUpgradeSynergies() {
  const hasOverclock = player.upgrades.includes("overclock");
  const hasDamage = player.upgrades.includes("damage");
  const hasSpeed = player.upgrades.includes("speed");
  const hasDash = player.upgrades.includes("dash");
  const hasArmor = player.upgrades.includes("armor");
  const hasShield = player.upgrades.includes("shield");
  let unlockedNow = false;

  if (hasOverclock && hasDamage && !player.synergyUnlocked) {
    player.synergyUnlocked = true;
    unlockedNow = true;
  }
  if (hasSpeed && hasDash && !player.shockwaveUnlocked) {
    player.shockwaveUnlocked = true;
    unlockedNow = true;
  }
  if (hasArmor && hasShield && !player.aegisUnlocked) {
    player.aegisUnlocked = true;
    player.aegisCooldown = 0;
    unlockedNow = true;
  }
  if (hasOverclock && hasShield && !player.reactorUnlocked) {
    player.reactorUnlocked = true;
    unlockedNow = true;
  }

  if (unlockedNow) {
    player.shieldTime = Math.max(player.shieldTime, 4);
    createParticles(player.x + player.width / 2, player.y + player.height / 2, "#43ff9b", 35);
  }
}

function winGame() {
  gameState = "victory";
  const finalScore = Math.floor(score);
  awardRunFragments(finalScore);
  finalBossDefeats += 1;
  safeStorageSet(FINAL_BOSS_DEFEATS_KEY, String(finalBossDefeats));
  finalBossDefeatsText.textContent = String(finalBossDefeats);
  updateDifficultyAvailability();
  if (finalScore > highScore) {
    highScore = finalScore;
    safeStorageSet(HIGH_SCORE_KEY, String(highScore));
  }
  saveRecord(finalScore);
  document.getElementById("victoryMessage").textContent =
    `${playerName}, derrotaste a YACERAMI y restauraste el Nexo.`;
  document.getElementById("victoryScore").textContent = finalScore;
  document.getElementById("victoryTime").textContent = `${Math.floor(combatTime)}s`;
  document.getElementById("victoryHighScore").textContent = highScore;
  evaluateAchievements(true);
  updateDifficultyAvailability();
  renderRunStats(victoryStats);
  updateHud();
  victoryScreen.classList.add("active");
  stopMusic();
}

function endGame() {
  gameState = "gameover";
  const finalScore = Math.floor(score);
  awardRunFragments(finalScore);

  if (finalScore > highScore) {
    highScore = finalScore;
    safeStorageSet(HIGH_SCORE_KEY, String(highScore));
  }

  saveRecord(finalScore);

  document.getElementById("gameOverMessage").textContent =
    `YACERAMI te ha vencido, ${playerName}. El Nexo resistió ${Math.floor(elapsedTime)} segundos.`;
  document.getElementById("finalScore").textContent = finalScore;
  document.getElementById("finalLevel").textContent = level;
  document.getElementById("finalHighScore").textContent = highScore;
  evaluateAchievements(false);
  renderRunStats(gameOverStats);
  updateHud();
  gameOverScreen.classList.add("active");
  stopMusic();
}

/** Dibuja todo el contenido del juego en cada cuadro. */
function draw(time) {
  ctx.save();
  if (screenShake > 0) {
    ctx.translate(randomBetween(-screenShake, screenShake), randomBetween(-screenShake, screenShake));
  }

  drawBackground(time);
  if (boss) drawBossAtmosphere();
  drawObstacles();
  drawCometWarning();
  comets.forEach(drawComet);
  if (chest) drawChest();
  if (boss) drawBoss();
  drawCosmeticTrail();
  if (player) drawPlayer();
  playerProjectiles.forEach(drawPlayerProjectile);
  threats.forEach(drawThreat);
  powerUps.forEach(drawPowerUp);
  enemyProjectiles.forEach(drawEnemyProjectile);
  particles.forEach(drawParticle);
  if (aimMode === "manual" && manualAim.hasPointer && player) drawAimCrosshair();
  ctx.restore();
}

function drawBackground(time) {
  const theme = scenarioThemes[scenarioIndex] || scenarioThemes[0];
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Cuadrícula animada que produce el efecto de avanzar por una red digital.
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  const offset = (time * 0.035) % 40;

  for (let x = 0; x <= GAME_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME_HEIGHT);
    ctx.stroke();
  }

  for (let y = -40; y <= GAME_HEIGHT + 40; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(GAME_WIDTH, y + offset);
    ctx.stroke();
  }

  // Pequeños nodos decorativos.
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.32;
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 167 + time * 0.02) % GAME_WIDTH;
    const y = (i * 83) % GAME_HEIGHT;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function generateScenario() {
  obstacles = [];
  const amount = scenarioIndex + 1;
  let attempts = 0;

  while (obstacles.length < amount && attempts < 60) {
    attempts += 1;
    const width = randomBetween(58, 105);
    const height = randomBetween(28, 52);
    const obstacle = {
      x: randomBetween(35, GAME_WIDTH - width - 35),
      y: randomBetween(105, GAME_HEIGHT - height - 85),
      width,
      height,
      health: 3 + scenarioIndex * 2,
      maxHealth: 3 + scenarioIndex * 2
    };
    const tooCloseToPlayer = player && Math.hypot(
      obstacle.x + width / 2 - (player.x + player.width / 2),
      obstacle.y + height / 2 - (player.y + player.height / 2)
    ) < 145;
    const overlapsAnother = obstacles.some((existing) => isColliding(obstacle, existing));
    if (!tooCloseToPlayer && !overlapsAnother) obstacles.push(obstacle);
  }
}

function drawObstacles() {
  const theme = scenarioThemes[scenarioIndex] || scenarioThemes[0];
  obstacles.forEach((obstacle) => {
    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.fillStyle = `${theme.accent}1f`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 13;
    ctx.shadowColor = theme.accent;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 9, obstacle.y + obstacle.height / 2);
    ctx.lineTo(obstacle.x + obstacle.width - 9, obstacle.y + obstacle.height / 2);
    ctx.stroke();
    if (obstacle.health < obstacle.maxHealth) {
      ctx.beginPath();
      ctx.moveTo(obstacle.x + obstacle.width * 0.25, obstacle.y);
      ctx.lineTo(obstacle.x + obstacle.width * 0.45, obstacle.y + obstacle.height * 0.55);
      ctx.lineTo(obstacle.x + obstacle.width * 0.35, obstacle.y + obstacle.height);
      ctx.stroke();
    }
    ctx.restore();

    const healthPercent = Math.max(0, obstacle.health / obstacle.maxHealth);
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(obstacle.x, obstacle.y - 7, obstacle.width, 4);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(obstacle.x, obstacle.y - 7, obstacle.width * healthPercent, 4);
  });
}

function drawChest() {
  const glow = 12 + Math.sin(chest.pulse) * 5;
  ctx.save();
  ctx.shadowBlur = glow;
  ctx.shadowColor = "#ffd166";
  ctx.fillStyle = "#5c3512";
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 3;
  ctx.fillRect(chest.x, chest.y + 9, chest.width, chest.height - 9);
  ctx.strokeRect(chest.x, chest.y + 9, chest.width, chest.height - 9);
  ctx.beginPath();
  ctx.roundRect(chest.x, chest.y, chest.width, 18, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(chest.x + chest.width / 2 - 4, chest.y + 13, 8, 12);
  ctx.restore();

  const healthPercent = Math.max(0, chest.health / chest.maxHealth);
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(chest.x, chest.y - 8, chest.width, 5);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(chest.x, chest.y - 8, chest.width * healthPercent, 5);
}

function drawPlayer() {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const flashing = player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 10) % 2 === 0;
  if (flashing) ctx.globalAlpha = 0.35;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.shadowBlur = 20;
  const colors = getSkinColors();
  ctx.shadowColor = colors.primary;
  ctx.fillStyle = colors.primary;

  // Cada skin tiene una silueta distinta, pero conserva el mismo tamaño de colisión.
  if (player.skin === "violet") {
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 21);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-14, -3, 28, 6);
  } else if (player.skin === "gold") {
    drawPolygon(0, 0, 22, 6);
    ctx.fill();
    ctx.fillStyle = colors.secondary;
    drawPolygon(0, 0, 10, 3);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -23);
    ctx.lineTo(20, 17);
    ctx.lineTo(0, 10);
    ctx.lineTo(-20, 17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-4, -5, 8, 14);
  }

  // Motor.
  ctx.fillStyle = colors.engine;
  ctx.beginPath();
  ctx.moveTo(-7, 14);
  ctx.lineTo(0, 29 + Math.random() * 7);
  ctx.lineTo(7, 14);
  ctx.fill();

  if (player.shieldTime > 0) {
    ctx.strokeStyle = `rgba(67, 255, 155, ${0.55 + Math.sin(performance.now() / 130) * 0.25})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 33, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawThreat(threat) {
  const centerX = threat.x + threat.width / 2;
  const centerY = threat.y + threat.height / 2;
  const radius = threat.width / 2;

  ctx.save();
  if (threat.type.behavior === "phantom") {
    ctx.globalAlpha = 0.35 + Math.abs(Math.sin(threat.behaviorPhase)) * 0.65;
  }
  ctx.translate(centerX, centerY);
  ctx.rotate(threat.rotation);
  ctx.strokeStyle = threat.type.color;
  ctx.fillStyle = `${threat.type.color}33`;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 14;
  ctx.shadowColor = threat.type.color;

  drawPolygon(0, 0, radius, threat.type.sides);
  ctx.fill();
  ctx.stroke();

  ctx.rotate(-threat.rotation);
  drawThreatIcon(threat.type.icon, radius * 0.72, threat.type.color);
  ctx.restore();

  // La barra compacta se revela únicamente después del primer impacto.
  if (threat.health < threat.maxHealth) {
    const barWidth = Math.max(24, threat.width * 0.72);
    const healthPercent = Math.max(0, threat.health / threat.maxHealth);
    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(centerX - barWidth / 2, threat.y - 8, barWidth, 4);
    ctx.fillStyle = healthPercent > 0.45 ? "#43ff9b" : "#ff477e";
    ctx.fillRect(centerX - barWidth / 2, threat.y - 8, barWidth * healthPercent, 4);
  }
}

function drawPowerUp(power) {
  const centerX = power.x + power.width / 2;
  const centerY = power.y + power.height / 2;
  const radius = 19 + Math.sin(power.pulse) * 3;

  ctx.save();
  ctx.translate(centerX, centerY);
  // Fondo suave y brillante para distinguirlo claramente de una amenaza.
  ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
  ctx.fillStyle = power.type === "repair" ? "#2ddf88" : power.type === "shield" ? "#20cce5" : "#8b6ee8";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 24;
  ctx.shadowColor = power.color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawPowerIcon(power.type, "#ffffff");

  // Estrellas pequeñas comunican que se trata de una recompensa.
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.8;
  ctx.fillRect(-radius - 6, -2, 4, 4);
  ctx.fillRect(radius + 2, 5, 3, 3);
  ctx.globalAlpha = 1;

  const labels = { shield: "ESCUDO", slow: "TIEMPO", repair: "VIDA" };
  ctx.font = "bold 7px Consolas";
  ctx.textAlign = "center";
  ctx.fillText(labels[power.type], 0, radius + 11);
  ctx.restore();
}

function drawEnemyProjectile(projectile) {
  ctx.save();
  ctx.fillStyle = projectile.color;
  ctx.shadowBlur = 14;
  ctx.shadowColor = projectile.color;
  ctx.beginPath();
  ctx.arc(projectile.x + projectile.radius, projectile.y + projectile.radius, projectile.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(projectile.x + projectile.radius, projectile.y + projectile.radius, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayerProjectile(projectile) {
  const centerX = projectile.x + projectile.width / 2;
  const centerY = projectile.y + projectile.height / 2;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.fillStyle = projectile.color;
  ctx.strokeStyle = "#ffffff";
  ctx.shadowBlur = 15;
  ctx.shadowColor = projectile.color;

  if (projectile.skin === "violet") {
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-projectile.width / 2, -projectile.height / 2, projectile.width, projectile.height);
  } else if (projectile.skin === "gold") {
    ctx.beginPath();
    ctx.arc(0, 0, projectile.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillRect(-projectile.width / 2, -2, projectile.width, 4);
    ctx.fillRect(-2, -projectile.height / 2, 4, projectile.height);
  }
  ctx.restore();
}

function drawBoss() {
  const centerX = boss.x + boss.width / 2;
  const centerY = boss.y + boss.height / 2;
  const entranceProgress = 1 - boss.entranceTime / boss.entranceDuration;
  ctx.save();
  ctx.translate(centerX, centerY);
  if (boss.final && boss.entranceTime <= 0) {
    const breathingScale = 1 + Math.sin(boss.phase * 3) * 0.045;
    ctx.rotate(Math.sin(boss.phase * 1.8) * 0.04);
    ctx.scale(breathingScale, breathingScale);
  }
  if (boss.entranceTime > 0) {
    const scale = 0.55 + Math.max(0, entranceProgress) * 0.45;
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.35 + Math.max(0, entranceProgress) * 0.65;
  }
  ctx.shadowBlur = 28;
  ctx.shadowColor = boss.color;
  ctx.fillStyle = `${boss.color}2e`;
  ctx.strokeStyle = boss.color;
  ctx.lineWidth = 4;
  const outerRadius = (boss.final ? 72 : 55) + Math.sin(boss.phase * 4) * 4;
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawBossIdentity();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${boss.final ? 15 : 11}px Consolas`;
  ctx.textAlign = "center";
  ctx.fillText(boss.name, 0, boss.final ? 92 : 70);

  if (boss.final) {
    ctx.strokeStyle = "rgba(255, 45, 117, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 78 + Math.sin(boss.phase * 3) * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBossAtmosphere() {
  const intensity = boss.entranceTime > 0 ? 0.34 : boss.final ? 0.2 : 0.11;
  const gradient = ctx.createRadialGradient(GAME_WIDTH / 2, GAME_HEIGHT / 2, 80, GAME_WIDTH / 2, GAME_HEIGHT / 2, 560);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(90, 0, 35, ${intensity})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  if (boss.entranceTime > 0) {
    ctx.strokeStyle = `rgba(255, 45, 117, ${0.18 + Math.sin(boss.phase * 22) * 0.1})`;
    ctx.lineWidth = 3;
    for (let line = 0; line < 5; line += 1) {
      const y = ((line * 137 + boss.phase * 310) % GAME_HEIGHT);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }
  }
}

function drawBossIdentity() {
  ctx.save();
  ctx.strokeStyle = boss.color;
  ctx.fillStyle = boss.color;
  ctx.lineWidth = 4;

  if (boss.name === "Sailor Moon") {
    ctx.beginPath();
    ctx.arc(-8, -2, 30, 0.45, Math.PI * 1.55);
    ctx.arc(8, -2, 22, Math.PI * 1.48, 0.52, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-25, 31);
    ctx.lineTo(0, 11);
    ctx.lineTo(25, 31);
    ctx.stroke();
  } else if (boss.name === "Sailor Mars") {
    ctx.rotate(boss.phase * 0.18);
    drawPolygon(0, 0, 43, 9);
    ctx.stroke();
    ctx.rotate(-boss.phase * 0.18);
    ctx.fillStyle = "#fff0f4";
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.bezierCurveTo(25, -8, 14, 19, 0, 34);
    ctx.bezierCurveTo(-18, 15, -24, -8, 0, -32);
    ctx.fill();
  } else if (boss.name === "Sailor Venus") {
    ctx.rotate(boss.phase * 0.35);
    for (let index = 0; index < 5; index += 1) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.fillRect(-5, -47, 10, 31);
    }
    ctx.rotate(-boss.phase * 0.35);
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 22, boss.phase * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    drawPolygon(0, 0, 24, 5);
    ctx.fill();
  } else if (boss.name === "Sailor Mercury") {
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-30, -30, 60, 60);
    ctx.rotate(-Math.PI / 4);
    for (let row = -1; row <= 1; row += 1) {
      ctx.beginPath();
      ctx.moveTo(-36, row * 14);
      ctx.bezierCurveTo(-15, row * 14 - 12, 15, row * 14 + 12, 36, row * 14);
      ctx.stroke();
    }
  } else {
    // YACERAMI: entidad abisal con cuernos, múltiples ojos y tentáculos vivos.
    ctx.strokeStyle = "#ff2d75";
    ctx.fillStyle = "#030005";
    ctx.beginPath();
    ctx.moveTo(-45, -17);
    ctx.lineTo(-69, -58);
    ctx.lineTo(-24, -38);
    ctx.lineTo(0, -60);
    ctx.lineTo(24, -38);
    ctx.lineTo(69, -58);
    ctx.lineTo(45, -17);
    ctx.lineTo(51, 35);
    ctx.lineTo(0, 52);
    ctx.lineTo(-51, 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2 + Math.sin(boss.phase * 2.4 + index) * 0.2;
      const startX = Math.cos(angle) * 28;
      const startY = Math.sin(angle) * 28;
      const reach = index % 2 === 0 ? 84 : 70;
      const endX = Math.cos(angle) * reach;
      const endY = Math.sin(angle) * (reach - 8);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(startX * 1.8, endY * 0.35, endX * 0.65, endY * 1.3, endX, endY);
      ctx.stroke();
    }
    ctx.fillStyle = "#07010a";
    ctx.beginPath();
    ctx.ellipse(0, -5, 40, 27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffd166";
    ctx.beginPath();
    ctx.ellipse(0, -5, 25, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(Math.sin(boss.phase * 2.8) * 12, -5, 6, 0, Math.PI * 2);
    ctx.fill();
    [-30, 30].forEach((eyeX, index) => {
      ctx.fillStyle = "#ff2d75";
      ctx.beginPath();
      ctx.ellipse(eyeX, 7 + index * 4, 8, 4, index ? -0.25 : 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#07010a";
      ctx.beginPath();
      ctx.arc(eyeX + Math.sin(boss.phase * 3 + index) * 2, 7 + index * 4, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-30, 28);
    for (let tooth = 0; tooth < 6; tooth += 1) {
      ctx.lineTo(-25 + tooth * 10, tooth % 2 === 0 ? 39 : 28);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Dibuja iconos vectoriales para evitar depender de imágenes externas. */
function drawPowerIcon(type, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  if (type === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(10, -6);
    ctx.lineTo(8, 6);
    ctx.lineTo(0, 13);
    ctx.lineTo(-8, 6);
    ctx.lineTo(-10, -6);
    ctx.closePath();
    ctx.stroke();
  } else if (type === "slow") {
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -6);
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 3);
    ctx.stroke();
  } else {
    // Corazón de vida, más amable que una cruz con aspecto médico/hostil.
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-16, 1, -11, -10, -4, -10);
    ctx.bezierCurveTo(0, -10, 0, -5, 0, -5);
    ctx.bezierCurveTo(0, -5, 2, -10, 7, -10);
    ctx.bezierCurveTo(15, -10, 17, 1, 0, 10);
    ctx.fill();
  }
}

/** Iconos de amenazas: insecto, calavera digital y sobre de spam. */
function drawThreatIcon(icon, size, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size / 10);

  if (icon === "bug") {
    ctx.beginPath();
    ctx.ellipse(0, 1, size * 0.4, size * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.65, -size * 0.3);
    ctx.lineTo(-size * 0.3, -size * 0.12);
    ctx.moveTo(size * 0.65, -size * 0.3);
    ctx.lineTo(size * 0.3, -size * 0.12);
    ctx.moveTo(-size * 0.65, size * 0.3);
    ctx.lineTo(-size * 0.3, size * 0.15);
    ctx.moveTo(size * 0.65, size * 0.3);
    ctx.lineTo(size * 0.3, size * 0.15);
    ctx.stroke();
  } else if (icon === "skull") {
    ctx.beginPath();
    ctx.arc(0, -size * 0.12, size * 0.48, Math.PI, 0);
    ctx.lineTo(size * 0.4, size * 0.4);
    ctx.lineTo(-size * 0.4, size * 0.4);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-size * 0.18, 0, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.18, 0, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "mail") {
    ctx.strokeRect(-size * 0.58, -size * 0.4, size * 1.16, size * 0.8);
    ctx.beginPath();
    ctx.moveTo(-size * 0.58, -size * 0.4);
    ctx.lineTo(0, size * 0.08);
    ctx.lineTo(size * 0.58, -size * 0.4);
    ctx.stroke();
  } else if (icon === "turret") {
    ctx.strokeRect(-size * 0.42, -size * 0.28, size * 0.84, size * 0.56);
    ctx.fillRect(-size * 0.1, size * 0.25, size * 0.2, size * 0.35);
    ctx.fillRect(-size * 0.1, -size * 0.62, size * 0.2, size * 0.38);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.13, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "eye") {
    ctx.beginPath();
    ctx.moveTo(-size * 0.65, 0);
    ctx.quadraticCurveTo(0, -size * 0.62, size * 0.65, 0);
    ctx.quadraticCurveTo(0, size * 0.62, -size * 0.65, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "glitch") {
    ctx.beginPath();
    ctx.moveTo(-size * 0.62, -size * 0.28);
    ctx.lineTo(-size * 0.12, -size * 0.28);
    ctx.lineTo(-size * 0.36, size * 0.08);
    ctx.lineTo(size * 0.12, size * 0.08);
    ctx.lineTo(-size * 0.05, size * 0.42);
    ctx.lineTo(size * 0.62, size * 0.42);
    ctx.stroke();
  } else if (icon === "tank") {
    // TANK: doble blindaje y núcleo central.
    ctx.strokeRect(-size * 0.58, -size * 0.42, size * 1.16, size * 0.84);
    ctx.strokeRect(-size * 0.38, -size * 0.27, size * 0.76, size * 0.54);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.13, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "orbiter") {
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.65, size * 0.28, Math.PI / 5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (icon === "mine") {
    for (let spike = 0; spike < 8; spike += 1) {
      const angle = (spike / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.3, Math.sin(angle) * size * 0.3);
      ctx.lineTo(Math.cos(angle) * size * 0.68, Math.sin(angle) * size * 0.68);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-size * 0.38, -size * 0.38, size * 0.76, size * 0.76);
    ctx.fillRect(-size * 0.1, -size * 0.1, size * 0.2, size * 0.2);
  }
}

function drawCometWarning() {
  if (!cometWarning) return;
  ctx.save();
  ctx.setLineDash([18, 12]);
  ctx.lineWidth = 5;
  ctx.strokeStyle = `rgba(255, 209, 102, ${0.45 + Math.sin(cometWarning.time * 18) * 0.3})`;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ffd166";
  ctx.beginPath();
  ctx.moveTo(cometWarning.startX, cometWarning.startY);
  ctx.lineTo(cometWarning.endX, cometWarning.endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 13px Consolas";
  ctx.textAlign = "center";
  ctx.fillText("⚠ ESTRELLA FUGAZ · DESPEJA LA TRAYECTORIA", GAME_WIDTH / 2, 44);
  ctx.restore();
}

function drawComet(comet) {
  ctx.save();
  ctx.translate(comet.x + comet.width / 2, comet.y + comet.height / 2);
  ctx.rotate(comet.angle);
  const gradient = ctx.createLinearGradient(-75, 0, 15, 0);
  gradient.addColorStop(0, "rgba(255, 209, 102, 0)");
  gradient.addColorStop(1, "#ffd166");
  ctx.fillStyle = gradient;
  ctx.fillRect(-78, -6, 78, 12);
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#ffd166";
  drawPolygon(0, 0, 18, 5);
  ctx.fill();
  ctx.restore();
}

function drawAimCrosshair() {
  ctx.save();
  ctx.strokeStyle = "rgba(67, 255, 155, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(manualAim.x, manualAim.y, 13, 0, Math.PI * 2);
  ctx.moveTo(manualAim.x - 19, manualAim.y);
  ctx.lineTo(manualAim.x + 19, manualAim.y);
  ctx.moveTo(manualAim.x, manualAim.y - 19);
  ctx.lineTo(manualAim.x, manualAim.y + 19);
  ctx.stroke();
  ctx.restore();
}

function drawParticle(particle) {
  ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
  ctx.fillStyle = particle.color;
  ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  ctx.globalAlpha = 1;
}

function createParticles(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    const life = randomBetween(0.35, 0.8);
    particles.push({
      x,
      y,
      vx: randomBetween(-160, 160),
      vy: randomBetween(-160, 160),
      size: randomBetween(2, 6),
      color,
      life,
      maxLife: life
    });
  }
}

function createDashTrail() {
  const colors = getSkinColors();
  const life = 0.22;
  particles.push({
    x: player.x + player.width / 2 + randomBetween(-8, 8),
    y: player.y + player.height / 2 + randomBetween(-8, 8),
    vx: -player.dashX * 120,
    vy: -player.dashY * 120,
    size: randomBetween(4, 9),
    color: colors.primary,
    life,
    maxLife: life
  });
}

function getSkinColors() {
  const skins = {
    cyan: { primary: "#00f0ff", secondary: "#e8f8ff", engine: "#a855f7" },
    violet: { primary: "#c084fc", secondary: "#f3e8ff", engine: "#00f0ff" },
    gold: { primary: "#ffd166", secondary: "#fff4c2", engine: "#ff2d75" }
  };
  return skins[player?.skin || selectedSkin];
}

/*
 * Música procedural: el navegador genera una melodía electrónica sencilla.
 * Así el proyecto no necesita descargar ni incluir un archivo de audio externo.
 */
function startMusic() {
  if (!musicEnabled || musicTimer) return;
  ensureAudioContext();
  if (!audioContext) return;

  const intense = Boolean(boss);
  const finalIntensity = Boolean(boss?.final);
  const finalPhaseTwo = Boolean(boss?.final && boss.phaseTwo);
  const tempo = finalPhaseTwo ? 72 : finalIntensity ? 105 : intense ? 145 : 240;
  const notes = finalIntensity
    ? [82.41, 98, 110, 130.81, 146.83, 130.81, 110, 98]
    : intense
      ? [110, 146.83, 174.61, 220, 246.94, 220, 174.61, 146.83]
      : [110, 164.81, 220, 246.94, 220, 196, 164.81, 146.83];
  musicTimer = window.setInterval(() => {
    if (gameState !== "playing" || !musicEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = intense ? (musicStep % 2 === 0 ? "sawtooth" : "triangle") : (musicStep % 4 === 0 ? "triangle" : "sine");
    oscillator.frequency.value = notes[musicStep % notes.length];
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, (finalIntensity ? 0.14 : intense ? 0.12 : 0.1) * musicVolume), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);

    if (intense && musicStep % 2 === 0) {
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bass.type = "square";
      bass.frequency.value = finalIntensity ? 41.2 : 55;
      bassGain.gain.setValueAtTime(Math.max(0.0001, 0.045 * musicVolume), now);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      bass.connect(bassGain);
      bassGain.connect(audioContext.destination);
      bass.start(now);
      bass.stop(now + 0.12);
    }
    musicStep += 1;
  }, tempo);
}

function stopMusic() {
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
}

function ensureAudioContext() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  if (!audioContext) audioContext = new AudioEngine();
  if (audioContext.state === "suspended") audioContext.resume();
}

/** Efectos de sonido generados con Web Audio, sin archivos externos. */
function playSound(type) {
  ensureAudioContext();
  if (!audioContext) return;

  const sounds = {
    collision: { start: 150, end: 55, duration: 0.28, volume: 0.12, wave: "sawtooth" },
    powerUp: { start: 420, end: 820, duration: 0.2, volume: 0.08, wave: "sine" },
    dash: { start: 180, end: 620, duration: 0.13, volume: 0.07, wave: "sawtooth" },
    dashReady: { start: 520, end: 760, duration: 0.12, volume: 0.055, wave: "sine" },
    enemyShot: { start: 260, end: 180, duration: 0.08, volume: 0.035, wave: "square" },
    level: { start: 330, end: 660, duration: 0.25, volume: 0.07, wave: "triangle" },
    boss: { start: 95, end: 48, duration: 0.55, volume: 0.12, wave: "sawtooth" },
    bossDefeat: { start: 280, end: 880, duration: 0.5, volume: 0.09, wave: "triangle" },
    playerShot: { start: 620, end: 430, duration: 0.055, volume: 0.025, wave: "square" }
  };
  const sound = sounds[type];
  if (!sound) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = sound.wave;
  oscillator.frequency.setValueAtTime(sound.start, now);
  oscillator.frequency.exponentialRampToValueAtTime(sound.end, now + sound.duration);
  gain.gain.setValueAtTime(Math.max(0.0001, sound.volume * effectsVolume), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + sound.duration);
}

/** Ciclo principal: calcula tiempo, actualiza y dibuja. */
function gameLoop(currentTime) {
  // Programar primero el siguiente cuadro evita que un fallo visual aislado
  // detenga permanentemente toda la partida.
  requestAnimationFrame(gameLoop);
  // Limitamos deltaTime para evitar saltos enormes si la pestaña pierde el foco.
  const deltaTime = Math.max(0, Math.min((currentTime - lastTime) / 1000, 0.05));
  lastTime = currentTime;
  try {
    update(deltaTime);
    draw(currentTime);
  } catch (error) {
    console.error("Nexus Defender pudo continuar después de un cuadro inválido:", error);
  }
}

function updateHud() {
  hudPlayer.textContent = playerName.toUpperCase();
  hudLives.textContent = lives > 0 ? "❤ ".repeat(lives).trim() : "---";
  hudScore.textContent = formatScore(score);
  hudLevel.textContent = `${String(level).padStart(2, "0")}${selectedDifficulty === "hard" ? " · H" : ""}`;
  if (!player || player.dashCooldown <= 0) {
    hudDash.textContent = "LISTO";
    hudDash.style.color = "#43ff9b";
    dashIndicator.classList.add("ready");
    dashIndicator.querySelector("strong").textContent = "DASH LISTO";
  } else {
    hudDash.textContent = `${player.dashCooldown.toFixed(1)}s`;
    hudDash.style.color = "#ffd166";
    dashIndicator.classList.remove("ready");
    dashIndicator.querySelector("strong").textContent = `RECARGA ${player.dashCooldown.toFixed(1)}s`;
  }

  const ultimatePercent = player ? Math.floor((player.ultimateEnergy / player.ultimateMax) * 100) : 0;
  ultimateValue.textContent = ultimatePercent >= 100 ? "Q · LISTO" : `${ultimatePercent}%`;
  ultimateBar.style.width = `${ultimatePercent}%`;
  ultimateIndicator.classList.toggle("ready", ultimatePercent >= 100);

  const secondsInLevel = elapsedTime % LEVEL_DURATION;
  const levelPercent = (secondsInLevel / LEVEL_DURATION) * 100;
  const currentTheme = scenarioThemes[scenarioIndex] || scenarioThemes[0];
  if (selectedDifficulty === "bossrush") {
    levelProgressText.textContent = `BOSS RUSH · COMBATE ${bossRushIndex + 1} / ${bossRushLevels.length}`;
    levelProgressBar.style.width = `${((bossRushIndex + (boss ? 0.5 : 0)) / bossRushLevels.length) * 100}%`;
    nextBossText.textContent = boss ? `${boss.name} ACTIVO` : "PREPARANDO JEFE";
  } else {
    levelProgressText.textContent = `${currentTheme.name} · NIVEL ${level} · ${Math.floor(secondsInLevel)} / ${LEVEL_DURATION} s`;
    levelProgressBar.style.width = `${levelPercent}%`;
    const nextBossLevel = Math.min(15, Math.ceil((level + 0.01) / 3) * 3);
    nextBossText.textContent = boss
      ? (boss.final ? "YACERAMI ACTIVO" : "GUARDIÁN ACTIVO")
      : (nextBossLevel === 15 ? "YACERAMI EN NIVEL 15" : `GUARDIÁN EN NIVEL ${nextBossLevel}`);
  }

  if (boss) {
    const healthPercent = Math.max(0, boss.health / boss.maxHealth) * 100;
    bossTime.textContent = `${Math.ceil(healthPercent)}%`;
    bossProgress.style.width = `${healthPercent}%`;
  }
  hudHighScore.textContent = formatScore(highScore);
}

function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
    pauseMessage.classList.add("visible");
    stopMusic();
  } else if (gameState === "paused") {
    gameState = "playing";
    lastTime = performance.now();
    pauseMessage.classList.remove("visible");
    startMusic();
  }
}

function createEmptyStats() {
  return { enemiesDestroyed: 0, chestsOpened: 0, damageTaken: 0, ultimatesUsed: 0, fragmentsEarned: 0 };
}

function renderRunStats(container) {
  const values = [
    ["Enemigos destruidos", runStats.enemiesDestroyed],
    ["Cofres abiertos", runStats.chestsOpened],
    ["Daño recibido", runStats.damageTaken],
    ["Ultimate utilizadas", runStats.ultimatesUsed],
    ["Fragmentos ganados", `${runStats.fragmentsEarned} ✦`]
  ];
  container.textContent = "";
  values.forEach(([label, value]) => {
    const card = document.createElement("div");
    const name = document.createElement("span");
    const number = document.createElement("strong");
    name.textContent = label;
    number.textContent = value;
    card.append(name, number);
    container.appendChild(card);
  });
}

function loadSettings() {
  try {
    const settings = JSON.parse(safeStorageGet(SETTINGS_KEY) || "{}");
    return settings && typeof settings === "object" ? settings : {};
  } catch (error) {
    return {};
  }
}

function saveSettings() {
  safeStorageSet(SETTINGS_KEY, JSON.stringify({
    skin: selectedSkin,
    musicEnabled,
    musicVolume,
    effectsVolume,
    aimMode,
    trail: selectedTrail
  }));
}

function applySavedSettings() {
  musicVolumeSlider.value = String(Math.round(musicVolume * 100));
  effectsVolumeSlider.value = String(Math.round(effectsVolume * 100));
  musicVolumeValue.textContent = `${musicVolumeSlider.value}%`;
  effectsVolumeValue.textContent = `${effectsVolumeSlider.value}%`;
  musicButton.textContent = musicEnabled ? "♫ MÚSICA: ON" : "♫ MÚSICA: OFF";
  musicButton.setAttribute("aria-pressed", String(musicEnabled));
  musicButton.classList.toggle("off", !musicEnabled);
  document.querySelectorAll("input[name='skin']").forEach((radio) => {
    radio.checked = radio.value === selectedSkin;
    radio.closest(".skin-option").classList.toggle("selected", radio.checked);
  });
  document.querySelectorAll("input[name='aimMode']").forEach((radio) => {
    radio.checked = radio.value === aimMode;
  });
  if (!ownedCosmetics.includes(selectedTrail)) selectedTrail = "none";
}

function awardRunFragments(finalScore) {
  if (runStats.fragmentsEarned > 0) return;
  runStats.fragmentsEarned = Math.max(1, Math.floor(finalScore / 500));
  fragments += runStats.fragmentsEarned;
  safeStorageSet(FRAGMENTS_KEY, String(fragments));
  renderCosmeticStore();
}

function loadCosmetics() {
  try {
    const saved = JSON.parse(safeStorageGet(COSMETICS_KEY) || "[\"none\"]");
    return Array.isArray(saved) ? [...new Set(["none", ...saved])] : ["none"];
  } catch (error) {
    return ["none"];
  }
}

function renderCosmeticStore() {
  storeFragments.textContent = String(fragments);
  storeBalance.textContent = String(fragments);
  cosmeticGrid.textContent = "";
  cosmeticCatalog.forEach((cosmetic) => {
    const owned = ownedCosmetics.includes(cosmetic.id);
    const selected = selectedTrail === cosmetic.id;
    const card = document.createElement("article");
    card.className = "cosmetic-item";
    const preview = document.createElement("span");
    preview.className = "trail-preview";
    preview.style.color = cosmetic.color;
    const title = document.createElement("strong");
    title.textContent = cosmetic.name;
    const description = document.createElement("small");
    description.textContent = cosmetic.description;
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = selected ? "EQUIPADA" : owned ? "EQUIPAR" : `${cosmetic.price} ✦ · COMPRAR`;
    action.disabled = selected;
    action.addEventListener("click", () => {
      if (!owned) {
        if (fragments < cosmetic.price) return;
        fragments -= cosmetic.price;
        ownedCosmetics.push(cosmetic.id);
        safeStorageSet(FRAGMENTS_KEY, String(fragments));
        safeStorageSet(COSMETICS_KEY, JSON.stringify(ownedCosmetics));
      }
      selectedTrail = cosmetic.id;
      saveSettings();
      renderCosmeticStore();
      playSound("powerUp");
    });
    card.append(preview, title, description, action);
    cosmeticGrid.appendChild(card);
  });
}

function openCosmeticStore(returnState) {
  storeReturnState = returnState;
  startScreen.classList.remove("active");
  upgradeScreen.classList.remove("active");
  renderCosmeticStore();
  storeScreen.classList.add("active");
}

function closeCosmeticStore() {
  storeScreen.classList.remove("active");
  if (storeReturnState === "upgrading") upgradeScreen.classList.add("active");
  else startScreen.classList.add("active");
}

function updateCosmeticTrail(deltaTime) {
  cosmeticTrail.forEach((point) => { point.life -= deltaTime; });
  cosmeticTrail = cosmeticTrail.filter((point) => point.life > 0);
  if (!player || selectedTrail === "none") return;
  cosmeticTrailTimer -= deltaTime;
  if (cosmeticTrailTimer <= 0) {
    cosmeticTrailTimer = 0.035;
    cosmeticTrail.push({
      x: player.x + player.width / 2,
      y: player.y + player.height * 0.8,
      life: 0.55,
      maxLife: 0.55,
      size: randomBetween(3, 7)
    });
  }
}

function drawCosmeticTrail() {
  if (selectedTrail === "none") return;
  const cosmetic = cosmeticCatalog.find((item) => item.id === selectedTrail) || cosmeticCatalog[0];
  ctx.save();
  cosmeticTrail.forEach((point) => {
    ctx.globalAlpha = point.life / point.maxLife;
    ctx.fillStyle = cosmetic.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = cosmetic.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size * (point.life / point.maxLife), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function updateDifficultyAvailability() {
  const unlocked = finalBossDefeats > 0;
  const bossRushUnlocked = unlockedAchievements.includes("hard_victory");
  hardModeInput.disabled = !unlocked;
  hardModeOption.querySelector("span").textContent = unlocked ? "Difícil" : "Difícil 🔒";
  hardModeHint.textContent = unlocked
    ? "Enemigos +22% velocidad, +30% vida y oleadas más rápidas"
    : "Derrota a YACERAMI para desbloquearlo";
  if (!unlocked && selectedDifficulty === "hard") {
    selectedDifficulty = "normal";
    startForm.elements.difficulty.value = "normal";
  }
  bossRushInput.disabled = !bossRushUnlocked;
  bossRushOption.querySelector("span").textContent = bossRushUnlocked ? "Boss Rush" : "Boss Rush 🔒";
  bossRushHint.textContent = bossRushUnlocked
    ? "Cinco jefes consecutivos con una mejora entre combates"
    : "Supera el modo difícil";
  if (!bossRushUnlocked && selectedDifficulty === "bossrush") {
    selectedDifficulty = "normal";
    startForm.elements.difficulty.value = "normal";
  }
}

function loadAchievements() {
  try {
    const saved = JSON.parse(safeStorageGet(ACHIEVEMENTS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function unlockAchievement(id) {
  if (unlockedAchievements.includes(id)) return;
  unlockedAchievements.push(id);
  safeStorageSet(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
}

function evaluateAchievements(victory) {
  if (victory && runStats.damageTaken === 0) unlockAchievement("untouched");
  if (runStats.enemiesDestroyed >= 100) unlockAchievement("centurion");
  if (runStats.ultimatesUsed >= 3) unlockAchievement("ultimate_master");
  if (victory && selectedDifficulty === "hard") unlockAchievement("hard_victory");
  renderAchievements();
}

function renderAchievements() {
  achievementsList.textContent = "";
  achievementCatalog.forEach((achievement) => {
    const unlocked = unlockedAchievements.includes(achievement.id);
    const item = document.createElement("div");
    item.className = `achievement${unlocked ? " unlocked" : ""}`;
    item.textContent = unlocked
      ? `${achievement.icon} ${achievement.name} · ${achievement.description}`
      : `🔒 ${achievement.name}`;
    achievementsList.appendChild(item);
  });
}

function showStartMenu() {
  gameState = "menu";
  stopMusic();
  gameOverScreen.classList.remove("active");
  victoryScreen.classList.remove("active");
  upgradeScreen.classList.remove("active");
  bestiaryScreen.classList.remove("active");
  storeScreen.classList.remove("active");
  bossIncoming.classList.remove("visible");
  updateDifficultyAvailability();
  startScreen.classList.add("active");
}

// Herramientas generales.
function isColliding(a, b) {
  const margin = 5; // Margen para que las colisiones se sientan justas.
  return (
    a.x + margin < b.x + b.width &&
    a.x + a.width - margin > b.x &&
    a.y + margin < b.y + b.height &&
    a.y + a.height - margin > b.y
  );
}

function isInsideArena(object) {
  return (
    object.x > 0 && object.x + object.width < GAME_WIDTH &&
    object.y > 0 && object.y + object.height < GAME_HEIGHT
  );
}

function loadRecords() {
  try {
    const saved = JSON.parse(safeStorageGet(RECORDS_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(0, 5) : [];
  } catch (error) {
    return [];
  }
}

function saveRecord(finalScore) {
  records.push({ name: playerName.slice(0, 16), score: finalScore, level });
  records.sort((a, b) => b.score - a.score);
  records = records.slice(0, 5);
  safeStorageSet(RECORDS_KEY, JSON.stringify(records));
  renderRecords();
}

function renderRecords() {
  recordsBody.textContent = "";
  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "Aún no hay registros";
    row.appendChild(cell);
    recordsBody.appendChild(row);
    return;
  }

  records.forEach((record, index) => {
    const row = document.createElement("tr");
    [index + 1, record.name, formatScore(record.score), record.level].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    recordsBody.appendChild(row);
  });
}

function drawPolygon(x, y, radius, sides) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(pointX, pointY);
    else ctx.lineTo(pointX, pointY);
  }
  ctx.closePath();
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function randomBetween(minimum, maximum) {
  return Math.random() * (maximum - minimum) + minimum;
}

function formatScore(value) {
  return String(Math.floor(value)).padStart(6, "0");
}

// Eventos de formulario y teclado.
startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const typedName = document.getElementById("playerName").value.trim();
  playerName = typedName || "Operador";
  selectedSkin = startForm.elements.skin.value;
  selectedDifficulty = startForm.elements.difficulty.value;
  aimMode = startForm.elements.aimMode.value;
  saveSettings();
  startGame();
});

restartButton.addEventListener("click", showStartMenu);
victoryRestartButton.addEventListener("click", showStartMenu);

bestiaryButton.addEventListener("click", () => {
  bestiaryScreen.classList.add("active");
});

storeButton.addEventListener("click", () => openCosmeticStore("menu"));
upgradeStoreButton.addEventListener("click", () => openCosmeticStore("upgrading"));
closeStoreButton.addEventListener("click", closeCosmeticStore);

closeBestiaryButton.addEventListener("click", () => {
  bestiaryScreen.classList.remove("active");
});

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
    event.preventDefault();
  }
  if (key === "p" && !event.repeat) togglePause();
  if ((key === "Shift" || key === " ") && !event.repeat) useDash();
  if (key === "q" && !event.repeat) useUltimate();
  keys[key] = true;
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys[key] = false;
});

// Pausa solo si la pestaña queda realmente oculta. El evento blur también se
// activa al tocar controles del navegador integrado y congelaba la partida.
document.addEventListener("visibilitychange", () => {
  keys = {};
  if (document.hidden && gameState === "playing") {
    pausedByVisibility = true;
    togglePause();
  } else if (!document.hidden && pausedByVisibility && gameState === "paused") {
    pausedByVisibility = false;
    togglePause();
  }
});

// Los botones móviles simulan la presión de una tecla.
document.querySelectorAll(".mobile-controls button[data-key]").forEach((button) => {
  const key = button.dataset.key;

  const press = (event) => {
    event.preventDefault();
    keys[key] = true;
    button.classList.add("pressed");
  };

  const release = (event) => {
    event.preventDefault();
    keys[key] = false;
    button.classList.remove("pressed");
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

mobileDash.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  useDash();
});

mobileUltimate.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  useUltimate();
});

musicButton.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  musicButton.textContent = musicEnabled ? "♫ MÚSICA: ON" : "♫ MÚSICA: OFF";
  musicButton.setAttribute("aria-pressed", String(musicEnabled));
  musicButton.classList.toggle("off", !musicEnabled);
  if (musicEnabled && gameState === "playing") startMusic();
  else stopMusic();
  saveSettings();
});

musicVolumeSlider.addEventListener("input", () => {
  musicVolume = Number(musicVolumeSlider.value) / 100;
  musicVolumeValue.textContent = `${musicVolumeSlider.value}%`;
  saveSettings();
});

effectsVolumeSlider.addEventListener("input", () => {
  effectsVolume = Number(effectsVolumeSlider.value) / 100;
  effectsVolumeValue.textContent = `${effectsVolumeSlider.value}%`;
  saveSettings();
});

document.querySelectorAll("input[name='skin']").forEach((radio) => {
  radio.addEventListener("change", () => {
    selectedSkin = radio.value;
    document.querySelectorAll(".skin-option").forEach((option) => option.classList.remove("selected"));
    radio.closest(".skin-option").classList.add("selected");
    saveSettings();
  });
});

document.querySelectorAll("input[name='aimMode']").forEach((radio) => {
  radio.addEventListener("change", () => {
    aimMode = radio.value;
    saveSettings();
  });
});

canvas.addEventListener("pointermove", (event) => {
  const bounds = canvas.getBoundingClientRect();
  manualAim.x = (event.clientX - bounds.left) * (GAME_WIDTH / bounds.width);
  manualAim.y = (event.clientY - bounds.top) * (GAME_HEIGHT / bounds.height);
  manualAim.hasPointer = true;
});

const updateAimStick = (event) => {
  const bounds = aimStick.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const deltaX = event.clientX - centerX;
  const deltaY = event.clientY - centerY;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const maximum = bounds.width * 0.3;
  const visualDistance = Math.min(maximum, length);
  manualAim.vectorX = deltaX / length;
  manualAim.vectorY = deltaY / length;
  manualAim.stickActive = true;
  if (aimMode !== "manual") {
    aimMode = "manual";
    startForm.elements.aimMode.value = "manual";
    saveSettings();
  }
  aimKnob.style.transform = `translate(${manualAim.vectorX * visualDistance}px, ${manualAim.vectorY * visualDistance}px)`;
};

aimStick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  aimStick.setPointerCapture(event.pointerId);
  updateAimStick(event);
});
aimStick.addEventListener("pointermove", (event) => {
  if (manualAim.stickActive) updateAimStick(event);
});
const releaseAimStick = () => {
  manualAim.stickActive = false;
  aimKnob.style.transform = "translate(0, 0)";
};
aimStick.addEventListener("pointerup", releaseAimStick);
aimStick.addEventListener("pointercancel", releaseAimStick);

requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(gameLoop);
});
