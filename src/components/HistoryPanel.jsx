const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getPast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : DAY_LABELS[d.getDay()]
    const dateLabel = `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`
    try {
      const raw = localStorage.getItem('nourish_entries_' + key)
      const entries = raw ? JSON.parse(raw) : []
      const totals = entries.reduce(
        (acc, e) => ({ cal: acc.cal + e.cal, p: acc.p + e.p, c: acc.c + e.c, f: acc.f + e.f }),
        { cal: 0, p: 0, c: 0, f: 0 }
      )
      days.push({ key, label, dateLabel, entries, totals, count: entries.length })
    } catch {
      days.push({ key, label, dateLabel, entries: [], totals: { cal: 0, p: 0, c: 0, f: 0 }, count: 0 })
    }
  }
  return days
}

export default function HistoryPanel({ goals }) {
  const days = getPast7Days()
  const maxCal = Math.max(...days.map(d => d.totals.cal), goals.cal)
  const activeDays = days.filter(d => d.count > 0).length
  const avgCal = activeDays > 0
    ? Math.round(days.reduce((s, d) => s + d.totals.cal, 0) / activeDays)
    : 0

  return (
    <div className="panel">
      <div className="history-summary-row">
        <div className="history-stat">
          <div className="history-stat-val">{activeDays}<span>/7</span></div>
          <div className="history-stat-lbl">Days Logged</div>
        </div>
        <div className="history-stat">
          <div className="history-stat-val">{avgCal}</div>
          <div className="history-stat-lbl">Avg Calories</div>
        </div>
        <div className="history-stat">
          <div className="history-stat-val">{goals.cal}</div>
          <div className="history-stat-lbl">Daily Goal</div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-title">7-Day Calorie Overview</div>
        <div className="history-bars">
          {days.map(day => {
            const pct = maxCal > 0 ? Math.min((day.totals.cal / maxCal) * 100, 100) : 0
            const goalPct = maxCal > 0 ? (goals.cal / maxCal) * 100 : 80
            const overGoal = day.count > 0 && day.totals.cal > goals.cal
            return (
              <div key={day.key} className="history-bar-col">
                <div className="history-bar-track">
                  <div
                    className={`history-bar-fill${overGoal ? ' over' : ''}`}
                    style={{ height: pct + '%' }}
                  />
                  <div className="history-goal-line" style={{ bottom: goalPct + '%' }} />
                </div>
                <div className="history-bar-cal">
                  {day.count > 0 ? day.totals.cal : '—'}
                </div>
                <div className="history-bar-label">{day.label}</div>
                <div className="history-bar-date">{day.dateLabel}</div>
              </div>
            )
          })}
        </div>
        <div className="history-legend">
          <span><span className="history-legend-dot" />Calories</span>
          <span><span className="history-legend-line" />Goal ({goals.cal})</span>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-title">Daily Breakdown</div>
        <div className="history-table">
          <div className="history-table-head">
            <span>Day</span>
            <span>Cal</span>
            <span>Protein</span>
            <span>Carbs</span>
            <span>Fat</span>
          </div>
          {days.map(day => (
            <div key={day.key} className={`history-table-row${day.count === 0 ? ' empty-day' : ''}`}>
              <span>
                <strong>{day.label}</strong>
                <small>{day.dateLabel}</small>
              </span>
              <span className={day.count > 0 && day.totals.cal > goals.cal ? 'over-goal' : ''}>
                {day.count > 0 ? day.totals.cal : '—'}
              </span>
              <span>{day.count > 0 ? Math.round(day.totals.p) + 'g' : '—'}</span>
              <span>{day.count > 0 ? Math.round(day.totals.c) + 'g' : '—'}</span>
              <span>{day.count > 0 ? Math.round(day.totals.f) + 'g' : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
