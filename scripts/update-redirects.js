const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('loginRedirect="/ceo/login"') || 
          content.includes('loginRedirect="/employee/login"') || 
          content.includes('loginRedirect="/maintenance/login"')) {
        content = content.replace(/loginRedirect="\/(ceo|employee|maintenance)\/login"/g, 'loginRedirect="/login"');
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk('src');
console.log('Redirects updated successfully.');
