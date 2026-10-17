import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText, ScrollTrigger, useGSAP, prefersReducedMotion, scrollToTarget, heroScroll, isDesktop } from '../lib/motion'
import { scramble } from '../lib/useReveal'
import HeroScene from './HeroScene'
import Icon from './Icon'

const FEATURES = [
  { icon: 'eye', label: 'Trained Human Monitoring' },
  { icon: 'dollar', label: 'Cost-Effective Monitoring' },
  { icon: 'key', label: 'Authorized Remote CCTV Access' },
  { icon: 'file', label: 'Human-Assisted Incident Reporting' },
]

const FEEDS = [
  { cam: '01', name: 'Lot A', img: '/img/dealership.jpg' },
  { cam: '03', name: 'Dock', img: '/img/industrial.jpg' },
  { cam: '04', name: 'Rear yard', img: '/img/house.jpg', alert: true },
  { cam: '06', name: 'Lobby', img: '/img/office.jpg' },
]

const LOG = [
  ['CAM 04', 'Person on rear lawn · Operator verifying'],
  ['CAM 01', 'Vehicle in lot · Authorized plate · Logged'],
  ['CAM 03', 'Virtual patrol · Dock checkpoints clear'],
  ['CAM 06', 'Lobby motion · Cleaning crew · Logged'],
]

function useEtClock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(
      new Date(),
    )
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setNow(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function useTicker(length, ms) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % length), ms)
    return () => clearInterval(id)
  }, [length, ms])
  return i
}

