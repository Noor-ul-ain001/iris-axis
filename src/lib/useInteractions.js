import { useEffect } from 'react'
import { gsap, prefersReducedMotion } from './motion'

/**
 * Site-wide hover behaviour, wired by data attributes:
 *  - [data-magnetic] buttons drift toward the pointer and spring back
 *  - [data-tilt]     cards tilt in 3D toward the pointer
 *  - [data-glow]     any element gets --mx/--my so CSS can paint a pointer-tracking glow
 */
export function useInteractions(enabled) {
  useEffect(() => {
    if (!enabled) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = prefersReducedMotion()
    const cleanups = []

    const on = (el, type, fn) => {
      el.addEventListener(type, fn)
      cleanups.push(() => el.removeEventListener(type, fn))
    }

    document.querySelectorAll('[data-glow], [data-tilt]').forEach((el) => {
      on(el, 'pointermove', (e) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    })

    if (fine && !reduce) {
      document.querySelectorAll('[data-magnetic]').forEach((el) => {
        const strength = Number(el.dataset.magnetic) || 0.35
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' })
        on(el, 'pointermove', (e) => {
          const r = el.getBoundingClientRect()
          xTo((e.clientX - (r.left + r.width / 2)) * strength)
          yTo((e.clientY - (r.top + r.height / 2)) * strength)
        })
        on(el, 'pointerleave', () => {
          gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' })
        })
      })

      document.querySelectorAll('[data-tilt]').forEach((el) => {
        const max = Number(el.dataset.tilt) || 8
        gsap.set(el, { transformPerspective: 900 })
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' })
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' })
        on(el, 'pointermove', (e) => {
          const r = el.getBoundingClientRect()
          const nx = (e.clientX - r.left) / r.width - 0.5
          const ny = (e.clientY - r.top) / r.height - 0.5
          ry(nx * max)
          rx(-ny * max)
        })
        on(el, 'pointerleave', () => {
          rx(0)
          ry(0)
        })
      })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [enabled])
}
