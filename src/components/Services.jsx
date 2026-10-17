import { useRef } from 'react'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import Icon from './Icon'

const SERVICES = [
  {
    icon: 'eye',
    title: 'Remote CCTV Monitoring',
    text: 'Remote observation of authorized CCTV feeds during contracted monitoring hours.',
    points: ['Trained human attention', 'Agreed schedules'],
    img: '/img/cameras.jpg',
  },
  {
    icon: 'radar',
    title: 'Suspicious Activity Detection',
    text: 'Monitoring personnel look for potentially unusual activity and report concerns according to established procedures.',
    points: ['Documented observations', 'Defined escalation'],
    img: '/img/lens.jpg',
  },
  {
    icon: 'home',
    title: 'Residential Surveillance',
    text: 'Monitoring support for houses, apartments, driveways, garages, entrances and other authorized residential views.',
    points: ['Home-focused coverage', 'Family contact lists'],
    img: '/img/house.jpg',
  },
  {
    icon: 'building',
    title: 'Commercial Security Monitoring',
    text: 'Remote surveillance support for offices, shops, retail stores and commercial buildings.',
    points: ['Tailored workflows', 'Multi-site options'],
    img: '/img/office.jpg',
  },
  {
    icon: 'warehouse',
    title: 'Warehouse & Industrial',
    text: 'Monitoring support for storage facilities, warehouses, workshops and industrial properties.',
    points: ['Perimeter views', 'Loading-bay focus'],
    img: '/img/industrial.jpg',
  },
  {
    icon: 'moon',
    title: 'After-Hours Monitoring',
    text: 'Evening, overnight or other scheduled windows based on the selected package and staffing availability.',
    points: ['Flexible windows', 'Night-time focus'],
    img: '/img/city.jpg',
  },
]

export default function Services() {
  const root = useRef(null)
  useReveal(root)

  // Desktop: the middle column drifts against the scroll for a layered feel.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 961px)', () => {
        gsap.fromTo(
          '.services-grid',
          { '--col-shift': '60px' },
          {
            '--col-shift': '-60px',
            ease: 'none',
            scrollTrigger: { trigger: '.services-grid', start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    },
    { scope: root },
  )

  return (
    <section className="section services" id="services" ref={root}>
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow mono" data-scramble>
              Services
            </p>
            <h2 className="h2" data-split>
              Monitoring built around <span className="grad">your property.</span>
            </h2>
          </div>
          <p className="lead" data-reveal>
            Every service runs on authorized access, agreed schedules and documented procedures.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <article className="card glow-card service-card" key={s.title} data-reveal data-tilt="5">
              <div className="service-bg" style={{ backgroundImage: `url(${s.img})` }} />
              <div className="service-inner">
                <div className="service-top">
                  <span className="icon-chip">
                    <Icon name={s.icon} draw />
                  </span>
                  <span className="service-num mono">0{i + 1}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul>
                  {s.points.map((pt) => (
                    <li key={pt}>
                      <Icon name="check" size={16} /> {pt}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="link-arrow"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToTarget('#contact')
                  }}
                >
                  Request Details <Icon name="arrow" size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
