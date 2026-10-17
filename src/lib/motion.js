import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Mobile browsers resize the viewport when the address bar shows/hides; without
// this every pinned section recalculates mid-scroll and the page jumps.
ScrollTrigger.config({ ignoreMobileResize: true })

// Touch devices get native scrolling and simpler, unpinned motion.
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
export const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 961px)').matches && !isTouch()

export { gsap, ScrollTrigger, SplitText, useGSAP }

// Shared Lenis instance so nav links can drive smooth scrolling.
export const lenisRef = { current: null }

// Hero scroll progress (0..1), written by the hero's pinned ScrollTrigger and
// read every frame by the 3D scene.
export const heroScroll = { p: 0 }

// Normalised pointer position (-1..1), shared by the 3D scenes and tilt effects.
export const pointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToTarget(target) {
  if (lenisRef.current) {
    lenisRef.current.scrollTo(target, { offset: target === '#top' ? 0 : -72, duration: 1.4 })
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}
