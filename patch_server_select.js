const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

// 1. Update the CSS for server-card to match MEE6
const oldCss = `.server-card {
        background: var(--bg-panel); 
        backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border);
        border-radius: 12px; padding: 24px; display: flex; align-items: center;
        gap: 16px; cursor: pointer; transition: all 0.3s ease;
      }
      .server-card:hover { 
        background: var(--bg-panel2); 
        border-color: var(--accent);
        transform: translateY(-4px);
        box-shadow: var(--accent-glow);
      }`;

const newCss = `.server-card {
        background: #212330; 
        border-radius: 12px; display: flex; flex-direction: column;
        cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        border: 1px solid transparent;
      }
      .server-card:hover { 
        transform: translateY(-4px);
        border-color: rgba(255,255,255,0.1);
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
      }
      .server-card-banner { height: 80px; position: relative; overflow: hidden; }
      .server-card-banner img { width: 100%; height: 100%; object-fit: cover; filter: blur(5px) brightness(0.7); transform: scale(1.1); }
      .server-card-icon-wrapper { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: 64px; height: 64px; border-radius: 50%; border: 4px solid #212330; overflow: hidden; background: #212330; }
      .server-card-icon-wrapper img, .server-card-icon-wrapper .initials { width: 100%; height: 100%; object-fit: cover; }
      .server-card-body { padding: 30px 20px 20px 20px; display: flex; justify-content: space-between; align-items: center; }
      .server-card-info { flex: 1; overflow: hidden; }
      .server-card-info h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
      .server-card-info p { font-size: 11px; color: #a0a4b8; }
      .server-card-btn { background: #3b82f6; color: #fff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; }`;

html = html.replace(oldCss, newCss);

// 2. Update the JS HTML generation
const oldJsHtml = 'card.innerHTML = `${iconHtml}<div class="server-card-info"><h3>${g.name}</h3><p>Configure Bot</p></div>`;';
const newJsHtml = 'card.innerHTML = `\n              <div class="server-card-banner">${g.icon ? `<img src="${g.icon}" />` : `<div style="width:100%; height:100%; background:linear-gradient(135deg, #3b82f6, #8b5cf6);"></div>`}</div>\n              <div class="server-card-icon-wrapper">${g.icon ? `<img src="${g.icon}" />` : `<div class="initials">\${g.name.substring(0,2).toUpperCase()}</div>`}</div>\n              <div class="server-card-body">\n                <div class="server-card-info">\n                  <h3>\${g.name}</h3>\n                  <p>Bot Master</p>\n                </div>\n                <button class="server-card-btn">Go</button>\n              </div>\n            `;';

// Note: `g.name.substring(0,2)` is a JS expression, we escaped the $ sign so it goes in as ${g...} in JS.
html = html.replace(oldJsHtml, newJsHtml);

// 3. Update the page title
const oldTitle = '<h1>Select a Server</h1>\n          <p>Select a server to manage Subhuu settings.</p>';
const newTitle = '<h1 style="text-align:center; font-size:28px; font-weight:800; margin-bottom: 40px; margin-top:20px;">Select a server</h1>';

html = html.replace(oldTitle, newTitle);

fs.writeFileSync('public/dashboard.html', html);
console.log('Server select patched to MEE6 style!');
