const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const settingsManager = require('./settingsManager');

module.exports = function startAdminPanel(client) {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;

  // --- OAUTH2 LOGIN ---

  app.get('/api/auth/invite', (req, res) => {
    if (!CLIENT_ID) return res.status(500).send('Missing CLIENT_ID in .env');
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`);
  });

  app.get('/api/auth/login', (req, res) => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.status(500).send('OAuth2 is not configured in .env (Missing CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI)');
    }
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds'
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  });

  app.get('/api/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/');

    try {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      });

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) throw new Error('No access token returned');

      // Set cookie and redirect to dashboard
      res.cookie('discord_token', tokenData.access_token, { 
        maxAge: 1000 * 60 * 60 * 24 * 60, // 60 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || req.hostname.includes('onrender'),
        sameSite: 'lax'
      });
      res.redirect('/?loggedin=true');
    } catch (err) {
      console.error('[OAuth2 Error]', err);
      res.status(500).send('Failed to authenticate with Discord.');
    }
  });

  app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('discord_token');
    res.redirect('/');
  });

  // --- AUTH MIDDLEWARE ---

  async function requireDiscordAuth(req, res, next) {
    const token = req.cookies.discord_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.token = token;
    next();
  }

  // --- DASHBOARD API ---

  // Get user profile + manageable guilds
  app.get('/api/user/guilds', requireDiscordAuth, async (req, res) => {
    try {
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      const userData = await userRes.json();

      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      const userGuilds = await guildsRes.json();

      const manageableGuilds = userGuilds.filter(g => {
        const perms = BigInt(g.permissions);
        const isAdmin = (perms & 8n) === 8n;
        const isManager = (perms & 32n) === 32n;
        return (isAdmin || isManager) && client.guilds.cache.has(g.id);
      });

      const formattedGuilds = manageableGuilds.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null
      }));

      res.json({
        user: { username: userData.username, avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null },
        guilds: formattedGuilds
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch guilds' });
    }
  });

  // Get specific guild settings
  app.get('/api/guilds/:id', requireDiscordAuth, async (req, res) => {
    const guildId = req.params.id;
    const discordGuild = client.guilds.cache.get(guildId);
    if (!discordGuild) return res.status(404).json({ error: 'Bot not in guild' });

    const settings = await settingsManager.getGuildSettings(guildId);
    
    // Fetch channels for dropdowns
    const textChannels = discordGuild.channels.cache
      .filter(c => c.type === 0)
      .map(c => ({ id: c.id, name: c.name }));

    res.json({
      name: discordGuild.name,
      settings: settings,
      channels: textChannels
    });
  });

  // Update specific guild settings
  app.post('/api/guilds/:id', requireDiscordAuth, async (req, res) => {
    const guildId = req.params.id;
    if (!client.guilds.cache.has(guildId)) return res.status(404).json({ error: 'Bot not in guild' });

    const newSettings = req.body;
    const updated = await settingsManager.updateGuildSettings(guildId, newSettings);
    res.json({ success: true, settings: updated });
  });

  // --- NEW PHASE 9 API ENDPOINTS ---
  const configManager = require('./configManager');
  const { User } = require('./database');

  // Get all members data (XP + Coins)
  app.get('/api/guilds/:id/members', requireDiscordAuth, async (req, res) => {
    const guildId = req.params.id;
    try {
      const members = await User.find({ guildId });
      const formatted = members.map(m => ({
        userId: m.userId,
        username: m.username,
        xp: m.xp,
        level: m.level,
        coins: m.coins
      }));
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load member data' });
    }
  });

  // Edit or Delete member data
  app.post('/api/guilds/:id/members/:userId', requireDiscordAuth, async (req, res) => {
    const { id: guildId, userId } = req.params;
    const { action, xp, level, coins } = req.body;

    try {
      if (action === 'delete') {
        await User.deleteOne({ guildId, userId });
      } else if (action === 'update') {
        await User.updateOne(
          { guildId, userId },
          { $set: { xp: Number(xp), level: Number(level), coins: Number(coins) } },
          { upsert: true }
        );
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update member' });
    }
  });

  // Get Shop Items
  app.get('/api/guilds/:id/shop', requireDiscordAuth, async (req, res) => {
    res.json(await configManager.getShopItems(req.params.id));
  });

  // Update Shop Items
  app.post('/api/guilds/:id/shop', requireDiscordAuth, async (req, res) => {
    await configManager.saveShopItems(req.params.id, req.body);
    res.json({ success: true });
  });

  // Get Level Rewards
  app.get('/api/guilds/:id/levels', requireDiscordAuth, async (req, res) => {
    res.json(await configManager.getLevelRewards(req.params.id));
  });

  // Update Level Rewards
  app.post('/api/guilds/:id/levels', requireDiscordAuth, async (req, res) => {
    await configManager.saveLevelRewards(req.params.id, req.body);
    res.json({ success: true });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`[Admin Panel] Running at http://localhost:${PORT}`);
  });
};
