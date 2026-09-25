import re

# 1. Update utils/adminPanel.js to add a timeout to the ready wait
with open('utils/adminPanel.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

old_wait = """      // If the bot hasn't finished logging in yet (e.g. Render just woke up), wait for it!
      if (!client.isReady()) {
        console.log('[Web] Waiting for Discord client to log in before serving guilds...');
        await new Promise(resolve => client.once('ready', resolve));
      }"""

new_wait = """      // If the bot hasn't finished logging in yet (e.g. Render just woke up), wait for it!
      if (!client.isReady()) {
        console.log('[Web] Waiting for Discord client to log in before serving guilds...');
        try {
          await Promise.race([
            new Promise(resolve => client.once('ready', resolve)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
          ]);
        } catch (err) {
          console.error('[Web] Timed out waiting for client to become ready.');
          return res.status(503).json({ error: 'The bot is taking unusually long to start up, possibly due to Discord rate limits. Please wait a minute and refresh the page.' });
        }
      }"""

admin_js = admin_js.replace(old_wait, new_wait)
with open('utils/adminPanel.js', 'w', encoding='utf-8') as f:
    f.write(admin_js)

# 2. Update public/dashboard.html to handle 503 nicely
with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    dash_html = f.read()

old_fetch = """    fetch('/api/user/guilds')
      .then(res => {
        if (res.status === 401) { window.location.href = '/api/auth/login'; return; }
        return res.json();
      })
      .then(data => {"""

new_fetch = """    fetch('/api/user/guilds')
      .then(async res => {
        if (res.status === 401) { window.location.href = '/api/auth/login'; return; }
        if (res.status === 503 || !res.ok) {
          const body = await res.json().catch(() => ({ error: 'Unknown server error.' }));
          document.getElementById('server-grid').innerHTML = `<div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: rgba(244, 63, 94, 0.1); border: 1px solid var(--red); border-radius: 12px;"><h3 style="color: var(--red); margin-bottom: 12px;">Connection Timeout</h3><p style="color: #fff;">${body.error || 'Server is taking too long to respond. Please refresh.'}</p></div>`;
          return null;
        }
        return res.json();
      })
      .then(data => {"""

dash_html = dash_html.replace(old_fetch, new_fetch)
with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(dash_html)

print("Timeout protection applied successfully!")
