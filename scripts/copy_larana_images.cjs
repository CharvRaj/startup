const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/Shree/.gemini/antigravity-ide/brain/85dc4710-06e0-4741-aedd-f0dff906cacc';
const targetDir = path.resolve(__dirname, '../public/images');

const files = fs.readdirSync(brainDir);
const mappings = [
  { prefix: 'larana_hero_flower', dest: 'larana-hero-flower.jpg' },
  { prefix: 'larana_promo_facial', dest: 'larana-promo-facial.jpg' },
  { prefix: 'larana_promo_hair', dest: 'larana-promo-hair.jpg' },
  { prefix: 'larana_promo_nails', dest: 'larana-promo-nails.jpg' },
  { prefix: 'larana_spa_towels', dest: 'larana-spa-towels.jpg' },
  { prefix: 'larana_cat_waxing', dest: 'larana-cat-waxing.jpg' },
  { prefix: 'larana_cat_massage', dest: 'larana-cat-massage.jpg' },
  { prefix: 'larana_bridal_art', dest: 'larana-bridal-art.jpg' },
];

for (const m of mappings) {
  const match = files.find(f => f.startsWith(m.prefix) && f.endsWith('.jpg'));
  if (match) {
    fs.copyFileSync(path.join(brainDir, match), path.join(targetDir, m.dest));
    console.log('Copied ' + match + ' -> ' + m.dest);
  } else {
    console.warn('Not found: ' + m.prefix);
  }
}
console.log('Image copy complete!');
