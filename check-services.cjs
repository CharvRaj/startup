const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);
(async () => {
  const { data: ds, error: err1 } = await supabase.from('doorstep_services').select('*');
  console.log('Total Doorstep Services in DB:', ds?.length, 'error:', err1?.message);
  if (ds && ds.length > 0) {
    console.log('Sample service:', ds[0]);
    const cats = [...new Set(ds.map(s => s.category))];
    console.log('Doorstep Categories in DB:', cats);
    ds.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.category}] ${s.name} - ₹${s.price} (img: ${s.image_url || 'none'})`);
    });
  }
  const { data: banners, error: bErr } = await supabase.from('promotional_banners').select('*');
  console.log('Promotional banners table exists?:', banners ? 'YES, count: ' + banners.length : bErr?.message);
})();
