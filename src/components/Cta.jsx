import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import LeadForm from './LeadForm'
import Icon from './Icon'

const CONTACTS = [
  { icon: 'phone', label: 'Call', value: '[US VoIP NUMBER]' },
  { icon: 'pin', label: 'US virtual address', value: '[ADDRESS]' },
  { icon: 'pin', label: 'Pakistan office', value: '[ADDRESS]' },
]

export default function Cta() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.cta-box',
        { clipPath: 'inset(12% 8% 12% 8% round 40px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 24px)',
          ease: 'none',
          scrollTrigger: { trigger: '.cta-box', start: 'top 95%', end: 'top 40%', scrub: 1 },
        },
      )
    },
    { scope: root },
  )

  return (
    <section className="section cta" id="contact" ref={root}>
      <div className="container">
        <div className="cta-frame">
          <div className="cta-box" data-glow>
            <div className="cta-grid-bg" />
            <div className="cta-copy">
              <p className="eyebrow mono" data-scramble>
                Free consultation
              </p>
              <h2 className="h2" data-split>
                Let&apos;s Build a <span className="grad">Smarter Security Plan.</span>
              </h2>
              <p className="lead" data-reveal>
                Tell us about your property and cameras. We will help you explore a cost-effective remote monitoring
                solution.
              </p>
              <ul className="cta-contacts">
                {CONTACTS.map((c) => (
                  <li key={c.label} data-reveal>
                    <span className="icon-chip icon-chip-sm">
                      <Icon name={c.icon} size={18} />
                    </span>
                    <span>
                      <small>{c.label}</small>
                      {c.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="cta-form" data-reveal>
              <LeadForm submitLabel="Get a Free Consultation" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
