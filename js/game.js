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
const menuHeroCanvas = document.getElementById("menuHeroCanvas");
const menuHeroShipName = document.getElementById("menuHeroShipName");
const menuEquipped = document.getElementById("menuEquipped");
const shipBalance = document.getElementById("shipBalance");
const shipPurchaseMessage = document.getElementById("shipPurchaseMessage");
const gameOverScreen = document.getElementById("gameOverScreen");
const upgradeScreen = document.getElementById("upgradeScreen");
const upgradeOptions = document.getElementById("upgradeOptions");
const moduleCompendium = document.getElementById("moduleCompendium");
const synergyCompendium = document.getElementById("synergyCompendium");
const upgradeSynergyHint = document.getElementById("upgradeSynergyHint");
const moduleToast = document.getElementById("moduleToast");
const moduleRack = document.getElementById("moduleRack");
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
const mobileControls = document.getElementById("mobileControls");
const editTouchMenu = document.getElementById("editTouchMenu");
const editTouchGame = document.getElementById("editTouchGame");
const touchEditor = document.getElementById("touchEditor");
const saveTouchLayoutButton = document.getElementById("saveTouchLayout");
const resetTouchLayoutButton = document.getElementById("resetTouchLayout");
const cancelTouchLayoutButton = document.getElementById("cancelTouchLayout");
const touchEditorMessage = document.getElementById("touchEditorMessage");
const keyBindingGrid = document.getElementById("keyBindingGrid");
const keyBindingMessage = document.getElementById("keyBindingMessage");
const keyHint = document.getElementById("keyHint");
const resetKeyBindingsButton = document.getElementById("resetKeyBindings");
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
const closeStoreTopButton = document.getElementById("closeStoreTopButton");
const storeFragments = document.getElementById("storeFragments");
const storeBalance = document.getElementById("storeBalance");
const cosmeticGrid = document.getElementById("cosmeticGrid");
const cosmeticFilters = document.getElementById("cosmeticFilters");
const bossRushOption = document.getElementById("bossRushOption");
const bossRushInput = bossRushOption.querySelector("input");
const bossRushHint = document.getElementById("bossRushHint");
const aimStick = document.getElementById("aimStick");
const aimKnob = document.getElementById("aimKnob");
const moveStick = document.getElementById("moveStick");
const moveKnob = document.getElementById("moveKnob");
const damageNumbersToggle = document.getElementById("damageNumbersToggle");
const hitFeedback = document.getElementById("hitFeedback");
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
const SHIPS_KEY = "nexusDefenderOwnedShips";
const NORMAL_BOSS_VICTORIES_KEY = "nexusDefenderNormalYaceramiVictories";
const HARD_BOSS_VICTORIES_KEY = "nexusDefenderHardYaceramiVictories";
const SHIP_PRICE = 50;
const DASH_COOLDOWN = 6;
const DEFAULT_BINDINGS = Object.freeze({ up: "w", down: "s", left: "a", right: "d",
  dash: "Shift", ultimate: "q", pause: "p" });
const KEY_ACTIONS = [
  { id: "up", label: "Mover arriba", fallback: "ArrowUp" },
  { id: "down", label: "Mover abajo", fallback: "ArrowDown" },
  { id: "left", label: "Mover izquierda", fallback: "ArrowLeft" },
  { id: "right", label: "Mover derecha", fallback: "ArrowRight" },
  { id: "dash", label: "Dash", fallback: "Space" },
  { id: "ultimate", label: "Ultimate" },
  { id: "pause", label: "Pausa" }
];
const DEFAULT_TOUCH_LAYOUTS = Object.freeze({
  portrait: { move: { x: .18, y: .57 }, aim: { x: .82, y: .57 },
    dash: { x: .55, y: .22 }, ultimate: { x: .55, y: .78 } },
  landscape: { move: { x: .09, y: .55 }, aim: { x: .89, y: .55 },
    dash: { x: .8, y: .23 }, ultimate: { x: .8, y: .75 } }
});
const LEVEL_DURATION = GameRules.LEVEL_DURATION;

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
let orientationBlocked = false;
let playerName = "Operador";
let player;
let threats = [];
let powerUps = [];
let particles = [];
let damageNumbers = [];
let enemyProjectiles = [];
let playerProjectiles = [];
let boss = null;
let ultimateBossPulse = null;
let ultimateEffects = [];
let attackImpacts = [];
let phaseFields = [];
let moduleFlashes = [];
let moduleToastTime = 0;
let dashEchoes = [];
let dashEchoTimer = 0;
let dashBursts = [];
let obstacles = [];
let scenarioIndex = 0;
let chest = null;
let chestTimer = 0;
let lastCalculatedLevel = 1;
let keys = {};
let touchMovement = { x: 0, y: 0, active: false };
let score = 0;
let level = 1;
let lives = 3;
let highScore = Number(safeStorageGet(HIGH_SCORE_KEY)) || 0;
let elapsedTime = 0;
let threatTimer = 0;
let powerUpTimer = 0;
let lastTime = 0;
let screenShake = 0;
let hitFeedbackTime = 0;
let averageFrameMs = 16.7;
let lowPerformance = false;
let hudRefreshTime = 0;
const savedSettings = loadSettings();
let controlBindings = loadControlBindings(savedSettings.controlBindings);
let touchLayouts = loadTouchLayouts(savedSettings.touchLayouts);
let capturingBinding = null;
let touchEditing = false;
let touchEditorSnapshot = null;
let touchEditorWasPlaying = false;
let touchDrag = null;
const stickPointers = { move: null, aim: null };
let selectedSkin = ["cyan", "violet", "gold"].includes(savedSettings.skin) ? savedSettings.skin : "cyan";
let selectedDifficulty = "normal";
let musicEnabled = savedSettings.musicEnabled !== false;
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
let manualAim = { hasPointer: false, hasDirection: false, stickActive: false, x: GAME_WIDTH / 2, y: 0, vectorX: 0, vectorY: -1 };
let aimMode = ["auto", "manual"].includes(savedSettings.aimMode) ? savedSettings.aimMode : "auto";
let showDamageNumbers = savedSettings.showDamageNumbers === true;
let fragments = Number(safeStorageGet(FRAGMENTS_KEY)) || 0;
let ownedShips = loadOwnedShips();
let ownedCosmetics = loadCosmetics();
let selectedTrail = savedSettings.trail || "none";
let selectedAura = savedSettings.aura || "aura_none";
let selectedDashStyle = savedSettings.dashStyle || "dash_none";
let cosmeticFilter = "all";
let lastCosmeticPreviewDraw = 0;
let cosmeticTrail = [];
let cosmeticTrailTimer = 0;
let storeReturnState = "menu";
let bossRushIndex = 0;
let pendingBossRushAdvance = false;
let pausedByVisibility = false;
const bossRushLevels = [3, 6, 9, 12, 15];
let runStats = createEmptyStats();
let unlockedAchievements = loadAchievements();
let normalBossVictories = loadModeVictories(NORMAL_BOSS_VICTORIES_KEY, finalBossDefeats > 0 ? 1 : 0);
let hardBossVictories = loadModeVictories(HARD_BOSS_VICTORIES_KEY,
  unlockedAchievements.includes("hard_victory") ? 1 : 0);

const achievementCatalog = [
  { id: "untouched", icon: "◇", name: "Nexo intacto", description: "Derrota a YACERAMI sin recibir daño." },
  { id: "centurion", icon: "✹", name: "Centinela centenario", description: "Destruye 100 enemigos en una misión." },
  { id: "ultimate_master", icon: "✦", name: "Poder absoluto", description: "Usa la Ultimate tres veces en una misión." },
  { id: "hard_victory", icon: "⚠", name: "Soberano del vacío", description: "Vence a YACERAMI en modo difícil." }
];

const cosmeticCatalog = [
  { id: "none", category: "trail", name: "Sin estela", description: "Nave sin partículas posteriores.", price: 0, color: "#8296a6", shape: "dot" },
  { id: "neon", category: "trail", name: "Rastro Neón", description: "Núcleos cian con chispas blancas.", price: 10, color: "#00f0ff", accent: "#f0ffff", shape: "dot", motif: "double" },
  { id: "mint", category: "trail", name: "Menta Orbital", description: "Cruces verdes que giran detrás de la nave.", price: 12, color: "#43ff9b", accent: "#eafff4", shape: "spark", motif: "orbit" },
  { id: "ember", category: "trail", name: "Brasa Roja", description: "Ascua naranja con humo rojo tenue.", price: 15, color: "#ff6347", accent: "#ffbd6b", shape: "spark", motif: "flame" },
  { id: "ice", category: "trail", name: "Cristal de Hielo", description: "Fragmentos azul hielo y reflejos blancos.", price: 18, color: "#8be9fd", accent: "#ffffff", shape: "shard", motif: "double" },
  { id: "quantum", category: "trail", name: "Eco Serenity", description: "Órbitas violetas con puntos de fase.", price: 20, color: "#c084fc", accent: "#5af7ff", shape: "ring", motif: "orbit" },
  { id: "bubble", category: "trail", name: "Burbuja Digital", description: "Burbujas que flotan y se desvanecen.", price: 22, color: "#4ee6d5", accent: "#cefff7", shape: "ring", motif: "bubble" },
  { id: "pixel", category: "trail", name: "Pixel Retro", description: "Bloques arcade de bordes nítidos.", price: 25, color: "#8cf05a", accent: "#eaff8a", shape: "square", motif: "pixel" },
  { id: "rose", category: "trail", name: "Nebulosa Rosa", description: "Estrellas fucsia con polvo lavanda.", price: 28, color: "#ff8cc6", accent: "#b884ff", shape: "star", motif: "galaxy" },
  { id: "storm", category: "trail", name: "Tormenta Eléctrica", description: "Rayos azules quebrados.", price: 32, color: "#2775ff", accent: "#b3efff", shape: "spark", motif: "lightning" },
  { id: "solar", category: "trail", name: "Cometa Solar", description: "Meteoros dorados con cola ardiente.", price: 35, color: "#ffd166", accent: "#ff784e", shape: "dot", motif: "comet" },
  { id: "lunar", category: "trail", name: "Luna de Plata", description: "Órbitas plateadas de brillo frío.", price: 38, color: "#dce6f1", accent: "#829cc6", shape: "ring", motif: "ghost" },
  { id: "aurora", category: "trail", name: "Aurora Nexo", description: "Cristales verdes y cian alternados.", price: 42, color: "#7bf7bd", accent: "#64dfff", shape: "diamond", motif: "double" },
  { id: "sakura", category: "trail", name: "Sakura Estelar", description: "Pétalos coral girando en el vacío.", price: 46, color: "#ffa3ad", accent: "#ffe2d9", shape: "petal", motif: "orbit" },
  { id: "prism", category: "trail", name: "Prisma Cósmico", description: "Fragmentos lavanda con reflejo dorado.", price: 50, color: "#e0aaff", accent: "#ffd166", shape: "shard", motif: "double" },
  { id: "void", category: "trail", name: "Vacío YACERAMI", description: "Anillos carmesí con eco oscuro.", price: 55, color: "#ff2d75", accent: "#a44cff", shape: "ring", motif: "ghost" },
  { id: "nova", category: "trail", name: "Nova Blanca", description: "Estrellas blancas y polvo azul.", price: 65, color: "#ffffff", accent: "#9bdfff", shape: "star", motif: "galaxy" },
  { id: "galaxy", category: "trail", name: "Galaxia Índigo", description: "Cúmulos índigo de dos tamaños.", price: 75, color: "#786bff", accent: "#ff9fce", shape: "dot", motif: "galaxy" },
  { id: "royal", category: "trail", name: "Corona Real", description: "Diamantes dorados con destello marfil.", price: 90, color: "#ffdf70", accent: "#fff5d1", shape: "diamond", motif: "double" },
  { id: "legend", category: "trail", name: "Leyenda del Nexo", description: "Estrellas cian y chispas de élite.", price: 120, color: "#00f0ff", accent: "#ffd166", shape: "star", motif: "galaxy" },
  { id: "inferno", category: "trail", name: "Inferno Carmesí", description: "Llamas densas de rojo y naranja.", price: 44, color: "#ff3d50", accent: "#ffad42", shape: "petal", motif: "flame" },
  { id: "circuit", category: "trail", name: "Circuito Verde", description: "Celdas de datos y nodos conectados.", price: 48, color: "#5cff8d", accent: "#d0ff52", shape: "square", motif: "circuit" },
  { id: "meteor", category: "trail", name: "Lluvia Meteoro", description: "Gotas naranjas en caída rápida.", price: 52, color: "#ff9d52", accent: "#ffdf88", shape: "dot", motif: "rain" },
  { id: "hologram", category: "trail", name: "Eco Holográfico", description: "Triángulos cian de transparencia variable.", price: 56, color: "#78f3ff", accent: "#bf8cff", shape: "triangle", motif: "ghost" },
  { id: "obsidian", category: "trail", name: "Obsidiana", description: "Fragmentos oscuros con filo violeta.", price: 60, color: "#9a63f9", accent: "#ebcffd", shape: "shard", motif: "ghost" },
  { id: "rainbow", category: "trail", name: "Espectro Vivo", description: "Anillos multicolor en la ruta.", price: 68, color: "#ff78b9", accent: "#65f3ff", shape: "ring", motif: "double" },
  { id: "fireflies", category: "trail", name: "Luciérnagas", description: "Puntos dorados que orbitan suavemente.", price: 72, color: "#f8ed76", accent: "#7bf7bd", shape: "dot", motif: "orbit" },
  { id: "stardust", category: "trail", name: "Polvo Estelar", description: "Un cielo violeta de pequeñas estrellas.", price: 82, color: "#a4a1ff", accent: "#ffffff", shape: "star", motif: "galaxy" },
  { id: "ocean", category: "trail", name: "Marea Nexo", description: "Burbujas azul profundo y espuma cian.", price: 86, color: "#398dff", accent: "#8efaff", shape: "ring", motif: "bubble" },
  { id: "zenith", category: "trail", name: "Cenit", description: "Prismas blancos y oro de larga duración.", price: 105, color: "#fff7cf", accent: "#ffd166", shape: "diamond", motif: "comet" },
  { id: "aura_none", category: "aura", name: "Sin aura", description: "Contorno normal de la nave.", price: 0, color: "#8296a6", motif: "halo" },
  { id: "aura_halo", category: "aura", name: "Halo Core", description: "Cuatro arcos cian alrededor del casco.", price: 24, color: "#00f0ff", accent: "#eaffff", motif: "halo" },
  { id: "aura_orbit", category: "aura", name: "Satélites Serenity", description: "Puntos violetas en órbita.", price: 36, color: "#c084fc", accent: "#61f5ff", motif: "orbit" },
  { id: "aura_shield", category: "aura", name: "Escudo Espectral", description: "Hexágono verde translúcido.", price: 52, color: "#43ff9b", accent: "#d8ffe8", motif: "shield" },
  { id: "aura_flame", category: "aura", name: "Corona Solar", description: "Arcos ámbar y una media corona.", price: 68, color: "#ffd166", accent: "#ff7b52", motif: "flame" },
  { id: "aura_crown", category: "aura", name: "Trono Astral", description: "Ocho segmentos dorados con nodos.", price: 100, color: "#ffdf70", accent: "#ffffff", motif: "crown" },
  { id: "aura_petals", category: "aura", name: "Flor Estelar", description: "Pétalos luminosos giran alrededor del casco.", price: 32, color: "#ffa3c7", accent: "#fff0f2", motif: "petals" },
  { id: "aura_binary", category: "aura", name: "Círculo Binario", description: "Nodos verdes trazan un anillo de datos.", price: 40, color: "#76ff8c", accent: "#d8ff6e", motif: "binary" },
  { id: "aura_hexgrid", category: "aura", name: "Lattice Prisma", description: "Doble hexágono violeta con líneas diagonales.", price: 48, color: "#ae86ff", accent: "#7ceaff", motif: "hexgrid" },
  { id: "aura_pulse", category: "aura", name: "Nova Radiante", description: "Ondas blancas se expanden suavemente.", price: 58, color: "#f7ffff", accent: "#9fe9ff", motif: "pulse" },
  { id: "aura_runes", category: "aura", name: "Runas del Vacío", description: "Glifos carmesí separados por espacios oscuros.", price: 66, color: "#ff438a", accent: "#d19cff", motif: "runes" },
  { id: "aura_twin", category: "aura", name: "Doble Corona", description: "Dos órbitas cian y dorada cruzadas.", price: 76, color: "#55f2ff", accent: "#ffd166", motif: "twin" },
  { id: "aura_wings", category: "aura", name: "Alas Serafín", description: "Plumas de luz se abren a ambos lados.", price: 90, color: "#ddf9ff", accent: "#b5a2ff", motif: "wings" },
  { id: "aura_nebula", category: "aura", name: "Nebulosa Viva", description: "Espirales rosa y violeta rodean la nave.", price: 104, color: "#ff8ccf", accent: "#8b87ff", motif: "nebula" },
  { id: "aura_meteor", category: "aura", name: "Órbita Meteoro", description: "Tres meteoros ámbar dejan pequeñas colas.", price: 118, color: "#ffa85d", accent: "#ffe69a", motif: "meteor" },
  { id: "aura_eclipse", category: "aura", name: "Eclipse Real", description: "Creciente índigo y halo blanco en oposición.", price: 138, color: "#7168ff", accent: "#ffffff", motif: "eclipse" },
  { id: "dash_none", category: "dash", name: "Dash clásico", description: "Ecos de la nave con su color de origen.", price: 0, color: "#8296a6", motif: "wide" },
  { id: "dash_digital", category: "dash", name: "Salto Digital", description: "Doble línea segmentada y nodos cian.", price: 28, color: "#58ecff", accent: "#ffffff", motif: "digital" },
  { id: "dash_wave", category: "dash", name: "Ondas Serenity", description: "Dos ondas violetas sobre el recorrido.", price: 42, color: "#bd8aff", accent: "#f9eaff", motif: "wave" },
  { id: "dash_spark", category: "dash", name: "Rayo Tormenta", description: "Chispas eléctricas entre los ecos.", price: 58, color: "#528fff", accent: "#e1f9ff", motif: "spark" },
  { id: "dash_wide", category: "dash", name: "Corte Solar", description: "Dos bandas doradas de energía.", price: 74, color: "#ffcc68", accent: "#fff1c2", motif: "wide" },
  { id: "dash_triple", category: "dash", name: "Triple Espectro", description: "Tres líneas brillantes en paralelo.", price: 95, color: "#ff73c2", accent: "#78f9ff", motif: "triple" },
  { id: "dash_ribbon", category: "dash", name: "Cinta Cometa", description: "Una cinta luminosa serpentea sobre la ruta.", price: 32, color: "#ff9bc8", accent: "#fff0b8", motif: "ribbon" },
  { id: "dash_chevron", category: "dash", name: "Impulso Flecha", description: "Chevrones cian apuntan al destino.", price: 40, color: "#5af7ff", accent: "#d4ffff", motif: "chevron" },
  { id: "dash_portal", category: "dash", name: "Portales Gemelos", description: "Aros violetas abren salida y llegada.", price: 50, color: "#af87ff", accent: "#79fbff", motif: "portal" },
  { id: "dash_pixel", category: "dash", name: "Ruptura Pixel", description: "Bloques verde arcade se fragmentan.", price: 60, color: "#8bff6a", accent: "#e6ff8d", motif: "pixel" },
  { id: "dash_flame", category: "dash", name: "Estela Fénix", description: "Llamas naranja siguen el salto.", price: 70, color: "#ff794f", accent: "#ffd36b", motif: "flame" },
  { id: "dash_ice", category: "dash", name: "Corte Glacial", description: "Fragmentos de hielo marcan el camino.", price: 80, color: "#8bdfff", accent: "#ffffff", motif: "ice" },
  { id: "dash_prism", category: "dash", name: "Prisma Arcoíris", description: "Tres líneas cambian entre cian, rosa y oro.", price: 96, color: "#7df5ff", accent: "#ff9fcf", motif: "prism" },
  { id: "dash_orbit", category: "dash", name: "Espiral Orbital", description: "Puntos blancos giran sobre el recorrido.", price: 108, color: "#c7b3ff", accent: "#ffffff", motif: "orbit" },
  { id: "dash_void", category: "dash", name: "Fisura del Vacío", description: "Una grieta carmesí se abre y se cierra.", price: 124, color: "#ff3a8f", accent: "#903bdb", motif: "void" },
  { id: "dash_crown", category: "dash", name: "Camino Imperial", description: "Diamantes dorados coronan el impulso.", price: 145, color: "#ffdf70", accent: "#ffffff", motif: "crown" }
].map(item => ({ ...item, basePrice: item.price, price: Math.ceil(item.price * 1.2) }));

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

