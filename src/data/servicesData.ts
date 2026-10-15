export interface ServiceDetailItem {
  id: string;
  name: string;
  category: string;
  type: 'doorstep' | 'mehndi';
  description: string;
  longDescription?: string;
  price: number;
  original_price: number;
  discount_percent: number;
  duration_minutes: number;
  image_url: string;
  banner_urls: string[];
  inclusions: string[];
  steps?: { title: string; desc: string }[];
  preparationTips?: string[];
  variants?: { name: string; duration: string; price: number }[];
  faqs?: { q: string; a: string }[];
  rating: number;
  review_count: number;
  available: boolean;
}

export const ALL_DOORSTEP_SERVICES: ServiceDetailItem[] = [
  {
    id: 'ds-hydra-glow',
    name: 'Hydra-Infusion Glow & Deep Pore Facial',
    category: 'Facial & Clean-up',
    type: 'doorstep',
    description: 'High-frequency oxygen bubble infusion, ultrasonic pore extraction, and calming rose-quartz lymphatic massage.',
    longDescription: 'Our signature Hydra-Infusion facial is designed to gently decongest pores while deeply hydrating dull, tired skin. Using pharmaceutical-grade botanical elixirs and a medical-grade cold oxygen jet, this non-invasive ritual infuses pure hyaluronic acid directly into epidermal layers. Perfect before weddings, parties, or seasonal skin revitalisation.',
    price: 1499,
    original_price: 1999,
    discount_percent: 25,
    duration_minutes: 60,
    image_url: '/images/service-facial.png',
    banner_urls: [
      '/images/service-facial.png',
      '/images/banner-appointment.png',
      '/images/service-skincare.png',
      '/images/banner-relaxing.png',
    ],
    inclusions: [
      'Double cleanse with botanical cleansing balm',
      'Ultrasonic pore skin-scrubber extraction',
      'Hyaluronic acid high-pressure cold oxygen spray',
      'Peel-off alginate rubber antioxidant mask',
      'Single-use sealed sanitization toolkit',
      'Rose quartz lymphatic facial roller massage',
    ],
    steps: [
      { title: 'Gentle Cleansing', desc: 'Double purification with botanical micellar balm to dissolve sebum and pollutants.' },
      { title: 'Ultrasonic Exfoliation', desc: 'Pain-free sonic scrubber removes dead skin cells and blackheads without redness.' },
      { title: 'Cold Oxygen Infusion', desc: 'Pressurised mist delivers 98% pure oxygen and hydrating hyaluronic acid.' },
      { title: 'Antioxidant Rubber Mask', desc: 'Alginate peel-off mask locks in intense moisture and tightens pore texture.' },
      { title: 'Moisturising Finish', desc: 'Ceramide barrier cream and SPF 50 shield massage for lasting radiance.' },
    ],
    preparationTips: [
      'Ensure a quiet chair or couch near a power socket is accessible for our beautician.',
      'Kindly remove any heavy makeup before the appointment starts.',
      'Please inform the aesthetician of any recent chemical peels, retinol use, or active skin allergies.',
    ],
    variants: [
      { name: 'Express Glow', duration: '35 mins', price: 999 },
      { name: 'Full Hydra Ritual (Recommended)', duration: '60 mins', price: 1499 },
      { name: 'Royal 24K Gold Hydra Infusion', duration: '80 mins', price: 2199 },
    ],
    faqs: [
      { q: 'How do I book this service?', a: 'Select your preferred appointment date and time slot above, enter your address, and click "Book This Service". Our team confirms your certified artist immediately.' },
      { q: 'What should I prepare before the appointment?', a: 'Have a clean glass of water, a comfortable chair, and a clean hand towel. Our artist brings all disposable sheets, machines, and sanitised products.' },
      { q: 'Are products and tools included?', a: 'Yes! 100% of the tools, disposable aprons, sanitized bowls, and skincare formulations are provided by us in sealed, single-use kits.' },
      { q: 'Can I reschedule my appointment?', a: 'Yes, free rescheduling is available up to 2 hours before your scheduled appointment time via your profile dashboard.' },
      { q: 'What happens if I need to cancel?', a: 'Cancellations made 2+ hours in advance receive a 100% instant refund or store credit with no questions asked.' },
    ],
    rating: 4.9,
    review_count: 1420,
    available: true,
  },
  {
    id: 'ds-bridal-hd',
    name: 'Luxe Bridal HD Glow Makeup & Styling',
    category: 'Bridal Beauty',
    type: 'doorstep',
    description: 'Signature HD water-resistant camera makeup using international MAC, Huda Beauty & Charlotte Tilbury products.',
    longDescription: 'Curated for the modern bride who seeks breathtaking, all-day camera radiance. We craft bespoke bridal makeup calibrated to your outfit, skin undertone, and wedding lighting. Waterproof airbrush base combined with intricate hair styling ensures you remain effortless and glowing through rituals and tears.',
    price: 3999,
    original_price: 5499,
    discount_percent: 27,
    duration_minutes: 120,
    image_url: '/images/category-bridal.jpg',
    banner_urls: [
      '/images/category-bridal.jpg',
      '/images/banner-neutral.png',
      '/images/service-face.png',
      '/images/banner-appointment.png',
    ],
    inclusions: [
      'Skin-prep hydrating serum & pore-blurring base',
      'Custom 3D mink eyelashes application',
      'Hair crimping, puffing, extensions & floral styling',
      'Dupatta draping and jewelry pinning assistance',
      'Complimentary touchup kit (lipstick sample & blotting paper)',
    ],
    steps: [
      { title: 'Prime & Pre-base', desc: 'Illuminating moisturizer and pore-diffusing primer tailored to your skin type.' },
      { title: 'HD Base & Contouring', desc: 'Long-wear waterproof foundation layered with cream blush and subtle sculpting.' },
      { title: 'Eye Artistry & Lashes', desc: 'Custom cut-crease or smokey eye design accented with fluffy 3D mink eyelashes.' },
      { title: 'Bridal Hair Architecture', desc: 'Crimps, bridal bun, braid styling, and fresh or dry floral placement.' },
      { title: 'Draping & Jewelry Pinning', desc: 'Secure dupatta drape and matha-patti/nath setting with safety pins.' },
    ],
    preparationTips: [
      'Have your bridal lehenga/saree and jewelry unpacked and ready at your styling area.',
      'Wash and dry your hair completely prior to artist arrival; avoid heavy conditioners.',
      'Share reference look photos with the artist during the pre-service consultation.',
    ],
    variants: [
      { name: 'Bridal Engagement / Sangeet', duration: '90 mins', price: 2999 },
      { name: 'Royal Full Wedding HD Makeup', duration: '120 mins', price: 3999 },
      { name: 'Airbrush International Luxe Bride', duration: '150 mins', price: 5499 },
    ],
    faqs: [
      { q: 'Will the makeup last through tears and sweat?', a: 'Yes, our HD waterproof formulations and fixing mist seal the look for up to 16 hours without cracking or melting.' },
      { q: 'Do you provide jewelry and hair accessories?', a: 'We provide basic bobby pins, donuts, and safety pins. Please keep your personal bridal jewelry and fresh floral gajras ready.' },
      { q: 'Can I request a pre-bridal trial?', a: 'Yes! Pre-bridal consultations can be scheduled through our booking portal.' },
    ],
    rating: 5.0,
    review_count: 2150,
    available: true,
  },
  {
    id: 'ds-keratin-spa',
    name: 'Organic Keratin Hair Spa & Scalp Therapy',
    category: 'Hair Spa & Styling',
    type: 'doorstep',
    description: 'Deep intensive protein moisture mask, hot ozone steam therapy, and 20-minute relaxing neck-shoulder acupressure.',
    longDescription: 'Restore vitality and mirror-like shine to chemical-treated, frizzy, or sun-damaged hair. Our certified stylist applies active botanic keratin cream, followed by portable hair steam mist that penetrates hair cuticles directly in the comfort of your home.',
    price: 999,
    original_price: 1399,
    discount_percent: 29,
    duration_minutes: 45,
    image_url: '/images/service-hair.png',
    banner_urls: [
      '/images/service-hair.png',
      '/images/banner-beauty-spa.png',
      '/images/banner-service.png',
    ],
    inclusions: [
      'Sulfate-free clarifying scalp wash',
      'Deep protein fiber restoration cream application',
      'Micro-mist hair steamer hydration bath',
      'Moroccan argan oil serum finish & blowout styling',
    ],
    steps: [
      { title: 'Scalp Detox', desc: 'Clarifying rinse to dissolve styling residue and excess sebum.' },
      { title: 'Keratin Infusion', desc: 'Strand-by-strand application of concentrated botanical protein balm.' },
      { title: 'Steam Bath', desc: 'Warm ozone mist therapy opens hair cuticles for maximum protein absorption.' },
      { title: 'Acupressure Massage', desc: 'Stimulating scalp and neck massage to relieve tension and boost circulation.' },
      { title: 'Blowout & Shine Seal', desc: 'Argan oil smoothing serum followed by gentle blow-dry finish.' },
    ],
    preparationTips: [
      'Ensure access to clean running water near your bathroom or basin.',
      'Keep a dry towel ready for your hair.',
    ],
    variants: [
      { name: 'Standard Keratin Spa', duration: '35 mins', price: 799 },
      { name: 'Deep Protein Restoration (Recommended)', duration: '45 mins', price: 999 },
      { name: 'Intense Botox Hair Spa + Haircut', duration: '60 mins', price: 1499 },
    ],
    faqs: [
      { q: 'Is this safe for colored or highlighted hair?', a: 'Yes! Our formulas are 100% sulfate-free and color-safe, formulated to revive dye vibrancy.' },
      { q: 'How often should I book hair spa?', a: 'For best results, we recommend a hair spa session every 3 to 4 weeks.' },
    ],
    rating: 4.8,
    review_count: 980,
    available: true,
  },
  {
    id: 'ds-detan-body',
    name: 'Milk & Honey Anti-Tan Brightening Pack',
    category: 'Skin Glow & Detan',
    type: 'doorstep',
    description: 'Kojic acid and lactic milk extracts gently dissolve stubborn UV tanning on face, neck, and arms.',
    longDescription: 'Sun exposure and pollution cause dull hyperpigmentation. This gentle, organic milk-and-honey treatment lifts dead cells with enzymatic fruit enzymes, lightening tan marks while drenching skin in rich antioxidants.',
    price: 699,
    original_price: 999,
    discount_percent: 30,
    duration_minutes: 35,
    image_url: '/images/service-skincare.png',
    banner_urls: [
      '/images/service-skincare.png',
      '/images/banner-sunscreen.png',
      '/images/banner-neutral.png',
    ],
    inclusions: [
      'Walnut & apricot micro-scrub exfoliation',
      'Active milk tan-removal pack with brush application',
      'Aloe vera soothing cool down gel massage',
      'SPF 50 broad spectrum sun shield finish',
    ],
    steps: [
      { title: 'Exfoliating Scrub', desc: 'Gentle apricot micro-beads polish away dry, tanned surface cells.' },
      { title: 'Tan-Dissolving Pack', desc: 'Natural lactic acid & raw honey mask applied evenly over face & neck.' },
      { title: 'Cooling Gel Massage', desc: 'Pure aloe vera calming massage reduces inflammation and cools skin.' },
      { title: 'Sun Shield Protect', desc: 'Matte broad-spectrum SPF 50 shield prevents immediate sun rebound.' },
    ],
    preparationTips: [
      'Avoid sunbathing or harsh waxing 24 hours prior to the session.',
    ],
    variants: [
      { name: 'Face & Neck Anti-Tan', duration: '25 mins', price: 499 },
      { name: 'Face, Neck & Full Arms Detan', duration: '35 mins', price: 699 },
      { name: 'Full Body Radiance Detan Pack', duration: '60 mins', price: 1399 },
    ],
    faqs: [
      { q: 'Does this bleach my facial hair?', a: 'No, this is an organic enzymatic detan treatment that lifts surface pigment naturally without chemical ammonia or bleach.' },
    ],
    rating: 4.7,
    review_count: 840,
    available: true,
  },
  {
    id: 'ds-spa-pedicure',
    name: 'Crystal Jelly Spa Pedicure & Callus Peel',
    category: 'Manicure & Pedicure',
    type: 'doorstep',
    description: 'Aromatic therapeutic jelly soak, organic sugar scrub, heel buffering, cuticles care, and gel polish finish.',
    longDescription: 'Transform tired, cracked feet into baby-soft skin. Our aesthetician prepares a warm crystal jelly bath infused with lavender essential oils. Includes dead-skin callus peeling, nail shaping, cuticle therapy, and reflexology foot massage.',
    price: 799,
    original_price: 1199,
    discount_percent: 33,
    duration_minutes: 50,
    image_url: '/images/category-nails.jpg',
    banner_urls: [
      '/images/category-nails.jpg',
      '/images/banner-sunscreen.png',
      '/images/banner-spa.png',
    ],
    inclusions: [
      'Disinfected disposable pedicure tub liner',
      'Warm lavender essential crystal jelly bath',
      'Dead skin callus buffing & cuticle care',
      'Shea butter reflexology foot massage',
      'Long-lasting chip-resistant nail lacquer',
    ],
    steps: [
      { title: 'Jelly Soak', desc: 'Therapeutic warm jelly softens hardened calluses and relieves foot fatigue.' },
      { title: 'Callus Peeling & Scrub', desc: 'Diamond-grit foot file and brown sugar scrub smooth rough heels.' },
      { title: 'Nail Contouring', desc: 'Gentle cuticle pushing, nail clipping, and buffing.' },
      { title: 'Reflexology Massage', desc: 'Acupressure foot and calf massage with organic shea butter.' },
      { title: 'Color Lacquer', desc: 'Base coat, your choice of salon shade, and high-shine top coat.' },
    ],
    preparationTips: [
      'Sit comfortably near a low table or sofa where you can rest your feet easily.',
    ],
    variants: [
      { name: 'Classic Express Pedicure', duration: '35 mins', price: 499 },
      { name: 'Crystal Jelly Spa Pedicure (Recommended)', duration: '50 mins', price: 799 },
      { name: 'Mani-Pedi Combo Spa Deluxe', duration: '80 mins', price: 1299 },
    ],
    faqs: [
      { q: 'Is the pedicure tub sanitized?', a: 'We use brand new, single-use disposable tub liners for each client to guarantee 100% hygiene.' },
    ],
    rating: 4.8,
    review_count: 670,
    available: true,
  },
  {
    id: 'ds-rica-wax',
    name: 'Italian Rica Aloe Wax (Full Arms & Legs)',
    category: 'Waxing & Threading',
    type: 'doorstep',
    description: '100% colophony-free Italian liposoluble wax for sensitive skin. Minimal pain, zero redness, and silky smooth finish.',
    longDescription: 'Specially imported Italian Rica Aloe wax grips even the shortest 2mm hairs without tugging on sensitive skin. Enriched with vegetable oils and natural aloe vera extract to prevent bumps and redness.',
    price: 849,
    original_price: 1200,
    discount_percent: 29,
    duration_minutes: 40,
    image_url: '/images/category-waxing.jpg',
    banner_urls: [
      '/images/category-waxing.jpg',
      '/images/banner-relaxing.png',
      '/images/service-facial.png',
    ],
    inclusions: [
      'Full arms and full legs coverage',
      'Pre-wax cleansing and oil absorbing powder',
      'Single-dip hygiene spatula guarantee',
      'Post-wax calming chamomile oil soothe',
    ],
    steps: [
      { title: 'Skin Sanitization', desc: 'Pre-wax antiseptic lotion cleanses skin and opens pores.' },
      { title: 'Delicate Application', desc: 'Warm Rica wax applied in thin layers with single-use wooden spatulas.' },
      { title: 'Precision Removal', desc: 'Quick removal along hair growth lines to minimize discomfort.' },
      { title: 'Soothing Chamomile Finish', desc: 'Calming after-wax oil dissolves wax residue and prevents redness.' },
    ],
    preparationTips: [
      'Ensure hair growth is at least 3-4 mm long for clean removal.',
      'Do not apply heavy body lotions or oils right before the appointment.',
    ],
    variants: [
      { name: 'Full Arms + Underarms Rica', duration: '25 mins', price: 499 },
      { name: 'Full Arms & Legs Rica Wax (Recommended)', duration: '40 mins', price: 849 },
      { name: 'Full Body Rica Waxing Complete', duration: '75 mins', price: 1599 },
    ],
    faqs: [
      { q: 'Is Rica wax suitable for sensitive skin?', a: 'Yes, Rica is 100% colophony-free and hypoallergenic, making it ideal for prone or delicate skin.' },
    ],
    rating: 4.9,
    review_count: 1120,
    available: true,
  },
  {
    id: 'ds-clean-threading',
    name: 'Instant Fruit Clean-up + Eyebrows Threading',
    category: 'Facial & Clean-up',
    type: 'doorstep',
    description: 'Enzyme papain fruit cleanse followed by antimicrobial organic thread eyebrow contouring & upper lip clean.',
    longDescription: 'A quick refresh for busy weekdays. Cleanses away clogged dirt and sweat, followed by precise eyebrow contouring using skin-friendly cotton thread.',
    price: 499,
    original_price: 699,
    discount_percent: 29,
    duration_minutes: 30,
    image_url: '/images/service-face.png',
    banner_urls: [
      '/images/service-face.png',
      '/images/banner-service.png',
      '/images/banner-spa.png',
    ],
    inclusions: [
      'Papaya gentle skin brightening cleanser',
      'Herbal steam & whitehead removal',
      'Organic anti-bacterial thread shaping',
      'Cooling mint astringent lotion',
    ],
    steps: [
      { title: 'Enzyme Fruit Cleanse', desc: 'Papaya fruit extracts dissolve dirt and light grease.' },
      { title: 'Mild Steam', desc: 'Gentle warmth loosens clogged surface pores.' },
      { title: 'Brow & Lip Threading', desc: 'Crisp eyebrow contouring with sterile cotton thread.' },
      { title: 'Astringent Mist', desc: 'Antiseptic cooling mist calms threaded pores instantly.' },
    ],
    preparationTips: [
      'Avoid plucking brows for 1 week prior to keep a defined shape.',
    ],
    variants: [
      { name: 'Eyebrows + Upper Lip Threading', duration: '15 mins', price: 149 },
      { name: 'Fruit Clean-up + Brows (Recommended)', duration: '30 mins', price: 499 },
      { name: 'Deluxe Glow Clean-up + Full Face Threading', duration: '45 mins', price: 799 },
    ],
    faqs: [
      { q: 'Is the thread disposable?', a: 'Yes, fresh organic thread is unspooled and discarded after each appointment.' },
    ],
    rating: 4.8,
    review_count: 940,
    available: true,
  },
  {
    id: 'ds-party-glam',
    name: 'Evening Glam Cocktail Party Makeup',
    category: 'Makeup at Home',
    type: 'doorstep',
    description: 'Smokey or soft shimmer eye makeup with long-wearing dewy contour, setting mist, and elegant hair curls.',
    longDescription: 'Get dressed for birthdays, receptions, or gala dinners at home. Our makeup artist delivers stunning dewy skin, fluttery lashes, and voluminous styled waves.',
    price: 1899,
    original_price: 2500,
    discount_percent: 24,
    duration_minutes: 75,
    image_url: '/images/banner-appointment.png',
    banner_urls: [
      '/images/banner-appointment.png',
      '/images/service-hair.png',
      '/images/banner-neutral.png',
    ],
    inclusions: [
      'Customized eye look & waterproof mascara',
      'Flawless blend foundation & highlight',
      'Heat-styled loose beach waves or curls',
      'Setting spray lock for 12 hours',
    ],
    steps: [
      { title: 'Glow Prep', desc: 'Hydrating base serum and primer tailored to evening lighting.' },
      { title: 'Eye Artistry', desc: 'Shimmer or smokey eyeshadow blend with gel liner.' },
      { title: 'Contour & Complexion', desc: 'Flawless medium-to-full coverage with soft blush.' },
      { title: 'Hair Styling', desc: 'Loose curls, sleek blowout, or party half-up style.' },
    ],
    preparationTips: [
      'Have your party outfit ready so makeup colors can be color-matched accurately.',
    ],
    variants: [
      { name: 'Party Makeup Only', duration: '45 mins', price: 1499 },
      { name: 'Party Makeup + Hair Styling (Recommended)', duration: '75 mins', price: 1899 },
      { name: 'Cocktail Luxury Airbrush + Hair', duration: '90 mins', price: 2499 },
    ],
    faqs: [
      { q: 'Can I choose my lip shade and eye look?', a: 'Absolutely! Our artist brings diverse shade palettes and consults with you before starting.' },
    ],
    rating: 4.9,
    review_count: 1310,
    available: true,
  },
];

