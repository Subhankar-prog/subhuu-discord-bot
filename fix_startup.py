import re

# 1. Update events/ready.js
with open('events/ready.js', 'r', encoding='utf-8') as f:
    ready_js = f.read()

ready_js = ready_js.replace('const startAdminPanel = require(\'../utils/adminPanel\');', '// const startAdminPanel = require(\'../utils/adminPanel\');')
ready_js = ready_js.replace('startAdminPanel(client);', '// startAdminPanel(client);')

with open('events/ready.js', 'w', encoding='utf-8') as f:
    f.write(ready_js)

# 2. Update index.js
with open('index.js', 'r', encoding='utf-8') as f:
    index_js = f.read()

# Find client.login
login_code = "client.login(process.env.DISCORD_TOKEN);"
new_login_code = """
// Start Web Admin Panel IMMEDIATELY before logging in so Render detects the port instantly
const startAdminPanel = require('./utils/adminPanel');
startAdminPanel(client);

client.login(process.env.DISCORD_TOKEN);
"""

if "startAdminPanel(client);" not in index_js:
    index_js = index_js.replace(login_code, new_login_code)

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(index_js)

print("Startup execution order patched successfully!")
