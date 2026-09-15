require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, Guild, User, Shop, LevelReward, Playlist, Reminder, SocialAlert } = require('../utils/database');

async function migrate() {
  console.log('--- Starting MongoDB Migration ---');
  await connectDB();

  const dataDir = path.join(__dirname, '..', 'data');

  // 1. Settings
  try {
    const settingsPath = path.join(dataDir, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      for (const [guildId, settings] of Object.entries(data)) {
        await Guild.updateOne(
          { guildId },
          { $set: settings },
          { upsert: true }
        );
      }
      console.log('✅ Settings migrated!');
    }
  } catch (err) { console.error('Error migrating settings:', err.message); }

  // 2. XP & Economy (Users)
  try {
    const xpPath = path.join(dataDir, 'xp.json');
    const ecoPath = path.join(dataDir, 'economy.json');
    
    let xpData = {};
    let ecoData = {};
    if (fs.existsSync(xpPath)) xpData = JSON.parse(fs.readFileSync(xpPath, 'utf8'));
    if (fs.existsSync(ecoPath)) ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf8'));

    const allGuilds = new Set([...Object.keys(xpData), ...Object.keys(ecoData)]);
    
    for (const guildId of allGuilds) {
      const gXp = xpData[guildId] || {};
      const gEco = ecoData[guildId] || {};
      const allUsers = new Set([...Object.keys(gXp), ...Object.keys(gEco)]);

      for (const userId of allUsers) {
        const uXp = gXp[userId] || {};
        const uEco = gEco[userId] || {};
        
        await User.updateOne(
          { guildId, userId },
          { $set: {
            username: uXp.username || 'Unknown',
            xp: uXp.xp || 0,
            level: uXp.level || 0,
            coins: uEco.coins || 0,
            lastDaily: uEco.lastDaily || 0
          }},
          { upsert: true }
        );
      }
    }
    console.log('✅ Users (XP & Economy) migrated!');
  } catch (err) { console.error('Error migrating users:', err.message); }

  // 3. Shop & Level Rewards
  try {
    const configPath = path.join(dataDir, 'config.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      const shops = data.shop || {};
      for (const [guildId, itemsObj] of Object.entries(shops)) {
        // Convert object to array for Mongoose
        const items = Object.values(itemsObj);
        await Shop.updateOne({ guildId }, { $set: { items } }, { upsert: true });
      }

      const levels = data.levelRewards || {};
      for (const [guildId, rewardsObj] of Object.entries(levels)) {
        const rewards = Object.entries(rewardsObj).map(([levelStr, data]) => ({
          level: Number(levelStr),
          roleId: data.roleId || ''
        }));
        await LevelReward.updateOne({ guildId }, { $set: { rewards } }, { upsert: true });
      }
      console.log('✅ Shop & Level Rewards migrated!');
    }
  } catch (err) { console.error('Error migrating config:', err.message); }

  console.log('🎉 MIGRATION COMPLETE!');
}

module.exports = migrate;
