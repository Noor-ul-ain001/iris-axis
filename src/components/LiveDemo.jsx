import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion'
import { useReveal } from '../lib/useReveal'
import Icon from './Icon'

// A looping "camera feed" of one monitored night, built on a real photo:
// the PTZ camera patrols, analytics detect an intruder, the camera zooms and
// tracks, an operator verifies, a talk-down and floodlight send them away and
// a report is filed. SVG feed + HTML side cards, all on one GSAP timeline.

const STEPS = [
  { key: 'detect', title: 'Detect', start: 0, end: 4.4, caption: 'Analytics flag a person crossing the rear lawn at 02:14 AM.' },
  { key: 'verify', title: 'Verify', start: 4.4, end: 6.9, caption: 'An operator reviews the clip against your site notes.' },
  { key: 'alert', title: 'Alert', start: 6.9, end: 9.6, caption: 'Talk-down and floodlight. The owner is notified per your contact list.' },
  { key: 'report', title: 'Report', start: 9.6, end: 13, caption: 'A time-stamped incident report is filed for your records.' },
]
const TOTAL = 13

// Feed is drawn in the photo's own pixel space.
const W = 1400
const H = 933

const REPORT = [
  ['Time', '02:14:07 ET'],
  ['Camera', 'CAM 04 · Rear yard'],
  ['Event', 'Person crossing lawn'],
  ['Action', 'Talk-down · Owner notified'],
  ['Outcome', 'Subject left site'],
]

// Motion-analytics grid cells that flash around the intruder.
const CELLS = Array.from({ length: 12 }, (_, i) => ({ x: (i % 4) * 34 - 68, y: Math.floor(i / 4) * 34 - 150 }))

function Feed() {
  return (
    <svg className="ld-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Simulated night-vision CCTV feed of a house as an intruder is detected and tracked">
      <defs>
        <filter id="ld-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="ld-flood-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff4d0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff4d0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ld-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.8" />
        </radialGradient>
        <pattern id="ld-scan" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1.2" fill="#000" opacity="0.4" />
        </pattern>
      </defs>

      {/* The world pans and zooms like a PTZ camera. */}
      <g id="ld-world">
        <image href="/img/house.jpg" width={W} height={H} className="ld-photo" preserveAspectRatio="xMidYMid slice" />
        <rect width={W} height={H} className="ld-grade" />
        <ellipse id="ld-flood" cx="700" cy="420" rx="560" ry="380" fill="url(#ld-flood-grad)" opacity="0" />

        <g id="ld-cells">
          {CELLS.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width="30" height="30" className="ld-cell" />
          ))}
        </g>

        {/* Intruder: thermal silhouette, feet at the group origin. */}
        <g id="ld-intruder">
          <g id="ld-figure" filter="url(#ld-glow)">
            <g className="ld-body" fill="none" stroke="#F6FBEA" strokeLinecap="round">
              <line className="ld-leg-l" x1="0" y1="-86" x2="-12" y2="0" strokeWidth="14" />
              <line className="ld-leg-r" x1="0" y1="-86" x2="12" y2="0" strokeWidth="14" />
              <line x1="0" y1="-138" x2="0" y2="-82" strokeWidth="26" />
              <line className="ld-arm-l" x1="-2" y1="-130" x2="-12" y2="-88" strokeWidth="10" />
              <line className="ld-arm-r" x1="2" y1="-130" x2="12" y2="-88" strokeWidth="10" />
            </g>
            <circle cx="0" cy="-156" r="14" fill="#F6FBEA" />
          </g>
          <g id="ld-box">
            <rect x="-40" y="-184" width="80" height="194" fill="none" stroke="#ff4d5e" strokeWidth="3" />
            <path d="M-40 -164 v-20 h20 M40 -164 v-20 h-20 M-40 -10 v20 h20 M40 -10 v20 h-20" stroke="#ff4d5e" strokeWidth="6" fill="none" />
            <rect x="-41" y="-214" width="132" height="26" fill="#ff4d5e" />
            <text x="-33" y="-195" className="ld-svg-label">
              PERSON 0.94
            </text>
          </g>
        </g>
      </g>

      {/* Fixed camera overlays */}
      <rect width={W} height={H} fill="url(#ld-scan)" opacity="0.55" pointerEvents="none" />
      <rect width={W} height={H} fill="url(#ld-vignette)" pointerEvents="none" />
      <rect width={W} height={H} fill="#E6F5C8" opacity="0" className="ld-flicker" pointerEvents="none" />

      <g className="ld-hud">
        <circle cx="60" cy="116" r="9" fill="#ff4d5e" className="ld-led" />
        <text x="82" y="124">REC · CAM 04 · REAR YARD · PTZ</text>
        <text x="82" y="160" id="ld-time" className="ld-dim">
          02:14:00 ET
        </text>
        <text x={W - 60} y="124" textAnchor="end" id="ld-st-scan" className="ld-ok">
          PATROL · SCANNING
        </text>
        <text x={W - 60} y="124" textAnchor="end" id="ld-st-det" className="ld-bad" opacity="0">
          MOTION · PERSON DETECTED
        </text>
        <text x={W - 60} y="124" textAnchor="end" id="ld-st-left" className="ld-ok" opacity="0">
          SUBJECT LEFT SITE
        </text>
        <text x={W - 60} y="160" textAnchor="end" className="ld-dim">
          ZOOM <tspan id="ld-zoom">1.0x</tspan> · IR AUTO
        </text>

        {/* centre crosshair */}
        <g stroke="#B6F36A" strokeOpacity="0.55" strokeWidth="2">
          <line x1={W / 2 - 34} y1={H / 2} x2={W / 2 - 12} y2={H / 2} />
          <line x1={W / 2 + 12} y1={H / 2} x2={W / 2 + 34} y2={H / 2} />
          <line x1={W / 2} y1={H / 2 - 34} x2={W / 2} y2={H / 2 - 12} />
          <line x1={W / 2} y1={H / 2 + 12} x2={W / 2} y2={H / 2 + 34} />
        </g>
        <path d={`M30 140 v-40 h40 M${W - 30} 140 v-40 h-40 M30 ${H - 130} v40 h40 M${W - 30} ${H - 130} v40 h-40`} stroke="#B6F36A" strokeOpacity="0.6" strokeWidth="2" fill="none" />

        {/* talk-down badge */}
        <g id="ld-talk" opacity="0">
          <rect x="48" y={H - 230} width="320" height="56" rx="12" fill="#001F1A" fillOpacity="0.8" stroke="#B6F36A" strokeOpacity="0.6" />
          <g transform={`translate(72 ${H - 216})`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} className="ld-eq" x={i * 9} y="0" width="5" height="28" rx="2" fill="#B6F36A" />
            ))}
          </g>
          <text x="130" y={H - 194}>
            TALK-DOWN ACTIVE
          </text>
        </g>
      </g>
    </svg>
  )
}