export default function Hero({ ready }) {
  const root = useRef(null)
  const clock = useEtClock()
  const logIdx = useTicker(LOG.length, 3600)

  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return
      const q = gsap.utils.selector(root)

      // Intro: animates the inner elements. The scroll-out below only touches
      // their wrappers, so the two timelines never fight over the same props.
      const split = SplitText.create('.hero-title', { type: 'words', mask: 'words' })
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-canvas', { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0)
        .add(() => scramble(q('.hero-rec-text')[0], { duration: 1 }), 0.1)
        .from('.hero-rec', { opacity: 0, x: -20, duration: 0.8 }, 0.1)
        .from(split.words, { yPercent: 120, rotate: 6, duration: 1.2, stagger: 0.045 }, 0.2)
        .from('.hero-sub', { y: 24, opacity: 0, duration: 1 }, 0.65)
        .from('.hero-body', { y: 24, opacity: 0, duration: 1 }, 0.75)
        .from('.hero-ctas > *', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.85)
        .from('.hero-live', { opacity: 0, duration: 0.8 }, 1.1)
        .from('.hw', { opacity: 0, y: 60, rotationY: -18, transformPerspective: 1400, duration: 1.6 }, 0.3)
        .from('.hw-feed', { opacity: 0, scale: 0.85, duration: 0.9, stagger: { each: 0.1, from: 'random' } }, 0.7)
        .from('.hw-head > *, .hw-foot > *', { opacity: 0, y: 8, duration: 0.6, stagger: 0.06 }, 1.1)
        .from('.hero-feature', { y: 40, opacity: 0, rotationX: -40, transformPerspective: 600, duration: 1.1, stagger: 0.08 }, 1)
        .from('.hud-corner', { scale: 0, opacity: 0, duration: 0.9, stagger: 0.06 }, 1.1)

      // Phones/tablets: intro only. The hero scrolls away naturally, nothing
      // floats or pins, and heroScroll just tracks progress for the 3D terrain.
      if (!isDesktop()) {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => (heroScroll.p = self.progress * 0.5),
        })
        return () => (heroScroll.p = 0)
      }

      // Pointer tilt on the camera wall (outer wrapper; the intro owns .hw).
      const tilt = q('.hw-tilt')[0]
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3' })
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3' })
      gsap.set(tilt, { transformPerspective: 1400 })
      const onMove = (e) => {
        if (window.scrollY > 10) return
        const r = root.current.getBoundingClientRect()
        ry(((e.clientX - r.left) / r.width - 0.5) * 10)
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7)
      }
      const el = root.current
      el.addEventListener('pointermove', onMove)

      // Scroll-out: pin, fade the copy, and push the camera wall into the
      // alert feed as if the operator zooms in.
      const zoomEl = q('.hw-zoom')[0]
      const canPin = root.current.offsetHeight <= window.innerHeight * 1.08
      const ir = { immediateRender: false }
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: canPin ? '+=110%' : 'bottom top',
            pin: canPin,
            // Created last (after the intro), but it sits at the top of the page,
            // so it must be measured first or every pin below is offset.
            refreshPriority: 10,
            scrub: 0.6,
            onUpdate: (self) => {
              if (self.progress > 0.02) {
                rx(0)
                ry(0)
              }
              heroScroll.p = self.progress
              zoomEl.textContent = (1 + self.progress * 3).toFixed(1) + 'x'
            },
            onLeave: () => (heroScroll.p = 1),
            onLeaveBack: () => (heroScroll.p = 0),
          },
        })
        .fromTo('.hero-head', { y: 0, opacity: 1 }, { y: -90, opacity: 0, duration: 0.45, ...ir }, 0)
        .fromTo('.hero-lede', { y: 0, opacity: 1, filter: 'blur(0px)' }, { y: -60, opacity: 0, filter: 'blur(6px)', duration: 0.4, ...ir }, 0.06)
        .fromTo('.hero-actions', { y: 0, opacity: 1 }, { y: -60, opacity: 0, duration: 0.35, ...ir }, 0.12)
        .fromTo('.hero-features', { y: 0, opacity: 1 }, { y: 80, opacity: 0, duration: 0.4, ...ir }, 0.04)
        .fromTo('.hw-stage', { scale: 1, opacity: 1 }, { scale: 1.08, opacity: 0.35, duration: 0.7, ...ir }, 0.05)
        .fromTo('.hw-alert-ring', { opacity: 0 }, { opacity: 1, duration: 0.2, ...ir }, 0.3)
        .fromTo('.hud-corner.tl', { x: 0, y: 0 }, { x: -14, y: -60, duration: 0.8, ...ir }, 0)
        .fromTo('.hud-corner.tr', { x: 0, y: 0 }, { x: 14, y: -60, duration: 0.8, ...ir }, 0)
        .fromTo('.hud-corner.bl', { x: 0, y: 0 }, { x: -14, y: 14, duration: 0.8, ...ir }, 0)
        .fromTo('.hud-corner.br', { x: 0, y: 0 }, { x: 14, y: 14, duration: 0.8, ...ir }, 0)
        .fromTo('.hero-flash', { opacity: 0 }, { opacity: 1, duration: 0.25, ...ir }, 0.75)

      return () => {
        el.removeEventListener('pointermove', onMove)
        heroScroll.p = 0
      }
    },
    { scope: root, dependencies: [ready] },
  )

  // Keep heroScroll in sync if triggers refresh while at the top.
  useGSAP(() => {
    const refresh = () => {
      if (window.scrollY === 0) heroScroll.p = 0
    }
    ScrollTrigger.addEventListener('refresh', refresh)
    return () => ScrollTrigger.removeEventListener('refresh', refresh)
  })

  const go = (href) => (e) => {
    e.preventDefault()
    scrollToTarget(href)
  }

  const [logCam, logText] = LOG[logIdx]

  return (
    <section className="hero" id="top" ref={root}>
      <HeroScene />
      <div className="hero-veil" />
      <div className="hero-hud" aria-hidden="true">
        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="hero-head">
            <p className="hero-rec mono">
              <span className="rec-dot" />
              <span className="hero-rec-text">REC · REMOTE CCTV MONITORING</span>
            </p>
            <h1 className="hero-title">
              Your Eyes on Every Angle. <span className="grad">Your Security, Always in Focus.</span>
            </h1>
          </div>
          <div className="hero-lede">
            <p className="hero-sub">Professional Remote CCTV Monitoring for U.S. Homes and Businesses.</p>
            <p className="hero-body">
              Cost-effective remote surveillance, trained human attention and timely incident reporting, without the
              cost of extensive on-site monitoring.
            </p>
          </div>
          <div className="hero-actions">
            <div className="hero-ctas">
              <a href="#contact" className="btn btn-primary" onClick={go('#contact')} data-magnetic>
                <span>Get a Free Consultation</span> <Icon name="arrow" size={18} />
              </a>
              <a href="#live" className="btn btn-ghost" onClick={go('#live')} data-magnetic>
                <span>Watch It Work</span>
              </a>
            </div>
            <p className="hero-live mono">
              <span className="live-dot" /> {clock} ET · U.S. remote monitoring
            </p>
          </div>
        </div>

        {/* Live camera wall built from real photos */}
        <div className="hw-stage" aria-hidden="true">
          <div className="hw-tilt">
            <div className="hw">
              <div className="hw-head mono">
                <span className="hw-title">
                  <span className="rec-dot" /> Live wall
                </span>
                <span className="hw-chip">4 feeds</span>
                <span className="hw-clock">{clock} ET</span>
              </div>
              <div className="hw-grid">
                {FEEDS.map((f) => (
                  <div key={f.cam} className={`hw-feed ${f.alert ? 'is-alert' : ''}`}>
                    <img src={f.img} alt="" />
                    <span className="feed-scan" />
                    <span className="hw-label mono">
                      CAM {f.cam} · {f.name}
                    </span>
                    <span className="hw-rec mono">
                      <i /> REC
                    </span>
                    {f.alert && (
                      <>
                        <span className="hw-box">
                          <b className="mono">PERSON 0.94</b>
                        </span>
                        <span className="hw-alert-ring" />
                      </>
                    )}
                    <span className="hw-lock">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                ))}
              </div>
              <div className="hw-foot mono">
                <span className="hw-log" key={logIdx}>
                  <b>{logCam}</b> {logText}
                </span>
                <span className="hw-zoom-wrap">
                  ZOOM <b className="hw-zoom">1.0x</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <ul className="hero-features">
          {FEATURES.map((f) => (
            <li className="hero-feature" key={f.label} data-glow>
              <Icon name={f.icon} className="hero-feature-icon" />
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hero-flash" aria-hidden="true" />
    </section>
  )
}
