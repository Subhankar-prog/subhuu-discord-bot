const fs = require('fs');

const adminPanelPath = 'utils/adminPanel.js';
let code = fs.readFileSync(adminPanelPath, 'utf8');

const oldRoute = `    app.get('/api/guilds/:id/leaderboard', async (req, res) => {
      try {
        const { User } = require('./database');
        const guildId = req.params.id;
        
        const users = await User.find({ guildId }).sort({ xp: -1 }).limit(100);
        
        res.json({
          guildId,
          users: users.map(u => ({
            userId: u.userId,
            xp: u.xp,
            level: u.level
          }))
        });
      } catch (err) {
        console.error('[Leaderboard API]', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });`;

const newRoute = `    app.get('/api/guilds/:id/leaderboard', async (req, res) => {
      try {
        const { User } = require('./database');
        const guildId = req.params.id;
        
        const users = await User.find({ guildId }).sort({ xp: -1 }).limit(100);
        
        // Try to resolve usernames using Discord client cache
        const guild = client.guilds.cache.get(guildId);
        
        const mappedUsers = await Promise.all(users.map(async u => {
          let resolvedName = u.username && u.username !== 'Unknown' && u.username !== '' ? u.username : 'Unknown';
          
          if (guild) {
            try {
              // Check cache first
              let member = guild.members.cache.get(u.userId);
              // Fallback to fetch if not cached (might be slow for 100 members, but usually fast enough for top 10-20)
              if (!member && users.length <= 25) {
                member = await guild.members.fetch(u.userId).catch(() => null);
              }
              if (member) {
                resolvedName = member.user.username;
                
                // Also asynchronously update the DB in background so we don't have to fetch next time
                if (u.username !== resolvedName) {
                  u.username = resolvedName;
                  u.save().catch(()=>{});
                }
              }
            } catch (e) {}
          }
          
          return {
            userId: u.userId,
            username: resolvedName,
            xp: u.xp,
            level: u.level
          };
        }));
        
        res.json({
          guildId,
          users: mappedUsers
        });
      } catch (err) {
        console.error('[Leaderboard API]', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });`;

code = code.replace(oldRoute, newRoute);
fs.writeFileSync(adminPanelPath, code);
console.log("Patched adminPanel.js leaderboard route!");
