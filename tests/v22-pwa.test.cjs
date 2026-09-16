const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('PWA abre instalada en pantalla completa horizontal', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.display, 'fullscreen');
  assert.equal(manifest.orientation, 'landscape');
  assert.equal(manifest.start_url, './?source=pwa');
  assert(manifest.icons.some(icon => icon.purpose.includes('maskable')));
  assert(fs.existsSync(path.join(root, 'icons', 'nexus-defender.svg')));
});

test('la misión solicita pantalla completa sin mostrar instalación en el menú', () => {
  const html = read('index.html');
  const game = read('js/game.js');
  assert.match(html, /rel="manifest" href="manifest\.webmanifest\?v=2\.2\.3"/);
  assert.doesNotMatch(html, /id="installAppButton"/);
  assert.doesNotMatch(game, /beforeinstallprompt/);
  assert.match(game, /requestFullscreen/);
  assert.match(game, /if \(isTouchPhone\(\)\) requestAppFullscreen\(\)/);
});

test('el Service Worker conserva el juego y elimina cachés anteriores', () => {
  const worker = read('service-worker.js');
  assert.match(worker, /nexus-defender-v2\.2\.3/);
  assert.match(worker, /\.\/js\/game\.js\?v=2\.2\.3/);
  assert.match(worker, /caches\.delete/);
  assert.match(worker, /event\.request\.mode === "navigate"/);
});
