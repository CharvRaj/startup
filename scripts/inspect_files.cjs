const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{200D}\u{FE0F}]/u;

const targetFiles = process.argv.slice(2);

targetFiles.forEach(f => {
  const full = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(full)) {
    console.warn('File not found:', f);
    return;
  }
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (emojiRegex.test(l)) {
      console.log(`${f}:${i+1}: ${l.trim()}`);
    }
  });
});
