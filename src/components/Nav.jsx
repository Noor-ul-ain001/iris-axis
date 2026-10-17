import { useEffect, useState } from 'react'
import Logo from './Logo'
import { scrollToTarget } from '../lib/motion'

const LINKS = [
  ['About', '#about'],
  ['Services', '#services'],
  ['How It Works', '#how'],
  ['Pricing', '#pricing'],
  ['Trust', '#trust'],
  ['FAQs', '#faq'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > 400 && y > last + 2)
      if (y < last - 2) setHidden(false)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const sections = LINKS.map(([, href]) => document.querySelector(href)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive('#' + e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
  }, [open])

  const go = (href) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !open ? 'is-hidden' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container nav-inner">
        <a href="#top" onClick={go('#top')} aria-label="IRIS AXIS home">
          <Logo />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} onClick={go(href)} className={active === href ? 'is-active' : ''}>
              <span className="roll">
                <span data-text={label}>{label}</span>
              </span>
            </a>
          ))}
        </nav>
        <a href="#contact" onClick={go('#contact')} className="btn btn-primary btn-sm nav-cta" data-magnetic="0.25">
          <span>Free Consultation</span>
        </a>
        <button
          className="nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className="nav-mobile">
        {LINKS.map(([label, href], i) => (
          <a key={label} href={href} onClick={go(href)} style={{ '--i': i }}>
            <span className="nav-mobile-num mono">0{i + 1}</span>
            {label}
          </a>
        ))}
        <a href="#contact" onClick={go('#contact')} className="btn btn-primary" style={{ '--i': LINKS.length }}>
          <span>Get a Free Consultation</span>
        </a>
      </div>
    </header>
  )
}
