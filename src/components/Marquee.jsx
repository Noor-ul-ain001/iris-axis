import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion'
import { LogoMark } from './Logo'

const WORDS = [
  'Remote CCTV Monitoring',
  'Trained Human Attention',
  'Timely Incident Reporting',
  'Authorized Access Only',
  'After-Hours Coverage',
  'Clear Escalation Procedures',
]

// Infinite ticker whose speed and direction react to scroll velocity.
export default function Marquee() {
  const root = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const track = root.current.querySelector('.marquee-track')
      const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 })
      let dir = 1
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          if (self.direction !== dir) {
            dir = self.direction
            gsap.to(loop, { timeScale: dir, duration: 0.6, overwrite: true })
          }
          const boost = Math.min(Math.abs(self.getVelocity()) / 400, 5)
          gsap.fromTo(loop, { timeScale: dir * (1 + boost) }, { timeScale: dir, duration: 1.2, ease: 'power2.out', overwrite: true })
        },
      })
      gsap.to('.marquee-mark', { rotation: 360, duration: 8, ease: 'none', repeat: -1 })
    },
    { scope: root },
  )

  return (
    <section className="marquee" ref={root} aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div className="marquee-group" key={k}>
            {WORDS.map((w, i) => (
              <span key={w} className={i % 2 ? 'is-outline' : ''}>
                {w}
                <LogoMark size={26} className="marquee-mark" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
