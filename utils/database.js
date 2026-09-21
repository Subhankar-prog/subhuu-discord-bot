const mongoose = require('mongoose');

// --- SCHEMAS ---

const UserSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, default: 'Unknown' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false }
});
UserSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const GuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  // Channel routing
  welcomeChannel: { type: String, default: '' },
  levelChannel: { type: String, default: '' },
  logChannel: { type: String, default: '' },
  announcementChannel: { type: String, default: '' },
  // Bot config
  prefix: { type: String, default: '/' },
  nickname: { type: String, default: '' },
  managerRoles: [{ type: String }],
  // Module toggles
  modules: {
    moderation: { type: Boolean, default: true },
    logging: { type: Boolean, default: true },
    tickets: { type: Boolean, default: true },
    economy: { type: Boolean, default: true },
    giveaways: { type: Boolean, default: true },
    leveling: { type: Boolean, default: true },
    welcome: { type: Boolean, default: true },
    announcements: { type: Boolean, default: false },
    reactionRoles: { type: Boolean, default: false },
    customCommands: { type: Boolean, default: false },
    automod: { type: Boolean, default: false },
    autoRoles: { type: Boolean, default: false },
    music: { type: Boolean, default: true },
    fun: { type: Boolean, default: true },
  },
  // XP Settings
  xpSettings: {
    minXp: { type: Number, default: 5 },
    maxXp: { type: Number, default: 15 },
    cooldown: { type: Number, default: 60 }, // seconds
    noXpChannels: [{ type: String }],
    noXpRoles: [{ type: String }],
    levelUpMessage: { type: String, default: 'Congrats {user}! You reached level {level}!' }
  },
  // Economy settings
  economySettings: {
    dailyAmount: { type: Number, default: 100 },
    startingCoins: { type: Number, default: 0 },
    coinName: { type: String, default: 'coins' }
  },
  // Automod settings
  automodSettings: {
    antiSpam: { type: Boolean, default: false },
    spamThreshold: { type: Number, default: 5 },
    filterWords: [{ type: String }],
    antiScamLinks: { type: Boolean, default: true }
  },
  // Welcome settings
  welcomeSettings: {
    joinMessage: { type: String, default: 'Welcome {user} to {server}!' },
    leaveMessage: { type: String, default: '{user} has left the server.' }
  },
  // Announcement settings
  announcementSettings: {
    joinChannel: { type: String, default: '' },
    joinMessage: { type: String, default: '{user} just joined the server!' },
    leaveChannel: { type: String, default: '' },
    leaveMessage: { type: String, default: '{user} has left the server.' },
    banChannel: { type: String, default: '' },
    banMessage: { type: String, default: '{user} has been banned.' }
  },
  // Auto roles
  autoRoleIds: [{ type: String }],
  // AI Chatbot settings
  aiSettings: {
    channelId: { type: String, default: '' },
    systemInstruction: { type: String, default: 'You are Subhuu, a helpful and slightly sarcastic Discord bot.' }
  },
  // Ticket settings
  ticketSettings: {
    staffRoleId: { type: String, default: '' }
  },
  // Music settings
  musicSettings: {
    djOnly: { type: Boolean, default: false },
    djRole: { type: String, default: '' }
  }
});

const ShopSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  items: [{
    name: String,
    price: Number,
    roleId: String
  }]
});

const LevelRewardSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  rewards: [{
    level: Number,
    roleId: String
  }]
});

const PlaylistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  playlistName: { type: String, required: true },
  songs: [String]
});
PlaylistSchema.index({ userId: 1, playlistName: 1 }, { unique: true });

const ReminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Number, required: true }
});

const SocialAlertSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  platform: { type: String, required: true },
  accountId: { type: String, required: true },
  lastCheckedId: { type: String, default: '' }
});

// --- NEW SCHEMAS ---

const ActionLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  type: { type: String, required: true }, // 'message_delete' | 'message_edit' | 'member_join' | 'member_leave' | 'member_ban' | 'member_kick' | 'member_mute'
  title: { type: String, required: true },
  description: { type: String, default: '' },
  userId: { type: String, default: '' },
  username: { type: String, default: '' },
  moderatorId: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});
ActionLogSchema.index({ guildId: 1, timestamp: -1 });

const ReactionRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  emoji: { type: String, required: true },
  roleId: { type: String, required: true },
  roleName: { type: String, default: '' }
});
ReactionRoleSchema.index({ guildId: 1, messageId: 1, emoji: 1 }, { unique: true });

const CustomCommandSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  trigger: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
CustomCommandSchema.index({ guildId: 1, trigger: 1 }, { unique: true });

const CommandPermissionSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  commandName: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  allowedChannels: [{ type: String }],
  ignoredChannels: [{ type: String }],
  allowedRoles: [{ type: String }],
  ignoredRoles: [{ type: String }]
});
CommandPermissionSchema.index({ guildId: 1, commandName: 1 }, { unique: true });

// --- MODELS ---
const User = mongoose.model('User', UserSchema);
const Guild = mongoose.model('Guild', GuildSchema);
const Shop = mongoose.model('Shop', ShopSchema);
const LevelReward = mongoose.model('LevelReward', LevelRewardSchema);
const Playlist = mongoose.model('Playlist', PlaylistSchema);
const Reminder = mongoose.model('Reminder', ReminderSchema);
const SocialAlert = mongoose.model('SocialAlert', SocialAlertSchema);
const ActionLog = mongoose.model('ActionLog', ActionLogSchema);
const ReactionRole = mongoose.model('ReactionRole', ReactionRoleSchema);
const CustomCommand = mongoose.model('CustomCommand', CustomCommandSchema);
const CommandPermission = mongoose.model('CommandPermission', CommandPermissionSchema);

// --- CONNECTION LOGIC ---
async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('[Database] WARNING: MONGO_URI is missing from .env.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('[Database] Successfully connected to MongoDB Cluster.');
  } catch (error) {
    console.error('[Database] Connection Error:', error);
    process.exit(1);
  }
}

module.exports = {
  connectDB,
  User, Guild, Shop, LevelReward, Playlist, Reminder, SocialAlert,
  ActionLog, ReactionRole, CustomCommand, CommandPermission
};
