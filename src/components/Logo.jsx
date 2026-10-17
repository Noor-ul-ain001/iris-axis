import { useId } from 'react'

// Traced from the IRIS AXIS brand mark: eight parallelogram blades in a pinwheel.
// Coordinates are centred on the mark, so each blade is just rotated by 45°.
export const BLADE_POINTS = [
  [-109, -174],
  [-60, -222],
  [-60, -76],
  [-109, -28],
]
export const BLADE_PATH = 'M' + BLADE_POINTS.map((p) => p.join(' ')).join(' L') + ' Z'

export function LogoMark({ size = 32, className = '', bladeClass = '', gradient = false }) {
  const id = 'iris-grad-' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="-235 -235 470 470" width={size} height={size} className={className} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B6F36A" />
            <stop offset="1" stopColor="#FBF5DC" />
          </linearGradient>
        </defs>
      )}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45})`}>
          <path className={bladeClass} d={BLADE_PATH} fill={gradient ? `url(#${id})` : 'currentColor'} />
        </g>
      ))}
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark size={30} className="logo-mark" />
      <span className="logo-word">
        IRIS <b>AXIS</b>
      </span>
    </span>
  )
}
