import { supabase } from '@/lib/supabase';

export type TargetRole = 'associate' | 'stylist';

export interface CourseLesson {
  id: string;
  subcategory_id: string;
  category_id: string;
  role: TargetRole;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  step_by_step: string[];
  required_tools: string[];
  important_tips: string[];
  safety_hygiene: string[];
  before_after_care: string[];
  sequence: number;
  is_published: boolean;
  created_at: string;
}

export interface CourseSubcategory {
  id: string;
  category_id: string;
  role: TargetRole;
  name: string;
  description: string;
  thumbnail: string;
  display_order: number;
  lessons: CourseLesson[];
}

export interface CourseCategory {
  id: string;
  role: TargetRole;
  name: string;
  description: string;
  thumbnail: string;
  icon?: string;
  display_order: number;
  subcategories: CourseSubcategory[];
  created_at: string;
}

export interface TrainingAssignment {
  id: string;
  role: TargetRole;
  category_id?: string;
  course_name: string;
  assignee_type: 'all' | 'individual';
  employee_id?: string;
  employee_name?: string;
  is_mandatory: boolean;
  start_date: string;
  deadline: string;
  created_at: string;
}

export interface LessonProgress {
  employee_id: string;
  employee_role: TargetRole;
  lesson_id: string;
  watched_seconds: number;
  video_duration: number;
  completed: boolean;
  completed_at?: string;
  last_resumed_at: string;
}

