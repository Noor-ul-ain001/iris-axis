import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/motion'
import { LogoMark } from './Logo'

// Scroll-scrubbed manifesto: words light up one by one as you scroll, while
// the brand mark turns slowly behind them.
const TEXT =
  'Empty sites invite trouble after dark. IRIS AXIS keeps trained eyes on your cameras through the hours that matter, and tells you clearly when something happens.'

const HIGHLIGHT = ['trained', 'eyes', 'clearly']

export default function Statement() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const split = SplitText.create('.statement-text', { type: 'words', wordsClass: 'st-word' })
      split.words.forEach((w) => {
        if (HIGHLIGHT.includes(w.textContent.replace(/[^a-z]/gi, '').toLowerCase())) w.classList.add('is-key')
      })
      gsap.fromTo(
        split.words,
        { opacity: 0.12, y: 12, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '.statement-text', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      )
      gsap.fromTo(
        '.statement-mark',
        { rotation: -60, scale: 0.8 },
        {
          rotation: 120,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      gsap.fromTo(
        '.statement-line',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'bottom 50%', scrub: true } },
      )
    },
    { scope: root },
  )

  return (
    <section className="statement" ref={root}>
      <LogoMark size={560} className="statement-mark" />
      <div className="container">
        <p className="eyebrow mono">Why IRIS AXIS</p>
        <p className="statement-text">{TEXT}</p>
        <span className="statement-line" />
      </div>
    </section>
  )
}
