import os
import glob

extra_css = """
    /* BRANDING & LOGO OVERRIDES */
    .brand-logo { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 10px rgba(57,148,255,0.5); }
    .footer-logo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 10px rgba(57,148,255,0.5); }
    .bg-watermark {
      position: fixed; right: -10vw; bottom: -10vh; width: 60vw; max-width: 800px;
      opacity: 0.04; pointer-events: none; z-index: -1; border-radius: 50%; filter: blur(4px);
    }
"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    # Fix literal \n injected by mistake earlier
    if r"\n  <nav>" in content:
        content = content.replace(r"\n  <nav>", "\n  <nav>")
        changed = True

    # Inject CSS if missing
    if '.brand-logo {' not in content and '</style>' in content:
        content = content.replace('</style>', f"{extra_css}</style>")
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

def main():
    for root, dirs, files in os.walk('public'):
        for file in files:
            if file.endswith('.html'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
