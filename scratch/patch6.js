const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

const regex = /<button class="btn btn-gray btn-sm" style="width: 100%; justify-content: center; margin-top: auto;" onclick="openPermModal\('\\$\\{cmdName\\}'\)">.*? Edit Permissions<\/button>/g;
html = html.replace(regex, `<button class="btn btn-gray btn-sm" style="width: 100%; justify-content: center; margin-top: auto;" onclick="openPermModal('\\$\\{cmdName\\}')">⚙️ Edit Permissions</button>`);

fs.writeFileSync('public/dashboard.html', html);
console.log('Fixed gear emoji properly!');
