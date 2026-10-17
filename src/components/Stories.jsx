import { useRef } from 'react'
import { useReveal } from '../lib/useReveal'

// Placeholders straight from the design; swap in approved client testimonials.
const STORIES = [1, 2, 3].map((n) => ({
  label: 'Placeholder · replace before publishing',
  text: `Approved customer testimonial #${n} goes here: challenge, monitoring solution, and verified outcome.`,
}))

export default function Stories() {
  const root = useRef(null)
  useReveal(root)

  return (
    <section className="section stories" ref={root}>
      <div className="container">
        <p className="eyebrow mono" data-scramble>
          Client stories
        </p>
        <h2 className="h2" data-split>
          Real feedback, published <span className="grad">with permission.</span>
        </h2>
        <div className="stories-grid">
          {STORIES.map((s, i) => (
            <figure className="card glow-card story" key={i} data-reveal data-tilt="5">
              <span className="story-quote">“</span>
              <p className="story-label mono">{s.label}</p>
              <blockquote>{s.text}</blockquote>
              <figcaption>
                <span className="story-avatar" />
                <span>
                  [Name], [Role]
                  <small>[Company]</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
