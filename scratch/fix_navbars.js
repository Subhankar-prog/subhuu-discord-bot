const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

// Extract the correct Navbar
const navMatch = indexHtml.match(/<nav>[\s\S]*?<\/nav>/);
const navHtml = navMatch ? navMatch[0] : null;

// Extract the Auth script
const authScriptMatch = indexHtml.match(/<script>\s*\/\/\s*Smart login button[\s\S]*?<\/script>/);
const authScript = authScriptMatch ? authScriptMatch[0] : null;

if (!navHtml || !authScript) {
  console.error("Could not extract nav or auth script from index.html");
  process.exit(1);
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.html') && file !== 'index.html') {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Replace Nav
      if (content.match(/<nav>[\s\S]*?<\/nav>/)) {
        content = content.replace(/<nav>[\s\S]*?<\/nav>/, navHtml);
        changed = true;
      }
      
      // Replace or Add Auth Script
      if (content.includes('fetch(\'/api/auth/status\')')) {
        content = content.replace(/<script>\s*fetch\('\/api\/auth\/status'[\s\S]*?<\/script>/, authScript);
        changed = true;
      } else if (!content.includes(authScript)) {
        // Insert before </body>
        content = content.replace('</body>', authScript + '\n</body>');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated:", fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, '..', 'public'));
console.log("Finished propagating navbar and auth script to all subpages.");