// ── Default Seed Data for Associate Training ──────────────────────────────
const DEFAULT_ASSOCIATE_CATEGORIES: CourseCategory[] = [
  {
    id: 'assoc-cat-1',
    role: 'associate',
    name: 'Company Introduction',
    description: 'Core foundations, brand ethos, leadership guidelines and employee integrity standards at BlindGlow By Satguru.',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
    icon: 'Building2',
    display_order: 1,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'assoc-sub-1-1',
        category_id: 'assoc-cat-1',
        role: 'associate',
        name: 'About BlindGlow By Satguru',
        description: 'Our heritage, luxury doorstep salon mission, and ethical service delivery.',
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
        display_order: 1,
        lessons: [
          {
            id: 'assoc-les-1-1-1',
            subcategory_id: 'assoc-sub-1-1',
            category_id: 'assoc-cat-1',
            role: 'associate',
            title: 'Welcome to BlindGlow: Our Brand Story & Mission',
            description: 'Learn how BlindGlow transforms home wellness into a 5-star salon experience with organic products and verified safety.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 12,
            step_by_step: [
              'Understand the Satguru heritage and core standards.',
              'Know the three pillars: Purity, Punctuality, and Customer Delight.',
              'Represent the brand with pride in every verbal and written interaction.',
            ],
            required_tools: ['Company Handbook', 'Employee ID Badge'],
            important_tips: ['Always carry yourself with poise and speak with warm courtesy.'],
            safety_hygiene: ['Maintain clean digital records and verified client notes.'],
            before_after_care: ['Review brand guidelines before starting daily client calls.'],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'assoc-sub-1-2',
        category_id: 'assoc-cat-1',
        role: 'associate',
        name: 'Company Policies',
        description: 'Attendance, customer communication norms, confidentiality and code of conduct.',
        thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        display_order: 2,
        lessons: [
          {
            id: 'assoc-les-1-2-1',
            subcategory_id: 'assoc-sub-1-2',
            category_id: 'assoc-cat-1',
            role: 'associate',
            title: 'Workplace Ethics & Customer Data Privacy',
            description: 'Strict policies regarding customer phone numbers, home locations, and zero-tolerance harassment rules.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 15,
            step_by_step: [
              'Never share customer contact details or home addresses outside the system.',
              'Use only official Satguru messaging channels for client coordination.',
              'Report any policy violations directly to Admin within 30 minutes.',
            ],
            required_tools: ['Satguru Associate App'],
            important_tips: ['Customer privacy is legally binding and our highest commitment.'],
            safety_hygiene: ['Encrypted communication only.'],
            before_after_care: ['Sign off all sessions at end of day.'],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'assoc-sub-1-3',
        category_id: 'assoc-cat-1',
        role: 'associate',
        name: 'Company Values',
        description: 'Customer first, absolute transparency, skin-safe organic commitment.',
        thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
        display_order: 3,
        lessons: [],
      },
      {
        id: 'assoc-sub-1-4',
        category_id: 'assoc-cat-1',
        role: 'associate',
        name: 'Employee Responsibilities',
        description: 'Daily reporting, duty checklists, compliance with admin instructions.',
        thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
        display_order: 4,
        lessons: [],
      },
    ],
  },
  {
    id: 'assoc-cat-2',
    role: 'associate',
    name: 'Roles & Responsibilities',
    description: 'Day-to-day operational execution, appointment lifecycle supervision, and professional guidelines.',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=80',
    icon: 'Briefcase',
    display_order: 2,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'assoc-sub-2-1',
        category_id: 'assoc-cat-2',
        role: 'associate',
        name: 'Daily Responsibilities',
        description: 'Morning schedule review, stylist kit checkups, order dispatch monitoring.',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        display_order: 1,
        lessons: [],
      },
      {
        id: 'assoc-sub-2-2',
        category_id: 'assoc-cat-2',
        role: 'associate',
        name: 'Appointment Duties',
        description: 'Pre-service verification call, address reconfirmation, stylist arrival tracking.',
        thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80',
        display_order: 2,
        lessons: [],
      },
      {
        id: 'assoc-sub-2-3',
        category_id: 'assoc-cat-2',
        role: 'associate',
        name: 'Work Guidelines',
        description: 'Protocol compliance, accurate status tagging, escalation matrices.',
        thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
        display_order: 3,
        lessons: [],
      },
      {
        id: 'assoc-sub-2-4',
        category_id: 'assoc-cat-2',
        role: 'associate',
        name: 'Professional Behaviour',
        description: 'Warm tone of voice, conflict-free interaction, corporate discipline.',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        display_order: 4,
        lessons: [],
      },
    ],
  },
  {
    id: 'assoc-cat-3',
    role: 'associate',
    name: 'Customer Handling',
    description: 'Client communication protocols, empathy in service, resolving objections and five-star satisfaction.',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    icon: 'HeartHandshake',
    display_order: 3,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'assoc-sub-3-1',
        category_id: 'assoc-cat-3',
        role: 'associate',
        name: 'Greeting Customers',
        description: 'Standard polite Indian greeting protocol: "Namaste / Good Day, welcome to BlindGlow By Satguru".',
        thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80',
        display_order: 1,
        lessons: [],
      },
      {
        id: 'assoc-sub-3-2',
        category_id: 'assoc-cat-3',
        role: 'associate',
        name: 'Customer Communication',
        description: 'Active listening, clear pronunciation, clarifying service expectations beforehand.',
        thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
        display_order: 2,
        lessons: [],
      },
      {
        id: 'assoc-sub-3-3',
        category_id: 'assoc-cat-3',
        role: 'associate',
        name: 'Handling Difficult Customers',
        description: 'De-escalation strategies, staying calm, offering reassuring solutions without arguing.',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
        display_order: 3,
        lessons: [],
      },
      {
        id: 'assoc-sub-3-4',
        category_id: 'assoc-cat-3',
        role: 'associate',
        name: 'Customer Satisfaction',
        description: 'Follow-up calls, collecting reviews, ensuring repeat bookings.',
        thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
        display_order: 4,
        lessons: [],
      },
      {
        id: 'assoc-sub-3-5',
        category_id: 'assoc-cat-3',
        role: 'associate',
        name: 'Complaint Management',
        description: 'Logging queries, SLA resolution within 2–4 hours, instant compensation coupons if applicable.',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
        display_order: 5,
        lessons: [],
      },
    ],
  },
  {
    id: 'assoc-cat-4',
    role: 'associate',
    name: 'Appointment Management',
    description: 'Booking confirmations, calendar scheduling, managing delays and customer coordination.',
    thumbnail: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&auto=format&fit=crop&q=80',
    icon: 'Calendar',
    display_order: 4,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'assoc-sub-4-1', category_id: 'assoc-cat-4', role: 'associate', name: 'Booking Confirmation', description: 'Confirming booking slot, service details, and address verification.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'assoc-sub-4-2', category_id: 'assoc-cat-4', role: 'associate', name: 'Appointment Scheduling', description: 'Route optimization and time management for doorstep experts.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'assoc-sub-4-3', category_id: 'assoc-cat-4', role: 'associate', name: 'Handling Delays', description: 'Proactive 20-minute advance customer update when transit traffic occurs.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'assoc-sub-4-4', category_id: 'assoc-cat-4', role: 'associate', name: 'Appointment Cancellation', description: 'Cancellation rules, refund initiation, rescheduling options.', thumbnail: '', display_order: 4, lessons: [] },
      { id: 'assoc-sub-4-5', category_id: 'assoc-cat-4', role: 'associate', name: 'Customer Coordination', description: 'SMS reminders and WhatsApp live tracking coordination.', thumbnail: '', display_order: 5, lessons: [] },
    ],
  },
  {
    id: 'assoc-cat-5',
    role: 'associate',
    name: 'Doorstep Service Etiquette',
    description: 'Respecting home boundaries, shoe covers, punctuality, and client privacy in personal residences.',
    thumbnail: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    icon: 'Home',
    display_order: 5,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'assoc-sub-5-1', category_id: 'assoc-cat-5', role: 'associate', name: 'Customer Home Etiquette', description: 'Entering politely, asking where to set up kit, using protective floor mat.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'assoc-sub-5-2', category_id: 'assoc-cat-5', role: 'associate', name: 'Professional Behaviour', description: 'Zero intrusive personal questions, maintaining polite decorum.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'assoc-sub-5-3', category_id: 'assoc-cat-5', role: 'associate', name: 'Punctuality', description: 'Arriving 5 minutes prior to scheduled slot.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'assoc-sub-5-4', category_id: 'assoc-cat-5', role: 'associate', name: 'Respecting Customer Privacy', description: 'No photography without explicit consent, protecting client space.', thumbnail: '', display_order: 4, lessons: [] },
    ],
  },
  {
    id: 'assoc-cat-6',
    role: 'associate',
    name: 'Grooming & Hygiene',
    description: 'Satguru uniform standards, personal hygiene, sanitized service kit protocols.',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    icon: 'Sparkles',
    display_order: 6,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'assoc-sub-6-1', category_id: 'assoc-cat-6', role: 'associate', name: 'Personal Grooming', description: 'Tidy hair, clean nails, pleasant fragrance, spotless uniform.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'assoc-sub-6-2', category_id: 'assoc-cat-6', role: 'associate', name: 'Professional Appearance', description: 'Wearing official ID card, neat footwear, branded bag.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'assoc-sub-6-3', category_id: 'assoc-cat-6', role: 'associate', name: 'Hygiene Standards', description: 'Single-use disposable aprons, sanitized stainless tools, fresh towels.', thumbnail: '', display_order: 3, lessons: [] },
    ],
  },
  {
    id: 'assoc-cat-7',
    role: 'associate',
    name: 'Safety & Security',
    description: 'Personal safety, customer protection, SOS alerts, emergency protocols.',
    thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    icon: 'ShieldCheck',
    display_order: 7,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'assoc-sub-7-1', category_id: 'assoc-cat-7', role: 'associate', name: 'Personal Safety', description: 'Location tracking on app, battery check, safe commute rules.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'assoc-sub-7-2', category_id: 'assoc-cat-7', role: 'associate', name: 'Customer Safety', description: 'Patch tests for sensitive skin, verified hypoallergenic products.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'assoc-sub-7-3', category_id: 'assoc-cat-7', role: 'associate', name: 'Emergency Situations', description: 'Medical emergency, fainting, accidental spill protocols.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'assoc-sub-7-4', category_id: 'assoc-cat-7', role: 'associate', name: 'Reporting Issues', description: 'Instant incident escalation to Admin SOS desk.', thumbnail: '', display_order: 4, lessons: [] },
    ],
  },
  {
    id: 'assoc-cat-8',
    role: 'associate',
    name: 'Payment & Operations',
    description: 'UPI QR generation, cash reconciliation, end-of-day reporting.',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    icon: 'Wallet',
    display_order: 8,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'assoc-sub-8-1', category_id: 'assoc-cat-8', role: 'associate', name: 'Payment Handling', description: 'Digital payments, UPI QR scanning, cash receipt confirmation.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'assoc-sub-8-2', category_id: 'assoc-cat-8', role: 'associate', name: 'Payment Confirmation', description: 'Instant SMS & Invoice dispatch upon payment receipt.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'assoc-sub-8-3', category_id: 'assoc-cat-8', role: 'associate', name: 'Reporting', description: 'Daily job count, product consumption report, travel log.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'assoc-sub-8-4', category_id: 'assoc-cat-8', role: 'associate', name: 'Daily Work Procedures', description: 'Opening duties, shift sign-off, inventory restock request.', thumbnail: '', display_order: 4, lessons: [] },
    ],
  },
];

