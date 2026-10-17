import { useState } from 'react'
import Icon from './Icon'

// Lead form. Not wired to a backend yet: connect `onSubmit` to your CRM or form endpoint.
export default function LeadForm({ submitLabel }) {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="lead-form lead-sent" role="status">
        <span className="lead-sent-icon">
          <Icon name="check" size={28} />
        </span>
        <p>Thanks. We will be in touch shortly to plan your consultation.</p>
      </div>
    )
  }

  return (
    <form
      className="lead-form"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <div className="field">
        <input id="lf-name" name="name" autoComplete="name" placeholder=" " required />
        <label htmlFor="lf-name">Name</label>
      </div>
      <div className="field">
        <input id="lf-email" name="email" type="email" autoComplete="email" placeholder=" " required />
        <label htmlFor="lf-email">Email</label>
      </div>
      <div className="field">
        <input id="lf-phone" name="phone" type="tel" autoComplete="tel" placeholder=" " required />
        <label htmlFor="lf-phone">Phone</label>
      </div>
      <div className="field">
        <select id="lf-type" name="property" defaultValue="" required>
          <option value="" disabled>
            Select…
          </option>
          <option>Home / Residential</option>
          <option>Retail / Commercial</option>
          <option>Warehouse / Industrial</option>
          <option>Construction site</option>
          <option>Multi-site portfolio</option>
        </select>
        <label htmlFor="lf-type" className="is-static">
          Property type
        </label>
      </div>
      <button type="submit" className="btn btn-primary btn-block" data-magnetic="0.15">
        <span>{submitLabel}</span> <Icon name="arrow" size={18} />
      </button>
      <p className="lead-note">We never ask for camera passwords through this form.</p>
    </form>
  )
}
