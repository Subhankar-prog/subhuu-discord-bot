const { User } = require('./database');

async function ensureUser(guildId, userId) {
  let user = await User.findOne({ guildId, userId });
  if (!user) {
    user = new User({ guildId, userId });
    await user.save();
  }
  return user;
}

async function getBalance(guildId, userId) {
  const user = await ensureUser(guildId, userId);
  return user.coins;
}

async function addCoins(guildId, userId, amount) {
  const user = await ensureUser(guildId, userId);
  user.coins += amount;
  await user.save();
  return user.coins;
}

async function removeCoins(guildId, userId, amount) {
  const user = await ensureUser(guildId, userId);
  if (user.coins < amount) return false;
  user.coins -= amount;
  await user.save();
  return true;
}

async function claimDaily(guildId, userId) {
  const user = await ensureUser(guildId, userId);
  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000; // 24 hours

  if (now - user.lastDaily < cooldown) {
    return { success: false, timeLeft: cooldown - (now - user.lastDaily) };
  }

  const reward = 500;
  user.coins += reward;
  user.lastDaily = now;
  await user.save();

  return { success: true, reward, newBalance: user.coins };
}

module.exports = {
  getBalance,
  addCoins,
  removeCoins,
  claimDaily
};
