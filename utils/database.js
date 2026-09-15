const mongoose = require('mongoose');

// --- SCHEMAS ---

const UserSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, default: 'Unknown' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 }
});
UserSchema.index({ guildId: 1, userId: 1 }, { unique: true });

const GuildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  welcomeChannel: { type: String, default: '' },
  levelChannel: { type: String, default: '' },
  logChannel: { type: String, default: '' },
  prefix: { type: String, default: '/' },
  modules: {
    moderation: { type: Boolean, default: true },
    logging: { type: Boolean, default: true },
    tickets: { type: Boolean, default: true },
    economy: { type: Boolean, default: true },
    giveaways: { type: Boolean, default: true }
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


// --- MODELS ---
const User = mongoose.model('User', UserSchema);
const Guild = mongoose.model('Guild', GuildSchema);
const Shop = mongoose.model('Shop', ShopSchema);
const LevelReward = mongoose.model('LevelReward', LevelRewardSchema);
const Playlist = mongoose.model('Playlist', PlaylistSchema);
const Reminder = mongoose.model('Reminder', ReminderSchema);
const SocialAlert = mongoose.model('SocialAlert', SocialAlertSchema);

// --- CONNECTION LOGIC ---
async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('[Database] WARNING: MONGO_URI is missing from .env. The bot will crash if it tries to fetch data.');
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
  User,
  Guild,
  Shop,
  LevelReward,
  Playlist,
  Reminder,
  SocialAlert
};
