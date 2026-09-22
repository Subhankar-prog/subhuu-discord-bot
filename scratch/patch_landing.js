const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const newCSS = `
    /* ============================
       NEW FEATURES GRID & MODAL
       ============================ */
    .features-grid-new {
      max-width: 1200px; margin: 0 auto; padding: 60px 32px 100px;
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
    }
    .feature-card-new {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px 24px; text-align: center;
      cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;
    }
    .feature-card-new:hover {
      transform: translateY(-5px); border-color: var(--accent);
      box-shadow: 0 15px 35px rgba(217, 38, 98, 0.15);
    }
    .feature-card-new::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--purple)); opacity: 0; transition: 0.3s;
    }
    .feature-card-new:hover::before { opacity: 1; }
    .fc-icon { font-size: 42px; margin-bottom: 20px; display: inline-block; }
    .fc-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
    .fc-desc { font-size: 14px; color: var(--text-muted); line-height: 1.5; }

    /* MODAL */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: 0.3s ease; padding: 20px;
    }
    .modal-overlay.open { opacity: 1; pointer-events: auto; }
    .modal-content {
      background: var(--bg-card2); border: 1px solid var(--border);
      border-radius: 20px; max-width: 900px; width: 100%; max-height: 90vh;
      overflow-y: auto; position: relative; transform: scale(0.95); transition: 0.3s ease;
      display: grid; grid-template-columns: 1fr 1fr;
    }
    .modal-overlay.open .modal-content { transform: scale(1); }
    .modal-close {
      position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1);
      border: none; color: white; width: 36px; height: 36px; border-radius: 50%;
      cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;
      transition: 0.2s; z-index: 10;
    }
    .modal-close:hover { background: var(--accent); }
    .modal-image-container {
      background: #000; border-radius: 20px 0 0 20px; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-image-container img { width: 100%; height: 100%; object-fit: cover; }
    .modal-details { padding: 40px; }
    .modal-title { font-size: 32px; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
    .modal-desc { font-size: 16px; color: var(--text-light); line-height: 1.6; margin-bottom: 24px; }
    .modal-subtitle { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 12px; margin-top: 24px;}
    .modal-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .modal-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-muted); line-height: 1.5; }
    .modal-list li::before { content: '✓'; color: var(--accent); font-weight: bold; }

    @media (max-width: 900px) {
      .features-grid-new { grid-template-columns: 1fr 1fr; }
      .modal-content { grid-template-columns: 1fr; }
      .modal-image-container { border-radius: 20px 20px 0 0; max-height: 250px; }
      .modal-details { padding: 24px; }
    }
    @media (max-width: 600px) {
      .features-grid-new { grid-template-columns: 1fr; }
    }
`;

const newHTML = `
  <!-- NEW FEATURES SECTION -->
  <div id="features" class="section">
    <div class="section-title">Everything you need. In one bot.</div>
    <div class="section-sub">Click on any module to see how it supercharges your server.</div>
    <div class="features-grid-new" id="features-grid-new">
      <!-- Injected by JS -->
    </div>
  </div>

  <!-- FEATURE MODAL -->
  <div class="modal-overlay" id="feature-modal" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeModal(event, true)">✕</button>
      <div class="modal-image-container">
        <img id="modal-img" src="" alt="Feature Graphic">
      </div>
      <div class="modal-details">
        <h2 class="modal-title"><span id="modal-icon"></span> <span id="modal-title-text"></span></h2>
        <p class="modal-desc" id="modal-desc"></p>
        
        <h3 class="modal-subtitle">How it works</h3>
        <p id="modal-how" style="font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;"></p>
        
        <h3 class="modal-subtitle">Advantages</h3>
        <ul class="modal-list" id="modal-advantages">
        </ul>
      </div>
    </div>
  </div>
`;

