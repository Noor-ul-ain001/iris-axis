import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { scrollToTarget, prefersReducedMotion } from '../lib/motion'
import { WELCOME, MAIN_CHIPS, REDACTED, respond, submitted, submitFailed } from '../lib/assistantBrain'
import { submitLead } from '../lib/leads'

// Floating AI helper. Answers come from lib/assistantBrain.js, which only uses
// the site's approved copy. The conversation lives in memory and is never saved.
const start = () => [{ id: 0, from: 'bot', text: WELCOME }]

function Message({ m }) {
  return (
    <div className={`assistant-msg is-${m.from} ${m.tone ? `is-${m.tone}` : ''}`}>
      {m.tone === 'alert' && <Icon name="alert" size={18} className="assistant-msg-icon" />}
      {m.text.split('\n\n').map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {m.items && (
        <ul className="assistant-items">
          {m.items.map((it) => (
            <li key={it.title}>
              <strong>{it.title}</strong>
              {it.meta && <span className="assistant-item-meta mono">{it.meta}</span>}
              {it.text && <span>{it.text}</span>}
              {it.points && (
                <ul>
                  {it.points.map((pt) => (
                    <li key={pt}>
                      <Icon name="check" size={13} /> {pt}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(start)
  const [chips, setChips] = useState(MAIN_CHIPS)
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const flow = useRef(null)
  const nextId = useRef(1)
  const timer = useRef(0)
  const log = useRef(null)
  const field = useRef(null)

  const withIds = (list) => list.map((m) => ({ ...m, id: nextId.current++ }))

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => field.current?.focus({ preventScroll: true }), 350)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => () => clearTimeout(timer.current), [])

  const send = (raw) => {
    const text = raw.trim()
    if (!text || typing) return
    const res = respond(text, flow.current)
    flow.current = res.flow
    setInput('')
    setChips([])
    setMessages((m) => [...m, ...withIds([{ from: 'user', text: res.redact ? REDACTED : text, tone: res.redact ? 'hidden' : undefined }])])
    setTyping(true)

    const delay = prefersReducedMotion() ? 120 : 450 + Math.min(text.length * 8, 600)
    timer.current = setTimeout(async () => {
      let out = res
      if (res.submit) {
        try {
          await submitLead(res.submit)
          out = submitted(res.submit)
        } catch {
          out = submitFailed()
        }
      }
      setMessages((m) => [...m, ...withIds(out.messages)])
      setChips(out.chips)
      setTyping(false)
    }, delay)
  }

  const onChip = (chip) => {
    if (typeof chip === 'string') return send(chip)
    setOpen(false)
    scrollToTarget(chip.go)
  }

  const reset = () => {
    clearTimeout(timer.current)
    flow.current = null
    setTyping(false)
    setInput('')
    setMessages(start())
    setChips(MAIN_CHIPS)
  }

  return (
    <div className={`assistant ${open ? 'is-open' : ''}`}>
      <div className="assistant-panel" role="dialog" aria-label="IRIS Assistant chat" aria-hidden={!open} inert={!open} data-lenis-prevent>
        <div className="assistant-head">
          <span className="assistant-avatar">
            <Icon name="bot" size={20} />
          </span>
          <div>
            <strong>IRIS Assistant</strong>
            <small>
              <span className="live-dot" /> AI assistant · automated replies
            </small>
          </div>
          <button className="assistant-reset" onClick={reset} aria-label="Clear conversation" title="Clear conversation">
            <Icon name="refresh" size={18} />
          </button>
        </div>

        <div className="assistant-log" ref={log} role="log" aria-live="polite">
          {messages.map((m) => (
            <Message key={m.id} m={m} />
          ))}
          {typing && (
            <div className="assistant-typing" aria-label="IRIS Assistant is typing">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {chips.length > 0 && !typing && (
          <div className="assistant-quick">
            {chips.map((c) => {
              const label = typeof c === 'string' ? c : c.label
              return (
                <button key={label} className={typeof c === 'string' ? '' : 'is-link'} onClick={() => onChip(c)}>
                  {label}
                  {typeof c !== 'string' && <Icon name="arrow" size={13} />}
                </button>
              )
            })}
          </div>
        )}

        <form
          className="assistant-form"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about services, pricing, privacy…"
            aria-label="Message IRIS Assistant"
            maxLength={300}
            autoComplete="off"
          />
          <button type="submit" aria-label="Send message" disabled={!input.trim() || typing}>
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="assistant-note">Never share camera passwords. In an emergency, call 911 or your local emergency number.</p>
      </div>
      <button className="assistant-fab" aria-label={open ? 'Close assistant' : 'Open assistant'} aria-expanded={open} onClick={() => setOpen((o) => !o)} data-magnetic="0.3">
        <span className="assistant-ring" />
        <Icon name={open ? 'close' : 'bot'} size={24} />
      </button>
    </div>
  )
}
