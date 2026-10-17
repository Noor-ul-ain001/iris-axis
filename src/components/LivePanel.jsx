import { useEffect, useState } from 'react'

const CAMS = [
  { id: '01', name: 'Lot A', img: '/img/dealership.jpg' },
  { id: '02', name: 'Gate', img: '/img/house.jpg' },
  { id: '03', name: 'Dock', img: '/img/industrial.jpg' },
  { id: '04', name: 'Rear yard', img: '/img/construction.jpg' },
  { id: '05', name: 'Loading bay', img: '/img/retail.jpg' },
  { id: '06', name: 'Lobby', img: '/img/office.jpg' },
]

// Rotating operator log. `cam` is the feed that lights up for the event.
const EVENTS = [
  { time: '22:14:07', cam: 1, text: 'Vehicle at gate · No action required', alert: false },
  { time: '23:41:52', cam: 4, text: 'Person near loading bay · Contact notified', alert: true },
  { time: '01:03:19', cam: 0, text: 'Motion: animal · Logged', alert: false },
  { time: '02:14:40', cam: 3, text: 'Rear yard motion · Verified, owner notified', alert: true },
]

function useClock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date())
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setNow(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function LivePanel() {
  const [eventIdx, setEventIdx] = useState(0)
  const clock = useClock()
  const event = EVENTS[eventIdx]

  useEffect(() => {
    const id = setInterval(() => setEventIdx((i) => (i + 1) % EVENTS.length), 4200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="panel" data-glow>
      <div className="panel-head mono">
        <span>
          <span className="rec-dot" /> CAM WALL · LIVE
        </span>
        <span className="panel-clock">{clock} ET</span>
        <span className={`panel-status ${event.alert ? 'is-alert' : ''}`}>
          {event.alert ? 'Event verified' : 'All clear'}
        </span>
      </div>
      <div className="feeds">
        {CAMS.map((cam, i) => {
          const hot = i === event.cam
          return (
            <div key={cam.id} className={`feed ${hot ? 'is-hot' : ''} ${hot && event.alert ? 'is-alert' : ''}`} style={{ '--d': `${i * -0.7}s` }}>
              <img src={cam.img} alt="" />
              <span className="feed-scan" />
              <span className="feed-label mono">
                CAM {cam.id} · {cam.name}
              </span>
              <span className="feed-rec mono">
                <i /> REC
              </span>
              {hot && <span className="feed-box" key={eventIdx} data-label={event.alert ? 'PERSON 0.94' : 'TRACK'} />}
            </div>
          )
        })}
      </div>
      <div className="panel-log mono" key={eventIdx}>
        <span className="panel-log-time">{event.time}</span>
        <span className="panel-log-cam">CAM {CAMS[event.cam].id}</span>
        <span className="panel-log-text">{event.text}</span>
      </div>
    </div>
  )
}
