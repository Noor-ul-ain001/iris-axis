import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from './motion'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_•'

// Decode-style text reveal: characters resolve left to right out of noise.
export function scramble(el, { duration = 1.1, delay = 0 } = {}) {
  const final = el.dataset.text || el.textContent
  el.dataset.text = final
  const state = { p: 0 }
  return gsap.to(state, {
    p: 1,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => {
      const n = Math.floor(state.p * final.length)
      let out = final.slice(0, n)
      for (let i = n; i < final.length; i++) {
        out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      el.textContent = out
    },
    onComplete: () => (el.textContent = final),
  })
}

/**
 * Scroll-driven entrance motion for everything inside `scope`:
 *  - [data-split]    headings reveal line by line from behind a mask
 *  - [data-reveal]   blocks fade up in staggered batches
 *  - [data-scramble] mono labels decode from random glyphs
 *  - [data-draw]     line icons draw their strokes once in view
 */
export function useReveal(scope) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return

      const drawables = root.querySelectorAll('[data-draw]')
      if (prefersReducedMotion()) {
        drawables.forEach((el) => el.classList.add('is-in'))
        return
      }

      root.querySelectorAll('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines,words',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 115,
              rotate: 2,
              duration: 1.2,
              ease: 'expo.out',
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            })
          },
        })
      })

      root.querySelectorAll('[data-scramble]').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => scramble(el) })
      })

      // Cards that tilt on hover own rotationX/Y, so they reveal with a scale
      // instead of the 3D tip-up. No `overwrite`, so a reveal can never kill
      // the hover tweens that share the element.
      const items = [...root.querySelectorAll('[data-reveal]')]
      const tilt = (el) => el.hasAttribute('data-tilt')
      items.forEach((el) =>
        gsap.set(
          el,
          tilt(el)
            ? { y: 56, scale: 0.94, opacity: 0, filter: 'blur(8px)' }
            : { y: 56, rotationX: -14, transformPerspective: 900, transformOrigin: '50% 100%', opacity: 0, filter: 'blur(8px)' },
        ),
      )
      if (items.length) {
        ScrollTrigger.batch(items, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            batch.forEach((el, i) =>
              gsap.to(el, {
                ...(tilt(el) ? { scale: 1 } : { rotationX: 0 }),
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.1,
                delay: i * 0.09,
                ease: 'power3.out',
                clearProps: 'filter',
              }),
            ),
        })
      }

      drawables.forEach((el) =>
        ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => el.classList.add('is-in') }),
      )
    },
    { scope },
  )
}
