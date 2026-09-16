"use strict";

// Draws the same artwork as combat, with no access to gameplay state or saves.
const EnemyPreviews = (() => {
  function mount(container, entries, { compact = false } = {}) {
    const items = [];
    const observer = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(changes => changes.forEach(change => {
        const item = items.find(item => item.canvas === change.target);
        if (item) {
          item.visible = change.isIntersecting;
          if (item.visible) container.dispatchEvent(new Event("previewvisible"));
        }
      })) : null;
    for (const entry of entries) {
      const card = document.createElement("article");
      card.className = compact ? "enemy-entry" : "design-card";
      card.style.setProperty("--enemy-color", entry.color);
      const canvas = document.createElement("canvas");
      canvas.className = compact ? "bestiary-portrait" : "design-portrait";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `${entry.name}: ${entry.skin}`);
      const copy = document.createElement("div");
      copy.className = "enemy-copy";
      const title = document.createElement(compact ? "strong" : "h3");
      title.textContent = entry.name;
      const skin = document.createElement("span");
      skin.className = "enemy-skin-name";
      skin.textContent = entry.skin;
      const description = document.createElement(compact ? "small" : "p");
      description.textContent = entry.description;
      const level = document.createElement("span");
      level.className = "enemy-level";
      level.textContent = `NIVEL ${String(entry.level).padStart(2, "0")}`;
      copy.append(title, skin, description, level);
      card.append(canvas, copy);
      container.append(card);
      const item = { canvas, ctx: canvas.getContext("2d"), entry, visible: true, size: 0, dpr: 0 };
      items.push(item);
      observer?.observe(canvas);
    }
    return {
      draw(time, { actualSize = false, damaged = false, phaseTwo = false, force = false } = {}) {
        for (const item of items) {
          if (!item.visible && !force) continue;
          const { canvas, ctx, entry } = item;
          const size = canvas.clientWidth;
          if (!size) continue;
          const height = canvas.clientHeight;
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          if (item.size !== size || item.dpr !== dpr || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(size * dpr);
            canvas.height = Math.round(height * dpr);
            item.size = size; item.dpr = dpr;
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, size, height);
          const isBoss = EnemyArt.bosses.some(boss => boss.id === entry.id);
          const isComet = entry.id === "comet";
          let rx = Math.min(size, height) * (compact ? 0.43 : 0.44);
          let ry = rx;
          if (isComet) rx = ry = Math.min(size, height) * 0.18;
          if (actualSize) {
            rx = isBoss ? (entry.id === "yacerami" ? 82 : 60) : isComet ? 17 : entry.id === "tank" ? 40 : 25;
            ry = isBoss ? (entry.id === "yacerami" ? 54 : 40) : rx;
          }
          const cycle = entry.id === "mine" ? 2.5 : 1.5;
          EnemyArt.draw(ctx, entry.id, {
            x: isComet ? size * 0.71 : size / 2, y: height / 2,
            radiusX: rx, radiusY: ry, time,
            angle: entry.id === "turret" ? Math.sin(time * 0.65) * 0.45 : entry.id === "eye" ? Math.sin(time * 0.55) * 0.3 : isComet ? -0.25 : 0,
            rotation: time * 0.22, charge: (time % cycle) / cycle,
            gapIndex: entry.id === "mine" ? Math.floor(time / 2.45) * 3 % 8 : undefined,
            phantomAlpha: entry.id === "phantom" ? (time % 2.05 < 0.75 ? 0.22 : 1) : undefined,
            healthRatio: damaged ? 0.3 : 1,
            phaseTwo: entry.id === "yacerami" && phaseTwo
          });
        }
      }
    };
  }
  return { mount };
})();
