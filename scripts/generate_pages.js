const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Create subdirectories if they don't exist
const dirs = ['features', 'legal', 'resources'];
dirs.forEach(d => {
  const dirPath = path.join(publicDir, d);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

// The pages to generate with rich content
const pages = [
  // ================= FEATURES =================
  { 
    path: 'features/welcome.html', type: 'feature', title: 'Welcome & Goodbye', icon: '👋', 
    desc: 'Give your new members a warm welcome and keep track of who leaves your server.',
    sections: [
      { title: 'Beautiful Welcome Cards', desc: 'Create stunning, customized welcome images that greet new members as soon as they join. Add your server logo, custom background, and dynamic text.', reverse: false },
      { title: 'Informative Join Messages', desc: 'Send a detailed text message explaining your server rules, pointing out important channels, and introducing the community.', reverse: true },
      { title: 'Goodbye Tracking', desc: 'Automatically log when a user leaves the server. Keep your member lists clean and know exactly who is coming and going.', reverse: false }
    ]
  },
  { 
    path: 'features/custom-commands.html', type: 'feature', title: 'Custom Commands', icon: '📝', 
    desc: 'Build your own unique Discord bot by creating personalized commands.',
    sections: [
      { title: 'Auto-Responders', desc: 'Create commands that instantly reply to common questions. Perfect for FAQ, server links, and quick information retrieval.', reverse: false },
      { title: 'Advanced Variables', desc: 'Use variables like {user}, {server}, and {channel} to make your commands dynamic and personalized for every member.', reverse: true }
    ]
  },
  { 
    path: 'features/reaction-roles.html', type: 'feature', title: 'Reaction Roles', icon: '🎭', 
    desc: 'Let your community self-assign roles by clicking emojis.',
    sections: [
      { title: 'Automated Role Assignment', desc: 'Set up a message with emojis. When users react, Subhuu instantly grants them the corresponding role. No commands needed!', reverse: false },
      { title: 'Custom Menus', desc: 'Organize your roles into distinct categories like notification pings, color roles, or regional roles.', reverse: true }
    ]
  },
  { 
    path: 'features/moderation.html', type: 'feature', title: 'Moderation', icon: '🛡️', 
    desc: 'Keep your server safe from trolls, spam, and malicious links.',
    sections: [
      { title: 'Automated Link Detection', desc: 'Subhuu automatically detects and deletes known phishing and scam links, keeping your community safe from hackers.', reverse: false },
      { title: 'Word Filters & Anti-Spam', desc: 'Automatically mute members who spam messages or use banned words. Set threshold limits for strict enforcement.', reverse: true },
      { title: 'Audit Logging', desc: 'Track every deleted message, kick, ban, and role change in a dedicated, secure mod-log channel.', reverse: false }
    ]
  },
  { 
    path: 'features/leveling.html', type: 'feature', title: 'Leveling & XP', icon: '📈', 
    desc: 'Gamify your server and reward your most active members with XP.',
    sections: [
      { title: 'Earn XP by Chatting', desc: 'Members earn random amounts of XP for every message they send. Set cooldowns to prevent spamming.', reverse: false },
      { title: 'Unlock Exclusive Roles', desc: 'Create level milestones (e.g. Level 10, Level 50). When members reach these levels, Subhuu automatically assigns them exclusive reward roles.', reverse: true }
    ]
  },
  { 
    path: 'features/economy.html', type: 'feature', title: 'Economy System', icon: '💰', 
    desc: 'A fun virtual economy where users can earn, trade, and spend coins.',
    sections: [
      { title: 'Daily Rewards', desc: 'Keep members coming back every day to claim their daily coin rewards.', reverse: false },
      { title: 'Custom Role Shop', desc: 'Allow members to spend their hard-earned virtual currency on exclusive roles in your custom server shop.', reverse: true }
    ]
  },
  { 
    path: 'features/music.html', type: 'feature', title: 'Music Player', icon: '🎵', 
    desc: 'Play high-quality music directly in your voice channels.',
    sections: [
      { title: 'High Fidelity Audio', desc: 'Stream crystal clear audio from YouTube, Spotify, and SoundCloud directly into your voice channels.', reverse: false },
      { title: 'Interactive Controls', desc: 'Control the music using interactive buttons. Skip, pause, rewind, and view the queue without typing any commands.', reverse: true }
    ]
  },
  { 
    path: 'features/social-alerts.html', type: 'feature', title: 'Social Alerts', icon: '🔔', 
    desc: 'Get instantly notified when your favorite creators go live.',
    sections: [
      { title: 'YouTube & Twitch', desc: 'Connect your favorite channels. Subhuu will automatically ping your server the second a new video is uploaded or a stream goes live.', reverse: false }
    ]
  },

  // ================= PRICING =================
  { 
    path: 'premium.html', type: 'pricing', title: 'Subhuu Premium', icon: '👑', 
    desc: 'Unlock the full power of your Discord server with advanced features.'
  },

  // ================= RESOURCES / GENERIC =================
  { path: 'commands.html', type: 'resource', title: 'Commands List', icon: '💻', desc: 'A complete list of all available Subhuu commands.' },
  { path: 'leaderboard.html', type: 'resource', title: 'Global Leaderboard', icon: '🏆', desc: 'See who the most active members are across all servers.' },
  { path: 'resources/support.html', type: 'resource', title: 'Support Server', icon: '🆘', desc: 'Join our official Discord for 24/7 help from the community.' },
  { path: 'resources/tutorials.html', type: 'resource', title: 'Tutorials & Guides', icon: '📚', desc: 'Learn how to master Subhuu with step-by-step guides.' },
  { path: 'resources/help.html', type: 'resource', title: 'Help Center', icon: '❓', desc: 'Frequently asked questions and extensive documentation.' },

  // ================= LEGAL =================
  { path: 'legal/terms.html', type: 'legal', title: 'Terms of Service', icon: '⚖️', desc: 'Read our terms of service.' },
  { path: 'legal/privacy.html', type: 'legal', title: 'Privacy Policy', icon: '🔒', desc: 'How we protect and use your data.' },
  { path: 'legal/refund.html', type: 'legal', title: 'Refund Policy', icon: '💳', desc: 'Our refund and cancellation policies.' },
];

const generateNavbar = (rootPath) => `
  <nav>
    <a href="${rootPath}index.html" class="nav-brand">Subhuu</a>
    <div class="nav-links">
      <div class="nav-item dropdown">
        Features <span class="chevron-down">▼</span>
        <div class="dropdown-content">
          <a href="${rootPath}features/welcome.html" class="dropdown-item">👋 Welcome & Goodbye</a>
          <a href="${rootPath}features/custom-commands.html" class="dropdown-item">📝 Custom Commands</a>
          <a href="${rootPath}features/reaction-roles.html" class="dropdown-item">🎭 Reaction Roles</a>
          <a href="${rootPath}features/moderation.html" class="dropdown-item">🛡️ Moderation</a>
          <a href="${rootPath}features/leveling.html" class="dropdown-item">📈 Leveling</a>
          <a href="${rootPath}features/economy.html" class="dropdown-item">💰 Economy</a>
          <a href="${rootPath}features/music.html" class="dropdown-item">🎵 Music Player</a>
          <a href="${rootPath}features/social-alerts.html" class="dropdown-item">🔔 Social Alerts</a>
        </div>
      </div>
      <div class="nav-item dropdown">
        Resources <span class="chevron-down">▼</span>
        <div class="dropdown-content">
          <a href="${rootPath}resources/support.html" class="dropdown-item">🆘 Support Server</a>
          <a href="${rootPath}resources/tutorials.html" class="dropdown-item">📚 Tutorials</a>
          <a href="${rootPath}resources/help.html" class="dropdown-item">❓ Help Center</a>
        </div>
      </div>
      <div class="nav-item">EN <span class="chevron-down">▼</span></div>
    </div>
    <div class="nav-actions">
      <a href="${rootPath}premium.html" class="premium-badge">👑 Premium</a>
      <a href="/api/auth/login" class="btn btn-primary btn-sm login-btn">Login with Discord</a>
    </div>
  </nav>
`;

const generateFooter = (rootPath) => `
  <div class="final-cta">
    <h2>Ready to take your server to the next level?</h2>
    <a href="/api/auth/invite" target="_blank" class="btn">
      <svg style="width:24px;height:24px;margin-right:8px;" viewBox="0 0 24 24" fill="#006BFF"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
      Add to Discord
    </a>
  </div>
  <footer>
    <div class="footer-inner">
      <div>
        <div class="footer-brand">Subhuu</div>
        <p class="footer-desc">The best all-in-one Discord bot to manage, entertain, and grow your community.</p>
        <p class="footer-desc" style="font-size: 12px;">© 2026 Subhuu. All rights reserved.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <a href="${rootPath}premium.html">Premium</a>
        <a href="${rootPath}dashboard.html">Dashboard</a>
        <a href="${rootPath}commands.html">Commands</a>
        <a href="${rootPath}leaderboard.html">Leaderboard</a>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <a href="${rootPath}resources/support.html">Support Server</a>
        <a href="${rootPath}resources/tutorials.html">Tutorials</a>
        <a href="${rootPath}resources/help.html">Help Center</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="${rootPath}legal/terms.html">Terms of Service</a>
        <a href="${rootPath}legal/privacy.html">Privacy Policy</a>
        <a href="${rootPath}legal/refund.html">Refund Policy</a>
      </div>
    </div>
  </footer>
  <script>
    fetch('/api/auth/status').then(res => res.json()).then(data => {
      if (data.loggedIn) {
        document.querySelectorAll('.login-btn').forEach(link => {
          link.href = '${rootPath}dashboard.html';
          link.innerHTML = 'Go to Dashboard';
        });
      }
    }).catch(() => {});
  </script>
`;

const generateFeatureContent = (p) => {
  let html = `
    <div class="hero-section" style="text-align:center; max-width:800px; margin: 0 auto; padding-top:120px;">
      <div class="page-icon" style="font-size:64px; margin-bottom:20px;">${p.icon}</div>
      <h1 class="hero-title">${p.title}</h1>
      <p class="hero-desc">${p.desc}</p>
    </div>
    <div class="features-container" style="padding-top: 60px;">
  `;
  
  p.sections.forEach((sec, i) => {
    html += `
      <div class="feature-row ${sec.reverse ? 'reverse' : ''}">
        <div class="feature-mockup" style="min-height: 250px; justify-content: center; align-items: center; background: linear-gradient(135deg, rgba(57,148,255,0.1), rgba(0,0,0,0));">
           <div style="font-size: 80px; opacity: 0.5;">${p.icon}</div>
        </div>
        <div class="feature-text">
          <h2>${sec.title}</h2>
          <p>${sec.desc}</p>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
};

const generateLegalContent = (p) => {
  return `
    <div style="background: #ffffff; color: #333333; padding: 100px 20px;">
      <div style="max-width: 800px; margin: 0 auto; text-align: left;">
        <h1 style="font-size: 48px; font-weight: 800; margin-bottom: 20px;">${p.title}</h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 60px;">Last updated: September 2026</p>
        
        <h3 style="font-size: 24px; margin-bottom: 16px;">1. Introduction</h3>
        <p style="margin-bottom: 30px; line-height: 1.8;">Welcome to Subhuu. By using our services, you agree to these terms. We provide a comprehensive suite of moderation, economy, and community management tools for your Discord server.</p>
        
        <h3 style="font-size: 24px; margin-bottom: 16px;">2. User Data & Privacy</h3>
        <p style="margin-bottom: 30px; line-height: 1.8;">We only collect data necessary to provide our services, including Discord user IDs, guild IDs, and message content for moderation purposes. We do not sell your data to third parties.</p>
        
        <h3 style="font-size: 24px; margin-bottom: 16px;">3. Service Availability</h3>
        <p style="margin-bottom: 30px; line-height: 1.8;">While we strive for 99.9% uptime, the service is provided "as is". We are not responsible for damages caused by bot downtime or incorrect configuration.</p>
        
        <p style="margin-top: 60px; font-style: italic;">If you have any questions, please join our support server.</p>
      </div>
    </div>
  `;
};

const generatePricingContent = () => {
  return `
    <div style="padding: 120px 20px; text-align: center;">
      <h1 class="hero-title">Upgrade to Subhuu Premium</h1>
      <p class="hero-desc" style="max-width: 600px; margin: 0 auto 60px;">Get access to exclusive features, higher limits, and priority support.</p>
      
      <div style="display: flex; justify-content: center; gap: 40px; max-width: 1000px; margin: 0 auto; flex-wrap: wrap;">
        <!-- Free Tier -->
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 40px; width: 350px; text-align: left;">
          <h3 style="font-size: 24px; margin-bottom: 8px;">Free</h3>
          <div style="font-size: 40px; font-weight: 800; margin-bottom: 30px;">$0 <span style="font-size:16px; color:var(--text-muted); font-weight:500;">/ forever</span></div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;">
            <li>✅ Basic Moderation</li>
            <li>✅ Custom Commands (Limit 10)</li>
            <li>✅ Standard Economy</li>
            <li>❌ Premium Bot Customization</li>
          </ul>
          <button class="btn btn-secondary" style="width: 100%;">Current Plan</button>
        </div>
        
        <!-- Premium Tier -->
        <div style="background: linear-gradient(180deg, #2a3142 0%, var(--bg-card) 100%); border: 2px solid var(--accent); border-radius: 16px; padding: 40px; width: 350px; text-align: left; position: relative;">
          <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--accent); color: white; padding: 4px 16px; border-radius: 20px; font-weight: 700; font-size: 12px;">MOST POPULAR</div>
          <h3 style="font-size: 24px; margin-bottom: 8px; color: var(--accent);">Premium</h3>
          <div style="font-size: 40px; font-weight: 800; margin-bottom: 30px;">$4.99 <span style="font-size:16px; color:var(--text-muted); font-weight:500;">/ month</span></div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;">
            <li>✨ Advanced AutoMod Filters</li>
            <li>✨ Unlimited Custom Commands</li>
            <li>✨ 24/7 Voice Channel Music</li>
            <li>✨ Change Bot Avatar & Name</li>
          </ul>
          <button class="btn btn-primary" style="width: 100%;">Subscribe Now</button>
        </div>
      </div>
    </div>
  `;
};

const generateResourceContent = (p) => {
  return `
    <div style="padding: 120px 20px; text-align: center; max-width: 800px; margin: 0 auto; min-height: 60vh;">
      <div style="font-size: 80px; margin-bottom: 20px;">${p.icon}</div>
      <h1 class="hero-title">${p.title}</h1>
      <p class="hero-desc">${p.desc}</p>
      
      <div style="background: rgba(57,148,255,0.1); border: 1px solid var(--accent); border-radius: 12px; padding: 40px; margin-top: 40px;">
        <h3 style="font-size: 24px; margin-bottom: 16px; color: var(--accent);">Need immediate help?</h3>
        <p style="margin-bottom: 24px; line-height: 1.6;">Our community moderators and developers are available 24/7 in the official Discord support server to assist you with any configuration issues.</p>
        <a href="/api/auth/invite" class="btn btn-primary">Join Support Server</a>
      </div>
    </div>
  `;
};

const template = (p, depth) => {
  const rootPath = depth === 1 ? '../' : './';
  
  let contentHtml = '';
  if (p.type === 'feature') contentHtml = generateFeatureContent(p);
  else if (p.type === 'legal') contentHtml = generateLegalContent(p);
  else if (p.type === 'pricing') contentHtml = generatePricingContent(p);
  else contentHtml = generateResourceContent(p);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${p.title} | Subhuu Discord Bot</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #272934;
      --bg-card: #1E1F27;
      --accent: #3994FF;
      --accent-hover: #2B82F0;
      --text: #F2F4FB;
      --text-muted: #9195AB;
      --text-light: #D0D0D0;
      --border: rgba(255, 255, 255, 0.08);
      --nav-h: 70px;
    }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
    a { text-decoration: none; color: inherit; }
    
    /* NAVBAR */
    nav { position: sticky; top: 0; z-index: 100; height: var(--nav-h); background: rgba(39, 41, 52, 0.9); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 40px; gap: 32px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 800; color: var(--text); }
    .nav-links { display: flex; align-items: center; gap: 8px; flex: 1; }
    .nav-item { color: var(--text); font-size: 15px; font-weight: 600; padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: background 0.2s;}
    .nav-item:hover { background: rgba(255,255,255,0.08); }
    .chevron-down { font-size: 10px; opacity: 0.7; }
    .nav-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-sm { padding: 8px 16px; font-size: 14px; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-secondary { background: rgba(255, 255, 255, 0.1); color: white; }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
    .premium-badge { background: rgba(255, 195, 79, 0.14); color: #FFC34F; padding: 8px 16px; border-radius: 8px; font-size: 15px; font-weight: 700; display:flex; align-items:center; gap:6px; }

    /* DROPDOWNS */
    .dropdown { position: relative; }
    .dropdown-content { display: none; position: absolute; top: 100%; left: 0; background: var(--bg-card); min-width: 240px; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); padding: 12px 0; z-index: 200; margin-top: 15px; }
    .dropdown::before { content: ''; position: absolute; top: 100%; left: 0; right: 0; height: 15px; }
    .dropdown:hover .dropdown-content { display: flex; flex-direction: column; }
    .dropdown-item { padding: 12px 20px; color: var(--text-light); font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 12px; transition: background 0.2s, color 0.2s;}
    .dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }

    /* UTILS */
    .hero-title { font-size: 56px; font-weight: 800; line-height: 1.15; letter-spacing: -1px; margin-bottom: 24px; color: var(--text); }
    .hero-desc { font-size: 18px; color: var(--text-light); line-height: 1.6; margin-bottom: 40px; font-weight: 400; }
    
    /* FEATURE ROWS */
    .features-container { max-width: 1200px; margin: 0 auto; padding: 60px 32px 100px; display: flex; flex-direction: column; gap: 120px; }
    .feature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .feature-row.reverse { direction: rtl; }
    .feature-row.reverse > * { direction: ltr; }
    .feature-text h2 { font-size: 35px; font-weight: 800; line-height: 1.2; margin-bottom: 20px; color: var(--text); letter-spacing: -0.5px; }
    .feature-text p { font-size: 18px; color: var(--text-light); line-height: 1.6; }
    .feature-mockup { background: var(--bg-card); border-radius: 16px; padding: 30px; border: 1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 12px; }

    /* FINAL CTA */
    .final-cta { background: #006BFF; padding: 80px 20px; text-align: center; margin: 40px 0 0 0; }
    .final-cta h2 { font-size: 44px; font-weight: 800; color: white; margin-bottom: 30px; letter-spacing: -1px; }
    .final-cta .btn { background: white; color: #006BFF; font-size: 18px; padding: 16px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .final-cta .btn:hover { background: #f0f0f0; transform: translateY(-2px); }

    /* FOOTER */
    footer { background: var(--bg-card); border-top: 1px solid var(--border); padding: 80px 32px 60px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 300px 1fr 1fr 1fr; gap: 40px; text-align:left; }
    .footer-brand { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 16px; }
    .footer-desc { color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .footer-col h4 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 20px; }
    .footer-col a { display: block; font-size: 15px; color: var(--text-muted); margin-bottom: 12px; font-weight: 500; transition: color 0.2s;}
    .footer-col a:hover { color: var(--text); }
  </style>
</head>
<body>
  ${generateNavbar(rootPath)}
  <div style="flex:1;">
    ${contentHtml}
  </div>
  ${generateFooter(rootPath)}
</body>
</html>`;
};

pages.forEach(p => {
  const isNested = p.path.includes('/');
  const depth = isNested ? 1 : 0;
  const filePath = path.join(publicDir, p.path);
  fs.writeFileSync(filePath, template(p, depth));
  console.log('Generated fully-fleshed page:', p.path);
});