const bestiaryPreviews = [
  EnemyPreviews.mount(document.getElementById("regularBestiary"), EnemyArt.catalog, { compact: true }),
  EnemyPreviews.mount(document.getElementById("bossBestiary"), EnemyArt.bosses, { compact: true }),
  EnemyPreviews.mount(document.getElementById("hazardBestiary"), [EnemyArt.hazard], { compact: true })
];
const reducePreviewMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastBestiaryDraw = 0;

hudHighScore.textContent = formatScore(highScore);
renderRecords();
finalBossDefeatsText.textContent = String(finalBossDefeats);
applySavedSettings();
updateDifficultyAvailability();
renderAchievements();
renderCosmeticStore();
updateOrientationGate();
registerServiceWorker();
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
    motionX: 0,
    motionY: 0,
    attackInterval: 0.48,
    projectileDamage: 1,
    projectileSpeed: 560,
    dashCooldownMax: DASH_COOLDOWN,
    maxLives: selectedDifficulty === "hard" ? 2 : 3,
    upgrades: [],
    synergies: [],
    droneTimer: 2.6,
    droneKills: 0,
    repulsorTimer: 8,
    ionicHits: 0,
    ionicDroneCooldown: 0,
    prismDartsWindow: 0,
    prismDartsCount: 0,
    nanoWaveLevel: 1,
    nanoKillsThisWave: 0,
    nanoObservedKills: 0,
    nanoRepairedThisWave: false,
    dashCount: 0,
    phaseShieldCooldown: 0,
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
  damageNumbers = [];
  enemyProjectiles = [];
  playerProjectiles = [];
  boss = null;
  ultimateBossPulse = null;
  ultimateEffects = [];
  attackImpacts = [];
  phaseFields = [];
  moduleFlashes = [];
  moduleToastTime = 0;
  moduleToast.classList.remove("visible");
  moduleRack.textContent = "";
  dashEchoes = [];
  dashEchoTimer = 0;
  dashBursts = [];
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
  touchMovement = { x: 0, y: 0, active: false };
  releaseAllSticks();
  score = 0;
  level = 1;
  lastCalculatedLevel = 1;
  lives = player.maxLives;
  runStats = createEmptyStats();
  elapsedTime = 0;
  threatTimer = 0;
  powerUpTimer = 0;
  screenShake = 0;
  hitFeedbackTime = 0;
  hitFeedback.classList.remove("visible");
  hudRefreshTime = 0;
  powerStatus.textContent = "";
  bossBar.classList.remove("visible");
  bossIncoming.classList.remove("visible");
  updateHud();
}

/** Inicia la partida después de escribir el nombre. */
function startGame() {
  resetGame();
  gameState = "playing";
  document.body.classList.add("mobile-session");
  document.body.classList.remove("mobile-ended");
  updateOrientationGate();
  requestLandscapeMode();
  applyTouchLayout();
  startScreen.classList.remove("active");
  gameOverScreen.classList.remove("active");
  upgradeScreen.classList.remove("active");
  victoryScreen.classList.remove("active");
  bestiaryScreen.classList.remove("active");
  storeScreen.classList.remove("active");
  pauseMessage.classList.remove("visible");
  lastTime = performance.now();
  ensureAudioContext();
  if (!orientationBlocked) startMusic();
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
  if (threats.length >= (lowPerformance ? 65 : 100)) return;
  // El rango aumenta con el nivel: pueden aparecer amenazas pequeñas y veloces
  // o amenazas grandes que ocupan más espacio.
  let size = randomBetween(24, Math.min(82, 48 + level * 3));
  // Los comportamientos avanzados se incorporan gradualmente.
  let availableTypes = threatTypes.slice(0, 3);
  if (level >= 2) availableTypes = threatTypes.slice(0, 4);
  if (level >= 3) availableTypes = threatTypes.slice(0, 6);
  if (level >= 4) availableTypes = threatTypes;
  if (threats.filter(threat => threat.type.icon === "mine").length >= 3) {
    availableTypes = availableTypes.filter(type => type.icon !== "mine");
  }
  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  if (type.behavior === "tank") size = Math.min(92, size * 1.45);
  if (type.behavior === "mine") size = Math.min(68, size * 1.18);
  if (type.icon === "mail") size = Math.min(40, Math.max(26, size * 0.73));
  const side = ["top", "left", "right"][Math.floor(Math.random() * 3)];
  let speedFactor = type.shoots ? 0.48 : 1;
  if (type.behavior === "hunter") speedFactor = 0.88;
  if (type.behavior === "tank") speedFactor = 0.42;
  if (type.behavior === "mine") speedFactor = 0.34;
  if (type.behavior === "orbiter") speedFactor = 0.78;
  if (type.icon === "mail") speedFactor = 1.5;
  if (type.icon === "skull") speedFactor = 0.74;
  const difficultySpeed = selectedDifficulty === "hard" ? 1.22 : 1;
  let speed = (randomBetween(115, 165) + level * 18) * speedFactor * difficultySpeed;
  if (type.icon === "mail") speed = Math.min(speed, selectedDifficulty === "hard" ? 500 : 430);
  const baseHealth = type.behavior === "tank" ? 7 : type.behavior === "mine" ? 5 : type.icon === "skull" ? 3 : type.shoots ? 3 : Math.max(1, Math.round(size / 38));
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

  const initialShotInterval = randomBetween(0.8, 1.5);
  const threat = {
    x,
    y,
    width: size,
    height: size,
    speed,
    velocityX,
    velocityY,
    side,
    shotTimer: initialShotInterval,
    shotInterval: initialShotInterval,
    health,
    maxHealth: health,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: randomBetween(-2, 2),
    baseSize: size,
    sizePulse: randomBetween(0, Math.PI * 2),
    sizePulseSpeed: randomBetween(1.5, 3.2),
    behaviorPhase: randomBetween(0, Math.PI * 2),
    type
  };
  EnemyBehavior.initialize(threat);
  threats.push(threat);
}

/** Crea un módulo de IA. El tipo se elige al azar. */
function spawnPowerUp() {
  if (powerUps.length >= 8) return;
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
  // En teléfono, la simulación espera hasta que la pantalla esté horizontal.
  if (orientationBlocked) return;
  combatTime += deltaTime;

  // El reloj de nivel se detiene durante un jefe: hay que derrotarlo para avanzar.
  if (!boss && bossIncomingTimer <= 0) elapsedTime += deltaTime;
  threatTimer += deltaTime;
  powerUpTimer += deltaTime;
  chestTimer += deltaTime;

  // Un nivel nuevo cada 20 segundos. La barra muestra el avance de la oleada.
  const calculatedLevel = selectedDifficulty === "bossrush"
    ? level
    : GameRules.levelAtTime(elapsedTime);
  if (selectedDifficulty !== "bossrush" && calculatedLevel !== lastCalculatedLevel) {
    lastCalculatedLevel = calculatedLevel;
    level = calculatedLevel;
    const newScenarioIndex = Math.floor((level - 1) / 3);
    if (newScenarioIndex !== scenarioIndex) {
      scenarioIndex = newScenarioIndex;
      generateScenario();
      startMusic();
    }
    playSound("level");
    if (level % 3 === 0) startBossWarning();
  }
  score += GameRules.scoreForTime(deltaTime, level);

  updatePlayer(deltaTime);
  updateCombatModules(deltaTime);
  updatePlayerAttack(deltaTime);
  updatePlayerProjectiles(deltaTime);
  updateThreats(deltaTime);
  updatePowerUps(deltaTime);
  updateChest(deltaTime);
  updateCometEvent(deltaTime);
  updateEnemyProjectiles(deltaTime);
  updateBossWarning(deltaTime);
  updateBoss(deltaTime);
  updateUltimateEffects(deltaTime);
  updateAttackImpacts(deltaTime);
  updateUltimateBossPulse(deltaTime);
  updateDashEchoes(deltaTime);
  updateParticles(deltaTime);
  updateDamageNumbers(deltaTime);
  updateNanoSwarm();
  updateCosmeticTrail(deltaTime);
  hitFeedbackTime = Math.max(0, hitFeedbackTime - deltaTime);
  hitFeedback.classList.toggle("visible", hitFeedbackTime > 0);
  moduleToastTime = Math.max(0, moduleToastTime - deltaTime);
  moduleToast.classList.toggle("visible", moduleToastTime > 0);

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
  hudRefreshTime -= deltaTime;
  if (hudRefreshTime <= 0) {
    hudRefreshTime = lowPerformance ? 0.12 : 0.06;
    updateHud();
  }
}

function updatePlayer(deltaTime) {
  const previousX = player.x;
  const previousY = player.y;
  let dashEnded = false;
  let directionX = 0;
  let directionY = 0;

  if (isActionHeld("left")) directionX -= 1;
  if (isActionHeld("right")) directionX += 1;
  if (isActionHeld("up")) directionY -= 1;
  if (isActionHeld("down")) directionY += 1;

  directionX += touchMovement.x;
  directionY += touchMovement.y;
  const movementLength = Math.hypot(directionX, directionY);
  if (movementLength > 1) { directionX /= movementLength; directionY /= movementLength; }

  // Normalizar evita que el movimiento diagonal sea más rápido.
  // El joystick ya da valores analógicos y se mantiene su intensidad.

  player.x += directionX * player.speed * deltaTime;
  player.y += directionY * player.speed * deltaTime;

  // Durante el dash se conserva la última dirección y aumenta mucho la velocidad.
  if (player.dashTime > 0) {
    const dashSpeed = 980;
    player.x += player.dashX * dashSpeed * deltaTime;
    player.y += player.dashY * dashSpeed * deltaTime;
    player.dashTime = Math.max(0, player.dashTime - deltaTime);
    player.invulnerableTime = Math.max(player.invulnerableTime, 0.08);
    createDashTrail(deltaTime);
    if (player.dashTime <= 0) {
      dashEnded = true;
      dashBursts.push({ x: player.x + player.width / 2,
        y: player.y + player.height / 2, life: 0.2, maxLife: 0.2 });
    }
  }

  player.x = clamp(player.x, 8, GAME_WIDTH - player.width - 8);
  player.y = clamp(player.y, 8, GAME_HEIGHT - player.height - 8);

  // Los obstáculos de cada escenario bloquean el movimiento del jugador.
  if (obstacles.some((obstacle) => isColliding(player, obstacle))) {
    const wantedY = player.y;
    player.y = previousY;
    if (obstacles.some(obstacle => isColliding(player, obstacle))) {
      player.x = previousX;
      player.y = wantedY;
      if (obstacles.some(obstacle => isColliding(player, obstacle))) player.y = previousY;
    }
    // Si solo un eje choca, el otro sigue libre: el joystick desliza por paredes.
  }
  if (dashEnded && hasModule("phaseAnchor") && player.dashCount % 2 === 0) createPhaseField();
  if (boss?.name === "Sailor Moon" && boss.entranceTime <= 0 && boss.wellActive) {
    const bx = boss.x + boss.width / 2, by = boss.y + boss.height / 2;
    const px = player.x + player.width / 2, py = player.y + player.height / 2;
    const range = Math.hypot(bx - px, by - py);
    if (range > 12 && range < 175) {
      const oldX = player.x, oldY = player.y;
      player.x = clamp(player.x + (bx - px) / range * 115 * deltaTime, 8, GAME_WIDTH - player.width - 8);
      player.y = clamp(player.y + (by - py) / range * 115 * deltaTime, 8, GAME_HEIGHT - player.height - 8);
      if (obstacles.some(obstacle => isColliding(player, obstacle))) { player.x = oldX; player.y = oldY; }
    }
  }
  player.motionX = (player.x - previousX) / Math.max(deltaTime, 0.001);
  player.motionY = (player.y - previousY) / Math.max(deltaTime, 0.001);

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
  if (player.reactorUnlocked) activePowers.push("REACTOR SERENITY");
  if (hasModule("repulsor")) activePowers.push(`REPULSOR ${Math.ceil(player.repulsorTimer)}s`);
  if (hasModule("nano") && !player.nanoRepairedThisWave)
    activePowers.push(`NANO ${player.nanoKillsThisWave}/${hasSynergy("livingBastion") ? 12 : 16}`);
  if (player.synergies.length) activePowers.push(`${player.synergies.length} SINERGIAS`);
  powerStatus.textContent = activePowers.slice(0, 4).join("  //  ");
}

/** Ataque automático: busca el objetivo más cercano y dispara según la skin. */
function updatePlayerAttack(deltaTime) {
  player.attackTimer -= deltaTime;
  if (player.attackTimer > 0) return;

  const originX = player.x + player.width / 2;
  const originY = player.y + player.height / 2;
  let baseAngle;
  let aimDistance = 360;

  if (aimMode === "manual") {
    if (manualAim.stickActive) {
      baseAngle = Math.atan2(manualAim.vectorY, manualAim.vectorX);
    } else if (manualAim.hasPointer) {
      baseAngle = Math.atan2(manualAim.y - originY, manualAim.x - originX);
      aimDistance = Math.max(70, Math.hypot(manualAim.y - originY, manualAim.x - originX));
    } else if (manualAim.hasDirection) {
      baseAngle = Math.atan2(manualAim.vectorY, manualAim.vectorX);
    } else {
      return;
    }
  } else {
    const target = getNearestTarget();
    if (!target) return;
    const targetX = target.x + target.width / 2;
    const targetY = target.y + target.height / 2;
    baseAngle = Math.atan2(targetY - originY, targetX - originX);
    aimDistance = Math.max(70, Math.hypot(targetY - originY, targetX - originX));
  }

  if (player.skin === "violet") {
    const targetX = originX + Math.cos(baseAngle) * aimDistance;
    const targetY = originY + Math.sin(baseAngle) * aimDistance;
    const normalX = -Math.sin(baseAngle), normalY = Math.cos(baseAngle);
    for (const side of [-1, 1]) {
      const x = originX + normalX * side * 9, y = originY + normalY * side * 9;
      createPlayerProjectile(x, y, Math.atan2(targetY - y, targetX - x),
        1, 7, false, { quantumCycle: player.shotCounter + 1,
          prismRain: hasSynergy("prismRain") && (player.shotCounter + 1) % 8 === 0 });
    }
  } else if (player.skin === "gold") {
    createPlayerProjectile(originX, originY, baseAngle, 1, 14, false,
      { solarSplash: true, prismRain: hasSynergy("prismRain") && (player.shotCounter + 1) % 8 === 0 });
  } else {
    createPlayerProjectile(originX, originY, baseAngle, 1, 8, false,
      { pierce: player.shotCounter % 4 === 3 ? 1 : 0,
        prismRain: hasSynergy("prismRain") && (player.shotCounter + 1) % 8 === 0 });
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
  playSound("playerShot", originX / GAME_WIDTH * 1.6 - 0.8);
}

function getNearestTarget() {
  if (boss) return boss;
  if (chest) return chest;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  let nearest = null;
  let bestDistanceSquared = Infinity;
  for (const group of [threats, obstacles]) {
    for (const target of group) {
      if (target.brain?.mode === "ethereal") continue;
      const dx = target.x - centerX;
      const dy = target.y - centerY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < bestDistanceSquared) { nearest = target; bestDistanceSquared = distanceSquared; }
    }
  }
  return nearest;
}

function createPlayerProjectile(x, y, angle, damageMultiplier, size, isUltimate = false, extras = {}) {
  if (playerProjectiles.length >= (lowPerformance ? 110 : 200)) return;
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
    isUltimate,
    source: isUltimate ? "ultimate" : "normal",
    // Solo la puntería automática permite corregir la trayectoria hacia un jefe.
    guided: aimMode === "auto" && !isUltimate,
    ...extras
  });
}

function applyTacticalMark(target, damage, projectile, commit = true) {
  if (!hasModule("tactical") || projectile.source !== "normal") return damage;
  const active = target.markUntil > combatTime;
  const x = target.x + target.width / 2, y = target.y + target.height / 2;
  if (active) {
    if (commit) {
      target.markUntil = 0;
      target.markCooldownUntil = combatTime + 5;
      moduleFlash("markHit", x, y, Math.max(24, target.width * 0.8), "#ffcf73", 0.4);
    }
    return damage + (hasSynergy("starHunt") ? 1 : 0.5);
  }
  if (commit && (target.markCooldownUntil || 0) <= combatTime) {
    target.markUntil = combatTime + 3;
    moduleFlash("mark", x, y, Math.max(24, target.width * 0.7), "#ffcf73", 0.4);
  }
  return damage;
}

