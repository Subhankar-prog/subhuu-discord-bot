/**
 * patch-ytdlp.js
 * Removes the deprecated --no-call-home flag from @distube/yt-dlp
 * so it works with yt-dlp >= 2024.x without JSON parse errors.
 * Runs automatically via "postinstall" in package.json.
 */

const fs = require('fs');
const path = require('path');

const pluginPath = path.join(__dirname, '..', 'node_modules', '@distube', 'yt-dlp', 'dist', 'index.js');

if (!fs.existsSync(pluginPath)) {
  console.log('[patch-ytdlp] Plugin not found, skipping patch.');
  process.exit(0);
}

let src = fs.readFileSync(pluginPath, 'utf8');

if (!src.includes('noCallHome: true')) {
  console.log('[patch-ytdlp] Already patched or flag not present, nothing to do.');
  process.exit(0);
}

const patched = src.replaceAll('      noCallHome: true,\n', '');
fs.writeFileSync(pluginPath, patched, 'utf8');
console.log('[patch-ytdlp] Removed noCallHome flag from @distube/yt-dlp — done.');
