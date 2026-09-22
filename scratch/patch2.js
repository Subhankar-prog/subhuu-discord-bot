const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

const newDashCommands = `    const DASH_COMMANDS = {
      Economy: [
        { name: '/balance', desc: 'Check your current coin balance' },
        { name: '/daily', desc: 'Claim your daily free coins (every 24h)' },
        { name: '/work', desc: 'Work a shift to earn some coins' },
        { name: '/pay', desc: 'Transfer coins to another member' },
        { name: '/rob', desc: 'Attempt to steal coins from someone' },
        { name: '/shop', desc: 'View and buy custom roles from the shop' },
        { name: '/slots', desc: 'Gamble coins on the slot machine' },
        { name: '/blackjack', desc: 'Play blackjack against the bot' }
      ],
      Moderation: [
        { name: '/ban', desc: 'Permanently ban a member' },
        { name: '/kick', desc: 'Kick a member from the server' },
        { name: '/mute', desc: 'Timeout/mute a member temporarily' },
        { name: '/unmute', desc: 'Remove a timeout from a member' },
        { name: '/warn', desc: 'Issue a formal warning to a member' },
        { name: '/clear', desc: 'Bulk delete recent messages' },
        { name: '/lock', desc: 'Lock the current channel' },
        { name: '/unlock', desc: 'Unlock a previously locked channel' },
        { name: '/slowmode', desc: 'Set channel slowmode delay' }
      ],
      Music: [
        { name: '/play', desc: 'Play a song from YouTube/Spotify' },
        { name: '/stop', desc: 'Stop the music and clear queue' },
        { name: '/skip', desc: 'Skip the currently playing song' },
        { name: '/queue', desc: 'View the upcoming songs list' },
        { name: '/volume', desc: 'Change the music volume' },
        { name: '/pause', desc: 'Pause the music player' },
        { name: '/resume', desc: 'Resume paused music' },
        { name: '/nowplaying', desc: 'See what song is currently playing' },
        { name: '/shuffle', desc: 'Shuffle the music queue' }
      ],
      Playlists: [
        { name: '/playlist create', desc: 'Create a new empty personal playlist' },
        { name: '/playlist add', desc: 'Add a song to one of your playlists' },
        { name: '/playlist play', desc: 'Queue an entire playlist to play' },
        { name: '/playlist remove', desc: 'Remove a specific song from a playlist' },
        { name: '/playlist list', desc: 'View all your saved playlists' },
        { name: '/playlist view', desc: 'See all songs inside a playlist' },
        { name: '/playlist delete', desc: 'Permanently delete a playlist' }
      ],
      Fun: [
        { name: '/meme', desc: 'Get a random meme from Reddit' },
        { name: '/8ball', desc: 'Ask the magic 8-ball a question' },
        { name: '/coinflip', desc: 'Flip a coin (heads or tails)' },
        { name: '/joke', desc: 'Get a random dad joke' },
        { name: '/rps', desc: 'Play Rock Paper Scissors' },
        { name: '/tictactoe', desc: 'Play Tic-Tac-Toe' },
        { name: '/trivia', desc: 'Answer a trivia question' }
      ]
    };`;

html = html.replace(/const DASH_COMMANDS = \{[\s\S]*?Fun: \['\/meme', '\/8ball', '\/coinflip', '\/joke', '\/rps', '\/tictactoe', '\/trivia'\]\n      \};/m, newDashCommands);

const filterOld = `      function filterDashCommands(category) {
        currentCmdCategory = category;
        document.querySelectorAll('#cmd-category-tabs button').forEach(b => {
          if (b.innerText === category) {
            b.classList.remove('btn-gray');
            b.classList.add('btn-accent');
          } else {
            b.classList.add('btn-gray');
            b.classList.remove('btn-accent');
          }
        });
        const grid = document.getElementById('dash-commands-grid');
        grid.innerHTML = '';
        
        const cmds = DASH_COMMANDS[category] || [];
        
        cmds.forEach(cmdName => {
          const perms = allCommandPermissions[cmdName] || { enabled: true };
          
          const card = document.createElement('div');
          card.className = 'module-card';
          card.style.cssText = 'padding: 20px; gap: 12px; cursor: default;';
          
          card.innerHTML = \`
            <div class="module-card-header">
              <h3 style="color: var(--cyan); font-family: monospace;">\${cmdName}</h3>
              <label class="toggle">
                <input type="checkbox" onchange="toggleCommand('\${cmdName}', this.checked)" \${perms.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <button class="btn btn-gray btn-sm" style="width: 100%; justify-content: center; margin-top: auto;" onclick="openPermModal('\${cmdName}')">⚙️ Edit Permissions</button>
          \`;
          grid.appendChild(card);
        });
      }`;

const filterNew = `      function filterDashCommands(category) {
        currentCmdCategory = category;
        document.querySelectorAll('#cmd-category-tabs button').forEach(b => {
          if (b.innerText === category) {
            b.classList.remove('btn-gray');
            b.classList.add('btn-accent');
          } else {
            b.classList.add('btn-gray');
            b.classList.remove('btn-accent');
          }
        });
        const grid = document.getElementById('dash-commands-grid');
        grid.innerHTML = '';
        
        const cmds = DASH_COMMANDS[category] || [];
        
        cmds.forEach(cmdObj => {
          const cmdName = cmdObj.name;
          const perms = allCommandPermissions[cmdName] || { enabled: true };
          
          const card = document.createElement('div');
          card.className = 'module-card';
          card.style.cssText = 'padding: 20px; gap: 12px; cursor: default; justify-content: flex-start;';
          
          card.innerHTML = \`
            <div class="module-card-header">
              <h3 style="color: var(--cyan); font-family: monospace;">\${cmdName}</h3>
              <label class="toggle">
                <input type="checkbox" onchange="toggleCommand('\${cmdName}', this.checked)" \${perms.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p style="color: var(--text-dim); font-size: 13px; margin-top: -6px; margin-bottom: 12px; line-height: 1.4;">\${cmdObj.desc}</p>
            <button class="btn btn-gray btn-sm" style="width: 100%; justify-content: center; margin-top: auto;" onclick="openPermModal('\${cmdName}')">⚙️ Edit Permissions</button>
          \`;
          grid.appendChild(card);
        });
      }`;

html = html.replace(/function filterDashCommands\(category\) \{[\s\S]*?grid\.appendChild\(card\);\n        \}\);\n      \}/m, filterNew);

// Add Playlists to the tabs list
html = html.replace(/<button class="btn btn-gray btn-sm" onclick="filterDashCommands\('Fun'\)">Fun<\/button>/, `<button class="btn btn-gray btn-sm" onclick="filterDashCommands('Playlists')">Playlists</button>\n              <button class="btn btn-gray btn-sm" onclick="filterDashCommands('Fun')">Fun</button>`);

// Make sure to replace the corrupted gear icon with the real one just in case the old regex matching didn't match the old corrupted one
html = html.replace(/sT,\? Edit Permissions/g, '⚙️ Edit Permissions');

fs.writeFileSync('public/dashboard.html', html);
console.log('Successfully patched DASH_COMMANDS and filterDashCommands!');
