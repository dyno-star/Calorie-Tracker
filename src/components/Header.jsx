const CIRC = 251.3

export default function Header({ totals, goals }) {
  const pct = Math.min(totals.cal / goals.cal, 1)
  const offset = CIRC - pct * CIRC
  const leftCal = goals.cal - totals.cal
  const isOver = leftCal < 0

  const bar = (got, goal) => ({
    pct: Math.min((got / goal) * 100, 100),
    over: got > goal,
  })

  const barP = bar(totals.p, goals.p)
  const barC = bar(totals.c, goals.c)
  const barF = bar(totals.f, goals.f)

  const dateStr = new Date()
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase()

  return (
    <header>
      <div className="header-row">
        <div className="logo"><em>nourish</em></div>
        <div className="date-lbl">{dateStr}</div>
      </div>

      <div className="ring-wrap">
        <div className="ring-svg-wrap">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="40" fill="none"
              stroke="url(#rg)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '48px 48px',
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6B8F6E" />
                <stop offset="100%" stopColor="#C4704A" />
              </linearGradient>
            </defs>
          </svg>
          <div className="ring-center">
            <div className="ring-cal">{totals.cal}</div>
            <div className="ring-unit">eaten</div>
          </div>
        </div>

        <div className="ring-stats">
          <div className="stat-box">
            <div className="stat-lbl">Goal</div>
            <div className="stat-val">{goals.cal}</div>
            <div className="stat-sub">kcal</div>
          </div>
          <div className="stat-box">
            <div className="stat-lbl">Remaining</div>
            <div className={`stat-val${isOver ? ' over' : ''}`}>{Math.abs(leftCal)}</div>
            <div className="stat-sub">kcal</div>
          </div>
          <div className="stat-box">
            <div className="stat-lbl">Logged</div>
            <div className="stat-val">{totals.count}</div>
            <div className="stat-sub">items</div>
          </div>
        </div>
      </div>

      <div className="macro-section">
        {[
          { label: 'Protein', val: Math.round(totals.p), goal: goals.p, b: barP, cls: 'p' },
          { label: 'Carbs', val: Math.round(totals.c), goal: goals.c, b: barC, cls: 'c' },
          { label: 'Fat', val: Math.round(totals.f), goal: goals.f, b: barF, cls: 'f' },
        ].map(({ label, val, goal, b, cls }) => (
          <div key={cls} className="macro-row">
            <div className="macro-name">{label}</div>
            <div className="bar-track">
              <div
                className={`bar-fill ${cls}${b.over ? ' over' : ''}`}
                style={{ width: b.pct + '%' }}
              />
            </div>
            <div className={`macro-right${b.over ? ' over' : ''}`}>
              {val} / {goal}g
            </div>
          </div>
        ))}
      </div>
    </header>
  )
}
