const fs = require('fs');

const dashPath = 'public/dashboard.html';
let html = fs.readFileSync(dashPath, 'utf8');

// --- 1. NEW SIDEBAR HTML ---
const newSidebar = `
    <!-- LEFT SIDEBAR (MEE6 STYLE) -->
    <div class="sidebar" id="sidebar" style="display:none; width: 280px; padding: 0; overflow-y: auto; background: #1a1c23; border-right: 1px solid var(--border);">
      
      <div style="padding: 24px 24px 8px 24px;">
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
          <span class="sidebar-icon">🎫</span> Ticketing
        </div>
      </div>

      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Utilities</div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'settings')">
          <span class="sidebar-icon">⚙️</span> General Settings
        </div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'commands-dash')">
          <span class="sidebar-icon">⌨️</span> Permissions
        </div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'members')">
          <span class="sidebar-icon">👥</span> Member Database
        </div>
        <div class="sidebar-nav-item" onclick="navClick(this, 'logs')">
          <span class="sidebar-icon">📋</span> Logs
        </div>
      </div>

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

      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Games & Fun</div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎮</span> Trivia <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎵</span> Music <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <div style="padding: 8px 24px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Subhuu AI</div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('AI', '🤖')">
          <span class="sidebar-icon">🤖</span> AI Chatbot
        </div>
        <div class="sidebar-nav-item" onclick="showToast('Coming Soon!', 'warning')">
          <span class="sidebar-icon">🎨</span> Image Gen <span style="margin-left:auto; color:#facc15; font-size:12px;">👑</span>
        </div>
      </div>

      <div style="padding: 8px 24px; padding-bottom: 40px;">
        <div class="sidebar-section-label" style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#5c6070;">Monetization</div>
        <div class="sidebar-nav-item" onclick="openModuleSettings('Economy', '💰')">
          <span class="sidebar-icon">💰</span> Economy & Shop
        </div>
      </div>

    </div>
`;

