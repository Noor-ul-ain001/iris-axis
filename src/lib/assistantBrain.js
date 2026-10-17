import { SERVICES, PLANS, FAQS, STEPS, PRACTICES, FLOW } from './content'
import { COMPANY_EMAIL } from './company'
import { PROPERTY_TYPES } from './leads'

// Rule-based assistant. Every answer is assembled from the approved copy used on
// the page (services, plans, FAQs, onboarding steps, trust practices), so it
// cannot invent facts. Safety checks run before anything else on every message.

export const WELCOME =
  "Welcome to IRIS AXIS! I'm IRIS Assistant, your virtual security service guide. I can help you explore our remote CCTV monitoring services, compare packages, understand our onboarding process, and request a consultation. How can I help you today?"

export const REDACTED = 'Message hidden: it looked like it contained a password or access code.'

const CONSULT = { label: 'Open consultation form', go: '#contact' }
export const MAIN_CHIPS = ['Explain your services', 'Compare packages', 'Help me choose a package', 'How does onboarding work?', 'Privacy questions', 'Request a human follow-up']

const PRICE_NOTE =
  'Prices are illustrative demonstration rates in USD, not confirmed offers. Actual pricing depends on coverage, monitoring hours, camera count and operational requirements.'
const NO_CREDS =
  'IRIS AXIS never asks for camera passwords or access tokens through this website, this assistant or by email. Camera access is authorized only through a secure onboarding process with our team.'
const FAQ = FAQS.map(([, a]) => a)

const bot = (text, extra) => ({ from: 'bot', text, ...extra })
const reply = (messages, chips = MAIN_CHIPS, flow = null, extra) => ({ messages: [].concat(messages), chips, flow, ...extra })

const norm = (s) => s.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim()
const STOP = new Set('a an the i my me we you your is are do does can will to of for on in it and or what how when who with be this that if am our us iris axis'.split(' '))
const words = (s) => norm(s).replace(/[^a-z0-9\s]/g, ' ').split(' ').filter((w) => w.length > 2 && !STOP.has(w))

const serviceItem = (s) => ({ title: s.title, text: s.text, points: s.points })
const planItem = (p, full) => ({
  title: p.tier,
  meta: p.price ? `From $${p.price}/mo · illustrative` : 'Request a quote',
  text: p.blurb,
  points: full ? p.features : p.features.slice(0, 3),
})

/* ───────────── Safety ───────────── */

