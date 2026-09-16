"use strict";

const galleryPreviews = [
  EnemyPreviews.mount(document.getElementById("regularDesigns"), EnemyArt.catalog),
  EnemyPreviews.mount(document.getElementById("bossDesigns"), EnemyArt.bosses),
  EnemyPreviews.mount(document.getElementById("hazardDesigns"), [EnemyArt.hazard])
];
const galleryState = { actualSize: false, damaged: false, phaseTwo: false };
let galleryPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let galleryTime = 0.6;
let galleryLastTime = 0;
let galleryLastDraw = 0;
let galleryDirty = true;
const animationToggle = document.getElementById("animationToggle");
function updateAnimationButton() {
  animationToggle.textContent = galleryPaused ? "Animar diseños" : "Pausar animación";
  animationToggle.setAttribute("aria-pressed", String(galleryPaused));
}
updateAnimationButton();
animationToggle.addEventListener("click", () => {
  galleryPaused = !galleryPaused;
  updateAnimationButton();
  galleryDirty = true;
});
for (const [buttonId, stateKey] of [["sizeToggle", "actualSize"], ["damageToggle", "damaged"], ["phaseToggle", "phaseTwo"]]) {
  document.getElementById(buttonId).addEventListener("click", event => {
    galleryState[stateKey] = !galleryState[stateKey];
    event.currentTarget.setAttribute("aria-pressed", String(galleryState[stateKey]));
    galleryDirty = true;
  });
}
window.addEventListener("resize", () => { galleryDirty = true; });
window.addEventListener("scroll", () => { galleryDirty = true; }, { passive: true });
for (const id of ["regularDesigns", "bossDesigns", "hazardDesigns"]) {
  document.getElementById(id).addEventListener("previewvisible", () => { galleryDirty = true; });
}
function drawGallery(now) {
  const dt = Math.min(0.05, (now - (galleryLastTime || now)) / 1000);
  galleryLastTime = now;
  if (!galleryPaused && !document.hidden) galleryTime += dt;
  if (!document.hidden && (galleryDirty || (!galleryPaused && now - galleryLastDraw >= 1000 / 30))) {
    galleryPreviews.forEach(preview => preview.draw(galleryTime, { ...galleryState, force: galleryDirty }));
    galleryDirty = false;
    galleryLastDraw = now;
  }
  requestAnimationFrame(drawGallery);
}
requestAnimationFrame(drawGallery);
