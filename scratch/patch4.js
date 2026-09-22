const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

const target = `        const mods = guildSettings.modules || {};
        document.getElementById('mod-moderation').checked = !!mods.moderation;
        document.getElementById('mod-economy').checked = !!mods.economy;
        document.getElementById('mod-logging').checked = !!mods.logging;
      }
    }`;

const replacement = `        const mods = guildSettings.modules || {};
        document.getElementById('mod-moderation').checked = !!mods.moderation;
        document.getElementById('mod-economy').checked = !!mods.economy;
        document.getElementById('mod-logging').checked = !!mods.logging;
    }`;

html = html.replace(target, replacement);
fs.writeFileSync('public/dashboard.html', html);
console.log('Fixed extra brace');
