const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const settingsManager = require('./settingsManager');

module.exports = function startAdminPanel(client) {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // --- STRIPE WEBHOOK ---
  // Must be before express.json() to get raw body
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        event = JSON.parse(req.body.toString()); // Prototype fallback
      }
    } catch (err) {
      console.error('[Stripe] Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const discordUserId = session.client_reference_id; 
      if (discordUserId) {
        const { User } = require('./database');
        await User.updateMany({ userId: discordUserId }, { $set: { isPremium: true } });
        console.log(`[Stripe] Automatically upgraded user ${discordUserId} to Premium!`);
      }
    }
    res.json({ received: true });
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;

  // Cache Discord user info per access token to avoid redundant API calls
  // Map<accessToken, { userId, username, avatar, expiresAt }>
  const userInfoCache = new Map();

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
      res.redirect('/dashboard.html?loggedin=true');
    } catch (err) {
      console.error('[OAuth2 Error]', err);
      res.status(500).send('Failed to authenticate with Discord.');
    }
  });

  app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('discord_token');
    res.redirect('/');
  });

  app.get('/api/auth/status', (req, res) => {
    const token = req.cookies.discord_token;
    res.json({ loggedIn: !!token });
  });

  // --- PUBLIC API ---
  app.get('/api/guilds/:id/leaderboard', async (req, res) => {
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
  });

  // --- AUTH MIDDLEWARE ---

  async function requireDiscordAuth(req, res, next) {
    const token = req.cookies.discord_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.token = token;

    try {
      // Check cache first
      let cached = userInfoCache.get(token);
      if (cached && cached.expiresAt > Date.now()) {
        req.userId = cached.userId;
        req.isSuperAdmin = SUPER_ADMIN_ID && String(cached.userId).trim() === String(SUPER_ADMIN_ID).trim();
        return next();
      }

      // Fetch user info from Discord
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!userRes.ok) {
        res.clearCookie('discord_token');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userData = await userRes.json();

      // Cache for 5 minutes
      userInfoCache.set(token, {
        userId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      req.userId = userData.id;
      req.isSuperAdmin = SUPER_ADMIN_ID && String(userData.id).trim() === String(SUPER_ADMIN_ID).trim();
      next();
    } catch (err) {
      console.error('[Auth Middleware]', err);
      res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // --- DASHBOARD API ---

  // Get user profile + manageable guilds
  app.get('/api/user/guilds', requireDiscordAuth, async (req, res) => {
    try {
      // If the bot hasn't finished logging in yet (e.g. Render just woke up), wait for it!
      if (!client.isReady()) {
        console.log('[Web] Waiting for Discord client to log in before serving guilds...');
        await new Promise(resolve => client.once('ready', resolve));
      }

      // Use cached user info if available
      const cached = userInfoCache.get(req.token);
      let userData;
      if (cached) {
        userData = { id: cached.userId, username: cached.username, avatar: cached.avatar };
      } else {
        const userRes = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${req.token}` }
        });
        userData = await userRes.json();
      }

      let formattedGuilds;

      if (req.isSuperAdmin) {
        // Super admin sees ALL guilds the bot is in
        formattedGuilds = client.guilds.cache.map(g => ({
          id: g.id,
          name: g.name,
          icon: g.iconURL() || null,
          memberCount: g.memberCount
        }));
      } else {
        // Regular users see only guilds they can manage
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

        formattedGuilds = manageableGuilds.map(g => ({
          id: g.id,
          name: g.name,
          icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null
        }));
      }

      const { User } = require('./database');
      const dbUser = await User.findOne({ userId: userData.id });
      const isPremium = dbUser ? dbUser.isPremium : false;

      res.json({
        user: {
          username: userData.username,
          avatar: userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
            : null
        },
        guilds: formattedGuilds,
        isSuperAdmin: !!req.isSuperAdmin,
        isPremium: isPremium
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

    // Fetch roles for dropdowns
    const roles = discordGuild.roles.cache
      .filter(r => r.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map(r => ({ id: r.id, name: r.name, color: r.hexColor }));

    res.json({
      name: discordGuild.name,
      settings: settings,
      channels: textChannels,
      roles: roles,
      memberCount: discordGuild.memberCount,
      roleCount: discordGuild.roles.cache.size
    });
  });



  // --- PHASE 9+ API ENDPOINTS ---
  const configManager = require('./configManager');
  const { User, ActionLog, ReactionRole, CustomCommand, CommandPermission } = require('./database');

  // Get guild server info — extended with memberCount and roleCount
  app.get('/api/guilds/:id', requireDiscordAuth, async (req, res) => {
    const guildId = req.params.id;
    const discordGuild = client.guilds.cache.get(guildId);
    if (!discordGuild) return res.status(404).json({ error: 'Bot not in guild' });

    const settings = await settingsManager.getGuildSettings(guildId);
    const textChannels = discordGuild.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name }));
    const roles = discordGuild.roles.cache.filter(r => !r.managed && r.id !== discordGuild.id).map(r => ({ id: r.id, name: r.name, color: r.hexColor }));
    const categories = discordGuild.channels.cache.filter(c => c.type === 4).size;
    const voiceChannels = discordGuild.channels.cache.filter(c => c.type === 2).size;

    res.json({
      name: discordGuild.name,
      icon: discordGuild.iconURL(),
      memberCount: discordGuild.memberCount,
      roleCount: roles.length,
      categoryCount: categories,
      textChannelCount: textChannels.length,
      voiceChannelCount: voiceChannels,
      settings,
      channels: textChannels,
      roles
    });
  });

  // Update guild settings
  app.post('/api/guilds/:id', requireDiscordAuth, async (req, res) => {
    const guildId = req.params.id;
    const discordGuild = client.guilds.cache.get(guildId);
    if (!discordGuild) return res.status(404).json({ error: 'Bot not in guild' });
    
    if (req.body.nickname !== undefined) {
      try {
        const newNick = req.body.nickname.trim() === '' ? null : req.body.nickname.trim();
        await discordGuild.members.me.setNickname(newNick);
      } catch (err) {
        console.error('[Nickname Update Failed]', err.message);
        return res.json({ success: false, error: `Permission Error: ${err.message}` });
      }
    }

    const updated = await settingsManager.updateGuildSettings(guildId, req.body);
    res.json({ success: true, settings: updated });
  });

  // --- MEMBERS ---
  app.get('/api/guilds/:id/members', requireDiscordAuth, async (req, res) => {
    try {
      const members = await User.find({ guildId: req.params.id });
      res.json(members.map(m => ({ userId: m.userId, username: m.username, xp: m.xp, level: m.level, coins: m.coins })));
    } catch (err) { res.status(500).json({ error: 'Failed to load members' }); }
  });

  app.post('/api/guilds/:id/members/:userId', requireDiscordAuth, async (req, res) => {
    const { id: guildId, userId } = req.params;
    const { action, xp, level, coins } = req.body;
    try {
      if (action === 'delete') await User.deleteOne({ guildId, userId });
      else if (action === 'update') await User.updateOne({ guildId, userId }, { $set: { xp: Number(xp), level: Number(level), coins: Number(coins) } }, { upsert: true });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to update member' }); }
  });

  // --- SHOP ---
  app.get('/api/guilds/:id/shop', requireDiscordAuth, async (req, res) => { res.json(await configManager.getShopItems(req.params.id)); });
  app.post('/api/guilds/:id/shop', requireDiscordAuth, async (req, res) => { await configManager.saveShopItems(req.params.id, req.body); res.json({ success: true }); });

  // --- LEVELS ---
  app.get('/api/guilds/:id/levels', requireDiscordAuth, async (req, res) => { res.json(await configManager.getLevelRewards(req.params.id)); });
  app.post('/api/guilds/:id/levels', requireDiscordAuth, async (req, res) => { await configManager.saveLevelRewards(req.params.id, req.body); res.json({ success: true }); });

  // --- LOGS (live from DB) ---
  app.get('/api/guilds/:id/logs', requireDiscordAuth, async (req, res) => {
    try {
      const { type } = req.query;
      const query = { guildId: req.params.id };
      if (type && type !== 'all') query.type = type;
      const logs = await ActionLog.find(query).sort({ timestamp: -1 }).limit(100);
      res.json(logs);
    } catch (err) { res.status(500).json({ error: 'Failed to load logs' }); }
  });

  // --- COMMAND PERMISSIONS ---
  app.get('/api/guilds/:id/command-permissions', requireDiscordAuth, async (req, res) => {
    try {
      const perms = await CommandPermission.find({ guildId: req.params.id });
      const map = {};
      perms.forEach(p => { map[p.commandName] = { enabled: p.enabled, allowedChannels: p.allowedChannels, ignoredChannels: p.ignoredChannels, allowedRoles: p.allowedRoles, ignoredRoles: p.ignoredRoles }; });
      res.json(map);
    } catch { res.json({}); }
  });

  app.post('/api/guilds/:id/command-permissions', requireDiscordAuth, async (req, res) => {
    const { commandName, enabled, allowedChannels, ignoredChannels, allowedRoles, ignoredRoles } = req.body;
    try {
      await CommandPermission.findOneAndUpdate(
        { guildId: req.params.id, commandName },
        { enabled: enabled !== undefined ? enabled : true, allowedChannels: allowedChannels || [], ignoredChannels: ignoredChannels || [], allowedRoles: allowedRoles || [], ignoredRoles: ignoredRoles || [] },
        { upsert: true, new: true }
      );
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to save permissions' }); }
  });

  // --- REACTION ROLES ---
  app.get('/api/guilds/:id/reaction-roles', requireDiscordAuth, async (req, res) => {
    try { res.json(await ReactionRole.find({ guildId: req.params.id })); }
    catch { res.json([]); }
  });

  app.post('/api/guilds/:id/reaction-roles', requireDiscordAuth, async (req, res) => {
    const { action, messageId, emoji, roleId, roleName, channelId, _id } = req.body;
    try {
      if (action === 'delete') await ReactionRole.deleteOne({ _id });
      else await ReactionRole.create({ guildId: req.params.id, channelId, messageId, emoji, roleId, roleName: roleName || emoji });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to save reaction role: ' + err.message }); }
  });

  // --- CUSTOM COMMANDS ---
  app.get('/api/guilds/:id/custom-commands', requireDiscordAuth, async (req, res) => {
    try { res.json(await CustomCommand.find({ guildId: req.params.id })); }
    catch { res.json([]); }
  });

  app.post('/api/guilds/:id/custom-commands', requireDiscordAuth, async (req, res) => {
    const { action, trigger, response, _id } = req.body;
    try {
      if (action === 'delete') await CustomCommand.deleteOne({ _id });
      else if (action === 'add') await CustomCommand.create({ guildId: req.params.id, trigger: trigger.toLowerCase().trim(), response });
      else if (action === 'update') await CustomCommand.updateOne({ _id }, { $set: { trigger: trigger.toLowerCase().trim(), response } });
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed: ' + err.message }); }
  });

  // --- MODULE-SPECIFIC SETTINGS ---
  app.post('/api/guilds/:id/module-settings', requireDiscordAuth, async (req, res) => {
    const guildId = req.params.id;
    if (!client.guilds.cache.has(guildId)) return res.status(404).json({ error: 'Bot not in guild' });
    try {
      const updated = await settingsManager.updateGuildSettings(guildId, req.body);
      res.json({ success: true, settings: updated });
    } catch (err) { res.status(500).json({ error: 'Failed to save module settings' }); }
  });

  // Start the server with socket.io
  const server = require('http').createServer(app);
  const { Server } = require('socket.io');
  const io = new Server(server, { cors: { origin: '*' } });
  
  global.io = io; // Expose globally so other modules (like DisTube events) can use it

  io.on('connection', (socket) => {
    // Dashboard joins a specific guild's room to receive its music events
    socket.on('subscribe_music', (guildId) => {
      socket.join(`music_${guildId}`);
    });

    socket.on('unsubscribe_music', (guildId) => {
      socket.leave(`music_${guildId}`);
    });

    // Remote control from Dashboard
    socket.on('music_control', async (data) => {
      const distube = client.distube;
      if (!distube) return;
      const queue = distube.getQueue(data.guildId);
      if (!queue) return;
      
      try {
        if (data.action === 'pause' && !queue.paused) queue.pause();
        else if (data.action === 'resume' && queue.paused) queue.resume();
        else if (data.action === 'skip') await queue.skip();
        else if (data.action === 'stop') await queue.stop();
        else if (data.action === 'volume' && data.value) queue.setVolume(data.value);
      } catch (err) {
        console.error('[WebMusic] Control Error:', err);
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`[Admin Panel & Socket.io] Running at http://localhost:${PORT}`);
  });
};
