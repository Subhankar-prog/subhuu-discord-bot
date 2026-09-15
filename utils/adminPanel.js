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
      res.cookie('discord_token', tokenData.access_token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
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
      // 1. Get User Data
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      const userData = await userRes.json();

      // 2. Get User Guilds
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${req.token}` }
      });
      const userGuilds = await guildsRes.json();

      // Filter: User has MANAGE_GUILD (0x20) or ADMINISTRATOR (0x8) 
      // AND the bot is actually in the server.
      const manageableGuilds = userGuilds.filter(g => {
        const perms = BigInt(g.permissions);
        const isAdmin = (perms & 8n) === 8n;
        const isManager = (perms & 32n) === 32n;
        return (isAdmin || isManager) && client.guilds.cache.has(g.id);
      }).map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null
      }));

      res.json({
        user: { id: userData.id, username: userData.username, avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null },
        guilds: manageableGuilds
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch Discord data' });
    }
  });

  // Get specific guild settings
  app.get('/api/guilds/:id', requireDiscordAuth, (req, res) => {
    // Basic security: In a real app we'd verify the token actually has access to this guild ID again.
    const guildId = req.params.id;
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Bot not in guild' });
    
    const settings = settingsManager.getGuildSettings(guildId);
    
    // Fetch text channels for dropdowns
    const channels = guild.channels.cache
      .filter(c => c.isTextBased())
      .map(c => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      name: guild.name,
      settings,
      channels
    });
  });

  // Update specific guild settings
  app.post('/api/guilds/:id', requireDiscordAuth, (req, res) => {
    const guildId = req.params.id;
    if (!client.guilds.cache.has(guildId)) return res.status(404).json({ error: 'Bot not in guild' });

    const newSettings = req.body;
    const updated = settingsManager.updateGuildSettings(guildId, newSettings);
    res.json({ success: true, settings: updated });
  });

  // --- NEW PHASE 9 API ENDPOINTS ---

  const fs = require('fs');
  const configManager = require('./configManager');

  // Get all members data (XP + Coins)
  app.get('/api/guilds/:id/members', requireDiscordAuth, (req, res) => {
    const guildId = req.params.id;
    try {
      let xpData = {};
      let ecoData = {};
      
      const xpPath = path.join(__dirname, '..', 'data', 'xp.json');
      const ecoPath = path.join(__dirname, '..', 'data', 'economy.json');

      if (fs.existsSync(xpPath)) xpData = JSON.parse(fs.readFileSync(xpPath, 'utf8'));
      if (fs.existsSync(ecoPath)) ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf8'));
      
      const guildXp = xpData[guildId] || {};
      const guildEco = ecoData[guildId] || {};

      // Merge data
      const members = [];
      const userIds = new Set([...Object.keys(guildXp), ...Object.keys(guildEco)]);
      
      userIds.forEach(userId => {
        members.push({
          userId,
          username: guildXp[userId]?.username || 'Unknown',
          xp: guildXp[userId]?.xp || 0,
          level: guildXp[userId]?.level || 0,
          coins: guildEco[userId]?.coins || 0
        });
      });

      res.json(members);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load member data' });
    }
  });

  // Edit or Delete member data
  app.post('/api/guilds/:id/members/:userId', requireDiscordAuth, (req, res) => {
    const { id: guildId, userId } = req.params;
    const { action, xp, level, coins } = req.body;

    try {
      const xpPath = path.join(__dirname, '..', 'data', 'xp.json');
      const ecoPath = path.join(__dirname, '..', 'data', 'economy.json');
      
      let xpData = {};
      let ecoData = {};

      if (fs.existsSync(xpPath)) xpData = JSON.parse(fs.readFileSync(xpPath, 'utf8'));
      if (fs.existsSync(ecoPath)) ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf8'));

      if (action === 'delete') {
        if (xpData[guildId]) delete xpData[guildId][userId];
        if (ecoData[guildId]) delete ecoData[guildId][userId];
      } else if (action === 'update') {
        if (!xpData[guildId]) xpData[guildId] = {};
        if (!ecoData[guildId]) ecoData[guildId] = {};
        
        if (!xpData[guildId][userId]) xpData[guildId][userId] = { messages: 0, username: 'Unknown' };
        xpData[guildId][userId].xp = Number(xp);
        xpData[guildId][userId].level = Number(level);

        if (!ecoData[guildId][userId]) ecoData[guildId][userId] = { lastDaily: 0 };
        ecoData[guildId][userId].coins = Number(coins);
      }

      fs.writeFileSync(xpPath, JSON.stringify(xpData, null, 2));
      fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update member' });
    }
  });

  // Get Shop Items
  app.get('/api/guilds/:id/shop', requireDiscordAuth, (req, res) => {
    res.json(configManager.getShopItems(req.params.id));
  });

  // Update Shop Items
  app.post('/api/guilds/:id/shop', requireDiscordAuth, (req, res) => {
    configManager.saveShopItems(req.params.id, req.body);
    res.json({ success: true });
  });

  // Get Level Rewards
  app.get('/api/guilds/:id/levels', requireDiscordAuth, (req, res) => {
    res.json(configManager.getLevelRewards(req.params.id));
  });

  // Update Level Rewards
  app.post('/api/guilds/:id/levels', requireDiscordAuth, (req, res) => {
    configManager.saveLevelRewards(req.params.id, req.body);
    res.json({ success: true });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`[Admin Panel] Running at http://localhost:${PORT}`);
  });
};
