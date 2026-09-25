import re

with open('public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix #page-selector centering
old_page_selector = r"""    #page-selector \{
      align-items: flex-start; padding: 48px; overflow-y: auto;
    \}
    #page-selector h1 \{ font-size: 28px; font-weight: 800; margin-bottom: 6px; \}
    #page-selector p \{ color: var\(--text-muted\); margin-bottom: 32px; \}"""

new_page_selector = """    #page-selector {
      align-items: center; justify-content: flex-start; padding: 80px 20px; overflow-y: auto;
    }
    #page-selector h1 { text-align: center; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    #page-selector p { text-align: center; color: var(--text-muted); margin-bottom: 40px; }"""

html = re.sub(old_page_selector, new_page_selector, html)

# 2. Fix .server-card and .server-grid CSS
old_card_css = r"""    \.server-grid \{ display: grid; grid-template-columns: repeat\(auto-fill, minmax\(260px, 1fr\)\); gap: 16px; width: 100%; \}
    \.server-card \{
      background: var\(--bg-panel\); 
      backdrop-filter: var\(--glass-blur\);
      border: 1px solid var\(--border\);
      border-radius: 12px; padding: 24px; display: flex; align-items: center;
      gap: 16px; cursor: pointer; transition: all 0\.3s ease;
    \}
    \.server-card:hover \{ 
      background: var\(--bg-panel2\); 
      border-color: var\(--accent\);
      transform: translateY\(-4px\);
      box-shadow: var\(--accent-glow\);
    \}
    \.server-card img, \.server-card \.initials \{ width: 52px; height: 52px; border-radius: 50%; object-fit: cover; \}
    \.server-card \.initials \{ background: var\(--bg\); border: 1px solid var\(--border\); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; \}
    \.server-card-info h3 \{ font-size: 15px; font-weight: 700; \}
    \.server-card-info p \{ font-size: 12px; color: var\(--text-muted\); margin-top: 2px; \}"""

new_card_css = """    .server-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; width: 100%; max-width: 1000px; margin: 0 auto; }
    .server-card {
      width: 280px; position: relative;
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
    .server-card-banner { height: 80px; position: relative; overflow: hidden; background: #2a2d3d; }
    .server-card-banner img { width: 100%; height: 100%; object-fit: cover; filter: blur(5px) brightness(0.7); transform: scale(1.1); }
    .server-card-icon-wrapper { position: absolute; top: 40px; left: 50%; transform: translateX(-50%); width: 72px; height: 72px; border-radius: 50%; border: 4px solid #212330; overflow: hidden; background: #212330; z-index: 10; }
    .server-card-icon-wrapper img, .server-card-icon-wrapper .initials { width: 100%; height: 100%; object-fit: cover; }
    .server-card .initials { display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; background: #3b82f6; color: white; width: 100%; height: 100%; }
    .server-card-body { padding: 40px 20px 20px 20px; display: flex; justify-content: space-between; align-items: center; }
    .server-card-info { flex: 1; overflow: hidden; text-align: left; }
    .server-card-info h3 { font-size: 15px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
    .server-card-info p { font-size: 12px; color: #a0a4b8; margin: 0; }
    .server-card-btn { background: #3b82f6; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; }
    .server-card-btn:hover { background: #2563eb; }"""

html = re.sub(old_card_css, new_card_css, html)

with open('public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Server card CSS patched robustly via regex!")
