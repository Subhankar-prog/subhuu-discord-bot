const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'public', 'assets');

// Get all ChatGPT images sorted by name (which is timestamp based)
const files = fs.readdirSync(assetsDir)
  .filter(f => f.startsWith('ChatGPT Image'))
  .sort();

if (files.length !== 15) {
  console.error("Expected 15 ChatGPT images, found", files.length);
  process.exit(1);
}

// Based on the visual inspection of the first 7, they map as follows:
const mapping = [
  'logo',               // 0: Logo
  'ai',                 // 1: AI Chat
  'economy',            // 2: Economy
  'dashboard',          // 3: Dashboard
  'music',              // 4: Music
  'moderation',         // 5: Moderation
  'welcome',            // 6: Welcome
  'leveling',           // 7: Leveling
  'reaction-roles',     // 8: Reaction Roles
  'custom-commands',    // 9: Custom Commands
  'tickets',            // 10: Support Tickets
  'giveaways',          // 11: Giveaways
  'socials',            // 12: Socials
  'voice',              // 13: Voice
  'security'            // 14: Security
];

files.forEach((file, index) => {
  const oldPath = path.join(assetsDir, file);
  const newName = `feature_new_${mapping[index]}.png`;
  const newPath = path.join(assetsDir, newName);
  
  fs.renameSync(oldPath, newPath);
  console.log(`Renamed "${file}" to "${newName}"`);
});

// Now update index.html featuresData
const indexHtmlPath = path.join(__dirname, '..', 'public', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

mapping.forEach((featureId) => {
  if (featureId === 'logo') return;
  // Replace the image path in featuresData
  // We look for: id: "welcome", ... image: "/assets/feature_...jpg"
  // And replace the image line.
  
  const regex = new RegExp(`(id:\\s*"${featureId}"[\\s\\S]*?image:\\s*)"\\/assets\\/[^"]+"`, 'g');
  indexHtml = indexHtml.replace(regex, `$1"/assets/feature_new_${featureId}.png"`);
});

fs.writeFileSync(indexHtmlPath, indexHtml);
console.log("Updated index.html with new image paths.");
