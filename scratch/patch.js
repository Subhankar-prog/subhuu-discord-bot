const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

// 1. Fix saveGeneralSettings
html = html.replace(/async function saveGeneralSettings\(\) \{[\s\S]*?prefix: document\.getElementById\('bot-prefix'\)\.value \|\| '\/',[\s\S]*?body: JSON\.stringify\(payload\)[\s\S]*?\}\);/, `async function saveGeneralSettings() {
        const rolesEl = document.getElementById('bot-manager-roles');
        const managerRoles = Array.from(rolesEl.querySelectorAll('input:checked')).map(cb => cb.value);

        const payload = {
          prefix: document.getElementById('bot-prefix').value || '/',
          nickname: document.getElementById('bot-nickname').value || '',
          timezone: document.getElementById('bot-timezone').value || 'UTC',
          managerRoles: managerRoles
        };
        const res = await fetch(\`/api/guilds/\${currentGuildId}\`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });`);

// 2. Add mod-settings-Economy HTML
const econHtml = `        <!-- ECONOMY SETTINGS -->
        <div class="settings-card mod-settings" id="mod-settings-Economy" style="display: none;">
          <h3>Economy & Shop Settings</h3>
          <div class="form-group">
            <label>Currency Symbol</label>
            <input type="text" class="form-control" id="econ-symbol" placeholder="🪙" value="🪙">
          </div>
          <div class="form-group">
            <label>Starting Balance</label>
            <input type="number" class="form-control" id="econ-start" placeholder="500" value="500">
          </div>
          <div class="form-group">
            <label>Daily Reward Amount</label>
            <input type="number" class="form-control" id="econ-daily" placeholder="100" value="100">
          </div>
        </div>
        <!-- GENERIC / FALLBACK -->`;
html = html.replace('<!-- GENERIC / FALLBACK -->', econHtml);

// 3. Fix saveSettings for Economy
const econSave = `      } else if (currentSettingsModule === 'Economy') {
        payload.economySettings = {
          ...guildSettings.economySettings,
          currencySymbol: document.getElementById('econ-symbol').value || '🪙',
          startingBalance: parseInt(document.getElementById('econ-start').value) || 500,
          dailyReward: parseInt(document.getElementById('econ-daily').value) || 100
        };`;
html = html.replace(/\} else if \(currentSettingsModule === 'Moderation'\) \{/, econSave + '\n      } else if (currentSettingsModule === \'Moderation\') {');

// 4. Fix openModuleSettings for Economy
const econLoad = `      if (currentSettingsModule === 'Economy' && guildSettings.economySettings) {
        document.getElementById('econ-symbol').value = guildSettings.economySettings.currencySymbol || '🪙';
        document.getElementById('econ-start').value = guildSettings.economySettings.startingBalance || 500;
        document.getElementById('econ-daily').value = guildSettings.economySettings.dailyReward || 100;
      }`;
html = html.replace(/if \(currentSettingsModule === 'Leveling' && guildSettings\.xpSettings\) \{/, econLoad + '\n      if (currentSettingsModule === \'Leveling\' && guildSettings.xpSettings) {');

// 5. Fix filterDashCommands active button highlight bug
html = html.replace(/function filterDashCommands\(category\) \{[\s\S]*?currentCmdCategory = category;/g, `function filterDashCommands(category) {
        currentCmdCategory = category;
        document.querySelectorAll('#cmd-category-tabs button').forEach(b => {
          if (b.innerText === category) {
            b.classList.remove('btn-gray');
            b.classList.add('btn-accent');
          } else {
            b.classList.add('btn-gray');
            b.classList.remove('btn-accent');
          }
        });`);

// 6. Update DASH_COMMANDS to include missing commands
html = html.replace(/Economy: \['\/balance', '\/daily', '\/slots', '\/blackjack', '\/shop'\],[\s\S]*?Fun: \['\/meme', '\/8ball', '\/coinflip', '\/joke'\]/, `Economy: ['/balance', '/daily', '/slots', '/blackjack', '/shop', '/pay', '/rob', '/work'],
        Moderation: ['/ban', '/kick', '/mute', '/unmute', '/clear', '/warn', '/lock', '/unlock', '/slowmode'],
        Music: ['/play', '/stop', '/skip', '/queue', '/volume', '/pause', '/resume', '/loop', '/nowplaying', '/shuffle', '/playlist'],
        Fun: ['/meme', '/8ball', '/coinflip', '/joke', '/rps', '/tictactoe', '/trivia']`);

fs.writeFileSync('public/dashboard.html', html);

let sm = fs.readFileSync('utils/settingsManager.js', 'utf8');
sm = sm.replace("'leaveSettings', 'autoRoles']", "'leaveSettings', 'autoRoles', 'economySettings']");
fs.writeFileSync('utils/settingsManager.js', sm);

console.log('Fixed everything!');
