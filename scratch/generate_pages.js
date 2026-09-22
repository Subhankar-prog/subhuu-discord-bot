const fs = require('fs');
const path = require('path');

const baseLayout = (title, contentBody) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} | Subhuu Discord Bot</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0F1015;
      --bg-card: rgba(255, 255, 255, 0.03);
      --bg-card2: rgba(255, 255, 255, 0.05);
      --accent: #3994FF;
      --accent-hover: #2B82F0;
      --purple: #D92662;
      --text: #F2F4FB;
      --text-muted: #9195AB;
      --text-light: #D0D0D0;
      --border: rgba(255, 255, 255, 0.08);
      --nav-h: 70px;
    }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
    a { text-decoration: none; color: inherit; }
    
    /* NAVBAR */
    nav { position: sticky; top: 0; z-index: 100; height: var(--nav-h); background: rgba(15, 16, 21, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 40px; gap: 32px; }
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
    .dropdown-content { display: none; position: absolute; top: 100%; left: 0; background: #1E1F27; min-width: 240px; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); padding: 12px 0; z-index: 200; margin-top: 15px; }
    .dropdown::before { content: ''; position: absolute; top: 100%; left: 0; right: 0; height: 15px; }
    .dropdown:hover .dropdown-content { display: flex; flex-direction: column; }
    .dropdown-item { padding: 12px 20px; color: var(--text-light); font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 12px; transition: background 0.2s, color 0.2s;}
    .dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }

    /* PAGE LAYOUT */
    .page-container { flex: 1; padding: 80px 20px; max-width: 1000px; margin: 0 auto; width: 100%; }
    .page-header { text-align: center; margin-bottom: 60px; }
    .page-title { font-size: 48px; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; 
                  background: linear-gradient(90deg, #fff, #9195AB); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}
    .page-desc { font-size: 18px; color: var(--text-muted); line-height: 1.6; }
    
    /* GLASS BOX */
    .glass-box {
      background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px); border-radius: 16px; padding: 40px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.4);
    }
    
    /* TYPOGRAPHY IN BOX */
    .glass-box h2 { font-size: 28px; margin-top: 40px; margin-bottom: 20px; color: #fff; }
    .glass-box h2:first-child { margin-top: 0; }
    .glass-box p { font-size: 16px; color: var(--text-light); line-height: 1.7; margin-bottom: 20px; }
    .glass-box ul { margin-left: 20px; margin-bottom: 20px; color: var(--text-light); line-height: 1.7; }
    .glass-box li { margin-bottom: 10px; }

    /* FINAL CTA */
    .final-cta { background: #006BFF; padding: 80px 20px; text-align: center; margin: 40px 0 0 0; }
    .final-cta h2 { font-size: 44px; font-weight: 800; color: white; margin-bottom: 30px; letter-spacing: -1px; }
    .final-cta .btn { background: white; color: #006BFF; font-size: 18px; padding: 16px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .final-cta .btn:hover { background: #f0f0f0; transform: translateY(-2px); }

    /* FOOTER */
    footer { background: #1E1F27; border-top: 1px solid var(--border); padding: 80px 32px 60px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 300px 1fr 1fr 1fr; gap: 40px; text-align:left; }
    .footer-brand { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 16px; }
    .footer-desc { color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .footer-col h4 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 20px; }
    .footer-col a { display: block; font-size: 15px; color: var(--text-muted); margin-bottom: 12px; font-weight: 500; transition: color 0.2s;}
    .footer-col a:hover { color: var(--text); }
  </style>
</head>
<body>
  
  <nav>
    <a href="/" class="nav-brand">Subhuu</a>
    <div class="nav-links">
      <div class="nav-item">Features</div>
      <div class="nav-item">Resources</div>
      <div class="nav-item">EN</div>
    </div>
    <div class="nav-actions">
      <a href="/premium.html" class="premium-badge">👑 Premium</a>
      <a href="/api/auth/login" class="btn btn-primary btn-sm login-btn">Login with Discord</a>
    </div>
  </nav>

  <div class="page-container">
    ${contentBody}
  </div>
  
  <div class="final-cta">
    <h2>Ready to take your server to the next level?</h2>
    <a href="/api/auth/invite" target="_blank" class="btn">Add to Discord</a>
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
        <a href="/premium.html">Premium</a>
        <a href="/dashboard.html">Dashboard</a>
        <a href="/commands.html">Commands</a>
        <a href="/leaderboard.html">Leaderboard</a>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <a href="/resources/support.html">Support Server</a>
        <a href="/resources/tutorials.html">Tutorials</a>
        <a href="/resources/help.html">Help Center</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <a href="/legal/terms.html">Terms of Service</a>
        <a href="/legal/privacy.html">Privacy Policy</a>
        <a href="/legal/refund.html">Refund Policy</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

const pages = {};

// 1. LEGAL: Terms
pages['legal/terms.html'] = {
  title: 'Terms of Service',
  content: `
    <div class="page-header">
      <h1 class="page-title">Terms of Service</h1>
      <p class="page-desc">Please read these terms carefully before using Subhuu in your Discord server.</p>
    </div>
    <div class="glass-box">
      <h2>1. Acceptance of Terms</h2>
      <p>By inviting Subhuu to your Discord server or logging into our web dashboard, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
      
      <h2>2. Usage Restrictions</h2>
      <p>You agree not to use the bot for any illegal purposes or to violate Discord's Terms of Service. Specifically, you may not:</p>
      <ul>
        <li>Exploit the economy system using automated macros or self-botting.</li>
        <li>Use the bot to mass-DM or spam users.</li>
        <li>Attempt to bypass API rate limits or premium restrictions.</li>
      </ul>
      
      <h2>3. Premium Subscriptions</h2>
      <p>Premium features are unlocked immediately upon payment. Subscriptions auto-renew unless cancelled. You are responsible for managing your billing through our dashboard.</p>
      
      <h2>4. Termination</h2>
      <p>We reserve the right to ban your account or blacklist your server at any time without notice if we determine you have violated these terms or attempted to harm the bot's infrastructure.</p>
    </div>
  `
};

// 2. LEGAL: Privacy
pages['legal/privacy.html'] = {
  title: 'Privacy Policy',
  content: `
    <div class="page-header">
      <h1 class="page-title">Privacy Policy</h1>
      <p class="page-desc">Transparency is key. Here is exactly what data we collect and how we use it.</p>
    </div>
    <div class="glass-box">
      <h2>1. Information We Collect</h2>
      <p>When you use Subhuu, we automatically collect the following strictly necessary data:</p>
      <ul>
        <li><strong>Discord IDs:</strong> We store User IDs, Guild IDs, and Role IDs to map economy balances, settings, and XP.</li>
        <li><strong>Message Content:</strong> For Moderation features (AutoMod, Logging), we temporarily process message content. We do NOT permanently store your messages unless they trigger a moderation alert log.</li>
      </ul>
      
      <h2>2. How We Use Your Data</h2>
      <p>Your data is used exclusively to provide bot functionality. We do not sell, rent, or share your data with any third parties or advertising agencies.</p>
      
      <h2>3. Data Deletion</h2>
      <p>If you kick Subhuu from your server, we retain server settings for 30 days in case you re-invite it. After 30 days, all guild configurations are permanently purged. To request an immediate data wipe, use the <code>/privacy-wipe</code> command.</p>
    </div>
  `
};

// 3. LEGAL: Refund
pages['legal/refund.html'] = {
  title: 'Refund Policy',
  content: `
    <div class="page-header">
      <h1 class="page-title">Refund Policy</h1>
      <p class="page-desc">Information regarding premium purchases and billing disputes.</p>
    </div>
    <div class="glass-box">
      <h2>1. General Refund Policy</h2>
      <p>We offer a <strong>7-day money-back guarantee</strong> on all first-time Premium subscriptions. If you are not satisfied with the premium features, you can request a full refund within 7 days of your initial purchase.</p>
      
      <h2>2. Non-Refundable Items</h2>
      <p>The following are strictly non-refundable:</p>
      <ul>
        <li>Subscription renewals (you must cancel before the renewal date).</li>
        <li>Purchases of virtual in-bot currency (Subhuu Coins).</li>
        <li>Custom bot instances that have already been deployed.</li>
      </ul>
      
      <h2>3. Requesting a Refund</h2>
      <p>To request a refund, please open a Billing Ticket in our official Discord Support Server. Do NOT open a chargeback through your bank, as this will result in a permanent blacklist from our services.</p>
    </div>
  `
};

// 4. RESOURCES: Support
pages['resources/support.html'] = {
  title: 'Support Hub',
  content: `
    <style>
      .support-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .support-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; text-align: center; transition: 0.3s; }
      .support-card:hover { border-color: var(--accent); transform: translateY(-5px); }
      .support-icon { font-size: 48px; margin-bottom: 20px; }
      .support-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
      .support-desc { color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
    </style>
    <div class="page-header">
      <h1 class="page-title">Need Help?</h1>
      <p class="page-desc">Our dedicated team of support engineers is ready to assist you.</p>
    </div>
    <div class="support-grid">
      <div class="support-card">
        <div class="support-icon">💬</div>
        <div class="support-title">Discord Community</div>
        <div class="support-desc">Get instant help from our support team and community members in our official server. Average response time: 2 minutes.</div>
        <a href="/api/auth/invite" class="btn btn-primary">Join Support Server</a>
      </div>
      <div class="support-card">
        <div class="support-icon">📧</div>
        <div class="support-title">Email Support</div>
        <div class="support-desc">For billing inquiries, business proposals, or serious security reports, please reach out to us via email.</div>
        <a href="mailto:support@subhuu.com" class="btn btn-secondary">support@subhuu.com</a>
      </div>
    </div>
  `
};

// 5. RESOURCES: Tutorials
pages['resources/tutorials.html'] = {
  title: 'Tutorials',
  content: `
    <style>
      .tut-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .tut-card { background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.3s; }
      .tut-card:hover { border-color: var(--accent); }
      .tut-img { height: 160px; background: #111; display:flex; align-items:center; justify-content:center; font-size: 40px; }
      .tut-body { padding: 20px; }
      .tut-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      .tut-time { font-size: 12px; color: var(--accent); font-weight: 600; }
    </style>
    <div class="page-header">
      <h1 class="page-title">Guides & Tutorials</h1>
      <p class="page-desc">Master every feature of Subhuu with our comprehensive guides.</p>
    </div>
    <div class="tut-grid">
      <div class="tut-card">
        <div class="tut-img">🤖</div>
        <div class="tut-body"><div class="tut-time">5 MIN READ</div><div class="tut-title">Setting up AI Responses</div></div>
      </div>
      <div class="tut-card">
        <div class="tut-img">💰</div>
        <div class="tut-body"><div class="tut-time">10 MIN READ</div><div class="tut-title">Economy Shop Configuration</div></div>
      </div>
      <div class="tut-card">
        <div class="tut-img">🛡️</div>
        <div class="tut-body"><div class="tut-time">8 MIN READ</div><div class="tut-title">Advanced AutoMod Rules</div></div>
      </div>
      <div class="tut-card">
        <div class="tut-img">🎉</div>
        <div class="tut-body"><div class="tut-time">3 MIN READ</div><div class="tut-title">Hosting your first Giveaway</div></div>
      </div>
      <div class="tut-card">
        <div class="tut-img">📈</div>
        <div class="tut-body"><div class="tut-time">6 MIN READ</div><div class="tut-title">Customizing Level Up Cards</div></div>
      </div>
      <div class="tut-card">
        <div class="tut-img">🎵</div>
        <div class="tut-body"><div class="tut-time">2 MIN READ</div><div class="tut-title">Creating Music Playlists</div></div>
      </div>
    </div>
  `
};

// 6. RESOURCES: Help Center
pages['resources/help.html'] = {
  title: 'Help Center FAQ',
  content: `
    <style>
      .faq-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
      .faq-q { padding: 24px; font-size: 18px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
      .faq-q:hover { background: rgba(255,255,255,0.05); }
      .faq-a { padding: 0 24px 24px; color: var(--text-light); line-height: 1.6; display: none; }
      .faq-item.active .faq-a { display: block; }
      .faq-item.active .faq-q { color: var(--accent); }
    </style>
    <div class="page-header">
      <h1 class="page-title">Frequently Asked Questions</h1>
      <p class="page-desc">Everything you need to know about setting up and using Subhuu.</p>
    </div>
    <div class="faq-container">
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('active')">Why is the music player saying "Unsupported Link"? <span>+</span></div>
        <div class="faq-a">Due to YouTube's strict anti-bot protections, some regions are periodically blocked. We push weekly updates to bypass this, so please ensure your server region is set properly, or use Spotify links as an alternative.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('active')">How do I change the bot prefix? <span>+</span></div>
        <div class="faq-a">Subhuu exclusively uses Discord Slash Commands (e.g. /play) for maximum security and ease of use. Custom text prefixes are only available for Custom Commands created in the dashboard.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('active')">Can I transfer my Premium to a different server? <span>+</span></div>
        <div class="faq-a">Yes! You can reallocate your Premium Server Boost from the Billing tab in the web dashboard instantly at any time.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q" onclick="this.parentElement.classList.toggle('active')">The bot is offline in my server! <span>+</span></div>
        <div class="faq-a">If the bot is offline, we are likely pushing a major update or Discord is experiencing API issues. Check the #status channel in our Support Server for real-time updates.</div>
      </div>
    </div>
  `
};

// 7. PRODUCT: Premium
pages['premium.html'] = {
  title: 'Premium',
  content: `
    <style>
      .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
      .price-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 50px; text-align: center; position: relative; overflow: hidden; }
      .price-card.pro { border-color: var(--accent); background: rgba(57, 148, 255, 0.05); }
      .price-card.pro::before { content: 'MOST POPULAR'; position: absolute; top: 12px; right: -30px; background: var(--accent); color: white; font-size: 11px; font-weight: 800; padding: 4px 30px; transform: rotate(45deg); }
      .p-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
      .p-price { font-size: 48px; font-weight: 800; margin-bottom: 24px; }
      .p-price span { font-size: 18px; color: var(--text-muted); font-weight: 500; }
      .p-list { list-style: none; text-align: left; margin-bottom: 40px; }
      .p-list li { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px; color: var(--text-light); }
      .p-list li::before { content: '✓'; color: #00E676; font-weight: 800; }
    </style>
    <div class="page-header">
      <h1 class="page-title">Supercharge your community.</h1>
      <p class="page-desc">Unlock advanced features, higher limits, and priority support.</p>
    </div>
    <div class="pricing-grid">
      <div class="price-card">
        <div class="p-title">Free Plan</div>
        <div class="p-price">$0<span>/mo</span></div>
        <ul class="p-list">
          <li>Core Moderation & Economy</li>
          <li>Basic Leveling System</li>
          <li>Standard Audio Quality (128kbps)</li>
          <li>Community Support</li>
        </ul>
        <a href="/api/auth/invite" class="btn btn-secondary" style="width:100%;">Current Plan</a>
      </div>
      <div class="price-card pro">
        <div class="p-title">Subhuu Pro</div>
        <div class="p-price">$4.99<span>/mo</span></div>
        <ul class="p-list">
          <li>AI Chat Integration & Auto-responder</li>
          <li>Custom Bot Avatars & Responses</li>
          <li>High Fidelity Audio (384kbps)</li>
          <li>24/7 Priority Ticket Support</li>
          <li>Unlimited Custom Commands</li>
        </ul>
        <button class="btn btn-primary" style="width:100%;">Upgrade to Pro</button>
      </div>
    </div>
  `
};

// 8. PRODUCT: Commands
pages['commands.html'] = {
  title: 'Commands',
  content: `
    <style>
      .cmd-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; }
      .cmd-table th, .cmd-table td { padding: 16px 24px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .cmd-table th { background: rgba(255,255,255,0.05); font-weight: 700; color: var(--text); }
      .cmd-table td { color: var(--text-light); font-size: 15px; }
      .cmd-name { font-family: monospace; background: rgba(57,148,255,0.15); color: var(--accent); padding: 4px 8px; border-radius: 6px; }
    </style>
    <div class="page-header">
      <h1 class="page-title">Command Reference</h1>
      <p class="page-desc">A complete list of all Slash Commands available in Subhuu.</p>
    </div>
    <table class="cmd-table">
      <tr><th>Command</th><th>Description</th><th>Category</th></tr>
      <tr><td><span class="cmd-name">/play [song]</span></td><td>Plays a song from YouTube or Spotify in your voice channel.</td><td>Music</td></tr>
      <tr><td><span class="cmd-name">/skip</span></td><td>Skips the currently playing song.</td><td>Music</td></tr>
      <tr><td><span class="cmd-name">/ban [user] [reason]</span></td><td>Bans a user from the server permanently.</td><td>Moderation</td></tr>
      <tr><td><span class="cmd-name">/timeout [user] [duration]</span></td><td>Timeouts a user preventing them from sending messages.</td><td>Moderation</td></tr>
      <tr><td><span class="cmd-name">/balance</span></td><td>Checks your current economy coin balance.</td><td>Economy</td></tr>
      <tr><td><span class="cmd-name">/daily</span></td><td>Claims your daily economy reward.</td><td>Economy</td></tr>
      <tr><td><span class="cmd-name">/rank</span></td><td>Displays your beautiful XP leveling card.</td><td>Leveling</td></tr>
      <tr><td><span class="cmd-name">/ask [query]</span></td><td>Ask the AI assistant any question (Pro only).</td><td>AI</td></tr>
    </table>
  `
};

// 9. PRODUCT: Leaderboard
pages['leaderboard.html'] = {
  title: 'Global Leaderboard',
  content: `
    <style>
      .lb-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 24px; margin-bottom: 16px; transition: 0.2s;}
      .lb-card:hover { background: rgba(255,255,255,0.06); }
      .lb-rank { font-size: 32px; font-weight: 800; color: var(--text-muted); width: 50px; text-align: center; }
      .lb-card:nth-child(1) .lb-rank { color: #FFD700; text-shadow: 0 0 20px rgba(255,215,0,0.5); }
      .lb-card:nth-child(2) .lb-rank { color: #C0C0C0; }
      .lb-card:nth-child(3) .lb-rank { color: #CD7F32; }
      .lb-avatar { width: 64px; height: 64px; border-radius: 50%; background: #222; border: 2px solid var(--accent); }
      .lb-info { flex: 1; }
      .lb-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
      .lb-level { font-size: 14px; color: var(--text-light); }
      .lb-xp { font-size: 24px; font-weight: 800; color: var(--accent); }
    </style>
    <div class="page-header">
      <h1 class="page-title">Global Top Users</h1>
      <p class="page-desc">The most active users across the entire Subhuu network.</p>
    </div>
    <div>
      <div class="lb-card">
        <div class="lb-rank">#1</div><div class="lb-avatar"></div>
        <div class="lb-info"><div class="lb-name">ShadowBlade</div><div class="lb-level">Level 142 • Server: PUBG Mobile</div></div>
        <div class="lb-xp">1,492,050 XP</div>
      </div>
      <div class="lb-card">
        <div class="lb-rank">#2</div><div class="lb-avatar"></div>
        <div class="lb-info"><div class="lb-name">NeonNite</div><div class="lb-level">Level 138 • Server: Roblox</div></div>
        <div class="lb-xp">1,250,900 XP</div>
      </div>
      <div class="lb-card">
        <div class="lb-rank">#3</div><div class="lb-avatar"></div>
        <div class="lb-info"><div class="lb-name">Koda_UI</div><div class="lb-level">Level 135 • Server: Anime Hub</div></div>
        <div class="lb-xp">1,180,420 XP</div>
      </div>
      <div class="lb-card">
        <div class="lb-rank">#4</div><div class="lb-avatar"></div>
        <div class="lb-info"><div class="lb-name">Alex_Dev</div><div class="lb-level">Level 120 • Server: Coding Den</div></div>
        <div class="lb-xp">984,200 XP</div>
      </div>
    </div>
  `
};

// Write all files
for (const [relPath, data] of Object.entries(pages)) {
  const fullPath = path.join(__dirname, '..', 'public', relPath);
  
  // Ensure directory exists
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const htmlOutput = baseLayout(data.title, data.content);
  fs.writeFileSync(fullPath, htmlOutput);
  console.log(`Generated \${relPath}`);
}
