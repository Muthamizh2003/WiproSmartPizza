import { useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getIntensity(count, max) {
  if (count === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const CELL = 14
const GAP = 3
const SIDE = CELL + GAP

const COLORS = ['#e8e2da', '#c6e48b', '#7bc96f', '#4a7c59', '#1a5c2a']

export const OrderHeatmap = ({ data }) => {
  const { weeks, maxCount, monthLabels } = useMemo(() => {
    const map = {}
    for (const d of data || []) {
      map[d.date] = d.count
    }

    const today = new Date()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const start = new Date(end)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay())

    const cells = []
    const current = new Date(start)
    let max = 0
    const monthPositions = []

    while (current <= end) {
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      const count = map[dateStr] || 0
      if (count > max) max = count

      const dayOfWeek = current.getDay()
      const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24))
      const col = Math.floor(diffDays / 7)

      cells.push({ date: dateStr, count, dayOfWeek, col })

      if (current.getDate() <= 7 && current.getMonth() !== (new Date(current.getTime() - 86400000)).getMonth()) {
        monthPositions.push({ col, label: MONTHS[current.getMonth()] })
      }

      current.setDate(current.getDate() + 1)
    }

    return { weeks: cells, maxCount: max, monthLabels: monthPositions }
  }, [data])

  const totalCols = useMemo(() => {
    if (weeks.length === 0) return 0
    return Math.max(...weeks.map(w => w.col)) + 1
  }, [weeks])

  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--sp-text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No daily order data available</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={totalCols * SIDE + 40} height={7 * SIDE + 30}>
        {monthLabels.map((m, i) => (
          <text key={i} x={m.col * SIDE + 2} y={12} fontSize={10} fill="var(--sp-text-muted)">
            {m.label}
          </text>
        ))}
        {DAYS.map((d, i) => (
          <text key={d} x={0} y={i * SIDE + 26} fontSize={9} fill="var(--sp-text-muted)" textAnchor="end">
            {d}
          </text>
        ))}
        {weeks.map((w, i) => {
          const level = getIntensity(w.count, maxCount)
          const fill = COLORS[level]
          return (
            <g key={i}>
              <rect
                x={w.col * SIDE + 32}
                y={w.dayOfWeek * SIDE + 16}
                width={CELL}
                height={CELL}
                fill={fill}
                rx={3}
                style={{ transition: 'opacity 150ms ease' }}
              >
                <title>{w.date} — {w.count} order{w.count !== 1 ? 's' : ''}</title>
              </rect>
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', justifyContent: 'flex-end', fontSize: '0.78rem', color: 'var(--sp-text-muted)' }}>
        <span>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, backgroundColor: c, borderRadius: 3 }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
