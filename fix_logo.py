import re

with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Inject the server header at the top of the sidebar
server_header_html = """      <!-- SERVER HEADER -->
      <div id="sidebar-server-header" onclick="goToSelector()" style="display:flex; align-items:center; gap:12px; padding: 24px 24px 16px 24px; cursor:pointer;">
        <img id="sidebar-server-icon" src="" style="width:36px; height:36px; border-radius:50%; object-fit:cover; display:none;" alt="">
        <div id="sidebar-server-initials" style="width:36px; height:36px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; display:none;"></div>
        <div style="flex:1;">
          <div id="sidebar-server-name" style="font-size:15px; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Server Name</div>
        </div>
        <span style="font-size:10px; color:#5c6070;">▼</span>
      </div>
"""

# Place it right after the sidebar div opening
sidebar_regex = r'(<div class="sidebar" id="sidebar"[^>]*>)'
if 'id="sidebar-server-header"' not in html:
    html = re.sub(sidebar_regex, r'\1\n' + server_header_html, html)

# 2. Modify initDashboard to populate the sidebar server header
init_dash_search = r"document\.getElementById\('topbar-server-name'\)\.innerText = name;"
init_dash_replace = r"""document.getElementById('topbar-server-name').innerText = name;
      
      document.getElementById('sidebar-server-name').innerText = name.toUpperCase();
      const sidebarIcon = document.getElementById('sidebar-server-icon');
      const sidebarInitials = document.getElementById('sidebar-server-initials');
      if (icon) {
        sidebarIcon.src = icon;
        sidebarIcon.style.display = 'block';
        sidebarInitials.style.display = 'none';
      } else {
        sidebarIcon.style.display = 'none';
        sidebarInitials.innerText = name.substring(0,2).toUpperCase();
        sidebarInitials.style.display = 'flex';
      }
"""

if "document.getElementById('sidebar-server-name')" not in html:
    html = re.sub(init_dash_search, init_dash_replace, html)

with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Sidebar server header injected successfully!")
