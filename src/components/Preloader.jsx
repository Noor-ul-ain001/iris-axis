import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'
import { LogoMark } from './Logo'

// Intro: the eight iris blades assemble, the aperture spins, then the shutter opens.
export default function Preloader({ onReady, onDone }) {
  const root = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        onReady()
        onDone()
        return
      }
      const counter = { v: 0 }
      const num = root.current.querySelector('.pl-count')
      const tl = gsap.timeline({ onComplete: onDone })
      tl.from('.pl-blade', {
        opacity: 0,
        scale: 0.2,
        rotation: -140,
        svgOrigin: '0 0',
        duration: 0.9,
        ease: 'back.out(1.8)',
        stagger: 0.07,
      })
        .to(counter, {
          v: 100,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(3, '0') + '%'),
        }, 0)
        .from('.pl-word span', { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.35)
        .to('.pl-bar i', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to('.pl-mark', { rotation: 225, scale: 1.15, duration: 1.2, ease: 'expo.inOut' }, 0.7)
        .to('.pl-inner', { scale: 0.92, opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'power2.in' }, 1.75)
        .call(onReady, null, 1.95)
        .to('.pl-shutter.top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 1.9)
        .to('.pl-shutter.bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, 1.9)
        .to('.pl-meta', { opacity: 0, duration: 0.3 }, 1.8)
    },
    { scope: root },
  )

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="pl-shutter top" />
      <div className="pl-shutter bottom" />
      <div className="pl-inner">
        <LogoMark size={92} className="pl-mark" bladeClass="pl-blade" />
        <div className="pl-word">
          <span>IRIS</span>
          <span className="grad">AXIS</span>
        </div>
      </div>
      <div className="pl-meta mono">
        <span className="rec-dot" /> Connecting feeds
        <span className="pl-bar">
          <i />
        </span>
        <span className="pl-count">000%</span>
      </div>
    </div>
  )
}