function triggerIonicArc(fromThreat) {
  const origin = EnemyBehavior.center(fromThreat);
  const candidates = threats.filter(threat => threat !== fromThreat && threat.brain?.mode !== "ethereal")
    .map(threat => ({ threat, range: Math.hypot(EnemyBehavior.center(threat).x - origin.x,
      EnemyBehavior.center(threat).y - origin.y) }))
    .filter(candidate => candidate.range <= 120)
    .sort((a, b) => {
      if (hasSynergy("hunterCircuit")) {
        const markedA = a.threat.markUntil > combatTime ? 1 : 0;
        const markedB = b.threat.markUntil > combatTime ? 1 : 0;
        if (markedA !== markedB) return markedB - markedA;
      }
      return a.range - b.range;
    });
  const target = candidates[0]?.threat;
  if (!target) return;
  const c = EnemyBehavior.center(target);
  const consumeMark = hasSynergy("hunterCircuit") && target.markUntil > combatTime;
  if (consumeMark) {
    target.markUntil = 0;
    target.markCooldownUntil = combatTime + 5;
  }
  const damage = 0.5 + (consumeMark ? 0.3 : 0);
  target.health -= damage;
  addDamageNumber(c.x, c.y, damage, "#6deaff");
  attackImpacts.push({ kind: "arc", x: origin.x, y: origin.y, toX: c.x, toY: c.y,
    color: "#6deaff", life: 0.25, maxLife: 0.25 });
  createParticles(c.x, c.y, "#6deaff", 6);
  if (target.health <= 0) {
    const index = threats.indexOf(target);
    if (index < 0) return;
    const daughters = EnemyBehavior.spores(target, threats.length);
    threats.splice(index, 1);
    if (daughters.length) threats.push(...daughters);
    score += GameRules.scoreForEnemy(target.type.shoots);
    runStats.enemiesDestroyed += 1;
    gainUltimate(target.type.shoots ? 13 : 9);
  }
  moduleFlash("ion", origin.x, origin.y, 28, "#6deaff", 0.28);
}

function splitFractal(x, y, excluded) {
  if (!hasModule("fractal")) return;
  const limited = hasSynergy("prismRain");
  if (limited && player.prismDartsCount >= 4) return;
  const targets = threats.filter(threat => threat !== excluded && threat.brain?.mode !== "ethereal")
    .map(threat => ({ threat, range: Math.hypot(EnemyBehavior.center(threat).x - x,
      EnemyBehavior.center(threat).y - y) }))
    .filter(entry => entry.range <= 340)
    .sort((a, b) => a.range - b.range)
    .slice(0, 2);
  for (const { threat } of targets) {
    if (limited && player.prismDartsCount >= 4) break;
    const c = EnemyBehavior.center(threat);
    createPlayerProjectile(x, y, Math.atan2(c.y - y, c.x - x), 0.35, 6, false,
      { source: "fractal", color: "#f9adff", guided: false, targetThreat: threat });
    if (limited) player.prismDartsCount += 1;
  }
  if (targets.length) moduleFlash("fractal", x, y, 34, "#f9adff", 0.32);
}

function hasModule(id) { return player?.upgrades.includes(id) ?? false; }
function hasSynergy(id) { return player?.synergies.includes(id) ?? false; }
function isSynergyUnlocked(id) {
  if (id === "nova") return player?.synergyUnlocked ?? false;
  if (id === "hypersonic") return player?.shockwaveUnlocked ?? false;
  if (id === "aegis") return player?.aegisUnlocked ?? false;
  if (id === "reactor") return player?.reactorUnlocked ?? false;
  return hasSynergy(id);
}

function announceModule(title, detail, color = "#43ff9b") {
  moduleToast.textContent = `${title} · ${detail}`;
  moduleToast.style.setProperty("--toast-color", color);
  moduleToastTime = 3.2;
  moduleToast.classList.add("visible");
}

function moduleFlash(kind, x, y, radius, color, life = 0.42) {
  if (moduleFlashes.length >= (lowPerformance ? 10 : 28)) moduleFlashes.shift();
  moduleFlashes.push({ kind, x, y, radius, color, life, maxLife: life });
}

function repulseThreats(x, y, radius, distance = 58) {
  for (const threat of threats) {
    if (threat.brain?.mode === "ethereal") continue;
    const center = EnemyBehavior.center(threat);
    const dx = center.x - x, dy = center.y - y;
    const range = Math.hypot(dx, dy);
    if (range > radius) continue;
    const scale = (1 - range / radius) * distance / Math.max(range, 1);
    threat.x = clamp(threat.x + dx * scale, 0, GAME_WIDTH - threat.width);
    threat.y = clamp(threat.y + dy * scale, 0, GAME_HEIGHT - threat.height);
    threat.pulseTime = Math.max(threat.pulseTime || 0, 0.22);
  }
}

function createPhaseField() {
  const enhanced = hasSynergy("phaseVortex");
  const field = { x: player.x + player.width / 2, y: player.y + player.height / 2,
    radius: enhanced ? 120 : 90, life: enhanced ? 1.6 : 1.2,
    maxLife: enhanced ? 1.6 : 1.2, vortex: enhanced, playerExited: false };
  phaseFields.push(field);
  if (phaseFields.length > 5) phaseFields.shift();
  moduleFlash("phase", field.x, field.y, field.radius, "#a855f7", 0.35);
}

function updateCombatModules(dt) {
  player.ionicDroneCooldown = Math.max(0, player.ionicDroneCooldown - dt);
  player.phaseShieldCooldown = Math.max(0, player.phaseShieldCooldown - dt);
  player.prismDartsWindow += dt;
  if (player.prismDartsWindow >= 1) {
    player.prismDartsWindow = 0;
    player.prismDartsCount = 0;
  }
  for (let i = phaseFields.length - 1; i >= 0; i -= 1) {
    const field = phaseFields[i];
    field.life -= dt;
    const centerX = player.x + player.width / 2, centerY = player.y + player.height / 2;
    const inside = Math.hypot(centerX - field.x, centerY - field.y) <= field.radius;
    if (!inside) field.playerExited = true;
    if (inside && field.playerExited && hasSynergy("rescueMantle") &&
      player.phaseShieldCooldown <= 0 && field.life > 0) {
      player.shieldTime = Math.max(player.shieldTime, 1.5);
      player.phaseShieldCooldown = 20;
      field.playerExited = false;
      moduleFlash("shield", field.x, field.y, 56, "#43ff9b", 0.5);
      announceModule("MANTO DE RESCATE", "ESCUDO 1,5 s", "#43ff9b");
    }
    if (field.life > 0) continue;
    if (field.vortex) {
      repulseThreats(field.x, field.y, field.radius, 48);
      moduleFlash("repulse", field.x, field.y, field.radius, "#a855f7", 0.4);
    }
    phaseFields.splice(i, 1);
  }
  for (const flash of moduleFlashes) flash.life -= dt;
  moduleFlashes = moduleFlashes.filter(flash => flash.life > 0);

  if (hasModule("repulsor")) {
    player.repulsorTimer -= dt;
    if (player.repulsorTimer <= 0) {
      const x = player.x + player.width / 2, y = player.y + player.height / 2;
      repulseThreats(x, y, 100);
      moduleFlash("repulse", x, y, 100, "#68e5ff", 0.55);
      createParticles(x, y, "#68e5ff", 8);
      player.repulsorTimer = 8;
    }
  }

  if (!hasModule("drones")) return;
  player.droneTimer -= dt;
  if (player.droneTimer > 0) return;
  const target = boss || threats.filter(threat => threat.brain?.mode !== "ethereal")
    .sort((a, b) => EnemyBehavior.distance(a, player) - EnemyBehavior.distance(b, player))[0];
  if (!target) { player.droneTimer = 0.25; return; }
  const center = EnemyBehavior.center(target);
  for (const side of [-1, 1]) {
    const x = player.x + player.width / 2 + side * 34;
    const y = player.y + player.height / 2 + Math.sin(combatTime * 3 + side) * 17;
    const angle = Math.atan2(center.y - y, center.x - x);
    createPlayerProjectile(x, y, angle, 0.6, 7, false,
      { source: "drone", color: side < 0 ? "#43ff9b" : "#a9f5ff",
        guided: !!boss, targetThreat: boss ? null : target });
    moduleFlash("muzzle", x, y, 13, side < 0 ? "#43ff9b" : "#a9f5ff", 0.2);
  }
  player.droneTimer = 2.6;
  playSound("playerShot", (player.x + player.width / 2) / GAME_WIDTH * 1.6 - 0.8);
}

function updateNanoSwarm() {
  if (!hasModule("nano")) return;
  if (player.nanoWaveLevel !== level) {
    player.nanoWaveLevel = level;
    player.nanoKillsThisWave = 0;
    player.nanoRepairedThisWave = false;
  }
  const newKills = Math.max(0, runStats.enemiesDestroyed - player.nanoObservedKills);
  player.nanoObservedKills = runStats.enemiesDestroyed;
  player.nanoKillsThisWave += newKills;
  const threshold = hasSynergy("livingBastion") ? 12 : 16;
  if (player.nanoRepairedThisWave || player.nanoKillsThisWave < threshold) return;
  player.nanoRepairedThisWave = true;
  const x = player.x + player.width / 2, y = player.y + player.height / 2;
  if (lives < player.maxLives) {
    lives += 1;
    announceModule("NANOENJAMBRE", "+1 VIDA", "#43ff9b");
  } else if (hasSynergy("livingBastion")) {
    player.shieldTime = Math.max(player.shieldTime, 1);
    announceModule("BASTIÓN VIVO", "ESCUDO 1 s", "#43ff9b");
  }
  moduleFlash("repair", x, y, 62, "#43ff9b", 0.8);
  createParticles(x, y, "#43ff9b", 18);
  playSound("powerUp");
  updateHud();
}

function damageNearbyThreats(x, y, radius, damage, excluded, limit = Infinity) {
  const nearby = threats.filter(threat => threat !== excluded && threat.brain?.mode !== "ethereal")
    .map(threat => ({ threat, range: Math.hypot(EnemyBehavior.center(threat).x - x,
      EnemyBehavior.center(threat).y - y) }))
    .filter(entry => entry.range <= radius)
    .sort((a, b) => a.range - b.range)
    .slice(0, limit);
  for (const { threat } of nearby) {
    if (threat === excluded || threat.brain?.mode === "ethereal") continue;
    const c = EnemyBehavior.center(threat);
    if (limit === 1) attackImpacts.push({ kind: "arc", x, y, toX: c.x,
      toY: c.y, life: 0.2, maxLife: 0.2 });
    threat.health -= damage;
    createParticles(c.x, c.y, threat.type.color, 4);
    if (threat.health <= 0) {
      const daughters = EnemyBehavior.spores(threat, threats.length);
      const index = threats.indexOf(threat);
      if (index < 0) continue;
      threats.splice(index, 1);
      if (daughters.length) threats.push(...daughters);
      score += GameRules.scoreForEnemy(threat.type.shoots);
      runStats.enemiesDestroyed += 1;
      gainUltimate(threat.type.shoots ? 13 : 9);
    }
  }
}

function updatePlayerProjectiles(deltaTime) {
  for (let i = playerProjectiles.length - 1; i >= 0; i -= 1) {
    const projectile = playerProjectiles[i];

    if (projectile.targetThreat && threats.includes(projectile.targetThreat)) {
      const target = EnemyBehavior.center(projectile.targetThreat);
      const desired = Math.atan2(target.y - projectile.y, target.x - projectile.x);
      const current = Math.atan2(projectile.velocityY, projectile.velocityX);
      const difference = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
      const speed = Math.hypot(projectile.velocityX, projectile.velocityY);
      projectile.velocityX = Math.cos(current + difference * Math.min(1, deltaTime * 6)) * speed;
      projectile.velocityY = Math.sin(current + difference * Math.min(1, deltaTime * 6)) * speed;
    }

    // Guía ligera contra jefes móviles para que el disparo conserve su objetivo.
    if (boss && projectile.guided) {
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
    let impactEffect = null;

    if (chest && isColliding(projectile, chest)) {
      chest.health -= projectile.damage;
      createParticles(projectile.x, projectile.y, "#ffd166", 4);
      playerProjectiles.splice(i, 1);
      consumed = true;
      if (chest.health <= 0) openChest();
    }

    if (consumed) continue;

    if (boss && boss.entranceTime <= 0 && isColliding(projectile, boss)) {
      let requestedDamage = applyTacticalMark(boss, projectile.damage, projectile, false);
      if (projectile.isUltimate) {
        requestedDamage = Math.min(requestedDamage, player.ultimateBossDamageRemaining);
      }
      const appliedDamage = applyDamageToBoss(requestedDamage);
      if (appliedDamage > 0) applyTacticalMark(boss, projectile.damage, projectile);
      addDamageNumber(projectile.x, projectile.y, appliedDamage, projectile.color);
      if (projectile.isUltimate) {
        player.ultimateBossDamageRemaining = Math.max(0, player.ultimateBossDamageRemaining - appliedDamage);
      }
      createParticles(projectile.x, projectile.y, projectile.color, 3);
      if (appliedDamage > 0 && projectile.source === "normal") {
        if (projectile.prismRain) {
          const c = EnemyBehavior.center(boss);
          splitFractal(c.x, c.y, boss);
        }
        if (hasModule("ionic")) {
          player.ionicHits += 1;
          if (player.ionicHits % 6 === 0) triggerIonicArc(boss);
        }
      } else if (appliedDamage > 0 && projectile.source === "drone" &&
        hasSynergy("ionicSwarm") && player.ionicDroneCooldown <= 0) {
        player.ionicDroneCooldown = 2.6;
        triggerIonicArc(boss);
      }
      playerProjectiles.splice(i, 1);
      consumed = true;
      if (boss.health <= 0) {
        if (projectile.source === "drone" && hasSynergy("livingConstellation")) gainUltimate(3);
        defeatBoss();
      }
    }

    if (consumed) continue;

    for (let obstacleIndex = obstacles.length - 1; obstacleIndex >= 0; obstacleIndex -= 1) {
      const obstacle = obstacles[obstacleIndex];
      if (!isColliding(projectile, obstacle)) continue;
      obstacle.health -= projectile.damage;
      addDamageNumber(projectile.x, projectile.y, projectile.damage, scenarioThemes[scenarioIndex].accent);
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
      if (threat.type.icon === "phantom" && threat.brain?.mode === "ethereal") continue;
      if (projectile.hitThreats?.has(threat)) continue;
      const forwardX = threat.brain?.baseX ?? threat.velocityX;
      const forwardY = threat.brain?.baseY ?? threat.velocityY;
      const impactFromFront = threat.type.icon === "tank" &&
        (projectile.x + projectile.width / 2 - threat.x - threat.width / 2) * forwardX +
        (projectile.y + projectile.height / 2 - threat.y - threat.height / 2) * forwardY > 0;
      const markedDamage = applyTacticalMark(threat, projectile.damage, projectile);
      const hitDamage = impactFromFront ? markedDamage * 0.7 : markedDamage;
      threat.health -= hitDamage;
      addDamageNumber(projectile.x, projectile.y, hitDamage, projectile.color);
      if (projectile.solarSplash) {
        const c = EnemyBehavior.center(threat);
        impactEffect = { x: c.x, y: c.y, radius: 45, damage: projectile.damage * 0.3, excluded: threat };
      }
      if (projectile.quantumCycle) {
        if (threat.quantumCycle === projectile.quantumCycle) {
          const c = EnemyBehavior.center(threat);
          impactEffect = { x: c.x, y: c.y, radius: 75, damage: 0.55, excluded: threat, limit: 1 };
          threat.quantumCycle = 0;
          createParticles(c.x, c.y, "#00f0ff", 8);
        } else threat.quantumCycle = projectile.quantumCycle;
      }
      if (projectile.pierce > 0) {
        projectile.pierce -= 1;
        (projectile.hitThreats ||= new Set()).add(threat);
      } else {
        playerProjectiles.splice(i, 1);
        consumed = true;
      }
      const defeatedByShot = threat.health <= 0;
      if (projectile.source === "normal" && hasModule("fractal") &&
        (defeatedByShot || projectile.prismRain)) {
        const c = EnemyBehavior.center(threat);
        splitFractal(c.x, c.y, threat);
      }
      if (threat.health <= 0) {
        const daughters = EnemyBehavior.spores(threat, threats.length);
        createParticles(threat.x, threat.y, threat.type.color, 12);
        threats.splice(threatIndex, 1);
        if (daughters.length) threats.push(...daughters);
        score += GameRules.scoreForEnemy(threat.type.shoots);
        runStats.enemiesDestroyed += 1;
        gainUltimate(threat.type.behavior === "tank" ? 18 : threat.type.shoots ? 13 : 9);
        if (projectile.source === "drone" && hasSynergy("livingConstellation")) {
          gainUltimate(3);
          player.droneKills += 1;
        }
      }
      if (projectile.source === "normal" && hasModule("ionic")) {
        player.ionicHits += 1;
        if (player.ionicHits % 6 === 0) triggerIonicArc(threat);
      } else if (projectile.source === "drone" && hasSynergy("ionicSwarm") &&
        player.ionicDroneCooldown <= 0) {
        player.ionicDroneCooldown = 2.6;
        triggerIonicArc(threat);
      }
      break;
    }

    if (impactEffect) damageNearbyThreats(impactEffect.x, impactEffect.y,
      impactEffect.radius, impactEffect.damage, impactEffect.excluded, impactEffect.limit);
    if (impactEffect?.limit !== 1 && impactEffect) attackImpacts.push({ kind: "splash",
      x: impactEffect.x, y: impactEffect.y, radius: impactEffect.radius,
      life: 0.22, maxLife: 0.22 });

    if (!consumed && (
      projectile.x < -40 || projectile.x > GAME_WIDTH + 40 ||
      projectile.y < -40 || projectile.y > GAME_HEIGHT + 40
    )) playerProjectiles.splice(i, 1);
  }
}

function updateThreats(deltaTime) {
  const globalSlowFactor = player.slowTime > 0 ? 0.48 : 1;

  for (let i = threats.length - 1; i >= 0; i -= 1) {
    const threat = threats[i];
    const centerBeforeMove = EnemyBehavior.center(threat);
    const inPhaseField = phaseFields.some(field =>
      Math.hypot(centerBeforeMove.x - field.x, centerBeforeMove.y - field.y) < field.radius);
    const slowFactor = inPhaseField ? Math.min(globalSlowFactor, 0.48) : globalSlowFactor;
    const oldMode = threat.brain?.mode;
    const oldX = threat.x + threat.width / 2, oldY = threat.y + threat.height / 2;
    const event = EnemyBehavior.step(threat, player, deltaTime, isInsideArena);
    if (oldMode === "echo" && threat.brain?.mode === "travel") {
      createParticles(oldX, oldY, threat.type.color, lowPerformance ? 5 : 9);
      createParticles(threat.x + threat.width / 2, threat.y + threat.height / 2, threat.type.color, 14);
      playSound("glitchShift", (threat.x + threat.width / 2) / GAME_WIDTH * 1.6 - 0.8);
    }
    if (oldMode !== threat.brain?.mode &&
        ["scan", "mark", "sling", "echo", "lock"].includes(threat.brain?.mode))
      playSound("warning", (threat.x + threat.width / 2) / GAME_WIDTH * 1.6 - 0.8);
    if (event.stomp && player.shieldTime <= 0 && player.invulnerableTime <= 0 && EnemyBehavior.distance(threat, player) < 94) {
      damagePlayer(threat.x, threat.y, threat.type.color);
    }

    if (!EnemyBehavior.advance(threat, deltaTime, slowFactor)) {
      threat.y += threat.velocityY * slowFactor * deltaTime;
      threat.x += threat.velocityX * slowFactor * deltaTime;
    }
    threat.rotation += threat.rotationSpeed * deltaTime;
    threat.sizePulse += threat.sizePulseSpeed * deltaTime;
    threat.pulseTime = Math.max(0, (threat.pulseTime || 0) - deltaTime);

    if (threat.type.shoots) {
      threat.shotTimer -= deltaTime;
      if (threat.shotTimer <= 0 && isInsideArena(threat)) {
        const origin = EnemyBehavior.center(threat);
        const brain = EnemyBehavior.initialize(threat);
        const targetX = brain.mode === "lock" ? brain.targetX : player.x + player.width / 2;
        const targetY = brain.mode === "lock" ? brain.targetY : player.y + player.height / 2;
        spawnRawEnemyProjectile(origin.x, origin.y, 265, Math.atan2(targetY - origin.y, targetX - origin.x), threat.type.color);
        brain.mode = "travel";
        threat.shotTimer = Math.max(1.35, 2.05 - level * 0.025);
        threat.shotInterval = threat.shotTimer;
        playSound("enemyShot");
      }
    }

    if (threat.type.radialShoots) {
      threat.shotTimer -= deltaTime;
      if (threat.shotTimer <= 0 && isInsideArena(threat)) {
        const brain = EnemyBehavior.initialize(threat);
        const center = EnemyBehavior.center(threat);
        const playerCenter = EnemyBehavior.center(player);
        const radius = Math.hypot(playerCenter.x - center.x, playerCenter.y - center.y);
        const relativeAngle = Math.atan2(playerCenter.y - center.y, playerCenter.x - center.x) - threat.rotation;
        const playerLane = ((Math.round(relativeAngle / (Math.PI / 4)) % 8) + 8) % 8;
        if (radius < 108 && playerLane !== brain.gapIndex &&
            player.shieldTime <= 0 && player.invulnerableTime <= 0) {
          damagePlayer(center.x, center.y, threat.type.color);
        }
        for (let shot = 0; shot < 8; shot += 1) {
          if (shot === brain.gapIndex) continue;
          spawnRawEnemyProjectile(
            center.x,
            center.y,
            225,
            (shot / 8) * Math.PI * 2 + threat.rotation,
            threat.type.color,
            18
          );
        }
        threat.pulseTime = 0.36;
        brain.gapIndex = (brain.gapIndex + 3) % 8;
        brain.cycle++;
        threat.shotTimer = 2.15;
        threat.shotInterval = threat.shotTimer;
        createParticles(center.x, center.y, "#ffcf73", lowPerformance ? 8 : 18);
        playSound("minePulse", center.x / GAME_WIDTH * 1.6 - 0.8);
      }
    }

    // Cada amenaza cambia suavemente de tamaño mientras desciende.
    const animatedSize = threat.baseSize * (1 + Math.sin(threat.sizePulse) * 0.12);
    const sizeDifference = animatedSize - threat.width;
    threat.x -= sizeDifference / 2;
    threat.y -= sizeDifference / 2;
    threat.width = animatedSize;
    threat.height = animatedSize;

    if (threat.brain?.mode !== "ethereal" && isColliding(player, threat)) {
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
    color: "#ffd166",
    returnPass: false
  };
  playSound("warning");
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
        velocityX: Math.cos(angle) * (cometWarning.returnPass ? 730 : 820),
        velocityY: Math.sin(angle) * (cometWarning.returnPass ? 730 : 820),
        angle,
        returnPass: cometWarning.returnPass
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
      scheduleCometReturn(comet);
      continue;
    }
    if (comet.x < -120 || comet.x > GAME_WIDTH + 120 || comet.y < -120 || comet.y > GAME_HEIGHT + 120) {
      comets.splice(index, 1);
      scheduleCometReturn(comet);
    }
  }
}

