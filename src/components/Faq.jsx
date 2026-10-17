import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import Icon from './Icon'

// Draft answers: have them reviewed against your actual service terms before launch.
const FAQS = [
  ['Do I need to buy new CCTV cameras?', 'Usually not. We start by reviewing your existing cameras and recorder. If a camera cannot be accessed securely or the image is not usable, we will tell you during the consultation.'],
  ['How do I securely authorize camera access?', 'Access is set up with our team through a secure onboarding process. We never ask for camera passwords through this website or our assistant.'],
  ['Can you monitor my property overnight?', 'Yes. Monitoring windows, including evenings and overnight, are agreed as part of your package and depend on staffing availability.'],
  ['What happens when suspicious activity is detected?', 'The operator reviews the footage, then follows the escalation procedure you agreed during onboarding: who is contacted, in what order, and how the event is documented.'],
  ['Will I be notified of incidents?', 'Yes. Designated contacts are notified using the methods in your plan, and incidents are recorded in time-stamped reports.'],
  ['Can IRIS AXIS contact 911?', 'IRIS AXIS is a remote monitoring service, not an emergency responder. Whether and when authorities are contacted is defined in writing during onboarding.'],
  ['Does remote monitoring replace an on-site security guard?', 'Not always. Remote monitoring suits many properties at a lower cost, but some sites need physical presence. We will tell you honestly which fits your situation.'],
]

function Item({ q, a, open, onToggle, i }) {
  const body = useRef(null)

  useGSAP(
    () => {
      const el = body.current
      if (prefersReducedMotion()) {
        el.style.height = open ? 'auto' : '0px'
        return
      }
      gsap.to(el, { height: open ? 'auto' : 0, duration: 0.6, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() })
      gsap.to(el.firstChild, { y: open ? 0 : -10, opacity: open ? 1 : 0, duration: 0.5, delay: open ? 0.08 : 0 })
    },
    { dependencies: [open] },
  )

  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`} data-reveal data-glow>
      <button className="faq-q" aria-expanded={open} aria-controls={`faq-${i}`} onClick={onToggle}>
        <span className="faq-num mono">0{i + 1}</span>
        <span className="faq-text">{q}</span>
        <span className="faq-icon">
          <Icon name="chevron" size={20} />
        </span>
      </button>
      <div className="faq-a" id={`faq-${i}`} ref={body} style={{ height: 0 }}>
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function Faq() {
  const root = useRef(null)
  const [open, setOpen] = useState(0)
  useReveal(root)

  return (
    <section className="section faq" id="faq" ref={root}>
      <div className="container faq-grid">
        <div className="faq-copy">
          <p className="eyebrow mono" data-scramble>
            FAQs
          </p>
          <h2 className="h2" data-split>
            Questions, <span className="grad">answered.</span>
          </h2>
          <p className="lead" data-reveal>
            Still unsure about something? Ask our assistant or book a free consultation.
          </p>
        </div>
        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <Item key={q} q={q} a={a} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
