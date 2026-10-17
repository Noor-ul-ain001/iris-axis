import { useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/useReveal'

const INDUSTRIES = [
  { title: 'Construction', text: 'Protect equipment and materials between shifts.', img: '/img/construction.jpg', cam: '07' },
  { title: 'Property Management', text: 'Quiet nights for residents, fewer after-hours calls.', img: '/img/property.jpg', cam: '12' },
  { title: 'Residential', text: 'Driveways, garages and entrances watched while you sleep.', img: '/img/house.jpg', cam: '04' },
  { title: 'Auto Dealerships', text: 'Watch the lot while the showroom sleeps.', img: '/img/dealership.jpg', cam: '03' },
  { title: 'Retail', text: 'Cover closing hours and back-of-house.', img: '/img/retail.jpg', cam: '21' },
  { title: 'Industrial', text: 'Keep yards, docks and perimeters in view.', img: '/img/industrial.jpg', cam: '09' },
]

const MONO = 'grayscale(1) brightness(0.5) contrast(1.2)'
const COLOR = 'grayscale(0) brightness(0.92) contrast(1.05)'

export default function Industries() {
  const root = useRef(null)
  const [active, setActive] = useState(0)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      const cards = gsap.utils.toArray('.ind-card')

      // Desktop: pin and scroll the gallery sideways. Each card un-masks and
      // colourises as it reaches the centre, then fades back to mono as it leaves.
      mm.add('(min-width: 961px)', () => {
        const track = root.current.querySelector('.ind-track')
        const distance = () => track.scrollWidth - window.innerWidth
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setActive(Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1))))
              gsap.set('.ind-bar-fill', { scaleX: self.progress })
            },
          },
        })

        cards.forEach((card) => {
          const img = card.querySelector('img')
          const st = { trigger: card, containerAnimation: tween, scrub: true }
          gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { ...st, start: 'left right', end: 'right left' } })
          gsap.fromTo(
            card.querySelector('.ind-frame'),
            { clipPath: 'inset(12% 8% 12% 8% round 26px)', rotationY: -14, transformPerspective: 1200 },
            { clipPath: 'inset(0% 0% 0% 0% round 26px)', rotationY: 0, ease: 'none', scrollTrigger: { ...st, start: 'left right', end: 'left 45%' } },
          )
          gsap.fromTo(img, { filter: MONO }, { filter: COLOR, ease: 'none', scrollTrigger: { ...st, start: 'left 75%', end: 'center center' } })
          gsap.fromTo(
            img,
            { filter: COLOR },
            { filter: MONO, ease: 'none', immediateRender: false, scrollTrigger: { ...st, start: 'center center', end: 'right 15%' } },
          )
          gsap.fromTo(
            card.querySelectorAll('.ind-body > *'),
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { ...st, start: 'left 85%', end: 'left 40%' } },
          )
        })
      })

      // Mobile: vertical stack, each card un-masks and colourises as it scrolls in.
      mm.add('(max-width: 960px)', () => {
        cards.forEach((card) => {
          const img = card.querySelector('img')
          gsap.fromTo(
            card.querySelector('.ind-frame'),
            { clipPath: 'inset(10% 6% 10% 6% round 22px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'none', scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 50%', scrub: true } },
          )
          gsap.fromTo(
            img,
            { filter: MONO, scale: 1.2 },
            { filter: COLOR, scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top 90%', end: 'center center', scrub: true } },
          )
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="industries" id="industries" ref={root}>
      <div className="ind-inner">
        <div className="container ind-head">
          <div>
            <p className="eyebrow mono" data-scramble>
              Industries
            </p>
            <h2 className="h2" data-split>
              Built for sites that sit <span className="grad">empty at night.</span>
            </h2>
          </div>
          <div className="ind-meta">
            <span className="ind-count mono">
              <b key={active}>0{active + 1}</b> / 0{INDUSTRIES.length}
            </span>
            <span className="ind-now mono" key={`t${active}`}>
              {INDUSTRIES[active].title}
            </span>
            <div className="ind-bar" aria-hidden="true">
              <span className="ind-bar-fill" />
            </div>
          </div>
        </div>
        <div className="ind-ghost" aria-hidden="true">
          <span key={active}>{INDUSTRIES[active].title}</span>
        </div>
        <div className="ind-track">
          {INDUSTRIES.map((ind, i) => (
            <article className={`ind-card ${i % 2 ? 'is-low' : ''}`} key={ind.title} data-cursor="View">
              <div className="ind-frame">
                <img src={ind.img} alt={ind.title} />
                <span className="feed-scan" />
                <span className="ind-shade" />
                <span className="ind-cam mono">
                  <i /> CAM {ind.cam} · Live
                </span>
                <span className="ind-big mono">0{i + 1}</span>
                <span className="ind-corner tl" />
                <span className="ind-corner tr" />
                <span className="ind-corner bl" />
                <span className="ind-corner br" />
                <div className="ind-body">
                  <h3>{ind.title}</h3>
                  <p>{ind.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