function scheduleCometReturn(comet) {
  if (comet.returnPass || cometWarning) return;
  const fromRight = comet.velocityX > 0;
  const guideY = clamp(comet.y + comet.height / 2 + (comet.velocityY > 0 ? -75 : 75), 80, GAME_HEIGHT - 100);
  cometWarning = {
    time: 1.2,
    startX: fromRight ? GAME_WIDTH + 70 : -70,
    startY: guideY,
    endX: fromRight ? -70 : GAME_WIDTH + 70,
    endY: clamp(guideY + (fromRight ? -45 : 45), 80, GAME_HEIGHT - 100),
    color: "#ffd166",
    returnPass: true
  };
  playSound("warning");
}

function spawnEnemyProjectile(x, y, speed, angleOffset = 0, color = "#ff5f5f") {
  if (enemyProjectiles.length >= (lowPerformance ? 130 : 260)) return;
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

function spawnRawEnemyProjectile(x, y, speed, angle, color, size = 12) {
  if (enemyProjectiles.length >= (lowPerformance ? 130 : 260)) return;
  enemyProjectiles.push({
    x: x - size / 2,
    y: y - size / 2,
    width: size,
    height: size,
    radius: size / 2,
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
    shotInterval: 1.2,
    phase: 0,
    entranceTime: definition.final ? 2.8 : 2.3,
    entranceDuration: definition.final ? 2.8 : 2.3,
    entranceElapsed: 0,
    attackCycle: 0,
    dashMode: "patrol",
    dashTimer: 0,
    dashCooldown: 1.9,
    dashFromX: 0,
    dashMarkX: 0,
    crystalTimer: 0,
    crystalCooldown: 2.4,
    wellActive: false,
    voidMark: null,
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
  const previousX = boss.x, previousY = boss.y;
  const announcedRush = boss.name === "Sailor Mars" && boss.dashMode === "rush";

  if (boss.final && !boss.phaseTwo && boss.health <= boss.maxHealth * 0.5) {
    activateFinalBossPhaseTwo();
  }

  if (boss.name === "Sailor Moon") {
    boss.x = GAME_WIDTH / 2 - boss.width / 2 + Math.sin(boss.phase * 0.95) * 210;
    boss.y = boss.targetY + Math.sin(boss.phase * 1.9) * 9;
    boss.wellActive = boss.phase % 3.2 < 1.5;
  } else if (boss.name === "Sailor Mars") {
    boss.dashCooldown = Math.max(0, boss.dashCooldown - deltaTime);
    if (boss.dashMode === "patrol") {
      boss.x = GAME_WIDTH / 2 - boss.width / 2 + Math.sin(boss.phase * 1.05) * 210;
      if (boss.dashCooldown <= 0) {
        boss.dashMarkX = clamp(player.x + player.width / 2 - boss.width / 2, 35, GAME_WIDTH - boss.width - 35);
        boss.dashFromX = boss.x; boss.dashMode = "warn"; boss.dashTimer = 0.58;
      }
    } else if (boss.dashMode === "warn") {
      boss.dashTimer -= deltaTime;
      if (boss.dashTimer <= 0) { boss.dashMode = "rush"; boss.dashTimer = 0.36; }
    } else {
      boss.dashTimer -= deltaTime;
      const progress = clamp(1 - boss.dashTimer / 0.36, 0, 1);
      boss.x = boss.dashFromX + (boss.dashMarkX - boss.dashFromX) * (1 - (1 - progress) ** 3);
      screenShake = Math.max(screenShake, 2);
      if (boss.dashTimer <= 0) { boss.dashMode = "patrol"; boss.dashCooldown = 2.9; boss.shotTimer = Math.min(boss.shotTimer, 0.08); }
    }
  } else if (boss.name === "Sailor Venus") {
    boss.x = GAME_WIDTH / 2 - boss.width / 2 + Math.sin(boss.phase * 1.25) * 230;
    boss.y = boss.targetY + Math.cos(boss.phase * 1.25) * 26;
  } else if (boss.name === "Sailor Mercury") {
    const sweep = GAME_WIDTH - boss.width - 90;
    const travel = (boss.phase * 150) % (sweep * 2);
    boss.x = 45 + (travel < sweep ? travel : sweep * 2 - travel);
    boss.y = boss.targetY + Math.abs(Math.sin(boss.phase * 1.5)) * 18;
    boss.crystalCooldown = Math.max(0, boss.crystalCooldown - deltaTime);
    boss.crystalTimer = Math.max(0, boss.crystalTimer - deltaTime);
    if (boss.crystalCooldown <= 0 && boss.crystalTimer <= 0) {
      boss.crystalTimer = 0.72; boss.crystalCooldown = 3.9;
      boss.shotTimer = Math.max(boss.shotTimer, 0.72);
    }
  } else {
    boss.x = GAME_WIDTH / 2 - boss.width / 2 + Math.sin(boss.phase * 1.55) * 270;
    boss.y = boss.targetY + Math.sin(boss.phase * 2.2) * 12;
  }
  // The patrol resumes from the visible position after entrance or rush.
  if (!announcedRush && deltaTime > 0) {
    const dx = boss.x - previousX, dy = boss.y - previousY;
    const distance = Math.hypot(dx, dy);
    const maximum = (boss.final ? 430 : 350) * deltaTime;
    if (distance > maximum) {
      boss.x = previousX + dx / distance * maximum;
      boss.y = previousY + dy / distance * maximum;
    }
  }
  if (boss.voidMark) {
    boss.voidMark.time -= deltaTime;
    if (boss.voidMark.time <= 0) {
      const mark = boss.voidMark;
      if (Math.hypot(player.x + player.width / 2 - mark.x, player.y + player.height / 2 - mark.y) < 52
          && player.shieldTime <= 0 && player.invulnerableTime <= 0) damagePlayer(mark.x, mark.y, boss.color);
      createParticles(mark.x, mark.y, "#ff003c", 20);
      boss.voidMark = null;
    }
  }
  boss.shotTimer -= deltaTime;

  if (isColliding(player, boss) && player.invulnerableTime <= 0 && player.shieldTime <= 0) {
    damagePlayer(player.x, player.y, "#ff2d75");
  }

  if (boss.shotTimer <= 0 && boss.crystalTimer <= 0 && boss.dashMode !== "warn" && boss.dashMode !== "rush") {
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

  boss.shotInterval = boss.shotTimer;
  boss.attackCycle += 1;
  if (boss.final && boss.phaseTwo && boss.attackCycle % 3 === 0 && !boss.voidMark) {
    boss.voidMark = {
      x: clamp(player.x + player.width / 2 + (player.motionX || 0) * 0.32, 52, GAME_WIDTH - 52),
      y: clamp(player.y + player.height / 2 + (player.motionY || 0) * 0.32, 105, GAME_HEIGHT - 52),
      time: 1.05, duration: 1.05
    };
  }
}

function activateFinalBossPhaseTwo() {
  boss.phaseTwo = true;
  boss.color = "#ff003c";
  boss.shotTimer = 0.2;
  boss.shotInterval = 0.2;
  bossName.textContent = "☠ YACERAMI · FASE 2";
  incomingBossName.textContent = "YACERAMI DESATADO";
  screenShake = 16;
  createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, "#ff003c", 90);
  startMusic();
  playSound("boss");
}

/**
 * Limita todo el daño combinado a 20% de la vida máxima dentro de cualquier
 * ventana móvil de un segundo. Incluye disparos normales, dash y Ultimate.
 */
function applyDamageToBoss(requestedDamage) {
  if (!boss || requestedDamage <= 0) return 0;
  if (boss.name === "Sailor Mercury" && boss.crystalTimer > 0) {
    createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, "#a9f5ff", 3);
    return 0;
  }
  const budget = GameRules.bossDamageBudget(boss.maxHealth, boss.damageHistory, combatTime);
  boss.damageHistory = budget.recent;
  const availableDamage = budget.available;
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
  score += GameRules.scoreForBoss(level, defeatedBoss.final);
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
    startMusic();
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
  hitFeedbackTime = 0.8;
  hitFeedback.classList.add("visible");
  canvas.parentElement.classList.add("player-hit");
  setTimeout(() => canvas.parentElement.classList.remove("player-hit"), 420);
  createParticles(x, y, color, 22);
  playSound("collision");
  if (lives <= 0) endGame();
}

/** Activa un desplazamiento rápido. Solo funciona una vez cada 6 segundos. */
function useDash() {
  if (gameState !== "playing" || player.dashCooldown > 0 || player.dashTime > 0) return;

  let directionX = 0;
  let directionY = 0;
  if (isActionHeld("left")) directionX -= 1;
  if (isActionHeld("right")) directionX += 1;
  if (isActionHeld("up")) directionY -= 1;
  if (isActionHeld("down")) directionY += 1;
  directionX += touchMovement.x;
  directionY += touchMovement.y;

  // Si no hay una dirección presionada, el dash se realiza hacia arriba.
  if (directionX === 0 && directionY === 0) directionY = -1;
  const length = Math.hypot(directionX, directionY) || 1;
  player.dashX = directionX / length;
  player.dashY = directionY / length;
  player.dashTime = 0.22;
  player.dashCount += 1;
  dashEchoes = [];
  dashEchoTimer = 0;
  dashBursts.push({ x: player.x + player.width / 2, y: player.y + player.height / 2,
    life: 0.2, maxLife: 0.2 });
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
  const multiplier = (player.reactorUnlocked ? 1.5 : 1) * (hasModule("condenser") ? 1.2 : 1);
  player.ultimateEnergy = Math.min(player.ultimateMax, player.ultimateEnergy + amount * multiplier);
}

function useUltimate() {
  if (gameState !== "playing" || player.ultimateEnergy < player.ultimateMax) return;
  player.ultimateEnergy = 0;
  // La Ultimate puede infligir hasta 25% de la vida máxima del jefe.
  // Sigue respetando el límite general de 20% por cualquier segundo móvil.
  player.ultimateBossDamageRemaining = boss ? GameRules.ultimateBossBudget(boss.maxHealth) : 0;
  ultimateBossPulse = null;
  runStats.ultimatesUsed += 1;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  if (player.skin === "gold") {
    player.invulnerableTime = Math.max(player.invulnerableTime, 1.05);
    ultimateEffects.push({ kind: "solar", x: centerX, y: centerY, age: 0,
      duration: 1.05, radius: Math.hypot(GAME_WIDTH, GAME_HEIGHT), hit: new Set(), bossHit: false });
    createParticles(centerX, centerY, "#ffd166", 35);
    screenShake = Math.max(screenShake, 8);
  } else {
    if (player.skin === "violet") {
      player.shieldTime = Math.max(player.shieldTime, 4);
      player.slowTime = Math.max(player.slowTime, 2);
      for (const delay of [0, 0.38]) ultimateEffects.push({ kind: "phase", x: centerX, y: centerY,
        delay, age: 0, duration: 0.65, radius: 850, hit: new Set(), bossHit: false });
    } else {
      const target = aimMode === "auto" ? getNearestTarget() : null;
      const angle = aimMode === "manual" && (manualAim.hasDirection || manualAim.stickActive)
        ? Math.atan2(manualAim.vectorY, manualAim.vectorX)
        : aimMode === "manual" && manualAim.hasPointer
          ? Math.atan2(manualAim.y - centerY, manualAim.x - centerX)
          : target ? Math.atan2(target.y + target.height / 2 - centerY,
            target.x + target.width / 2 - centerX) : -Math.PI / 2;
      ultimateEffects.push({ kind: "nexo", x: centerX, y: centerY, angle, age: 0, burst: 0 });
    }
    createParticles(centerX, centerY, getSkinColors().primary, 25);
  }

  playSound("ultimate");
}

function updateUltimateEffects(dt) {
  for (let i = ultimateEffects.length - 1; i >= 0; i -= 1) {
    const effect = ultimateEffects[i];
    effect.age += dt;
    if (effect.kind === "nexo") {
      while (effect.burst < 3 && effect.age >= effect.burst * 0.28) {
        for (let shot = -3; shot <= 3; shot += 1) {
          createPlayerProjectile(effect.x, effect.y,
            effect.angle + shot * 0.095, 3, 9, true, { pierce: 1 });
        }
        effect.burst += 1;
        playSound("ultimatePulse");
      }
      if (effect.age > 1.05) ultimateEffects.splice(i, 1);
      continue;
    }
    const travel = effect.kind === "solar" ? Math.max(0, effect.age - 0.35) / 0.7
      : Math.max(0, effect.age - effect.delay) / effect.duration;
    const range = effect.radius * Math.min(1, travel);
    if (travel > 0) {
      for (let index = threats.length - 1; index >= 0; index -= 1) {
        const threat = threats[index], c = EnemyBehavior.center(threat);
        if (effect.hit.has(threat) || Math.hypot(c.x - effect.x, c.y - effect.y) > range) continue;
        effect.hit.add(threat);
        if (effect.kind === "phase" && threat.brain?.mode === "ethereal") continue;
        if (effect.kind === "solar") threat.health = 0;
        else threat.health -= player.projectileDamage * 4;
        createParticles(c.x, c.y, effect.kind === "solar" ? "#ffd166" : "#c084fc", 9);
        if (threat.health <= 0) {
          const daughters = effect.kind === "solar" ? [] : EnemyBehavior.spores(threat, threats.length);
          threats.splice(index, 1);
          if (daughters.length) threats.push(...daughters);
          score += effect.kind === "solar" ? 55 : GameRules.scoreForEnemy(threat.type.shoots);
          runStats.enemiesDestroyed += 1;
          if (effect.kind === "phase") gainUltimate(threat.type.shoots ? 13 : 9);
        }
      }
      enemyProjectiles = enemyProjectiles.filter(projectile =>
        Math.hypot(projectile.x + projectile.radius - effect.x,
          projectile.y + projectile.radius - effect.y) > range);
      if (effect.kind === "solar") obstacles = obstacles.filter(obstacle => {
        const cX = obstacle.x + obstacle.width / 2, cY = obstacle.y + obstacle.height / 2;
        if (Math.hypot(cX - effect.x, cY - effect.y) > range) return true;
        createParticles(cX, cY, "#ffd166", 8); return false;
      });
      if (boss && boss.entranceTime <= 0 && !effect.bossHit &&
          Math.hypot(boss.x + boss.width / 2 - effect.x, boss.y + boss.height / 2 - effect.y) <= range) {
        effect.bossHit = true;
        const desired = effect.kind === "solar" ? player.ultimateBossDamageRemaining
          : Math.min(player.projectileDamage * 8, player.ultimateBossDamageRemaining);
        const dealt = applyDamageToBoss(desired);
        player.ultimateBossDamageRemaining = Math.max(0, player.ultimateBossDamageRemaining - dealt);
        addDamageNumber(boss.x + boss.width / 2, boss.y, dealt,
          effect.kind === "solar" ? "#ffd166" : "#c084fc");
        if (effect.kind === "solar" && desired > dealt && boss.health > 0)
          ultimateBossPulse = { target: boss, remaining: desired - dealt, delay: 1.05, life: 4 };
        if (boss.health <= 0) defeatBoss();
      }
    }
    if (travel > 1.2) ultimateEffects.splice(i, 1);
  }
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
    category: "attack",
    accent: "#6deaff",
    description: "Dispara 22% más rápido.",
    apply: () => { player.attackInterval *= 0.78; }
  },
  {
    id: "damage",
    icon: "✦",
    name: "Pulso ofensivo",
    category: "attack",
    accent: "#ffcf73",
    description: "Aumenta el daño de cada disparo.",
    apply: () => { player.projectileDamage += 0.7; }
  },
  {
    id: "speed",
    icon: "➤",
    name: "Propulsores",
    category: "mobility",
    accent: "#a855f7",
    description: "Aumenta 15% la velocidad de movimiento.",
    apply: () => { player.speed *= 1.15; }
  },
  {
    id: "armor",
    icon: "♥",
    name: "Núcleo reforzado",
    category: "defense",
    accent: "#43ff9b",
    description: "Obtén una vida máxima adicional.",
    apply: () => { player.maxLives += 1; lives = Math.min(player.maxLives, lives + 1); }
  },
  {
    id: "dash",
    icon: "◇",
    name: "Dash cuántico",
    category: "mobility",
    accent: "#a855f7",
    description: "Reduce un segundo la recarga del dash.",
    apply: () => { player.dashCooldownMax = Math.max(3, player.dashCooldownMax - 1); }
  },
  {
    id: "shield",
    icon: "⬡",
    name: "Escudo Firefly",
    category: "defense",
    accent: "#43ff9b",
    description: "Activa un escudo durante 10 segundos.",
    apply: () => { player.shieldTime = 10; }
  },
  { id: "drones", icon: "✣", name: "Drones escolta", category: "attack",
    accent: "#43ff9b", oneTime: true,
    description: "Dos drones orbitan y disparan cada 2,6 s con 60% de daño.",
    apply: () => { player.droneTimer = 0.4; } },
  { id: "ionic", icon: "ϟ", name: "Bobina iónica", category: "attack",
    accent: "#6deaff", oneTime: true,
    description: "Cada sexto impacto salta a otro enemigo a 120 px.",
    apply: () => { player.ionicHits = 0; } },
  { id: "tactical", icon: "⌖", name: "Marcador táctico", category: "attack",
    accent: "#ffcf73", oneTime: true,
    description: "Marca durante 3 s; el siguiente disparo gana +0,5 de daño.",
    apply: () => {} },
  { id: "fractal", icon: "◇", name: "Prisma fractal", category: "attack",
    accent: "#f9adff", oneTime: true,
    description: "Una baja divide el disparo en dos dardos de 35% de daño.",
    apply: () => {} },
  { id: "condenser", icon: "✦", name: "Condensador Ultimate", category: "mobility",
    accent: "#ffe285", oneTime: true,
    description: "+20% de energía por bajas y recogidas, sin superar el máximo.",
    apply: () => {} },
  { id: "nano", icon: "✚", name: "Nanoenjambre", category: "defense",
    accent: "#43ff9b", oneTime: true,
    description: "Repara una vida tras 16 bajas; una vez por oleada.",
    apply: () => { player.nanoWaveLevel = level;
      player.nanoObservedKills = runStats.enemiesDestroyed;
      player.nanoKillsThisWave = 0; player.nanoRepairedThisWave = false; } },
  { id: "repulsor", icon: "◎", name: "Repulsor gravitacional", category: "defense",
    accent: "#68e5ff", oneTime: true,
    description: "Cada 8 s aleja enemigos comunes cercanos; no mueve jefes.",
    apply: () => { player.repulsorTimer = 3; } },
  { id: "phaseAnchor", icon: "⌁", name: "Ancla de fase", category: "mobility",
    accent: "#a855f7", oneTime: true,
    description: "Cada segundo dash deja una zona ralentizadora de 1,2 s.",
    apply: () => {} }
];

const legacySynergyCatalog = [
  { id: "nova", name: "Nova Estelar", a: "overclock", b: "damage",
    description: "Salva especial cada diez ciclos de disparo." },
  { id: "hypersonic", name: "Impacto Hipersónico", a: "speed", b: "dash",
    description: "El dash libera una onda dañina." },
  { id: "aegis", name: "Égida", a: "armor", b: "shield",
    description: "Escudo automático ante un impacto, con recarga." },
  { id: "reactor", name: "Reactor Serenity", a: "overclock", b: "shield",
    description: "Más energía para la Ultimate." }
];
const newSynergyCatalog = [
  { id: "livingConstellation", name: "Constelación viva", a: "drones", b: "condenser",
    description: "Las bajas de drones dan +3 energía Ultimate.", accent: "#43ff9b" },
  { id: "hunterCircuit", name: "Circuito cazador", a: "ionic", b: "tactical",
    description: "El arco prioriza y consume una marca para sumar +0,3.", accent: "#6deaff" },
  { id: "livingBastion", name: "Bastión vivo", a: "nano", b: "armor",
    description: "Repara tras 12 bajas o da 1 s de escudo con vida completa.", accent: "#43ff9b" },
  { id: "phaseVortex", name: "Vórtice de fase", a: "repulsor", b: "phaseAnchor",
    description: "La zona crece, dura 1,6 s y termina con una onda.", accent: "#a855f7" },
  { id: "prismRain", name: "Lluvia prismática", a: "fractal", b: "overclock",
    description: "Cada octavo disparo divide al impactar; máximo 4 dardos/s.", accent: "#f9adff" },
  { id: "rescueMantle", name: "Manto de rescate", a: "phaseAnchor", b: "shield",
    description: "Salir y regresar a la zona da 1,5 s de escudo cada 20 s.", accent: "#43ff9b" },
  { id: "starHunt", name: "Caza estelar", a: "tactical", b: "damage",
    description: "Consumir la marca da +1 de daño en vez de +0,5.", accent: "#ffcf73" },
  { id: "ionicSwarm", name: "Enjambre iónico", a: "drones", b: "ionic",
    description: "Un disparo de dron conduce un arco cada 2,6 s.", accent: "#6deaff" }
];
const allSynergyCatalog = [...legacySynergyCatalog, ...newSynergyCatalog];

function renderModuleCompendium() {
  moduleCompendium.textContent = "";
  for (const upgrade of upgradeCatalog) {
    const article = document.createElement("article");
    article.className = `module-compendium-item module-${upgrade.category}`;
    article.style.setProperty("--module-color", upgrade.accent);
    const icon = document.createElement("span");
    icon.className = "upgrade-compendium-icon";
    icon.textContent = upgrade.icon;
    const content = document.createElement("div");
    const category = document.createElement("span");
    category.className = "module-compendium-category";
    category.textContent = upgrade.category === "attack" ? "ATAQUE"
      : upgrade.category === "defense" ? "DEFENSA" : "MOVILIDAD · ENERGÍA";
    const name = document.createElement("strong");
    name.textContent = upgrade.name;
    const description = document.createElement("small");
    description.textContent = upgrade.description;
    content.append(category, name, description);
    article.append(icon, content);
    moduleCompendium.append(article);
  }
  synergyCompendium.textContent = "";
  for (const synergy of allSynergyCatalog) {
    const name = document.createElement("span");
    name.textContent = synergy.name;
    const details = document.createElement("small");
    const left = upgradeCatalog.find(upgrade => upgrade.id === synergy.a)?.name;
    const right = upgradeCatalog.find(upgrade => upgrade.id === synergy.b)?.name;
    details.textContent = `${left} + ${right} · ${synergy.description}`;
    synergyCompendium.append(name, details);
  }
}

function renderModuleRack() {
  moduleRack.textContent = "";
  for (const id of [...new Set(player.upgrades)]) {
    const upgrade = upgradeCatalog.find(item => item.id === id);
    if (!upgrade) continue;
    const chip = document.createElement("span");
    chip.className = "module-rack-chip";
    chip.style.setProperty("--module-color", upgrade.accent);
    chip.textContent = upgrade.icon;
    chip.title = `${upgrade.name}: ${upgrade.description}`;
    chip.setAttribute("aria-label", upgrade.name);
    moduleRack.append(chip);
  }
  for (const id of player.synergies) {
    const synergy = newSynergyCatalog.find(item => item.id === id);
    if (!synergy) continue;
    const chip = document.createElement("span");
    chip.className = "module-rack-chip synergy-chip";
    chip.style.setProperty("--module-color", synergy.accent);
    chip.textContent = "✦";
    chip.title = `${synergy.name}: ${synergy.description}`;
    chip.setAttribute("aria-label", synergy.name);
    moduleRack.append(chip);
  }
}

function upgradeSynergyLabel(id) {
  const available = allSynergyCatalog.find(synergy =>
    !isSynergyUnlocked(synergy.id) &&
    ((synergy.a === id && player.upgrades.includes(synergy.b)) ||
    (synergy.b === id && player.upgrades.includes(synergy.a))));
  if (available) return `ACTIVA ${available.name.toUpperCase()}`;
  const possible = allSynergyCatalog.find(synergy => !isSynergyUnlocked(synergy.id) &&
    (synergy.a === id || synergy.b === id));
  if (!possible) return allSynergyCatalog.some(synergy => synergy.a === id || synergy.b === id)
    ? "SINERGIA YA ACTIVA" : "MÓDULO INDEPENDIENTE";
  const partnerId = possible.a === id ? possible.b : possible.a;
  const partner = upgradeCatalog.find(upgrade => upgrade.id === partnerId);
  return `COMBINA CON ${partner?.name.toUpperCase()}`;
}

function chooseUpgrades() {
  const available = upgradeCatalog.filter(upgrade => !upgrade.oneTime || !player.upgrades.includes(upgrade.id));
  const choices = [];
  for (const category of ["attack", "defense", "mobility"]) {
    const pool = available.filter(upgrade => upgrade.category === category && !choices.includes(upgrade));
    if (!pool.length) continue;
    const weights = pool.map(upgrade => {
      const completesSynergy = allSynergyCatalog.some(synergy =>
        !isSynergyUnlocked(synergy.id) &&
        ((synergy.a === upgrade.id && player.upgrades.includes(synergy.b)) ||
        (synergy.b === upgrade.id && player.upgrades.includes(synergy.a))));
      return completesSynergy ? 6 : 1;
    });
    let roll = Math.random() * weights.reduce((sum, weight) => sum + weight, 0);
    let picked = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i += 1) {
      roll -= weights[i];
      if (roll < 0) { picked = pool[i]; break; }
    }
    choices.push(picked);
  }
  return choices;
}

