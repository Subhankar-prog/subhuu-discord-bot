import re

# 1. Update database.js
with open('utils/database.js', 'r', encoding='utf-8') as f:
    db = f.read()

if 'voiceMinXp:' not in db:
    db = db.replace('maxXp: { type: Number, default: 15 },', 'maxXp: { type: Number, default: 25 },\n    voiceMinXp: { type: Number, default: 5 },\n    voiceMaxXp: { type: Number, default: 15 },')
    with open('utils/database.js', 'w', encoding='utf-8') as f:
        f.write(db)
    print("database.js updated")

# 2. Update xpManager.js
with open('utils/xpManager.js', 'r', encoding='utf-8') as f:
    xp = f.read()

# I will rewrite the whole file for safety since it's only 90 lines.
new_xp_js = """const { User, Guild } = require('./database');

async function ensureUser(guildId, userId, username) {
  let user = await User.findOne({ guildId, userId });
  if (!user) {
    user = new User({ guildId, userId, username: username || 'Unknown' });
    await user.save();
  } else if (username && user.username !== username && username !== 'Unknown') {
    user.username = username;
    await user.save();
  }
  return user;
}

const xpCooldowns = new Map();

async function addMessageXp(guildId, userId, username) {
  const guild = await Guild.findOne({ guildId });
  const settings = guild && guild.xpSettings ? guild.xpSettings : { minXp: 15, maxXp: 25, cooldown: 60 };
  
  const minXp = settings.minXp || 15;
  const maxXp = settings.maxXp || 25;
  const cooldown = (settings.cooldown || 60) * 1000;
  
  const cooldownKey = `${guildId}-${userId}`;
  const now = Date.now();
  
  if (xpCooldowns.has(cooldownKey)) {
    const lastMessage = xpCooldowns.get(cooldownKey);
    if (now - lastMessage < cooldown) return { leveledUp: false };
  }

  xpCooldowns.set(cooldownKey, now);

  const user = await ensureUser(guildId, userId, username);
  
  const xpGained = Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;
  user.xp += xpGained;
  
  const nextLevelXp = calculateRequiredXp(user.level + 1);
  let leveledUp = false;

  while (user.xp >= calculateRequiredXp(user.level + 1)) {
    user.level += 1;
    leveledUp = true;
  }
  
  await user.save();
  return { leveledUp, newLevel: user.level, user };
}

async function addVoiceXp(guildId, userId, minutes) {
  if (minutes < 1) return { leveledUp: false };

  const guild = await Guild.findOne({ guildId });
  const settings = guild && guild.xpSettings ? guild.xpSettings : { voiceMinXp: 5, voiceMaxXp: 15 };
  
  const minXp = settings.voiceMinXp || 5;
  const maxXp = settings.voiceMaxXp || 15;

  const user = await ensureUser(guildId, userId);
  
  let totalXpGained = 0;
  for (let i = 0; i < minutes; i++) {
    totalXpGained += Math.floor(Math.random() * (maxXp - minXp + 1)) + minXp;
  }
  
  user.xp += totalXpGained;
  
  let leveledUp = false;
  while (user.xp >= calculateRequiredXp(user.level + 1)) {
    user.level += 1;
    leveledUp = true;
  }
  
  await user.save();
  return { leveledUp, newLevel: user.level, user };
}

function calculateRequiredXp(level) {
  return level * level * 100;
}

async function getLeaderboard(guildId, limit = 10) {
  return await User.find({ guildId }).sort({ level: -1, xp: -1 }).limit(limit);
}

async function getRank(guildId, userId) {
  const user = await ensureUser(guildId, userId);
  const higherUsers = await User.countDocuments({
    guildId,
    $or: [
      { level: { $gt: user.level } },
      { level: user.level, xp: { $gt: user.xp } }
    ]
  });
  return higherUsers + 1;
}

module.exports = {
  addMessageXp,
  addVoiceXp,
  calculateRequiredXp,
  getLeaderboard,
  getRank,
  ensureUser
};
"""
with open('utils/xpManager.js', 'w', encoding='utf-8') as f:
    f.write(new_xp_js)
print("xpManager.js updated")

# 3. Update dashboard.html HTML Form
with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Insert the Voice XP inputs right after Text XP inputs
voice_html = """            <div class="form-group" style="margin-top: 16px;">
              <label>Voice XP Per Minute (Min - Max)</label>
              <div style="display: flex; gap: 12px;">
                <input type="number" class="form-control" id="voice-xp-min" placeholder="Min (e.g. 5)" style="width: 50%;">
                <input type="number" class="form-control" id="voice-xp-max" placeholder="Max (e.g. 15)" style="width: 50%;">
              </div>
            </div>"""

if 'id="voice-xp-min"' not in html:
    html = html.replace('</div>\n            <div class="form-group">\n              <label>Message Cooldown (Seconds)</label>', '</div>\n' + voice_html + '\n            <div class="form-group">\n              <label>Message Cooldown (Seconds)</label>')

# Update dashboard.html JS populate Logic
populate_search = "document.getElementById('xp-max').value = (settings.xpSettings && settings.xpSettings.maxXp) || 25;"
populate_replace = populate_search + "\n        document.getElementById('voice-xp-min').value = (settings.xpSettings && settings.xpSettings.voiceMinXp) || 5;\n        document.getElementById('voice-xp-max').value = (settings.xpSettings && settings.xpSettings.voiceMaxXp) || 15;"
if "id='voice-xp-min'" not in html and "voiceMinXp" not in html:
    html = html.replace(populate_search, populate_replace)

# Update dashboard.html JS save logic
save_search = "xpSettings: {"
save_replace = save_search + "\n          voiceMinXp: parseInt(document.getElementById('voice-xp-min').value) || 5,\n          voiceMaxXp: parseInt(document.getElementById('voice-xp-max').value) || 15,"
if "voiceMinXp:" not in html:
    html = html.replace(save_search, save_replace)

with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("dashboard.html updated")
