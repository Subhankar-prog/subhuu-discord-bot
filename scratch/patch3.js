const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

const target = `    async function toggleAllCommands(enabled) {
      const cmds = DASH_COMMANDS[currentCmdCategory] || [];
      for (const c of cmds) {
        await toggleCommand(c, enabled);
      }
      filterDashCommands(currentCmdCategory);
    }`;

const replacement = `    async function toggleAllCommands(enabled) {
      const cmds = DASH_COMMANDS[currentCmdCategory] || [];
      for (const c of cmds) {
        await toggleCommand(c.name, enabled);
      }
      filterDashCommands(currentCmdCategory);
    }`;

html = html.replace(target, replacement);
fs.writeFileSync('public/dashboard.html', html);
console.log('Fixed toggleAllCommands bug safely');