const URGENT = /\b(intruders?|break(ing)? ?in(to)?|broken into|being robbed|robbery|burglars? (is|are|in)|someone('s| is) (in|inside|breaking|trying)|fire|smoke|gun|shots?|shooting|attack(ed|ing)?|injured|hurt|bleeding|please help|send help|need help (now|urgently)|help me now|emergency)\b/
const POLICY_Q = /\b(can|do|does|will|would|could)\b.*\b(911|police|dispatch|emergency services|authorities|first responders)\b/
const NOWISH = /\b(intruders?|breaking|robbed|fire|smoke|gun|shots?|hurt|injured|bleeding|please help|send help|now|happening)\b/
const CRED_SHARE = /\b(password|passcode|passwd|pwd|pin|token|api key|key|login|username|user name)\b\s*(is|=|:|-)\s*\S+/
const CRED_TALK = /\b(password|passcode|passwd|credentials?|login details|access token|tokens?|api key|username)\b/

function emergency() {
  return reply(
    bot(
      'If this is an active emergency, contact your local emergency services right now. In the U.S., call 911.\n\nI am an AI assistant: I cannot see camera feeds, call 911 or dispatch help, and IRIS AXIS is a remote monitoring service, not an emergency responder. Please do not wait on this chat.',
      { tone: 'alert' },
    ),
    ['I am safe, back to questions'],
  )
}

/* ───────────── Guided flows ───────────── */

const REC_STEPS = {
  property: {
    ask: 'What kind of property do you want monitored?',
    options: ['Home or apartment', 'Small or medium business', 'Large commercial or industrial site', 'Multiple sites'],
    // Tested in this order so the more specific answers win.
    match: [
      [3, /\b(multiple|multi|several sites|many sites|portfolio|locations)\b/],
      [2, /\b(large|industrial|warehouse|facility|factory|plant)\b/],
      [0, /\b(home|house|apartment|residential|condo|family)\b/],
      [1, /\b(small|medium|business|shop|store|office|retail|restaurant)\b/],
    ],
  },
  coverage: {
    ask: 'How much camera coverage do you need?',
    options: ['A few key cameras', 'Expanded coverage', 'Many feeds or several locations'],
    match: [
      [2, /\b(many|lots|several locations|multiple|large|all)\b/],
      [1, /\b(expanded|moderate|more|medium|several)\b/],
      [0, /\b(few|key|small|limited|one|two|three|[1-4])\b/],
    ],
  },
  hours: {
    ask: 'When do you need monitoring?',
    options: ['Selected hours only (e.g. overnight)', 'Longer windows (evenings and overnight)', 'A customized schedule'],
    match: [
      [2, /\b(custom|customi[sz]ed|24|round|around the clock|all day|varies|different)\b/],
      [1, /\b(longer|extended|evenings?|weekends?)\b/],
      [0, /\b(selected|some|few hours|only|limited|overnight|night)\b/],
    ],
  },
}
const REC_ORDER = ['property', 'coverage', 'hours']

const LEAD_ASK = {
  name: 'What name should our team use?',
  email: 'What email address should they reply to?',
  phone: 'Phone number (optional). Type it, or tap Skip.',
  property: 'What type of property is this for?',
}

function prompt(flow) {
  if (flow.type === 'recommend') {
    const step = REC_STEPS[flow.step]
    return reply(bot(step.ask), step.options, flow)
  }
  if (flow.step === 'consent') {
    return reply(
      bot(
        `Before I take any details: I will ask for your name, email, an optional phone number and your property type. They are used only so the IRIS AXIS team can respond to your ${flow.reason}, and nothing else is collected. Please do not share camera passwords or access details.\n\nDo you agree to share these details for that purpose?`,
      ),
      ['I agree', 'No thanks'],
      flow,
    )
  }
  if (flow.step === 'confirm') {
    const d = flow.data
    return reply(
      bot('Please check your details:', {
        items: [{ title: d.name, points: [d.email, d.phone || 'No phone given', d.property] }],
      }),
      ['Send request', 'Start over', 'Cancel'],
      flow,
    )
  }
  const chips = flow.step === 'phone' ? ['Skip'] : flow.step === 'property' ? PROPERTY_TYPES : []
  return reply(bot(LEAD_ASK[flow.step]), chips, flow)
}

function pickOption(t, step) {
  const exact = step.options.findIndex((o) => norm(o) === t)
  if (exact !== -1) return exact
  const hit = step.match.find(([, re]) => re.test(t))
  return hit ? hit[0] : -1
}

function recommendStep(t, flow) {
  const step = REC_STEPS[flow.step]
  const pick = pickOption(t, step)
  if (pick === -1) return reply(bot(`Sorry, I did not catch that. ${step.ask}`), step.options, flow)

  const answers = { ...flow.answers, [flow.step]: pick }
  const next = REC_ORDER[REC_ORDER.indexOf(flow.step) + 1]
  if (next) return prompt({ type: 'recommend', step: next, answers })

  const tier = answers.property === 3 ? 'Custom' : ['Essential', 'Professional', 'Enterprise'][Math.max(answers.property, answers.coverage, answers.hours)]
  const plan = PLANS.find((p) => p.tier === tier)
  return reply(
    [
      bot(`Based on your answers, ${tier} looks like a good starting point.`, { items: [planItem(plan, true)] }),
      bot(`This is a suggestion, not a quote. ${PRICE_NOTE} The free consultation confirms the right fit.`),
    ],
    [CONSULT, 'Request a human follow-up', 'Compare packages'],
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s.-]{7,20}$/

function leadStep(raw, t, flow) {
  const data = { ...flow.data }
  const go = (step) => prompt({ ...flow, step, data })

  switch (flow.step) {
    case 'consent':
      if (/^(i agree|agree|yes|y|yeah|yep|sure|ok|okay)\b/.test(t)) return go('name')
      if (/^(no|nope|n|no thanks|don't|do not)\b/.test(t))
        return reply(bot(`No problem, nothing has been collected. You can still use the consultation form on this page or email ${COMPANY_EMAIL}.`), [CONSULT, ...MAIN_CHIPS.slice(0, 3)])
      return prompt(flow)
    case 'name':
      if (raw.length > 80 || EMAIL_RE.test(raw)) return reply(bot('Please enter just your name.'), [], flow)
      data.name = raw
      return go('email')
    case 'email':
      if (!EMAIL_RE.test(raw)) return reply(bot('That does not look like an email address. Please try again.'), [], flow)
      data.email = raw
      return go('phone')
    case 'phone':
      if (t !== 'skip') {
        if (!PHONE_RE.test(raw)) return reply(bot('Please enter a valid phone number, or tap Skip.'), ['Skip'], flow)
        data.phone = raw
      }
      return go('property')
    case 'property':
      if (raw.length > 60) return reply(bot('Please keep it short, or pick an option.'), PROPERTY_TYPES, flow)
      data.property = PROPERTY_TYPES.find((p) => norm(p) === t) || raw
      return go('confirm')
    case 'confirm':
      if (/^(send|yes|confirm|submit)/.test(t)) {
        return reply([], MAIN_CHIPS, null, { submit: { ...data, reason: flow.reason, source: 'assistant' } })
      }
      if (/^(start over|restart|edit)/.test(t)) return prompt({ ...flow, step: 'name', data: {} })
      return prompt(flow)
  }
}

export const submitted = (lead) =>
  reply(
    bot(
      `Thanks, ${lead.name}. Your ${lead.reason} has been submitted and the IRIS AXIS team will reply by email${lead.phone ? ' or phone' : ''}. I have cleared your details from this chat.`,
    ),
  )
export const submitFailed = () =>
  reply(bot(`Sorry, that did not go through. Please use the consultation form on this page or email ${COMPANY_EMAIL}.`), [CONSULT, 'Request a human follow-up'])

/* ───────────── Topics ───────────── */

const SERVICE_KEYS = [
  [/\b(homes?|houses?|apartments?|residential|driveways?|garages?)\b/, 'Residential Surveillance'],
  [/\b(offices?|shops?|retail|stores?|commercial)\b/, 'Commercial Security Monitoring'],
  [/\b(warehouses?|industrial|storage|workshops?|factory|factories)\b/, 'Warehouse & Industrial'],
  [/\b(after[- ]?hours)\b/, 'After-Hours Monitoring'],
  [/\b(suspicious|detect(ion)?|unusual activity)\b/, 'Suspicious Activity Detection'],
  [/\b(remote cctv|cctv monitoring|remote monitoring)\b/, 'Remote CCTV Monitoring'],
]

const TOPICS = [
  {
    test: /\b(are you|is this) (a |an )?(human|real|person|bot|robot|ai|machine|automated)\b|\bwho (are you|am i talking)\b|\bwhat are you\b/,
    run: () =>
      reply(
        bot(
          'I am IRIS Assistant, an AI assistant, not a person. I answer using IRIS AXIS\'s approved service information. If you would like to speak with someone from our team, I can arrange a human follow-up.',
        ),
        ['Request a human follow-up', ...MAIN_CHIPS.slice(0, 3)],
      ),
  },
  {
    test: /\b(human|real person|agent|representative|someone from|call me|call back|follow[- ]?up|speak (to|with)|talk (to|with))\b/,
    run: () => prompt({ type: 'lead', step: 'consent', reason: 'follow-up request', data: {} }),
  },
  {
    test: /\b(watching|watch|see|view|looking at|monitoring) (my|our|the) (cameras?|feeds?|cctv|property|house|home|footage)\b|\b(are|is) (you|someone|anyone) (watching|monitoring)\b|\blive feeds?\b|\bcan you see\b/,
    run: () =>
      reply(
        bot(
          'No. I am an AI assistant and I cannot see any camera feeds; I have no access to cameras at all.\n\nWith the IRIS AXIS service, assigned personnel observe only the camera feeds you authorize during onboarding, and only during your contracted monitoring hours.',
        ),
      ),
  },
  {
    test: /\b(guarantee[sd]?|promise|100 ?%|prevent|stop (theft|crime|burglar|break)|catch (thieves|burglars|criminals)|will .* (catch|stop|prevent))\b/,
    run: () =>
      reply([
        bot(
          'I cannot promise a specific security outcome, and no monitoring service can guarantee that incidents will be prevented.\n\nWhat IRIS AXIS provides is trained personnel observing your authorized feeds during agreed hours, documented reporting, and escalation to your designated contacts using the procedure agreed during onboarding.',
        ),
        bot(FAQ[6]),
      ]),
  },
  {
    test: /\b(recommend|suggest|which (plan|package|tier|one)|best (plan|package|option)|right (plan|package|for me)|suit(able|s)?|help me choose|choose a package)\b/,
    run: () => {
      const r = prompt({ type: 'recommend', step: 'property', answers: {} })
      r.messages.unshift(bot('Happy to help. Three quick questions and I will point you to a package.'))
      return r
    },
  },
  {
    test: new RegExp(`\\b(${PLANS.map((p) => p.tier.toLowerCase()).join('|')})\\b`),
    run: (t) => {
      const plan = PLANS.find((p) => t.includes(p.tier.toLowerCase()))
      return reply([bot(`Here is the ${plan.tier} package:`, { items: [planItem(plan, true)] }), bot(PRICE_NOTE)], [CONSULT, 'Compare packages', 'Help me choose a package'])
    },
  },
  {
    test: /\b(price|prices|pricing|cost|costs|how much|packages?|plans?|tiers?|compare|comparison|cheap|afford|budget|fee|monthly)\b/,
    run: () =>
      reply(
        [
          bot('Here is how our packages compare. We target savings of up to around 50% versus comparable traditional monitoring.', {
            items: PLANS.map((p) => planItem(p, false)),
          }),
          bot(PRICE_NOTE),
        ],
        ['Help me choose a package', 'Tell me about Professional', CONSULT],
      ),
  },
  {
    test: /\b(onboard(ing)?|set ?up|get(ting)? started|sign ?up|how (does|do) (it|this|you) work|process|install|connect|authori[sz]e|new cameras?|existing cameras?|buy cameras?|recorder|dvr|nvr)\b/,
    run: () =>
      reply(
        [
          bot('Getting started takes four steps:', {
            items: STEPS.map((s, i) => ({ title: `${i + 1}. ${s.title}`, text: s.text })),
          }),
          bot(`${FAQ[0]}\n\n${NO_CREDS} Access is revoked when your service ends.`),
        ],
        [CONSULT, 'Privacy questions', 'Compare packages'],
      ),
  },
  {
    test: /\b(privacy|private|personal data|data|recordings?|recorded|stored|footage|who can see|encrypt(ion|ed)?|confidential|revoke|delete|gdpr|ccpa|share my)\b/,
    run: () =>
      reply(
        [
          bot('These are the security and privacy practices IRIS AXIS follows:', { items: [{ title: 'Trust & privacy', points: PRACTICES }] }),
          bot(
            `${NO_CREDS}\n\nAbout this chat: it is not saved, and I only collect contact details if you ask for a follow-up and agree first.`,
          ),
        ],
        ['How does onboarding work?', 'Request a human follow-up', ...MAIN_CHIPS.slice(0, 2)],
      ),
  },
  {
    test: /\b(replace|instead of|need|versus|vs)\b.*\bguards?\b|\bon[- ]site (security )?guards?\b/,
    run: () => reply(bot(FAQ[6]), ['Explain monitoring schedules', 'Help me choose a package', CONSULT]),
  },
  {
    test: /\b(schedules?|hours|24 ?\/ ?7|24 hours|round[- ]the[- ]clock|overnight|weekends?|nights?|evenings?|when do you monitor|limitations?|limits?|can'?t (you )?do|cannot|replace|on[- ]site|guards?)\b/,
    run: () =>
      reply(
        [
          bot(`${FAQ[2]} Coverage by package:`, {
            items: [
              { title: 'Essential', text: 'Selected monitoring hours.' },
              { title: 'Professional', text: 'Longer monitoring windows.' },
              { title: 'Enterprise and Custom', text: 'Customized monitoring schedules and agreed service levels.' },
            ],
          }),
          bot('Service limitations to know:', {
            items: [
              {
                title: 'What remote monitoring does not do',
                points: [
                  'Monitoring covers only authorized camera feeds, during contracted hours.',
                  'IRIS AXIS is a remote monitoring service, not an emergency responder. Contact and response responsibilities are agreed in writing during onboarding.',
                  'It cannot guarantee that incidents will be prevented.',
                  'If a camera cannot be accessed securely or the image is not usable, we will tell you during the consultation.',
                  'It does not always replace an on-site guard. Some sites need physical presence.',
                ],
              },
            ],
          }),
        ],
        ['Help me choose a package', 'Compare packages', CONSULT],
      ),
  },
  {
    test: /\b(911|police|dispatch|emergency services|authorities|first responders)\b/,
    run: () =>
      reply(
        bot(
          `${FAQ[5]}\n\nI cannot contact anyone on your behalf either. If you ever face an active emergency, contact local emergency services directly (911 in the U.S.).`,
        ),
      ),
  },
  {
    test: /\b(notif(y|ied|ication)s?|alerts?|incidents?|reports?|escalat(e|ion)|what happens)\b/,
    run: () =>
      reply(
        [
          bot(FAQ[3], { items: FLOW.map((f) => ({ title: f.title, text: f.text })) }),
          bot(FAQ[4]),
        ],
        ['Explain monitoring schedules', 'Compare packages', CONSULT],
      ),
  },
  {
    test: /\b(e-?mail|contact|reach (you|out)|get in touch|phone number|address)\b/,
    run: () =>
      reply(
        bot(`You can reach the IRIS AXIS team at ${COMPANY_EMAIL}. Please do not send camera passwords by email; access is set up through secure onboarding.`),
        ['Request a human follow-up', CONSULT, ...MAIN_CHIPS.slice(0, 2)],
      ),
  },
  {
    test: /\b(consult(ation)?|book|demo|quote|appointment|meeting|form)\b/,
    run: () =>
      reply(
        bot(
          'The free consultation form is on this page. You share your name, email, phone and property type, and the team plans your consultation around your property, existing cameras, requirements and budget.',
        ),
        [CONSULT, 'Request a human follow-up'],
      ),
  },
  {
    test: new RegExp(SERVICE_KEYS.map(([re]) => re.source).join('|')),
    run: (t) => {
      const titles = SERVICE_KEYS.filter(([re]) => re.test(t)).map(([, title]) => title)
      return reply(bot('Here is how we can help:', { items: SERVICES.filter((s) => titles.includes(s.title)).map(serviceItem) }), [
        'Explain your services',
        'Help me choose a package',
        CONSULT,
      ])
    },
  },
  {
    test: /\b(services?|offer(ing)?s?|what (do|can) you do|what does iris|features?)\b/,
    run: () =>
      reply(
        [
          bot('IRIS AXIS offers six monitoring services. Every service runs on authorized access, agreed schedules and documented procedures.', {
            items: SERVICES.map(serviceItem),
          }),
        ],
        ['Compare packages', 'Explain monitoring schedules', 'Help me choose a package'],
      ),
  },
]

function matchFaq(t) {
  const asked = words(t)
  let best = null
  let score = 0
  for (const [q, a] of FAQS) {
    const qs = new Set(words(q))
    const s = asked.filter((w) => qs.has(w)).length
    if (s > score) [best, score] = [a, s]
  }
  return score >= 2 ? best : null
}

/* ───────────── Entry point ───────────── */

// Returns { messages, chips, flow, redact?, submit? }.
export function respond(raw, flow) {
  const t = norm(raw)

  // Credentials are never kept, even in the visible transcript.
  if (CRED_SHARE.test(t)) {
    const warn = bot(
      `Please do not share passwords, PINs or access codes here. I have hidden that message. ${NO_CREDS} Nothing typed here is saved, but it is good practice to change any password you have typed somewhere unexpected.`,
      { tone: 'warn' },
    )
    if (!flow) return reply(warn, ['How does onboarding work?', 'Privacy questions'], null, { redact: true })
    const r = prompt(flow)
    return { ...r, messages: [warn, ...r.messages], redact: true }
  }

  if (!(POLICY_Q.test(t) && !NOWISH.test(t)) && URGENT.test(t)) return emergency()

  if (flow && /^(cancel|stop|quit|exit|never ?mind)\b/.test(t)) {
    return reply(bot(flow.type === 'lead' ? 'Cancelled. Nothing has been collected.' : 'No problem. What else can I help with?'))
  }
  if (flow?.type === 'recommend') return recommendStep(t, flow)
  if (flow?.type === 'lead') return leadStep(raw.trim(), t, flow)

  if (CRED_TALK.test(t)) {
    return reply(
      bot(
        `No, and you should never need to share them. ${NO_CREDS} It uses least-privilege access and secure credential management, and access is revoked when your service ends.`,
      ),
      ['How does onboarding work?', 'Privacy questions', CONSULT],
    )
  }

  if (/^i am safe/.test(t)) return reply(bot('Glad to hear it. What would you like to know?'))
  if (/\b(thanks?|thank you|thx|appreciate)\b/.test(t)) return reply(bot('You are welcome. Anything else I can help with?'))
  if (/^(bye|goodbye|see you|that's all|that is all)\b/.test(t)) return reply(bot('Thanks for visiting IRIS AXIS. Take care.'), [CONSULT])

  for (const topic of TOPICS) if (topic.test.test(t)) return topic.run(t)

  const faq = matchFaq(t)
  if (faq) return reply(bot(faq))

  if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening)|salam|assalam)/.test(t)) return reply(bot('Hello! What would you like to know about IRIS AXIS?'))

  return reply(
    bot(
      'I am an AI assistant and I only answer using IRIS AXIS\'s approved information, so I do not have an answer for that. I can explain our services, packages, schedules, onboarding and privacy, or our team can help directly.',
    ),
    [...MAIN_CHIPS.slice(0, 5), 'Request a human follow-up'],
  )
}
