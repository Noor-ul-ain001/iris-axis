// Approved site copy, shared by the page sections and the assistant so both
// always say the same thing.

export const SERVICES = [
  {
    icon: 'eye',
    title: 'Remote CCTV Monitoring',
    text: 'Remote observation of authorized CCTV feeds during contracted monitoring hours.',
    points: ['Trained human attention', 'Agreed schedules'],
    img: '/img/cameras.jpg',
  },
  {
    icon: 'radar',
    title: 'Suspicious Activity Detection',
    text: 'Monitoring personnel look for potentially unusual activity and report concerns according to established procedures.',
    points: ['Documented observations', 'Defined escalation'],
    img: '/img/lens.jpg',
  },
  {
    icon: 'home',
    title: 'Residential Surveillance',
    text: 'Monitoring support for houses, apartments, driveways, garages, entrances and other authorized residential views.',
    points: ['Home-focused coverage', 'Family contact lists'],
    img: '/img/house.jpg',
  },
  {
    icon: 'building',
    title: 'Commercial Security Monitoring',
    text: 'Remote surveillance support for offices, shops, retail stores and commercial buildings.',
    points: ['Tailored workflows', 'Multi-site options'],
    img: '/img/office.jpg',
  },
  {
    icon: 'warehouse',
    title: 'Warehouse & Industrial',
    text: 'Monitoring support for storage facilities, warehouses, workshops and industrial properties.',
    points: ['Perimeter views', 'Loading-bay focus'],
    img: '/img/industrial.jpg',
  },
  {
    icon: 'moon',
    title: 'After-Hours Monitoring',
    text: 'Evening, overnight or other scheduled windows based on the selected package and staffing availability.',
    points: ['Flexible windows', 'Night-time focus'],
    img: '/img/city.jpg',
  },
]

export const PLANS = [
  {
    tier: 'Essential',
    price: 499,
    blurb: 'Smaller properties requiring limited monitoring.',
    features: [
      'Agreed number of authorized camera feeds',
      'Selected monitoring hours',
      'Basic suspicious activity reporting',
      'Standard email notifications',
      'Monthly monitoring summary',
      'Standard customer support',
    ],
    cta: 'Choose Essential',
  },
  {
    tier: 'Professional',
    price: 699,
    blurb: 'Homes and small to medium-sized businesses.',
    features: [
      'Expanded camera coverage',
      'Longer monitoring windows',
      'Priority incident notifications',
      'Designated contact procedures',
      'Detailed incident reports',
      'Regular service reviews',
      'Enhanced customer support',
    ],
    cta: 'Choose Professional',
    featured: true,
  },
  {
    tier: 'Enterprise',
    price: 899,
    blurb: 'Larger commercial facilities with complex requirements.',
    features: [
      'Multiple feeds or locations',
      'Customized monitoring schedules',
      'Detailed incident documentation',
      'Multi-contact notification workflows',
      'Dedicated account coordination',
      'Custom reporting',
      'Tailored escalation procedures',
    ],
    cta: 'Choose Enterprise',
  },
  {
    tier: 'Custom',
    price: 1199,
    blurb: 'Multi-site portfolios or unusual requirements.',
    features: ['Custom notification procedures', 'Agreed service levels', 'Personalized onboarding'],
    cta: 'Choose Custom',
  },
]

// Draft answers: have them reviewed against your actual service terms before launch.
export const FAQS = [
  ['Do I need to buy new CCTV cameras?', 'Usually not. We start by reviewing your existing cameras and recorder. If a camera cannot be accessed securely or the image is not usable, we will tell you during the consultation.'],
  ['How do I securely authorize camera access?', 'Access is set up with our team through a secure onboarding process. We never ask for camera passwords through this website or our assistant.'],
  ['Can you monitor my property overnight?', 'Yes. Monitoring windows, including evenings and overnight, are agreed as part of your package and depend on staffing availability.'],
  ['What happens when suspicious activity is detected?', 'The operator reviews the footage, then follows the escalation procedure you agreed during onboarding: who is contacted, in what order, and how the event is documented.'],
  ['Will I be notified of incidents?', 'Yes. Designated contacts are notified using the methods in your plan, and incidents are recorded in time-stamped reports.'],
  ['Can IRIS AXIS contact 911?', 'IRIS AXIS is a remote monitoring service, not an emergency responder. Whether and when authorities are contacted is defined in writing during onboarding.'],
  ['Does remote monitoring replace an on-site security guard?', 'Not always. Remote monitoring suits many properties at a lower cost, but some sites need physical presence. We will tell you honestly which fits your situation.'],
]

export const STEPS = [
  { icon: 'chat', title: 'Consultation', text: 'You explain your property type, existing cameras, monitoring requirements and budget.', hud: 'Scoping site' },
  { icon: 'lock', title: 'Secure Setup', text: 'You authorize the required camera access through an approved, secure onboarding process.', hud: 'Linking feeds' },
  { icon: 'activity', title: 'Remote Monitoring', text: 'Assigned personnel observe the agreed camera feeds according to the contracted schedule.', hud: 'Operators live' },
  { icon: 'file', title: 'Incident Reporting', text: 'Potential concerns are documented, reported to designated contacts and escalated per the agreed procedure.', hud: 'Report filed' },
]

export const PRACTICES = [
  'Explicit client authorization for camera access',
  'Least-privilege access',
  'Secure credential management',
  'Encryption where technically supported',
  'Confidentiality obligations for personnel',
  'Restricted access to camera feeds',
  'Documented incident handling',
  'Access revoked when service ends',
  'Transparent monitoring schedules',
  'Privacy-conscious procedures',
]

export const FLOW = [
  { icon: 'eye', title: 'Observe', text: 'Operator spots potential activity on an authorized feed.' },
  { icon: 'radar', title: 'Verify', text: 'Footage is reviewed against your site notes and schedule.' },
  { icon: 'bell', title: 'Notify', text: 'Designated contacts are alerted in the agreed order.' },
  { icon: 'file', title: 'Document', text: 'A time-stamped record is filed for your review.' },
]
