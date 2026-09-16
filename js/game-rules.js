"use strict";

/* Reglas independientes del navegador. También se ejecutan en las pruebas. */
const GameRules = (() => {
  const LEVEL_DURATION = 20;
  const BOSS_DAMAGE_PER_SECOND = 0.20;
  const ULTIMATE_BOSS_CAP = 0.25;

  function isColliding(a, b, margin = 5) {
    return a.x + margin < b.x + b.width &&
      a.x + a.width - margin > b.x &&
      a.y + margin < b.y + b.height &&
      a.y + a.height - margin > b.y;
  }

  function levelAtTime(seconds) {
    return Math.min(15, Math.floor(Math.max(0, seconds) / LEVEL_DURATION) + 1);
  }

  function scoreForTime(deltaTime, level) {
    return Math.max(0, deltaTime) * (10 + level * 2);
  }

  function scoreForEnemy(shoots) { return shoots ? 90 : 35; }
  function scoreForBoss(level, final) { return final ? 6000 : 1200 * (level / 3); }

  function ultimateBossBudget(maxHealth) {
    return Math.max(0, maxHealth) * ULTIMATE_BOSS_CAP;
  }

  // La ventana es móvil: no se puede superar 20% en ningún segundo consecutivo.
  function bossDamageBudget(maxHealth, history, now) {
    const recent = history.filter(hit => now - hit.time < 1);
    const used = recent.reduce((total, hit) => total + hit.amount, 0);
    return { recent, available: Math.max(0, maxHealth * BOSS_DAMAGE_PER_SECOND - used) };
  }

  return { LEVEL_DURATION, BOSS_DAMAGE_PER_SECOND, ULTIMATE_BOSS_CAP,
    isColliding, levelAtTime, scoreForTime, scoreForEnemy, scoreForBoss,
    ultimateBossBudget, bossDamageBudget };
})();

if (typeof module !== "undefined") module.exports = GameRules;
