import re

with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update openModuleSettings to call showPage('settings')
old_open_module = """      function openModuleSettings(title, icon) {
        document.getElementById('settings-title-text').innerText = title;
        document.getElementById('settings-icon').innerText = icon;"""

new_open_module = """      function openModuleSettings(title, icon) {
        showPage('settings');
        document.getElementById('settings-title-text').innerText = title;
        document.getElementById('settings-icon').innerText = icon;"""

html = html.replace(old_open_module, new_open_module)

# 2. Add the Dropdown menu HTML and update sidebar-server-header
old_server_header = """      <div id="sidebar-server-header" onclick="goToSelector()" style="display:flex; align-items:center; gap:12px; padding: 24px 24px 16px 24px; cursor:pointer;">
        <img id="sidebar-server-icon" src="" style="width:36px; height:36px; border-radius:50%; object-fit:cover; display:none;" alt="">
        <div id="sidebar-server-initials" style="width:36px; height:36px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; display:none;"></div>
        <div style="flex:1;">
          <div id="sidebar-server-name" style="font-size:15px; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Server Name</div>
        </div>
        <span style="font-size:10px; color:#5c6070;">▼</span>
      </div>"""

new_server_header = """      <!-- SERVER HEADER -->
      <div style="position:relative; padding: 24px 24px 16px 24px;">
        <div id="sidebar-server-header" onclick="document.getElementById('sidebar-dropdown').style.display = document.getElementById('sidebar-dropdown').style.display === 'none' ? 'block' : 'none';" style="display:flex; align-items:center; gap:12px; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor:pointer; background: #212330; transition: background 0.2s;">
          <img id="sidebar-server-icon" src="" style="width:28px; height:28px; border-radius:50%; object-fit:cover; display:none;" alt="">
          <div id="sidebar-server-initials" style="width:28px; height:28px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; font-size:12px; display:none;"></div>
          <div style="flex:1;">
            <div id="sidebar-server-name" style="font-size:14px; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Server Name</div>
          </div>
          <span style="font-size:10px; color:#5c6070;">▼</span>
        </div>
        
        <!-- DROPDOWN MENU -->
        <div id="sidebar-dropdown" style="display:none; position:absolute; top: 85px; left: 24px; right: 24px; background: #1a1c23; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow:hidden;">
          <div style="padding: 12px; display:flex; align-items:center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <img id="dropdown-server-icon" src="" style="width:24px; height:24px; border-radius:50%; object-fit:cover; display:none;" alt="">
            <div id="dropdown-server-initials" style="width:24px; height:24px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; font-size:10px; display:none;"></div>
            <span id="dropdown-server-name" style="font-size:14px; font-weight:700; color:#fff;">Server Name</span>
          </div>
          <div onclick="goToSelector()" style="padding: 12px; display:flex; align-items:center; gap: 12px; cursor:pointer; color:#a0a4b8; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
            <span style="font-size:16px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border: 1px dashed #a0a4b8; border-radius: 50%;">+</span>
            <span style="font-size:14px; font-weight:600;">Add new server</span>
          </div>
        </div>
      </div>"""

html = html.replace(old_server_header, new_server_header)

# Fix initDashboard to populate dropdown icons too
old_init_dash = """      document.getElementById('sidebar-server-name').innerText = name.toUpperCase();
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
      }"""

new_init_dash = """      document.getElementById('sidebar-server-name').innerText = name.toUpperCase();
      document.getElementById('dropdown-server-name').innerText = name.toUpperCase();
      const sidebarIcon = document.getElementById('sidebar-server-icon');
      const sidebarInitials = document.getElementById('sidebar-server-initials');
      const dropIcon = document.getElementById('dropdown-server-icon');
      const dropInitials = document.getElementById('dropdown-server-initials');
      if (icon) {
        sidebarIcon.src = icon;
        dropIcon.src = icon;
        sidebarIcon.style.display = 'block';
        dropIcon.style.display = 'block';
        sidebarInitials.style.display = 'none';
        dropInitials.style.display = 'none';
      } else {
        sidebarIcon.style.display = 'none';
        dropIcon.style.display = 'none';
        sidebarInitials.innerText = name.substring(0,2).toUpperCase();
        dropInitials.innerText = name.substring(0,2).toUpperCase();
        sidebarInitials.style.display = 'flex';
        dropInitials.style.display = 'flex';
      }"""
      
html = html.replace(old_init_dash, new_init_dash)


# 3. Comment out requested features at the top of the sidebar
html = html.replace('<div class="sidebar-nav-item" onclick="showToast(\'Coming Soon!\', \'warning\')">\n          <span class="sidebar-icon">🎭</span> AI Characters\n        </div>', '<!-- <div class="sidebar-nav-item" onclick="showToast(\'Coming Soon!\', \'warning\')">\n          <span class="sidebar-icon">🎭</span> AI Characters\n        </div> -->')
html = html.replace('<div class="sidebar-nav-item" onclick="openModuleSettings(\'AI\', \'🤖\')">\n          <span class="sidebar-icon">🤖</span> Subhuu AI\n        </div>', '<!-- <div class="sidebar-nav-item" onclick="openModuleSettings(\'AI\', \'🤖\')">\n          <span class="sidebar-icon">🤖</span> Subhuu AI\n        </div> -->')
html = html.replace('<div class="sidebar-nav-item" onclick="navClick(this, \'settings\')">\n          <span class="sidebar-icon">⚙️</span> Settings\n        </div>', '<!-- <div class="sidebar-nav-item" onclick="navClick(this, \'settings\')">\n          <span class="sidebar-icon">⚙️</span> Settings\n        </div> -->')

# 4. Comment out all remaining "Coming Soon" sidebar items to fix broken buttons
html = re.sub(r'<div class="sidebar-nav-item" onclick="showToast\(\'Coming Soon!\', \'warning\'\)">[\s\S]*?</div>', lambda m: f'<!-- {m.group(0)} -->', html)


with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Dashboard interactions patched!")
