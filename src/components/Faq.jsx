import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import Icon from './Icon'
import { FAQS } from '../lib/content'

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
