import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import LivePanel from './LivePanel'
import Icon from './Icon'

const CARDS = [
  {
    icon: 'dollar',
    title: 'Affordable Security',
    text: 'Explore monitoring options designed to reduce costs compared with comparable traditional services.',
  },
  {
    icon: 'eye',
    title: 'Human-Assisted Monitoring',
    text: 'Trained personnel observe authorized camera feeds according to the agreed monitoring schedule.',
  },
  {
    icon: 'file',
    title: 'Clear, Documented Reporting',
    text: 'Potential concerns are documented and escalated to designated contacts per the agreed procedure.',
  },
]

export default function About() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.about-wall',
        { rotateX: 22, rotateY: -14, scale: 0.88, opacity: 0.3 },
        {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.about-wall', start: 'top 95%', end: 'top 35%', scrub: 1 },
        },
      )
    },
    { scope: root },
  )

  return (
    <section className="section about" id="about" ref={root}>
      <div className="container">
        <div className="about-grid">
          <div className="about-copy">
            <p className="eyebrow mono" data-scramble>
              About IRIS AXIS
            </p>
            <h2 className="h2" data-split>
              Security That Sees More. <span className="grad">Costs Less.</span>
            </h2>
            <p className="lead" data-reveal>
              IRIS AXIS was created with a simple idea: property owners deserve attentive, professional monitoring
              without paying for round-the-clock guards on site. Our team watches your authorized camera feeds,
              helping you make more informed security decisions.
            </p>
          </div>
          <div className="about-wall-stage" data-parallax="0.12">
            <div className="about-wall">
              <LivePanel />
            </div>
          </div>
        </div>

        <div className="about-cards">
          {CARDS.map((c) => (
            <article className="card glow-card" key={c.title} data-reveal data-tilt="6">
              <span className="icon-chip">
                <Icon name={c.icon} draw />
              </span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