// ── Default Seed Data for Stylist Training Academy ────────────────────────
const DEFAULT_STYLIST_CATEGORIES: CourseCategory[] = [
  {
    id: 'stylist-cat-1',
    role: 'stylist',
    name: 'Hair Services',
    description: 'Precision haircuts, luxury blow dry, straightening, curls, hair spa treatments and damage care.',
    thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    icon: 'Scissors',
    display_order: 1,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'stylist-sub-1-1',
        category_id: 'stylist-cat-1',
        role: 'stylist',
        name: 'Hair Cutting',
        description: 'Layer Cut, Step Cut, U Cut, V Cut, Bob Cut & Feather haircutting masterclass.',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        display_order: 1,
        lessons: [
          {
            id: 'stylist-les-1-1-1',
            subcategory_id: 'stylist-sub-1-1',
            category_id: 'stylist-cat-1',
            role: 'stylist',
            title: 'Layer Cut: Sectioning, 90° Elevation & Texture Blending',
            description: 'Master the 3-tier luxury layer haircut. Learn precise sectioning, elevation angles, point-cutting for soft texture, and face-framing fringe.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 24,
            step_by_step: [
              'Dampen hair evenly to 80% moisture with pure distilled water spray.',
              'Create a clean 4-quadrant profile parting (center from forehead to nape, ear to ear).',
              'Establish the perimeter guideline at the nape at 0 degrees elevation.',
              'Take 1-inch horizontal sub-sections, elevate to 90 degrees, and cut parallel to head shape.',
              'Progress through crown with travelling guideline to create seamless weight distribution.',
              'Perform front diagonal-forward slide cutting to frame the cheekbones and jawline.',
              'Blow-dry with a round ceramic brush and check balance on both sides.',
            ],
            required_tools: [
              'Japanese 6.0" Convex Edge Shears',
              'Sectioning Crocodile Clips (6 pcs)',
              'Fine-tooth Carbon Tail Comb',
              'Micro-mist Water Spray Bottle',
              'Thermal Ceramic Round Brush (45mm)',
              'Ionic Salon Hair Dryer',
            ],
            important_tips: [
              'Never cut above the client’s requested chin line for the first layer.',
              'Check tension consistently: excessive tension causes uneven bounce in wavy hair.',
              'Always stand directly behind the section you are cutting to prevent asymmetric angles.',
            ],
            safety_hygiene: [
              'Sanitize cutting shears in Barbicide or UV sterilizer before every client.',
              'Place a fresh disposable neck strip and waterproof cutting cape.',
              'Disinfect combs between clients with 70% isopropyl alcohol.',
            ],
            before_after_care: [
              'Before: Consult on client lifestyle, daily styling habits, and natural hair density.',
              'After: Apply 2 drops of Argan oil serum on ends to seal cuticles and prevent split ends.',
            ],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'stylist-les-1-1-2',
            subcategory_id: 'stylist-sub-1-1',
            category_id: 'stylist-cat-1',
            role: 'stylist',
            title: 'Step Cut: Volumizing Separation for Medium & Long Hair',
            description: 'Learn the distinction between step cut and layer cut, creating sharp, defined steps with bounce.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 20,
            step_by_step: [
              'Analyze hair density and determine step drop intervals (usually 2-3 inches apart).',
              'Section bottom tier at the occipital bone and blunt-cut baseline.',
              'Elevate middle section at 135 degrees to create the second distinct step.',
              'Elevate top crown section straight up at 180 degrees for volume.',
              'Cross-check vertical sections for balance.',
            ],
            required_tools: ['Hair cutting shears', 'Tail comb', 'Clips', 'Round brush'],
            important_tips: ['Step cuts look best on thick or wavy hair. Avoid on ultra-fine hair.'],
            safety_hygiene: ['Sterilize scissors and comb before client appointment.'],
            before_after_care: ['Recommend monthly split-end trimming to maintain shape.'],
            sequence: 2,
            is_published: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'stylist-les-1-1-3',
            subcategory_id: 'stylist-sub-1-1',
            category_id: 'stylist-cat-1',
            role: 'stylist',
            title: 'Classic U-Cut & V-Cut Perimeter Design',
            description: 'Technique for creating symmetrical curved U and sharp geometric V hair shapes.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 18,
            step_by_step: [
              'Ask client to tilt head slightly forward.',
              'Comb hair straight down with zero elevation.',
              'Cut from center back outward toward ears at a consistent 30-degree upward curve.',
            ],
            required_tools: ['Cutting shears', 'Wide comb', 'Level tool'],
            important_tips: ['Ensure shoulders remain level during cutting.'],
            safety_hygiene: ['Sweep and bag all loose hair immediately into disposable sanitary pouch.'],
            before_after_care: ['Apply heat protectant spray prior to finish.'],
            sequence: 3,
            is_published: true,
            created_at: new Date().toISOString(),
          },
          {
            id: 'stylist-les-1-1-4',
            subcategory_id: 'stylist-sub-1-1',
            category_id: 'stylist-cat-1',
            role: 'stylist',
            title: 'Graduated Bob & A-Line Precision Cut',
            description: 'Modern chic bob styling, precision weight lines, and bevelled nape finishing.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 25,
            step_by_step: [
              'Create triangular nape section.',
              'Cut baseline at 0 degrees, then layer with 45-degree low graduation.',
              'Direct side sections back towards the ear to maintain front length.',
            ],
            required_tools: ['Precision shears', 'Neck duster', 'Flat paddle brush'],
            important_tips: ['Maintain minimal comb tension over the ear protrusion.'],
            safety_hygiene: ['Clean nape with hypoallergenic talc and sanitized brush.'],
            before_after_care: ['Advise blow-drying with bevelled round brush.'],
            sequence: 4,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'stylist-sub-1-2',
        category_id: 'stylist-cat-1',
        role: 'stylist',
        name: 'Hair Styling',
        description: 'Blow dry, straightening, curling, party hairstyles and thermal styling.',
        thumbnail: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
        display_order: 2,
        lessons: [
          {
            id: 'stylist-les-1-2-1',
            subcategory_id: 'stylist-sub-1-2',
            category_id: 'stylist-cat-1',
            role: 'stylist',
            title: 'High-Gloss Volume Blow Dry & Root Lift',
            description: 'Learn the Italian blow-dry technique for bouncy, glass-shine finish that lasts 48 hours.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 18,
            step_by_step: [
              'Apply heat protection spray and root-boosting mousse to towel-dried hair.',
              'Rough dry to 80% with directional nozzle pointing down the hair shaft.',
              'Take 1.5-inch sections starting at crown, roll onto ceramic brush, blast warm air then cool shot.',
            ],
            required_tools: ['Professional 2200W Dryer', 'Boar bristle round brush', 'Heat protectant'],
            important_tips: ['Always point airflow downward from root to tip to seal the cuticle.'],
            safety_hygiene: ['Keep dryer nozzle 2 inches away from scalp to prevent thermal discomfort.'],
            before_after_care: ['Instruct client to wrap hair in silk scarf before bed.'],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'stylist-sub-1-3',
        category_id: 'stylist-cat-1',
        role: 'stylist',
        name: 'Hair Spa',
        description: 'Deep conditioning, hot towel infusion, scalp massage and keratin hydration.',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        display_order: 3,
        lessons: [],
      },
      {
        id: 'stylist-sub-1-4',
        category_id: 'stylist-cat-1',
        role: 'stylist',
        name: 'Hair Wash',
        description: 'Scalp cleansing, water temperature regulation, ergonomic basin setup for doorstep service.',
        thumbnail: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80',
        display_order: 4,
        lessons: [],
      },
      {
        id: 'stylist-sub-1-5',
        category_id: 'stylist-cat-1',
        role: 'stylist',
        name: 'Hair Care',
        description: 'Split ends management, anti-dandruff treatments, organic oil therapy.',
        thumbnail: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80',
        display_order: 5,
        lessons: [],
      },
    ],
  },
  {
    id: 'stylist-cat-2',
    role: 'stylist',
    name: 'Facial & Skin Care',
    description: 'Basic facial, cleanup, hydrating facial, 24K gold radiance, face massage & skin prep.',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    icon: 'Sparkles',
    display_order: 2,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'stylist-sub-2-1',
        category_id: 'stylist-cat-2',
        role: 'stylist',
        name: 'Basic Facial',
        description: 'Cleansing, toning, steam, extraction, gentle massage, and soothing pack.',
        thumbnail: 'https://images.unsplash.com/photo-1512290900672-1f41d01ec749?w=600&auto=format&fit=crop&q=80',
        display_order: 1,
        lessons: [
          {
            id: 'stylist-les-2-1-1',
            subcategory_id: 'stylist-sub-2-1',
            category_id: 'stylist-cat-2',
            role: 'stylist',
            title: '7-Step Classical Radiance Facial Procedure',
            description: 'Standard luxury protocol: double cleansing, enzyme scrub, steam, blackhead vacuum, lymph massage, mask & SPF.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 30,
            step_by_step: [
              'Sanitize hands and place clean head wrap and towel over client décolletage.',
              'Double cleanse with Rose Camellia milk cleanser using gentle circular effleurage.',
              'Exfoliate with micronized walnut shell scrub for 3 minutes, avoiding eye area.',
              'Apply warm facial steamer at 30cm distance for 5 minutes to open pores.',
              'Perform pressure-point face and neck massage with Kumkumadi facial oil for 12 minutes.',
              'Apply clay or brightening peel-off mask; let rest for 15 minutes while doing hand massage.',
              'Tone with pure rose water mist and lock in hydration with SPF 50 moisturizer.',
            ],
            required_tools: ['Facial Steamer', 'Cotton pads', 'Extraction loop', 'Mask brush', 'Sponge bowls'],
            important_tips: ['Always ask client about skin allergies or retinoid usage before exfoliation.'],
            safety_hygiene: ['Wear disposable gloves during extraction. Sterilize loop with autoclave wipe.'],
            before_after_care: ['Advise client to avoid direct sunlight, makeup, and hot showers for 24 hours.'],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      { id: 'stylist-sub-2-2', category_id: 'stylist-cat-2', role: 'stylist', name: 'Cleanup', description: 'Deep pore cleansing, blackhead extraction, dead cell removal.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'stylist-sub-2-3', category_id: 'stylist-cat-2', role: 'stylist', name: 'Hydrating Facial', description: 'Hyaluronic acid infusion for dry or tired skin.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'stylist-sub-2-4', category_id: 'stylist-cat-2', role: 'stylist', name: 'Brightening Facial', description: 'Vitamin C and Licorice brightening therapy for glowing complexion.', thumbnail: '', display_order: 4, lessons: [] },
      { id: 'stylist-sub-2-5', category_id: 'stylist-cat-2', role: 'stylist', name: 'Skin Preparation', description: 'Pre-event skin priming, ice globes, and de-puffing lymphatic drainage.', thumbnail: '', display_order: 5, lessons: [] },
      { id: 'stylist-sub-2-6', category_id: 'stylist-cat-2', role: 'stylist', name: 'Face Massage', description: 'Classic European & Ayurvedic Marma point massage techniques.', thumbnail: '', display_order: 6, lessons: [] },
      { id: 'stylist-sub-2-7', category_id: 'stylist-cat-2', role: 'stylist', name: 'Post-Facial Care', description: 'Aftercare product recommendations and barrier repair guidance.', thumbnail: '', display_order: 7, lessons: [] },
    ],
  },
  {
    id: 'stylist-cat-3',
    role: 'stylist',
    name: 'Makeup',
    description: 'Basic, party, engagement, bridal, base sculpting, eye makeup and luxury cosmetic knowledge.',
    thumbnail: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    icon: 'Palette',
    display_order: 3,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'stylist-sub-3-1',
        category_id: 'stylist-cat-3',
        role: 'stylist',
        name: 'Basic Makeup',
        description: 'No-makeup makeup look, daytime glow, tinted moisturizer and natural lip tint.',
        thumbnail: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80',
        display_order: 1,
        lessons: [],
      },
      {
        id: 'stylist-sub-3-2',
        category_id: 'stylist-cat-3',
        role: 'stylist',
        name: 'Party Makeup',
        description: 'Cocktail looks, shimmer pigments, lash application and soft glam contouring.',
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        display_order: 2,
        lessons: [],
      },
      {
        id: 'stylist-sub-3-3',
        category_id: 'stylist-cat-3',
        role: 'stylist',
        name: 'Engagement Makeup',
        description: 'Soft pastels, dewy glass base, cut-crease eyeshadow and long-wearing blush.',
        thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        display_order: 3,
        lessons: [],
      },
      {
        id: 'stylist-sub-3-4',
        category_id: 'stylist-cat-3',
        role: 'stylist',
        name: 'Bridal Makeup',
        description: 'Waterproof HD base, sweat-proof contour, traditional red/gold Indian bridal mastery.',
        thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
        display_order: 4,
        lessons: [
          {
            id: 'stylist-les-3-4-1',
            subcategory_id: 'stylist-sub-3-4',
            category_id: 'stylist-cat-3',
            role: 'stylist',
            title: 'Royal Indian Bridal HD Base & 16-Hour Sweatproof Lock',
            description: 'Master the high-definition airbrush look with color correction, baking, and setting spray sandwiching.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 35,
            step_by_step: [
              'Cleanse and prep skin with hydrating serum and pore-refining primer.',
              'Color-correct dark circles and hyperpigmentation with peach/orange corrector.',
              'Stipple full-coverage HD foundation matching client undertone (warm golden).',
              'Cream contour cheekbones, nose, and jawline; blend seamlessly upwards.',
              'Set under-eye with micro-fine translucent powder; apply setting spray sandwich technique.',
            ],
            required_tools: ['Beauty sponge', 'Dense stippling brush', 'HD Foundation palette', 'Setting spray'],
            important_tips: ['Match foundation to the bride’s collarbone and chest, not just facial skin.'],
            safety_hygiene: ['Use stainless steel mixing palette; never apply directly from bottle.'],
            before_after_care: ['Ensure the bride drinks water and stays in cool AC during dressing.'],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      { id: 'stylist-sub-3-5', category_id: 'stylist-cat-3', role: 'stylist', name: 'Eye Makeup', description: 'Smokey eyes, winged liner, glitter halo and false lash placement.', thumbnail: '', display_order: 5, lessons: [] },
      { id: 'stylist-sub-3-6', category_id: 'stylist-cat-3', role: 'stylist', name: 'Base Makeup', description: 'Primer selection, color theory, foundation matching across Indian skin tones.', thumbnail: '', display_order: 6, lessons: [] },
      { id: 'stylist-sub-3-7', category_id: 'stylist-cat-3', role: 'stylist', name: 'Makeup Product Knowledge', description: 'Ingredient safety, shelf life, sanitation of brushes and palettes.', thumbnail: '', display_order: 7, lessons: [] },
    ],
  },
  {
    id: 'stylist-cat-4',
    role: 'stylist',
    name: 'Mehndi',
    description: 'Organic Sojat henna application, bridal figures, Arabic patterns and dark stain development.',
    thumbnail: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&auto=format&fit=crop&q=80',
    icon: 'Feather',
    display_order: 4,
    created_at: new Date().toISOString(),
    subcategories: [
      {
        id: 'stylist-sub-4-1',
        category_id: 'stylist-cat-4',
        role: 'stylist',
        name: 'Basic Mehndi Designs',
        description: 'Mandala motifs, bail patterns, floral creepers, and finger accents.',
        thumbnail: '',
        display_order: 1,
        lessons: [
          {
            id: 'stylist-les-4-1-1',
            subcategory_id: 'stylist-sub-4-1',
            category_id: 'stylist-cat-4',
            role: 'stylist',
            title: 'Cone Pressure Control & Mandala Centerpiece',
            description: 'Learn how to hold the cone, control fine line flow, and create perfectly balanced circular mandalas.',
            video_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration_minutes: 22,
            step_by_step: [
              'Clean client hands with non-oil soap and dry completely.',
              'Hold henna cone with pen grip; test tip flow on paper towel.',
              'Draw center dot, concentric circles, and delicate scalloped petals.',
              'Add shading inside petals with feather-light cone pressure.',
            ],
            required_tools: ['Organic Sojat Henna Cones', 'Lemon-sugar syrup', 'Eucalyptus oil'],
            important_tips: ['Do not touch wet mehndi with cone tip; drape the henna strand from above.'],
            safety_hygiene: ['100% natural henna only; zero chemical PPD black henna allowed.'],
            before_after_care: ['Keep paste on hands for 6 hours; remove dry crust without water.'],
            sequence: 1,
            is_published: true,
            created_at: new Date().toISOString(),
          },
        ],
      },
      { id: 'stylist-sub-4-2', category_id: 'stylist-cat-4', role: 'stylist', name: 'Arabic Mehndi', description: 'Free-flowing bold floral trails, negative space shading.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'stylist-sub-4-3', category_id: 'stylist-cat-4', role: 'stylist', name: 'Traditional Mehndi', description: 'Intricate Rajasthani jaal, peacock motifs, elephant motifs.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'stylist-sub-4-4', category_id: 'stylist-cat-4', role: 'stylist', name: 'Bridal Mehndi', description: 'Full forearm & elbow bridal storytelling, dulha-dulhan portraits.', thumbnail: '', display_order: 4, lessons: [] },
      { id: 'stylist-sub-4-5', category_id: 'stylist-cat-4', role: 'stylist', name: 'Front Hand Designs', description: 'Palm composition, wrist cuffs, thumb and index finger coordination.', thumbnail: '', display_order: 5, lessons: [] },
      { id: 'stylist-sub-4-6', category_id: 'stylist-cat-4', role: 'stylist', name: 'Back Hand Designs', description: 'Geometric jewelry patterns, haathphool style mehndi.', thumbnail: '', display_order: 6, lessons: [] },
      { id: 'stylist-sub-4-7', category_id: 'stylist-cat-4', role: 'stylist', name: 'Feet Mehndi', description: 'Payal borders, toes shading, ankle jaali patterns.', thumbnail: '', display_order: 7, lessons: [] },
    ],
  },
  {
    id: 'stylist-cat-5',
    role: 'stylist',
    name: 'Waxing',
    description: 'Hygienic cartridge and stripless wax, painless pull techniques, soothing post-wax treatment.',
    thumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    icon: 'Droplets',
    display_order: 5,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'stylist-sub-5-1', category_id: 'stylist-cat-5', role: 'stylist', name: 'Hand Waxing', description: 'Full arm & half arm wax application in direction of hair growth.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'stylist-sub-5-2', category_id: 'stylist-cat-5', role: 'stylist', name: 'Leg Waxing', description: 'Full legs & knee area waxing with anti-tan chocolate wax.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'stylist-sub-5-3', category_id: 'stylist-cat-5', role: 'stylist', name: 'Underarm Waxing', description: 'Peel-off Brazilian wax for sensitive skin with zero redness.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'stylist-sub-5-4', category_id: 'stylist-cat-5', role: 'stylist', name: 'Full Body Waxing', description: 'Complete body package sequencing for maximum client comfort.', thumbnail: '', display_order: 4, lessons: [] },
      { id: 'stylist-sub-5-5', category_id: 'stylist-cat-5', role: 'stylist', name: 'Wax Preparation', description: 'Temperature testing on stylist wrist prior to client application.', thumbnail: '', display_order: 5, lessons: [] },
      { id: 'stylist-sub-5-6', category_id: 'stylist-cat-5', role: 'stylist', name: 'Aftercare', description: 'Post-wax soothing gel, aloe vera massage, preventing ingrowns.', thumbnail: '', display_order: 6, lessons: [] },
    ],
  },
  {
    id: 'stylist-cat-6',
    role: 'stylist',
    name: 'Threading',
    description: 'Precision cotton thread shaping, upper lip, chin, and painless facial epilation.',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    icon: 'Feather',
    display_order: 6,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'stylist-sub-6-1', category_id: 'stylist-cat-6', role: 'stylist', name: 'Eyebrow Threading', description: '40-count organic cotton thread loop technique.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'stylist-sub-6-2', category_id: 'stylist-cat-6', role: 'stylist', name: 'Upper Lip Threading', description: 'Gentle quick-pull technique minimizing teariness.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'stylist-sub-6-3', category_id: 'stylist-cat-6', role: 'stylist', name: 'Facial Threading', description: 'Full forehead, cheeks, and sideburns cleanup.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'stylist-sub-6-4', category_id: 'stylist-cat-6', role: 'stylist', name: 'Eyebrow Shaping', description: 'Golden ratio arch mapping according to client face shape.', thumbnail: '', display_order: 4, lessons: [] },
    ],
  },
  {
    id: 'stylist-cat-7',
    role: 'stylist',
    name: 'Manicure & Pedicure',
    description: 'Cuticle care, dead skin scrubbing, heel buffing, nail shaping and reflexology massage.',
    thumbnail: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80',
    icon: 'Heart',
    display_order: 7,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'stylist-sub-7-1', category_id: 'stylist-cat-7', role: 'stylist', name: 'Basic Manicure', description: 'Soaking, shaping, buffing, cuticle oil, hand massage.', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'stylist-sub-7-2', category_id: 'stylist-cat-7', role: 'stylist', name: 'Basic Pedicure', description: 'Warm foot soak with Epsom salt, pumice stone heel scrubbing.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'stylist-sub-7-3', category_id: 'stylist-cat-7', role: 'stylist', name: 'Nail Cleaning', description: 'Under-nail sanitization, cuticle pusher and nipper handling.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'stylist-sub-7-4', category_id: 'stylist-cat-7', role: 'stylist', name: 'Nail Care', description: 'Nail strengthening treatments, cuticle hydration.', thumbnail: '', display_order: 4, lessons: [] },
      { id: 'stylist-sub-7-5', category_id: 'stylist-cat-7', role: 'stylist', name: 'Hand and Foot Massage', description: 'Pressure points for relaxation and tension relief.', thumbnail: '', display_order: 5, lessons: [] },
    ],
  },
  {
    id: 'stylist-cat-8',
    role: 'stylist',
    name: 'Bridal Services',
    description: 'Complete royal bridal package: skin prep, luxury couture makeup, dupatta draping, jewelry setting.',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    icon: 'Crown',
    display_order: 8,
    created_at: new Date().toISOString(),
    subcategories: [
      { id: 'stylist-sub-8-1', category_id: 'stylist-cat-8', role: 'stylist', name: 'Bridal Preparation', description: 'Pre-bridal consultation, bridal calendar scheduling (7 days before).', thumbnail: '', display_order: 1, lessons: [] },
      { id: 'stylist-sub-8-2', category_id: 'stylist-cat-8', role: 'stylist', name: 'Bridal Makeup', description: 'Royal Rajputi & North Indian bridal makeup execution.', thumbnail: '', display_order: 2, lessons: [] },
      { id: 'stylist-sub-8-3', category_id: 'stylist-cat-8', role: 'stylist', name: 'Bridal Hairstyling', description: 'Bridal floral bun with fresh jasmine gajra and matha patti pinning.', thumbnail: '', display_order: 3, lessons: [] },
      { id: 'stylist-sub-8-4', category_id: 'stylist-cat-8', role: 'stylist', name: 'Bridal Skin Preparation', description: 'Hydra-boost facial and 24K gold serum infusion 48 hrs before.', thumbnail: '', display_order: 4, lessons: [] },
      { id: 'stylist-sub-8-5', category_id: 'stylist-cat-8', role: 'stylist', name: 'Complete Bridal Package', description: 'Dupatta draping, safety pinning, touch-up kit handover.', thumbnail: '', display_order: 5, lessons: [] },
    ],
  },
];

