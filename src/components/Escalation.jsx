import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal, scramble } from '../lib/useReveal'
import Icon from './Icon'
import { FLOW } from '../lib/content'

const LOG = [
  ['22:14:07', 'CAM 02', 'Vehicle at gate · no action'],
  ['23:41:52', 'CAM 05', 'Person near loading bay · contact notified'],
  ['01:03:19', 'CAM 01', 'Motion: animal · logged'],
  ['02:27:44', 'CAM 03', 'Perimeter check · all clear'],
]

// Blips sit at fixed angles; their animation delay is tied to the sweep period
// so each one flares exactly as the beam passes over it.
const BLIPS = [
  { a: 40, r: 0.62 },
  { a: 128, r: 0.38 },
  { a: 215, r: 0.78 },
  { a: 300, r: 0.5 },
]
const SWEEP = 4

export default function Escalation() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.flow-line-fill', {
        scaleX: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.flow', start: 'top 80%', end: 'bottom 55%', scrub: 1 },
      })
      gsap.utils.toArray('.flow-step').forEach((el, i) =>
        ScrollTrigger.create({
          trigger: '.flow',
          start: `top+=${i * 40} 75%`,
          onEnter: () => el.classList.add('is-on'),
          onLeaveBack: () => el.classList.remove('is-on'),
        }),
      )
      const rows = gsap.utils.toArray('.log-row')
      gsap.set(rows, { opacity: 0, x: -16 })
      ScrollTrigger.create({
        trigger: '.log',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          rows.forEach((row, i) => {
            gsap.to(row, { opacity: 1, x: 0, duration: 0.6, delay: i * 0.45, ease: 'power3.out' })
            row.querySelectorAll('span').forEach((s) => scramble(s, { duration: 0.8, delay: i * 0.45 }))
          })
        },
      })
    },
    { scope: root },
  )

  return (
    <section className="section escalation" ref={root}>
      <div className="container">
        <div className="esc-grid">
          <div>
            <p className="eyebrow mono" data-scramble>
              Incident escalation
            </p>
            <h2 className="h2" data-split>
              When Every Second Matters, <span className="grad">Clear Procedures Matter.</span>
            </h2>
            <p className="lead" data-reveal>
              Before monitoring starts, we agree who gets contacted, in what order and for which kinds of events. When
              something needs attention, the procedure is already written down.
            </p>

            <div className="flow">
              <div className="flow-line">
                <span className="flow-line-fill" />
              </div>
              {FLOW.map((f) => (
                <div className="flow-step" key={f.title}>
                  <span className="flow-icon">
                    <Icon name={f.icon} size={20} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>

            <div className="notice" data-reveal>
              <Icon name="alert" size={22} />
              <p>
                IRIS AXIS is a remote monitoring service, not an emergency responder. Contact and response
                responsibilities are agreed in writing during onboarding.
              </p>
            </div>
          </div>

          <div className="esc-visual" data-reveal>
            <div className="radar card" data-glow>
              <div className="radar-scope" style={{ '--sweep': `${SWEEP}s` }}>
                <span className="radar-ring r1" />
                <span className="radar-ring r2" />
                <span className="radar-ring r3" />
                <span className="radar-cross" />
                <span className="radar-sweep" />
                {BLIPS.map((b, i) => {
                  const rad = ((b.a - 90) * Math.PI) / 180
                  return (
                    <span
                      key={i}
                      className="radar-blip"
                      style={{
                        left: `${50 + Math.cos(rad) * b.r * 50}%`,
                        top: `${50 + Math.sin(rad) * b.r * 50}%`,
                        animationDelay: `${(b.a / 360) * SWEEP}s`,
                      }}
                    />
                  )
                })}
                <span className="radar-label mono">SITE SCAN</span>
              </div>
            </div>

            <div className="log card" data-glow>
              <div className="log-head mono">
                <span>Incident log · Sample</span>
                <span className="log-live">
                  <span className="live-dot" /> Monitoring window active
                </span>
              </div>
              {LOG.map(([time, cam, text]) => (
                <div className="log-row mono" key={time}>
                  <span className="log-time">{time}</span>
                  <span className="log-cam">{cam}</span>
                  <span className="log-text">{text}</span>
                </div>
              ))}
              <p className="log-foot">Illustrative dashboard preview.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
