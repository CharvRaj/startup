const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;

function walk(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      files = files.concat(walk(p));
    } else if (/\.(tsx?|jsx?)$/.test(f)) {
      files.push(p);
    }
  });
  return files;
}

const allFiles = walk(srcDir);
const results = [];

allFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const hits = [];
  lines.forEach((l, i) => {
    if (emojiRegex.test(l)) {
      hits.push({ line: i + 1, text: l.trim() });
    }
  });
  if (hits.length > 0) {
    results.push({ file: path.relative(path.resolve(__dirname, '..'), f), count: hits.length, hits });
  }
});

results.sort((a, b) => b.count - a.count);

console.log(`TOTAL FILES WITH EMOJIS: ${results.length}`);
results.forEach(r => {
  console.log(`\n=== ${r.file} (${r.count} matches) ===`);
  r.hits.forEach(h => console.log(`  L${h.line}: ${h.text}`));
});
