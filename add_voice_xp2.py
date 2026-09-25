import re

with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Inject HTML
voice_html = """
            <div class="form-group" style="margin-top: 16px;">
              <label>Voice XP Per Minute (Min - Max)</label>
              <div style="display: flex; gap: 12px;">
                <input type="number" class="form-control" id="voice-xp-min" placeholder="Min (e.g. 5)" style="width: 50%;">
                <input type="number" class="form-control" id="voice-xp-max" placeholder="Max (e.g. 15)" style="width: 50%;">
              </div>
            </div>
            <div class="form-group">
              <label>Message Cooldown (Seconds)</label>"""

# Using regex to replace the Message Cooldown block safely
if 'id="voice-xp-min"' not in html:
    html = re.sub(
        r'<div class="form-group">\s*<label>Message Cooldown \(Seconds\)</label>',
        voice_html,
        html
    )

# 2. Inject Populate Logic
populate_search = r"(document\.getElementById\('xp-max'\)\.value = guildSettings\.xpSettings\.maxXp \|\| 25;)"
populate_replace = r"\1\n          document.getElementById('voice-xp-min').value = guildSettings.xpSettings.voiceMinXp || 5;\n          document.getElementById('voice-xp-max').value = guildSettings.xpSettings.voiceMaxXp || 15;"

if "voice-xp-min" not in html[html.find("document.getElementById('xp-max')") : html.find("document.getElementById('xp-max')") + 300]:
    html = re.sub(populate_search, populate_replace, html)

# 3. Inject Save Logic
save_search = r"(maxXp: parseInt\(document\.getElementById\('xp-max'\)\.value\) \|\| 25,)"
save_replace = r"\1\n            voiceMinXp: parseInt(document.getElementById('voice-xp-min').value) || 5,\n            voiceMaxXp: parseInt(document.getElementById('voice-xp-max').value) || 15,"

if "voiceMinXp:" not in html:
    html = re.sub(save_search, save_replace, html)

with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("dashboard.html successfully patched!")
