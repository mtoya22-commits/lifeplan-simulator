import type { LifeEvent } from '../../domain/types'

const ICON: Record<string, string> = {
  now: '●',
  education_peak: '◆',
  fire_start: '▲',
  mortgage_payoff: '■',
  pension_start: '◇',
  depletion: '!',
  end: '○',
}

export function Timeline({ events }: { events: LifeEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((e) => (
        <li key={`${e.type}-${e.age}`} className={`timeline-item type-${e.type}`}>
          <span className="timeline-dot" aria-hidden>
            {ICON[e.type] ?? '•'}
          </span>
          <div className="timeline-body">
            <div className="timeline-row">
              <span className="timeline-label">{e.label}</span>
              <span className="timeline-age">{e.age}歳</span>
            </div>
            {e.note && <p className="timeline-note">{e.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