export default function LiveDemo() {
  const root = useRef(null)
  const tlRef = useRef(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)
  useReveal(root)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const reduce = prefersReducedMotion()

      // Ambient loops.
      if (!reduce) {
        gsap.to(q('.ld-flicker'), { opacity: 0.05, duration: 0.07, repeat: -1, yoyo: true, repeatDelay: 2.7, ease: 'steps(1)' })
        q('.ld-eq').forEach((b, i) =>
          gsap.fromTo(b, { scaleY: 0.25 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.22 + i * 0.05, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
        )
      }

      // Walk cycle, toggled by the main timeline's onUpdate.
      const walk = gsap.timeline({ repeat: -1, paused: true })
      const swing = (sel, a) =>
        walk.fromTo(q(sel), { rotation: -a }, { rotation: a, duration: 0.3, ease: 'sine.inOut', transformOrigin: '50% 0%', repeat: 1, yoyo: true }, 0)
      swing('.ld-leg-l', 22)
      swing('.ld-leg-r', -22)
      swing('.ld-arm-l', -18)
      swing('.ld-arm-r', 18)
      walk.fromTo(q('#ld-figure'), { y: 0 }, { y: -5, duration: 0.15, ease: 'sine.inOut', repeat: 3, yoyo: true }, 0)

      const time = { s: 0 }
      const zoom = { z: 1 }
      const timeEl = q('#ld-time')[0]
      const zoomEl = q('#ld-zoom')[0]
      const fills = q('.ld-step-fill')
      const scrubFill = q('.ld-scrub-fill')[0]
      const scrubHead = q('.ld-scrub-head')[0]
      const clockEl = q('.ld-player-time')[0]
      const cards = { console: q('.ld-console')[0], phone: q('.ld-phone')[0], report: q('.ld-report')[0] }
      const CARD_AT = { console: 4.4, phone: 6.9, report: 9.6 }
      const fmt = (t) => `00:${String(Math.floor(t)).padStart(2, '0')}`
      let lastStep = -1
      let walking = null

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.4,
        paused: true,
        defaults: { ease: 'power2.inOut' },
        onUpdate() {
          const t = tl.time()
          const idx = STEPS.findIndex((s) => t >= s.start && t < s.end)
          const cur = idx === -1 ? STEPS.length - 1 : idx
          if (cur !== lastStep) {
            lastStep = cur
            setStep(cur)
          }
          fills.forEach((f, i) => {
            const s = STEPS[i]
            gsap.set(f, { scaleX: gsap.utils.clamp(0, 1, (t - s.start) / (s.end - s.start)) })
          })
          const p = t / TOTAL
          gsap.set(scrubFill, { scaleX: p })
          gsap.set(scrubHead, { left: `${p * 100}%` })
          clockEl.textContent = `${fmt(t)} / ${fmt(TOTAL)}`
          Object.entries(cards).forEach(([k, el]) => {
            const on = t >= CARD_AT[k] && t < 12.3
            el.classList.toggle('is-live', on)
            el.classList.toggle('is-wait', !on)
          })
          const shouldWalk = t < 4.4 || (t > 8.1 && t < 10.6)
          if (shouldWalk !== walking) {
            walking = shouldWalk
            shouldWalk ? walk.play() : walk.pause()
          }
        },
      })
      tlRef.current = tl

      // Reset state at the top of every loop.
      tl.set('#ld-world', { x: 0, y: 0, scale: 1, transformOrigin: '50% 50%' }, 0.01)
        .set('#ld-intruder', { x: 120, y: 900, scale: 1.05, transformOrigin: '50% 100%' }, 0.01)
        .set('#ld-figure', { scaleX: 1, transformOrigin: '50% 50%' }, 0.01)
        .set('#ld-box', { autoAlpha: 0, scale: 1.6, transformOrigin: '50% 50%' }, 0.01)
        .set('#ld-cells', { x: 120, y: 900 }, 0.01)
        .set(q('.ld-cell'), { opacity: 0 }, 0.01)
        .set(['#ld-flood', '#ld-talk', '#ld-st-det', '#ld-st-left'], { opacity: 0 }, 0.01)
        .set('#ld-st-scan', { opacity: 1 }, 0.01)
        .set(q('.ld-photo'), { filter: 'grayscale(1) brightness(0.5) contrast(1.35)' }, 0.01)
        .set(q('.ld-bar i'), { scaleX: 0 }, 0.01)
        .set(q('.ld-verified'), { autoAlpha: 0, y: 8 }, 0.01)
        .set(q('.ld-verified path'), { strokeDashoffset: 1 }, 0.01)
        .set(q('.ld-clip-box'), { autoAlpha: 0, scale: 1.6 }, 0.01)
        .set(q('.ld-row-line'), { scaleX: 0 }, 0.01)
        .set(q('.ld-row-val'), { autoAlpha: 0, x: -8 }, 0.01)
        .set(q('.ld-stamp'), { autoAlpha: 0, scale: 2.2, rotation: -24 }, 0.01)

      // Clock + zoom readout run the whole loop.
      tl.fromTo(
        time,
        { s: 0 },
        {
          s: 158,
          duration: TOTAL,
          ease: 'none',
          onUpdate: () => {
            const s = Math.floor(time.s)
            timeEl.textContent = `02:${String(14 + Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} ET`
          },
        },
        0,
      )
      const zoomTo = (z, at, dur) =>
        tl.to(zoom, { z, duration: dur, onUpdate: () => (zoomEl.textContent = zoom.z.toFixed(1) + 'x') }, at)

      // 01 Detect: patrol pan, intruder crosses the lawn, analytics lock on, PTZ zooms in.
      tl.addLabel('detect', 0)
        .set(zoom, { z: 1 }, 0.01)
        .to('#ld-world', { x: -60, duration: 1.4, ease: 'sine.inOut' }, 0)
        .to('#ld-world', { x: 40, duration: 1.2, ease: 'sine.inOut' }, 1.4)
        .to('#ld-intruder', { x: 640, y: 800, scale: 0.86, duration: 4.4, ease: 'none' }, 0)
        .to('#ld-cells', { x: 520, y: 822, duration: 0.01 }, 2.3)
        .to(q('.ld-cell'), { opacity: 1, duration: 0.08, stagger: { each: 0.03, from: 'random' }, repeat: 1, yoyo: true }, 2.3)
        .to('#ld-box', { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 2.5)
        .to('#ld-st-scan', { opacity: 0, duration: 0.15 }, 2.5)
        .to('#ld-st-det', { opacity: 1, duration: 0.15, repeat: 3, yoyo: true, ease: 'steps(1)' }, 2.55)
        .set('#ld-st-det', { opacity: 1 }, 3.2)
        .to('#ld-world', { scale: 1.45, x: -260, y: -260, duration: 1.6, ease: 'power3.inOut' }, 2.7)
      zoomTo(2.4, 2.7, 1.6)

      // 02 Verify: operator console opens, clip reviewed, verified.
      tl.addLabel('verify', 4.4)
        .to(q('.ld-clip-box'), { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 4.8)
        .to(q('.ld-bar i'), { scaleX: 1, duration: 1.3, ease: 'none' }, 4.9)
        .to(q('.ld-verified'), { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 6.2)
        .to(q('.ld-verified path'), { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, 6.25)

      // 03 Alert: owner notified, floodlight, talk-down, intruder leaves.
      tl.addLabel('alert', 6.9)
        .fromTo(q('.ld-phone .ld-notif'), { y: 24, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 6.9)
        .to('#ld-talk', { opacity: 1, duration: 0.3 }, 7.0)
        .to('#ld-flood', { opacity: 0.6, duration: 0.06 }, 7.3)
        .to('#ld-flood', { opacity: 0.1, duration: 0.06 }, 7.36)
        .to('#ld-flood', { opacity: 1, duration: 0.25 }, 7.42)
        .to(q('.ld-photo'), { filter: 'grayscale(0.6) brightness(0.95) contrast(1.15)', duration: 0.3 }, 7.42)
        .set('#ld-figure', { scaleX: -1, transformOrigin: '50% 50%' }, 8.1)
        .to('#ld-intruder', { x: -160, y: 920, scale: 1.1, duration: 2.5, ease: 'power1.in' }, 8.1)
        .to('#ld-world', { scale: 1, x: 0, y: 0, duration: 2.2, ease: 'power2.inOut' }, 8.3)
        .to('#ld-talk', { opacity: 0, duration: 0.3 }, 9.6)
        .to('#ld-box', { autoAlpha: 0, duration: 0.3 }, 10.2)
        .to('#ld-st-det', { opacity: 0, duration: 0.2 }, 10.2)
        .to('#ld-st-left', { opacity: 1, duration: 0.2 }, 10.3)
      zoomTo(1, 8.3, 2.2)

      // 04 Report: incident report written and logged.
      tl.addLabel('report', 9.6)
        .to(q('.ld-row-line'), { scaleX: 1, duration: 0.5, stagger: 0.18, ease: 'power2.out' }, 9.9)
        .to(q('.ld-row-val'), { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.18 }, 10.0)
        .to(q('.ld-stamp'), { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.45, ease: 'back.out(2.5)' }, 11.3)

      // Wind down before looping.
      tl.to('#ld-flood', { opacity: 0, duration: 0.5 }, 12.2)
        .to(q('.ld-photo'), { filter: 'grayscale(1) brightness(0.5) contrast(1.35)', duration: 0.5 }, 12.2)
        .to('#ld-st-left', { opacity: 0, duration: 0.3 }, 12.5)
        .to('#ld-st-scan', { opacity: 1, duration: 0.3 }, 12.6)
        .addLabel('end', TOTAL)

      tl.seek(0.02)

      if (reduce) {
        tl.seek(11.6).pause()
        return
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 70%',
        end: 'bottom 20%',
        onToggle: (self) => {
          if (self.isActive && !userPaused.current) {
            tl.play()
            setPlaying(true)
          } else if (!self.isActive) {
            tl.pause()
            setPlaying(false)
          }
        },
      })

      // Scroll-scrubbed 3D entrance. Desktop only: on stacked tablet/phone
      // layouts the stage is too tall to tilt without spilling over the content below.
      const mm = gsap.matchMedia()
      mm.add('(min-width: 961px)', () => {
        gsap.fromTo(
          q('.ld-stage'),
          { rotationX: 18, scale: 0.9, transformPerspective: 1400, transformOrigin: '50% 0%' },
          { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: q('.ld-stage')[0], start: 'top 98%', end: 'top 40%', scrub: 1 } },
        )
      })
      mm.add('(max-width: 960px)', () => {
        gsap.fromTo(
          q('.ld-player'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: q('.ld-player')[0], start: 'top 90%', once: true } },
        )
      })

      return () => walk.kill()
    },
    { scope: root },
  )

  const jump = (i) => {
    userPaused.current = false
    setPlaying(true)
    tlRef.current?.play(STEPS[i].start + 0.02)
  }

  const togglePlay = () => {
    const tl = tlRef.current
    if (!tl) return
    if (tl.paused()) {
      userPaused.current = false
      tl.play()
      setPlaying(true)
    } else {
      userPaused.current = true
      tl.pause()
      setPlaying(false)
    }
  }

  // Click or drag on the scrubber to seek.
  const onScrub = (e) => {
    const tl = tlRef.current
    if (!tl) return
    const track = e.currentTarget
    const seek = (clientX) => {
      const r = track.getBoundingClientRect()
      tl.seek(gsap.utils.clamp(0, 0.999, (clientX - r.left) / r.width) * TOTAL)
    }
    seek(e.clientX)
    const move = (ev) => seek(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <section className="section live" id="live" ref={root}>
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow mono" data-scramble>
              See it in action
            </p>
            <h2 className="h2" data-split>
              One night on camera, <span className="grad">handled end to end.</span>
            </h2>
          </div>
          <p className="lead" data-reveal>
            A simulated event showing how monitoring works: detection, human verification, alerts and a clear report.
          </p>
        </div>

        <div className="ld-stage">
          <div className="ld-player">
            <div className="ld-chrome mono">
              <span className="ld-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="ld-chrome-title">IRIS AXIS NVR · CAM 04 · Rear yard</span>
              <span className="ld-chrome-live">
                <span className="rec-dot" /> Replay
              </span>
            </div>
            <div className="ld-scene">
              <Feed />
            </div>
            <div className="ld-controls">
              <button className="ld-play" onClick={togglePlay} aria-label={playing ? 'Pause demo' : 'Play demo'} data-cursor={playing ? 'Pause' : 'Play'}>
                {playing ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M7 4.5v15l13-7.5z" />
                  </svg>
                )}
              </button>
              <span className="ld-player-time mono">00:00 / 00:13</span>
              <div className="ld-scrub" onPointerDown={onScrub} role="slider" aria-label="Demo timeline" aria-valuemin={0} aria-valuemax={TOTAL} tabIndex={0}>
                <span className="ld-scrub-track">
                  <i className="ld-scrub-fill" />
                </span>
                {STEPS.map((s, i) => (
                  <span key={s.key} className="ld-scrub-mark" style={{ left: `${(s.start / TOTAL) * 100}%` }} />
                ))}
                <span className="ld-scrub-head" />
              </div>
            </div>
            <div className="ld-steps" role="tablist" aria-label="Demo chapters">
              {STEPS.map((s, i) => (
                <button key={s.key} role="tab" aria-selected={i === step} className={`ld-step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`} onClick={() => jump(i)}>
                  <span className="ld-step-num mono">0{i + 1}</span>
                  <span className="ld-step-title">{s.title}</span>
                  <span className="ld-step-track">
                    <i className="ld-step-fill" />
                  </span>
                </button>
              ))}
            </div>
            <div className="ld-caption" aria-live="polite">
              <span className="ld-caption-step mono">
                0{step + 1} · {STEPS[step].title}
              </span>
              <span key={step} className="ld-caption-text">
                {STEPS[step].caption}
              </span>
            </div>
          </div>

          <div className="ld-cards">
            <div className="ld-card ld-console is-wait">
              <div className="ld-card-head mono">
                <span>01 · Operator console</span>
                <span className="ld-state mono" />
              </div>
              <div className="ld-clip">
                <img src="/img/house.jpg" alt="" />
                <span className="feed-scan" />
                <span className="ld-clip-box" />
              </div>
              <div className="ld-review">
                <span>Reviewing footage</span>
                <span className="ld-bar">
                  <i />
                </span>
              </div>
              <div className="ld-verified">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Verified by operator
              </div>
            </div>

            <div className="ld-card ld-phone is-wait">
              <div className="ld-card-head mono">
                <span>02 · Owner alert</span>
                <span className="ld-state mono" />
              </div>
              <div className="ld-phone-screen">
                <div className="ld-notif">
                  <span className="ld-notif-icon">
                    <Icon name="bell" size={20} />
                  </span>
                  <div>
                    <strong>IRIS AXIS · Event verified</strong>
                    <p>Person on rear lawn, CAM 04. Talk-down issued.</p>
                    <small className="mono">02:14 AM · now</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="ld-card ld-report is-wait">
              <div className="ld-card-head mono">
                <span>03 · Incident report #0412</span>
                <span className="ld-stamp mono">Logged</span>
              </div>
              {REPORT.map(([k, v]) => (
                <div className="ld-row" key={k}>
                  <span className="ld-row-key mono">{k}</span>
                  <span className="ld-row-val">{v}</span>
                  <span className="ld-row-line" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="fineprint">Simulated scenario for illustration. Actual procedures follow your agreed monitoring plan.</p>
      </div>
    </section>
  )
}