// --- 2. NEW MODULES PAGE HTML ---
const newModulesPage = `
      <!-- MODULES PAGE (MEE6 STYLE) -->
      <div id="page-modules" class="page" style="padding: 0;">
        
        <div style="background: url('https://mee6.xyz/assets/817293a9d945a0b7.png') center/cover; padding: 60px 40px; position:relative; overflow:hidden;">
          <div style="position:absolute; inset:0; background: linear-gradient(90deg, rgba(30,32,41,0.9), transparent);"></div>
          <div style="position:relative; z-index:1;">
            <div style="display:inline-block; background:rgba(0,0,0,0.5); backdrop-filter:blur(10px); padding: 12px 20px; border-radius:12px; margin-bottom: 16px;">
              <span style="font-size:12px; font-weight:700; color:#fff;">✨ Meet your new conversation buddies!</span>
              <p style="font-size:11px; color:#a0a4b8; margin-top:4px;">Spice up your server with unique, playful AI characters.</p>
              <button class="btn btn-sm" style="background:#fff; color:#000; margin-top:8px;">Got it</button>
            </div>
          </div>
        </div>

        <div style="padding: 40px;">
          <h2 style="font-size:24px; font-weight:800; margin-bottom:24px;">Plugins</h2>
          
          <div style="display:flex; gap:24px; border-bottom:1px solid var(--border); margin-bottom: 32px; overflow-x:auto;">
            <div style="padding-bottom:12px; border-bottom:2px solid #fff; font-weight:700; color:#fff; cursor:pointer;">All Plugins</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Essentials</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Popular Plugins</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Server Management</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Utilities</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Social Alerts</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Games & Fun</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Subhuu AI</div>
            <div style="padding-bottom:12px; color:#7e8299; font-weight:600; cursor:pointer;">Monetization</div>
          </div>

          <!-- ESSENTIALS SECTION -->
          <h3 style="font-size:18px; font-weight:700; margin-bottom:16px;">Essentials</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-bottom:40px;">
            <div class="mee6-card" onclick="openModuleSettings('Welcome', '👋')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#2563eb;">👋</div>
                <div class="mee6-premium-tag">👑 Premium</div>
              </div>
              <h4 class="mee6-title">Welcome & Goodbye</h4>
              <p class="mee6-desc">Automatically send messages and give roles to your new members and send a message when a member leaves.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
            
            <div class="mee6-card" onclick="openModuleSettings('Welcome', '👋')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#0ea5e9;">🏠</div>
                <div class="mee6-premium-tag">👑 Premium</div>
              </div>
              <h4 class="mee6-title">Welcome Channel</h4>
              <p class="mee6-desc">A dedicated place to welcome new members and share essential informations.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>

            <div class="mee6-card" onclick="openModuleSettings('Reaction', '🎭')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#8b5cf6;">🎭</div>
              </div>
              <h4 class="mee6-title">Reaction Roles</h4>
              <p class="mee6-desc">Let your members get roles by reacting to a message.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>

            <div class="mee6-card" onclick="openModuleSettings('Moderation', '🛡️')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#f43f5e;">🛡️</div>
                <div class="mee6-premium-tag">👑 Premium</div>
              </div>
              <h4 class="mee6-title">Moderator</h4>
              <p class="mee6-desc">Keep your server safe with auto-moderation & empower your mods with powerful moderation tools.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
            
            <div class="mee6-card" onclick="openModuleSettings('Leveling', '📈')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#10b981;">📈</div>
                <div class="mee6-premium-tag">👑 Premium</div>
              </div>
              <h4 class="mee6-title">Levels</h4>
              <p class="mee6-desc">Reward your members with XP and roles as they are active on your server.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
          </div>

          <!-- SERVER MANAGEMENT SECTION -->
          <h3 style="font-size:18px; font-weight:700; margin-bottom:16px;">Server Management</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-bottom:40px;">
            <div class="mee6-card" onclick="openModuleSettings('Custom', '📝')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#3b82f6;">📝</div>
              </div>
              <h4 class="mee6-title">Custom Commands</h4>
              <p class="mee6-desc">Create personalized text commands and auto-responses for your server.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
            
            <div class="mee6-card" onclick="openModuleSettings('Tickets', '🎫')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#f59e0b;">🎫</div>
              </div>
              <h4 class="mee6-title">Tickets</h4>
              <p class="mee6-desc">Create private support channels when users need help. Deploy ticket panels anywhere.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
          </div>

          <!-- SUBHUU AI SECTION -->
          <h3 style="font-size:18px; font-weight:700; margin-bottom:16px;">Subhuu AI</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-bottom:40px;">
            <div class="mee6-card" onclick="openModuleSettings('AI', '🤖')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#a855f7;">🤖</div>
              </div>
              <h4 class="mee6-title">AI Chatbot</h4>
              <p class="mee6-desc">Turn a channel into an intelligent AI conversationalist using Google Gemini.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
          </div>

          <!-- MONETIZATION SECTION -->
          <h3 style="font-size:18px; font-weight:700; margin-bottom:16px;">Monetization & Economy</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-bottom:40px;">
            <div class="mee6-card" onclick="openModuleSettings('Economy', '💰')">
              <div class="mee6-card-header">
                <div class="mee6-icon" style="background:#eab308;">💰</div>
              </div>
              <h4 class="mee6-title">Economy & Shop</h4>
              <p class="mee6-desc">Virtual coins, daily rewards, gambling mini-games, and a customizable role shop.</p>
              <button class="mee6-btn active">✓ Active</button>
            </div>
          </div>

        </div>
      </div>
`;

// Replace Sidebar
html = html.replace(/<div class="sidebar" id="sidebar"[\s\S]*?<!-- MAIN CONTENT -->/, newSidebar + '\n    <!-- MAIN CONTENT -->');

// Replace Modules Page
html = html.replace(/<!-- MODULES PAGE -->[\s\S]*?<!-- MODULE SETTINGS PAGE -->/, newModulesPage + '\n      <!-- MODULE SETTINGS PAGE -->');

// Add CSS for MEE6 Cards
const mee6Css = `
    .mee6-card { background: #212330; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
    .mee6-card:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-2px); }
    .mee6-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .mee6-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
    .mee6-premium-tag { background: rgba(250, 204, 21, 0.1); color: #facc15; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }
    .mee6-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #fff; }
    .mee6-desc { font-size: 13px; color: #a0a4b8; line-height: 1.5; margin-bottom: 24px; flex: 1; }
    .mee6-btn { background: rgba(255,255,255,0.05); color: #fff; border: none; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; width: max-content; }
    .mee6-btn.active { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .mee6-btn:hover { background: rgba(255,255,255,0.1); }
    .sidebar-nav-item { margin-bottom: 2px; }
`;
html = html.replace('</style>', mee6Css + '</style>');

fs.writeFileSync(dashPath, html);
console.log('Dashboard updated to MEE6 style!');
