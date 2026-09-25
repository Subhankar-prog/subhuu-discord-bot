import re

with open('utils/adminPanel.js', 'r', encoding='utf-8') as f:
    code = f.read()

# We want to replace the whole leaderboard route.
# Let's find it with regex.

old_route_regex = r"app\.get\('/api/guilds/:id/leaderboard'[\s\S]*?\}\);"

new_route = """app.get('/api/guilds/:id/leaderboard', async (req, res) => {
    try {
      const { User } = require('./database');
      const guildId = req.params.id;
      
      const users = await User.find({ guildId }).sort({ xp: -1 }).limit(100);
      
      const guild = client.guilds.cache.get(guildId);
      
      const mappedUsers = await Promise.all(users.map(async u => {
        let resolvedName = (u.username && u.username !== 'Unknown' && u.username !== '') ? u.username : 'Unknown';
        
        if (guild) {
          try {
            let member = guild.members.cache.get(u.userId);
            if (!member && users.length <= 30) {
              member = await guild.members.fetch(u.userId).catch(() => null);
            }
            if (member) {
              resolvedName = member.user.username;
              // Update database in background if it was incorrect
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
  });"""

new_code = re.sub(old_route_regex, new_route, code)

with open('utils/adminPanel.js', 'w', encoding='utf-8') as f:
    f.write(new_code)
print("AdminPanel leaderboard patched!")
