import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import Icon from './Icon'
import { LogoMark } from './Logo'

const PRACTICES = [
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

export default function Trust() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 961px)', () => {
        gsap.fromTo(
          '.practice',
          { xPercent: 18, opacity: 0.2 },
          { xPercent: 0, opacity: 1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: '.practices', start: 'top 90%', end: 'bottom 60%', scrub: 1 } },
        )
      })
      mm.add('(max-width: 960px)', () => {
        gsap.fromTo(
          '.practice',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.practices', start: 'top 85%', once: true } },
        )
      })
      gsap.to('.trust-mark', {
        rotation: 180,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section className="section trust" id="trust" ref={root}>
      <LogoMark size={640} className="trust-mark" />
      <div className="container trust-grid">
        <div className="trust-copy">
          <p className="eyebrow mono" data-scramble>
            Trust &amp; privacy
          </p>
          <h2 className="h2" data-split>
            Your Cameras. Your Privacy. <span className="grad">Our Responsibility.</span>
          </h2>
          <p className="lead" data-reveal>
            These are the practices we follow. Camera access is set up only through a secure onboarding process with
            our team. We never collect camera passwords through this website or our assistant. Access is revoked when
            your service ends.
          </p>
          <a
            href="#contact"
            className="btn btn-ghost"
            data-reveal
            data-magnetic
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget('#contact')
            }}
          >
            <span>Explore Our Security Practices</span>
          </a>
        </div>
        <ul className="practices">
          {PRACTICES.map((p) => (
            <li key={p} className="practice" data-glow>
              <Icon name="shield" size={20} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
