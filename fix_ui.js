const fs = require('fs');

let content = fs.readFileSync('public/index.html', 'utf8');

// 1. Fix image delay
content = content.replace(
  'function openFeatureModal(f) {',
  'function openFeatureModal(f) {\n      document.getElementById(\'modal-img\').src = \'\';'
);

// 2. Fix container sizing
content = content.replace(
  'flex: 0 0 auto; max-width: 50%;',
  'flex: 1.5; max-width: 60%;'
);

// 3. Fix featuresData image references (remove _new and .png)
content = content.replace(/\/assets\/feature_new_([a-z-]+)\.png/g, '/assets/feature_$1');

fs.writeFileSync('public/index.html', content);
console.log('Fixed UI issues in index.html');
