const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images');
const picDir = path.join(__dirname, 'pic');

const files = fs.readdirSync(picDir);
for (const file of files) {
  const src = path.join(picDir, file);
  if (file.includes('Beige and Brown Elegant')) {
    fs.copyFileSync(src, path.join(dir, 'larana-glow-refresh.png'));
    console.log('copied larana-glow-refresh.png');
  } else if (file.includes('Minimalist Beauty Spa Banner (Landscape)')) {
    fs.copyFileSync(src, path.join(dir, 'larana-hair-moments.png'));
    console.log('copied larana-hair-moments.png');
  } else if (file.includes('Modern Sunscreen')) {
    fs.copyFileSync(src, path.join(dir, 'larana-nail-art.png'));
    console.log('copied larana-nail-art.png');
  } else if (file.includes('Modern Relaxing Beauty')) {
    fs.copyFileSync(src, path.join(dir, 'larana-relaxing-spa.png'));
    console.log('copied larana-relaxing-spa.png');
  } else if (file.includes('Beauty Makeup Book')) {
    fs.copyFileSync(src, path.join(dir, 'larana-facial-cleansing.png'));
    console.log('copied larana-facial-cleansing.png');
  } else if (file.includes('Brown and Beige Simple')) {
    fs.copyFileSync(src, path.join(dir, 'larana-spa-massage.png'));
    console.log('copied larana-spa-massage.png');
  } else if (file.includes('White and Brown Elegant')) {
    fs.copyFileSync(src, path.join(dir, 'larana-skincare-ritual.png'));
    console.log('copied larana-skincare-ritual.png');
  }
}
