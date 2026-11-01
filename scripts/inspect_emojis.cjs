const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'src/pages/Profile.tsx';
const full = path.resolve(__dirname, '..', file);
const lines = fs.readFileSync(full, 'utf8').split('\n');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;

lines.forEach((line, idx) => {
  if (emojiRegex.test(line)) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
