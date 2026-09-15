const { Shop, LevelReward } = require('./database');

async function getShopItems(guildId) {
  const shop = await Shop.findOne({ guildId });
  return shop ? shop.items : [];
}

async function saveShopItems(guildId, items) {
  let shop = await Shop.findOne({ guildId });
  if (!shop) {
    shop = new Shop({ guildId, items });
  } else {
    shop.items = items;
  }
  await shop.save();
}

async function getLevelRewards(guildId) {
  const lr = await LevelReward.findOne({ guildId });
  return lr ? lr.rewards : [];
}

async function saveLevelRewards(guildId, rewards) {
  let lr = await LevelReward.findOne({ guildId });
  if (!lr) {
    lr = new LevelReward({ guildId, rewards });
  } else {
    lr.rewards = rewards;
  }
  await lr.save();
}

module.exports = {
  getShopItems,
  saveShopItems,
  getLevelRewards,
  saveLevelRewards
};
