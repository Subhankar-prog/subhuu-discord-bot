const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const newFeaturesStr = `,
      {
        id: "ai",
        icon: "🤖",
        title: "AI Chat & Automation",
        shortDesc: "GPT-powered conversations and image generation.",
        desc: "Transform your server into a futuristic hub. Subhuu uses advanced neural networks to converse naturally with your community.",
        how: "Users can just @mention Subhuu in any channel to ask questions, write stories, or generate images based on text prompts.",
        advantages: [
          "Uses cutting-edge AI for human-like responses.",
          "Instantly generates beautiful images from text.",
          "Can summarize long conversations automatically.",
          "Keeps your community engaged 24/7."
        ],
        image: "/assets/feature_ai_"
      },
      {
        id: "tickets",
        icon: "🎫",
        title: "Support Tickets",
        shortDesc: "Private channels for server support and reports.",
        desc: "Provide professional, organized support to your server members with a seamless ticket system.",
        how: "Members click a button on a panel to instantly create a private text channel. When the issue is resolved, admins can close it to save a transcript.",
        advantages: [
          "Organizes support requests efficiently.",
          "Fully automated web transcripts for accountability.",
          "Claim system so admins know who is helping who.",
          "Highly customizable embed panels."
        ],
        image: "/assets/feature_tickets_"
      },
      {
        id: "giveaways",
        icon: "🎉",
        title: "Automated Giveaways",
        shortDesc: "Host giveaways with instant winner selection.",
        desc: "Grow your server activity effortlessly by hosting massive automated giveaways.",
        how: "Use a simple slash command to start a giveaway. Subhuu handles the timer, tracks entries, and automatically selects and pings the winner when time is up.",
        advantages: [
          "Requires users to join a voice channel or have a role to enter.",
          "Automatic winner re-rolling if needed.",
          "Multi-winner support for huge events.",
          "Bypass requirements feature for Premium users."
        ],
        image: "/assets/feature_giveaways_"
      },
      {
        id: "socials",
        icon: "📡",
        title: "Social Media Alerts",
        shortDesc: "Twitch, YouTube, and X auto-posting feeds.",
        desc: "Never let your community miss an upload. Subhuu automatically alerts your server when content creators go live.",
        how: "Link your favorite YouTube channels or Twitch streamers in the dashboard. Subhuu will post a sleek embed whenever they post new content.",
        advantages: [
          "Replaces the need for a separate ping bot.",
          "Customizable ping roles (e.g., @Notify).",
          "Lightning fast webhook response times.",
          "Supports YouTube, Twitch, and Twitter/X."
        ],
        image: "/assets/feature_socials_"
      },
      {
        id: "voice",
        icon: "🔊",
        title: "Temporary Voice (J2C)",
        shortDesc: "Join-to-Create private voice channel hubs.",
        desc: "Keep your server clean without having 50 empty voice channels cluttering the sidebar.",
        how: "A user joins a designated 'Create Voice' channel, and Subhuu instantly creates a private, temporary voice channel just for them and their friends.",
        advantages: [
          "Auto-deletes channels when they become empty.",
          "Creators get admin rights to their temp channel.",
          "Easily lock, unlock, or kick users from temp channels.",
          "Great for dynamic LFG (Looking for Group) servers."
        ],
        image: "/assets/feature_voice_"
      },
      {
        id: "verification",
        icon: "🔐",
        title: "Anti-Raid Verification",
        shortDesc: "Captcha and gateway security to prevent bot raids.",
        desc: "Protect your server from targeted malicious bot attacks using enterprise-grade verification.",
        how: "New users are placed in quarantine. They must click a web link and solve a secure Captcha challenge before being granted access to the rest of the server.",
        advantages: [
          "100% effective against automated user-bot raids.",
          "Seamless web integration for the Captcha.",
          "Grants the verified role automatically upon success.",
          "Logs all failed verification attempts."
        ],
        image: "/assets/feature_moderation_" // Reusing moderation image as a generic security shield
      }
    ];`;

html = html.replace(/image:\s*\"\/assets\/feature_dashboard_\"[\s\S]*?\}\s*\];/, 'image: "/assets/feature_dashboard_"\n      }' + newFeaturesStr);

// Also need to add the new assets to availableAssets array so they load images properly
const newAssetsStr = `"feature_dashboard_1790055327900.jpg",
      "feature_ai_1790055901818.jpg",
      "feature_tickets_1790055920460.jpg",
      "feature_giveaways_1790055932520.jpg",
      "feature_socials_1790055945924.jpg",
      "feature_voice_1790055982511.jpg"
    ];`;

html = html.replace(/\"feature_dashboard_1790055327900\.jpg\"[\s\S]*?\];/, newAssetsStr);

fs.writeFileSync('public/index.html', html);
console.log("Successfully patched index.html with the 6 new features.");
