const fs = require('fs');

const oldHtml = fs.readFileSync('public/dashboard.html', 'utf8');

// 1. Extract Settings Cards
const settingsCardsRegex = /<div class="settings-card( mod-settings)?" id="[^"]+"[\s\S]*?<!-- [A-Z ]+ SETTINGS -->/g;
// Actually, it's safer to extract from <!-- [A-Z ]+ SETTINGS --> to the next <!--
// But let's just split the file.
// The settings cards are inside `<div class="main-content" id="main-content">`
const mainContentMatch = oldHtml.match(/<div class="main-content" id="main-content">([\s\S]*?)<\/div>\s*<\/div>\s*<div id="global-toast">/);
let settingsHtml = '';
if (mainContentMatch) {
  settingsHtml = mainContentMatch[1];
} else {
  console.error("Could not find main content block.");
  // Let's just find everything from first <!-- GENERAL SETTINGS --> to the end of main content
  const startIndex = oldHtml.indexOf('<!-- GENERAL SETTINGS -->');
  const endIndex = oldHtml.indexOf('</main>'); // or similar
}

// Write the extracted settings to a temp file so I can verify
fs.writeFileSync('temp_settings.html', settingsHtml);
console.log('Settings extracted.');
