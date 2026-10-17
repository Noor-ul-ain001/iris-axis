import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import Logo from './Logo'
import Icon from './Icon'
import { COMPANY_EMAIL } from '../lib/company'

const COMPANY = [
  ['About', '#about'],
  ['Services', '#services'],
  ['Pricing', '#pricing'],
  ['How It Works', '#how'],
  ['Trust & Security', '#trust'],
  ['FAQs', '#faq'],
]
const LEGAL = ['Contact', 'Privacy Policy', 'Terms & Conditions', 'Cookie Policy']

export default function Footer() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.footer-word span',
        { yPercent: 110, rotation: 8 },
        {
          yPercent: 0,
          rotation: 0,
          ease: 'none',
          stagger: 0.06,
          scrollTrigger: { trigger: '.footer-word', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
        },
      )
    },
    { scope: root },
  )

  const go = (href) => (e) => {
    e.preventDefault()
    scrollToTarget(href)
  }

  return (
    <footer className="footer" ref={root}>
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Professional remote CCTV monitoring for U.S. homes and businesses.</p>
            <a className="footer-mail" href={`mailto:${COMPANY_EMAIL}`}>
              <Icon name="mail" size={18} /> {COMPANY_EMAIL}
            </a>
          </div>
          <div className="footer-col">
            <p className="mono">Company</p>
            {COMPANY.map(([l, h]) => (
              <a key={l} href={h} onClick={go(h)}>
                <span>{l}</span>
              </a>
            ))}
          </div>
          <div className="footer-col">
            <p className="mono">Legal</p>
            {LEGAL.map((l) => (
              <a key={l} href={l === 'Contact' ? '#contact' : '#'} onClick={l === 'Contact' ? go('#contact') : undefined}>
                <span>{l}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="footer-word" aria-label="IRIS AXIS">
          {'IRIS AXIS'.split('').map((c, i) => (
            <span key={i} aria-hidden="true" className={i > 4 ? 'grad' : ''}>
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </div>

        <div className="footer-bar">
          <p>© 2026 IRIS AXIS. All rights reserved.</p>
          <a href="#top" onClick={go('#top')} className="footer-top-link" data-magnetic>
            Back to top <Icon name="arrow" size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}
