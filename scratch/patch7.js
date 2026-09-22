const fs = require('fs');

let html = fs.readFileSync('public/dashboard.html', 'utf8');

const cssToInject = `
      /* ====== RESPONSIVE LAYOUT ====== */
      .hamburger { 
        display: none; 
        background: none; border: none; color: white; font-size: 24px; cursor: pointer; 
        margin-right: 8px;
      }
      @media (max-width: 768px) {
        .global-topbar { padding: 0 16px; gap: 8px; }
        .topbar-brand span { display: none; }
        .topbar-actions .btn { font-size: 11px; padding: 6px 10px; }
        .topbar-user span { display: none; }
        .sidebar { 
          position: absolute; left: 0; top: var(--topbar-h); 
          height: calc(100% - var(--topbar-h)); z-index: 99; 
          transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 10px 0 30px rgba(0,0,0,0.5);
        }
        .sidebar.open { transform: translateX(0); }
        .hamburger { display: block; }
        .server-grid { grid-template-columns: 1fr; }
        .modules-grid { grid-template-columns: 1fr; }
        #page-selector, .dashboard-content, #page-modules, #page-settings, #page-commands-dash, #page-members, #page-logs { padding: 16px !important; }
        .server-stats { flex-direction: column; gap: 16px; }
        .server-header { padding: 16px; }
        #cmd-category-tabs { flex-wrap: wrap; }
      }
    </style>`;

// 1. Inject CSS
html = html.replace(/    <\/style>/, cssToInject);

// 2. Inject Hamburger button
html = html.replace(/<a href="\/" class="topbar-brand">/, '<button class="hamburger" onclick="toggleSidebar()">☰</button>\n    <a href="/" class="topbar-brand">');

// 3. Inject JS toggle function
html = html.replace(/function showPage\(name\) \{/, `function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
    }

    function showPage(name) {
      document.getElementById('sidebar').classList.remove('open');`);

fs.writeFileSync('public/dashboard.html', html);
console.log('Successfully made dashboard responsive!');
