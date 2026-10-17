// 24px line icons, 1.5px stroke. `pathLength` lets every shape draw itself with
// a single dash-offset animation (see .icon[data-draw] in CSS).
const PATHS = {
  eye: (
    <>
      <path pathLength="1" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle pathLength="1" cx="12" cy="12" r="3" />
    </>
  ),
  dollar: (
    <>
      <circle pathLength="1" cx="12" cy="12" r="9" />
      <path pathLength="1" d="M15 9.2c-.5-1-1.6-1.7-3-1.7-1.8 0-3 .9-3 2.2 0 3.1 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.5 0-2.6-.7-3.1-1.8M12 6v1.5M12 16.5V18" />
    </>
  ),
  key: (
    <>
      <circle pathLength="1" cx="7.5" cy="15.5" r="4" />
      <path pathLength="1" d="M10.5 12.5 20 3M16.5 6.5l2.5 2.5M14 9l2 2" />
    </>
  ),
  file: (
    <>
      <path pathLength="1" d="M6 3h8.5L18 6.5V21H6z" />
      <path pathLength="1" d="M14 3v4h4M9 12.5h6M9 16.5h4" />
    </>
  ),
  lock: (
    <>
      <rect pathLength="1" x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path pathLength="1" d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" />
    </>
  ),
  activity: <path pathLength="1" d="M2.5 12h4l2.5-6 4.5 12 2.5-6h5.5" />,
  chat: (
    <>
      <path pathLength="1" d="M4 5h16v11H9l-5 4z" />
      <path pathLength="1" d="M8.5 10.5h7" />
    </>
  ),
  home: (
    <>
      <path pathLength="1" d="M3.5 11 12 4l8.5 7" />
      <path pathLength="1" d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20" />
    </>
  ),
  building: (
    <>
      <rect pathLength="1" x="4.5" y="3.5" width="15" height="17" rx="1" />
      <path pathLength="1" d="M8.5 7.5h2M13.5 7.5h2M8.5 11.5h2M13.5 11.5h2M10.5 20.5v-4h3v4" />
    </>
  ),
  warehouse: (
    <>
      <path pathLength="1" d="M2.5 20.5V9L12 4l9.5 5v11.5" />
      <path pathLength="1" d="M6.5 20.5v-8h11v8M6.5 15.5h11" />
    </>
  ),
  moon: <path pathLength="1" d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  radar: (
    <>
      <circle pathLength="1" cx="12" cy="12" r="9" />
      <circle pathLength="1" cx="12" cy="12" r="4.5" />
      <path pathLength="1" d="M12 12l6-6" />
    </>
  ),
  shield: (
    <>
      <path pathLength="1" d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z" />
      <path pathLength="1" d="M8.8 12l2.2 2.2 4.4-4.4" />
    </>
  ),
  bell: (
    <>
      <path pathLength="1" d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path pathLength="1" d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  alert: (
    <>
      <path pathLength="1" d="M12 3.5 21.5 20h-19z" />
      <path pathLength="1" d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  bot: (
    <>
      <rect pathLength="1" x="4" y="8" width="16" height="11" rx="3" />
      <path pathLength="1" d="M12 4.5V8M9 13v1M15 13v1M2 13v2M22 13v2" />
    </>
  ),
  phone: (
    <path
      pathLength="1"
      d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z"
    />
  ),
  mail: (
    <>
      <rect pathLength="1" x="3" y="5.5" width="18" height="13" rx="2" />
      <path pathLength="1" d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  pin: (
    <>
      <path pathLength="1" d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle pathLength="1" cx="12" cy="10" r="2.3" />
    </>
  ),
  arrow: <path pathLength="1" d="M5 12h14M13 6l6 6-6 6" />,
  check: <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path pathLength="1" d="m6 9 6 6 6-6" />,
  close: <path pathLength="1" d="M6 6l12 12M18 6 6 18" />,
}

export default function Icon({ name, size = 24, className = '', draw = false }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...(draw ? { 'data-draw': '' } : {})}
    >
      {PATHS[name]}
    </svg>
  )
}
