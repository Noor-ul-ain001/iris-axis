import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, useGSAP, lenisRef, prefersReducedMotion, isTouch } from './lib/motion'
import { useInteractions } from './lib/useInteractions'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import LiveDemo from './components/LiveDemo'
import Services from './components/Services'
import Statement from './components/Statement'
import Industries from './components/Industries'
import HowItWorks from './components/HowItWorks'
import Escalation from './components/Escalation'
import Pricing from './components/Pricing'
import Trust from './components/Trust'
import Stories from './components/Stories'
import Faq from './components/Faq'
import Cta from './components/Cta'
import Footer from './components/Footer'
import Assistant from './components/Assistant'

export default function App() {
  const [ready, setReady] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)

  // Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    // Native momentum scrolling is smoother on phones/tablets than any JS smoothing.
    if (prefersReducedMotion() || isTouch()) return
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Hold scroll while the intro plays.
  useEffect(() => {
    if (loaderDone) lenisRef.current?.start()
    else lenisRef.current?.stop()
    document.documentElement.classList.toggle('is-loading', !loaderDone)
    if (loaderDone) {
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
    }
  }, [loaderDone])

  // Late-loading images and fonts shift layout; re-measure triggers.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  // Scroll-progress line under the nav.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set('.scroll-progress', { scaleX: self.progress }),
    })
    return () => st.kill()
  }, [])

  useInteractions(ready)

  // Global scroll motion: parallax layers and a velocity skew on big type.
  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.2
        gsap.fromTo(
          el,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      const skewEls = gsap.utils.toArray('.footer-word, .marquee-track')
      const skewTo = skewEls.map((el) => gsap.quickTo(el, 'skewX', { duration: 0.5, ease: 'power3' }))
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-12, 12, self.getVelocity() / -250)
          skewTo.forEach((fn) => fn(v))
        },
      })
    },
    { dependencies: [ready] },
  )

  return (
    <>
      {!loaderDone && <Preloader onReady={() => setReady(true)} onDone={() => setLoaderDone(true)} />}
      <Cursor />
      <div className="noise" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <About />
        <LiveDemo />
        <Services />
        <Statement />
        <HowItWorks />
        <Industries />
        <Escalation />
        <Pricing />
        <Trust />
        <Stories />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <Assistant />
    </>
  )
}