renderModuleCompendium();

function showUpgradeSelection() {
  gameState = "upgrading";
  const choices = chooseUpgrades();
  upgradeOptions.textContent = "";
  const activeNames = player.synergies.map(id => newSynergyCatalog.find(item => item.id === id)?.name)
    .filter(Boolean);
  upgradeSynergyHint.textContent = activeNames.length
    ? `SINERGIAS ACTIVAS · ${activeNames.join(" · ")}`
    : "Las cartas muestran qué combinación puedes completar.";

  choices.forEach((upgrade) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `upgrade-option module-${upgrade.category}`;
    button.style.setProperty("--module-color", upgrade.accent);
    button.dataset.module = upgrade.id;

    const category = document.createElement("span");
    category.className = "upgrade-category";
    category.textContent = upgrade.category === "attack" ? "ATAQUE"
      : upgrade.category === "defense" ? "DEFENSA" : "MOVILIDAD · ENERGÍA";

    const icon = document.createElement("span");
    icon.className = "upgrade-icon";
    icon.textContent = upgrade.icon;
    const name = document.createElement("strong");
    name.textContent = upgrade.name;
    const description = document.createElement("small");
    description.textContent = upgrade.description;
    const synergy = document.createElement("span");
    synergy.className = "upgrade-synergy-tag";
    synergy.textContent = upgradeSynergyLabel(upgrade.id);
    if (synergy.textContent.startsWith("ACTIVA")) button.classList.add("completes-synergy");
    button.append(category, icon, name, description, synergy);

    button.addEventListener("click", () => {
      upgrade.apply();
      player.upgrades.push(upgrade.id);
      announceModule(upgrade.name.toUpperCase(), "MÓDULO INSTALADO", upgrade.accent);
      checkUpgradeSynergies();
      renderModuleRack();
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
  const unlockedNames = [];

  if (hasOverclock && hasDamage && !player.synergyUnlocked) {
    player.synergyUnlocked = true;
    unlockedNames.push("NOVA ESTELAR");
  }
  if (hasSpeed && hasDash && !player.shockwaveUnlocked) {
    player.shockwaveUnlocked = true;
    unlockedNames.push("IMPACTO HIPERSÓNICO");
  }
  if (hasArmor && hasShield && !player.aegisUnlocked) {
    player.aegisUnlocked = true;
    player.aegisCooldown = 0;
    unlockedNames.push("ÉGIDA");
  }
  if (hasOverclock && hasShield && !player.reactorUnlocked) {
    player.reactorUnlocked = true;
    unlockedNames.push("REACTOR SERENITY");
  }

  for (const synergy of newSynergyCatalog) {
    if (player.synergies.includes(synergy.id) ||
      !player.upgrades.includes(synergy.a) || !player.upgrades.includes(synergy.b)) continue;
    player.synergies.push(synergy.id);
    unlockedNames.push(synergy.name.toUpperCase());
  }

  if (unlockedNames.length) {
    player.shieldTime = Math.max(player.shieldTime, 4);
    createParticles(player.x + player.width / 2, player.y + player.height / 2, "#43ff9b", 35);
    moduleFlash("synergy", player.x + player.width / 2, player.y + player.height / 2,
      96, "#d8b4fe", 0.8);
    announceModule("SINERGIA ACTIVADA", unlockedNames.join(" + "), "#d8b4fe");
  }
}

function winGame() {
  gameState = "victory";
  document.body.classList.add("mobile-ended");
  updateOrientationGate();
  releaseAllSticks();
  const finalScore = Math.floor(score);
  awardRunFragments(finalScore);
  finalBossDefeats += 1;
  safeStorageSet(FINAL_BOSS_DEFEATS_KEY, String(finalBossDefeats));
  finalBossDefeatsText.textContent = String(finalBossDefeats);
  if (selectedDifficulty === "normal") {
    normalBossVictories += 1;
    safeStorageSet(NORMAL_BOSS_VICTORIES_KEY, String(normalBossVictories));
  } else if (selectedDifficulty === "hard") {
    hardBossVictories += 1;
    safeStorageSet(HARD_BOSS_VICTORIES_KEY, String(hardBossVictories));
  }
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
  document.body.classList.add("mobile-ended");
  updateOrientationGate();
  releaseAllSticks();
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
  if (player) CosmeticArt.aura(ctx, cosmeticCatalog.find(item => item.id === selectedAura),
    player.x + player.width / 2, player.y + player.height / 2, combatTime, lowPerformance);
  drawModuleFields();
  drawMobileAimGuide();
  drawDashEchoes();
  if (player) drawPlayer();
  drawModuleSatellites();
  playerProjectiles.forEach(drawPlayerProjectile);
  threats.forEach(drawThreat);
  drawModuleMarks();
  drawUltimateEffects();
  drawAttackImpacts();
  drawModuleFlashes();
  powerUps.forEach(drawPowerUp);
  enemyProjectiles.forEach(drawEnemyProjectile);
  particles.forEach(drawParticle);
  damageNumbers.forEach(drawDamageNumber);
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

  const gridStep = lowPerformance ? 80 : 40;
  for (let x = 0; x <= GAME_WIDTH; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME_HEIGHT);
    ctx.stroke();
  }

  for (let y = -40; y <= GAME_HEIGHT + 40; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(GAME_WIDTH, y + offset);
    ctx.stroke();
  }

  // Pequeños nodos decorativos.
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.32;
  for (let i = 0; i < (lowPerformance ? 8 : 18); i += 1) {
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

  PlayerArt.draw(ctx, player.skin, {
    x: centerX, y: centerY, time: combatTime,
    attackFlash: player.attackTimer > player.attackInterval - 0.065,
    pierceReady: player.skin === "cyan" && player.shotCounter % 4 === 3,
    charge: Math.max(0, Math.min(1, 1 - player.attackTimer / player.attackInterval)),
    dashing: player.dashTime > 0,
    ultimateReady: player.ultimateEnergy >= player.ultimateMax,
    reducedMotion: reducePreviewMotion
  });

  if (player.shieldTime > 0) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = `rgba(67, 255, 155, ${0.55 + Math.sin(performance.now() / 130) * 0.25})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 33, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawUltimateEffects() {
  ctx.save();
  for (const effect of ultimateEffects) {
    if (effect.kind === "nexo") continue;
    const solar = effect.kind === "solar";
    if (!solar && effect.age < effect.delay) continue;
    const travel = solar ? Math.max(0, effect.age - 0.35) / 0.7
      : Math.max(0, effect.age - effect.delay) / effect.duration;
    if (travel < 0 || travel > 1.2) continue;
    const radius = travel <= 0 ? 24 + effect.age * 50 : effect.radius * Math.min(1, travel);
    ctx.strokeStyle = solar ? "#ffd166" : "#c084fc";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = lowPerformance ? 0 : 18;
    ctx.lineWidth = solar ? 5 : 3;
    ctx.globalAlpha = Math.max(0, solar ? 0.52 - Math.max(0, travel) * 0.3
      : 0.46 - Math.max(0, travel) * 0.24);
    ctx.beginPath(); ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2); ctx.stroke();
    if (travel <= 0 && solar) {
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(effect.x, effect.y, radius * 0.64, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

function updateAttackImpacts(dt) {
  attackImpacts.forEach(impact => { impact.life -= dt; });
  attackImpacts = attackImpacts.filter(impact => impact.life > 0);
}

function drawAttackImpacts() {
  ctx.save();
  for (const impact of attackImpacts) {
    const progress = 1 - impact.life / impact.maxLife;
    ctx.globalAlpha = (1 - progress) * 0.55;
    ctx.strokeStyle = impact.color || (impact.kind === "arc" ? "#00f0ff" : "#ffd166");
    ctx.lineWidth = impact.kind === "arc" ? 2 : 2.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = lowPerformance ? 0 : 9;
    ctx.beginPath();
    if (impact.kind === "arc") {
      ctx.moveTo(impact.x, impact.y);
      ctx.lineTo((impact.x + impact.toX) / 2, (impact.y + impact.toY) / 2 - 7);
      ctx.lineTo(impact.toX, impact.toY);
    } else ctx.arc(impact.x, impact.y, impact.radius * progress, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function updateUltimateBossPulse(deltaTime) {
  if (!ultimateBossPulse) return;
  const pulse = ultimateBossPulse;
  if (!boss || pulse.target !== boss || boss.health <= 0) { ultimateBossPulse = null; return; }
  pulse.delay -= deltaTime;
  pulse.life -= deltaTime;
  if (pulse.delay > 0 || pulse.life <= 0) {
    if (pulse.life <= 0) ultimateBossPulse = null;
    return;
  }
  const dealt = applyDamageToBoss(pulse.remaining);
  pulse.remaining -= dealt;
  player.ultimateBossDamageRemaining = Math.max(0, player.ultimateBossDamageRemaining - dealt);
  addDamageNumber(boss.x + boss.width / 2, boss.y, dealt, "#ffd166");
  if (pulse.remaining <= 0.001) ultimateBossPulse = null;
  if (boss.health <= 0) defeatBoss();
}

function drawThreat(threat) {
  const centerX = threat.x + threat.width / 2;
  const centerY = threat.y + threat.height / 2;
  let angle = 0;
  if (threat.type.shoots && player) {
    const targetX = threat.brain?.mode === "lock" ? threat.brain.targetX : player.x + player.width / 2;
    const targetY = threat.brain?.mode === "lock" ? threat.brain.targetY : player.y + player.height / 2;
    angle = Math.atan2(targetY - centerY, targetX - centerX) - Math.PI / 2;
  } else if (threat.type.behavior === "hunter") {
    angle = Math.atan2(threat.velocityY, threat.velocityX) - Math.PI / 2;
  }
  const charge = isInsideArena(threat) && (threat.type.shoots || threat.type.radialShoots)
    ? clamp(1 - threat.shotTimer / threat.shotInterval, 0, 1) : 0;
  EnemyBehavior.signal(ctx, threat, player, performance.now());
  if (threat.type.icon === "mine" && threat.pulseTime > 0) {
    const progress = 1 - threat.pulseTime / 0.36;
    ctx.save(); ctx.strokeStyle = "#ffbe60"; ctx.globalAlpha = (1 - progress) * 0.72;
    ctx.lineWidth = 5 * (1 - progress) + 1;
    ctx.beginPath(); ctx.arc(centerX, centerY, 30 + progress * 78, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  EnemyArt.draw(ctx, threat.type.icon, {
    x: centerX, y: centerY,
    radiusX: threat.width / 2, radiusY: threat.height / 2,
    time: threat.type.behavior === "phantom" ? threat.behaviorPhase / 5.5 : combatTime + threat.sizePulseSpeed,
    color: threat.type.color, angle, rotation: threat.rotation,
    charge, healthRatio: threat.health / threat.maxHealth,
    gapIndex: threat.brain?.gapIndex,
    phantomAlpha: threat.brain?.mode === "ethereal" ? 0.22 : 1
  });
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

  if (projectile.source === "fractal") {
    ctx.fillStyle = "#f9adff";
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-1, -1, 2, 2);
  } else if (projectile.source === "drone") {
    ctx.fillStyle = projectile.color;
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -4); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
  } else if (projectile.skin === "violet") {
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
  const entry = EnemyArt.bosses.find(entry => entry.name === boss.name);
  const entranceProgress = clamp(1 - boss.entranceTime / boss.entranceDuration, 0, 1);
  const scale = boss.entranceTime > 0 ? 0.55 + entranceProgress * 0.45 : 1;
  const breathing = boss.final ? 0.97 + Math.sin(boss.phase * 3) * 0.025 : 1;
  ctx.save();
  ctx.globalAlpha = boss.entranceTime > 0 ? 0.35 + entranceProgress * 0.65 : 1;
  EnemyArt.draw(ctx, entry.id, {
    x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
    radiusX: boss.width / 2 * scale * breathing,
    radiusY: boss.height / 2 * scale * breathing,
    time: boss.phase, color: boss.color,
    charge: boss.entranceTime > 0 ? 0 : clamp(1 - boss.shotTimer / boss.shotInterval, 0, 1),
    healthRatio: boss.health / boss.maxHealth, phaseTwo: boss.phaseTwo
  });
  drawBossSignals();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${boss.final ? 13 : 11}px Consolas`;
  ctx.textAlign = "center";
  ctx.fillText(boss.name, boss.x + boss.width / 2, boss.y + boss.height + 17);
  ctx.restore();
}

function drawModuleFields() {
  if (!phaseFields.length) return;
  ctx.save();
  for (const field of phaseFields) {
    const strength = Math.min(1, field.life / 0.25);
    const drift = lowPerformance ? 0 : combatTime * 1.6;
    ctx.globalAlpha = 0.15 * strength;
    ctx.fillStyle = field.vortex ? "#a855f7" : "#6b77ff";
    ctx.beginPath(); ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.68 * strength;
    ctx.lineWidth = field.vortex ? 3 : 2;
    ctx.strokeStyle = field.vortex ? "#d8b4fe" : "#a9a5ff";
    ctx.setLineDash([12, 7]); ctx.lineDashOffset = -drift * 8;
    ctx.beginPath(); ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    for (let index = 0; index < 4; index += 1) {
      const angle = index * Math.PI / 2 + drift;
      ctx.beginPath(); ctx.arc(field.x, field.y, field.radius * 0.7,
        angle, angle + 0.38); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawModuleSatellites() {
  if (!player) return;
  const x = player.x + player.width / 2, y = player.y + player.height / 2;
  ctx.save();
  if (hasModule("repulsor")) {
    const readiness = 1 - Math.min(1, player.repulsorTimer / 8);
    ctx.strokeStyle = "#68e5ff";
    ctx.globalAlpha = 0.18 + readiness * 0.5;
    ctx.lineWidth = 1.5 + readiness;
    ctx.beginPath(); ctx.arc(x, y, 54 + readiness * 9, -Math.PI / 2,
      -Math.PI / 2 + readiness * Math.PI * 2); ctx.stroke();
  }
  if (hasModule("nano") && !player.nanoRepairedThisWave) {
    ctx.fillStyle = "#43ff9b";
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 5; i += 1) {
      const angle = i * Math.PI * 2 / 5 + (lowPerformance ? 0 : combatTime * 0.8);
      ctx.fillRect(x + Math.cos(angle) * 27 - 2, y + Math.sin(angle) * 27 - 2, 4, 4);
    }
  }
  if (hasModule("drones")) {
    for (const side of [-1, 1]) {
      const dx = x + side * 34, dy = y + Math.sin(combatTime * 3 + side) * 17;
      const color = side < 0 ? "#43ff9b" : "#a9f5ff";
      ctx.globalAlpha = 0.25; ctx.strokeStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(dx, dy); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = "#092136"; ctx.strokeStyle = color;
      ctx.shadowBlur = lowPerformance ? 0 : 12; ctx.shadowColor = color;
      ctx.beginPath(); ctx.moveTo(dx, dy - 9); ctx.lineTo(dx + 8, dy + 7);
      ctx.lineTo(dx, dy + 3); ctx.lineTo(dx - 8, dy + 7); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  ctx.restore();
}

function drawModuleMarks() {
  if (!hasModule("tactical")) return;
  ctx.save();
  ctx.strokeStyle = "#ffcf73";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#ffcf73";
  ctx.shadowBlur = lowPerformance ? 0 : 9;
  for (const target of [...threats, ...(boss ? [boss] : [])]) {
    if (!target.markUntil || target.markUntil <= combatTime) continue;
    const x = target.x + target.width / 2, y = target.y + target.height / 2;
    const radius = Math.max(17, target.width * 0.52);
    ctx.globalAlpha = Math.min(0.85, (target.markUntil - combatTime) / 0.3);
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI / 2;
      ctx.beginPath(); ctx.arc(x, y, radius, angle - 0.27, angle + 0.27); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
    ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
  }
  ctx.restore();
}

function drawModuleFlashes() {
  ctx.save();
  for (const flash of moduleFlashes) {
    const progress = 1 - flash.life / flash.maxLife;
    ctx.globalAlpha = Math.max(0, 1 - progress) * 0.78;
    ctx.strokeStyle = flash.color;
    ctx.shadowColor = flash.color;
    ctx.shadowBlur = lowPerformance ? 0 : 16;
    ctx.lineWidth = flash.kind === "synergy" ? 4 : 2.5;
    ctx.beginPath(); ctx.arc(flash.x, flash.y,
      flash.radius * (flash.kind === "muzzle" ? 0.4 + progress : 0.3 + progress * 0.7),
      0, Math.PI * 2); ctx.stroke();
    if (flash.kind === "repair" || flash.kind === "synergy") {
      ctx.globalAlpha *= 0.35;
      ctx.beginPath(); ctx.arc(flash.x, flash.y, flash.radius * (0.7 + progress * 0.4),
        0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBossSignals() {
  ctx.save();
  const x = boss.x + boss.width / 2, y = boss.y + boss.height / 2;
  if (boss.name === "Sailor Moon" && boss.wellActive) {
    ctx.strokeStyle = "rgba(255, 209, 102, 0.32)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 175, 0, Math.PI * 2); ctx.stroke();
  } else if (boss.name === "Sailor Mars" && boss.dashMode === "warn") {
    ctx.strokeStyle = "rgba(255, 71, 126, 0.38)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(boss.dashMarkX + boss.width / 2, y); ctx.stroke();
    ctx.strokeStyle = "rgba(255, 71, 126, 0.58)";
    ctx.strokeRect(boss.dashMarkX, boss.y, boss.width, boss.height);
  } else if (boss.name === "Sailor Mercury" && boss.crystalTimer > 0) {
    ctx.strokeStyle = "#c0fbff"; ctx.lineWidth = 3; ctx.shadowBlur = 16; ctx.shadowColor = "#00f0ff";
    ctx.beginPath(); ctx.arc(x, y, 64 + Math.sin(boss.phase * 9) * 3, 0, Math.PI * 2); ctx.stroke();
  } else if (boss.name === "Sailor Mercury" && boss.crystalCooldown < 0.28) {
    ctx.strokeStyle = "rgba(192, 251, 255, 0.42)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 64, 0, Math.PI * 2); ctx.stroke();
  }
  if (boss.voidMark) {
    const mark = boss.voidMark;
    ctx.strokeStyle = `rgba(255, 0, 60, ${0.24 + (1 - mark.time / mark.duration) * 0.42})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(mark.x, mark.y, 52, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(mark.x, mark.y, 8 + (1 - mark.time / mark.duration) * 22, 0, Math.PI * 2); ctx.stroke();
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


function drawCometWarning() {
  if (!cometWarning) return;
  ctx.save();
  // Una estela continua y difusa es más natural que una larga ruta punteada.
  ctx.beginPath();
  ctx.moveTo(cometWarning.startX, cometWarning.startY);
  ctx.lineTo(cometWarning.endX, cometWarning.endY);
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(255, 209, 102, 0.13)";
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(255, 209, 102, ${0.35 + Math.sin(cometWarning.time * 12) * 0.12})`;
  ctx.shadowBlur = lowPerformance ? 0 : 8;
  ctx.shadowColor = "#ffd166";
  ctx.stroke();
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 13px Consolas";
  ctx.textAlign = "center";
  ctx.fillText(cometWarning.returnPass
    ? "⚠ ESTRELLA FUGAZ · SEGUNDO PASO"
    : "⚠ ESTRELLA FUGAZ · DESPEJA LA TRAYECTORIA", GAME_WIDTH / 2, 44);
  ctx.restore();
}

function drawComet(comet) {
  EnemyArt.draw(ctx, "comet", {
    x: comet.x + comet.width / 2, y: comet.y + comet.height / 2,
    radiusX: comet.width / 2, radiusY: comet.height / 2,
    time: combatTime, angle: comet.angle
  });
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
  const maximum = lowPerformance ? 90 : 230;
  const allowed = Math.min(lowPerformance ? Math.ceil(amount / 3) : amount, maximum - particles.length);
  for (let i = 0; i < allowed; i += 1) {
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

function createDashTrail(dt) {
  dashEchoTimer -= dt;
  if (dashEchoTimer > 0 || dashEchoes.length >= (lowPerformance ? 4 : 7)) return;
  dashEchoTimer = lowPerformance ? 0.08 : 0.045;
  dashEchoes.push({ x: player.x + player.width / 2, y: player.y + player.height / 2,
    skin: player.skin, life: 0.28, maxLife: 0.28 });
}

function updateDashEchoes(dt) {
  dashEchoes.forEach(echo => { echo.life -= dt; });
  dashEchoes = dashEchoes.filter(echo => echo.life > 0);
  dashBursts.forEach(burst => { burst.life -= dt; });
  dashBursts = dashBursts.filter(burst => burst.life > 0);
}

function drawDashEchoes() {
  if ((!dashEchoes.length && !dashBursts.length) || !player) return;
  const color = getSkinColors().primary;
  ctx.save();
  if (dashEchoes.length) {
    const points = [...dashEchoes, { x: player.x + player.width / 2,
      y: player.y + player.height / 2 }];
    CosmeticArt.dash(ctx, cosmeticCatalog.find(item => item.id === selectedDashStyle),
      points, combatTime, lowPerformance);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = player.skin === "gold" ? 5 : player.skin === "violet" ? 3 : 2;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }
  for (const echo of dashEchoes) {
    ctx.globalAlpha = Math.min(0.34, echo.life / echo.maxLife * 0.34);
    PlayerArt.draw(ctx, echo.skin, { x: echo.x, y: echo.y, time: combatTime,
      reducedMotion: reducePreviewMotion });
  }
  for (const burst of dashBursts) {
    const progress = 1 - burst.life / burst.maxLife;
    ctx.globalAlpha = 0.4 * (1 - progress);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(burst.x, burst.y, 12 + progress * 18, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

/** Guía móvil muy tenue: indica la dirección real sin competir con los ataques. */
function drawMobileAimGuide() {
  if (!player || !isTouchPhone() || !document.body.classList.contains("mobile-session") ||
      aimMode !== "manual" || !(manualAim.hasDirection || manualAim.stickActive)) return;
  const startX = player.x + player.width / 2;
  const startY = player.y + player.height / 2;
  const vectorX = manualAim.vectorX;
  const vectorY = manualAim.vectorY;
  if (Math.hypot(vectorX, vectorY) < 0.01) return;
  const horizontalRange = vectorX > 0 ? (GAME_WIDTH - startX) / vectorX
    : vectorX < 0 ? -startX / vectorX : Infinity;
  const verticalRange = vectorY > 0 ? (GAME_HEIGHT - startY) / vectorY
    : vectorY < 0 ? -startY / vectorY : Infinity;
  const range = Math.max(0, Math.min(horizontalRange, verticalRange) - 12);
  const endX = startX + vectorX * range;
  const endY = startY + vectorY * range;

  ctx.save();
  ctx.setLineDash([3, 12]);
  ctx.lineDashOffset = -combatTime * 7;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(67, 255, 155, 0.13)";
  ctx.beginPath();
  ctx.moveTo(startX + vectorX * 30, startY + vectorY * 30);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(endX, endY, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
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
 * Música procedural: cinco temas de escenario y arreglos para los jefes.
 * Así el proyecto no necesita descargar ni incluir un archivo de audio externo.
 */
function startMusic() {
  if (musicEnabled) GameAudio.music(scenarioIndex, Boolean(boss),
    Boolean(boss?.final && boss.phaseTwo), musicVolume);
}

function stopMusic() {
  GameAudio.stop();
}

function ensureAudioContext() {
  GameAudio.ensure();
}

/** Efectos de sonido generados con Web Audio, sin archivos externos. */
function playSound(type, position = 0) {
  GameAudio.setVolumes(musicVolume, effectsVolume);
  GameAudio.play(type, player?.skin || selectedSkin, position);
}

/** Ciclo principal: calcula tiempo, actualiza y dibuja. */
const skinPreviewCanvases = [...document.querySelectorAll(".skin-preview")];
let lastSkinPreviewDraw = -Infinity;
function drawSkinPreviews(time) {
  skinPreviewCanvases.forEach(canvas => {
    const skin = canvas.classList.contains("violet") ? "violet" : canvas.classList.contains("gold") ? "gold" : "cyan";
    const preview = canvas.getContext("2d");
    const edge = PlayerArt.palettes[skin].edge;
    preview.clearRect(0, 0, canvas.width, canvas.height);
    const halo = preview.createRadialGradient(48, 42, 4, 48, 42, 45);
    halo.addColorStop(0, `${edge}24`);
    halo.addColorStop(1, "#02091600");
    preview.fillStyle = halo;
    preview.fillRect(0, 0, 96, 96);
    preview.strokeStyle = `${edge}42`;
    preview.lineWidth = 1;
    preview.beginPath();
    preview.arc(48, 46, 36, -Math.PI * 0.85, Math.PI * 0.85);
    preview.stroke();
    PlayerArt.draw(preview, skin, { x: 48, y: 44, scale: 1.53, time, reducedMotion: reducePreviewMotion });
  });
}

function drawMenuHero(time) {
  const preview = menuHeroCanvas.getContext("2d");
  const width = menuHeroCanvas.width, height = menuHeroCanvas.height;
  const edge = PlayerArt.palettes[selectedSkin].edge;
  menuHeroShipName.textContent = { cyan: "CORE", violet: "SERENITY", gold: "FIREFLY" }[selectedSkin];
  preview.clearRect(0, 0, width, height);
  const background = preview.createRadialGradient(260, 140, 10, 260, 140, 270);
  background.addColorStop(0, `${edge}2e`);
  background.addColorStop(.45, "#0c2135");
  background.addColorStop(1, "#040d1c");
  preview.fillStyle = background; preview.fillRect(0, 0, width, height);
  preview.strokeStyle = "rgba(130, 210, 230, .1)"; preview.lineWidth = 1;
  for (let x = 25; x < width; x += 26) { preview.beginPath(); preview.moveTo(x, 0); preview.lineTo(x, height); preview.stroke(); }
  for (let y = 22; y < height; y += 26) { preview.beginPath(); preview.moveTo(0, y); preview.lineTo(width, y); preview.stroke(); }
  preview.save(); preview.translate(260, 145);
  preview.strokeStyle = edge; preview.globalAlpha = .35; preview.lineWidth = 2;
  for (const radius of [88, 122]) {
    for (let segment = 0; segment < 4; segment++) {
      const angle = segment * Math.PI / 2 + (reducePreviewMotion ? 0 : time * .24);
      preview.beginPath(); preview.arc(0, 0, radius, angle, angle + .7); preview.stroke();
    }
  }
  preview.globalAlpha = .12; preview.beginPath(); preview.arc(0, 0, 145, 0, Math.PI * 2); preview.stroke();
  preview.restore();
  preview.save(); preview.globalAlpha = .5;
  EnemyArt.draw(preview, "glitch", { x: 91, y: 110, radiusX: 29, radiusY: 29, color: "#f72585", time, healthRatio: 1 });
  EnemyArt.draw(preview, "orbiter", { x: 430, y: 186, radiusX: 30, radiusY: 30, color: "#00f0ff", time, healthRatio: 1 });
  preview.restore();
  if (selectedDashStyle !== "dash_none") CosmeticArt.dash(preview,
    cosmeticCatalog.find(item => item.id === selectedDashStyle),
    [{x: 96, y: 245}, {x: 150, y: 214}, {x: 202, y: 175}, {x: 260, y: 145}],
    time, reducePreviewMotion);
  if (selectedTrail !== "none") {
    const trail = cosmeticCatalog.find(item => item.id === selectedTrail);
    for (let i = 0; i < 9; i++) CosmeticArt.particle(preview, trail,
      { x: 258 + Math.sin(i * 1.1) * 13, y: 215 + i * 7, size: 3 + i % 3,
        life: .55 - i * .04, maxLife: .55, phase: i, index: i }, time, reducePreviewMotion);
  }
  preview.save(); preview.translate(260, 145); preview.scale(2.9, 2.9);
  CosmeticArt.aura(preview, cosmeticCatalog.find(item => item.id === selectedAura), 0, 0, time, reducePreviewMotion);
  preview.restore();
  PlayerArt.draw(preview, selectedSkin, { x: 260, y: 145, scale: 2.9, time,
    charge: .9, reducedMotion: reducePreviewMotion });
  preview.fillStyle = "rgba(8, 21, 37, .83)"; preview.fillRect(14, 15, 130, 25);
  preview.fillStyle = edge; preview.font = "700 12px Consolas, monospace";
  preview.fillText("NEXUS // EN LÍNEA", 23, 32);
}

function addDamageNumber(x, y, amount, color) {
  if (!showDamageNumbers || amount <= 0 || damageNumbers.length >= (lowPerformance ? 25 : 55)) return;
  damageNumbers.push({ x, y, amount: Math.round(amount * 10) / 10, color, life: 0.65 });
}

function updateDamageNumbers(deltaTime) {
  for (let i = damageNumbers.length - 1; i >= 0; i -= 1) {
    damageNumbers[i].y -= 35 * deltaTime;
    damageNumbers[i].life -= deltaTime;
    if (damageNumbers[i].life <= 0) damageNumbers.splice(i, 1);
  }
}

function drawDamageNumber(number) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, number.life * 2);
  ctx.font = "bold 15px Consolas, monospace";
  ctx.textAlign = "center";
  ctx.strokeStyle = "#04101c";
  ctx.lineWidth = 3;
  ctx.strokeText(number.amount, number.x, number.y);
  ctx.fillStyle = number.color;
  ctx.fillText(number.amount, number.x, number.y);
  ctx.restore();
}

function gameLoop(currentTime) {
  if (storeScreen.classList.contains("active") && currentTime - lastCosmeticPreviewDraw >= 1000 / 18) {
    drawCosmeticPreviews(reducePreviewMotion ? 0.6 : currentTime / 1000);
    lastCosmeticPreviewDraw = currentTime;
  }
  if (startScreen.classList.contains("active") && currentTime - lastSkinPreviewDraw >= 1000 / 30) {
    drawSkinPreviews(reducePreviewMotion ? 0.6 : currentTime / 1000);
    drawMenuHero(reducePreviewMotion ? 0.6 : currentTime / 1000);
    lastSkinPreviewDraw = currentTime;
  }
  if (bestiaryScreen.classList.contains("active") && currentTime - lastBestiaryDraw >= 1000 / 30) {
    const previewTime = reducePreviewMotion ? 0.6 : currentTime / 1000;
    bestiaryPreviews.forEach(preview => preview.draw(previewTime));
    lastBestiaryDraw = currentTime;
  }
  // Programar primero el siguiente cuadro evita que un fallo visual aislado
  // detenga permanentemente toda la partida.
  requestAnimationFrame(gameLoop);
  // Limitamos deltaTime para evitar saltos enormes si la pestaña pierde el foco.
  const frameMs = currentTime - lastTime;
  if (gameState === "playing" && frameMs > 0 && frameMs < 250) {
    averageFrameMs = averageFrameMs * 0.96 + frameMs * 0.04;
    if (averageFrameMs > 27) lowPerformance = true;
    else if (averageFrameMs < 20) lowPerformance = false;
  }
  const deltaTime = Math.max(0, Math.min(frameMs / 1000, 0.05));
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
  ultimateIndicator.classList.toggle("condenser", hasModule("condenser"));

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
    ["Monedas estelares ganadas", `${runStats.fragmentsEarned} ✦`]
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

function normalizeControlKey(value) {
  if (value === " " || value === "Spacebar") return "Space";
  if (typeof value !== "string") return "";
  return value.length === 1 ? value.toLowerCase() : value;
}

function canBindKey(key) {
  if (key.length === 1) return key.trim().length > 0;
  return ["Space", "Shift", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "Enter", "Backspace", "Delete", "Home", "End", "PageUp", "PageDown"].includes(key);
}

function loadControlBindings(saved) {
  const result = { ...DEFAULT_BINDINGS };
  if (!saved || typeof saved !== "object") return result;
  const used = new Set();
  for (const action of KEY_ACTIONS) {
    const key = normalizeControlKey(saved[action.id]);
    const chosen = [key, DEFAULT_BINDINGS[action.id], action.fallback, "e", "r", "f"]
      .find(candidate => candidate && canBindKey(candidate) && !used.has(candidate));
    result[action.id] = chosen;
    used.add(chosen);
  }
  return result;
}

function loadTouchLayouts(saved) {
  const result = {};
  for (const orientation of ["portrait", "landscape"]) {
    result[orientation] = {};
    for (const id of ["move", "aim", "dash", "ultimate"]) {
      const point = saved?.[orientation]?.[id];
      const fallback = DEFAULT_TOUCH_LAYOUTS[orientation][id];
      result[orientation][id] = {
        x: Number.isFinite(point?.x) ? clamp(point.x, .03, .97) : fallback.x,
        y: Number.isFinite(point?.y) ? clamp(point.y, .03, .97) : fallback.y
      };
    }
  }
  return result;
}

function saveSettings() {
  safeStorageSet(SETTINGS_KEY, JSON.stringify({
    skin: selectedSkin,
    musicEnabled,
    musicVolume,
    effectsVolume,
    aimMode,
    showDamageNumbers,
    trail: selectedTrail,
    aura: selectedAura,
    dashStyle: selectedDashStyle,
    controlBindings,
    touchLayouts
  }));
}

function applySavedSettings() {
  if (!ownedShips.includes(selectedSkin)) selectedSkin = "cyan";
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
  updateSkinDescription();
  damageNumbersToggle.checked = showDamageNumbers;
  if (!ownedCosmetics.includes(selectedTrail)) selectedTrail = "none";
  if (!ownedCosmetics.includes(selectedAura)) selectedAura = "aura_none";
  if (!ownedCosmetics.includes(selectedDashStyle)) selectedDashStyle = "dash_none";
  renderMenuEquipped();
  renderKeyBindings();
  applyTouchLayout();
}

function loadOwnedShips() {
  try {
    const saved = JSON.parse(safeStorageGet(SHIPS_KEY) || "[\"cyan\"]");
    return Array.isArray(saved) ? [...new Set(["cyan", ...saved.filter(id => ["cyan", "violet", "gold"].includes(id))])] : ["cyan"];
  } catch (error) { return ["cyan"]; }
}

function loadModeVictories(key, legacyCount = 0) {
  const saved = safeStorageGet(key);
  return saved === null ? legacyCount : Math.max(0, Number(saved) || 0);
}

function updateShipAvailability() {
  shipBalance.textContent = String(fragments);
  document.querySelectorAll(".ship-card").forEach(card => {
    const id = card.dataset.skin, owned = ownedShips.includes(id);
    const radio = card.querySelector('input[name="skin"]');
    radio.disabled = !owned;
    card.classList.toggle("locked", !owned);
    card.querySelector(".skin-option").setAttribute("aria-disabled", String(!owned));
    const buy = card.querySelector(".ship-unlock");
    if (buy) { buy.hidden = owned; buy.title = fragments < SHIP_PRICE ? "Necesitas 50 monedas estelares" : ""; }
    const status = card.querySelector(".ship-state");
    if (status && buy) status.hidden = !owned;
  });
  if (!ownedShips.includes(selectedSkin)) {
    selectedSkin = "cyan";
    startForm.elements.skin.value = "cyan";
    document.querySelectorAll(".skin-option").forEach(option =>
      option.classList.toggle("selected", option.querySelector('input[name="skin"]').value === "cyan"));
    updateSkinDescription();
  }
}

function purchaseShip(id) {
  if (ownedShips.includes(id)) return;
  if (fragments < SHIP_PRICE) {
    shipPurchaseMessage.textContent = `Necesitas ${SHIP_PRICE} monedas estelares para desbloquear esta nave.`;
    playSound("warning");
    return;
  }
  fragments -= SHIP_PRICE;
  ownedShips.push(id);
  safeStorageSet(FRAGMENTS_KEY, String(fragments));
  safeStorageSet(SHIPS_KEY, JSON.stringify(ownedShips));
  updateShipAvailability();
  const radio = startForm.querySelector(`input[name="skin"][value="${id}"]`);
  radio.checked = true;
  radio.dispatchEvent(new Event("change", { bubbles: true }));
  shipPurchaseMessage.textContent = `${id === "violet" ? "Serenity" : "Firefly"} desbloqueada y seleccionada.`;
  renderCosmeticStore();
  playSound("powerUp");
}

function renderMenuEquipped() {
  menuEquipped.textContent = "";
  const equipped = [
    ["ESTELA", selectedTrail, "none"], ["AURA", selectedAura, "aura_none"],
    ["DASH", selectedDashStyle, "dash_none"]
  ].filter(([, id, empty]) => id !== empty);
  menuEquipped.hidden = equipped.length === 0;
  equipped.forEach(([type, id]) => {
    const item = cosmeticCatalog.find(entry => entry.id === id);
    if (!item) return;
    const label = document.createElement("span");
    label.textContent = `${type} · ${item.name}`;
    label.style.setProperty("--equipped-color", item.color);
    menuEquipped.appendChild(label);
  });
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
    return Array.isArray(saved) ? [...new Set(["none", "aura_none", "dash_none", ...saved])] : ["none", "aura_none", "dash_none"];
  } catch (error) {
    return ["none", "aura_none", "dash_none"];
  }
}

function renderCosmeticStore() {
  storeFragments.textContent = String(fragments);
  storeBalance.textContent = String(fragments);
  updateShipAvailability();
  renderMenuEquipped();
  cosmeticGrid.textContent = "";
  cosmeticFilters.querySelectorAll("button").forEach(button => {
    const active = button.dataset.filter === cosmeticFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const groups = [
    { id: "trail", name: "Estelas", description: "Partículas que siguen la trayectoria de tu nave." },
    { id: "aura", name: "Auras", description: "Un contorno propio alrededor del casco." },
    { id: "dash", name: "Dash", description: "Energía que dibuja el recorrido de cada impulso." }
  ];
  groups.filter(group => cosmeticFilter === "all" || group.id === cosmeticFilter).forEach(group => {
    const items = cosmeticCatalog.filter(item => item.category === group.id)
      .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "es"));
    const section = document.createElement("section");
    section.className = "cosmetic-group";
    section.dataset.category = group.id;
    const heading = document.createElement("div");
    heading.className = "cosmetic-group-heading";
    heading.innerHTML = `<div><span>${group.id === "trail" ? "01" : group.id === "aura" ? "02" : "03"} / ${group.name.toUpperCase()}</span><h3>${group.name}</h3><p>${group.description}</p></div><small>${items.length} DISEÑOS · MENOR A MAYOR PRECIO</small>`;
    const groupGrid = document.createElement("div");
    groupGrid.className = "cosmetic-group-grid";
    section.append(heading, groupGrid);
    cosmeticGrid.appendChild(section);
    items.forEach((cosmetic) => {
    const owned = ownedCosmetics.includes(cosmetic.id);
    const selected = cosmetic.category === "trail" ? selectedTrail === cosmetic.id
      : cosmetic.category === "aura" ? selectedAura === cosmetic.id
      : selectedDashStyle === cosmetic.id;
    const card = document.createElement("article");
    card.className = `cosmetic-item${selected ? " equipped" : ""}`;
    card.dataset.price = String(cosmetic.price);
    card.dataset.category = cosmetic.category;
    card.style.setProperty("--cosmetic-color", cosmetic.color);
    const preview = document.createElement("canvas");
    preview.className = "cosmetic-preview";
    preview.width = 240; preview.height = 86;
    preview.dataset.cosmetic = cosmetic.id;
    preview.setAttribute("aria-label", `Vista previa de ${cosmetic.name}`);
    const category = document.createElement("span");
    category.className = "cosmetic-category";
    category.textContent = cosmetic.category === "trail" ? "ESTELA" : cosmetic.category === "aura" ? "AURA" : "DASH";
    const title = document.createElement("strong");
    title.textContent = cosmetic.name;
    const description = document.createElement("small");
    description.textContent = cosmetic.description;
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = selected ? "EQUIPADA" : owned ? "EQUIPAR" : `${cosmetic.price} ✦ · COMPRAR`;
    action.disabled = selected;
    if (!owned && fragments < cosmetic.price) action.title = "Necesitas más monedas estelares";
    action.addEventListener("click", () => {
      if (!owned) {
        if (fragments < cosmetic.price) return;
        fragments -= cosmetic.price;
        ownedCosmetics.push(cosmetic.id);
        safeStorageSet(FRAGMENTS_KEY, String(fragments));
        safeStorageSet(COSMETICS_KEY, JSON.stringify(ownedCosmetics));
      }
      if (cosmetic.category === "trail") selectedTrail = cosmetic.id;
      else if (cosmetic.category === "aura") selectedAura = cosmetic.id;
      else selectedDashStyle = cosmetic.id;
      saveSettings();
      renderCosmeticStore();
      playSound("powerUp");
    });
    card.append(preview, category, title, description, action);
    groupGrid.appendChild(card);
    });
  });
  drawCosmeticPreviews(reducePreviewMotion ? 0.6 : performance.now() / 1000);
}

function drawCosmeticPreviews(time) {
  if (!storeScreen.classList.contains("active")) return;
  cosmeticGrid.querySelectorAll("canvas[data-cosmetic]").forEach(canvas => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    const item = cosmeticCatalog.find(entry => entry.id === canvas.dataset.cosmetic);
    CosmeticArt.preview(canvas, item, time, reducePreviewMotion);
  });
}

cosmeticFilters.addEventListener("click", event => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  cosmeticFilter = button.dataset.filter;
  renderCosmeticStore();
});

function openCosmeticStore(returnState) {
  storeReturnState = returnState;
  startScreen.classList.remove("active");
  upgradeScreen.classList.remove("active");
  storeScreen.classList.add("active");
  renderCosmeticStore();
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
  if (cosmeticTrailTimer <= 0 && cosmeticTrail.length < (lowPerformance ? 18 : 36)) {
    cosmeticTrailTimer = lowPerformance ? 0.08 : 0.035;
    cosmeticTrail.push({
      x: player.x + player.width / 2,
      y: player.y + player.height * 0.8,
      life: 0.55,
      maxLife: 0.55,
      size: randomBetween(3, 7),
      phase: randomBetween(0, Math.PI * 2),
      index: cosmeticTrail.length + Math.floor(combatTime * 28)
    });
  }
}

function drawCosmeticTrail() {
  if (selectedTrail === "none") return;
  const cosmetic = cosmeticCatalog.find((item) => item.id === selectedTrail) || cosmeticCatalog[0];
  cosmeticTrail.forEach(point => CosmeticArt.particle(ctx, cosmetic, point, combatTime, lowPerformance));
}

function updateDifficultyAvailability() {
  const unlocked = normalBossVictories > 0;
  const bossRushUnlocked = unlocked && hardBossVictories > 0;
  hardModeInput.disabled = !unlocked;
  hardModeOption.querySelector("span").textContent = unlocked ? "Difícil" : "Difícil 🔒";
  hardModeHint.textContent = unlocked
    ? "Enemigos +22% velocidad, +30% vida y oleadas más rápidas"
    : "Derrota a YACERAMI en modo normal para desbloquearlo";
  if (!unlocked && selectedDifficulty === "hard") {
    selectedDifficulty = "normal";
    startForm.elements.difficulty.value = "normal";
  }
  bossRushInput.disabled = !bossRushUnlocked;
  bossRushOption.querySelector("span").textContent = bossRushUnlocked ? "Boss Rush" : "Boss Rush 🔒";
  bossRushHint.textContent = bossRushUnlocked
    ? "Cinco jefes consecutivos con una mejora entre combates"
    : "Derrota a YACERAMI en modo difícil";
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
  document.body.classList.remove("mobile-session", "mobile-ended");
  updateOrientationGate();
  releaseAllSticks();
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
  return GameRules.isColliding(a, b);
}

function updateSkinDescription() {
  const descriptions = {
    cyan: "Core: cada cuarta ráfaga atraviesa un enemigo extra. Su definitiva lanza tres oleadas dirigidas.",
    violet: "Serenity: sus dos emisores convergen en el blanco y crean un arco al impactar juntos. Su definitiva controla el espacio y da escudo.",
    gold: "Firefly: cada orbe pesado explota al impactar. Su Nova solar recorre y limpia la arena."
  };
  document.getElementById("skinDescription").textContent = descriptions[selectedSkin];
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
  // El navegador exige un gesto del jugador para entrar a pantalla completa.
  // El botón de inicio proporciona ese gesto en teléfonos compatibles.
  if (isTouchPhone()) requestAppFullscreen();
  const typedName = document.getElementById("playerName").value.trim();
  playerName = typedName || "Operador";
  selectedSkin = ownedShips.includes(startForm.elements.skin.value) ? startForm.elements.skin.value : "cyan";
  const requestedDifficulty = startForm.elements.difficulty.value;
  selectedDifficulty = ((requestedDifficulty === "hard" && normalBossVictories < 1) ||
    (requestedDifficulty === "bossrush" && (normalBossVictories < 1 || hardBossVictories < 1)))
    ? "normal" : requestedDifficulty;
  aimMode = startForm.elements.aimMode.value;
  saveSettings();
  startGame();
});

document.querySelectorAll(".ship-unlock").forEach(button =>
  button.addEventListener("click", () => purchaseShip(button.dataset.skin)));

restartButton.addEventListener("click", showStartMenu);
victoryRestartButton.addEventListener("click", showStartMenu);

bestiaryButton.addEventListener("click", () => {
  bestiaryScreen.classList.add("active");
});

storeButton.addEventListener("click", () => openCosmeticStore("menu"));
upgradeStoreButton.addEventListener("click", () => openCosmeticStore("upgrading"));
closeStoreButton.addEventListener("click", closeCosmeticStore);
closeStoreTopButton.addEventListener("click", closeCosmeticStore);

closeBestiaryButton.addEventListener("click", () => {
  bestiaryScreen.classList.remove("active");
});
document.getElementById("closeBestiaryTop").addEventListener("click", () => {
  bestiaryScreen.classList.remove("active");
  bestiaryButton.focus();
});

function controlKeyLabel(key) {
  const labels = { Space: "ESPACIO", Shift: "SHIFT", ArrowUp: "↑", ArrowDown: "↓",
    ArrowLeft: "←", ArrowRight: "→", Enter: "ENTER", Backspace: "BORRAR" };
  return labels[key] || key.toUpperCase();
}

function actionForKey(key) {
  const bound = KEY_ACTIONS.find(action => controlBindings[action.id] === key);
  if (bound) return bound.id;
  const fallback = KEY_ACTIONS.find(action => action.fallback === key);
  return fallback?.id || null;
}

function isActionHeld(actionId) {
  if (keys[controlBindings[actionId]]) return true;
  const fallback = KEY_ACTIONS.find(action => action.id === actionId)?.fallback;
  return !!fallback && !KEY_ACTIONS.some(action => action.id !== actionId &&
    controlBindings[action.id] === fallback) && !!keys[fallback];
}

function renderKeyBindings() {
  keyBindingGrid.textContent = "";
  for (const action of KEY_ACTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action.id;
    if (capturingBinding === action.id) button.classList.add("listening");
    const title = document.createElement("span"); title.textContent = action.label;
    const value = document.createElement("strong");
    value.textContent = capturingBinding === action.id ? "PULSA TECLA" :
      controlKeyLabel(controlBindings[action.id]);
    button.append(title, value);
    button.addEventListener("click", () => {
      capturingBinding = action.id;
      keyBindingMessage.textContent = `Pulsa la nueva tecla para ${action.label.toLowerCase()}. Escape cancela.`;
      renderKeyBindings();
      keyBindingGrid.querySelector(`[data-action="${action.id}"]`)?.focus();
    });
    keyBindingGrid.append(button);
  }
  keyHint.textContent = `MOV: ${["up", "left", "down", "right"]
    .map(id => controlKeyLabel(controlBindings[id])).join("/")} · DASH: ${controlKeyLabel(controlBindings.dash)} · ULT: ${controlKeyLabel(controlBindings.ultimate)}`;
}

function assignControlKey(actionId, key) {
  const oldKey = controlBindings[actionId];
  if (oldKey === key) {
    capturingBinding = null;
    keyBindingMessage.textContent = "Esa tecla ya estaba asignada a esta acción.";
    renderKeyBindings();
    return;
  }
  const conflict = KEY_ACTIONS.find(action => action.id !== actionId &&
    controlBindings[action.id] === key);
  controlBindings[actionId] = key;
  if (conflict) controlBindings[conflict.id] = oldKey;
  capturingBinding = null;
  keys = {};
  saveSettings();
  renderKeyBindings();
  keyBindingMessage.textContent = conflict
    ? `Tecla cambiada. ${conflict.label} ahora usa ${controlKeyLabel(oldKey)}.`
    : `Tecla guardada: ${controlKeyLabel(key)}.`;
}

resetKeyBindingsButton.addEventListener("click", () => {
  controlBindings = { ...DEFAULT_BINDINGS };
  capturingBinding = null;
  keys = {};
  saveSettings(); renderKeyBindings();
  keyBindingMessage.textContent = "Teclas originales restablecidas.";
});

window.addEventListener("keydown", (event) => {
  const key = normalizeControlKey(event.key);
  if (capturingBinding) {
    event.preventDefault(); event.stopPropagation();
    if (key === "Escape") {
      capturingBinding = null; renderKeyBindings();
      keyBindingMessage.textContent = "Cambio cancelado.";
    } else if (canBindKey(key)) assignControlKey(capturingBinding, key);
    else keyBindingMessage.textContent = "Elige una letra, número, flecha, Shift o Espacio.";
    return;
  }
  if (key === "Escape" && bestiaryScreen.classList.contains("active")) {
    bestiaryScreen.classList.remove("active");
    bestiaryButton.focus();
    return;
  }
  if (touchEditing || event.target instanceof HTMLElement &&
    event.target.closest("input, textarea, select, button, [contenteditable='true']")) return;
  const action = actionForKey(key);
  if (action) event.preventDefault();
  if (action === "pause" && !event.repeat) togglePause();
  if (action === "dash" && !event.repeat) useDash();
  if (action === "ultimate" && !event.repeat) useUltimate();
  keys[key] = true;
});

window.addEventListener("keyup", (event) => {
  const key = normalizeControlKey(event.key);
  keys[key] = false;
});

// Pausa solo si la pestaña queda realmente oculta. El evento blur también se
// activa al tocar controles del navegador integrado y congelaba la partida.
document.addEventListener("visibilitychange", () => {
  keys = {};
  releaseAllSticks();
  if (document.hidden && gameState === "playing") {
    pausedByVisibility = true;
    togglePause();
  } else if (!document.hidden && pausedByVisibility && gameState === "paused") {
    pausedByVisibility = false;
    togglePause();
  }
});

function currentTouchOrientation() { return innerWidth > innerHeight ? "landscape" : "portrait"; }

function isTouchPhone() {
  return navigator.maxTouchPoints > 0 && Math.min(innerWidth, innerHeight) <= 600 &&
    Math.max(innerWidth, innerHeight) <= 1000;
}

function isInstalledApp() {
  return window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

async function requestAppFullscreen() {
  if (isInstalledApp() || document.fullscreenElement) return true;
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      await requestLandscapeMode();
      return true;
    }
  } catch (error) {
    // Algunos navegadores solo aceptan pantalla completa desde un gesto directo.
  }
  return false;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !["http:", "https:"].includes(location.protocol)) return;
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js")
    .catch(() => { /* El juego continúa normalmente aunque falle el modo sin conexión. */ }));
}

function updateOrientationGate() {
  const wasBlocked = orientationBlocked;
  // En teléfono toda la experiencia (incluido el menú) se usa en horizontal.
  // No dependemos de que la misión haya comenzado para mostrar este aviso.
  orientationBlocked = isTouchPhone() && currentTouchOrientation() === "portrait";
  document.body.classList.toggle("orientation-blocked", orientationBlocked);
  if (orientationBlocked) {
    releaseAllSticks();
    stopMusic();
  } else if (wasBlocked && gameState === "playing") {
    lastTime = performance.now();
    startMusic();
  }
}

async function requestLandscapeMode() {
  if (!isTouchPhone() || currentTouchOrientation() === "landscape") return;
  try {
    if (screen.orientation?.lock) await screen.orientation.lock("landscape");
  } catch (error) {
    // iOS y varios navegadores solo permiten bloquear orientación en pantalla completa.
    // La pantalla de giro permanece visible como alternativa segura.
  }
  updateOrientationGate();
}

function touchControlElements() {
  return { move: moveStick, aim: aimStick, dash: mobileDash, ultimate: mobileUltimate };
}

function applyTouchLayout() {
  const layout = touchLayouts[currentTouchOrientation()];
  const deckWidth = mobileControls.clientWidth || innerWidth;
  const deckHeight = mobileControls.clientHeight || 194;
  for (const [id, element] of Object.entries(touchControlElements())) {
    const point = layout[id];
    const halfWidth = (element.offsetWidth || (id === "move" || id === "aim" ? 142 : 58)) / 2;
    const halfHeight = (element.offsetHeight || (id === "move" || id === "aim" ? 142 : 58)) / 2;
    const x = clamp(point.x * deckWidth, halfWidth + 5, deckWidth - halfWidth - 5);
    const y = clamp(point.y * deckHeight, halfHeight + 5, deckHeight - halfHeight - 5);
    element.style.left = `${x / deckWidth * 100}%`;
    element.style.top = `${y / deckHeight * 100}%`;
  }
}

function touchPointFromEvent(event, id) {
  const bounds = mobileControls.getBoundingClientRect();
  const element = touchControlElements()[id];
  const halfWidth = element.offsetWidth / 2, halfHeight = element.offsetHeight / 2;
  return { x: clamp((event.clientX - bounds.left), halfWidth + 5,
      bounds.width - halfWidth - 5) / bounds.width,
    y: clamp((event.clientY - bounds.top), halfHeight + 5,
      bounds.height - halfHeight - 5) / bounds.height };
}

function touchLayoutPositionValid(id) {
  const layout = touchLayouts[currentTouchOrientation()];
  const bounds = mobileControls.getBoundingClientRect();
  const element = touchControlElements()[id];
  const center = layout[id];
  const radius = id === "move" || id === "aim"
    ? element.querySelector(".stick-face").offsetWidth / 2 : element.offsetWidth / 2;
  return Object.entries(touchControlElements()).every(([otherId, other]) => {
    if (otherId === id) return true;
    const otherPoint = layout[otherId];
    const otherRadius = otherId === "move" || otherId === "aim"
      ? other.querySelector(".stick-face").offsetWidth / 2 : other.offsetWidth / 2;
    const range = Math.hypot((center.x - otherPoint.x) * bounds.width,
      (center.y - otherPoint.y) * bounds.height);
    return range >= radius + otherRadius + 8;
  });
}

function openTouchEditor() {
  if (touchEditing) return;
  touchEditorWasPlaying = gameState === "playing";
  if (touchEditorWasPlaying) togglePause();
  touchEditorSnapshot = loadTouchLayouts(touchLayouts);
  touchEditing = true;
  document.body.classList.add("control-editing");
  touchEditor.hidden = false;
  mobileControls.classList.add("editing");
  releaseAllSticks();
  applyTouchLayout();
  touchEditorMessage.textContent = currentTouchOrientation() === "portrait"
    ? "Ajustando controles verticales." : "Ajustando controles horizontales.";
  saveTouchLayoutButton.focus();
}

function closeTouchEditor(save) {
  if (!touchEditing) return;
  if (!save) touchLayouts = touchEditorSnapshot;
  touchEditing = false;
  touchDrag = null;
  document.body.classList.remove("control-editing");
  touchEditor.hidden = true;
  mobileControls.classList.remove("editing");
  applyTouchLayout();
  if (save) saveSettings();
  if (touchEditorWasPlaying && gameState === "paused") togglePause();
  touchEditorWasPlaying = false;
}

editTouchMenu.addEventListener("click", openTouchEditor);
editTouchGame.addEventListener("click", openTouchEditor);
saveTouchLayoutButton.addEventListener("click", () => closeTouchEditor(true));
cancelTouchLayoutButton.addEventListener("click", () => closeTouchEditor(false));
resetTouchLayoutButton.addEventListener("click", () => {
  const orientation = currentTouchOrientation();
  touchLayouts[orientation] = loadTouchLayouts(DEFAULT_TOUCH_LAYOUTS)[orientation];
  applyTouchLayout();
  touchEditorMessage.textContent = "Distribución original de esta orientación restablecida.";
});

for (const [id, element] of Object.entries(touchControlElements())) {
  element.addEventListener("pointerdown", event => {
    if (!touchEditing || touchDrag) return;
    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    touchDrag = { id, pointerId: event.pointerId,
      previous: { ...touchLayouts[currentTouchOrientation()][id] } };
    element.classList.add("dragging");
  });
  element.addEventListener("pointermove", event => {
    if (!touchEditing || touchDrag?.pointerId !== event.pointerId || touchDrag.id !== id) return;
    touchLayouts[currentTouchOrientation()][id] = touchPointFromEvent(event, id);
    applyTouchLayout();
  });
  const finishDrag = event => {
    if (!touchEditing || touchDrag?.pointerId !== event.pointerId || touchDrag.id !== id) return;
    if (!touchLayoutPositionValid(id)) {
      touchLayouts[currentTouchOrientation()][id] = touchDrag.previous;
      touchEditorMessage.textContent = "Deja un espacio entre controles para poder usarlos.";
    } else touchEditorMessage.textContent = `${id === "move" ? "Movimiento" : id === "aim"
      ? "Puntería" : id === "dash" ? "Dash" : "Ultimate"} colocado.`;
    touchDrag = null;
    element.classList.remove("dragging");
    applyTouchLayout();
  };
  element.addEventListener("pointerup", finishDrag);
  element.addEventListener("pointercancel", finishDrag);
}

window.addEventListener("resize", () => {
  touchDrag = null;
  document.querySelectorAll(".mobile-controls .dragging").forEach(item => item.classList.remove("dragging"));
  releaseAllSticks();
  updateOrientationGate();
  applyTouchLayout();
  if (touchEditing) touchEditorMessage.textContent = currentTouchOrientation() === "portrait"
    ? "Ajustando controles verticales." : "Ajustando controles horizontales.";
});

// El joystick flota hacia el pulgar y conserva el control aunque el dedo salga del círculo.
function readStick(event, stick, knob) {
  const id = stick === moveStick ? "move" : "aim";
  const active = stickPointers[id];
  if (!active) return { x: 0, y: 0 };
  const radius = stick.querySelector(".stick-face").offsetWidth * .44;
  const dx = event.clientX - active.originX;
  const dy = event.clientY - active.originY;
  const distance = Math.hypot(dx, dy);
  const visualX = distance ? dx / distance * Math.min(distance, radius) : 0;
  const visualY = distance ? dy / distance * Math.min(distance, radius) : 0;
  knob.style.transform = `translate(calc(-50% + ${visualX}px), calc(-50% + ${visualY}px))`;
  const deadzone = radius * .09;
  const strength = distance < deadzone ? 0 : Math.min(1,
    (distance - deadzone) / (radius * .7 - deadzone));
  return { x: distance ? dx / distance * strength : 0, y: distance ? dy / distance * strength : 0 };
}

function beginStick(event, id, stick, knob) {
  if (touchEditing || gameState !== "playing" || stickPointers[id]) return false;
  event.preventDefault();
  stick.setPointerCapture(event.pointerId);
  const bounds = stick.getBoundingClientRect();
  const face = stick.querySelector(".stick-face");
  const half = face.offsetWidth / 2;
  face.style.left = `${clamp(event.clientX - bounds.left, half, bounds.width - half)}px`;
  face.style.top = `${clamp(event.clientY - bounds.top, half, bounds.height - half)}px`;
  knob.style.transform = "translate(-50%, -50%)";
  stickPointers[id] = { pointerId: event.pointerId, originX: event.clientX, originY: event.clientY };
  stick.classList.add("active");
  return true;
}

function endStick(id, pointerId) {
  const active = stickPointers[id];
  if (!active || pointerId !== undefined && active.pointerId !== pointerId) return;
  stickPointers[id] = null;
  const stick = id === "move" ? moveStick : aimStick;
  const knob = id === "move" ? moveKnob : aimKnob;
  stick.classList.remove("active");
  stick.querySelector(".stick-face").style.left = "50%";
  stick.querySelector(".stick-face").style.top = "50%";
  knob.style.transform = "translate(-50%, -50%)";
  if (id === "move") touchMovement = { x: 0, y: 0, active: false };
  else manualAim.stickActive = false;
}

function releaseAllSticks() { endStick("move"); endStick("aim"); }

moveStick.addEventListener("pointerdown", event => {
  if (!beginStick(event, "move", moveStick, moveKnob)) return;
  touchMovement = { x: 0, y: 0, active: true };
});
moveStick.addEventListener("pointermove", event => {
  if (stickPointers.move?.pointerId === event.pointerId)
    touchMovement = { ...readStick(event, moveStick, moveKnob), active: true };
});
moveStick.addEventListener("pointerup", event => endStick("move", event.pointerId));
moveStick.addEventListener("pointercancel", event => endStick("move", event.pointerId));
moveStick.addEventListener("lostpointercapture", event => endStick("move", event.pointerId));

mobileDash.addEventListener("pointerdown", (event) => {
  if (touchEditing) return;
  event.preventDefault();
  useDash();
});

mobileUltimate.addEventListener("pointerdown", (event) => {
  if (touchEditing) return;
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
  GameAudio.setVolumes(musicVolume, effectsVolume);
  musicVolumeValue.textContent = `${musicVolumeSlider.value}%`;
  saveSettings();
});

effectsVolumeSlider.addEventListener("input", () => {
  effectsVolume = Number(effectsVolumeSlider.value) / 100;
  GameAudio.setVolumes(musicVolume, effectsVolume);
  effectsVolumeValue.textContent = `${effectsVolumeSlider.value}%`;
  saveSettings();
});

document.querySelectorAll("input[name='skin']").forEach((radio) => {
  radio.addEventListener("change", () => {
    selectedSkin = radio.value;
    updateSkinDescription();
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

damageNumbersToggle.addEventListener("change", () => {
  showDamageNumbers = damageNumbersToggle.checked;
  if (!showDamageNumbers) damageNumbers = [];
  saveSettings();
});

canvas.addEventListener("pointermove", (event) => {
  const bounds = canvas.getBoundingClientRect();
  manualAim.x = (event.clientX - bounds.left) * (GAME_WIDTH / bounds.width);
  manualAim.y = (event.clientY - bounds.top) * (GAME_HEIGHT / bounds.height);
  manualAim.hasPointer = true;
});

const updateAimStick = (event) => {
  const direction = readStick(event, aimStick, aimKnob);
  if (Math.hypot(direction.x, direction.y) < 0.05) return;
  const length = Math.hypot(direction.x, direction.y);
  manualAim.vectorX = direction.x / length;
  manualAim.vectorY = direction.y / length;
  manualAim.hasDirection = true;
  manualAim.stickActive = true;
  if (aimMode !== "manual") {
    aimMode = "manual";
    startForm.elements.aimMode.value = "manual";
    saveSettings();
  }
};

aimStick.addEventListener("pointerdown", (event) => {
  if (!beginStick(event, "aim", aimStick, aimKnob)) return;
  updateAimStick(event);
});
aimStick.addEventListener("pointermove", (event) => {
  if (stickPointers.aim?.pointerId === event.pointerId) updateAimStick(event);
});
aimStick.addEventListener("pointerup", event => endStick("aim", event.pointerId));
aimStick.addEventListener("pointercancel", event => endStick("aim", event.pointerId));
aimStick.addEventListener("lostpointercapture", event => endStick("aim", event.pointerId));

requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(gameLoop);
});
