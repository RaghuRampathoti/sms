const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;

      // Replace hardcoded oranges with CSS vars
      content = content.replace(/#f59e0b/gi, 'var(--primary)');
      content = content.replace(/#d97706/gi, 'var(--primary-dark)');
      content = content.replace(/#fbbf24/gi, 'var(--primary-light)');
      content = content.replace(/#f97316/gi, 'var(--primary)');
      
      // Replace rgb values with rgb var
      content = content.replace(/245,\s*158,\s*11/g, 'var(--primary-rgb)');
      content = content.replace(/249,\s*115,\s*22/g, 'var(--primary-rgb)');

      // Replace banner slate with theme gradient
      content = content.replace(/background:\s*['"]#374151['"]/g, 'background: `linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)`');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src/pages'));
replaceInDir(path.join(__dirname, 'src/components'));
