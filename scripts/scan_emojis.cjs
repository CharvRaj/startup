const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{200D}\u{FE0F}]/u;

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git') walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (emojiRegex.test(l)) {
          console.log(`${full}:${i + 1}: ${l.trim().substring(0, 100)}`);
        }
      });
    }
  }
}

walk(path.resolve(__dirname, '../src'));
