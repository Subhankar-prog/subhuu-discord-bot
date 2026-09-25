import re

with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. NEW SIDEBAR HTML
new_sidebar = """    <!-- LEFT SIDEBAR (MEE6 STYLE) -->
    <div class="sidebar" id="sidebar" style="display:none; width: 280px; padding: 0; overflow-y: auto; background: #1a1c23; border-right: 1px solid var(--border);">
      
      <!-- TOP SECTION -->
      <div style="padding: 24px 24px 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 16px;">
        <div class="sidebar-nav-item active" onclick="navClick(this, 'modules')">
          <span class="sidebar-icon">🏠</span> Dashboard
        </div>
        <div class="sidebar-nav-item" onclick="openLeaderboard()">
          <span class="sidebar-icon">🏆</span> Leaderboard
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">👤</span> Bot Personalizer
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎭</span> AI Characters
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('AI', '🤖')">
          <span class="sidebar-icon">🤖</span> Subhuu AI
        </div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'settings')">
          <span class="sidebar-icon">⚙️</span> Settings
        </div>
        <a href="https://buy.stripe.com/test_YOUR_LINK_HERE" target="_blank" class="sidebar-nav-item" style="text-decoration:none; color:inherit;">
          <span class="sidebar-icon">💎</span> Premium
        </a>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">😀</span> Emojis
        </div>
      </div>

      <!-- ESSENTIALS -->
      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Essentials</div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Welcome', '👋')">
          <span class="sidebar-icon">👋</span> Welcome & Goodbye <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Welcome', '👋')">
          <span class="sidebar-icon">🏠</span> Welcome Channel <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Reaction', '🎭')">
          <span class="sidebar-icon">🎭</span> Reaction Roles <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Moderation', '🛡️')">
          <span class="sidebar-icon">🛡️</span> Moderator <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Leveling', '📈')">
          <span class="sidebar-icon">📈</span> Levels <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🏆</span> Achievements <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">⭐</span> Starboards <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <!-- SERVER MANAGEMENT -->
      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Server Management</div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">⚡</span> Automations <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Custom', '📝')">
          <span class="sidebar-icon">📝</span> Custom Commands
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🔗</span> Invite Tracker <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Tickets', '🎫')">
          <span class="sidebar-icon">🎫</span> Ticketing <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <!-- UTILITIES -->
      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Utilities</div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'commands-dash')">
          <span class="sidebar-icon">⌨️</span> Permissions <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'members')">
          <span class="sidebar-icon">👥</span> Member Database <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'logs')">
          <span class="sidebar-icon">📋</span> Logs <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <!-- SOCIAL ALERTS -->
      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Social Alerts</div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">📺</span> Twitch <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🐦</span> Twitter <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">▶️</span> YouTube <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🟩</span> Kick <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <!-- GAMES & FUN -->
      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Games & Fun</div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎮</span> Trivia <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎵</span> Music <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <!-- SUBHUU AI -->
      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Subhuu AI</div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('AI', '🤖')">
          <span class="sidebar-icon">🤖</span> AI Chatbot
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎨</span> Image Gen <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <!-- MONETIZATION -->
      <div style="padding: 8px 24px; padding-bottom: 40px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Monetization</div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Economy', '💰')">
          <span class="sidebar-icon">💰</span> Economy & Shop
        </div>
      </div>

    </div>
"""

# Regex replace the sidebar
sidebar_regex = r'<!-- LEFT SIDEBAR \(MEE6 STYLE\) -->[\s\S]*?<!-- MAIN CONTENT -->'
html = re.sub(sidebar_regex, new_sidebar + '\n    <!-- MAIN CONTENT -->', html)

# 2. FIX INITDASHBOARD JS DEFAULT PAGE
# In initDashboard, it calls: navClick(document.querySelector('.sidebar-nav-item'), 'home');
# We want it to open 'modules' by default to match MEE6 plugins view!
js_regex = r"navClick\(document\.querySelector\('\.sidebar-nav-item'\), 'home'\);"
html = re.sub(js_regex, "navClick(document.querySelector('.sidebar-nav-item'), 'modules');", html)

with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Sidebar and dashboard default page patched successfully!")
