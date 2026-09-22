const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

// Extract chunks from index
const navMatch = indexHtml.match(/<nav>[\s\S]*?<\/nav>/);
const navHtml = navMatch ? navMatch[0] : null;

const footerMatch = indexHtml.match(/<footer>[\s\S]*?<\/footer>/);
const footerHtml = footerMatch ? footerMatch[0] : null;

const faviconHtml = '<link rel="icon" type="image/png" href="/assets/feature_new_logo.png">';
const watermarkHtml = '<img src="/assets/feature_new_logo.png" class="bg-watermark" alt="">';

const extraCss = `
    .brand-logo { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 10px rgba(57,148,255,0.5); }
    .footer-logo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 10px rgba(57,148,255,0.5); }
    .bg-watermark {
      position: fixed; right: -10vw; bottom: -10vh; width: 60vw; max-width: 800px;
      opacity: 0.04; pointer-events: none; z-index: -1; border-radius: 50%; filter: blur(4px);
    }
`;

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.html') && file !== 'index.html') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 1. Nav
      if (navHtml && content.match(/<nav>[\s\S]*?<\/nav>/)) {
        content = content.replace(/<nav>[\s\S]*?<\/nav>/, navHtml);
      }
      
      // 2. Footer
      if (footerHtml && content.match(/<footer>[\s\S]*?<\/footer>/)) {
        content = content.replace(/<footer>[\s\S]*?<\/footer>/, footerHtml);
      }
      
      // 3. Favicon
      if (!content.includes('rel="icon"')) {
        content = content.replace('</head>', `  ${faviconHtml}\n</head>`);
      }
      
      // 4. Watermark
      if (!content.includes('class="bg-watermark"')) {
        content = content.replace(/<body>\s*/, `<body>\n  ${watermarkHtml}\n`);
      }

      // 5. CSS
      if (!content.includes('.brand-logo {')) {
        content = content.replace('</style>', `${extraCss}</style>`);
      }
      
      fs.writeFileSync(fullPath, content);
      console.log("Propagated to:", fullPath);
    }
  }
}

processDirectory(path.join(__dirname, '..', 'public'));
console.log("Done propagating branding.");
