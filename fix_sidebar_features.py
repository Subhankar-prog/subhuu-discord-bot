import re

with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Restore the commented out sidebar items and replace showToast with openModuleSettings
# We commented them out like: <!-- <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')"> ... </div> -->
def uncomment_and_fix(match):
    content = match.group(1)
    
    # Map the text to module name and icon
    mapping = {
        'Achievements': ('Achievements', '🏆'),
        'Starboards': ('Starboards', '⭐'),
        'Automations': ('Automations', '⚡'),
        'Invite Tracker': ('InviteTracker', '🔗'),
        'Twitch': ('Twitch', '📺'),
        'Twitter': ('Twitter', '🐦'),
        'YouTube': ('YouTube', '▶️'),
        'Kick': ('Kick', '🟩'),
        'Trivia': ('Trivia', '🎮'),
        'Music': ('Music', '🎵'),
        'Image Gen': ('ImageGen', '🎨')
    }
    
    for name, (mod_id, icon) in mapping.items():
        if name in content:
            content = content.replace("showToast('Coming Soon!', 'warning')", f"openModuleSettings('{mod_id}', '{icon}')")
            return content
            
    return match.group(0) # If not found, leave commented (like AI Characters)

html = re.sub(r'<!-- (<div class="sidebar-nav-item" onclick="showToast\(\'Coming Soon!\', \'warning\'\)">[\s\S]*?</div>) -->', uncomment_and_fix, html)


# 2. Inject Generic Settings Cards for all the newly activated modules
new_settings_cards = """
          <!-- NEW FEATURE SETTINGS CARDS -->
          <div class="settings-card mod-settings" id="mod-settings-Achievements" style="display: none;">
            <h3>Achievements</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Configure unlockable achievements for your server members.</p>
            <div class="form-group"><label>Enable Achievements</label><select class="form-control"><option>Enabled</option><option>Disabled</option></select></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>
          
          <div class="settings-card mod-settings" id="mod-settings-Starboards" style="display: none;">
            <h3>Starboards</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Highlight the best messages in your server.</p>
            <div class="form-group"><label>Starboard Channel</label><select class="form-control"><option>-- Select Channel --</option></select></div>
            <div class="form-group"><label>Stars Required</label><input type="number" class="form-control" value="3"></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-Automations" style="display: none;">
            <h3>Automations</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Create triggers and actions for your server events.</p>
            <button class="btn btn-gray" style="width:100%; justify-content:center;">+ Add New Automation</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-InviteTracker" style="display: none;">
            <h3>Invite Tracker</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Track who invited who to your server.</p>
            <div class="form-group"><label>Enable Invite Tracking</label><select class="form-control"><option>Enabled</option><option>Disabled</option></select></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-Twitch" style="display: none;">
            <h3>Twitch Alerts</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Get notified when your favorite streamers go live.</p>
            <div class="form-group"><label>Twitch Channel Name</label><input type="text" class="form-control" placeholder="e.g. ninja"></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-Twitter" style="display: none;">
            <h3>Twitter Alerts</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Forward tweets directly to a Discord channel.</p>
            <div class="form-group"><label>Twitter Handle</label><input type="text" class="form-control" placeholder="e.g. @elonmusk"></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-YouTube" style="display: none;">
            <h3>YouTube Alerts</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Post new videos to your server automatically.</p>
            <div class="form-group"><label>YouTube Channel ID</label><input type="text" class="form-control" placeholder="UC..."></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-Kick" style="display: none;">
            <h3>Kick Alerts</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Get notified when Kick streamers go live.</p>
            <div class="form-group"><label>Kick Username</label><input type="text" class="form-control" placeholder="e.g. adinross"></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-Trivia" style="display: none;">
            <h3>Trivia</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">Host automated trivia games for your members.</p>
            <div class="form-group"><label>Game Channel</label><select class="form-control"><option>-- Select Channel --</option></select></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-Music" style="display: none;">
            <h3>Music</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">High quality music playback controls.</p>
            <div class="form-group"><label>Default Volume</label><input type="number" class="form-control" value="100"></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>

          <div class="settings-card mod-settings" id="mod-settings-ImageGen" style="display: none;">
            <h3>Image Gen</h3>
            <p style="color: var(--text-dim); margin-bottom: 24px;">AI Image Generation settings.</p>
            <div class="form-group"><label>Default Model</label><select class="form-control"><option>DALL-E 3</option><option>Stable Diffusion</option></select></div>
            <button class="btn btn-primary">Save Settings</button>
          </div>
"""

# Insert the new settings cards right after <!-- MODULE SETTINGS PAGE -->
if 'id="mod-settings-Achievements"' not in html:
    html = html.replace('<!-- MODERATION SETTINGS -->', new_settings_cards + '\n          <!-- MODERATION SETTINGS -->')

with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Sidebar features restored and mock settings cards injected!")