const newJS = `
  <script>
    const featuresData = [
      {
        id: "economy",
        icon: "💰",
        title: "Economy & Shop",
        shortDesc: "Virtual currency, daily rewards, and custom role shop.",
        desc: "Transform your server into a bustling virtual economy. Allow users to earn coins through activity, daily claims, and mini-games.",
        how: "Users earn currency globally or locally. They can gamble, transfer funds, or spend it in the server shop to buy exclusive custom roles configured by admins via the web dashboard.",
        advantages: [
          "Encourages high user activity and retention.",
          "Fully customizable currency name and symbols.",
          "Seamless web dashboard integration to edit user balances.",
          "Gambling mini-games like slots and coinflip."
        ],
        image: "/assets/feature_economy_" // We will match prefix
      },
      {
        id: "leveling",
        icon: "📈",
        title: "Leveling System",
        shortDesc: "Gamify your server with XP and milestone roles.",
        desc: "Reward your most active community members automatically. Users gain XP for chatting and unlock rewards.",
        how: "Subhuu tracks message activity and grants random XP (configurable bounds). Upon reaching a new level, the bot announces it and grants milestone roles automatically.",
        advantages: [
          "Spam-proof cooldowns to prevent XP grinding.",
          "Beautiful graphical rank cards with user avatars.",
          "Automated role assignment removes manual admin work.",
          "Dedicated web leaderboard and role rewards setup."
        ],
        image: "/assets/feature_leveling_"
      },
      {
        id: "moderation",
        icon: "🛡️",
        title: "Moderation",
        shortDesc: "Automod, logs, and powerful protection tools.",
        desc: "Keep your community safe 24/7 without breaking a sweat. Sentinel-grade security filters out bad actors.",
        how: "Setup automated filters for scam links, bad words, and spam. Use simple slash commands to kick, ban, or timeout users, all while keeping a permanent web audit log.",
        advantages: [
          "Zero-day anti-scam link protection blocks malicious bots.",
          "Web-based permanent audit log to track mod actions.",
          "Auto-timeout capabilities for spam prevention.",
          "Clean, beautiful embed logs sent to a designated channel."
        ],
        image: "/assets/feature_moderation_"
      },
      {
        id: "welcome",
        icon: "👋",
        title: "Welcome & Auto-Roles",
        shortDesc: "Greet new users with beautiful cards and instant roles.",
        desc: "Make a stunning first impression. Subhuu welcomes new explorers instantly and assigns them starting roles.",
        how: "Configure a welcome channel in the dashboard. When a user joins, Subhuu generates a highly customized welcome image with their avatar, name, and member number.",
        advantages: [
          "Instantly assign 'Member' roles upon joining.",
          "Highly customizable text templates with {user} variables.",
          "Supports leave/goodbye messages to track retention.",
          "Beautiful graphical welcome cards make your server look premium."
        ],
        image: "/assets/feature_welcome_"
      },
      {
        id: "custom",
        icon: "📝",
        title: "Custom Commands",
        shortDesc: "Build auto-responders and personalized text commands.",
        desc: "Make Subhuu truly yours by teaching it new tricks without writing a single line of code.",
        how: "Use the dashboard to define trigger words or phrases (e.g., '!socials'). When a user types it, Subhuu instantly responds with the text you defined.",
        advantages: [
          "Perfect for FAQs, rules, or social media links.",
          "No coding required — entirely managed via Web UI.",
          "Lightning fast response times.",
          "Create unlimited custom commands."
        ],
        image: "/assets/feature_custom_commands_"
      },
      {
        id: "reaction",
        icon: "🎭",
        title: "Reaction Roles",
        shortDesc: "Let users self-assign roles by clicking emojis.",
        desc: "Automate your onboarding process. Users can click emojis on a message to instantly gain or lose roles.",
        how: "Provide a Message ID, an Emoji, and a Role in the dashboard. Subhuu watches that message forever and handles the role assignments silently in the background.",
        advantages: [
          "Reduces friction for new users picking server regions or colors.",
          "Handles thousands of clicks simultaneously without lag.",
          "Configure entirely through the Web Dashboard.",
          "Supports both standard and custom server emojis."
        ],
        image: "/assets/feature_reaction_roles_"
      },
      {
        id: "music",
        icon: "🎵",
        title: "Music Player",
        shortDesc: "High-quality YouTube & Spotify audio streaming.",
        desc: "Listen to your favorite tracks directly in Discord voice channels with a premium audio experience.",
        how: "Join a voice channel and type '/play [song]'. Subhuu will join, fetch the audio, and provide a sleek 'Now Playing' card with interactive skip/pause buttons.",
        advantages: [
          "Bypasses latest YouTube anti-bot restrictions automatically.",
          "Supports YouTube, Spotify, and SoundCloud.",
          "Interactive control buttons (Pause, Skip, Volume).",
          "Create and save custom playlists directly to your account."
        ],
        image: "/assets/feature_music_"
      },
      {
        id: "dashboard",
        icon: "⚙️",
        title: "Web Dashboard",
        shortDesc: "Configure everything from a sleek web interface.",
        desc: "No more confusing command-line setups. Subhuu offers a full-fledged SPA dashboard to manage your server.",
        how: "Log in with Discord on our website. Select your server and toggle modules, edit economy balances, view logs, and change settings in real-time.",
        advantages: [
          "Mobile responsive, accessible from your phone.",
          "Real-time settings synchronization with the bot.",
          "View live audit logs directly in the browser.",
          "Visually manage command permissions and modules."
        ],
        image: "/assets/feature_dashboard_"
      }
    ];

    // Find actual filenames (since timestamps vary)
    const availableAssets = [
      "feature_economy_1790055132398.jpg",
      "feature_leveling_1790055151917.jpg",
      "feature_moderation_1790055165231.jpg",
      "feature_welcome_1790055178477.jpg",
      "feature_custom_commands_1790055204805.jpg",
      "feature_reaction_roles_1790055220227.jpg",
      "feature_music_1790055234490.jpg",
      "feature_dashboard_1790055327900.jpg"
    ];

    document.addEventListener('DOMContentLoaded', () => {
      const grid = document.getElementById('features-grid-new');
      if(grid) {
        featuresData.forEach(f => {
          const card = document.createElement('div');
          card.className = 'feature-card-new';
          card.innerHTML = \`
            <div class="fc-icon">\${f.icon}</div>
            <div class="fc-title">\${f.title}</div>
            <div class="fc-desc">\${f.shortDesc}</div>
          \`;
          card.onclick = () => openFeatureModal(f);
          grid.appendChild(card);
        });
      }
    });

    function openFeatureModal(f) {
      document.getElementById('modal-icon').innerText = f.icon;
      document.getElementById('modal-title-text').innerText = f.title;
      document.getElementById('modal-desc').innerText = f.desc;
      document.getElementById('modal-how').innerText = f.how;
      
      const ul = document.getElementById('modal-advantages');
      ul.innerHTML = '';
      f.advantages.forEach(adv => {
        const li = document.createElement('li');
        li.innerText = adv;
        ul.appendChild(li);
      });

      // Find image
      const imgFile = availableAssets.find(a => a.startsWith(f.image.replace('/assets/', '')));
      document.getElementById('modal-img').src = imgFile ? ('/assets/' + imgFile) : '';

      document.getElementById('feature-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(e, force = false) {
      if (force || e.target.id === 'feature-modal') {
        document.getElementById('feature-modal').classList.remove('open');
        document.body.style.overflow = 'auto';
      }
    }
  </script>
`;

// 1. Inject CSS
html = html.replace(/    \/\* ============================\r?\n       ALTERNATING FEATURES SECTION/, newCSS + '\n    /* ============================\n       ALTERNATING FEATURES SECTION');

// 2. Replace the HTML section
html = html.replace(/<div id="features" class="features-container">[\s\S]*?<!-- TRUSTED BY/i, newHTML + '\n  <!-- TRUSTED BY');

// 3. Inject JS before </body>
html = html.replace(/<\/body>/, newJS + '\n</body>');

fs.writeFileSync('public/index.html', html);
console.log('Successfully patched index.html with new features grid and modals.');
