"use strict";

// Shared by combat, the bestiary and the gallery. Coordinates are normalized
// to the entity's existing collision rectangle; ornaments never add damage.
const EnemyArt = (() => {
  const TAU = Math.PI * 2;
  const catalog = [
    { id: "bug", name: "VIRUS", skin: "Escarabajo de código", color: "#ff2d75", level: 1, description: "Avanza recto. Al destruir al ejemplar principal, se divide en dos esporas rápidas de un solo punto de vida." },
    { id: "skull", name: "BOT", skin: "Autómata roto", color: "#a855f7", level: 1, description: "Analiza tu dirección, marca un carril y da un paso rápido horizontal o vertical. Vida base: 3." },
    { id: "mail", name: "SPAM", skin: "Paquete intruso", color: "#ff9f1c", level: 1, description: "Pequeño y veloz. Rebota en los bordes laterales mientras desciende." },
    { id: "turret", name: "SNIPER", skin: "Ojo de asedio", color: "#ff5f5f", level: 2, description: "Se detiene, fija tu posición con un láser y dispara allí. Un paso lateral durante la marca evita el disparo. Vida base: 3." },
    { id: "eye", name: "HUNTER", skin: "Sabueso óptico", color: "#ff477e", level: 3, description: "Te sigue, marca tu próxima posición y acelera en una embestida breve." },
    { id: "glitch", name: "GLITCH", skin: "Error 404", color: "#f72585", level: 3, description: "Deja un eco en el lugar al que se teletransportará. Puedes ver y evitar ese destino." },
    { id: "tank", name: "TANK", skin: "Bastión carmesí", color: "#e63946", level: 4, description: "Avanza pesadamente. Su blindaje frontal reduce el daño recibido y una onda anunciada golpea a corta distancia. Vida base: 7." },
    { id: "orbiter", name: "ORBITER", skin: "Satélite cautivo", color: "#00f0ff", level: 4, description: "Gira a tu alrededor, marca un punto y sale impulsado hacia él como una honda." },
    { id: "mine", name: "MINA PULSAR", skin: "Reactor erizo", color: "#ff9f1c", level: 4, description: "Se ancla, carga y libera siete proyectiles. Una de sus ocho direcciones queda libre y cambia en cada descarga. Vida base: 5." },
    { id: "phantom", name: "PHANTOM", skin: "Espectro del vacío", color: "#f72585", level: 4, description: "Alterna entre forma sólida y etérea. En la forma etérea puedes atravesarlo y los disparos lo cruzan." }
  ];
  const bosses = [
    { id: "moon", name: "Sailor Moon", skin: "Centinela lunar", color: "#ffd166", level: 3, description: "Activa un campo gravitatorio anunciado que atrae a los jugadores próximos y dispara un abanico de cinco." },
    { id: "mars", name: "Sailor Mars", skin: "Forja carmesí", color: "#ff477e", level: 6, description: "Marca una nueva posición, se desplaza rápidamente hacia ella y después dispara tres proyectiles rápidos." },
    { id: "venus", name: "Sailor Venus", skin: "Corona solar", color: "#ff9f1c", level: 9, description: "Recorre una órbita elíptica y libera espirales radiales que giran con su movimiento." },
    { id: "mercury", name: "Sailor Mercury", skin: "Prisma mareal", color: "#00f0ff", level: 12, description: "Alterna una barrera visible de breve duración con una cruz rotatoria de ocho proyectiles." },
    { id: "yacerami", name: "YACERAMI", skin: "Soberano del vacío", color: "#ff2d75", level: 15, description: "Alterna los cuatro patrones. En fase dos acelera, añade coronas y marca zonas del suelo que estallan un segundo después." }
  ];
  const hazard = { id: "comet", name: "ESTRELLA FUGAZ", skin: "Fragmento estelar", color: "#ffd166", level: 2, description: "Cruza la arena y regresa por una segunda ruta. Cada paso tiene una guía visible; no se destruye a disparos." };

  function draw(ctx, id, options = {}) {
    const time = options.time || 0;
    const radiusX = options.radiusX || 32;
    const radiusY = options.radiusY || radiusX;
    const radius = Math.min(radiusX, radiusY);
    const detail = radius >= 23;
    const entry = [...catalog, ...bosses, hazard].find(item => item.id === id);
    const color = options.phaseTwo ? "#ff003c" : options.color || entry?.color || "#ff2d75";
    const health = Math.max(0, Math.min(1, options.healthRatio ?? 1));
    const charge = Math.max(0, Math.min(1, options.charge || 0));
    const line = Math.max(0.018, 1.05 / radius);
    const pulse = 0.5 + Math.sin(time * 3) * 0.5;
    const dark = "#10101d";
    ctx.save();
    ctx.translate(options.x || 0, options.y || 0);
    ctx.scale(radiusX, radiusY);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = line;
    ctx.shadowBlur = Math.min(5, radius * 0.1);
    ctx.shadowColor = color;
    const armor = ctx.createLinearGradient(-0.4, -1, 0.5, 1);
    armor.addColorStop(0, "#48404f");
    armor.addColorStop(0.48, "#25232f");
    armor.addColorStop(1, "#0c101c");

    function shape(points, fill = armor, stroke = color, width = line) {
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      // Shallow bevels preserve the faceted armor from the approved concepts.
      // Skip fine facets on tiny enemies, where the silhouette matters most.
      if (detail && fill === armor) {
        ctx.save(); ctx.shadowBlur = 0;
        const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
        const cy = points.reduce((sum, p) => sum + p[1], 0) / points.length;
        const inset = points.map(([x, y]) => [cx + (x - cx) * 0.87, cy + (y - cy) * 0.87]);
        for (let i = 0; i < points.length; i++) {
          const j = (i + 1) % points.length;
          ctx.beginPath(); ctx.moveTo(...points[i]); ctx.lineTo(...points[j]);
          ctx.lineTo(...inset[j]); ctx.lineTo(...inset[i]); ctx.closePath();
          ctx.fillStyle = (points[i][1] + points[j][1]) / 2 < cy ? "#94839865" : "#030712a8";
          ctx.fill();
        }
        ctx.restore();
      }
      if (stroke) {
        ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
        ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
      }
    }
    function path(points, stroke = color, width = line) {
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
    }
    function ring(x, y, r, stroke = color, width = line, start = 0, end = TAU) {
      ctx.beginPath(); ctx.arc(x, y, r, start, end);
      ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
    }
    function dot(x, y, r, fill = color) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill();
    }
    function poly(x, y, r, sides, fill = armor, stroke = color, rotation = -Math.PI / 2) {
      const points = Array.from({ length: sides }, (_, i) => [x + Math.cos(rotation + i * TAU / sides) * r, y + Math.sin(rotation + i * TAU / sides) * r]);
      shape(points, fill, stroke);
    }
    function eye(x, y, size, tint = color) {
      ctx.beginPath(); ctx.ellipse(x, y, size, size * 0.57, 0, 0, TAU);
      ctx.fillStyle = tint; ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + Math.sin(time) * size * 0.15, y, size * 0.2, size * 0.47, 0, 0, TAU);
      ctx.fillStyle = "#080714"; ctx.fill();
    }
    function emitter(x, y, r = 0.075) {
      dot(x, y, r * 1.5, dark); ring(x, y, r * 1.4, color);
      dot(x, y, r, color);
      if (charge > 0.65) dot(x, y, r * (charge - 0.45), "#fff1d6");
    }

    if (id === "bug") {
      for (const sign of [-1, 1]) {
        for (let leg = 0; leg < 3; leg++) {
          const y = -0.37 + leg * 0.33;
          const reach = Math.sin(time * 6 + leg * 1.8) * 0.035;
          shape([[sign * 0.35, y], [sign * (0.72 + reach), y - 0.2], [sign * 0.79, y + 0.04], [sign * 0.67, y - 0.02], [sign * 0.45, y + 0.15]]);
        }
        path([[sign * 0.14, -0.62], [sign * 0.25, -0.83], [sign * 0.3, -0.68]]);
      }
      shape([[-0.31, -0.59], [0.31, -0.59], [0.49, -0.19], [0.32, 0.52], [0, 0.83], [-0.32, 0.52], [-0.49, -0.19]]);
      if (detail) {
        shape([[-0.2, -0.34], [-0.44, -0.16], [-0.29, 0.47], [-0.07, 0.7], [-0.08, 0.12]], "#372632", "#64404e", line * 0.6);
        shape([[0.2, -0.34], [0.44, -0.16], [0.29, 0.47], [0.07, 0.7], [0.08, 0.12]], "#211b2a", "#64404e", line * 0.6);
      }
      shape([[-0.31, -0.59], [0.31, -0.59], [0.2, -0.35], [-0.2, -0.35]], "#242130");
      path([[0.04, -0.3], [-0.03, -0.03], [0.06, 0.13], [-0.04, 0.36], [0, 0.67]], color, line * 2.4);
      dot(0, -0.48, 0.055 + pulse * 0.012);
    } else if (id === "skull") {
      shape([[-0.53, -0.57], [0.42, -0.57], [0.62, -0.35], [0.59, 0.33], [0.32, 0.55], [-0.33, 0.55], [-0.61, 0.32], [-0.63, -0.31]]);
      shape([[-0.72, -0.25], [-0.6, -0.3], [-0.6, 0.19], [-0.72, 0.14]], dark);
      shape([[0.72, -0.25], [0.6, -0.3], [0.6, 0.19], [0.72, 0.14]], dark);
      path([[0.3, -0.57], [0.3, -0.78], [0.43, -0.85]], color, line * 1.6);
      dot(0.43, -0.85, 0.035);
      for (const x of [-0.25, 0.25]) {
        poly(x, -0.04, 0.18, 6, "#090b16", "#645074");
        dot(x, -0.04, 0.095, "#d0a0ff");
      }
      const jawY = Math.sin(time * 3) * 0.025;
      shape([[-0.28, 0.35 + jawY], [0.28, 0.35 + jawY], [0.24, 0.68 + jawY], [-0.24, 0.68 + jawY]], "#252030");
      for (const x of [-0.14, 0, 0.14]) path([[x, 0.43 + jawY], [x, 0.57 + jawY]], "#090b16", line * 2);
      if (detail) path([[-0.4, -0.56], [-0.37, -0.36], [-0.2, -0.32]], "#766182");
    } else if (id === "mail") {
      for (const sign of [-1, 1]) shape([[sign * 0.51, -0.42], [sign * 0.73, -0.64], [sign * 0.7, -0.26], [sign * 0.5, 0.04]], "#352618");
      shape([[-0.65, -0.43], [0.65, -0.43], [0.33, 0.39], [0, 0.88], [-0.33, 0.39]]);
      shape([[-0.6, -0.41], [0.6, -0.41], [0, 0.06]], "#33261f");
      path([[-0.59, -0.37], [0, 0.11], [0.59, -0.37]], color, line * 2.2);
      if (detail) path([[-0.3, 0.15], [0, 0.47], [0.3, 0.15]], "#554235");
      dot(0, 0.68, 0.045);
    } else if (id === "turret") {
      ctx.rotate(options.angle || 0);
      shape([[-0.34, -0.74], [0.34, -0.74], [0.56, -0.47], [0.56, 0.28], [0.3, 0.54], [-0.3, 0.54], [-0.56, 0.28], [-0.56, -0.47]]);
      for (const sign of [-1, 1]) {
        shape([[sign * 0.58, -0.44], [sign * 0.79, -0.2], [sign * 0.79, 0.18], [sign * 0.59, 0.4]], "#211b27");
        path([[sign * 0.69, -0.06], [sign * 0.69, 0.17]], color, line * 2);
      }
      dot(0, -0.1, 0.37, "#090b16"); ring(0, -0.1, 0.37);
      dot(0, -0.1, 0.26, "#501b2a"); ring(0, -0.1, 0.26, color, line * 1.2);
      ring(0, -0.1, 0.3, color, line * 2.4, -Math.PI / 2, -Math.PI / 2 + charge * TAU);
      dot(0, -0.1, 0.08 + charge * 0.065, charge > 0.85 ? "#fff0df" : color);
      if (detail) { path([[-0.2, -0.1], [0.2, -0.1]], color); path([[0, -0.3], [0, 0.1]], color); }
      shape([[-0.15, 0.35], [0.15, 0.35], [0.13, 0.84], [-0.13, 0.84]], "#201c28");
      path([[-0.07, 0.42], [-0.07, 0.72]], "#70606b");
      path([[-0.11, 0.83], [0.11, 0.83]], charge > 0.85 ? "#fff0df" : color, line * 2.5);
    } else if (id === "eye") {
      ctx.rotate(options.angle || 0);
      for (const sign of [-1, 1]) {
        shape([[sign * 0.33, -0.2], [sign * 0.66, -0.52], [sign * 0.48, 0.08], [sign * 0.79, 0.28], [sign * 0.4, 0.11]]);
        shape([[sign * 0.19, -0.04], [sign * 0.39, 0.23], [sign * 0.13, 0.89], [sign * 0.04, 0.48]]);
      }
      shape([[0, -0.9], [0.34, -0.37], [0.21, -0.08], [0, -0.27], [-0.21, -0.08], [-0.34, -0.37]]);
      shape([[0, -0.14], [0.18, 0.09], [0, 0.38], [-0.18, 0.09]], color, null);
      ctx.beginPath(); ctx.ellipse(0, 0.1, 0.045, 0.15, 0, 0, TAU); ctx.fillStyle = "#090714"; ctx.fill();
      if (detail) path([[0, -0.8], [0, -0.34]], "#6c405a");
    } else if (id === "glitch") {
      const offset = Math.sin(time * 7) * 0.075;
      const blocks = [[-0.51 + offset, -0.62, 0.46, 0.43], [0.01 - offset, -0.25, 0.53, 0.43], [-0.43 + offset, 0.27, 0.44, 0.43]];
      for (const [x, y, w, h] of blocks) {
        shape([[x, y], [x+w, y], [x+w, y+h], [x, y+h]]);
        path([[x + 0.04, y], [x + w - 0.04, y]], color, line * 2.8);
      }
      ctx.save(); ctx.globalAlpha *= 0.36;
      for (let i = 0; i < 4; i++) {
        const y = -0.62 + i * 0.37;
        const x = Math.sin(time * 7 + i * 2) * 0.51;
        path([[x - 0.15, y], [x + 0.15, y]], color, line * 2);
      }
      ctx.restore();
    } else if (id === "tank") {
      shape([[-0.42, -0.69], [0.42, -0.69], [0.72, -0.35], [0.72, 0.35], [0.4, 0.7], [-0.4, 0.7], [-0.72, 0.35], [-0.72, -0.35]]);
      if (detail) {
        shape([[-0.36, -0.65], [0.36, -0.65], [0.23, -0.31], [-0.23, -0.31]], armor, "#74434f", line * 0.7);
        shape([[-0.22, 0.32], [0.22, 0.32], [0.35, 0.65], [-0.35, 0.65]], armor, "#74434f", line * 0.7);
      }
      for (const sign of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const y = -0.49 + i * 0.34;
          shape([[sign * 0.48, y], [sign * 0.73, y - 0.07], [sign * 0.9, y + 0.12], [sign * 0.82, y + 0.3], [sign * 0.5, y + 0.2]], armor);
        }
      }
      poly(0, 0, 0.28, 6, "#0b0c17", "#64404c", 0);
      poly(0, 0, 0.15, 6, color, color, 0);
      poly(0, 0, 0.075, 6, "#ff9b99", null, 0);
      if (detail) { path([[-0.2, -0.57], [0.2, -0.57]], "#66515a"); path([[-0.16, 0.55], [0.16, 0.55]], "#66515a"); }
      if (health < 1) path([[0.4, -0.64], [0.3, -0.42], [0.4, -0.32], [0.3, -0.17]], "#ff8a88", line * 1.6);
      if (health < 0.45) path([[-0.77, 0.36], [-0.58, 0.25], [-0.62, 0.04]], "#ffc0a6", line * 1.6);
    } else if (id === "orbiter") {
      ctx.save(); ctx.rotate(-0.52);
      ctx.beginPath(); ctx.ellipse(0, 0, 0.87, 0.43, 0, 0, TAU); ctx.strokeStyle = color; ctx.lineWidth = line; ctx.stroke();
      ctx.restore();
      poly(0, 0, 0.51, 7);
      poly(0, 0, 0.29, 7, "#083441"); dot(0, 0, 0.13, "#88edff");
      for (const angle of [time * 1.8, time * 1.8 + Math.PI]) {
        const ex = Math.cos(angle) * 0.87, ey = Math.sin(angle) * 0.43;
        const x = ex * Math.cos(-0.52) - ey * Math.sin(-0.52);
        const y = ex * Math.sin(-0.52) + ey * Math.cos(-0.52);
        dot(x, y, 0.1, "#091321"); ring(x, y, 0.1); dot(x, y, 0.053, "#ff477e");
      }
      path([[-0.33, -0.31], [-0.4, -0.07]], "#ff477e", line * 1.8);
      path([[0.33, 0.31], [0.4, 0.07]], "#ff477e", line * 1.8);
    } else if (id === "mine") {
      // The eight barrels use exactly the rotation used by radial projectile spawning.
      ctx.rotate(options.rotation || 0);
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate(i * TAU / 8);
        shape([[0.61, -0.07], [0.9, -0.03], [0.9, 0.03], [0.61, 0.07]], "#372719", i === options.gapIndex ? "#6d6870" : color);
        if (charge > 0.7 && i !== options.gapIndex) path([[0.74, 0], [0.87, 0]], "#fff1bd", line * 1.5);
        ctx.restore();
      }
      poly(0, 0, 0.65, 8, armor, color, Math.PI / 8);
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + Math.PI / 8;
        path([[Math.cos(a) * 0.43, Math.sin(a) * 0.43], [Math.cos(a) * 0.62, Math.sin(a) * 0.62]], "#796043");
      }
      dot(0, 0, 0.38, "#13121b");
      ring(0, 0, 0.32, "#6c4627", line * 2.2);
      ring(0, 0, 0.32, color, line * 2.8, -Math.PI / 2, -Math.PI / 2 + charge * TAU);
      dot(0, 0, 0.12 + charge * 0.035, charge > 0.8 ? "#fff2b3" : color);
    } else if (id === "phantom") {
      // Opacity affects only the body; the persistent contour still marks a live threat.
      const opacity = options.phantomAlpha ?? (0.35 + Math.abs(Math.sin(time * 5.5)) * 0.65);
      const body = [[0, -0.86], [0.44, -0.23], [0.25, 0.24], [0, 0.88], [-0.25, 0.24], [-0.44, -0.23]];
      ctx.save(); ctx.globalAlpha *= opacity;
      shape(body);
      for (const sign of [-1, 1]) {
        const bob = Math.sin(time * 4 + sign) * 0.065;
        shape([[sign * 0.62, -0.17 + bob], [sign * 0.76, 0.16 + bob], [sign * 0.61, 0.43 + bob], [sign * 0.48, 0.11 + bob]], "#271425");
      }
      ctx.restore();
      shape(body, null, color);
      shape([[0, -0.64], [0.26, -0.22], [0, 0.27], [-0.26, -0.22]], "#070916", "#763559");
      shape([[-0.17, -0.2], [-0.045, -0.1], [-0.06, 0.04]], "#ffe0f3", null);
      shape([[0.17, -0.2], [0.045, -0.1], [0.06, 0.04]], "#ffe0f3", null);
    } else if (id === "moon") {
      const points = [];
      for (let i = 0; i <= 24; i++) { const a = -0.32 + i / 24 * (Math.PI + 0.64); points.push([Math.cos(a) * 0.87, Math.sin(a) * 0.87 - 0.12]); }
      for (let i = 0; i <= 24; i++) { const a = Math.PI + 0.48 - i / 24 * (Math.PI + 0.96); points.push([Math.cos(a) * 0.62, Math.sin(a) * 0.69 - 0.3]); }
      shape(points);
      shape([[0, -0.9], [0.075, -0.45], [0, -0.34], [-0.075, -0.45]], "#534128");
      emitter(0, -0.15, 0.105);
      for (let i = 0; i < 5; i++) { const a = 0.42 + i * (Math.PI - 0.84) / 4; emitter(Math.cos(a) * 0.69, Math.sin(a) * 0.69 - 0.08, 0.06); }
      if (detail) path([[-0.43, 0.13], [-0.25, 0.43], [0, 0.55], [0.25, 0.43], [0.43, 0.13]], "#806d44");
    } else if (id === "mars") {
      ctx.save(); ctx.rotate(time * 0.18);
      for (let i = 0; i < 9; i++) {
        ctx.save(); ctx.rotate(i * TAU / 9);
        shape([[-0.16, -0.77], [0.12, -0.89], [0.22, -0.69], [-0.1, -0.59]], "#30222f"); ctx.restore();
      }
      ctx.restore();
      shape([[0, -0.65], [0.41, -0.13], [0.29, 0.39], [0, 0.6], [-0.29, 0.39], [-0.41, -0.13]]);
      const flame = Math.sin(time * 6) * 0.04;
      shape([[0, -0.4 - flame], [0.09, -0.13], [0.17, -0.2], [0.23, 0.08], [0, 0.37], [-0.21, 0.1], [-0.11, -0.15], [-0.08, 0.01]], "#ffe9f0", color);
      for (const x of [-0.34, 0, 0.34]) { shape([[x - 0.09, 0.64], [x + 0.09, 0.64], [x + 0.065, 0.84], [x - 0.065, 0.84]], "#362130"); emitter(x, 0.8, 0.04); }
    } else if (id === "venus") {
      ctx.save(); ctx.rotate(time * 0.35);
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.rotate(i * TAU / 5);
        shape([[-0.15, -0.25], [-0.25, -0.58], [0.02, -0.93], [0.28, -0.64], [0.19, -0.3]]);
        shape([[-0.2, -0.57], [0.02, -0.89], [0.07, -0.53]], "#ffb34c", null); ctx.restore();
      }
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, 0, 0.9, 0.35, -0.5 + Math.sin(time * 0.45) * 0.2, 0, TAU); ctx.strokeStyle = "#ffdda0"; ctx.lineWidth = line * 0.8; ctx.stroke();
      poly(0, 0, 0.29, 5, "#191721"); emitter(0, 0, 0.12);
    } else if (id === "mercury") {
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + time * 0.12;
        ctx.save(); ctx.rotate(a);
        path([[0.58, 0], [0.74, 0]], "#477282", line * 0.6);
        shape([[0.72, 0], [0.82, -0.065], [0.96, 0], [0.82, 0.065]], "#286a81", "#bdefff"); ctx.restore();
      }
      shape([[0, -0.79], [0.48, -0.13], [0.32, 0.4], [0, 0.81], [-0.32, 0.4], [-0.48, -0.13]]);
      for (let row = -1; row <= 1; row++) {
        ctx.beginPath(); ctx.moveTo(-0.3, row * 0.17); ctx.bezierCurveTo(-0.13, row * 0.17 - 0.17, 0.13, row * 0.17 + 0.17, 0.3, row * 0.17);
        ctx.strokeStyle = "#c9faff"; ctx.lineWidth = line * 1.5; ctx.stroke();
      }
      shape([[0, -0.69], [0.12, -0.43], [0, -0.27], [-0.12, -0.43]], "#2b798c", color);
    } else if (id === "yacerami") {
      const rage = options.phaseTwo ? 1 : 0;
      // All tendrils remain within the existing boss rectangle.
      for (const sign of [-1, 1]) {
        for (let i = 0; i < 5; i++) {
          const y = -0.51 + i * 0.23;
          const curl = Math.sin(time * (rage ? 4 : 2.4) + i * 1.7) * 0.065;
          path([[sign * 0.31, y], [sign * 0.58, y + 0.12], [sign * 0.78, y - 0.06 + curl], [sign * 0.95, y + curl]], color, line * 1.15);
          shape([[sign * 0.95, y + curl], [sign * 0.88, y - 0.055 + curl], [sign * 0.83, y + curl], [sign * 0.88, y + 0.055 + curl]], "#3b1324");
        }
        shape([[sign * 0.22, -0.42], [sign * 0.57, -0.83], [sign * 0.44, -0.13], [sign * 0.52, 0.4], [sign * 0.13, 0.72]], "#211322");
      }
      shape([[0, -0.98], [0.16, -0.55], [0.39, -0.32], [0.36, 0.37], [0, 0.88], [-0.36, 0.37], [-0.39, -0.32], [-0.16, -0.55]], "#160f1e");
      for (const sign of [-1, 1]) {
        const open = 0.07 * rage;
        shape([[sign * (0.14 + open), -0.49], [sign * (0.45 + open), -0.27], [sign * (0.37 + open), -0.01], [sign * (0.16 + open), -0.12]], armor);
        eye(sign * 0.27, 0.02, 0.08, color);
      }
      eye(0, -0.17, 0.21, "#ffd166");
      shape([[-0.29, 0.24], [0, 0.33], [0.29, 0.24], [0.19, 0.57], [0, 0.66], [-0.19, 0.57]], "#050710", "#652d46");
      for (let i = 0; i < 5; i++) {
        const x = -0.2 + i * 0.1;
        shape([[x - 0.04, 0.31], [x + 0.04, 0.31], [x, 0.48 + (i % 2) * 0.07]], "#ffe5ed", null);
      }
      if (rage) {
        for (const sign of [-1, 1]) path([[sign * 0.07, -0.78], [sign * 0.12, -0.53], [sign * 0.25, -0.39]], "#ffb8a6", line * 1.6);
        path([[0.25, 0.56], [0.07, 0.68], [0, 0.8]], "#ffb8a6", line * 1.6);
      }
    } else if (id === "comet") {
      ctx.rotate(options.angle || 0);
      // The tail is purely decorative and dimmer than the collidable head.
      const trail = ctx.createLinearGradient(-4.5, 0, -0.35, 0);
      trail.addColorStop(0, "rgba(255, 209, 102, 0)");
      trail.addColorStop(1, "rgba(255, 180, 60, 0.5)");
      shape([[-4.5, -0.13], [-0.42, -0.42], [-0.6, 0.36]], trail, null);
      shape([[-3.5, 0.42], [-0.49, 0.16], [-0.39, -0.25]], trail, null);
      shape([[0.9, 0], [0.2, -0.65], [-0.57, -0.45], [-0.71, 0.28], [0.12, 0.61]], "#ffe7a1", "#fff7df");
      shape([[0.9, 0], [-0.03, -0.07], [0.2, -0.65]], "#fffbed", null);
      shape([[0.9, 0], [-0.03, -0.07], [0.12, 0.61]], "#ce8637", null);
      shape([[-0.57, -0.45], [-0.03, -0.07], [-0.71, 0.28]], "#9b622c", null);
      poly(-0.07, 0, 0.2, 5, "#fffbea", null);
    }
    ctx.restore();
  }

  return Object.freeze({ catalog, bosses, hazard, draw });
})();
