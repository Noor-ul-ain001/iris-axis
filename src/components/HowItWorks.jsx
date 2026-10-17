import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, isDesktop } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import IrisScene from './IrisScene'
import Icon from './Icon'
import { STEPS } from '../lib/content'

export default function HowItWorks() {
  const root = useRef(null)
  const progress = useRef(0)
  const [step, setStep] = useState(0)
  useReveal(root)

  useGSAP(
    () => {
      const pct = root.current.querySelector('.how-pct')
      const desktop = isDesktop()
      root.current.classList.toggle('is-static', !desktop)
      ScrollTrigger.create({
        trigger: root.current,
        // Phones: no pin (it fights touch scrolling). The 3D mark still plays
        // through its acts as the section passes.
        start: desktop ? 'top top' : 'top 80%',
        end: desktop ? '+=300%' : 'bottom 30%',
        pin: desktop ? '.how-pin' : false,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress
          setStep(Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length)))
          gsap.set('.how-progress-fill', { scaleY: self.progress })
          pct.textContent = String(Math.round(self.progress * 100)).padStart(3, '0') + '%'
        },
      })
    },
    { scope: root },
  )

  return (
    <section className="how" id="how" ref={root}>
      <div className="how-pin">
        <div className="how-glow" data-parallax="0.3" />
        <div className="container how-grid">
          <div className="how-copy">
            <p className="eyebrow mono" data-scramble>
              How it works
            </p>
            <h2 className="h2" data-split>
              Four clear steps from consultation to <span className="grad">coverage.</span>
            </h2>
            <div className="how-steps">
              <div className="how-progress">
                <span className="how-progress-fill" />
              </div>
              {STEPS.map((s, i) => (
                <article key={s.title} className={`how-step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
                  <span className="how-step-icon">
                    <Icon name={i < step ? 'check' : s.icon} size={20} />
                  </span>
                  <div>
                    <p className="how-step-num mono">Step 0{i + 1}</p>
                    <h3>{s.title}</h3>
                    <p className="how-step-text">
                      <span>{s.text}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="how-visual">
            <IrisScene progress={progress} />
            <div className="how-hud mono">
              <span key={step} className="how-hud-label">
                {STEPS[step].hud}
              </span>
              <span className="how-pct">000%</span>
              <span className="how-hud-step">0{step + 1} / 04</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