export const ALL_MEHNDI_SERVICES: ServiceDetailItem[] = [
  {
    id: 'm-bridal-royal',
    name: 'Royal Bridal Full Arms & Feet Mehndi',
    category: 'Bridal Mehndi',
    type: 'mehndi',
    description: 'Intricate Raja-Rani motifs, customized bride-groom portrait detailing, and peacock storytelling for hands and feet.',
    longDescription: 'Handcrafted heritage bridal mehndi capturing the essence of Indian royal weddings. Features customized couple portraits, bride entry, dhol-shehnai, and floral vines using 100% organic Sojat henna leaves with guaranteed rich mahogany stain.',
    price: 3499,
    original_price: 4999,
    discount_percent: 30,
    duration_minutes: 240,
    image_url: '/images/mehndi-bridal.jpg',
    banner_urls: [
      '/images/mehndi-bridal.jpg',
      '/images/mehndi-traditional.jpg',
      '/images/mehndi-engagement.jpg',
    ],
    inclusions: [
      'Both hands elbow-length bridal coverage',
      'Both feet mid-calf intricate work',
      '100% Organic certified Rajasthani henna cones',
      'Complimentary lemon-sugar spray & clove fumigation kit',
      'Free touch-up session before wedding',
    ],
    steps: [
      { title: 'Design Consultation', desc: 'Review bride-groom initials, date, and bespoke portrait sketches.' },
      { title: 'Hand Application', desc: 'Fine-tip application of intricate Marwari peacocks and jali work to elbows.' },
      { title: 'Feet Artistry', desc: 'Symmetrical lotus motifs and payal borders up to mid-calf.' },
      { title: 'Sugar-Lemon Mist', desc: 'Natural seal applied as henna dries to keep lines sticky and rich.' },
      { title: 'Clove Aftercare Kit', desc: 'Complimentary clove fumigation and balm to deepen the dark mahogany stain.' },
    ],
    preparationTips: [
      'Wash hands thoroughly with soap to remove hand lotions and natural oils.',
      'Complete waxing, manicure, and pedicure at least 24-48 hours before mehndi.',
      'Wear a comfortable short-sleeve outfit or loose kurta.',
    ],
    variants: [
      { name: 'Bridal Hands Only (Up to Elbows)', duration: '180 mins', price: 2499 },
      { name: 'Royal Full Arms & Feet (Recommended)', duration: '240 mins', price: 3499 },
      { name: 'Imperial Grand Raja-Rani Full Set', duration: '300 mins', price: 4999 },
    ],
    faqs: [
      { q: 'Are your henna cones chemical-free?', a: 'Yes! We only use pure, triple-sifted Sojat henna mixed with organic eucalyptus and tea tree essential oils. Zero PPD or chemicals.' },
      { q: 'How dark will the stain get?', a: 'With our included clove aftercare, the color transitions from bright orange to deep chocolate mahogany within 48 hours.' },
    ],
    rating: 4.9,
    review_count: 1420,
    available: true,
  },
  {
    id: 'm-arabic-elegance',
    name: 'Modern Arabic Floral Fusion Flow',
    category: 'Arabic Mehndi',
    type: 'mehndi',
    description: 'Bold flowing shaded vine patterns with shaded floral petals, geometric mesh wrists, and fingertip caps.',
    longDescription: 'Dynamic Arabic negative-space patterns with flowing shaded roses, diagonal creeper vines, and delicate geometric finger lace.',
    price: 799,
    original_price: 1199,
    discount_percent: 33,
    duration_minutes: 60,
    image_url: '/images/mehndi-arabic.jpg',
    banner_urls: [
      '/images/mehndi-arabic.jpg',
      '/images/mehndi-minimal.jpg',
      '/images/mehndi-traditional.jpg',
    ],
    inclusions: [
      'Both hands front & back wrist coverage',
      'Chemical-free natural dark henna guarantee',
      'Quick drying formulation (stains in 24 hours)',
      'Complimentary nilgiri essential oil application',
    ],
    steps: [
      { title: 'Floral Vine Mapping', desc: 'Flowing diagonal trail sketched across the palm.' },
      { title: 'Shaded Petal Fills', desc: 'Graduated henna shading inside broad rose and lotus petals.' },
      { title: 'Fingertip Lace', desc: 'Geometric lattice and cuff bands on wrists.' },
      { title: 'Essential Oil Seal', desc: 'Nilgiri oil seal for rich dark tone.' },
    ],
    preparationTips: [
      'Keep hands warm and dry before application.',
    ],
    variants: [
      { name: 'Single Hand Arabic Vine', duration: '30 mins', price: 449 },
      { name: 'Both Hands Arabic (Recommended)', duration: '60 mins', price: 799 },
      { name: 'Arabic Extended Forearm Flow', duration: '90 mins', price: 1199 },
    ],
    faqs: [
      { q: 'How long should I keep the henna paste on?', a: 'We recommend keeping it on for 6 to 8 hours (or overnight) for the richest color.' },
    ],
    rating: 4.8,
    review_count: 980,
    available: true,
  },
  {
    id: 'm-indo-western',
    name: 'Rajasthani Marwari Mandala Heritage',
    category: 'Rajasthani/Marwari Mehndi',
    type: 'mehndi',
    description: 'Chic concentric mandala centerpieces paired with lace-glove bracelets and traditional peacock jewelry motifs.',
    longDescription: 'Authentic Rajasthani fine-line geometry featuring symmetrical concentric mandalas surrounded by lotus petals, kalash motifs, and micro-pearl borders.',
    price: 1199,
    original_price: 1599,
    discount_percent: 25,
    duration_minutes: 75,
    image_url: '/images/mehndi-traditional.jpg',
    banner_urls: [
      '/images/mehndi-traditional.jpg',
      '/images/mehndi-bridal.jpg',
      '/images/mehndi-festival.jpg',
    ],
    inclusions: [
      'Palms and back of both hands up to mid-forearm',
      'Precise symmetrical mandala art',
      'Natural Sojat leaf extract cones',
      'Sugar-lemon glaze and aftercare instructions',
    ],
    rating: 4.9,
    review_count: 1150,
    available: true,
  },
  {
    id: 'm-minimalist-chic',
    name: 'Minimalist Ring Band & Wrist Tattoo',
    category: 'Minimal Mehndi',
    type: 'mehndi',
    description: 'Subtle boho micro-leaves, delicate band rings on fingers, and sleek wrist watch accents for college & office.',
    longDescription: 'Understated, modern minimalism for clients who prefer clean micro-patterns over full-hand fills. Boho vines, delicate ring bands, and chic wrist cuffs.',
    price: 399,
    original_price: 599,
    discount_percent: 33,
    duration_minutes: 30,
    image_url: '/images/mehndi-minimal.jpg',
    banner_urls: [
      '/images/mehndi-minimal.jpg',
      '/images/mehndi-arabic.jpg',
    ],
    inclusions: [
      'Both hands delicate finger rings and wrist band',
      'Ultra-fine needle cone precision',
      'Organic natural cones',
    ],
    rating: 4.7,
    review_count: 530,
    available: true,
  },
  {
    id: 'm-family-festive',
    name: 'Festival Festive Palms & Sangeet Group Art',
    category: 'Festival Mehndi',
    type: 'mehndi',
    description: 'Festive classic palm filling with concentric circular sun motifs for Karwa Chauth, Teej, Diwali & family functions.',
    longDescription: 'Joyous festive henna patterns designed for speedy, beautiful application for festival celebrations and family get-togethers.',
    price: 599,
    original_price: 899,
    discount_percent: 33,
    duration_minutes: 40,
    image_url: '/images/mehndi-festival.jpg',
    banner_urls: [
      '/images/mehndi-festival.jpg',
      '/images/mehndi-traditional.jpg',
    ],
    inclusions: [
      'Both palms full festive motifs',
      'Quick drying organic cones',
      'Complimentary lemon-sugar seal',
    ],
    rating: 4.8,
    review_count: 890,
    available: true,
  },
  {
    id: 'm-feet-anklet',
    name: 'Engagement Ceremony Delicate Mandala',
    category: 'Engagement & Party Mehndi',
    type: 'mehndi',
    description: 'Ornamental backhand medallion with delicate lotus motifs and wrist cuff jewelry for engagement rituals.',
    longDescription: 'Created specifically for ring ceremonies and engagements, highlighting the ring finger with negative space framing and intricate lace cuffs.',
    price: 999,
    original_price: 1399,
    discount_percent: 29,
    duration_minutes: 60,
    image_url: '/images/mehndi-engagement.jpg',
    banner_urls: [
      '/images/mehndi-engagement.jpg',
      '/images/mehndi-bridal.jpg',
    ],
    inclusions: [
      'Both hands backhand and palm engagement styling',
      'Ring-finger accent design',
      '100% Organic Sojat henna',
    ],
    rating: 4.9,
    review_count: 670,
    available: true,
  },
];

