import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import Icon from './Icon'

const PLANS = [
  {
    tier: 'Essential',
    price: 99,
    blurb: 'Smaller properties requiring limited monitoring.',
    features: [
      'Agreed number of authorized camera feeds',
      'Selected monitoring hours',
      'Basic suspicious activity reporting',
      'Standard email notifications',
      'Monthly monitoring summary',
      'Standard customer support',
    ],
    cta: 'Choose Essential',
  },
  {
    tier: 'Professional',
    price: 199,
    blurb: 'Homes and small to medium-sized businesses.',
    features: [
      'Expanded camera coverage',
      'Longer monitoring windows',
      'Priority incident notifications',
      'Designated contact procedures',
      'Detailed incident reports',
      'Regular service reviews',
      'Enhanced customer support',
    ],
    cta: 'Choose Professional',
    featured: true,
  },
  {
    tier: 'Enterprise',
    price: 399,
    blurb: 'Larger commercial facilities with complex requirements.',
    features: [
      'Multiple feeds or locations',
      'Customized monitoring schedules',
      'Detailed incident documentation',
      'Multi-contact notification workflows',
      'Dedicated account coordination',
      'Custom reporting',
      'Tailored escalation procedures',
    ],
    cta: 'Choose Enterprise',
  },
  {
    tier: 'Custom',
    price: null,
    blurb: 'Multi-site portfolios or unusual requirements.',
    features: ['Custom notification procedures', 'Agreed service levels', 'Personalized onboarding'],
    cta: 'Get Custom Pricing',
  },
]

export default function Pricing() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.plans',
        { rotationX: 28, scale: 0.88, transformPerspective: 1600, transformOrigin: '50% 0%' },
        { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.plans', start: 'top bottom', end: 'top 35%', scrub: 1 } },
      )
      root.current.querySelectorAll('[data-price]').forEach((el) => {
        const end = Number(el.dataset.price)
        const obj = { v: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(obj, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(obj.v)) }),
        })
      })
    },
    { scope: root },
  )

  const go = (e) => {
    e.preventDefault()
    scrollToTarget('#contact')
  }

  return (
    <section className="section pricing" id="pricing" ref={root}>
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow mono" data-scramble>
              Pricing &amp; packages
            </p>
            <h2 className="h2" data-split>
              Professional Surveillance Monitoring at a <span className="grad">Fraction of the Traditional Cost.</span>
            </h2>
          </div>
          <p className="lead" data-reveal>
            We target savings of up to around 50% versus comparable traditional monitoring. Final figures will be
            confirmed against equivalent services. Prices shown are illustrative demonstration rates in USD.
          </p>
        </div>

        <div className="plans">
          {PLANS.map((plan) => (
            <article
              className={`card glow-card plan ${plan.featured ? 'is-featured' : ''}`}
              key={plan.tier}
              data-reveal
              data-tilt="4"
            >
              {plan.featured && <span className="plan-badge mono">Popular</span>}
              <p className="plan-tier mono">{plan.tier}</p>
              {plan.price ? (
                <>
                  <p className="plan-price">
                    $<span data-price={plan.price}>{plan.price}</span>
                    <small>/mo</small>
                  </p>
                  <p className="plan-note">Illustrative starting price</p>
                </>
              ) : (
                <>
                  <p className="plan-price plan-price-text">Request a Quote</p>
                  <p className="plan-note">Scoped to your sites</p>
                </>
              )}
              <p className="plan-blurb">{plan.blurb}</p>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>
                    <Icon name="check" size={16} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" onClick={go} className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'} btn-block`} data-magnetic="0.15">
                <span>{plan.cta}</span>
              </a>
            </article>
          ))}
        </div>
        <p className="fineprint" data-reveal>
          Actual pricing depends on coverage, monitoring hours, camera count and operational requirements. Demonstration
          prices are not confirmed offers.
        </p>
      </div>
    </section>
  )
}
