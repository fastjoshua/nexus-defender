"use strict";

// Each archetype owns its state and intent. Combat applies motion and collision
// after this step, so warnings always appear before a dangerous action.
const EnemyBehavior = (() => {
  const TAU = Math.PI * 2;
  function center(object) { return { x: object.x + object.width / 2, y: object.y + object.height / 2 }; }
  function distance(a, b) { const ac = center(a), bc = center(b); return Math.hypot(ac.x - bc.x, ac.y - bc.y); }
  function steer(threat, x, y, amount) {
    const c = center(threat), angle = Math.atan2(y - c.y, x - c.x);
    const mix = Math.min(1, amount);
    threat.velocityX += (Math.cos(angle) * threat.speed - threat.velocityX) * mix;
    threat.velocityY += (Math.sin(angle) * threat.speed - threat.velocityY) * mix;
  }
  const arenaCanvas = typeof document === "undefined" ? null : document.getElementById("gameCanvas");
  function planMove(threat, brain, desiredX, desiredY, multiplier, duration) {
    const c = center(threat), dx = desiredX - c.x, dy = desiredY - c.y;
    const length = Math.hypot(dx, dy) || 1;
    const distance = Math.min(length, threat.speed * multiplier * duration);
    const width = arenaCanvas?.width || 1200, height = arenaCanvas?.height || 750;
    const marginX = threat.width / 2 + 8, marginY = threat.height / 2 + 8;
    brain.startX = c.x; brain.startY = c.y;
    brain.targetX = Math.max(marginX, Math.min(width - marginX, c.x + dx / length * distance));
    brain.targetY = Math.max(marginY, Math.min(height - marginY, c.y + dy / length * distance));
    brain.moveDuration = duration; brain.progress = 0;
  }
  // The same stored endpoint drives both the warning and the real movement.
  function advance(threat, dt, slowFactor = 1) {
    const b = threat.brain;
    if (!b || !["step", "rush", "fly"].includes(b.mode) ||
        !Number.isFinite(b.startX) || !Number.isFinite(b.targetX) || b.moveDuration <= 0) return false;
    b.progress = Math.min(1, b.progress + dt * slowFactor / b.moveDuration);
    const c = center(threat);
    const nextX = b.startX + (b.targetX - b.startX) * b.progress;
    const nextY = b.startY + (b.targetY - b.startY) * b.progress;
    threat.velocityX = (nextX - c.x) / Math.max(dt, 0.001);
    threat.velocityY = (nextY - c.y) / Math.max(dt, 0.001);
    threat.x += nextX - c.x; threat.y += nextY - c.y;
    if (b.progress >= 1) {
      const cooldown = b.mode === "step" ? 1.05 : b.mode === "rush" ? 1.8 : 3.2;
      b.mode = "travel"; b.cooldown = cooldown;
    }
    return true;
  }
  function initialize(threat) {
    if (threat.brain) return threat.brain;
    const id = threat.type.icon;
    const brain = {
      id, age: 0, mode: "travel", timer: 0, cooldown: 0,
      targetX: 0, targetY: 0, baseX: threat.velocityX, baseY: threat.velocityY,
      gapIndex: Math.floor(Math.random() * 8), cycle: 0
    };
    if (id === "skull") brain.cooldown = 0.35;
    if (id === "eye") brain.cooldown = 1.1;
    if (id === "glitch") brain.cooldown = 0.8;
    if (id === "orbiter") brain.cooldown = 2;
    if (id === "tank") brain.cooldown = 2.4;
    if (id === "phantom") brain.timer = 1.3;
    threat.brain = brain;
    return brain;
  }
  function step(threat, player, dt, arena) {
    const b = initialize(threat), id = b.id;
    b.age += dt; b.cooldown = Math.max(0, b.cooldown - dt);
    if (id === "bug") {
      // VIRUS does not track the player. Its straight advance becomes a pair
      // of weak spores when the mother is destroyed by an ordinary shot.
      threat.velocityX = b.baseX;
      threat.velocityY = b.baseY;
    } else if (id === "skull") {
      // BOT measures a lane, announces it, then makes a square-step dash.
      if (b.mode === "travel") {
        threat.velocityX = b.baseX * 0.55; threat.velocityY = b.baseY * 0.55;
        if (b.cooldown <= 0 && arena(threat)) {
          const p = center(player), c = center(threat);
          const predictX = p.x + (player.motionX || 0) * 0.35;
          const predictY = p.y + (player.motionY || 0) * 0.35;
          const horizontal = Math.abs(predictX - c.x) > Math.abs(predictY - c.y);
          planMove(threat, b, horizontal ? predictX : c.x, horizontal ? c.y : predictY, 2.05, 0.31);
          b.mode = "scan"; b.timer = 0.36;
          threat.velocityX = 0; threat.velocityY = 0;
        }
      } else if (b.mode === "scan") {
        b.timer -= dt; threat.velocityX = 0; threat.velocityY = 0;
        if (b.timer <= 0) {
          b.mode = "step"; b.timer = 0.31;
        }
      } else {
        // advance() completes the step at the announced endpoint.
      }
    } else if (id === "mail") {
      // SPAM is small, fast and banks against the sides instead of homing.
      threat.velocityY = Math.max(b.baseY, threat.speed * 0.78);
      if (b.age > 0.4 && Math.abs(threat.velocityX) < threat.speed * 0.42) {
        threat.velocityX = (threat.side === "right" ? -1 : 1) * threat.speed * 0.68;
      }
      if (threat.x <= 8 && threat.velocityX < 0 ||
          threat.x + threat.width >= (arenaCanvas?.width || 1200) - 8 && threat.velocityX > 0) {
        threat.velocityX *= -1; b.cycle++;
      }
    } else if (id === "turret") {
      // The shot itself is fired by combat. Once charged, the target is locked
      // so a sidestep during the visible warning can evade the bullet.
      if (arena(threat)) {
        threat.velocityX *= Math.pow(0.05, dt);
        threat.velocityY *= Math.pow(0.05, dt);
      }
      if (distance(threat, player) < 115) steer(threat, center(threat).x, Math.max(25, center(threat).y - 70), dt * 2);
      if (threat.shotTimer <= 0.62 && b.mode !== "lock") {
        b.targetX = center(player).x; b.targetY = center(player).y; b.mode = "lock";
      }
    } else if (id === "eye") {
      // HUNTER first follows, then marks a predicted point before a brief rush.
      if (b.mode === "travel") {
        const p = center(player);
        steer(threat, p.x + (player.motionX || 0) * 0.3, p.y + (player.motionY || 0) * 0.3, dt * 1.75);
        if (b.cooldown <= 0 && distance(threat, player) < 220) {
          planMove(threat, b, p.x + (player.motionX || 0) * 0.28,
            p.y + (player.motionY || 0) * 0.28, 2.4, 0.28);
          b.mode = "mark"; b.timer = 0.44;
          threat.velocityX = 0; threat.velocityY = 0;
        }
      } else if (b.mode === "mark") {
        b.timer -= dt; threat.velocityX = 0; threat.velocityY = 0;
        if (b.timer <= 0) {
          b.mode = "rush"; b.timer = 0.28;
        }
      } else {
        // advance() reaches the locked mark, even during a slow effect.
      }
    } else if (id === "glitch") {
      // GLITCH teleports only to its visible echo, clear of the player's body.
      b.timer = Math.max(0, b.timer - dt);
      if (b.mode === "travel" && b.cooldown <= 0 && arena(threat)) {
        const c = center(threat), p = center(player);
        const sign = Math.sin(b.age * 3) < 0 ? -1 : 1;
        const width = arenaCanvas?.width || 1200, height = arenaCanvas?.height || 750;
        let x = Math.max(28, Math.min(width - 28, c.x + sign * 130));
        let y = Math.max(30, Math.min(height - 30, c.y + (p.y > c.y ? 65 : -65)));
        if (Math.hypot(x - p.x, y - p.y) < 95) {
          x = Math.max(28, Math.min(width - 28, c.x - sign * 130)); y = c.y;
        }
        b.targetX = x; b.targetY = y;
        b.mode = "echo"; b.timer = 0.43;
      } else if (b.mode === "echo" && b.timer <= 0) {
        threat.x = b.targetX - threat.width / 2;
        threat.y = b.targetY - threat.height / 2;
        b.mode = "travel"; b.cooldown = 1.45; b.cycle++;
      }
      threat.velocityX = b.baseX; threat.velocityY = b.baseY;
    } else if (id === "tank") {
      // Heavy armor advances persistently; close encounters trigger a stomp.
      threat.velocityX = b.baseX; threat.velocityY = b.baseY;
      if (b.mode === "travel" && b.cooldown <= 0 && distance(threat, player) < 155) { b.mode = "stomp"; b.timer = 0.78; }
      if (b.mode === "stomp") {
        b.timer -= dt;
        threat.velocityX *= 0.2; threat.velocityY *= 0.2;
        if (b.timer <= 0) { b.mode = "impact"; b.timer = 0.2; b.cooldown = 3.6; return { stomp: true }; }
      } else if (b.mode === "impact") {
        b.timer -= dt;
        if (b.timer <= 0) b.mode = "travel";
      }
    } else if (id === "orbiter") {
      // ORBITER flies tangentially around the player, then slingshots straight
      // through the point it marked. It does not continuously home like HUNTER.
      if (b.mode === "travel") {
        const c = center(threat), p = center(player);
        const dx = p.x - c.x, dy = p.y - c.y, range = Math.hypot(dx, dy) || 1;
        const tangent = [-dy / range, dx / range];
        const pull = Math.max(-0.65, Math.min(0.8, (range - 125) / 125));
        const vx = (tangent[0] + dx / range * pull) * threat.speed;
        const vy = (tangent[1] + dy / range * pull) * threat.speed;
        threat.velocityX += (vx - threat.velocityX) * Math.min(1, dt * 2.3);
        threat.velocityY += (vy - threat.velocityY) * Math.min(1, dt * 2.3);
        if (b.cooldown <= 0 && range < 190) {
          planMove(threat, b, p.x, p.y, 2.15, 0.34);
          b.mode = "sling"; b.timer = 0.38;
          threat.velocityX = 0; threat.velocityY = 0;
        }
      } else if (b.mode === "sling") {
        b.timer -= dt; threat.velocityX = 0; threat.velocityY = 0;
        if (b.timer <= 0) {
          b.mode = "fly"; b.timer = 0.34;
        }
      } else {
        // advance() ends the flight at the exact destination.
      }
    } else if (id === "mine") {
      if (arena(threat)) {
        threat.velocityX *= Math.pow(0.08, dt);
        threat.velocityY *= Math.pow(0.08, dt);
      }
    } else if (id === "phantom") {
      // In the ethereal window both contact and bullets pass through it.
      b.timer -= dt;
      if (b.timer <= 0) {
        b.mode = b.mode === "ethereal" ? "travel" : "ethereal";
        b.timer = b.mode === "ethereal" ? 0.75 : 1.35;
      }
      if (b.mode === "ethereal") {
        const p = center(player), c = center(threat);
        const sign = Math.sin(b.age * 2) < 0 ? -1 : 1;
        steer(threat, p.x + sign * 120, p.y - 60, dt * 1.8);
      } else {
        threat.velocityX += Math.sin(b.age * 4) * 35 * dt;
        threat.velocityY += Math.cos(b.age * 3) * 20 * dt;
      }
    }
    return {};
  }
  function spores(mother, limit) {
    if (mother.type.icon !== "bug" || mother.isSpore || limit >= 40) return [];
    const c = center(mother), size = Math.max(17, Math.min(23, mother.baseSize * 0.42));
    return [-1, 1].map(sign => ({
      ...mother, x: c.x + sign * size - size / 2, y: c.y - size / 2,
      width: size, height: size, baseSize: size, health: 1, maxHealth: 1,
      speed: mother.speed * 1.22, velocityX: sign * mother.speed * 0.66,
      velocityY: Math.max(60, mother.velocityY),
      shotTimer: 999, shotInterval: 999, isSpore: true, brain: null,
      sizePulse: 0, rotation: 0, rotationSpeed: sign * 2.8
    }));
  }
  function signal(ctx, threat, player, now) {
    const b = threat.brain;
    if (!b || !player) return;
    const c = center(threat);
    ctx.save(); ctx.lineWidth = 1.5;
    let x = b.targetX, y = b.targetY, color = threat.type.color;
    if (b.id === "bug" && !threat.isSpore) {
      ctx.setLineDash([]); ctx.strokeStyle = color; ctx.globalAlpha = 0.62;
      for (const sign of [-1, 1]) {
        ctx.beginPath(); ctx.arc(c.x + sign * threat.width * 0.28, c.y + threat.height * 0.2, 3.5, 0, TAU); ctx.stroke();
      }
    } else if (b.mode === "scan" || b.mode === "mark" || b.mode === "sling" || b.mode === "echo") {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.006) ** 2;
      ctx.strokeStyle = color;
      if (b.mode === "echo") {
        // El destino del Glitch se ve como un eco suave, no una caja punteada.
        ctx.globalAlpha = 0.22 + pulse * 0.1;
        ctx.strokeRect(x - threat.width / 2, y - threat.height / 2, threat.width, threat.height);
      } else {
        ctx.globalAlpha = 0.25 + pulse * 0.1;
        ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.5 + pulse * 0.13;
        ctx.strokeRect(x - threat.width / 2, y - threat.height / 2, threat.width, threat.height);
        ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.stroke();
      }
    } else if (b.id === "turret" && b.mode === "lock" && threat.shotTimer > 0) {
      // El Sniper conserva la ruta completa para que el disparo sea justo.
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(x, y); ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
    } else if (b.id === "mine" && threat.shotTimer <= 0.78 && threat.shotTimer > 0) {
      // The amber spokes show the exact eight radial lanes and the open gap.
      const charge = 1 - threat.shotTimer / 0.78;
      const radius = 108;
      ctx.setLineDash([]);
      ctx.strokeStyle = "#ffb347";
      ctx.lineWidth = 2 + charge * 1.5;
      ctx.globalAlpha = 0.16 + charge * 0.42;
      ctx.beginPath(); ctx.arc(c.x, c.y, radius, 0, TAU); ctx.stroke();
      for (let lane = 0; lane < 8; lane++) {
        const angle = threat.rotation + lane * TAU / 8;
        const safe = lane === b.gapIndex;
        ctx.strokeStyle = safe ? "#43ff9b" : "#ffb347";
        ctx.globalAlpha = safe ? 0.45 + charge * 0.35 : 0.15 + charge * 0.42;
        ctx.beginPath(); ctx.moveTo(c.x + Math.cos(angle) * 34, c.y + Math.sin(angle) * 34);
        ctx.lineTo(c.x + Math.cos(angle) * radius, c.y + Math.sin(angle) * radius); ctx.stroke();
      }
      const safeAngle = threat.rotation + b.gapIndex * TAU / 8;
      ctx.strokeStyle = "#43ff9b"; ctx.globalAlpha = 0.48 + charge * 0.36;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(c.x, c.y, radius, safeAngle - TAU / 16, safeAngle + TAU / 16); ctx.stroke();
    } else if (b.id === "tank" && (b.mode === "stomp" || b.mode === "impact")) {
      ctx.setLineDash([]); ctx.strokeStyle = color;
      ctx.globalAlpha = b.mode === "stomp" ? 0.35 + 0.5 * (1 - b.timer / 0.78) : 0.85;
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c.x, c.y, 94, 0, TAU); ctx.stroke();
    } else if (b.id === "phantom" && b.mode === "ethereal") {
      ctx.setLineDash([]); ctx.strokeStyle = b.timer < 0.25 ? "#ffe0f3" : color;
      ctx.globalAlpha = b.timer < 0.25 ? 0.82 : 0.35;
      ctx.beginPath(); ctx.arc(c.x, c.y, threat.width * 0.48, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }
  return Object.freeze({ center, distance, initialize, step, advance, spores, signal });
})();
