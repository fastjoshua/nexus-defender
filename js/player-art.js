/* Three operator ships share one drawing system for the arena and selection menu. */
const PlayerArt = (() => {
  const palettes = {
    cyan: { edge: "#00f0ff", light: "#e8f8ff", metal: "#123c53", dark: "#071929", engine: "#a855f7" },
    violet: { edge: "#c084fc", light: "#f3e8ff", metal: "#463266", dark: "#18132e", engine: "#00f0ff" },
    gold: { edge: "#ffd166", light: "#fff4c2", metal: "#6f5030", dark: "#291b21", engine: "#ff2d75" }
  };

  function polygon(ctx, points, fill, stroke, width = 1.35) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function path(ctx, points, color, width = 1.2) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function glow(ctx, x, y, radius, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 11;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function engine(ctx, skin, time, active, still) {
    const color = palettes[skin].engine;
    const flicker = still ? 0 : Math.sin(time * 13) * 2;
    const extra = active ? 7 : 0;
    const ports = skin === "violet" ? [-10, 10] : skin === "gold" ? [-7, 7] : [0];
    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ports.forEach(x => {
      polygon(ctx, [[x - 3, 15], [x + 3, 15], [x, 24 + flicker + extra]], color);
    });
    ctx.restore();
    ports.forEach(x => polygon(ctx, [[x - 1.3, 16], [x + 1.3, 16], [x, 20 + flicker * 0.6 + extra * 0.5]], "#f8f8ff"));
  }

  function nexo(ctx, p, flash, pierceReady) {
    // Slim lance and hooked wings keep the interceptor readable at game size.
    polygon(ctx, [[0, -22], [7, -8], [8, 10], [0, 14], [-8, 10], [-7, -8]], p.dark, p.edge, 1.6);
    polygon(ctx, [[-7, -6], [-20, 12], [-13, 10], [-7, 5]], p.metal, p.edge);
    polygon(ctx, [[7, -6], [20, 12], [13, 10], [7, 5]], p.metal, p.edge);
    polygon(ctx, [[-19, 12], [-12, 8], [-9, 13], [-15, 15]], "#2c657d");
    polygon(ctx, [[19, 12], [12, 8], [9, 13], [15, 15]], "#2c657d");
    polygon(ctx, [[0, -19], [4, -6], [0, 5], [-4, -6]], "#22758b", p.light, 1);
    polygon(ctx, [[0, -15], [2.5, -5], [0, -8], [-2.5, -5]], p.light);
    path(ctx, [[0, 5], [0, 11]], pierceReady ? p.light : p.edge,
      flash || pierceReady ? 2.6 : 1.3);
    glow(ctx, -14, 11, 1.4, p.edge);
    glow(ctx, 14, 11, 1.4, p.edge);
    if (flash) {
      path(ctx, [[0, -22], [0, -29]], p.light, 2);
      glow(ctx, 0, -23, 2.5, p.edge);
    }
  }

  function quantum(ctx, p, flash, time, still) {
    // Two separated emitters frame a mirrored, phase-shifted center.
    const pulse = still ? 0 : Math.sin(time * 3.5) * 0.8;
    polygon(ctx, [[0, -19], [7, -4], [0, 17], [-7, -4]], p.dark, p.edge, 1.6);
    polygon(ctx, [[-5, -10], [-19, -3], [-20, 6], [-10, 15], [-7, 8]], p.metal, p.edge, 1.5);
    polygon(ctx, [[5, -10], [19, -3], [20, 6], [10, 15], [7, 8]], p.metal, p.edge, 1.5);
    polygon(ctx, [[-16, -2], [-10, -6], [-10, 8], [-16, 5]], "#7758a0");
    polygon(ctx, [[16, -2], [10, -6], [10, 8], [16, 5]], "#7758a0");
    polygon(ctx, [[0, -14], [4, -2], [0, 9], [-4, -2]], "#8c70b0", p.light, 1);
    polygon(ctx, [[0, -10 + pulse], [2.6, -1], [0, 5 - pulse], [-2.6, -1]], p.light);
    polygon(ctx, [[-15, -6], [-11, -9], [-8, -4], [-12, 0]], p.light, p.engine, 0.9);
    polygon(ctx, [[15, -6], [11, -9], [8, -4], [12, 0]], p.light, p.engine, 0.9);
    path(ctx, [[-17, 8], [-11, 13]], p.engine);
    path(ctx, [[17, 8], [11, 13]], p.engine);
    if (flash) {
      glow(ctx, -13, -7, 3.3, p.engine);
      glow(ctx, 13, -7, 3.3, p.engine);
    }
  }

  function becker(ctx, p, flash, time, still, charge) {
    // Wide armor shoulders and a single charging reactor communicate heavy damage.
    polygon(ctx, [[0, -18], [14, -15], [21, -3], [18, 14], [10, 19], [-10, 19], [-18, 14], [-21, -3], [-14, -15]], p.dark, p.edge, 1.8);
    polygon(ctx, [[-20, -4], [-14, -14], [-8, -13], [-11, 6], [-18, 12]], p.metal, p.light, 1);
    polygon(ctx, [[20, -4], [14, -14], [8, -13], [11, 6], [18, 12]], p.metal, p.light, 1);
    polygon(ctx, [[-18, -1], [-13, -9], [-12, 8], [-17, 9]], "#af8550");
    polygon(ctx, [[18, -1], [13, -9], [12, 8], [17, 9]], "#af8550");
    polygon(ctx, [[0, -17], [8, -11], [9, 10], [0, 16], [-9, 10], [-8, -11]], "#64482f", p.edge, 1.4);
    const reactor = still ? 0 : Math.sin(time * 4) * 0.8;
    polygon(ctx, [[0, -12], [6, 5], [0, 3 + reactor], [-6, 5]], p.light, p.edge, 1);
    polygon(ctx, [[0, -8], [3 + charge, 3], [0, 1], [-3 - charge, 3]],
      charge > 0.8 ? p.light : "#ffac63");
    path(ctx, [[-9, 11], [-4, 14], [4, 14], [9, 11]], p.edge, 1.5);
    glow(ctx, -15, -10, 1.2, p.edge);
    glow(ctx, 15, -10, 1.2, p.edge);
    if (flash) {
      ctx.strokeStyle = p.edge;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, -3, 13, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();
      glow(ctx, 0, -15, 3, p.light);
    }
  }

  function draw(ctx, skin, options = {}) {
    const p = palettes[skin] || palettes.cyan;
    const time = options.time || 0;
    const still = Boolean(options.reducedMotion);
    ctx.save();
    ctx.translate(options.x || 0, options.y || 0);
    ctx.scale(options.scale || 1, options.scale || 1);
    const flash = Boolean(options.attackFlash);
    engine(ctx, skin, time, options.dashing, still);
    ctx.shadowBlur = 7;
    ctx.shadowColor = p.edge;
    if (skin === "violet") quantum(ctx, p, flash, time, still);
    else if (skin === "gold") becker(ctx, p, flash, time, still, options.charge || 0);
    else nexo(ctx, p, flash, options.pierceReady);
    ctx.shadowBlur = 0;
    if (options.ultimateReady) {
      ctx.strokeStyle = p.edge;
      ctx.globalAlpha = still ? 0.5 : 0.35 + (Math.sin(time * 5) + 1) * 0.14;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  return { draw, palettes };
})();
