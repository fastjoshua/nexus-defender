const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../js/game-rules.js');

test('colisiones: contacto real, margen justo y separación', () => {
  const player = { x: 10, y: 10, width: 40, height: 40 };
  assert.equal(rules.isColliding(player, { x: 42, y: 20, width: 20, height: 20 }), true);
  assert.equal(rules.isColliding(player, { x: 50, y: 20, width: 20, height: 20 }), false);
  assert.equal(rules.isColliding(player, { x: 25, y: 50, width: 20, height: 20 }), false);
});

test('puntuación: tiempo, enemigo normal/disparador y jefes', () => {
  assert.equal(rules.scoreForTime(1, 1), 12);
  assert.equal(rules.scoreForTime(-1, 1), 0);
  assert.equal(rules.scoreForEnemy(false), 35);
  assert.equal(rules.scoreForEnemy(true), 90);
  assert.equal(rules.scoreForBoss(3, false), 1200);
  assert.equal(rules.scoreForBoss(15, true), 6000);
});

test('progresión: 20 segundos por nivel y máximo 15', () => {
  assert.equal(rules.levelAtTime(0), 1);
  assert.equal(rules.levelAtTime(19.999), 1);
  assert.equal(rules.levelAtTime(20), 2);
  assert.equal(rules.levelAtTime(40), 3);
  assert.equal(rules.levelAtTime(999), 15);
});

test('Ultimate: máximo 25% de la vida máxima', () => {
  assert.equal(rules.ultimateBossBudget(100), 25);
  assert.equal(rules.ultimateBossBudget(300), 75);
});

test('jefe: nunca supera 20% en una ventana móvil de un segundo', () => {
  const history = [{ time: 10, amount: 12 }, { time: 10.4, amount: 7 }, { time: 9, amount: 40 }];
  const budget = rules.bossDamageBudget(100, history, 10.5);
  assert.equal(budget.recent.length, 2);
  assert.equal(budget.available, 1);
  const exhausted = rules.bossDamageBudget(100, [...budget.recent, { time: 10.5, amount: 1 }], 10.6);
  assert.equal(exhausted.available, 0);
  assert.equal(rules.bossDamageBudget(100, exhausted.recent, 11.5).available, 20);
});