export function formatServiceFromRaw(raw: any, explicitType?: 'doorstep' | 'mehndi'): ServiceDetailItem {
  if (!raw) return ALL_DOORSTEP_SERVICES[0];

  const isMehndi = explicitType === 'mehndi' ||
    (typeof raw.id === 'string' && raw.id.startsWith('m-')) ||
    (raw.category && (
      raw.category.toLowerCase().includes('mehndi') ||
      raw.category.toLowerCase().includes('sagai') ||
      raw.category.toLowerCase().includes('hand') ||
      raw.category.toLowerCase().includes('leg') ||
      raw.category.toLowerCase().includes('feet')
    )) ||
    (raw.name && (
      raw.name.toLowerCase().includes('mehndi') ||
      raw.name.toLowerCase().includes('henna')
    ));

  const type: 'doorstep' | 'mehndi' = isMehndi ? 'mehndi' : 'doorstep';
  const nameL = (raw.name || '').toLowerCase();
  const catL = (raw.category || '').toLowerCase();

  let defaultImg = type === 'mehndi' ? '/images/mehndi-traditional.jpg' : '/images/service-facial.png';

  if (type === 'mehndi') {
    if (nameL.includes('bridal') || catL.includes('bridal') || catL.includes('sagai')) defaultImg = '/images/mehndi-bridal.jpg';
    else if (nameL.includes('arabic') || catL.includes('arabic')) defaultImg = '/images/mehndi-arabic.jpg';
    else if (nameL.includes('leg') || nameL.includes('feet') || catL.includes('feet') || catL.includes('leg')) defaultImg = '/images/mehndi-engagement.jpg';
    else if (nameL.includes('minimal') || catL.includes('minimal')) defaultImg = '/images/mehndi-minimal.jpg';
    else if (nameL.includes('festiv') || catL.includes('family')) defaultImg = '/images/mehndi-festival.jpg';
    else defaultImg = '/images/mehndi-traditional.jpg';
  } else {
    if (nameL.includes('thread') || nameL.includes('brow') || nameL.includes('lip')) defaultImg = '/images/service-face.png';
    else if (nameL.includes('wax') || catL.includes('wax')) defaultImg = '/images/category-waxing.jpg';
    else if (nameL.includes('nail') || nameL.includes('pedicure') || nameL.includes('manicure') || catL.includes('nail')) defaultImg = '/images/category-nails.jpg';
    else if (nameL.includes('hair') || catL.includes('hair')) defaultImg = '/images/service-hair.png';
    else if (nameL.includes('bridal') || catL.includes('bridal')) defaultImg = '/images/category-bridal.jpg';
    else if (nameL.includes('tan') || nameL.includes('glow') || catL.includes('skin')) defaultImg = '/images/service-skincare.png';
    else if (nameL.includes('clean') || catL.includes('face')) defaultImg = '/images/service-face.png';
    else defaultImg = '/images/service-facial.png';
  }

  const origPrice = raw.original_price || Math.round((raw.price || 499) * 1.35);
  const discountPct = raw.discount_percent || Math.round(((origPrice - (raw.price || 499)) / origPrice) * 100);

  return {
    id: String(raw.id || 'service-' + Date.now()),
    name: raw.name || 'Beauty Treatment',
    category: raw.category || (type === 'mehndi' ? 'Artisanal Mehndi' : 'Doorstep Beauty'),
    type,
    description: raw.description || `Professional ${type === 'mehndi' ? 'organic henna art' : 'salon beauty care'} delivered in the comfort of your home.`,
    longDescription: raw.longDescription || raw.description || `Enjoy salon luxury at home with certified specialists. Arrives with single-use sealed kits, sanitized tools, and premium formulations.`,
    price: Number(raw.price) || 499,
    original_price: origPrice,
    discount_percent: discountPct,
    duration_minutes: Number(raw.duration_minutes) || (type === 'mehndi' ? 60 : 45),
    image_url: raw.image_url || defaultImg,
    banner_urls: raw.banner_urls && raw.banner_urls.length > 0 ? raw.banner_urls : [raw.image_url || defaultImg, defaultImg],
    inclusions: raw.inclusions || [
      'Single-use sealed sanitization toolkit',
      'Certified and background-verified specialist',
      'Complete post-service cleanup guarantee',
    ],
    steps: raw.steps || [
      { title: 'Step 1: Consultation & Setup', desc: 'Skin & safety assessment, setup with sanitized disposables.' },
      { title: 'Step 2: Service Delivery', desc: 'Precision execution by verified beauty specialist.' },
      { title: 'Step 3: Finishing & Clean-up', desc: 'Aftercare guidance and 100% mess-free cleanup.' },
    ],
    preparationTips: raw.preparationTips || [
      'Ensure a clean, quiet space near a chair is ready for your artist.',
      'Kindly share any skin sensitivities or allergies before the session begins.',
    ],
    variants: raw.variants || [
      { name: 'Standard Service', duration: `${raw.duration_minutes || 45} mins`, price: Number(raw.price) || 499 },
      { name: 'Deluxe Upgrade', duration: `${(Number(raw.duration_minutes) || 45) + 20} mins`, price: Math.round((Number(raw.price) || 499) * 1.3) },
    ],
    faqs: raw.faqs || [
      { q: 'What is included in the service?', a: 'All necessary products, sanitized tools, and single-use kits are provided by our artist.' },
      { q: 'Can I reschedule?', a: 'Free rescheduling is available up to 2 hours before your scheduled appointment time.' },
    ],
    rating: Number(raw.rating) || 4.9,
    review_count: Number(raw.review_count) || 450,
    available: raw.available ?? true,
  };
}

export function getServiceById(id: string): ServiceDetailItem | undefined {
  const found = [...ALL_DOORSTEP_SERVICES, ...ALL_MEHNDI_SERVICES].find((s) => s.id === id);
  if (found) return found;
  // Also try case-insensitive name match or partial id match
  return [...ALL_DOORSTEP_SERVICES, ...ALL_MEHNDI_SERVICES].find(
    (s) => s.id.toLowerCase() === id.toLowerCase() || s.name.toLowerCase() === id.toLowerCase()
  );
}

export function getRelatedServices(currentId: string, limit: number = 4): ServiceDetailItem[] {
  const current = getServiceById(currentId);
  const pool = current?.type === 'mehndi' ? ALL_MEHNDI_SERVICES : ALL_DOORSTEP_SERVICES;
  return pool.filter((s) => s.id !== currentId).slice(0, limit);
}