// ── Default Seed Data for Assignments ─────────────────────────────────────
const DEFAULT_ASSIGNMENTS: TrainingAssignment[] = [
  {
    id: 'assign-assoc-all',
    role: 'associate',
    course_name: 'Core Associate Onboarding & Etiquette',
    assignee_type: 'all',
    is_mandatory: true,
    start_date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: 'assign-stylist-all',
    role: 'stylist',
    course_name: 'BlindGlow Elite Stylist Certification 2026',
    assignee_type: 'all',
    is_mandatory: true,
    start_date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 21).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

const STORAGE_KEYS = {
  ASSOCIATE_CATEGORIES: 'satguru_training_associate_categories',
  STYLIST_CATEGORIES: 'satguru_training_stylist_categories',
  ASSIGNMENTS: 'satguru_training_assignments',
  PROGRESS: 'satguru_training_progress',
};

export const trainingService = {
  // ── Load Categories & Hierarchy ──────────────────────────────────────────
  getCategories(role: TargetRole): CourseCategory[] {
    const key = role === 'associate' ? STORAGE_KEYS.ASSOCIATE_CATEGORIES : STORAGE_KEYS.STYLIST_CATEGORIES;
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const defaults = role === 'associate' ? DEFAULT_ASSOCIATE_CATEGORIES : DEFAULT_STYLIST_CATEGORIES;
    this.saveCategories(role, defaults);
    return defaults;
  },

  saveCategories(role: TargetRole, categories: CourseCategory[]) {
    const key = role === 'associate' ? STORAGE_KEYS.ASSOCIATE_CATEGORIES : STORAGE_KEYS.STYLIST_CATEGORIES;
    localStorage.setItem(key, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('satguru:training_updated', { detail: { role } }));
  },

  // ── Category Operations ──────────────────────────────────────────────────
  addCategory(role: TargetRole, data: Partial<CourseCategory>): CourseCategory {
    const categories = this.getCategories(role);
    const newCat: CourseCategory = {
      id: `${role}-cat-${Date.now()}`,
      role,
      name: data.name || 'New Category',
      description: data.description || '',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
      icon: data.icon || 'Sparkles',
      display_order: categories.length + 1,
      subcategories: [],
      created_at: new Date().toISOString(),
    };
    categories.push(newCat);
    this.saveCategories(role, categories);
    return newCat;
  },

  updateCategory(role: TargetRole, categoryId: string, updates: Partial<CourseCategory>) {
    const categories = this.getCategories(role);
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx >= 0) {
      categories[idx] = { ...categories[idx], ...updates };
      this.saveCategories(role, categories);
    }
  },

  deleteCategory(role: TargetRole, categoryId: string) {
    let categories = this.getCategories(role);
    categories = categories.filter(c => c.id !== categoryId);
    this.saveCategories(role, categories);
  },

  reorderCategories(role: TargetRole, reordered: CourseCategory[]) {
    const updated = reordered.map((cat, i) => ({ ...cat, display_order: i + 1 }));
    this.saveCategories(role, updated);
  },

  // ── Subcategory Operations ───────────────────────────────────────────────
  addSubcategory(role: TargetRole, categoryId: string, data: Partial<CourseSubcategory>): CourseSubcategory {
    const categories = this.getCategories(role);
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) throw new Error('Category not found');

    const newSub: CourseSubcategory = {
      id: `${role}-sub-${Date.now()}`,
      category_id: categoryId,
      role,
      name: data.name || 'New Subcategory',
      description: data.description || '',
      thumbnail: data.thumbnail || cat.thumbnail || '',
      display_order: cat.subcategories.length + 1,
      lessons: [],
    };
    cat.subcategories.push(newSub);
    this.saveCategories(role, categories);
    return newSub;
  },

  updateSubcategory(role: TargetRole, categoryId: string, subcategoryId: string, updates: Partial<CourseSubcategory>) {
    const categories = this.getCategories(role);
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const subIdx = cat.subcategories.findIndex(s => s.id === subcategoryId);
    if (subIdx >= 0) {
      cat.subcategories[subIdx] = { ...cat.subcategories[subIdx], ...updates };
      this.saveCategories(role, categories);
    }
  },

  deleteSubcategory(role: TargetRole, categoryId: string, subcategoryId: string) {
    const categories = this.getCategories(role);
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    cat.subcategories = cat.subcategories.filter(s => s.id !== subcategoryId);
    this.saveCategories(role, categories);
  },

  // ── Lesson Operations ────────────────────────────────────────────────────
  addLesson(role: TargetRole, categoryId: string, subcategoryId: string, data: Partial<CourseLesson>): CourseLesson {
    const categories = this.getCategories(role);
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) throw new Error('Category not found');
    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (!sub) throw new Error('Subcategory not found');

    const newLesson: CourseLesson = {
      id: `${role}-les-${Date.now()}`,
      subcategory_id: subcategoryId,
      category_id: categoryId,
      role,
      title: data.title || 'New Lesson',
      description: data.description || '',
      video_url: data.video_url || 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      duration_minutes: data.duration_minutes || 15,
      step_by_step: Array.isArray(data.step_by_step) ? data.step_by_step : [],
      required_tools: Array.isArray(data.required_tools) ? data.required_tools : [],
      important_tips: Array.isArray(data.important_tips) ? data.important_tips : [],
      safety_hygiene: Array.isArray(data.safety_hygiene) ? data.safety_hygiene : [],
      before_after_care: Array.isArray(data.before_after_care) ? data.before_after_care : [],
      sequence: sub.lessons.length + 1,
      is_published: data.is_published ?? true,
      created_at: new Date().toISOString(),
    };
    sub.lessons.push(newLesson);
    this.saveCategories(role, categories);
    return newLesson;
  },

  updateLesson(role: TargetRole, categoryId: string, subcategoryId: string, lessonId: string, updates: Partial<CourseLesson>) {
    const categories = this.getCategories(role);
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (!sub) return;
    const lIdx = sub.lessons.findIndex(l => l.id === lessonId);
    if (lIdx >= 0) {
      sub.lessons[lIdx] = { ...sub.lessons[lIdx], ...updates };
      this.saveCategories(role, categories);
    }
  },

  deleteLesson(role: TargetRole, categoryId: string, subcategoryId: string, lessonId: string) {
    const categories = this.getCategories(role);
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (!sub) return;
    sub.lessons = sub.lessons.filter(l => l.id !== lessonId);
    this.saveCategories(role, categories);
  },

  // ── Assignments ──────────────────────────────────────────────────────────
  getAssignments(): TrainingAssignment[] {
    const local = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(DEFAULT_ASSIGNMENTS));
    return DEFAULT_ASSIGNMENTS;
  },

  addAssignment(data: Omit<TrainingAssignment, 'id' | 'created_at'>): TrainingAssignment {
    const assignments = this.getAssignments();
    const newAssign: TrainingAssignment = {
      ...data,
      id: `assign-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    assignments.unshift(newAssign);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    window.dispatchEvent(new CustomEvent('satguru:training_updated'));
    return newAssign;
  },

  deleteAssignment(id: string) {
    let assignments = this.getAssignments();
    assignments = assignments.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    window.dispatchEvent(new CustomEvent('satguru:training_updated'));
  },

  // ── Progress Tracking ────────────────────────────────────────────────────
  getAllProgress(): LessonProgress[] {
    const local = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (local) {
      try { return JSON.parse(local); } catch {}
    }
    return [];
  },

  getEmployeeProgress(employeeId: string, role: TargetRole): LessonProgress[] {
    const all = this.getAllProgress();
    return all.filter(p => (p.employee_id === employeeId || !employeeId) && p.employee_role === role);
  },

  saveLessonProgress(progress: Partial<LessonProgress> & { employee_id: string; employee_role: TargetRole; lesson_id: string }) {
    const all = this.getAllProgress();
    const idx = all.findIndex(p => p.employee_id === progress.employee_id && p.lesson_id === progress.lesson_id);
    const updated: LessonProgress = {
      employee_id: progress.employee_id,
      employee_role: progress.employee_role,
      lesson_id: progress.lesson_id,
      watched_seconds: progress.watched_seconds ?? 0,
      video_duration: progress.video_duration ?? 0,
      completed: progress.completed ?? false,
      completed_at: progress.completed ? (progress.completed_at || new Date().toISOString()) : undefined,
      last_resumed_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updated };
    } else {
      all.push(updated);
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('satguru:training_progress_updated'));
  },

  markLessonComplete(employeeId: string, role: TargetRole, lessonId: string) {
    this.saveLessonProgress({
      employee_id: employeeId,
      employee_role: role,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    });
  },

  // Calculate employee overall stats
  getEmployeeStats(employeeId: string, role: TargetRole) {
    const categories = this.getCategories(role);
    let totalLessons = 0;
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        totalLessons += (sub.lessons || []).length;
      });
    });

    const empProgress = this.getEmployeeProgress(employeeId, role);
    const completedLessons = empProgress.filter(p => p.completed).length;
    const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      pendingLessons: Math.max(0, totalLessons - completedLessons),
      completionPercentage,
    };
  },

  markAllTrainingComplete(employeeId: string, role: TargetRole) {
    const categories = this.getCategories(role);
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        (sub.lessons || []).forEach(lesson => {
          this.markLessonComplete(employeeId, role, lesson.id);
        });
      });
    });
    window.dispatchEvent(new CustomEvent('satguru:training_progress_updated'));
    window.dispatchEvent(new CustomEvent('satguru:partner_requests_updated'));
  },

  isTrainingCompleted(employeeId: string, role: TargetRole): boolean {
    const stats = this.getEmployeeStats(employeeId, role);
    return stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons;
  },
};

