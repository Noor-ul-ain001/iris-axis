import { useState } from 'react'
import Icon from './Icon'
import { scrollToTarget } from '../lib/motion'

// Floating helper. A front-end shell only: quick replies jump to the relevant
// section. Connect it to a real chat backend when one exists.
const QUICK = [
  ['See pricing', '#pricing'],
  ['How does setup work?', '#how'],
  ['Privacy & camera access', '#trust'],
  ['Book a free consultation', '#contact'],
]

export default function Assistant() {
  const [open, setOpen] = useState(false)

  return (
    <div className={`assistant ${open ? 'is-open' : ''}`}>
      <div className="assistant-panel" role="dialog" aria-label="IRIS AXIS assistant" aria-hidden={!open}>
        <div className="assistant-head">
          <span className="assistant-avatar">
            <Icon name="bot" size={20} />
          </span>
          <div>
            <strong>IRIS Assistant</strong>
            <small>
              <span className="live-dot" /> Online
            </small>
          </div>
        </div>
        <p className="assistant-msg">Hi! How can we help you protect your property today?</p>
        <div className="assistant-quick">
          {QUICK.map(([label, href]) => (
            <button
              key={label}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                setOpen(false)
                scrollToTarget(href)
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="assistant-note">We never ask for camera passwords in chat.</p>
      </div>
      <button className="assistant-fab" aria-label={open ? 'Close assistant' : 'Open assistant'} aria-expanded={open} onClick={() => setOpen((o) => !o)} data-magnetic="0.3">
        <span className="assistant-ring" />
        <Icon name={open ? 'close' : 'bot'} size={24} />
      </button>
    </div>
  )
}
