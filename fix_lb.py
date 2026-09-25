import sys

with open('public/leaderboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace HTML mock block
old_html = '''    <div class="page-header">
      <h1 class="page-title">Global Top Users</h1>
      <p class="page-desc">The most active users across the entire Subhuu network.</p>
    </div>
    <div>'''

new_html = '''    <div class="page-header">
      <h1 class="page-title" id="lb-title">Global Top Users</h1>
      <p class="page-desc" id="lb-desc">The most active users across the entire Subhuu network.</p>
    </div>
    
    <div id="lb-container" style="display: none;">
      <!-- users will be appended here via js -->
    </div>

    <div id="lb-error" style="background: rgba(255,100,100,0.1); border: 1px solid rgba(255,100,100,0.3); border-radius: 12px; padding: 40px; margin-top: 40px; display: none; text-align: center;">
      <h3 style="font-size: 20px; margin-bottom: 8px; color: #ff6b6b;">No Server Selected</h3>
      <p style="color: var(--text-muted);">Please provide a valid server ID in the URL to view its leaderboard, or access it from your Server Dashboard.</p>
    </div>
    <div style="display: none;">'''

content = content.replace(old_html, new_html)

# Replace JS script block
old_js = '''      .catch(() => {});
  </script>'''

new_js = '''      .catch(() => {});

    async function loadLeaderboard() {
      const urlParams = new URLSearchParams(window.location.search);
      const guildId = urlParams.get('guild');

      if (!guildId) {
        document.getElementById('lb-error').style.display = 'block';
        return;
      }

      try {
        const res = await fetch(`/api/guilds/${guildId}/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        document.getElementById('lb-title').innerText = 'Server Leaderboard';
        document.getElementById('lb-desc').innerText = 'See who the most active members are in this community.';
        document.getElementById('lb-container').style.display = 'block';
        
        const container = document.getElementById('lb-container');
        container.innerHTML = '';

        if (!data.users || data.users.length === 0) {
          container.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-muted);">No activity found for this server yet.</div>';
          return;
        }

        data.users.forEach((user, index) => {
          const rank = index + 1;
          let rankHtml = `<div class="lb-rank">#${rank}</div>`;
          
          if (rank === 1) rankHtml = `<div class="lb-rank">🥇</div>`;
          if (rank === 2) rankHtml = `<div class="lb-rank">🥈</div>`;
          if (rank === 3) rankHtml = `<div class="lb-rank">🥉</div>`;

          container.innerHTML += `
            <div class="lb-card">
              ${rankHtml}
              <div class="lb-avatar" style="background-image: url('${user.avatar || ''}'); background-size: cover; background-position: center;"></div>
              <div class="lb-info">
                <div class="lb-name">${user.username}</div>
                <div class="lb-level">Level ${user.level}</div>
              </div>
              <div class="lb-xp">${user.xp.toLocaleString()} XP</div>
            </div>
          `;
        });

      } catch (err) {
        document.getElementById('lb-error').style.display = 'block';
        document.getElementById('lb-error').querySelector('p').innerText = "Could not load leaderboard data. The server might not exist or the bot isn't in it.";
      }
    }

    loadLeaderboard();
  </script>'''

content = content.replace(old_js, new_js)

with open('public/leaderboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
