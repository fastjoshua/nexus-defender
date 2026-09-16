/* Shared canvas art for the shop previews and the equipped effects. */
const CosmeticArt = (() => {
  const TAU = Math.PI * 2;
  function star(ctx, x, y, r, spikes = 5) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = i * Math.PI / spikes - Math.PI / 2;
      const length = i % 2 ? r * 0.42 : r;
      if (i === 0) ctx.moveTo(x + Math.cos(a) * length, y + Math.sin(a) * length);
      else ctx.lineTo(x + Math.cos(a) * length, y + Math.sin(a) * length);
    }
    ctx.closePath(); ctx.fill();
  }
  function particle(ctx, item, point, time = 0, reduced = false) {
    if (!item || item.id === "none") return;
    const life = Math.max(0, point.life / point.maxLife);
    const phase = point.phase || 0;
    const x = point.x + (reduced ? 0 : Math.sin(time * 3 + phase) * (item.motif === "orbit" ? 9 : 2));
    const y = point.y - (item.motif === "bubble" ? (1 - life) * 9 : 0);
    const r = Math.max(1, point.size * (0.32 + life * 0.68));
    const color = point.index % 3 === 0 ? (item.accent || item.color) : item.color;
    ctx.save(); ctx.globalAlpha *= life * (item.motif === "ghost" && point.index % 2 ? 0.55 : 0.92);
    ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.shadowColor = color; ctx.shadowBlur = reduced ? 0 : (item.motif === "pixel" ? 0 : 9);
    ctx.lineWidth = Math.max(1.2, r * 0.35);
    if (item.motif === "comet" || item.motif === "rain" || item.motif === "lightning") {
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(phase) * (item.motif === "lightning" ? 5 : 2), y + r * (item.motif === "rain" ? 3.4 : 2.4));
      ctx.stroke();
    }
    if (item.shape === "ring") {
      ctx.beginPath(); ctx.arc(x, y, r + 1, 0, TAU); ctx.stroke();
      if (item.motif === "orbit") { ctx.beginPath(); ctx.arc(x + r, y, r * 0.28, 0, TAU); ctx.fill(); }
    } else if (item.shape === "square") {
      ctx.fillRect(x - r * 0.7, y - r * 0.7, r * 1.4, r * 1.4);
      if (item.motif === "circuit") ctx.fillRect(x + r * 0.8, y + r * 0.8, r * 0.4, r * 0.4);
    } else if (item.shape === "diamond" || item.shape === "shard") {
      ctx.beginPath(); ctx.moveTo(x, y - r * 1.45); ctx.lineTo(x + r * 0.85, y);
      ctx.lineTo(x, y + r * 1.45); ctx.lineTo(x - r * 0.85, y); ctx.closePath(); ctx.fill();
    } else if (item.shape === "petal") {
      ctx.beginPath(); ctx.ellipse(x, y, r * 0.65, r * 1.25, phase, 0, TAU); ctx.fill();
    } else if (item.shape === "triangle") {
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r, y + r); ctx.closePath(); ctx.fill();
    } else if (["spark", "star"].includes(item.shape)) star(ctx, x, y, r * 1.45, item.shape === "star" ? 5 : 4);
    else { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    if (item.motif === "double" || item.motif === "galaxy") {
      ctx.globalAlpha *= 0.55; ctx.shadowBlur = 0; ctx.fillStyle = item.accent || "#fff";
      ctx.beginPath(); ctx.arc(x + r * 1.8, y - r, r * 0.3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  function aura(ctx, item, x, y, time = 0, reduced = false) {
    if (!item || item.id === "aura_none") return;
    ctx.save(); ctx.translate(x, y);
    const pulse = reduced ? 0 : Math.sin(time * 2.2) * 2;
    ctx.strokeStyle = item.color; ctx.lineWidth = 2.2;
    ctx.shadowColor = item.color; ctx.shadowBlur = reduced ? 0 : 15;
    ctx.globalAlpha = 0.65;
    if (item.motif === "shield") {
      ctx.beginPath(); ctx.moveTo(0, -35 - pulse); ctx.lineTo(30 + pulse, -14);
      ctx.lineTo(29 + pulse, 18); ctx.lineTo(0, 36 + pulse);
      ctx.lineTo(-29 - pulse, 18); ctx.lineTo(-30 - pulse, -14); ctx.closePath(); ctx.stroke();
    } else if (item.motif === "petals") {
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + (reduced ? 0 : time * .28);
        ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -35 - pulse, 4, 10, 0, 0, TAU);
        ctx.fillStyle = i % 2 ? item.accent : item.color; ctx.globalAlpha = .45; ctx.fill(); ctx.restore();
      }
    } else if (item.motif === "binary") {
      for (let i = 0; i < 12; i++) {
        const a = i * TAU / 12 + (reduced ? 0 : time * .18);
        const radius = 33 + (i % 3) * 3 + pulse;
        ctx.save(); ctx.translate(Math.cos(a) * radius, Math.sin(a) * radius); ctx.rotate(a);
        ctx.fillStyle = i % 2 ? item.accent : item.color; ctx.fillRect(-2, -2, i % 3 ? 4 : 7, 4); ctx.restore();
      }
      ctx.globalAlpha = .28; ctx.beginPath(); ctx.arc(0, 0, 33 + pulse, 0, TAU); ctx.stroke();
    } else if (item.motif === "hexgrid") {
      for (const [radius, offset] of [[34, 0], [41, Math.PI / 6]]) {
        ctx.strokeStyle = radius === 34 ? item.color : item.accent;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i * TAU / 6 + offset;
          if (!i) ctx.moveTo(Math.cos(a) * radius, Math.sin(a) * radius);
          else ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        }
        ctx.closePath(); ctx.stroke();
      }
    } else if (item.motif === "pulse") {
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = .5 - i * .12; ctx.strokeStyle = i % 2 ? item.accent : item.color;
        ctx.beginPath(); ctx.arc(0, 0, 28 + i * 7 + pulse * (i + 1), 0, TAU); ctx.stroke();
      }
    } else if (item.motif === "runes") {
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + (reduced ? 0 : time * .12);
        ctx.save(); ctx.rotate(a); ctx.strokeStyle = i % 2 ? item.accent : item.color;
        ctx.beginPath(); ctx.moveTo(-4, -36); ctx.lineTo(0, -42); ctx.lineTo(4, -36);
        ctx.moveTo(0, -42); ctx.lineTo(0, -47); ctx.stroke(); ctx.restore();
      }
    } else if (item.motif === "twin") {
      for (const [angle, color] of [[-.6, item.color], [.6, item.accent]]) {
        ctx.save(); ctx.rotate(angle + (reduced ? 0 : time * .08));
        ctx.strokeStyle = color; ctx.beginPath(); ctx.ellipse(0, 0, 42 + pulse, 25 + pulse, 0, 0, TAU); ctx.stroke(); ctx.restore();
      }
    } else if (item.motif === "wings") {
      for (const sign of [-1, 1]) {
        ctx.save(); ctx.scale(sign, 1); ctx.strokeStyle = item.color;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(15 + i * 3, 4 + i * 5);
          ctx.quadraticCurveTo(39 + i * 2, -18 + i * 2, 47 + i * 3, -31 + i * 7);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else if (item.motif === "nebula") {
      for (let i = 0; i < 3; i++) {
        const a = i * TAU / 3 + (reduced ? 0 : time * .13);
        ctx.save(); ctx.rotate(a); ctx.strokeStyle = i % 2 ? item.accent : item.color;
        ctx.beginPath(); ctx.moveTo(13, -23); ctx.bezierCurveTo(42, -44, 52, 8, 31, 30); ctx.stroke();
        ctx.fillStyle = item.accent; ctx.beginPath(); ctx.arc(31, 30, 2.5, 0, TAU); ctx.fill(); ctx.restore();
      }
    } else if (item.motif === "meteor") {
      for (let i = 0; i < 3; i++) {
        const a = i * TAU / 3 + (reduced ? 0 : time * .36);
        ctx.save(); ctx.rotate(a); ctx.strokeStyle = item.accent;
        ctx.beginPath(); ctx.moveTo(-15, -34); ctx.quadraticCurveTo(-3, -40, 9, -32); ctx.stroke();
        ctx.fillStyle = item.color; star(ctx, 9, -32, 6, 4); ctx.restore();
      }
    } else if (item.motif === "eclipse") {
      ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 36 + pulse, -.7, 2.1); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = item.accent; ctx.beginPath(); ctx.arc(0, 0, 43 + pulse, 2.5, 5.5); ctx.stroke();
      ctx.fillStyle = item.accent; ctx.beginPath(); ctx.arc(0, -43, 3, 0, TAU); ctx.fill();
    } else {
      for (let i = 0; i < (item.motif === "crown" ? 8 : 4); i++) {
        const a = i * TAU / (item.motif === "crown" ? 8 : 4) + (reduced ? 0 : time * 0.45);
        const start = item.motif === "halo" ? 34 : 30;
        ctx.beginPath(); ctx.arc(0, 0, start + pulse, a, a + (item.motif === "crown" ? 0.34 : 0.8)); ctx.stroke();
        if (item.motif === "crown" || item.motif === "orbit") {
          ctx.fillStyle = item.accent || item.color;
          ctx.beginPath(); ctx.arc(Math.cos(a) * (start + pulse), Math.sin(a) * (start + pulse), 2.5, 0, TAU); ctx.fill();
        }
      }
      if (item.motif === "flame") {
        ctx.globalAlpha = 0.36; ctx.beginPath(); ctx.arc(0, 0, 38 + pulse, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function dash(ctx, item, points, time = 0, reduced = false) {
    if (!item || item.id === "dash_none" || points.length < 2) return;
    ctx.save(); ctx.strokeStyle = item.color; ctx.shadowColor = item.color;
    ctx.shadowBlur = reduced ? 0 : 14; ctx.globalAlpha = 0.6;
    const first = points[0], last = points[points.length - 1];
    const dx = last.x - first.x, dy = last.y - first.y;
    const len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const count = ["triple", "prism"].includes(item.motif) ? 3
      : ["pixel", "portal", "chevron", "void"].includes(item.motif) ? 1 : 2;
    for (let line = 0; line < count; line++) {
      const offset = (line - (count - 1) / 2) * (item.motif === "wide" ? 15 : 8);
      ctx.lineWidth = item.motif === "wide" || item.motif === "void" ? 4 : 2;
      ctx.strokeStyle = item.motif === "prism" ? [item.color, item.accent, "#ffd166"][line] : item.color;
      if (item.motif === "digital") ctx.setLineDash([9, 6]);
      else if (item.motif === "spark") ctx.setLineDash([3, 9]);
      else if (item.motif === "pixel") ctx.setLineDash([5, 5]);
      else if (item.motif === "void") ctx.setLineDash([12, 3]);
      ctx.beginPath();
      points.forEach((p, index) => {
        const wave = !reduced && ["wave", "ribbon"].includes(item.motif)
          ? Math.sin(index * 1.4 + time * (item.motif === "ribbon" ? 5 : 9)) * (item.motif === "ribbon" ? 11 : 7) : 0;
        const x = p.x + nx * (offset + wave), y = p.y + ny * (offset + wave);
        if (!index) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (item.motif === "spark" || item.motif === "digital") {
      ctx.fillStyle = item.accent || item.color;
      for (let i = 1; i < points.length - 1; i += 2) star(ctx, points[i].x, points[i].y, 5, 4);
    }
    if (["ribbon", "chevron", "portal", "pixel", "flame", "ice", "prism", "orbit", "void", "crown"].includes(item.motif)) {
      const angle = Math.atan2(dy, dx);
      for (let step = 1; step <= 9; step++) {
        const t = step / 10, px = first.x + dx * t, py = first.y + dy * t;
        ctx.save(); ctx.translate(px, py); ctx.rotate(angle);
        ctx.fillStyle = step % 2 ? item.color : (item.accent || item.color);
        ctx.strokeStyle = item.accent || item.color;
        ctx.globalAlpha = .42 + (step % 3) * .12;
        if (item.motif === "chevron") {
          ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(0, 0); ctx.lineTo(-6, 7); ctx.stroke();
        } else if (item.motif === "pixel") {
          ctx.fillRect(-3, step % 2 ? -9 : 5, 6, 6);
          if (step % 3 === 0) ctx.fillRect(-8, -2, 4, 4);
        } else if (item.motif === "flame") {
          ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-13, -6, -2, -8);
          ctx.quadraticCurveTo(7, -4, 5, 0); ctx.closePath(); ctx.fill();
        } else if (item.motif === "ice") {
          ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(5, 0); ctx.lineTo(0, 7); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
        } else if (item.motif === "orbit") {
          const offset = reduced ? 0 : Math.sin(time * 5 + step) * 9;
          ctx.beginPath(); ctx.arc(0, offset, 3 + step % 3, 0, TAU); ctx.fill();
        } else if (item.motif === "void") {
          ctx.beginPath(); ctx.moveTo(-4, -7); ctx.lineTo(2, 0); ctx.lineTo(-3, 7); ctx.stroke();
        } else if (item.motif === "crown") {
          ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 0); ctx.lineTo(0, 7); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
        } else if (item.motif === "ribbon" || item.motif === "prism") {
          ctx.beginPath(); ctx.arc(0, step % 2 ? -8 : 8, 2.2, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
      if (item.motif === "portal") {
        ctx.strokeStyle = item.color; ctx.lineWidth = 3; ctx.globalAlpha = .8;
        for (const p of [first, last]) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, TAU); ctx.stroke();
          ctx.strokeStyle = item.accent || item.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, 9, .3, TAU - .3); ctx.stroke();
          ctx.strokeStyle = item.color;
        }
      }
    }
    ctx.restore();
  }
  function preview(canvas, item, time = 0, reduced = false) {
    const ctx = canvas.getContext("2d"), width = canvas.width, height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#081020"); gradient.addColorStop(1, "#10152a");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(132,160,190,.11)"; ctx.lineWidth = 1;
    for (let x = 18; x < width; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    const shipX = width * 0.72, shipY = height * 0.5;
    if (item.category === "trail" && item.id !== "none") {
      for (let i = 0; i < 14; i++) {
        const sway = reduced ? 0 : Math.sin(time * 2 + i * 0.8) * 5;
        particle(ctx, item, { x: shipX - 18 - i * 8, y: shipY + 11 + sway,
          life: 0.58 - i * 0.025, maxLife: 0.58, size: 3 + (i % 4), phase: i * 0.6, index: i }, time, reduced);
      }
    }
    if (item.category === "aura") aura(ctx, item, shipX, shipY, time, reduced);
    if (item.category === "dash") dash(ctx, item,
      [{x: width * 0.12, y: shipY + 12}, {x: width * 0.32, y: shipY + 12},
        {x: width * 0.52, y: shipY + 12}, {x: shipX, y: shipY + 12}], time, reduced);
    ctx.save(); ctx.translate(shipX, shipY); ctx.fillStyle = "#152e43";
    ctx.strokeStyle = "#e7fbff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(13, 12); ctx.lineTo(0, 6);
    ctx.lineTo(-13, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#00f0ff"; ctx.fillRect(-3, -4, 6, 9); ctx.restore();
  }
  return Object.freeze({ particle, aura, dash, preview });
})();
