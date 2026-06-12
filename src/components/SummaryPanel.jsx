export default function SummaryPanel({ entries, totals, goals }) {
  const calFromP = totals.p * 4
  const calFromC = totals.c * 4
  const calFromF = totals.f * 9
  const totalMacroCal = calFromP + calFromC + calFromF || 1

  const remaining = {
    cal: goals.cal - totals.cal,
    p: goals.p - totals.p,
    c: goals.c - totals.c,
    f: goals.f - totals.f,
  }

  return (
    <div className="panel">
      <div className="daily-total-card">
        <div className="daily-total-title">Today's Totals</div>
        <div className="daily-total-grid">
          <div className="dt-cell">
            <div className="dt-val cal-val">{totals.cal}</div>
            <div className="dt-lbl">Calories</div>
          </div>
          <div className="dt-cell">
            <div className="dt-val p-val">{Math.round(totals.p)}g</div>
            <div className="dt-lbl">Protein</div>
          </div>
          <div className="dt-cell">
            <div className="dt-val c-val">{Math.round(totals.c)}g</div>
            <div className="dt-lbl">Carbs</div>
          </div>
          <div className="dt-cell">
            <div className="dt-val f-val">{Math.round(totals.f)}g</div>
            <div className="dt-lbl">Fat</div>
          </div>
        </div>

        <div className="cb-divider" />
        <div className="cb-label">Calorie breakdown</div>
        <div className="cb-bar">
          <div style={{ background: 'var(--sage-light)', height: '100%', width: (calFromP / totalMacroCal * 100) + '%', transition: 'width 0.6s ease' }} />
          <div style={{ background: 'var(--gold)', height: '100%', width: (calFromC / totalMacroCal * 100) + '%', transition: 'width 0.6s ease' }} />
          <div style={{ background: 'var(--terra-light)', height: '100%', width: (calFromF / totalMacroCal * 100) + '%', transition: 'width 0.6s ease' }} />
        </div>
        <div className="cb-legend">
          <span><span className="cb-dot" style={{ background: 'var(--sage-light)' }} />Protein</span>
          <span><span className="cb-dot" style={{ background: 'var(--gold)' }} />Carbs</span>
          <span><span className="cb-dot" style={{ background: 'var(--terra-light)' }} />Fat</span>
        </div>
      </div>

      <div className="remaining-card">
        <div className="remaining-title">Remaining for Today</div>
        <div className="rem-grid">
          {[
            { val: remaining.cal, label: 'Calories', sub: 'kcal' },
            { val: remaining.p, label: 'Protein', sub: 'g' },
            { val: remaining.c, label: 'Carbs', sub: 'g' },
            { val: remaining.f, label: 'Fat', sub: 'g' },
          ].map(({ val, label, sub }) => (
            <div key={label} className="rem-cell">
              <div className={`rem-val${val < 0 ? ' over' : ''}`}>{Math.abs(Math.round(val))}</div>
              <div className="rem-lbl">{label}</div>
              <div className="rem-sub">{val < 0 ? sub + ' over!' : sub + ' left'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <div className="summary-log-title">Today's Food Log</div>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'var(--bark)', fontSize: '14px' }}>
            No food logged today
          </div>
        ) : (
          <>
            {entries.map(e => (
              <div key={e.id} className="summary-entry">
                <div className="summary-entry-left">
                  <span>{e.emoji}</span>
                  <div>
                    <div className="summary-entry-name">{e.name}</div>
                    <div className="summary-entry-macros">P:{e.p}g C:{e.c}g F:{e.f}g</div>
                  </div>
                </div>
                <div className="summary-entry-cal">{e.cal}</div>
              </div>
            ))}
            <div className="summary-total-row">
              <div>Total</div>
              <div className="summary-total-val">{totals.cal} kcal</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
