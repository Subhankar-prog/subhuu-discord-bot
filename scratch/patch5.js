const fs = require('fs');
let badHtml = fs.readFileSync('public/dashboard.html', 'utf8');

const replacementText = `    function filterDashCommands(category) {
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
        const cmdName = cmdObj.name || cmdObj;
        const cmdDesc = cmdObj.desc || '';
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
          \${cmdDesc ? \`<p style="color: var(--text-dim); font-size: 13px; margin-top: -6px; margin-bottom: 12px; line-height: 1.4;">\${cmdDesc}</p>\` : ''}
          <button class="btn btn-gray btn-sm" style="width: 100%; justify-content: center; margin-top: auto;" onclick="openPermModal('\${cmdName}')">⚙️ Edit Permissions</button>
        \`;
        grid.appendChild(card);
      });
    }

    async function toggleCommand(cmdName, enabled) {
      if (!allCommandPermissions[cmdName]) allCommandPermissions[cmdName] = {};
      allCommandPermissions[cmdName].enabled = enabled;
      await fetch(\`/api/guilds/\${currentGuildId}/command-permissions\`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ commandName: cmdName, enabled })
      });
    }

    async function toggleAllCommands(enabled) {`;

const toReplaceMatch = badHtml.match(/function filterDashCommands\(category\) \{[\s\S]*?async function toggleAllCommands\(enabled\) \{/);
if (!toReplaceMatch) {
    console.error("Could not find target to replace");
    process.exit(1);
}

const finalHtml = badHtml.replace(toReplaceMatch[0], replacementText);
fs.writeFileSync('public/dashboard.html', finalHtml);
console.log("Successfully rebuilt filterDashCommands and toggleCommand!");
