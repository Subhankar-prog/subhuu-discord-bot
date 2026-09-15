const startAdminPanel = require('../utils/adminPanel');

module.exports = {
  name: 'ready', // Fixed from clientReady to ready
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}. Bot is online!`);
    client.user.setActivity('/play a song');
    
    // Start Web Admin Panel
    startAdminPanel(client);

    // Start checking for scheduled reminders
    const reminderManager = require('../utils/reminderManager');
    reminderManager.startReminderCheck(client);

    // Start checking for YouTube alerts
    const socialAlerts = require('../utils/socialAlerts');
    socialAlerts.startSocialAlerts(client);
  },
};
